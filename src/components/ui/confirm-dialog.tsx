"use client";

import { useEffect, useState } from "react";
import { AlertTriangle } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

export type ConfirmOptions = {
  title?: string;
  description?: string;
  confirmText?: string;
  cancelText?: string;
  /** Renders the confirm button in a red destructive style. */
  destructive?: boolean;
};

type Pending = ConfirmOptions & { resolve: (ok: boolean) => void };

let push: ((p: Pending) => void) | null = null;

/**
 * Promise-based replacement for `window.confirm`.
 * Usage: `if (!(await confirm({ title, description, destructive: true }))) return;`
 */
export function confirm(options: ConfirmOptions = {}): Promise<boolean> {
  return new Promise((resolve) => {
    if (!push) {
      // Provider not mounted — fail safe by resolving false.
      resolve(false);
      return;
    }
    push({ ...options, resolve });
  });
}

export function ConfirmProvider({ children }: { children: React.ReactNode }) {
  const [pending, setPending] = useState<Pending | null>(null);

  useEffect(() => {
    push = (p) => setPending(p);
    return () => {
      push = null;
    };
  }, []);

  const close = (ok: boolean) => {
    pending?.resolve(ok);
    setPending(null);
  };

  return (
    <>
      {children}
      <Dialog open={!!pending} onOpenChange={(o) => !o && close(false)}>
        <DialogContent className="theme-grey border bg-background text-foreground sm:max-w-md">
          <DialogHeader>
            <div className="flex items-start gap-3">
              <span
                className={
                  "flex size-10 shrink-0 items-center justify-center rounded-full " +
                  (pending?.destructive
                    ? "bg-destructive/10 text-destructive"
                    : "bg-primary/10 text-primary")
                }
              >
                <AlertTriangle className="size-5" />
              </span>
              <div className="grid gap-1.5">
                <DialogTitle>{pending?.title ?? "Are you sure?"}</DialogTitle>
                {pending?.description && (
                  <DialogDescription>{pending.description}</DialogDescription>
                )}
              </div>
            </div>
          </DialogHeader>
          <DialogFooter className="gap-2 sm:gap-2">
            <Button type="button" variant="outline" onClick={() => close(false)}>
              {pending?.cancelText ?? "Cancel"}
            </Button>
            <Button
              type="button"
              variant={pending?.destructive ? "destructive" : "default"}
              onClick={() => close(true)}
            >
              {pending?.confirmText ?? "Confirm"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
