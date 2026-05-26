"use client";

import { useState } from "react";
import { RotateCcw, AlertCircle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/common/status-badge";
import { PaymentUploadForm } from "@/components/forms/payment-upload-form";
import { PaymentResubmitDialog } from "@/components/forms/payment-resubmit-dialog";
import { formatCurrency, formatDate } from "@/lib/utils";
import { useCenters, usePayments } from "@/services";
import type { Payment } from "@/types";

export default function CenterPaymentsPage() {
  const { data: centers } = useCenters();
  const centerId = centers[0]?.id;
  const { data: rows, loading } = usePayments({ centerId });

  const [resubmitTarget, setResubmitTarget] = useState<Payment | null>(null);

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
                <TableRow><TableCell colSpan={6} className="text-center text-muted-foreground">Loading…</TableCell></TableRow>
              ) : rows.length === 0 ? (
                <TableRow><TableCell colSpan={6} className="text-center text-muted-foreground">No payments yet.</TableCell></TableRow>
              ) : rows.map((p) => (
                <PaymentRow key={p.id} payment={p} onResubmit={() => setResubmitTarget(p)} />
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
    </div>
  );
}

function PaymentRow({ payment: p, onResubmit }: { payment: Payment; onResubmit: () => void }) {
  const isRejected = p.status === "rejected";
  return (
    <>
      <TableRow className={isRejected ? "bg-destructive/5" : undefined}>
        <TableCell>{formatCurrency(p.amount)}</TableCell>
        <TableCell className="font-mono text-xs">{p.transaction_ref ?? "—"}</TableCell>
        <TableCell><a href={p.screenshot_url} target="_blank" rel="noreferrer" className="text-primary hover:underline">View</a></TableCell>
        <TableCell><StatusBadge status={p.status} /></TableCell>
        <TableCell className="text-muted-foreground">{formatDate(p.created_at)}</TableCell>
        <TableCell className="text-right">
          {isRejected ? (
            <Button size="sm" variant="outline" onClick={onResubmit} className="gap-1.5">
              <RotateCcw className="size-3.5" /> Resubmit
            </Button>
          ) : (
            <span className="text-xs text-muted-foreground">—</span>
          )}
        </TableCell>
      </TableRow>

      {/* Inline rejection note callout */}
      {isRejected && (
        <TableRow className="bg-destructive/5 hover:bg-destructive/5">
          <TableCell colSpan={6} className="!py-2">
            <div className="flex items-start gap-2 text-sm">
              <AlertCircle className="mt-0.5 size-4 shrink-0 text-destructive" />
              <div>
                <span className="text-xs font-semibold uppercase tracking-wider text-destructive">
                  Admin&apos;s note ·
                </span>{" "}
                <span className="text-foreground/90">
                  {p.review_note?.trim() ? p.review_note : "No reason given. Upload a clearer screenshot."}
                </span>
              </div>
            </div>
          </TableCell>
        </TableRow>
      )}
    </>
  );
}
