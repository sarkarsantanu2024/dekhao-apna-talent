"use client";

import { useTransition } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { prompt } from "@/components/ui/confirm-dialog";
import { store } from "@/services";

export function PaymentActions({ id }: { id: string }) {
  const [pending, start] = useTransition();

  const act = (kind: "approve" | "reject") => {
    if (kind === "reject") {
      void (async () => {
        const note = await prompt({
          title: "Reject payment?",
          description: "Optionally tell the centre why, so they can re-submit.",
          placeholder: "Reason for rejection (optional)",
          confirmText: "Reject",
          destructive: true,
        });
        if (note === null) return; // cancelled
        start(async () => {
          try {
            await store.rejectPayment(id, note || undefined);
            toast.success("Payment rejected");
          } catch (err) {
            toast.error(err instanceof Error ? err.message : "Action failed");
          }
        });
      })();
      return;
    }
    start(async () => {
      try {
        await store.approvePayment(id);
        toast.success("Payment approved");
      } catch (err) {
        toast.error(err instanceof Error ? err.message : "Action failed");
      }
    });
  };

  return (
    <div className="flex gap-2">
      <Button size="sm" disabled={pending} onClick={() => act("approve")}>Approve</Button>
      <Button size="sm" variant="outline" disabled={pending} onClick={() => act("reject")}>Reject</Button>
    </div>
  );
}
