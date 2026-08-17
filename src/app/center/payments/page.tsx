"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { toast } from "sonner";
import { RotateCcw, AlertCircle, Pencil, Trash2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/common/status-badge";
import { ScreenshotPreview } from "@/components/common/screenshot-link";
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
          {/* Mobile: app-style card list */}
          <div className="space-y-3 md:hidden">
            {loading && rows.length === 0 ? (
              <p className="py-8 text-center text-sm text-muted-foreground">Loading…</p>
            ) : rows.length === 0 ? (
              <p className="py-8 text-center text-sm text-muted-foreground">No payments yet.</p>
            ) : rows.map((p) => (
              <div
                key={p.id}
                className={`rounded-lg border bg-card p-4 shadow-sm ${p.status === "rejected" ? "border-destructive/30 bg-destructive/5" : ""}`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="truncate font-medium">{p.student_name ?? "—"}</p>
                    <p className="truncate text-xs text-muted-foreground">{formatDate(p.created_at)}</p>
                  </div>
                  <StatusBadge status={p.status} />
                </div>
                <div className="mt-3 flex items-center gap-3">
                  <ScreenshotPreview
                    url={p.screenshot_url}
                    label={`Payment screenshot — ${p.student_name ?? p.center_name}`}
                    caption={`${formatCurrency(p.amount)}${p.transaction_ref ? ` · Ref ${p.transaction_ref}` : ""} · ${formatDate(p.created_at)}`}
                  />
                  <div className="min-w-0 text-xs text-muted-foreground">
                    <p className="text-base font-bold text-foreground">{formatCurrency(p.amount)}</p>
                    <p className="truncate font-mono">{p.transaction_ref ?? "—"}</p>
                  </div>
                </div>
                {p.review_note?.trim() && (p.status === "rejected" || p.status === "pending") && (
                  <div className="mt-3 flex items-start gap-2 rounded-lg bg-amber-50 p-2.5 text-sm">
                    <AlertCircle className="mt-0.5 size-4 shrink-0 text-amber-600" />
                    <div className="min-w-0 whitespace-normal wrap-break-word">
                      <span className="text-xs font-semibold uppercase tracking-wider text-amber-700">
                        Admin&apos;s note ·
                      </span>{" "}
                      <span className="text-foreground/90">{p.review_note}</span>
                    </div>
                  </div>
                )}
                <div className="mt-3 flex items-center justify-end gap-2 border-t pt-2.5">
                  {p.status === "approved" ? (
                    <span className="text-xs text-muted-foreground">Verified — locked</span>
                  ) : (
                    <>
                      {p.status === "rejected" ? (
                        <Button size="sm" variant="outline" onClick={() => setResubmitTarget(p)} className="gap-1.5">
                          <RotateCcw className="size-3.5" /> Resubmit
                        </Button>
                      ) : (
                        <Button size="icon" variant="ghost" aria-label="Edit payment" onClick={() => setEditTarget(p)}>
                          <Pencil className="size-4" />
                        </Button>
                      )}
                      <Button size="icon" variant="ghost" aria-label="Delete payment" onClick={() => onDelete(p)}>
                        <Trash2 className="size-4" />
                      </Button>
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Desktop: full table */}
          <div className="hidden md:block">
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
          </div>
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
        <TableCell>
          <ScreenshotPreview
            url={p.screenshot_url}
            label={`Payment screenshot — ${p.student_name ?? p.center_name}`}
            caption={`${formatCurrency(p.amount)}${p.transaction_ref ? ` · Ref ${p.transaction_ref}` : ""} · ${formatDate(p.created_at)}`}
          />
        </TableCell>
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
          <TableCell colSpan={7} className="whitespace-normal !py-2">
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
