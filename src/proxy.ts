import { auth } from "@/auth";
import { NextResponse } from "next/server";
import { getDefaultRouteForRole, getRouteAccessProfile, isRouteAllowed } from "@/lib/auth/rbac";

export default auth(function proxy(request) {
  const { pathname } = request.nextUrl;

  if (pathname.startsWith("/admin/login")) {
    return NextResponse.next();
  }

  const localAdminPreview = process.env.LOCAL_ADMIN_PREVIEW === "true" && process.env.VERCEL !== "1";

  if (localAdminPreview) {
    return NextResponse.next();
  }

  const session = request.auth;
  const role = session?.user?.role ?? "CUSTOMER";
  const accessProfile = getRouteAccessProfile(pathname);

  if (accessProfile === "public") {
    return NextResponse.next();
  }

  if (!session?.user && accessProfile !== "customer-lite") {
    const loginUrl = new URL("/admin/login", request.nextUrl.origin);
    loginUrl.searchParams.set("callbackUrl", request.nextUrl.href);
    return NextResponse.redirect(loginUrl);
  }

  if (!isRouteAllowed(role, pathname)) {
    const redirectUrl = new URL(getDefaultRouteForRole(role), request.nextUrl.origin);
    return NextResponse.redirect(redirectUrl);
  }

  const response = NextResponse.next();
  response.headers.set("x-access-profile", accessProfile);

  if (accessProfile === "customer-lite") {
    response.headers.set("x-client-optimization", "low-bandwidth-4g");
    response.headers.set("x-cache-hint", "prefer-local-cache");
  }

  return response;
});

export const config = {
  matcher: ["/admin/:path*", "/venue/:path*", "/artist/:path*", "/book/:path*", "/checkout/:path*"]
};
