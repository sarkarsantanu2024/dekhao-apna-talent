"use client";

import { useTransition } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { store } from "@/services";

/**
 * Approve / Reject inline buttons for a single student row on the admin
 * students page. Mirrors the look & feel of PaymentActions.
 *
 * Reject prompts for an optional note (stored in updated_at trail; not
 * surfaced on the centre side yet — the Student type has no `review_note`
 * column. Add one to types/store/local-store later if you want to mirror
 * the rejection-note flow from payments).
 */
export function StudentActions({ id, name }: { id: string; name: string }) {
  const [pending, start] = useTransition();

  const act = (kind: "approve" | "reject") =>
    start(async () => {
      if (kind === "reject" && !window.confirm(`Reject ${name}?`)) return;
      try {
        await store.updateStudent(id, { status: kind === "approve" ? "approved" : "rejected" });
        toast.success(kind === "approve" ? "Student approved" : "Student rejected");
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
