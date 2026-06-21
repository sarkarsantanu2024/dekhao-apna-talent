"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { FileUpload } from "@/components/ui/file-upload";
import { store } from "@/services";
import { uploadFile } from "@/lib/upload";
import type { Payment } from "@/types";

type Props = {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  payment: Payment | null;
};

export function PaymentEditDialog({ open, onOpenChange, payment }: Props) {
  const [file, setFile] = useState<File | null>(null);
  const [amount, setAmount] = useState("");
  const [ref, setRef] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (payment) {
      setAmount(String(payment.amount));
      setRef(payment.transaction_ref ?? "");
      setFile(null);
    }
  }, [payment, open]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!payment) return;
    if (!amount || Number(amount) <= 0) return toast.error("Enter a valid amount");
    if (file && file.size > 5 * 1024 * 1024) return toast.error("Max 5 MB");

    setBusy(true);
    try {
      const screenshot_url = file ? await uploadFile(file, "payment-screenshots") : undefined;
      await store.updatePayment(payment.id, {
        amount: Number(amount),
        transaction_ref: ref || null,
        screenshot_url,
      });
      toast.success("Payment updated");
      onOpenChange(false);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Update failed");
    } finally {
      setBusy(false);
    }
  };

  if (!payment) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="theme-grey border bg-background text-foreground sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Edit payment</DialogTitle>
          <DialogDescription>
            Correct the amount, reference, or screenshot for {payment.student_name ?? "this student"}.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={submit} className="grid gap-4">
          <div className="grid grid-cols-2 gap-3">
            <div className="grid gap-1.5">
              <Label>Amount (₹)</Label>
              <Input type="number" min={1} step="1" value={amount} onChange={(e) => setAmount(e.target.value)} />
            </div>
            <div className="grid gap-1.5">
              <Label>Transaction reference</Label>
              <Input value={ref} onChange={(e) => setRef(e.target.value)} />
            </div>
          </div>

          <div className="grid gap-1.5">
            <Label>Replace screenshot (optional)</Label>
            <FileUpload
              accept="image/*,application/pdf"
              onFile={setFile}
              fileName={file?.name}
              hint="Leave empty to keep the current screenshot · PNG / JPG / PDF up to 5 MB"
            />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
            <Button type="submit" disabled={busy}>{busy ? "Saving…" : "Save changes"}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
