import { auth } from "@/lib/auth/auth";
import { redirect } from "next/navigation";
import { DashboardShell } from "@/components/dashboard/shell";
import { CENTER_NAV } from "@/constants";

export default async function CenterLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  if (!session) redirect("/login");
  if (session.user.role !== "center_owner") redirect("/admin/dashboard");

  return (
    <DashboardShell nav={CENTER_NAV} title="Centre" user={session.user}>
      {children}
    </DashboardShell>
  );
}
