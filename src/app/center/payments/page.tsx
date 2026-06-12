"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { toast } from "sonner";
import { RotateCcw, AlertCircle, Pencil, Trash2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/common/status-badge";
import { PaymentUploadForm } from "@/components/forms/payment-upload-form";
import { PaymentResubmitDialog } from "@/components/forms/payment-resubmit-dialog";
import { PaymentEditDialog } from "@/components/forms/payment-edit-dialog";
import { confirm } from "@/components/ui/confirm-dialog";
import { formatCurrency, formatDate } from "@/lib/utils";
import { store, useCenters, usePayments } from "@/services";
import type { Payment } from "@/types";

export default function CenterPaymentsPage() {
  const { data: session } = useSession();
  const { data: centers } = useCenters();
  const sessionCenterId = session?.user?.centerId ?? null;
  const centerId = (centers.find((c) => c.id === sessionCenterId) ?? centers[0])?.id;
  const { data: rows, loading } = usePayments({ centerId });

  const [resubmitTarget, setResubmitTarget] = useState<Payment | null>(null);
  const [editTarget, setEditTarget] = useState<Payment | null>(null);

  const onDelete = async (p: Payment) => {
    if (!(await confirm({
      title: "Delete this payment?",
      description: `The payment${p.student_name ? ` for ${p.student_name}` : ""} will be removed. This cannot be undone.`,
      confirmText: "Delete",
      destructive: true,
    }))) return;
    try {
      await store.deletePayment(p.id);
      toast.success("Payment deleted");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Delete failed");
    }
  };

  return (
    <div className="grid gap-6 lg:grid-cols-3">
      <Card className="lg:col-span-1">
        <CardHeader>
          <CardTitle>Upload payment screenshot</CardTitle>
          <CardDescription>Pay offline, then upload a screenshot here for admin approval.</CardDescription>
        </CardHeader>
        <CardContent><PaymentUploadForm /></CardContent>
      </Card>

      <Card className="lg:col-span-2">
        <CardHeader>
          <CardTitle>My submissions ({rows.length})</CardTitle>
          <CardDescription>
            Each row shows whether the admin has verified your payment. Rejected ones can be resubmitted with a fresh screenshot.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Student</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Ref</TableHead>
                <TableHead>Screenshot</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Date</TableHead>
                <TableHead className="text-right">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading && rows.length === 0 ? (
                <TableRow><TableCell colSpan={7} className="text-center text-muted-foreground">Loading…</TableCell></TableRow>
              ) : rows.length === 0 ? (
                <TableRow><TableCell colSpan={7} className="text-center text-muted-foreground">No payments yet.</TableCell></TableRow>
              ) : rows.map((p) => (
                <PaymentRow
                  key={p.id}
                  payment={p}
                  onResubmit={() => setResubmitTarget(p)}
                  onEdit={() => setEditTarget(p)}
                  onDelete={() => onDelete(p)}
                />
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <PaymentResubmitDialog
        open={resubmitTarget !== null}
        onOpenChange={(v) => !v && setResubmitTarget(null)}
        payment={resubmitTarget}
      />
      <PaymentEditDialog
        open={editTarget !== null}
        onOpenChange={(v) => !v && setEditTarget(null)}
        payment={editTarget}
      />
    </div>
  );
}

function PaymentRow({
  payment: p,
  onResubmit,
  onEdit,
  onDelete,
}: {
  payment: Payment;
  onResubmit: () => void;
  onEdit: () => void;
  onDelete: () => void;
}) {
  const isRejected = p.status === "rejected";
  const isApproved = p.status === "approved";
  return (
    <>
      <TableRow className={isRejected ? "bg-destructive/5" : undefined}>
        <TableCell className="font-medium">{p.student_name ?? "—"}</TableCell>
        <TableCell>{formatCurrency(p.amount)}</TableCell>
        <TableCell className="font-mono text-xs">{p.transaction_ref ?? "—"}</TableCell>
        <TableCell><a href={p.screenshot_url} target="_blank" rel="noreferrer" className="text-primary hover:underline">View</a></TableCell>
        <TableCell><StatusBadge status={p.status} /></TableCell>
        <TableCell className="text-muted-foreground">{formatDate(p.created_at)}</TableCell>
        <TableCell className="text-right">
          {isApproved ? (
            <span className="text-xs text-muted-foreground">Verified — locked</span>
          ) : (
            <div className="flex items-center justify-end gap-1">
              {isRejected ? (
                <Button size="sm" variant="outline" onClick={onResubmit} className="gap-1.5">
                  <RotateCcw className="size-3.5" /> Resubmit
                </Button>
              ) : (
                <Button size="icon" variant="ghost" aria-label="Edit payment" onClick={onEdit}>
                  <Pencil className="size-4" />
                </Button>
              )}
              <Button size="icon" variant="ghost" aria-label="Delete payment" onClick={onDelete}>
                <Trash2 className="size-4" />
              </Button>
            </div>
          )}
        </TableCell>
      </TableRow>

      {/* Inline admin note — shown for rejected and admin-reverted (pending) rows */}
      {p.review_note?.trim() && (p.status === "rejected" || p.status === "pending") && (
        <TableRow className="bg-amber-50 hover:bg-amber-50">
          <TableCell colSpan={7} className="!py-2">
            <div className="flex items-start gap-2 text-sm">
              <AlertCircle className="mt-0.5 size-4 shrink-0 text-amber-600" />
              <div>
                <span className="text-xs font-semibold uppercase tracking-wider text-amber-700">
                  Admin&apos;s note ·
                </span>{" "}
                <span className="text-foreground/90">{p.review_note}</span>
              </div>
            </div>
          </TableCell>
        </TableRow>
      )}
    </>
  );
}
