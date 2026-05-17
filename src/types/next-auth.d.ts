import type { DefaultSession } from "next-auth";

declare module "next-auth" {
  interface Session {
    user?: DefaultSession["user"] & {
      id?: string | null;
      role?: "ADMIN" | "ARTIST" | "CUSTOMER";
      venueId?: string | null;
    };
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    userId?: string | null;
    role?: "ADMIN" | "ARTIST" | "CUSTOMER";
    venueId?: string | null;
  }
}
