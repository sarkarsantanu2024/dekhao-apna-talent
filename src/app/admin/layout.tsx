import { auth } from "@/lib/auth/auth";
import { redirect } from "next/navigation";
import { DashboardShell } from "@/components/dashboard/shell";
import { ADMIN_NAV } from "@/constants";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  if (!session) redirect("/login");
  if (session.user.role !== "admin") redirect("/center/dashboard");

  return (
    <DashboardShell nav={ADMIN_NAV} title="Admin" user={session.user}>
      {children}
    </DashboardShell>
  );
}
