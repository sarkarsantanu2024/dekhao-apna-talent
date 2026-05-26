"use client";

import { EVENT_YEAR } from "@/constants";
import { useStats } from "@/services";
import { DashboardOverview } from "@/components/dashboard/overview";

export default function AdminDashboard() {
  const { data: stats, loading } = useStats();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <p className="text-sm text-muted-foreground">
          Event year {EVENT_YEAR} · Platform-wide view{loading ? " · syncing…" : ""}
        </p>
      </div>

      <DashboardOverview
        stats={stats}
        scope="global"
        studentsHref="/admin/students"
        paymentsHref="/admin/payments"
      />
    </div>
  );
}
