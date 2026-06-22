"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

/**
 * Enquiry form. No backend yet (data flow unchanged) — it opens the user's
 * mail client pre-filled and confirms with a toast. Wire to an API/Supabase
 * later by replacing the submit handler.
 */
export function ContactForm() {
  const [sending, setSending] = useState(false);

  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSending(true);
    const data = new FormData(e.currentTarget);
    const name = String(data.get("name") ?? "");
    const email = String(data.get("email") ?? "");
    const phone = String(data.get("phone") ?? "");
    const message = String(data.get("message") ?? "");
    const body = `Name: ${name}%0DPhone: ${phone}%0DEmail: ${email}%0D%0D${message}`;
    window.location.href = `mailto:info@dekhaoapnatalent.com?subject=Enquiry from ${encodeURIComponent(name)}&body=${body}`;
    toast.success("Opening your mail app — we'll reply soon!");
    setSending(false);
    e.currentTarget.reset();
  }

  return (
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
  );
}
