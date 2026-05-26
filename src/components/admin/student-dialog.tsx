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
import type { Category, Center, Student, StudentStatus } from "@/types";

type Props = {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  editing: Student | null;
  centers: Center[];
  categories: Category[];
  /**
   * Centre-owner mode: locks the centre to the given id, hides the status
   * picker, and resets a `rejected` student's status back to `pending` on
   * save so admin re-reviews.
   */
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
  school_name: "",
  status: "pending" as StudentStatus,
};

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
        dob: editing.dob,
        age: editing.age,
        center_id: editing.center_id ?? "",
        category_id: editing.category_id ?? "",
        phone: editing.phone ?? "",
        school_name: editing.school_name ?? "",
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

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.full_name.trim()) return toast.error("Name is required");
    if (!form.center_id) return toast.error("Pick a centre");
    if (!form.category_id) return toast.error("Pick a category");

    const center = centers.find((c) => c.id === form.center_id);
    const category = categories.find((c) => c.id === form.category_id);
    if (!center || !category) return toast.error("Centre or category missing");

    setBusy(true);
    /**
     * Centre owners can't change status directly. If they edit a rejected
     * student the row goes back to pending so admin re-reviews; otherwise
     * status is preserved.
     */
    const nextStatus: StudentStatus = isCentreScoped
      ? (editing?.status === "rejected" ? "pending" : (editing?.status ?? "pending"))
      : form.status;

    try {
      if (editing) {
        await store.updateStudent(editing.id, {
          full_name: form.full_name,
          guardian_name: form.guardian_name,
          dob: form.dob,
          age: Number(form.age),
          center_id: center.id,
          center_name: center.center_name,
          category_id: category.id,
          category_name: category.name,
          phone: form.phone || null,
          school_name: form.school_name || null,
          status: nextStatus,
        });
        toast.success("Student updated");
      } else {
        await store.createStudent({
          full_name: form.full_name,
          guardian_name: form.guardian_name,
          dob: form.dob,
          age: Number(form.age),
          center_id: center.id,
          center_name: center.center_name,
          category_id: category.id,
          category_name: category.name,
          phone: form.phone || null,
          school_name: form.school_name || null,
          status: nextStatus,
          class: null,
          whatsapp: null,
          address: null,
          city: center.city,
          state: center.state,
          pincode: center.pincode,
          photo_url: null,
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
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{editing ? "Edit student" : "New student"}</DialogTitle>
        </DialogHeader>
        <form onSubmit={submit} className="grid gap-4">
          <Field label="Full name">
            <Input value={form.full_name} onChange={(e) => setForm({ ...form, full_name: e.target.value })} required />
          </Field>
          <Field label="Guardian">
            <Input value={form.guardian_name} onChange={(e) => setForm({ ...form, guardian_name: e.target.value })} />
          </Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Date of birth">
              <Input type="date" value={form.dob} onChange={(e) => setForm({ ...form, dob: e.target.value })} />
            </Field>
            <Field label="Age">
              <Input type="number" min={5} max={20} value={form.age} onChange={(e) => setForm({ ...form, age: Number(e.target.value) })} />
            </Field>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Centre">
              {isCentreScoped ? (
                <Input
                  value={centers.find((c) => c.id === form.center_id)?.center_name ?? ""}
                  readOnly
                />
              ) : (
                <select
                  className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm"
                  value={form.center_id}
                  onChange={(e) => setForm({ ...form, center_id: e.target.value })}
                >
                  {centers.map((c) => <option key={c.id} value={c.id}>{c.center_name}</option>)}
                </select>
              )}
            </Field>
            <Field label="Category">
              <select
                className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm"
                value={form.category_id}
                onChange={(e) => setForm({ ...form, category_id: e.target.value })}
              >
                {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </Field>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Phone">
              <Input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
            </Field>
            {isCentreScoped ? (
              <Field label="School">
                <Input value={form.school_name} onChange={(e) => setForm({ ...form, school_name: e.target.value })} />
              </Field>
            ) : (
              <Field label="Status">
                <select
                  className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm"
                  value={form.status}
                  onChange={(e) => setForm({ ...form, status: e.target.value as StudentStatus })}
                >
                  {STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
                </select>
              </Field>
            )}
          </div>
          {!isCentreScoped && (
            <Field label="School">
              <Input value={form.school_name} onChange={(e) => setForm({ ...form, school_name: e.target.value })} />
            </Field>
          )}
          <DialogFooter>
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
