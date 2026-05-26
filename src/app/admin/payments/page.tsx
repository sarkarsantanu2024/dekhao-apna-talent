"use client";

import { useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/common/status-badge";
import { PaymentActions } from "@/components/admin/payment-actions";
import { formatCurrency, formatDate } from "@/lib/utils";
import { usePayments } from "@/services";
import type { PaymentStatus } from "@/types";

const FILTERS: { value: PaymentStatus | "all"; label: string }[] = [
  { value: "all", label: "All" },
  { value: "pending", label: "Pending" },
  { value: "approved", label: "Approved" },
  { value: "rejected", label: "Rejected" },
];

export default function AdminPaymentsPage() {
  const { data: rows, loading } = usePayments();
  const [filter, setFilter] = useState<PaymentStatus | "all">("all");

  const filtered = useMemo(
    () => (filter === "all" ? rows : rows.filter((p) => p.status === filter)),
    [rows, filter],
  );

  return (
    <Card>
      <CardHeader className="flex flex-wrap items-center justify-between gap-3">
        <CardTitle>All payments ({filtered.length})</CardTitle>
        <div className="flex gap-1 rounded-md border p-1">
          {FILTERS.map((f) => (
            <Button
              key={f.value}
              size="sm"
              variant={filter === f.value ? "default" : "ghost"}
              onClick={() => setFilter(f.value)}
              className="h-7 px-3 text-xs"
            >
              {f.label}
            </Button>
          ))}
        </div>
      </CardHeader>

      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Centre</TableHead><TableHead>Amount</TableHead><TableHead>Ref</TableHead>
              <TableHead>Screenshot</TableHead><TableHead>Status</TableHead><TableHead>Date</TableHead><TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading && filtered.length === 0 ? (
              <TableRow><TableCell colSpan={7} className="text-center text-muted-foreground">Loading…</TableCell></TableRow>
            ) : filtered.length === 0 ? (
              <TableRow><TableCell colSpan={7} className="text-center text-muted-foreground">No payments match this filter.</TableCell></TableRow>
            ) : filtered.map((p) => (
              <TableRow key={p.id}>
                <TableCell>{p.center_name}</TableCell>
                <TableCell>{formatCurrency(p.amount)}</TableCell>
                <TableCell className="font-mono text-xs">{p.transaction_ref ?? "—"}</TableCell>
                <TableCell><a href={p.screenshot_url} target="_blank" rel="noreferrer" className="text-primary hover:underline">View</a></TableCell>
                <TableCell><StatusBadge status={p.status} /></TableCell>
                <TableCell className="text-muted-foreground">{formatDate(p.created_at)}</TableCell>
                <TableCell>
                  {p.status === "pending"
                    ? <PaymentActions id={p.id} />
                    : <span className="text-xs text-muted-foreground">{p.review_note ?? "—"}</span>}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
