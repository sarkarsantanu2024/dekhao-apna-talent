"use client";

import Link from "next/link";
import { useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { EVENT_YEAR } from "@/constants";
import { useCenters, usePayments, useStudents } from "@/services";
import type { DashboardStats } from "@/services";
import { DashboardOverview } from "@/components/dashboard/overview";

export default function CenterDashboard() {
  const { data: centers } = useCenters();
  const myCenter = centers[0] ?? null;
  const centerId = myCenter?.id;

  const { data: students } = useStudents({ centerId });
  const { data: payments } = usePayments({ centerId });

  /**
   * Compute the same DashboardStats shape the admin uses, but scoped to this
   * centre's students/payments only. Identical UI → identical mental model.
   */
  const stats: DashboardStats = useMemo(() => {
    const byCat = new Map<string, number>();
    let pending = 0, approved = 0, rejected = 0, active = 0;
    for (const s of students) {
      byCat.set(s.category_name, (byCat.get(s.category_name) ?? 0) + 1);
      if      (s.status === "pending")  pending++;
      else if (s.status === "approved") approved++;
      else if (s.status === "rejected") rejected++;
      else if (s.status === "active")   active++;
    }
    let pPay = 0, aPay = 0, rPay = 0, collected = 0;
    for (const p of payments) {
      if      (p.status === "pending")  pPay++;
      else if (p.status === "approved") { aPay++; collected += Number(p.amount); }
      else if (p.status === "rejected") rPay++;
    }
    return {
      students: students.length,
      centers: 1,
      pendingStudents: pending,
      approvedStudents: approved,
      rejectedStudents: rejected,
      activeStudents: active,
      pendingPayments: pPay,
      approvedPayments: aPay,
      rejectedPayments: rPay,
      collected,
      byCategory: Array.from(byCat.entries()).map(([categoryName, count]) => ({ categoryName, count })),
    };
  }, [students, payments]);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold">Welcome back</h1>
          <p className="text-sm text-muted-foreground">
            {myCenter?.center_name ?? "—"} · Event year {EVENT_YEAR}
          </p>
        </div>
        <Button asChild><Link href="/center/students/new">+ Add student</Link></Button>
      </div>

      <DashboardOverview
        stats={stats}
        scope="centre"
        studentsHref="/center/students"
        paymentsHref="/center/payments"
      />

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
