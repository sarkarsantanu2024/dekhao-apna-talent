import Link from "next/link";
import { auth } from "@/lib/auth/auth";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { StatCard } from "@/components/cards/stat-card";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Users, FileCheck2, Hourglass } from "lucide-react";
import { EVENT_YEAR } from "@/constants";

export const metadata = { title: "Centre dashboard" };

export default async function CenterDashboard() {
  const session = await auth();
  const centerId = session!.user.centerId;
  const sb = supabaseAdmin();

  const [students, active, pending] = await Promise.all([
    sb.from("students").select("id", { count: "exact", head: true }).eq("center_id", centerId).eq("event_year", EVENT_YEAR),
    sb.from("students").select("id", { count: "exact", head: true }).eq("center_id", centerId).eq("status", "active").eq("event_year", EVENT_YEAR),
    sb.from("payments").select("id", { count: "exact", head: true }).eq("center_id", centerId).eq("status", "pending").eq("event_year", EVENT_YEAR),
  ]);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold">Welcome back</h1>
          <p className="text-sm text-muted-foreground">Event year {EVENT_YEAR}</p>
        </div>
        <Button asChild><Link href="/center/students/new">+ Add student</Link></Button>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard label="My students"       value={students.count ?? 0} icon={Users}      />
        <StatCard label="Active chest cards" value={active.count ?? 0}  icon={FileCheck2} />
        <StatCard label="Payments awaiting"  value={pending.count ?? 0} icon={Hourglass}  />
      </div>

      <Card>
        <CardHeader><CardTitle>Quick actions</CardTitle></CardHeader>
        <CardContent className="flex flex-wrap gap-3">
          <Button asChild variant="outline"><Link href="/center/students">Manage students</Link></Button>
          <Button asChild variant="outline"><Link href="/center/payments">Upload payment</Link></Button>
          <Button asChild variant="outline"><Link href="/center/downloads">Download chest cards</Link></Button>
        </CardContent>
      </Card>
    </div>
  );
}
