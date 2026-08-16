"use client";

import { useMemo, useState } from "react";
import { toast } from "sonner";
import * as XLSX from "xlsx";
import { Download } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { formatCurrency } from "@/lib/utils";
import { usePayments, useStudents } from "@/services";
import { EVENT_YEAR } from "@/constants";
import { TEST_PAYMENT_IDS } from "@/constants/test-data";

/**
 * Centre-wise collection (approved payments only, so it matches the
 * "Collected (approved)" tile), broken down by the paying student's category.
 * Payments not linked to a student have no category → "Other / unlinked".
 */

type CentreRow = {
  centreName: string;
  total: number;
  byCategory: { categoryName: string; amount: number }[];
};

const UNLINKED = "Other / unlinked";

export function CollectionByCentre({ hideTest = false }: { hideTest?: boolean }) {
  const { data: allPayments, loading } = usePayments({ status: "approved" });
  const { data: students } = useStudents();
  const [busy, setBusy] = useState(false);

  const payments = useMemo(
    () => (hideTest ? allPayments.filter((p) => !TEST_PAYMENT_IDS.has(p.id)) : allPayments),
    [allPayments, hideTest],
  );

  const rows: CentreRow[] = useMemo(() => {
    const categoryByStudent = new Map<string, string>();
    for (const st of students) categoryByStudent.set(st.id, st.category_name);

    const centres = new Map<string, Map<string, number>>();
    for (const p of payments) {
      const centre = p.center_name || "Unknown centre";
      const category =
        (p.student_id && categoryByStudent.get(p.student_id)) || UNLINKED;
      const byCat = centres.get(centre) ?? new Map<string, number>();
      byCat.set(category, (byCat.get(category) ?? 0) + Number(p.amount));
      centres.set(centre, byCat);
    }

    return Array.from(centres.entries())
      .map(([centreName, byCat]) => ({
        centreName,
        total: Array.from(byCat.values()).reduce((a, b) => a + b, 0),
        byCategory: Array.from(byCat.entries())
          .map(([categoryName, amount]) => ({ categoryName, amount }))
          .sort((a, b) => b.amount - a.amount),
      }))
      .sort((a, b) => b.total - a.total);
  }, [payments, students]);

  const grandTotal = rows.reduce((sum, r) => sum + r.total, 0);

  /** Export all centres, or just one when `only` is given. */
  function downloadReport(only?: CentreRow) {
    setBusy(true);
    try {
      const target = only ? [only] : rows;
      const wb = XLSX.utils.book_new();
      const aoa: (string | number)[][] = [["Centre", "Category", "Amount (₹)"]];
      for (const r of target) {
        for (const c of r.byCategory) aoa.push([r.centreName, c.categoryName, c.amount]);
        aoa.push([`${r.centreName} — total`, "", r.total]);
      }
      if (!only) aoa.push(["Grand total", "", grandTotal]);
      const ws = XLSX.utils.aoa_to_sheet(aoa);
      ws["!cols"] = [{ wch: 28 }, { wch: 26 }, { wch: 14 }];
      XLSX.utils.book_append_sheet(wb, ws, "Collection");
      const slug = only
        ? only.centreName.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "")
        : "all-centres";
      XLSX.writeFile(wb, `collection-${slug}-${EVENT_YEAR}.xlsx`);
      toast.success(only ? `${only.centreName} collection downloaded` : "Collection report downloaded");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not generate report");
    } finally {
      setBusy(false);
    }
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0">
        <CardTitle>Collection by centre{loading ? " · syncing…" : ""}</CardTitle>
        <Button
          variant="outline"
          size="sm"
          onClick={() => downloadReport()}
          disabled={busy || rows.length === 0}
          className="gap-2"
        >
          <Download className="size-4" /> {busy ? "Preparing…" : "Download (.xlsx)"}
        </Button>
      </CardHeader>
      <CardContent>
        {rows.length === 0 ? (
          <p className="text-sm text-muted-foreground">No approved payments yet.</p>
        ) : (
          <div className="space-y-4">
            {rows.map((r) => (
              <div key={r.centreName} className="rounded-lg border">
                <div className="flex items-center justify-between gap-3 border-b bg-muted/40 px-4 py-2">
                  <p className="text-sm font-semibold">{r.centreName}</p>
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-bold">{formatCurrency(r.total)}</p>
                    <Button
                      size="icon"
                      variant="ghost"
                      className="size-7"
                      aria-label={`Download ${r.centreName} collection`}
                      title="Download this centre (.xlsx)"
                      disabled={busy}
                      onClick={() => downloadReport(r)}
                    >
                      <Download className="size-3.5" />
                    </Button>
                  </div>
                </div>
                <ul className="divide-y px-4">
                  {r.byCategory.map((c) => (
                    <li key={c.categoryName} className="flex justify-between py-2 text-sm">
                      <span className="text-muted-foreground">{c.categoryName}</span>
                      <span className="font-medium">{formatCurrency(c.amount)}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
            <div className="flex items-center justify-between rounded-lg border bg-muted/40 px-4 py-2.5">
              <p className="text-sm font-semibold">All centres</p>
              <p className="text-sm font-bold">{formatCurrency(grandTotal)}</p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
