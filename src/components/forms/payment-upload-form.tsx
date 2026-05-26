"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { store, useCenters } from "@/services";

const fileToDataUrl = (file: File): Promise<string> =>
  new Promise((resolve, reject) => {
    const r = new FileReader();
    r.onload = () => resolve(String(r.result));
    r.onerror = () => reject(r.error);
    r.readAsDataURL(file);
  });

export function PaymentUploadForm() {
  const router = useRouter();
  const [pending, start] = useTransition();
  const [file, setFile] = useState<File | null>(null);
  const [amount, setAmount] = useState("");
  const [ref, setRef] = useState("");
  const { data: centers } = useCenters();
  const myCenter = centers[0] ?? null;

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) return toast.error("Choose a screenshot");
    if (!amount) return toast.error("Enter amount");
    if (file.size > 5 * 1024 * 1024) return toast.error("Max 5 MB");
    if (!myCenter) return toast.error("No centre available");

    start(async () => {
      try {
        const screenshot_url = await fileToDataUrl(file);
        await store.createPayment({
          center_id: myCenter.id,
          center_name: myCenter.center_name,
          uploaded_by: null,
          amount: Number(amount),
          transaction_ref: ref || null,
          screenshot_url,
        });
        toast.success("Screenshot submitted — awaiting admin approval");
        setFile(null);
        setAmount("");
        setRef("");
        router.push("/center/payments");
      } catch (err) {
        toast.error(err instanceof Error ? err.message : "Could not submit");
      }
    });
  };

  return (
    <form onSubmit={submit} className="space-y-4">
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
        <Input type="file" accept="image/*,application/pdf" onChange={(e) => setFile(e.target.files?.[0] ?? null)} required />
        <p className="text-xs text-muted-foreground">PNG/JPG/PDF up to 5 MB.</p>
      </div>
      <Button type="submit" disabled={pending} className="w-full">{pending ? "Submitting…" : "Submit for approval"}</Button>
    </form>
  );
}
