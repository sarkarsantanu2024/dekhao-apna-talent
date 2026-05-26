"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StatCard } from "@/components/cards/stat-card";
import { Trophy, Users, IndianRupee, FileCheck2 } from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import { useStats } from "@/services";

export default function ReportsPage() {
  const { data: s, loading } = useStats();

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Total students"        value={s.students}                  icon={Users}      />
        <StatCard label="Chest-card active"     value={s.activeStudents}            icon={FileCheck2} />
        <StatCard label="Collected (approved)"  value={formatCurrency(s.collected)} icon={IndianRupee} />
        <StatCard label="Categories"            value={s.byCategory.length}         icon={Trophy}     />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Students by category{loading ? " · syncing…" : ""}</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="divide-y">
            {s.byCategory.length === 0 ? (
              <li className="py-2 text-sm text-muted-foreground">No data yet.</li>
            ) : s.byCategory.map((row) => (
              <li key={row.categoryName} className="flex justify-between py-2 text-sm">
                <span>{row.categoryName}</span>
                <span className="font-semibold">{row.count}</span>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}
