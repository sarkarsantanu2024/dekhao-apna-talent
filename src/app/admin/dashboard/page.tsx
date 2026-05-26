import { Users, Building2, Hourglass, CheckCircle2 } from "lucide-react";
import { StatCard } from "@/components/cards/stat-card";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { EVENT_YEAR } from "@/constants";

export const metadata = { title: "Admin dashboard" };

async function loadStats() {
  const sb = supabaseAdmin();
  const [students, centers, pending, approved] = await Promise.all([
    sb.from("students").select("id", { count: "exact", head: true }).eq("event_year", EVENT_YEAR),
    sb.from("centers").select("id", { count: "exact", head: true }).eq("event_year", EVENT_YEAR),
    sb.from("payments").select("id", { count: "exact", head: true }).eq("status", "pending").eq("event_year", EVENT_YEAR),
    sb.from("payments").select("id", { count: "exact", head: true }).eq("status", "approved").eq("event_year", EVENT_YEAR),
  ]);
  return {
    students: students.count ?? 0,
    centers: centers.count ?? 0,
    pending: pending.count ?? 0,
    approved: approved.count ?? 0,
  };
}

export default async function AdminDashboard() {
  const s = await loadStats().catch(() => ({ students: 0, centers: 0, pending: 0, approved: 0 }));
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <p className="text-sm text-muted-foreground">Event year {EVENT_YEAR}</p>
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Total students"    value={s.students} icon={Users}        />
        <StatCard label="Total centers"     value={s.centers}  icon={Building2}    />
        <StatCard label="Pending payments"  value={s.pending}  icon={Hourglass}    />
        <StatCard label="Approved payments" value={s.approved} icon={CheckCircle2} />
      </div>
    </div>
  );
}
