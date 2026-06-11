"use client";

import { useEffect, useRef, useState } from "react";
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
import { Textarea } from "@/components/ui/textarea";

export type ConfirmOptions = {
  title?: string;
  description?: string;
  confirmText?: string;
  cancelText?: string;
  /** Renders the confirm button in a red destructive style. */
  destructive?: boolean;
};

export type PromptOptions = ConfirmOptions & {
  placeholder?: string;
  defaultValue?: string;
};

type ConfirmPending = ConfirmOptions & { kind: "confirm"; resolve: (ok: boolean) => void };
type PromptPending = PromptOptions & { kind: "prompt"; resolve: (value: string | null) => void };
type Pending = ConfirmPending | PromptPending;

let push: ((p: Pending) => void) | null = null;

/**
 * Promise-based replacement for `window.confirm`.
 * Usage: `if (!(await confirm({ title, description, destructive: true }))) return;`
 */
export function confirm(options: ConfirmOptions = {}): Promise<boolean> {
  return new Promise((resolve) => {
    if (!push) return resolve(false);
    push({ ...options, kind: "confirm", resolve });
  });
}

/**
 * Promise-based replacement for `window.prompt`. Resolves the entered text, or
 * `null` if cancelled.
 */
export function prompt(options: PromptOptions = {}): Promise<string | null> {
  return new Promise((resolve) => {
    if (!push) return resolve(null);
    push({ ...options, kind: "prompt", resolve });
  });
}

export function ConfirmProvider({ children }: { children: React.ReactNode }) {
  const [pending, setPending] = useState<Pending | null>(null);
  const [value, setValue] = useState("");
  const inputRef = useRef<HTMLTextAreaElement | null>(null);

  useEffect(() => {
    push = (p) => {
      setValue(p.kind === "prompt" ? (p.defaultValue ?? "") : "");
      setPending(p);
    };
    return () => { push = null; };
  }, []);

  const finish = (result: boolean | string | null) => {
    if (pending) {
      if (pending.kind === "confirm") pending.resolve(result as boolean);
      else pending.resolve(result as string | null);
    }
    setPending(null);
  };

  const isPrompt = pending?.kind === "prompt";

  return (
    <>
      {children}
      <Dialog open={!!pending} onOpenChange={(o) => !o && finish(isPrompt ? null : false)}>
        <DialogContent className="theme-grey border bg-background text-foreground sm:max-w-md">
          <DialogHeader>
            <div className="flex items-start gap-3">
              <span
                className={
                  "flex size-10 shrink-0 items-center justify-center rounded-full " +
                  (pending?.destructive ? "bg-destructive/10 text-destructive" : "bg-primary/10 text-primary")
                }
              >
                <AlertTriangle className="size-5" />
              </span>
              <div className="grid gap-1.5">
                <DialogTitle>{pending?.title ?? "Are you sure?"}</DialogTitle>
                {pending?.description && <DialogDescription>{pending.description}</DialogDescription>}
              </div>
            </div>
          </DialogHeader>

          {isPrompt && (
            <Textarea
              ref={inputRef}
              rows={3}
              value={value}
              placeholder={(pending as PromptPending).placeholder}
              onChange={(e) => setValue(e.target.value)}
              autoFocus
            />
          )}

          <DialogFooter className="gap-2 sm:gap-2">
            <Button type="button" variant="outline" onClick={() => finish(isPrompt ? null : false)}>
              {pending?.cancelText ?? "Cancel"}
            </Button>
            <Button
              type="button"
              variant={pending?.destructive ? "destructive" : "default"}
              onClick={() => finish(isPrompt ? value : true)}
            >
              {pending?.confirmText ?? "Confirm"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
