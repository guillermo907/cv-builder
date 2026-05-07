import { auth } from "@/auth";
import { isAdminEmail } from "@/lib/admin-emails";
import type { Session } from "next-auth";

export async function requireAdmin(): Promise<Session> {
  if (process.env.NODE_ENV !== "production" && process.env.LOCAL_ADMIN_PREVIEW === "true") {
    return {
      expires: new Date(Date.now() + 1000 * 60 * 60).toISOString(),
      user: {
        email: "local-preview@admin.dev",
        name: "Local Admin Preview"
      }
    };
  }

  const session = await auth();

  if (!session || !isAdminEmail(session.user?.email)) {
    throw new Error("Unauthorized admin action.");
  }

  return {
    ...session,
    user: session.user
  };
}
