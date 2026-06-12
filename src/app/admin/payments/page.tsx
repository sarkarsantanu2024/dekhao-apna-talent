"use client";

import { useMemo, useState } from "react";
import { toast } from "sonner";
import { Check, X, RotateCcw } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { StatusBadge } from "@/components/common/status-badge";
import { PaymentActions } from "@/components/admin/payment-actions";
import { confirm, prompt } from "@/components/ui/confirm-dialog";
import { formatCurrency, formatDate } from "@/lib/utils";
import { store, usePayments } from "@/services";
import type { Payment, PaymentStatus } from "@/types";

const FILTERS: { value: PaymentStatus | "all"; label: string }[] = [
  { value: "all", label: "All" },
  { value: "pending", label: "Pending" },
  { value: "approved", label: "Approved" },
  { value: "rejected", label: "Rejected" },
];

export default function AdminPaymentsPage() {
  const { data: rows, loading } = usePayments();
  const [filter, setFilter] = useState<PaymentStatus | "all">("all");
  const [selected, setSelected] = useState<Set<string>>(new Set());

  const filtered = useMemo(
    () => (filter === "all" ? rows : rows.filter((p) => p.status === filter)),
    [rows, filter],
  );

  // Only pending payments can be approved/rejected, so only those are selectable.
  const pendingRows = useMemo(() => filtered.filter((p) => p.status === "pending"), [filtered]);
  const allSelected = pendingRows.length > 0 && pendingRows.every((p) => selected.has(p.id));

  const toggle = (id: string) =>
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  const toggleAll = () =>
    setSelected(allSelected ? new Set() : new Set(pendingRows.map((p) => p.id)));

  const onBulk = async (kind: "approve" | "reject") => {
    const ids = [...selected];
    if (!ids.length) return;
    if (kind === "reject" && !(await confirm({
      title: `Reject ${ids.length} payment${ids.length !== 1 ? "s" : ""}?`,
      description: "The selected payments will be marked as rejected. Centres can re-submit.",
      confirmText: "Reject",
      destructive: true,
    }))) return;
    let ok = 0;
    for (const id of ids) {
      try {
        if (kind === "approve") await store.approvePayment(id);
        else await store.rejectPayment(id);
        ok++;
      } catch { /* skip failures */ }
    }
    setSelected(new Set());
    toast.success(`${kind === "approve" ? "Approved" : "Rejected"} ${ok} payment${ok !== 1 ? "s" : ""}`);
  };

  const onRevert = async (p: Payment) => {
    const wasApproved = p.status === "approved";
    const note = await prompt({
      title: "Undo this decision?",
      description: wasApproved
        ? `This payment goes back to “pending” and ${p.student_name ?? "the student"}'s chest card re-locks. Tell the centre why you changed it and what to fix — they'll see this and can re-submit.`
        : "This payment goes back to “pending”. Tell the centre why and what to fix — they'll see this note.",
      placeholder: "Reason (e.g. amount mismatch — upload the correct screenshot)",
      confirmText: "Undo",
      destructive: true,
    });
    if (note === null) return; // cancelled
    try {
      await store.revertPayment(p.id, note || undefined);
      toast.success("Moved back to pending — centre notified");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not undo");
    }
  };

  return (
    <Card>
      <CardHeader className="flex flex-row flex-wrap items-center justify-between gap-3">
        <CardTitle className="min-w-0">All payments ({filtered.length})</CardTitle>
        <div className="flex flex-wrap items-center gap-2">
          {selected.size > 0 && (
            <>
              <span className="text-sm text-muted-foreground">{selected.size} selected</span>
              <Button size="sm" className="gap-1.5 shrink-0" onClick={() => onBulk("approve")}>
                <Check className="size-4" /> Approve
              </Button>
              <Button variant="outline" size="sm" className="gap-1.5 shrink-0" onClick={() => onBulk("reject")}>
                <X className="size-4" /> Reject
              </Button>
            </>
          )}
          <div className="inline-flex flex-wrap gap-1 rounded-md border bg-background p-1">
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
        </div>
      </CardHeader>

      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-10">
                <Checkbox
                  checked={allSelected}
                  onCheckedChange={toggleAll}
                  disabled={pendingRows.length === 0}
                  aria-label="Select all pending"
                />
              </TableHead>
              <TableHead>Centre</TableHead><TableHead>Student</TableHead><TableHead>Amount</TableHead><TableHead>Ref</TableHead>
              <TableHead>Screenshot</TableHead><TableHead>Status</TableHead><TableHead>Date</TableHead><TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading && filtered.length === 0 ? (
              <TableRow><TableCell colSpan={9} className="text-center text-muted-foreground">Loading…</TableCell></TableRow>
            ) : filtered.length === 0 ? (
              <TableRow><TableCell colSpan={9} className="text-center text-muted-foreground">No payments match this filter.</TableCell></TableRow>
            ) : filtered.map((p) => (
              <TableRow key={p.id} data-state={selected.has(p.id) ? "selected" : undefined}>
                <TableCell>
                  {p.status === "pending" ? (
                    <Checkbox
                      checked={selected.has(p.id)}
                      onCheckedChange={() => toggle(p.id)}
                      aria-label={`Select payment from ${p.center_name}`}
                    />
                  ) : null}
                </TableCell>
                <TableCell>{p.center_name}</TableCell>
                <TableCell>{p.student_name ?? "—"}</TableCell>
                <TableCell>{formatCurrency(p.amount)}</TableCell>
                <TableCell className="font-mono text-xs">{p.transaction_ref ?? "—"}</TableCell>
                <TableCell><a href={p.screenshot_url} target="_blank" rel="noreferrer" className="text-primary hover:underline">View</a></TableCell>
                <TableCell><StatusBadge status={p.status} /></TableCell>
                <TableCell className="text-muted-foreground">{formatDate(p.created_at)}</TableCell>
                <TableCell>
                  {p.status === "pending" ? (
                    <PaymentActions id={p.id} />
                  ) : (
                    <div className="flex items-center gap-2">
                      {p.status === "approved" ? (
                        <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-100 px-2.5 py-1 text-xs font-medium text-emerald-700">
                          <Check className="size-3.5" /> Verified by {p.reviewed_by ?? "admin"}
                        </span>
                      ) : (
                        <div className="flex flex-col gap-0.5">
                          <span className="inline-flex w-fit items-center gap-1.5 rounded-full bg-rose-100 px-2.5 py-1 text-xs font-medium text-rose-700">
                            <X className="size-3.5" /> Rejected by {p.reviewed_by ?? "admin"}
                          </span>
                          {p.review_note && <span className="text-[11px] text-muted-foreground">“{p.review_note}”</span>}
                        </div>
                      )}
                      <Button
                        size="sm"
                        variant="ghost"
                        className="h-7 gap-1 px-2 text-xs text-muted-foreground"
                        title="Undo this decision — sends the payment back to pending"
                        onClick={() => onRevert(p)}
                      >
                        <RotateCcw className="size-3.5" /> Undo
                      </Button>
                    </div>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
