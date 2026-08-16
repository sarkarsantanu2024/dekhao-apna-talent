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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { StatusBadge } from "@/components/common/status-badge";
import { formatDate } from "@/lib/utils";
import { confirm, prompt } from "@/components/ui/confirm-dialog";
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
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [centerFilter, setCenterFilter] = useState("all");
  const [sortBy, setSortBy] = useState<"newest" | "centre" | "category">("newest");
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
    if (categoryFilter !== "all") rows = rows.filter((s) => s.category_name === categoryFilter);
    if (centerFilter !== "all") rows = rows.filter((s) => s.center_name === centerFilter);
    const q = query.trim().toLowerCase();
    if (q) {
      rows = rows.filter((s) =>
        [s.full_name, s.roll_number, s.center_name, s.category_name].some((v) => v?.toLowerCase().includes(q)),
      );
    }
    if (sortBy === "centre") {
      rows = [...rows].sort(
        (a, b) => a.center_name.localeCompare(b.center_name) || a.category_name.localeCompare(b.category_name),
      );
    } else if (sortBy === "category") {
      rows = [...rows].sort(
        (a, b) => a.category_name.localeCompare(b.category_name) || a.center_name.localeCompare(b.center_name),
      );
    }
    return rows;
  }, [students, filter, categoryFilter, centerFilter, sortBy, query]);

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

  // Rejection always captures a reason — the centre is told to "edit &
  // re-submit", which is useless without knowing what to fix.
  const onReject = async (s: Student) => {
    const note = await prompt({
      title: "Reject student?",
      description: `“${s.full_name}” will be marked as rejected. Tell the centre what is wrong — they'll see this and can edit & re-submit.`,
      placeholder: "Reason (e.g. photo unclear — upload a passport-style portrait)",
      confirmText: "Reject",
      destructive: true,
    });
    if (note === null) return; // cancelled
    await store.updateStudent(s.id, { status: "rejected", review_note: note || null });
    toast.success("Student rejected — centre notified");
  };

  const onBulkReject = async () => {
    const ids = [...selected];
    if (!ids.length) return;
    const note = await prompt({
      title: `Reject ${ids.length} student${ids.length !== 1 ? "s" : ""}?`,
      description: "The selected students will be marked as rejected. This reason is sent to every affected centre.",
      placeholder: "Reason (e.g. photo unclear — upload a passport-style portrait)",
      confirmText: "Reject",
      destructive: true,
    });
    if (note === null) return; // cancelled
    let ok = 0;
    for (const id of ids) {
      try { await store.updateStudent(id, { status: "rejected", review_note: note || null }); ok++; } catch { /* skip failures */ }
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
          <div className="flex flex-wrap items-center gap-2">
            <Input
              placeholder="Search name, roll, centre…"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="h-9 w-full sm:w-64"
            />
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="h-9 w-44">
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All categories</SelectItem>
                {categories.map((c) => (
                  <SelectItem key={c.id} value={c.name}>{c.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={centerFilter} onValueChange={setCenterFilter}>
              <SelectTrigger className="h-9 w-44">
                <SelectValue placeholder="Centre" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All centres</SelectItem>
                {centers.map((c) => (
                  <SelectItem key={c.id} value={c.center_name}>{c.center_name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={sortBy} onValueChange={(v) => setSortBy(v as typeof sortBy)}>
              <SelectTrigger className="h-9 w-40">
                <SelectValue placeholder="Sort" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="newest">Newest first</SelectItem>
                <SelectItem value="centre">Centre (A–Z)</SelectItem>
                <SelectItem value="category">Category (A–Z)</SelectItem>
              </SelectContent>
            </Select>
          </div>
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
              <TableHead>Roll</TableHead><TableHead>Name</TableHead><TableHead>Phone</TableHead><TableHead>Category</TableHead>
              <TableHead>Centre</TableHead><TableHead>Status</TableHead><TableHead>Added</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading && filtered.length === 0 ? (
              <TableRow><TableCell colSpan={9} className="text-center text-muted-foreground">Loading…</TableCell></TableRow>
            ) : filtered.length === 0 ? (
              <TableRow><TableCell colSpan={9} className="text-center text-muted-foreground">
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
                <TableCell>{s.phone ?? "—"}</TableCell>
                <TableCell>{s.category_name}</TableCell>
                <TableCell>{s.center_name}</TableCell>
                <TableCell>
                  <div className="flex flex-col gap-0.5">
                    <StatusBadge status={s.status} kind="student" />
                    {s.status === "rejected" && s.review_note && (
                      <span className="block max-w-56 whitespace-normal wrap-break-word text-[11px] text-muted-foreground">“{s.review_note}”</span>
                    )}
                  </div>
                </TableCell>
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
