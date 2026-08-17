"use client";

import Link from "next/link";
import { useState } from "react";
import { useSession } from "next-auth/react";
import { toast } from "sonner";
import { Pencil, Trash2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { StatusBadge } from "@/components/common/status-badge";
import { formatDate } from "@/lib/utils";
import { store, useCategories, useCenters, useStudents } from "@/services";
import { TEST_STUDENT_IDS } from "@/constants/test-data";
import { useShowTestData } from "@/lib/use-show-test-data";
import { StudentDialog } from "@/components/admin/student-dialog";
import { confirm } from "@/components/ui/confirm-dialog";
import type { Student } from "@/types";

export default function CenterStudentsPage() {
  const { data: session } = useSession();
  const { data: centers } = useCenters();
  const { data: categories } = useCategories();
  // Resolve the centre this owner is logged into via the session, falling back
  // to the first centre only if the session has no centre pinned.
  const sessionCenterId = session?.user?.centerId ?? null;
  const myCenter = centers.find((c) => c.id === sessionCenterId) ?? centers[0] ?? null;
  const centerId = myCenter?.id;
  const { data: allRows, loading } = useStudents({ centerId });
  const [showTestData] = useShowTestData();
  const rows = showTestData ? allRows : allRows.filter((r) => !TEST_STUDENT_IDS.has(r.id));

  const [editing, setEditing] = useState<Student | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selected, setSelected] = useState<Set<string>>(new Set());

  // Active students have chest cards issued — they cannot be deleted.
  const deletable = rows.filter((r) => r.status !== "active");
  const allSelected = deletable.length > 0 && deletable.every((r) => selected.has(r.id));

  const toggle = (id: string) =>
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  const toggleAll = () =>
    setSelected(allSelected ? new Set() : new Set(deletable.map((r) => r.id)));

  const onBulkDelete = async () => {
    const ids = [...selected].filter((id) => rows.find((r) => r.id === id)?.status !== "active");
    if (!ids.length) return;
    if (!(await confirm({
      title: `Delete ${ids.length} student${ids.length !== 1 ? "s" : ""}?`,
      description: "The selected students will be permanently removed. This cannot be undone.",
      confirmText: "Delete",
      destructive: true,
    }))) return;
    let ok = 0;
    for (const id of ids) {
      try {
        await store.deleteStudent(id);
        ok++;
      } catch {
        /* skip failures */
      }
    }
    setSelected(new Set());
    toast.success(`Deleted ${ok} student${ok !== 1 ? "s" : ""}`);
  };

  const onEdit = (s: Student) => {
    setEditing(s);
    setDialogOpen(true);
  };

  const onDelete = async (s: Student) => {
    if (s.status === "active") {
      toast.error("This student already has a chest card issued — please contact admin to remove.");
      return;
    }
    if (!(await confirm({
      title: "Delete student?",
      description: `“${s.full_name}” will be permanently removed. This cannot be undone.`,
      confirmText: "Delete",
      destructive: true,
    }))) return;
    try {
      await store.deleteStudent(s.id);
      toast.success("Student deleted");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Delete failed");
    }
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>My students ({rows.length})</CardTitle>
        <div className="flex items-center gap-2">
          {selected.size > 0 && (
            <Button variant="destructive" size="sm" className="gap-1.5" onClick={onBulkDelete}>
              <Trash2 className="size-4" /> Delete selected ({selected.size})
            </Button>
          )}
          <Button asChild><Link href="/center/students/new">+ Add student</Link></Button>
        </div>
      </CardHeader>
      <CardContent>
        {/* Mobile: app-style card list */}
        <div className="space-y-3 md:hidden">
          {loading && rows.length === 0 ? (
            <p className="py-8 text-center text-sm text-muted-foreground">Loading…</p>
          ) : rows.length === 0 ? (
            <p className="py-8 text-center text-sm text-muted-foreground">No students yet — add your first.</p>
          ) : rows.map((s) => (
            <div
              key={s.id}
              className={`rounded-lg border bg-card p-4 shadow-sm ${selected.has(s.id) ? "border-primary/50 bg-muted/30" : ""}`}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex min-w-0 items-start gap-3">
                  <Checkbox
                    checked={selected.has(s.id)}
                    onCheckedChange={() => toggle(s.id)}
                    disabled={s.status === "active"}
                    aria-label={`Select ${s.full_name}`}
                    className="mt-1"
                  />
                  <div className="min-w-0">
                    <p className="truncate font-medium">{s.full_name}</p>
                    <p className="font-mono text-[11px] text-muted-foreground">{s.roll_number}</p>
                  </div>
                </div>
                <StatusBadge status={s.status} kind="student" />
              </div>
              <div className="mt-2 space-y-0.5 text-xs text-muted-foreground">
                <p className="truncate">{s.category_name}</p>
                <p>{s.phone ?? "—"} · Added {formatDate(s.created_at)}</p>
                {s.status === "rejected" && s.review_note && (
                  <p className="whitespace-normal wrap-break-word text-rose-600">“{s.review_note}”</p>
                )}
              </div>
              <div className="mt-3 flex items-center justify-end gap-2 border-t pt-2.5">
                <Button size="icon" variant="ghost" aria-label="Edit" onClick={() => onEdit(s)}>
                  <Pencil className="size-4" />
                </Button>
                <Button
                  size="icon"
                  variant="ghost"
                  aria-label="Delete"
                  onClick={() => onDelete(s)}
                  title={s.status === "active" ? "Cannot delete — chest card issued" : "Delete student"}
                  disabled={s.status === "active"}
                >
                  <Trash2 className="size-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>

        {/* Desktop: full table */}
        <div className="hidden md:block">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-10">
                <Checkbox
                  checked={allSelected}
                  onCheckedChange={toggleAll}
                  disabled={deletable.length === 0}
                  aria-label="Select all"
                />
              </TableHead>
              <TableHead>Roll</TableHead>
              <TableHead>Name</TableHead>
              <TableHead>Phone</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Added</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading && rows.length === 0 ? (
              <TableRow><TableCell colSpan={8} className="text-center text-muted-foreground">Loading…</TableCell></TableRow>
            ) : rows.length === 0 ? (
              <TableRow><TableCell colSpan={8} className="text-center text-muted-foreground">No students yet — add your first.</TableCell></TableRow>
            ) : rows.map((s) => (
              <TableRow key={s.id} data-state={selected.has(s.id) ? "selected" : undefined}>
                <TableCell>
                  <Checkbox
                    checked={selected.has(s.id)}
                    onCheckedChange={() => toggle(s.id)}
                    disabled={s.status === "active"}
                    aria-label={`Select ${s.full_name}`}
                  />
                </TableCell>
                <TableCell className="font-mono text-xs">{s.roll_number}</TableCell>
                <TableCell className="font-medium">{s.full_name}</TableCell>
                <TableCell>{s.phone ?? "—"}</TableCell>
                <TableCell>{s.category_name}</TableCell>
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
                  <div className="flex items-center justify-end gap-1">
                    <Button size="icon" variant="ghost" aria-label="Edit" onClick={() => onEdit(s)}>
                      <Pencil className="size-4" />
                    </Button>
                    <Button
                      size="icon"
                      variant="ghost"
                      aria-label="Delete"
                      onClick={() => onDelete(s)}
                      title={s.status === "active" ? "Cannot delete — chest card issued" : "Delete student"}
                      disabled={s.status === "active"}
                    >
                      <Trash2 className="size-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        </div>
      </CardContent>

      {/* Edit dialog — centre-scoped */}
      <StudentDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        editing={editing}
        centers={myCenter ? [myCenter] : []}
        categories={categories}
        restrictToCenterId={myCenter?.id}
      />
    </Card>
  );
}
