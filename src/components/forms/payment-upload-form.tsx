"use client";
import { useState, useTransition } from "react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function PaymentUploadForm() {
  const router = useRouter();
  const [pending, start] = useTransition();
  const [file, setFile] = useState<File | null>(null);
  const [amount, setAmount] = useState("");
  const [ref, setRef] = useState("");

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) { toast.error("Choose a screenshot"); return; }
    if (!amount) { toast.error("Enter amount"); return; }
    start(async () => {
      const fd = new FormData();
      fd.append("file", file);
      fd.append("bucket", "payment-screenshots");
      const up = await fetch("/api/upload", { method: "POST", body: fd });
      if (!up.ok) { toast.error("Upload failed"); return; }
      const { url } = await up.json();

      const res = await fetch("/api/payments", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ amount: Number(amount), transaction_ref: ref || undefined, screenshot_url: url }),
      });
      const json = await res.json();
      if (!res.ok) { toast.error(json.error ?? "Could not submit"); return; }
      toast.success("Screenshot submitted — awaiting admin approval");
      router.push("/center/payments");
      router.refresh();
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
