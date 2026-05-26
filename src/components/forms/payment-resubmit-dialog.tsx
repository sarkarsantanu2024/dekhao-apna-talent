"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { store } from "@/services";
import { formatCurrency, formatDate } from "@/lib/utils";
import type { Payment } from "@/types";

const fileToDataUrl = (file: File): Promise<string> =>
  new Promise((resolve, reject) => {
    const r = new FileReader();
    r.onload = () => resolve(String(r.result));
    r.onerror = () => reject(r.error);
    r.readAsDataURL(file);
  });

type Props = {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  payment: Payment | null;
};

export function PaymentResubmitDialog({ open, onOpenChange, payment }: Props) {
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
    if (!file) return toast.error("Pick a new screenshot");
    if (file.size > 5 * 1024 * 1024) return toast.error("Max 5 MB");

    setBusy(true);
    try {
      const screenshot_url = await fileToDataUrl(file);
      await store.resubmitPayment(payment.id, {
        screenshot_url,
        amount: Number(amount) || payment.amount,
        transaction_ref: ref || null,
      });
      toast.success("Resubmitted — awaiting admin verification");
      onOpenChange(false);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Resubmit failed");
    } finally {
      setBusy(false);
    }
  };

  if (!payment) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Resubmit payment</DialogTitle>
          <DialogDescription>
            The admin rejected this submission on {formatDate(payment.reviewed_at ?? payment.created_at)}.
            Upload a fresh screenshot and the row moves back to pending.
          </DialogDescription>
        </DialogHeader>

        {/* Rejection reason */}
        <div className="rounded-md border border-destructive/40 bg-destructive/10 p-3 text-sm">
          <p className="text-xs font-semibold uppercase tracking-wider text-destructive">
            Admin&apos;s rejection note
          </p>
          <p className="mt-1 text-foreground">
            {payment.review_note?.trim() ? payment.review_note : "No reason provided. Re-upload a clearer screenshot."}
          </p>
        </div>

        <form onSubmit={submit} className="grid gap-4">
          <div className="grid grid-cols-2 gap-3">
            <div className="grid gap-1.5">
              <Label>Amount (₹)</Label>
              <Input
                type="number"
                min={1}
                step="1"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
              />
              <p className="text-[10px] text-muted-foreground">
                Previously {formatCurrency(payment.amount)}
              </p>
            </div>
            <div className="grid gap-1.5">
              <Label>Transaction reference</Label>
              <Input value={ref} onChange={(e) => setRef(e.target.value)} />
            </div>
          </div>

          <div className="grid gap-1.5">
            <Label>New payment screenshot</Label>
            <Input
              type="file"
              accept="image/*,application/pdf"
              onChange={(e) => setFile(e.target.files?.[0] ?? null)}
              required
            />
            <p className="text-xs text-muted-foreground">PNG / JPG / PDF up to 5 MB.</p>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
            <Button type="submit" disabled={busy}>
              {busy ? "Submitting…" : "Resubmit for verification"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
