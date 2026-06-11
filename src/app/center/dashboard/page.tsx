"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { useSession } from "next-auth/react";
import { toast } from "sonner";
import * as XLSX from "xlsx";
import { Download } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { EVENT_YEAR } from "@/constants";
import { formatDate } from "@/lib/utils";
import { useCenters, usePayments, useStudents } from "@/services";
import type { DashboardStats } from "@/services";
import { DashboardOverview } from "@/components/dashboard/overview";

export default function CenterDashboard() {
  const { data: session } = useSession();
  const { data: centers } = useCenters();
  const sessionCenterId = session?.user?.centerId ?? null;
  const myCenter = centers.find((c) => c.id === sessionCenterId) ?? centers[0] ?? null;
  const centerId = myCenter?.id;

  const { data: students } = useStudents({ centerId });
  const { data: payments } = usePayments({ centerId });
  const [busy, setBusy] = useState(false);

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

  function downloadReport() {
    setBusy(true);
    try {
      const wb = XLSX.utils.book_new();

      // 1) Summary
      const summary = [
        ["Centre", myCenter?.center_name ?? "—"],
        ["Event year", EVENT_YEAR],
        ["", ""],
        ["Metric", "Value"],
        ["Total students", stats.students],
        ["Pending students", stats.pendingStudents],
        ["Approved students", stats.approvedStudents],
        ["Rejected students", stats.rejectedStudents],
        ["Active chest cards", stats.activeStudents],
        ["Pending payments", stats.pendingPayments],
        ["Approved payments", stats.approvedPayments],
        ["Rejected payments", stats.rejectedPayments],
        ["Collected (approved)", stats.collected],
      ];
      const wsSummary = XLSX.utils.aoa_to_sheet(summary);
      wsSummary["!cols"] = [{ wch: 24 }, { wch: 22 }];
      XLSX.utils.book_append_sheet(wb, wsSummary, "Summary");

      // 2) Students
      const studentRows = [
        ["Roll", "Name", "Guardian", "Category", "Status", "Age", "Class", "School", "Phone", "WhatsApp", "Added"],
        ...students.map((st) => [
          st.roll_number ?? "", st.full_name, st.guardian_name, st.category_name, st.status,
          st.age, st.class ?? "", st.school_name ?? "", st.phone ?? "", st.whatsapp ?? "",
          formatDate(st.created_at),
        ]),
      ];
      const wsStudents = XLSX.utils.aoa_to_sheet(studentRows);
      wsStudents["!cols"] = studentRows[0].map(() => ({ wch: 16 }));
      XLSX.utils.book_append_sheet(wb, wsStudents, "Students");

      // 3) Payments
      const paymentRows = [
        ["Amount", "Ref", "Status", "Reviewed by", "Note", "Date"],
        ...payments.map((p) => [
          Number(p.amount), p.transaction_ref ?? "", p.status, p.reviewed_by ?? "",
          p.review_note ?? "", formatDate(p.created_at),
        ]),
      ];
      const wsPayments = XLSX.utils.aoa_to_sheet(paymentRows);
      wsPayments["!cols"] = paymentRows[0].map(() => ({ wch: 16 }));
      XLSX.utils.book_append_sheet(wb, wsPayments, "Payments");

      const safe = (myCenter?.center_name ?? "centre").replace(/[^\w]+/g, "-").toLowerCase();
      XLSX.writeFile(wb, `${safe}-report-${EVENT_YEAR}.xlsx`);
      toast.success("Report downloaded");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not generate report");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold">Welcome back</h1>
          <p className="text-sm text-muted-foreground">
            {myCenter?.center_name ?? "—"} · Event year {EVENT_YEAR}
          </p>
        </div>
        <Button onClick={downloadReport} disabled={busy} className="gap-2">
          <Download className="size-4" /> {busy ? "Preparing…" : "Download report (.xlsx)"}
        </Button>
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
          <Button asChild><Link href="/center/students/new">+ Add student</Link></Button>
          <Button asChild variant="outline"><Link href="/center/students">Manage students</Link></Button>
          <Button asChild variant="outline"><Link href="/center/payments">Upload payment</Link></Button>
          <Button asChild variant="outline"><Link href="/center/downloads">Download chest cards</Link></Button>
        </CardContent>
      </Card>
    </div>
  );
}
