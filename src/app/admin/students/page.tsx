"use client";

import { useMemo, useState } from "react";
import { toast } from "sonner";
import { Pencil, Trash2, X } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { StatusBadge } from "@/components/common/status-badge";
import { formatDate } from "@/lib/utils";
import { confirm } from "@/components/ui/confirm-dialog";
import { store, useStudents, useCenters, useCategories } from "@/services";
import type { Student, StudentStatus } from "@/types";
import { StudentDialog } from "@/components/admin/student-dialog";

const FILTERS: { value: StudentStatus | "all"; label: string }[] = [
  { value: "all",      label: "All" },
  { value: "pending",  label: "Pending" },
  { value: "approved", label: "Approved" },
  { value: "rejected", label: "Rejected" },
  { value: "active",   label: "Active" },
];

export default function AdminStudentsPage() {
  const { data: students, loading } = useStudents();
  const { data: centers } = useCenters();
  const { data: categories } = useCategories();
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<StudentStatus | "all">("all");
  const [editing, setEditing] = useState<Student | null>(null);
  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState<Set<string>>(new Set());

  const counts = useMemo(() => {
    const c: Record<string, number> = { all: students.length, pending: 0, approved: 0, rejected: 0, active: 0 };
    for (const s of students) c[s.status] = (c[s.status] ?? 0) + 1;
    return c;
  }, [students]);

  const filtered = useMemo(() => {
    let rows = filter === "all" ? students : students.filter((s) => s.status === filter);
    const q = query.trim().toLowerCase();
    if (q) {
      rows = rows.filter((s) =>
        [s.full_name, s.roll_number, s.center_name, s.category_name].some((v) => v?.toLowerCase().includes(q)),
      );
    }
    return rows;
  }, [students, filter, query]);

  const allSelected = filtered.length > 0 && filtered.every((s) => selected.has(s.id));

  const toggle = (id: string) =>
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  const toggleAll = () =>
    setSelected(allSelected ? new Set() : new Set(filtered.map((s) => s.id)));

  const onDelete = async (s: Student) => {
    if (!(await confirm({
      title: "Delete student?",
      description: `“${s.full_name}” will be permanently removed. This cannot be undone.`,
      confirmText: "Delete",
      destructive: true,
    }))) return;
    await store.deleteStudent(s.id);
    setSelected((prev) => { const n = new Set(prev); n.delete(s.id); return n; });
    toast.success("Student deleted");
  };

  const onBulkDelete = async () => {
    const ids = [...selected];
    if (!ids.length) return;
    if (!(await confirm({
      title: `Delete ${ids.length} student${ids.length !== 1 ? "s" : ""}?`,
      description: "The selected students will be permanently removed. This cannot be undone.",
      confirmText: "Delete",
      destructive: true,
    }))) return;
    let ok = 0;
    for (const id of ids) {
      try { await store.deleteStudent(id); ok++; } catch { /* skip failures */ }
    }
    setSelected(new Set());
    toast.success(`Deleted ${ok} student${ok !== 1 ? "s" : ""}`);
  };

  const onReject = async (s: Student) => {
    if (!(await confirm({
      title: "Reject student?",
      description: `“${s.full_name}” will be marked as rejected. The centre can edit and re-submit.`,
      confirmText: "Reject",
      destructive: true,
    }))) return;
    await store.updateStudent(s.id, { status: "rejected" });
    toast.success("Student rejected");
  };

  const onBulkReject = async () => {
    const ids = [...selected];
    if (!ids.length) return;
    if (!(await confirm({
      title: `Reject ${ids.length} student${ids.length !== 1 ? "s" : ""}?`,
      description: "The selected students will be marked as rejected.",
      confirmText: "Reject",
      destructive: true,
    }))) return;
    let ok = 0;
    for (const id of ids) {
      try { await store.updateStudent(id, { status: "rejected" }); ok++; } catch { /* skip failures */ }
    }
    setSelected(new Set());
    toast.success(`Rejected ${ok} student${ok !== 1 ? "s" : ""}`);
  };

  return (
    <Card>
      <CardHeader className="flex flex-row flex-wrap items-center justify-between gap-3">
        <CardTitle className="min-w-0">All students ({filtered.length})</CardTitle>
        {selected.size > 0 && (
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-sm text-muted-foreground">{selected.size} selected</span>
            <Button variant="outline" size="sm" className="gap-1.5 shrink-0" onClick={onBulkReject}>
              <X className="size-4" /> Reject
            </Button>
            <Button variant="destructive" size="sm" className="gap-1.5 shrink-0" onClick={onBulkDelete}>
              <Trash2 className="size-4" /> Delete
            </Button>
          </div>
        )}
      </CardHeader>

      <CardContent>
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <Input
            placeholder="Search name, roll, centre…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="h-9 w-full sm:w-72"
          />
          <div className="inline-flex flex-wrap gap-1 rounded-md border bg-background p-1">
            {FILTERS.map((f) => (
              <Button
                key={f.value}
                size="sm"
                variant={filter === f.value ? "default" : "ghost"}
                onClick={() => setFilter(f.value)}
                className="h-7 gap-1.5 px-3 text-xs"
              >
                {f.label}
                <span className={`rounded-full px-1.5 py-0.5 text-[10px] ${filter === f.value ? "bg-primary-foreground/20" : "bg-muted text-muted-foreground"}`}>
                  {counts[f.value] ?? 0}
                </span>
              </Button>
            ))}
          </div>
        </div>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-10">
                <Checkbox
                  checked={allSelected}
                  onCheckedChange={toggleAll}
                  disabled={filtered.length === 0}
                  aria-label="Select all"
                />
              </TableHead>
              <TableHead>Roll</TableHead><TableHead>Name</TableHead><TableHead>Category</TableHead>
              <TableHead>Centre</TableHead><TableHead>Status</TableHead><TableHead>Added</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading && filtered.length === 0 ? (
              <TableRow><TableCell colSpan={8} className="text-center text-muted-foreground">Loading…</TableCell></TableRow>
            ) : filtered.length === 0 ? (
              <TableRow><TableCell colSpan={8} className="text-center text-muted-foreground">
                {query ? "No students match your search." : `No ${filter === "all" ? "" : filter + " "}students.`}
              </TableCell></TableRow>
            ) : filtered.map((s) => (
              <TableRow key={s.id} data-state={selected.has(s.id) ? "selected" : undefined}>
                <TableCell>
                  <Checkbox
                    checked={selected.has(s.id)}
                    onCheckedChange={() => toggle(s.id)}
                    aria-label={`Select ${s.full_name}`}
                  />
                </TableCell>
                <TableCell className="font-mono text-xs">{s.roll_number}</TableCell>
                <TableCell className="font-medium">{s.full_name}</TableCell>
                <TableCell>{s.category_name}</TableCell>
                <TableCell>{s.center_name}</TableCell>
                <TableCell><StatusBadge status={s.status} /></TableCell>
                <TableCell className="text-muted-foreground">{formatDate(s.created_at)}</TableCell>
                <TableCell>
                  <div className="flex items-center justify-end gap-2">
                    {s.status !== "rejected" && (
                      <Button size="sm" variant="outline" className="gap-1.5" onClick={() => onReject(s)}>
                        <X className="size-3.5" /> Reject
                      </Button>
                    )}
                    <Button size="icon" variant="ghost" aria-label="Edit" onClick={() => { setEditing(s); setOpen(true); }}>
                      <Pencil className="size-4" />
                    </Button>
                    <Button size="icon" variant="ghost" aria-label="Delete" onClick={() => onDelete(s)}>
                      <Trash2 className="size-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>

      <StudentDialog
        open={open}
        onOpenChange={setOpen}
        editing={editing}
        centers={centers}
        categories={categories}
      />
    </Card>
  );
}
