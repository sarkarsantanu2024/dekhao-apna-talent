"use client";

import { useMemo } from "react";
import { EVENT_YEAR } from "@/constants";
import { TEST_CENTER_IDS, TEST_PAYMENT_IDS, TEST_STUDENT_IDS } from "@/constants/test-data";
import { useStats, useStudents, usePayments, useCenters, useCategories, type DashboardStats } from "@/services";
import { useShowTestData } from "@/lib/use-show-test-data";
import { buildStats, withAllCategories } from "@/lib/build-stats";
import { DashboardOverview } from "@/components/dashboard/overview";
import { CollectionByCentre } from "@/components/dashboard/collection-by-centre";
import { Switch } from "@/components/ui/switch";

export default function AdminDashboard() {
  const { data: stats, loading } = useStats();
  const { data: students } = useStudents();
  const { data: payments } = usePayments();
  const { data: centers } = useCenters();
  const { data: categories } = useCategories();
  const [showTestData, onToggle] = useShowTestData();

  /** Stats over real rows only — the marked test rows filtered out. */
  const realStats: DashboardStats = useMemo(
    () =>
      buildStats(
        students.filter((s) => !TEST_STUDENT_IDS.has(s.id)),
        payments.filter((p) => !TEST_PAYMENT_IDS.has(p.id)),
        centers.filter((c) => !TEST_CENTER_IDS.has(c.id)),
      ),
    [students, payments, centers],
  );

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
          Test data hidden across the whole admin — only real (post-launch)
          records are shown here and on the Students, Payments, Centres,
          Credentials and Chest Cards pages. The test rows are untouched; flip
          the switch to include them again.
        </p>
      )}

      <DashboardOverview
        stats={{
          ...(showTestData ? stats : realStats),
          // Show every active category, even ones with no students yet.
          byCategory: withAllCategories((showTestData ? stats : realStats).byCategory, categories),
        }}
        scope="global"
        studentsHref="/admin/students"
        paymentsHref="/admin/payments"
        beforeByCategory={<CollectionByCentre hideTest={!showTestData} />}
      />
    </div>
  );
}
