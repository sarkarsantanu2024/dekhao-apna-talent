"use client";

import { useTransition } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { store } from "@/services";

export function PaymentActions({ id }: { id: string }) {
  const [pending, start] = useTransition();

  const act = (kind: "approve" | "reject") =>
    start(async () => {
      const note =
        kind === "reject"
          ? window.prompt("Reason for rejection (optional):") ?? undefined
          : undefined;
      try {
        if (kind === "approve") await store.approvePayment(id, note);
        else await store.rejectPayment(id, note);
        toast.success(kind === "approve" ? "Payment approved" : "Payment rejected");
      } catch (err) {
        toast.error(err instanceof Error ? err.message : "Action failed");
      }
    });

  return (
    <div className="flex gap-2">
      <Button size="sm" disabled={pending} onClick={() => act("approve")}>Approve</Button>
      <Button size="sm" variant="outline" disabled={pending} onClick={() => act("reject")}>Reject</Button>
    </div>
  );
}
