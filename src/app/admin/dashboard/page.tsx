"use client";

import { useEffect, useMemo, useState } from "react";
import { EVENT_YEAR } from "@/constants";
import { TEST_CENTER_IDS, TEST_PAYMENT_IDS, TEST_STUDENT_IDS } from "@/constants/test-data";
import { useStats, useStudents, usePayments, useCenters, type DashboardStats } from "@/services";
import { DashboardOverview } from "@/components/dashboard/overview";
import { CollectionByCentre } from "@/components/dashboard/collection-by-centre";
import { Switch } from "@/components/ui/switch";

const SHOW_TEST_DATA_KEY = "dat:show-test-data";

export default function AdminDashboard() {
  const { data: stats, loading } = useStats();
  const { data: students } = useStudents();
  const { data: payments } = usePayments();
  const { data: centers } = useCenters();
  const [showTestData, setShowTestData] = useState(true);

  useEffect(() => {
    setShowTestData(window.localStorage.getItem(SHOW_TEST_DATA_KEY) !== "0");
  }, []);

  const onToggle = (v: boolean) => {
    setShowTestData(v);
    window.localStorage.setItem(SHOW_TEST_DATA_KEY, v ? "1" : "0");
  };

  /** Stats over real rows only — the marked test rows filtered out. Mirrors
   *  the store's getStats() so both toggle positions mean the same things. */
  const realStats: DashboardStats = useMemo(() => {
    const st = students.filter((s) => !TEST_STUDENT_IDS.has(s.id));
    const pay = payments.filter((p) => !TEST_PAYMENT_IDS.has(p.id));
    const ctr = centers.filter((c) => !TEST_CENTER_IDS.has(c.id));

    const byCat = new Map<string, number>();
    let pendingStudents = 0, approvedStudents = 0, rejectedStudents = 0, activeStudents = 0;
    for (const s of st) {
      byCat.set(s.category_name, (byCat.get(s.category_name) ?? 0) + 1);
      if      (s.status === "pending")  pendingStudents++;
      else if (s.status === "approved") approvedStudents++;
      else if (s.status === "rejected") rejectedStudents++;
      else if (s.status === "active")   activeStudents++;
    }
    let pendingPayments = 0, approvedPayments = 0, rejectedPayments = 0, collected = 0;
    for (const p of pay) {
      if      (p.status === "pending")  pendingPayments++;
      else if (p.status === "approved") { approvedPayments++; collected += Number(p.amount); }
      else if (p.status === "rejected") rejectedPayments++;
    }
    return {
      students: st.length,
      centers: ctr.length,
      pendingStudents, approvedStudents, rejectedStudents, activeStudents,
      pendingPayments, approvedPayments, rejectedPayments,
      collected,
      byCategory: Array.from(byCat.entries()).map(([categoryName, count]) => ({ categoryName, count })),
    };
  }, [students, payments, centers]);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold">Dashboard</h1>
          <p className="text-sm text-muted-foreground">
            Event year {EVENT_YEAR} · Platform-wide view{loading ? " · syncing…" : ""}
          </p>
        </div>
        <label className="flex cursor-pointer items-center gap-2 rounded-lg border bg-card px-3 py-2">
          <Switch checked={showTestData} onCheckedChange={onToggle} aria-label="Show test data" />
          <span className="text-sm">Show test data</span>
        </label>
      </div>

      {!showTestData && (
        <p className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-2.5 text-sm text-amber-800">
          Test data hidden — only real (post-launch) records are counted. The
          test rows are untouched; flip the switch to include them again.
        </p>
      )}

      <DashboardOverview
        stats={showTestData ? stats : realStats}
        scope="global"
        studentsHref="/admin/students"
        paymentsHref="/admin/payments"
        beforeByCategory={<CollectionByCentre hideTest={!showTestData} />}
      />
    </div>
  );
}
