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
  address: "",
  city: "",
  state: "West Bengal",
  pincode: "",
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
        address: editing.address ?? "",
        city: editing.city ?? "",
        state: editing.state ?? "West Bengal",
        pincode: editing.pincode ?? "",
      });
    } else {
      setForm({ ...blank });
    }
  }, [editing, open]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.center_name.trim()) return toast.error("Centre name is required");
    setBusy(true);
    try {
      const payload = {
        center_name: form.center_name,
        owner_name: form.owner_name || null,
        phone: form.phone || null,
        address: form.address || null,
        city: form.city || null,
        state: form.state || null,
        pincode: form.pincode || null,
      };
      if (editing) {
        await store.updateCenter(editing.id, payload);
        toast.success("Centre updated");
      } else {
        await store.createCenter(payload);
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
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{editing ? "Edit centre" : "New centre"}</DialogTitle>
        </DialogHeader>
        <form onSubmit={submit} className="grid gap-4">
          <Field label="Centre name">
            <Input value={form.center_name} onChange={(e) => setForm({ ...form, center_name: e.target.value })} required />
          </Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Owner"><Input value={form.owner_name} onChange={(e) => setForm({ ...form, owner_name: e.target.value })} /></Field>
            <Field label="Phone"><Input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} /></Field>
          </div>
          <Field label="Address"><Input value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} /></Field>
          <div className="grid grid-cols-3 gap-3">
            <Field label="City"><Input value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} /></Field>
            <Field label="State"><Input value={form.state} onChange={(e) => setForm({ ...form, state: e.target.value })} /></Field>
            <Field label="Pincode"><Input value={form.pincode} onChange={(e) => setForm({ ...form, pincode: e.target.value })} /></Field>
          </div>
          <DialogFooter>
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
