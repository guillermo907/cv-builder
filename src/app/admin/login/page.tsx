import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { isAdminEmail } from "@/lib/admin-emails";
import { LoginPanel } from "@/components/auth/login-panel";

type LoginPageProps = {
  searchParams: Promise<{
    callbackUrl?: string;
    check?: string;
  }>;
};

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const params = await searchParams;

  if (process.env.NODE_ENV !== "production" && process.env.LOCAL_ADMIN_PREVIEW === "true") {
    redirect("/admin");
  }

  const session = await auth();

  if (isAdminEmail(session?.user?.email)) {
    redirect("/admin");
  }

  return (
    <LoginPanel
      callbackUrl={params.callbackUrl ?? "/admin"}
      checkEmail={params.check === "email"}
      emailLoginEnabled={process.env.ENABLE_EMAIL_LOGIN === "true"}
    />
  );
}
