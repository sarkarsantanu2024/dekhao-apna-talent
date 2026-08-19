import { auth } from "@/lib/auth/auth";
import { redirect } from "next/navigation";
import { DashboardShell } from "@/components/dashboard/shell";
import { NoticeMarquee } from "@/components/common/notice-marquee";
import { CENTER_NAV } from "@/constants";

export default async function CenterLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  if (!session) redirect("/login");
  if (session.user.role !== "center_owner") redirect("/admin/dashboard");

  return (
    <DashboardShell nav={CENTER_NAV} title={session.user.name || "Centre"} user={session.user}>
      {/* News-style trilingual notice — top of every centre-portal page */}
      <NoticeMarquee className="mb-4" />
      {children}
    </DashboardShell>
  );
}
