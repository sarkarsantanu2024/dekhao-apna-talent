import { auth } from "@/lib/auth/auth";
import { redirect } from "next/navigation";
import { DashboardSidebar } from "@/components/dashboard/sidebar";
import { DashboardTopbar } from "@/components/dashboard/topbar";
import { CENTER_NAV } from "@/constants";

export default async function CenterLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  if (!session) redirect("/login");
  if (session.user.role !== "center_owner") redirect("/admin/dashboard");

  return (
    <div className="flex min-h-screen">
      <DashboardSidebar nav={CENTER_NAV} title="Centre" />
      <div className="flex flex-1 flex-col">
        <DashboardTopbar user={session.user} />
        <main className="flex-1 p-4 md:p-6">{children}</main>
      </div>
    </div>
  );
}
