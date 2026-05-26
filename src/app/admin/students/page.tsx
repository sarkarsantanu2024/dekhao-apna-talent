"use client";

import { useMemo, useState } from "react";
import { toast } from "sonner";
import { Plus, Pencil, Trash2 } from "lucide-react";
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
import { StatusBadge } from "@/components/common/status-badge";
import { formatDate } from "@/lib/utils";
import { store, useStudents, useCenters, useCategories } from "@/services";
import type { Student, StudentStatus } from "@/types";
import { StudentDialog } from "@/components/admin/student-dialog";
import { StudentActions } from "@/components/admin/student-actions";

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

  const onDelete = async (s: Student) => {
    if (!window.confirm(`Delete ${s.full_name}? This cannot be undone.`)) return;
    await store.deleteStudent(s.id);
    toast.success("Student deleted");
  };

  return (
    <Card>
      <CardHeader className="flex flex-wrap items-center justify-between gap-3">
        <CardTitle>All students ({filtered.length})</CardTitle>
        <div className="flex flex-wrap items-center gap-2">
          <Input
            placeholder="Search name, roll, centre…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="h-9 w-64"
          />
          <Button size="sm" onClick={() => { setEditing(null); setOpen(true); }} className="gap-1.5">
            <Plus className="size-4" /> New student
          </Button>
        </div>
      </CardHeader>

      <div className="border-y bg-muted/40 px-6 py-3">
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

      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Roll</TableHead><TableHead>Name</TableHead><TableHead>Category</TableHead>
              <TableHead>Centre</TableHead><TableHead>Status</TableHead><TableHead>Added</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading && filtered.length === 0 ? (
              <TableRow><TableCell colSpan={7} className="text-center text-muted-foreground">Loading…</TableCell></TableRow>
            ) : filtered.length === 0 ? (
              <TableRow><TableCell colSpan={7} className="text-center text-muted-foreground">
                {query ? "No students match your search." : `No ${filter === "all" ? "" : filter + " "}students.`}
              </TableCell></TableRow>
            ) : filtered.map((s) => (
              <TableRow key={s.id}>
                <TableCell className="font-mono text-xs">{s.roll_number}</TableCell>
                <TableCell className="font-medium">{s.full_name}</TableCell>
                <TableCell>{s.category_name}</TableCell>
                <TableCell>{s.center_name}</TableCell>
                <TableCell><StatusBadge status={s.status} /></TableCell>
                <TableCell className="text-muted-foreground">{formatDate(s.created_at)}</TableCell>
                <TableCell>
                  <div className="flex items-center justify-end gap-2">
                    {s.status === "pending" && <StudentActions id={s.id} name={s.full_name} />}
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
