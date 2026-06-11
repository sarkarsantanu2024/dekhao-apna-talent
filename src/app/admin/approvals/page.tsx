"use client";

import { useMemo, useState } from "react";
import { toast } from "sonner";
import { CheckCheck, Loader2, UserCheck, CreditCard } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { PaymentActions } from "@/components/admin/payment-actions";
import { StudentActions } from "@/components/admin/student-actions";
import { confirm } from "@/components/ui/confirm-dialog";
import { formatCurrency, formatDate } from "@/lib/utils";
import { store, usePayments, useStudents } from "@/services";

/**
 * Unified "approvals queue" — admin's daily review screen. Pending students
 * and pending payments live in two side-by-side panels; checkboxes on rows
 * across both panels feed a single sticky bulk-action bar at the top.
 */
export default function ApprovalsPage() {
  const { data: students, loading: studentsLoading } = useStudents({ status: "pending" });
  const { data: payments, loading: paymentsLoading } = usePayments({ status: "pending" });

  const [selStudents, setSelStudents] = useState<Set<string>>(new Set());
  const [selPayments, setSelPayments] = useState<Set<string>>(new Set());
  const [busy, setBusy] = useState(false);

  const totalSelected = selStudents.size + selPayments.size;

  const allStudentsChecked = students.length > 0 && students.every((s) => selStudents.has(s.id));
  const someStudentsChecked = students.some((s) => selStudents.has(s.id)) && !allStudentsChecked;
  const allPaymentsChecked = payments.length > 0 && payments.every((p) => selPayments.has(p.id));
  const somePaymentsChecked = payments.some((p) => selPayments.has(p.id)) && !allPaymentsChecked;

  const toggleAllStudents = () => {
    setSelStudents((prev) => {
      const next = new Set(prev);
      if (allStudentsChecked) students.forEach((s) => next.delete(s.id));
      else students.forEach((s) => next.add(s.id));
      return next;
    });
  };
  const toggleAllPayments = () => {
    setSelPayments((prev) => {
      const next = new Set(prev);
      if (allPaymentsChecked) payments.forEach((p) => next.delete(p.id));
      else payments.forEach((p) => next.add(p.id));
      return next;
    });
  };
  const toggleStudent = (id: string) => {
    setSelStudents((p) => {
      const n = new Set(p);
      if (n.has(id)) n.delete(id); else n.add(id);
      return n;
    });
  };
  const togglePayment = (id: string) => {
    setSelPayments((p) => {
      const n = new Set(p);
      if (n.has(id)) n.delete(id); else n.add(id);
      return n;
    });
  };
  const clearAll = () => { setSelStudents(new Set()); setSelPayments(new Set()); };

  const runBulk = async (kind: "approve" | "reject") => {
    const studentIds = Array.from(selStudents);
    const paymentIds = Array.from(selPayments);
    if (studentIds.length === 0 && paymentIds.length === 0) return;
    if (kind === "reject" && !(await confirm({
      title: `Reject ${totalSelected} item${totalSelected !== 1 ? "s" : ""}?`,
      description: "The selected submissions will be marked as rejected.",
      confirmText: "Reject",
      destructive: true,
    }))) return;

    const note = kind === "reject"
      ? window.prompt("Reason for rejection (optional):") ?? undefined
      : undefined;

    setBusy(true);
    let done = 0;
    try {
      for (const id of studentIds) {
        await store.updateStudent(id, { status: kind === "approve" ? "approved" : "rejected" });
        done++;
      }
      for (const id of paymentIds) {
        if (kind === "approve") await store.approvePayment(id);
        else await store.rejectPayment(id, note);
        done++;
      }
      toast.success(
        `${kind === "approve" ? "Approved" : "Rejected"} ${done} item(s)` +
        (studentIds.length && paymentIds.length
          ? ` · ${studentIds.length} student${studentIds.length === 1 ? "" : "s"} + ${paymentIds.length} payment${paymentIds.length === 1 ? "" : "s"}`
          : ""),
      );
      clearAll();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : `Bulk ${kind} failed after ${done}`);
    } finally {
      setBusy(false);
    }
  };

  const loading = studentsLoading || paymentsLoading;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-2">
        <div>
          <h1 className="text-2xl font-bold">Approvals queue</h1>
          <p className="text-sm text-muted-foreground">
            Review pending students and payments. Tick rows across either panel and approve them all in one go.
          </p>
        </div>
      </div>

      {/* Sticky bulk action bar */}
      {totalSelected > 0 && (
        <div className="sticky top-16 z-20 flex flex-wrap items-center justify-between gap-3 rounded-lg border bg-primary/10 px-4 py-2.5 shadow-sm">
          <span className="text-sm font-medium">
            {totalSelected} selected
            {selStudents.size > 0 && selPayments.size > 0 && (
              <span className="text-muted-foreground"> · {selStudents.size} students + {selPayments.size} payments</span>
            )}
          </span>
          <div className="flex flex-wrap gap-2">
            <Button size="sm" disabled={busy} onClick={() => runBulk("approve")} className="gap-1.5">
              {busy ? <Loader2 className="size-3.5 animate-spin" /> : <CheckCheck className="size-3.5" />}
              {busy ? "Working…" : `Approve ${totalSelected}`}
            </Button>
            <Button size="sm" variant="outline" disabled={busy} onClick={() => runBulk("reject")}>
              Reject {totalSelected}
            </Button>
            <Button size="sm" variant="ghost" disabled={busy} onClick={clearAll}>Clear</Button>
          </div>
        </div>
      )}

      {/* Pending students */}
      <Card>
        <CardHeader>
          <div className="flex flex-wrap items-baseline justify-between gap-2">
            <CardTitle className="inline-flex items-center gap-2">
              <UserCheck className="size-4 text-primary" />
              Pending students ({students.length})
            </CardTitle>
            <CardDescription>Centres added these students — confirm the details look right.</CardDescription>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-8">
                  <Checkbox
                    checked={allStudentsChecked ? true : someStudentsChecked ? "indeterminate" : false}
                    onCheckedChange={toggleAllStudents}
                    disabled={students.length === 0}
                    aria-label="Select all pending students"
                  />
                </TableHead>
                <TableHead>Roll</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Centre</TableHead>
                <TableHead>Added</TableHead>
                <TableHead className="text-right">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading && students.length === 0 ? (
                <TableRow><TableCell colSpan={7} className="text-center text-muted-foreground">Loading…</TableCell></TableRow>
              ) : students.length === 0 ? (
                <TableRow><TableCell colSpan={7} className="text-center text-muted-foreground">No students pending. 🎉</TableCell></TableRow>
              ) : students.map((s) => (
                <TableRow key={s.id} data-state={selStudents.has(s.id) ? "selected" : undefined}>
                  <TableCell>
                    <Checkbox
                      checked={selStudents.has(s.id)}
                      onCheckedChange={() => toggleStudent(s.id)}
                      aria-label={`Select ${s.full_name}`}
                    />
                  </TableCell>
                  <TableCell className="font-mono text-xs">{s.roll_number}</TableCell>
                  <TableCell className="font-medium">{s.full_name}</TableCell>
                  <TableCell>{s.category_name}</TableCell>
                  <TableCell>{s.center_name}</TableCell>
                  <TableCell className="text-muted-foreground">{formatDate(s.created_at)}</TableCell>
                  <TableCell className="text-right">
                    <div className="inline-flex">
                      <StudentActions id={s.id} name={s.full_name} />
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Pending payments */}
      <Card>
        <CardHeader>
          <div className="flex flex-wrap items-baseline justify-between gap-2">
            <CardTitle className="inline-flex items-center gap-2">
              <CreditCard className="size-4 text-primary" />
              Pending payments ({payments.length})
            </CardTitle>
            <CardDescription>Cross-check each screenshot against your bank or UPI statement.</CardDescription>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-8">
                  <Checkbox
                    checked={allPaymentsChecked ? true : somePaymentsChecked ? "indeterminate" : false}
                    onCheckedChange={toggleAllPayments}
                    disabled={payments.length === 0}
                    aria-label="Select all pending payments"
                  />
                </TableHead>
                <TableHead>Centre</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Ref</TableHead>
                <TableHead>Screenshot</TableHead>
                <TableHead>Submitted</TableHead>
                <TableHead className="text-right">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading && payments.length === 0 ? (
                <TableRow><TableCell colSpan={7} className="text-center text-muted-foreground">Loading…</TableCell></TableRow>
              ) : payments.length === 0 ? (
                <TableRow><TableCell colSpan={7} className="text-center text-muted-foreground">No payments pending. 🎉</TableCell></TableRow>
              ) : payments.map((p) => (
                <TableRow key={p.id} data-state={selPayments.has(p.id) ? "selected" : undefined}>
                  <TableCell>
                    <Checkbox
                      checked={selPayments.has(p.id)}
                      onCheckedChange={() => togglePayment(p.id)}
                      aria-label={`Select payment from ${p.center_name}`}
                    />
                  </TableCell>
                  <TableCell>{p.center_name}</TableCell>
                  <TableCell>{formatCurrency(p.amount)}</TableCell>
                  <TableCell className="font-mono text-xs">{p.transaction_ref ?? "—"}</TableCell>
                  <TableCell><a href={p.screenshot_url} target="_blank" rel="noreferrer" className="text-primary hover:underline">Open</a></TableCell>
                  <TableCell className="text-muted-foreground">{formatDate(p.created_at)}</TableCell>
                  <TableCell className="text-right">
                    <div className="inline-flex">
                      <PaymentActions id={p.id} />
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
