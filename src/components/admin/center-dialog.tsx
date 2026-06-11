"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { store } from "@/services";
import type { Center } from "@/types";

type Props = {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  editing: Center | null;
};

const blank = {
  center_name: "",
  owner_name: "",
  phone: "",
  whatsapp: "",
  address: "",
  city: "",
  state: "West Bengal",
  pincode: "",
  start_date: "",
};

export function CenterDialog({ open, onOpenChange, editing }: Props) {
  const [form, setForm] = useState({ ...blank });
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (editing) {
      setForm({
        center_name: editing.center_name,
        owner_name: editing.owner_name ?? "",
        phone: editing.phone ?? "",
        whatsapp: editing.whatsapp ?? "",
        address: editing.address ?? "",
        city: editing.city ?? "",
        state: editing.state ?? "West Bengal",
        pincode: editing.pincode ?? "",
        start_date: editing.start_date ?? "",
      });
    } else {
      setForm({ ...blank });
    }
  }, [editing, open]);

  const set = <K extends keyof typeof form>(k: K, v: (typeof form)[K]) =>
    setForm((f) => ({ ...f, [k]: v }));

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.center_name.trim()) return toast.error("Centre name is required");
    setBusy(true);
    try {
      // `participating` is not edited here — it auto-flips to true once the
      // centre uploads a valid payment screenshot from their login.
      const payload = {
        center_name: form.center_name,
        owner_name: form.owner_name || null,
        phone: form.phone || null,
        whatsapp: form.whatsapp || null,
        address: form.address || null,
        city: form.city || null,
        state: form.state || null,
        pincode: form.pincode || null,
        start_date: form.start_date || null,
      };
      if (editing) {
        await store.updateCenter(editing.id, payload);
        toast.success("Centre updated");
      } else {
        await store.createCenter({ ...payload, participating: false });
        toast.success("Centre added");
      }
      onOpenChange(false);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Save failed");
    } finally {
      setBusy(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="theme-grey max-h-[90vh] overflow-y-auto border bg-background text-foreground sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>{editing ? "Edit centre" : "New centre"}</DialogTitle>
        </DialogHeader>
        <form onSubmit={submit} className="grid gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <Field label="Centre name *">
              <Input value={form.center_name} onChange={(e) => set("center_name", e.target.value)} required />
            </Field>
          </div>

          <Field label="Owner">
            <Input value={form.owner_name} onChange={(e) => set("owner_name", e.target.value)} />
          </Field>
          <Field label="Start date">
            <Input type="date" value={form.start_date} onChange={(e) => set("start_date", e.target.value)} />
          </Field>

          <Field label="Phone">
            <Input value={form.phone} onChange={(e) => set("phone", e.target.value)} />
          </Field>
          <Field label="WhatsApp number">
            <Input value={form.whatsapp} onChange={(e) => set("whatsapp", e.target.value)} placeholder="+91 …" />
          </Field>

          <div className="sm:col-span-2">
            <Field label="Address">
              <Input value={form.address} onChange={(e) => set("address", e.target.value)} />
            </Field>
          </div>

          <Field label="City">
            <Input value={form.city} onChange={(e) => set("city", e.target.value)} />
          </Field>
          <Field label="State">
            <Input value={form.state} onChange={(e) => set("state", e.target.value)} />
          </Field>
          <Field label="Pincode">
            <Input value={form.pincode} onChange={(e) => set("pincode", e.target.value)} />
          </Field>

          <DialogFooter className="sm:col-span-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
            <Button type="submit" disabled={busy}>{busy ? "Saving…" : editing ? "Save changes" : "Add centre"}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="grid gap-1.5">
      <Label className="text-xs uppercase tracking-wider text-muted-foreground">{label}</Label>
      {children}
    </div>
  );
}
