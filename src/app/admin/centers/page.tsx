"use client";

import { useMemo, useState } from "react";
import { toast } from "sonner";
import { Plus, Pencil, Trash2, CheckCircle2, MinusCircle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { confirm } from "@/components/ui/confirm-dialog";
import { formatDate } from "@/lib/utils";
import { store, useCenters, useStudents } from "@/services";
import type { Center } from "@/types";
import { CenterDialog } from "@/components/admin/center-dialog";
import { CenterBulkUpload } from "@/components/forms/center-bulk-upload";

export default function CentersPage() {
  const { data: rows, loading } = useCenters();
  const { data: students } = useStudents();
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Center | null>(null);
  const [selected, setSelected] = useState<Set<string>>(new Set());

  // Active students per centre — counted from the full student list.
  const activeByCenter = useMemo(() => {
    const m = new Map<string, number>();
    for (const s of students) {
      if (s.status === "active" && s.center_id) m.set(s.center_id, (m.get(s.center_id) ?? 0) + 1);
    }
    return m;
  }, [students]);

  const allSelected = rows.length > 0 && rows.every((r) => selected.has(r.id));

  const toggle = (id: string) =>
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  const toggleAll = () =>
    setSelected(allSelected ? new Set() : new Set(rows.map((r) => r.id)));

  const onDelete = async (c: Center) => {
    if (!(await confirm({
      title: "Delete centre?",
      description: `“${c.center_name}” will be permanently removed. This cannot be undone.`,
      confirmText: "Delete",
      destructive: true,
    }))) return;
    await store.deleteCenter(c.id);
    setSelected((prev) => { const n = new Set(prev); n.delete(c.id); return n; });
    toast.success("Centre deleted");
  };

  const onBulkDelete = async () => {
    const ids = [...selected];
    if (!ids.length) return;
    if (!(await confirm({
      title: `Delete ${ids.length} centre${ids.length !== 1 ? "s" : ""}?`,
      description: "The selected centres will be permanently removed. This cannot be undone.",
      confirmText: "Delete",
      destructive: true,
    }))) return;
    let ok = 0;
    for (const id of ids) {
      try { await store.deleteCenter(id); ok++; } catch { /* skip failures */ }
    }
    setSelected(new Set());
    toast.success(`Deleted ${ok} centre${ok !== 1 ? "s" : ""}`);
  };

  return (
    <Card>
      <CardHeader className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <CardTitle className="min-w-0">Registered centres ({rows.length})</CardTitle>
        <div className="flex items-center gap-2">
          {selected.size > 0 && (
            <Button variant="destructive" size="sm" className="gap-1.5" onClick={onBulkDelete}>
              <Trash2 className="size-4" /> Delete selected ({selected.size})
            </Button>
          )}
          <Button size="sm" onClick={() => { setEditing(null); setOpen(true); }} className="gap-1.5 shrink-0">
            <Plus className="size-4" /> Add New centre
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <CenterBulkUpload />
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-10">
                <Checkbox
                  checked={allSelected}
                  onCheckedChange={toggleAll}
                  disabled={rows.length === 0}
                  aria-label="Select all"
                />
              </TableHead>
              <TableHead>Centre</TableHead>
              <TableHead>Owner</TableHead>
              <TableHead>Phone</TableHead>
              <TableHead>WhatsApp</TableHead>
              <TableHead>City</TableHead>
              <TableHead>Start Date</TableHead>
              <TableHead className="text-center">Active Students</TableHead>
              <TableHead className="text-center">Event</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading && rows.length === 0 ? (
              <TableRow><TableCell colSpan={10} className="text-center text-muted-foreground">Loading…</TableCell></TableRow>
            ) : rows.length === 0 ? (
              <TableRow><TableCell colSpan={10} className="text-center text-muted-foreground">No centres yet.</TableCell></TableRow>
            ) : rows.map((c) => (
              <TableRow key={c.id} data-state={selected.has(c.id) ? "selected" : undefined}>
                <TableCell>
                  <Checkbox
                    checked={selected.has(c.id)}
                    onCheckedChange={() => toggle(c.id)}
                    aria-label={`Select ${c.center_name}`}
                  />
                </TableCell>
                <TableCell className="font-medium">{c.center_name}</TableCell>
                <TableCell>{c.owner_name ?? "—"}</TableCell>
                <TableCell>{c.phone ?? "—"}</TableCell>
                <TableCell>{c.whatsapp ?? "—"}</TableCell>
                <TableCell>{c.city ?? "—"}</TableCell>
                <TableCell className="text-muted-foreground">{c.start_date ? formatDate(c.start_date) : "—"}</TableCell>
                <TableCell className="text-center font-medium">{activeByCenter.get(c.id) ?? 0}</TableCell>
                <TableCell className="text-center">
                  {c.participating ? (
                    <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-medium text-emerald-700">
                      <CheckCircle2 className="size-3.5" /> Participating
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 rounded-full bg-muted px-2 py-0.5 text-xs font-medium text-muted-foreground">
                      <MinusCircle className="size-3.5" /> Not participating
                    </span>
                  )}
                </TableCell>
                <TableCell>
                  <div className="flex justify-end gap-1">
                    <Button size="icon" variant="ghost" aria-label="Edit" onClick={() => { setEditing(c); setOpen(true); }}>
                      <Pencil className="size-4" />
                    </Button>
                    <Button size="icon" variant="ghost" aria-label="Delete" onClick={() => onDelete(c)}>
                      <Trash2 className="size-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
      <CenterDialog open={open} onOpenChange={setOpen} editing={editing} />
    </Card>
  );
}
