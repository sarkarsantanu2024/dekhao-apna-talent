"use client";

import { useMemo, useState, useTransition } from "react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { FileUpload } from "@/components/ui/file-upload";
import { formatCurrency } from "@/lib/utils";
import { store, useCenters, useStudents, usePayments, useCategories } from "@/services";
import { uploadFile } from "@/lib/upload";

/**
 * Centre owners usually pay HO one lump transfer covering several students,
 * so this form takes ONE screenshot for MANY students ("batch payment").
 * One payment row is still created per student (approval → chest card stays
 * unchanged); the rows share the screenshot URL + ref, which is what the
 * admin page uses to group them back into one batch.
 */
export function PaymentUploadForm() {
  const router = useRouter();
  const { data: session } = useSession();
  const [pending, start] = useTransition();
  const [file, setFile] = useState<File | null>(null);
  const [amount, setAmount] = useState("");
  const [ref, setRef] = useState("");
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  const { data: centers } = useCenters();
  const { data: categories } = useCategories();
  const sessionCenterId = session?.user?.centerId ?? null;
  const myCenter = centers.find((c) => c.id === sessionCenterId) ?? centers[0] ?? null;
  const { data: students } = useStudents({ centerId: myCenter?.id });
  const { data: payments } = usePayments({ centerId: myCenter?.id });

  // A student already covered by an approved/pending payment doesn't need another.
  const coveredIds = useMemo(
    () => new Set(payments.filter((p) => p.status !== "rejected" && p.student_id).map((p) => p.student_id)),
    [payments],
  );
  const payableStudents = useMemo(
    () => students.filter((s) => !coveredIds.has(s.id)),
    [students, coveredIds],
  );

  const feeOf = (categoryId: string | null): number =>
    categories.find((c) => c.id === categoryId)?.fee ?? 0;

  const selected = useMemo(
    () => payableStudents.filter((s) => selectedIds.has(s.id)),
    [payableStudents, selectedIds],
  );
  const feeTotal = useMemo(
    () => selected.reduce((sum, s) => sum + feeOf(s.category_id), 0),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [selected, categories],
  );

  const toggle = (id: string) =>
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });

  const single = selected.length === 1;

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!myCenter) return toast.error("No centre available");
    if (selected.length === 0) return toast.error("Tick the student(s) this payment covers");
    if (!file) return toast.error("Choose a screenshot");
    if (file.size > 5 * 1024 * 1024) return toast.error("Max 5 MB");
    if (single && !amount) return toast.error("Enter amount");

    start(async () => {
      try {
        // One upload → one URL shared by every row = the batch key.
        const screenshot_url = await uploadFile(file, "payment-screenshots");
        let ok = 0;
        for (const s of selected) {
          await store.createPayment({
            center_id: myCenter.id,
            center_name: myCenter.center_name,
            student_id: s.id,
            student_name: s.full_name,
            uploaded_by: null,
            // Single student keeps the free-typed amount (as before);
            // batches split by each student's category fee.
            amount: single ? Number(amount) : feeOf(s.category_id),
            transaction_ref: ref || null,
            screenshot_url,
          });
          ok++;
        }
        toast.success(
          ok === 1
            ? "Screenshot submitted — awaiting admin approval"
            : `Batch submitted — ${ok} students, one screenshot. Awaiting admin approval.`,
        );
        setFile(null);
        setAmount("");
        setRef("");
        setSelectedIds(new Set());
        router.push("/center/payments");
      } catch (err) {
        toast.error(err instanceof Error ? err.message : "Could not submit");
      }
    });
  };

  return (
    <form onSubmit={submit} className="space-y-4">
      <div className="space-y-2">
        <Label>Students covered by this payment *</Label>
        {payableStudents.length === 0 ? (
          <p className="text-xs text-muted-foreground">
            Every student already has a submitted payment. Add a new student first, or wait for review.
          </p>
        ) : (
          <div className="max-h-56 space-y-1 overflow-y-auto rounded-md border p-2">
            {payableStudents.map((s) => (
              <label
                key={s.id}
                className="flex cursor-pointer items-center gap-2.5 rounded-sm px-1.5 py-1.5 text-sm hover:bg-muted/50"
              >
                <Checkbox
                  checked={selectedIds.has(s.id)}
                  onCheckedChange={() => toggle(s.id)}
                  aria-label={`Select ${s.full_name}`}
                />
                <span className="min-w-0 flex-1 truncate">
                  {s.full_name}
                  <span className="text-muted-foreground"> · {s.category_name}</span>
                </span>
                <span className="shrink-0 text-xs tabular-nums text-muted-foreground">
                  {formatCurrency(feeOf(s.category_id))}
                </span>
              </label>
            ))}
          </div>
        )}
        {selected.length > 1 && (
          <p className="text-xs text-muted-foreground">
            One screenshot will cover all {selected.length} selected students.
          </p>
        )}
      </div>

      <div className="space-y-2">
        <Label>Amount (₹)</Label>
        {selected.length > 1 ? (
          <div className="flex h-12 items-center justify-between rounded-md border bg-muted/40 px-3 text-sm">
            <span className="text-muted-foreground">
              {selected.length} students × category fee
            </span>
            <span className="font-bold">{formatCurrency(feeTotal)}</span>
          </div>
        ) : (
          <Input
            type="number"
            min={1}
            step="1"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder={single ? String(feeOf(selected[0]?.category_id ?? null) || "") : undefined}
            required
          />
        )}
      </div>

      <div className="space-y-2">
        <Label>Transaction reference (optional)</Label>
        <Input value={ref} onChange={(e) => setRef(e.target.value)} />
      </div>

      <div className="space-y-2">
        <Label>Payment screenshot</Label>
        <FileUpload
          accept="image/*,application/pdf"
          onFile={setFile}
          fileName={file?.name}
          hint="PNG / JPG / PDF up to 5 MB"
        />
      </div>

      <Button type="submit" disabled={pending || payableStudents.length === 0} className="w-full">
        {pending
          ? "Submitting…"
          : selected.length > 1
            ? `Submit batch (${selected.length} students · ${formatCurrency(feeTotal)})`
            : "Submit for approval"}
      </Button>
    </form>
  );
}
