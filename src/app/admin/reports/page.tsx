import { supabaseAdmin } from "@/lib/supabase/admin";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StatCard } from "@/components/cards/stat-card";
import { Trophy, Users, IndianRupee, FileCheck2 } from "lucide-react";
import { EVENT_YEAR } from "@/constants";
import { formatCurrency } from "@/lib/utils";

export const metadata = { title: "Reports" };

interface CategoryRow { category_name: string; count: number }

async function loadReports() {
  const sb = supabaseAdmin();
  const [studentsRes, paymentsRes] = await Promise.all([
    sb.from("students").select("category_name, status").eq("event_year", EVENT_YEAR),
    sb.from("payments").select("amount").eq("event_year", EVENT_YEAR).eq("status", "approved"),
  ]);
  const students = (studentsRes.data ?? []) as { category_name: string; status: string }[];
  const approvedPayments = (paymentsRes.data ?? []) as { amount: number }[];

  const byCategory = new Map<string, number>();
  let active = 0;
  for (const s of students) {
    byCategory.set(s.category_name, (byCategory.get(s.category_name) ?? 0) + 1);
    if (s.status === "active") active++;
  }
  const total = students.length;
  const collected = approvedPayments.reduce((a, p) => a + Number(p.amount), 0);

  const rows: CategoryRow[] = Array.from(byCategory.entries()).map(([category_name, count]) => ({ category_name, count }));
  return { total, active, collected, rows };
}

export default async function ReportsPage() {
  const r = await loadReports().catch(() => ({ total: 0, active: 0, collected: 0, rows: [] as CategoryRow[] }));
  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Total students" value={r.total}              icon={Users}      />
        <StatCard label="Chest-card active" value={r.active}           icon={FileCheck2} />
        <StatCard label="Collected (approved)" value={formatCurrency(r.collected)} icon={IndianRupee} />
        <StatCard label="Categories" value={r.rows.length}             icon={Trophy}     />
      </div>
      <Card>
        <CardHeader><CardTitle>Students by category</CardTitle></CardHeader>
        <CardContent>
          <ul className="divide-y">
            {r.rows.length === 0 ? (
              <li className="py-2 text-sm text-muted-foreground">No data yet.</li>
            ) : r.rows.map((row) => (
              <li key={row.category_name} className="flex justify-between py-2 text-sm">
                <span>{row.category_name}</span><span className="font-semibold">{row.count}</span>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}
