"use client";

import { useState } from "react";
import Link from "next/link";
import { toast } from "sonner";
import { Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";

/**
 * Enquiry form. Submissions are stored in Supabase via the public
 * /api/enquiries route; admins read them on /admin/enquiries. On success a
 * confirmation modal is shown instead of a toast.
 */
export function ContactForm() {
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [sentName, setSentName] = useState("");

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const data = new FormData(form);
    const payload = {
      name: String(data.get("name") ?? "").trim(),
      email: String(data.get("email") ?? "").trim(),
      phone: String(data.get("phone") ?? "").trim(),
      message: String(data.get("message") ?? "").trim(),
    };

    setSending(true);
    try {
      const res = await fetch("/api/enquiries", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const json = (await res.json().catch(() => ({}))) as { error?: string };
      if (!res.ok) throw new Error(json.error ?? "Could not send your enquiry.");
      setSentName(payload.name.split(" ")[0] ?? "");
      setSent(true);
      form.reset();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not send your enquiry.");
    } finally {
      setSending(false);
    }
  }

  return (
    <>
      <form onSubmit={onSubmit} className="space-y-4">
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="c-name">Name</Label>
            <Input id="c-name" name="name" required placeholder="Your name" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="c-phone">Phone</Label>
            <Input id="c-phone" name="phone" placeholder="Phone number" />
          </div>
        </div>
        <div className="space-y-2">
          <Label htmlFor="c-email">Email</Label>
          <Input id="c-email" name="email" type="email" required placeholder="you@example.com" />
        </div>
        <div className="space-y-2">
          <Label htmlFor="c-message">Message</Label>
          <Textarea id="c-message" name="message" required rows={5} placeholder="How can we help?" />
        </div>
        <Button type="submit" variant="fun" size="lg" disabled={sending} className="w-full">
          {sending ? "Sending…" : "Send enquiry"}
        </Button>
      </form>

      <Dialog open={sent} onOpenChange={setSent}>
        <DialogContent className="max-w-md overflow-hidden border-border bg-background p-0">
          {/* Warm header band with an animated confirmation mark */}
          <div className="relative overflow-hidden bg-band-butter px-8 pb-8 pt-11 text-center">
            <div
              aria-hidden
              className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(circle_at_50%_0%,rgba(199,146,51,0.22),transparent_60%)]"
            />
            <span className="mx-auto flex size-16 animate-pop-in items-center justify-center rounded-full bg-gold text-white shadow-gold">
              <Check className="size-8" strokeWidth={2.75} />
            </span>
            <DialogTitle className="mt-6 font-display text-3xl font-semibold tracking-tight text-foreground">
              Message sent<span className="text-gold-deep">.</span>
            </DialogTitle>
            <DialogDescription className="mx-auto mt-3 max-w-xs text-base leading-relaxed text-muted-foreground">
              {sentName ? (
                <>Thank you, <strong className="font-semibold text-gold-deep">{sentName}</strong> — </>
              ) : (
                "Thank you — "
              )}
              we&apos;ve received your enquiry and our team will get back to you shortly.
            </DialogDescription>
          </div>

          <div className="px-8 pb-8 pt-1">
            <Button
              type="button"
              variant="fun"
              size="lg"
              className="w-full"
              autoFocus
              onClick={() => setSent(false)}
            >
              Done
            </Button>
            <p className="mt-4 text-center text-xs text-muted-foreground">
              Meanwhile, explore the{" "}
              <Link
                href="/categories"
                onClick={() => setSent(false)}
                className="font-medium text-gold-deep underline-offset-2 hover:underline"
              >
                categories
              </Link>{" "}
              &amp;{" "}
              <Link
                href="/prizes"
                onClick={() => setSent(false)}
                className="font-medium text-gold-deep underline-offset-2 hover:underline"
              >
                prizes
              </Link>
              .
            </p>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
