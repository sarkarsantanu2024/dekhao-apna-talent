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
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { FileUpload } from "@/components/ui/file-upload";
import { store } from "@/services";
import { calcAge } from "@/lib/utils";
import type { Category, Center, Student, StudentStatus } from "@/types";

type Props = {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  editing: Student | null;
  centers: Center[];
  categories: Category[];
  restrictToCenterId?: string;
};

const STATUSES: StudentStatus[] = ["pending", "approved", "rejected", "active"];

const blank = {
  full_name: "",
  guardian_name: "",
  dob: "",
  age: 7,
  center_id: "",
  category_id: "",
  phone: "",
  whatsapp: "",
  class: "",
  school_name: "",
  city: "",
  state: "",
  pincode: "",
  address: "",
  photo_url: "" as string | null,
  performance_topic: "",
  performance_details: "",
  status: "pending" as StudentStatus,
};

function readPhoto(file: File): Promise<string | null> {
  return new Promise((resolve) => {
    const r = new FileReader();
    r.onload = () => resolve(typeof r.result === "string" ? r.result : null);
    r.onerror = () => resolve(null);
    r.readAsDataURL(file);
  });
}

export function StudentDialog({
  open,
  onOpenChange,
  editing,
  centers,
  categories,
  restrictToCenterId,
}: Props) {
  const [form, setForm] = useState({ ...blank });
  const [busy, setBusy] = useState(false);
  const isCentreScoped = Boolean(restrictToCenterId);

  useEffect(() => {
    if (editing) {
      setForm({
        full_name: editing.full_name,
        guardian_name: editing.guardian_name,
        dob: editing.dob ?? "",
        age: editing.age,
        center_id: editing.center_id ?? "",
        category_id: editing.category_id ?? "",
        phone: editing.phone ?? "",
        whatsapp: editing.whatsapp ?? "",
        class: editing.class ?? "",
        school_name: editing.school_name ?? "",
        city: editing.city ?? "",
        state: editing.state ?? "",
        pincode: editing.pincode ?? "",
        address: editing.address ?? "",
        photo_url: editing.photo_url ?? "",
        performance_topic: editing.performance_topic ?? "",
        performance_details: editing.performance_details ?? "",
        status: editing.status,
      });
    } else {
      setForm({
        ...blank,
        center_id: restrictToCenterId ?? centers[0]?.id ?? "",
        category_id: categories[0]?.id ?? "",
      });
    }
  }, [editing, centers, categories, open, restrictToCenterId]);

  const set = <K extends keyof typeof form>(k: K, v: (typeof form)[K]) =>
    setForm((f) => ({ ...f, [k]: v }));

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.full_name.trim()) return toast.error("Name is required");
    if (!form.guardian_name.trim()) return toast.error("Guardian is required");
    if (!form.center_id) return toast.error("Pick a centre");
    if (!form.category_id) return toast.error("Pick a category");
    if (!form.class.trim()) return toast.error("Class is required");
    if (!form.school_name.trim()) return toast.error("School is required");
    if (!form.phone.trim()) return toast.error("Phone is required");
    if (!form.whatsapp.trim()) return toast.error("WhatsApp is required");
    if (!form.address.trim()) return toast.error("Address is required");
    if (!form.photo_url) return toast.error("Student photo is required");

    const center = centers.find((c) => c.id === form.center_id);
    const category = categories.find((c) => c.id === form.category_id);
    if (!center || !category) return toast.error("Centre or category missing");

    setBusy(true);
    // Centre submissions are auto-approved; editing a non-rejected student
    // keeps its current status. Admins (non-scoped) pick the status manually.
    const nextStatus: StudentStatus = isCentreScoped
      ? editing && editing.status !== "rejected" ? editing.status : "approved"
      : form.status;

    // Only the mandatory fields are edited here; city/state/pincode/performance
    // are left untouched on update (defaulted from the centre on create).
    const base = {
      full_name: form.full_name,
      guardian_name: form.guardian_name,
      dob: form.dob,
      age: Number(form.age),
      center_id: center.id,
      center_name: center.center_name,
      category_id: category.id,
      category_name: category.name,
      phone: form.phone,
      whatsapp: form.whatsapp,
      class: form.class,
      school_name: form.school_name,
      address: form.address,
      photo_url: form.photo_url || null,
      status: nextStatus,
    };

    try {
      if (editing) {
        await store.updateStudent(editing.id, base);
        toast.success("Student updated");
      } else {
        await store.createStudent({
          ...base,
          city: center.city,
          state: center.state,
          pincode: center.pincode,
          performance_topic: null,
          performance_details: null,
          created_by: null,
        });
        toast.success("Student added");
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
          <DialogTitle>{editing ? "Edit student" : "New student"}</DialogTitle>
        </DialogHeader>
        <form onSubmit={submit} className="grid gap-4 sm:grid-cols-2">
          <Field label="Full name *">
            <Input value={form.full_name} onChange={(e) => set("full_name", e.target.value)} required />
          </Field>
          <Field label="Guardian *">
            <Input value={form.guardian_name} onChange={(e) => set("guardian_name", e.target.value)} />
          </Field>

          <Field label="Date of birth">
            <Input
              type="date"
              value={form.dob}
              onChange={(e) => {
                const next = calcAge(e.target.value);
                setForm((f) => ({ ...f, dob: e.target.value, age: Number.isFinite(next) ? next : f.age }));
              }}
            />
          </Field>
          <Field label="Age">
            <Input type="number" min={5} max={20} value={form.age} onChange={(e) => set("age", Number(e.target.value))} />
          </Field>

          <Field label="Class *">
            <Input value={form.class} onChange={(e) => set("class", e.target.value)} placeholder="e.g. Class 4" />
          </Field>
          <Field label="School *">
            <Input value={form.school_name} onChange={(e) => set("school_name", e.target.value)} />
          </Field>

          <Field label="Centre *">
            {isCentreScoped ? (
              <Input value={centers.find((c) => c.id === form.center_id)?.center_name ?? ""} readOnly />
            ) : (
              <select
                className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm"
                value={form.center_id}
                onChange={(e) => set("center_id", e.target.value)}
              >
                {centers.map((c) => <option key={c.id} value={c.id}>{c.center_name}</option>)}
              </select>
            )}
          </Field>
          <Field label="Category *">
            <select
              className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm"
              value={form.category_id}
              onChange={(e) => set("category_id", e.target.value)}
            >
              {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </Field>

          <Field label="Phone *">
            <Input value={form.phone} onChange={(e) => set("phone", e.target.value)} />
          </Field>
          <Field label="WhatsApp *">
            <Input value={form.whatsapp} onChange={(e) => set("whatsapp", e.target.value)} />
          </Field>

          <div className="sm:col-span-2">
            <Field label="Photo *">
              <FileUpload
                accept="image/*"
                previewUrl={form.photo_url || null}
                fileName={form.photo_url ? "Photo attached" : null}
                hint="Portrait passport-style (head & shoulders). JPG/PNG — keep it small: ~400×500 px, under 100 KB. This photo is printed on the chest card."
                onFile={async (f) => {
                  if (!f) return set("photo_url", "");
                  if (f.size > 3 * 1024 * 1024) return toast.error("Max 3 MB");
                  const url = await readPhoto(f);
                  if (url) {
                    set("photo_url", url);
                    toast.success("Photo attached");
                  }
                }}
              />
            </Field>
          </div>

          <div className="sm:col-span-2">
            <Field label="Address *">
              <Textarea rows={2} value={form.address} onChange={(e) => set("address", e.target.value)} />
            </Field>
          </div>

          {!isCentreScoped && (
            <Field label="Status">
              <select
                className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm"
                value={form.status}
                onChange={(e) => set("status", e.target.value as StudentStatus)}
              >
                {STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
              </select>
            </Field>
          )}

          <DialogFooter className="sm:col-span-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
            <Button type="submit" disabled={busy}>{busy ? "Saving…" : editing ? "Save changes" : "Add student"}</Button>
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
