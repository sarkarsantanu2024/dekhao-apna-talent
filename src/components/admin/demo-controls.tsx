"use client";

import { useState } from "react";
import { toast } from "sonner";
import { RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { store } from "@/services";

/**
 * Reset all demo data back to the original seed.
 * Only useful while the app runs against LocalStore — when wired to a real
 * backend, the store's `reset()` throws, which we catch and toast.
 */
export function DemoControls() {
  const [busy, setBusy] = useState(false);

  const onReset = async () => {
    if (!window.confirm("Wipe all demo data and re-seed?")) return;
    setBusy(true);
    try {
      await store.reset();
      toast.success("Demo data reset");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Reset failed");
    } finally {
      setBusy(false);
    }
  };

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={onReset}
      disabled={busy}
      aria-label="Reset demo data"
      className="gap-1.5"
    >
      <RotateCcw className="size-4" />
      <span className="hidden sm:inline">Reset demo data</span>
    </Button>
  );
}
