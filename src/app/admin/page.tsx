import { getSiteContent } from "@/lib/content";
import { requireAdmin } from "@/lib/admin";
import { AdminDashboard } from "@/components/admin/admin-dashboard";

export default async function AdminPage() {
  const session = await requireAdmin();
  const content = await getSiteContent();

  return <AdminDashboard initialContent={content} userEmail={session.user?.email ?? "admin"} />;
}
