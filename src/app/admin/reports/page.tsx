"use client";

import { useState } from "react";
import { toast } from "sonner";
import * as XLSX from "xlsx";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { StatCard } from "@/components/cards/stat-card";
import { Trophy, Users, IndianRupee, FileCheck2, Download } from "lucide-react";
import { formatCurrency, formatDate } from "@/lib/utils";
import { useStats, useStudents, useCenters } from "@/services";
import { EVENT_YEAR } from "@/constants";

export default function ReportsPage() {
  const { data: s, loading } = useStats();
  const { data: students } = useStudents();
  const { data: centers } = useCenters();
  const [busy, setBusy] = useState(false);

  function downloadReport() {
    setBusy(true);
    try {
      const wb = XLSX.utils.book_new();

      // 1) Summary
      const summary = [
        ["Metric", "Value"],
        ["Total students", s.students],
        ["Pending students", s.pendingStudents],
        ["Approved students", s.approvedStudents],
        ["Rejected students", s.rejectedStudents],
        ["Chest-card active", s.activeStudents],
        ["Registered centres", s.centers],
        ["Categories", s.byCategory.length],
        ["Pending payments", s.pendingPayments],
        ["Approved payments", s.approvedPayments],
        ["Rejected payments", s.rejectedPayments],
        ["Collected (approved)", s.collected],
      ];
      const wsSummary = XLSX.utils.aoa_to_sheet(summary);
      wsSummary["!cols"] = [{ wch: 24 }, { wch: 18 }];
      XLSX.utils.book_append_sheet(wb, wsSummary, "Summary");

      // 2) Students by category
      const byCat = [["Category", "Students"], ...s.byCategory.map((r) => [r.categoryName, r.count])];
      const wsCat = XLSX.utils.aoa_to_sheet(byCat);
      wsCat["!cols"] = [{ wch: 28 }, { wch: 12 }];
      XLSX.utils.book_append_sheet(wb, wsCat, "By Category");

      // 3) Full students list
      const studentRows = [
        ["Roll", "Name", "Guardian", "Category", "Centre", "Status", "Age", "Class", "School", "Phone", "WhatsApp", "Added"],
        ...students.map((st) => [
          st.roll_number ?? "", st.full_name, st.guardian_name, st.category_name, st.center_name,
          st.status, st.age, st.class ?? "", st.school_name ?? "", st.phone ?? "", st.whatsapp ?? "",
          formatDate(st.created_at),
        ]),
      ];
      const wsStudents = XLSX.utils.aoa_to_sheet(studentRows);
      wsStudents["!cols"] = studentRows[0].map(() => ({ wch: 16 }));
      XLSX.utils.book_append_sheet(wb, wsStudents, "Students");

      // 4) Full centres list (with active-student counts)
      const activeByCenter = new Map<string, number>();
      for (const st of students) {
        if (st.status === "active" && st.center_id) {
          activeByCenter.set(st.center_id, (activeByCenter.get(st.center_id) ?? 0) + 1);
        }
      }
      const centreRows = [
        ["Centre", "Owner", "Phone", "WhatsApp", "City", "State", "Pincode", "Start Date", "Active Students", "Participating"],
        ...centers.map((c) => [
          c.center_name, c.owner_name ?? "", c.phone ?? "", c.whatsapp ?? "", c.city ?? "", c.state ?? "",
          c.pincode ?? "", c.start_date ? formatDate(c.start_date) : "", activeByCenter.get(c.id) ?? 0,
          c.participating ? "Yes" : "No",
        ]),
      ];
      const wsCentres = XLSX.utils.aoa_to_sheet(centreRows);
      wsCentres["!cols"] = centreRows[0].map(() => ({ wch: 16 }));
      XLSX.utils.book_append_sheet(wb, wsCentres, "Centres");

      XLSX.writeFile(wb, `dekhao-apna-talent-report-${EVENT_YEAR}.xlsx`);
      toast.success("Report downloaded");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not generate report");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h2 className="text-lg font-semibold">Reports{loading ? " · syncing…" : ""}</h2>
        <Button onClick={downloadReport} disabled={busy} className="gap-2 sm:self-start">
          <Download className="size-4" /> {busy ? "Preparing…" : "Download full report (.xlsx)"}
        </Button>
      </div>

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
