export type AppRole = "ADMIN" | "ARTIST" | "CUSTOMER";
export type RouteAccessProfile = "public" | "admin-secure" | "artist-secure" | "customer-lite";

function matchPrefix(pathname: string, prefixes: string[]) {
  return prefixes.some((prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`));
}

export function getRouteAccessProfile(pathname: string): RouteAccessProfile {
  if (matchPrefix(pathname, ["/admin", "/venue"])) {
    return "admin-secure";
  }

  if (matchPrefix(pathname, ["/artist"])) {
    return "artist-secure";
  }

  if (matchPrefix(pathname, ["/book", "/checkout"])) {
    return "customer-lite";
  }

  return "public";
}

export function isRouteAllowed(role: AppRole, pathname: string) {
  const profile = getRouteAccessProfile(pathname);

  if (profile === "public" || profile === "customer-lite") {
    return true;
  }

  if (profile === "artist-secure") {
    return role === "ARTIST" || role === "ADMIN";
  }

  return role === "ADMIN";
}

export function getDefaultRouteForRole(role: AppRole) {
  if (role === "ADMIN") {
    return "/admin";
  }

  if (role === "ARTIST") {
    return "/artist";
  }

  return "/";
}
