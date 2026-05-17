import { auth } from "@/auth";
import type { Session } from "next-auth";

export async function requireAdmin(): Promise<Session> {
  const localAdminPreview = process.env.LOCAL_ADMIN_PREVIEW === "true" && process.env.VERCEL !== "1";

  if (localAdminPreview) {
    return {
      expires: new Date(Date.now() + 1000 * 60 * 60).toISOString(),
      user: {
        email: "local-preview@admin.dev",
        name: "Local Admin Preview"
      }
    };
  }

  const session = await auth();

  if (!session || session.user?.role !== "ADMIN") {
    throw new Error("Unauthorized admin action.");
  }

  return {
    ...session,
    user: session.user
  };
}
