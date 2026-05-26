"use client";
import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";

export function PaymentActions({ id }: { id: string }) {
  const router = useRouter();
  const [pending, start] = useTransition();
  const act = (kind: "approve" | "reject") =>
    start(async () => {
      const note = kind === "reject" ? prompt("Reason for rejection (optional):") ?? undefined : undefined;
      const res = await fetch(`/api/payments/${id}/${kind}`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ note }),
      });
      if (!res.ok) { toast.error("Action failed"); return; }
      toast.success(kind === "approve" ? "Payment approved" : "Payment rejected");
      router.refresh();
    });
  return (
    <div className="flex gap-2">
      <Button size="sm" disabled={pending} onClick={() => act("approve")}>Approve</Button>
      <Button size="sm" variant="outline" disabled={pending} onClick={() => act("reject")}>Reject</Button>
    </div>
  );
}
