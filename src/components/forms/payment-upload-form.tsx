"use client";

import { useMemo, useState, useTransition } from "react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { FileUpload } from "@/components/ui/file-upload";
import { store, useCenters, useStudents, usePayments } from "@/services";
import { uploadFile } from "@/lib/upload";

export function PaymentUploadForm() {
  const router = useRouter();
  const { data: session } = useSession();
  const [pending, start] = useTransition();
  const [file, setFile] = useState<File | null>(null);
  const [amount, setAmount] = useState("");
  const [ref, setRef] = useState("");
  const [studentId, setStudentId] = useState("");

  const { data: centers } = useCenters();
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

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!myCenter) return toast.error("No centre available");
    if (!studentId) return toast.error("Pick the student this payment is for");
    if (!file) return toast.error("Choose a screenshot");
    if (!amount) return toast.error("Enter amount");
    if (file.size > 5 * 1024 * 1024) return toast.error("Max 5 MB");

    const student = students.find((s) => s.id === studentId);
    if (!student) return toast.error("Pick a valid student");

    start(async () => {
      try {
        const screenshot_url = await uploadFile(file, "payment-screenshots");
        await store.createPayment({
          center_id: myCenter.id,
          center_name: myCenter.center_name,
          student_id: student.id,
          student_name: student.full_name,
          uploaded_by: null,
          amount: Number(amount),
          transaction_ref: ref || null,
          screenshot_url,
        });
        toast.success("Screenshot submitted — awaiting admin approval");
        setFile(null);
        setAmount("");
        setRef("");
        setStudentId("");
        router.push("/center/payments");
      } catch (err) {
        toast.error(err instanceof Error ? err.message : "Could not submit");
      }
    });
  };

  return (
    <form onSubmit={submit} className="space-y-4">
      <div className="space-y-2">
        <Label>Student *</Label>
        <select
          className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm"
          value={studentId}
          onChange={(e) => setStudentId(e.target.value)}
          required
        >
          <option value="" disabled>Select the student this payment is for…</option>
          {payableStudents.map((s) => (
            <option key={s.id} value={s.id}>
              {s.full_name}{s.roll_number ? ` · ${s.roll_number}` : ""}
            </option>
          ))}
        </select>
        {payableStudents.length === 0 && (
          <p className="text-xs text-muted-foreground">
            Every student already has a submitted payment. Add a new student first, or wait for review.
          </p>
        )}
      </div>
      <div className="space-y-2">
        <Label>Amount (₹)</Label>
        <Input type="number" min={1} step="1" value={amount} onChange={(e) => setAmount(e.target.value)} required />
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
        {pending ? "Submitting…" : "Submit for approval"}
      </Button>
    </form>
  );
}
