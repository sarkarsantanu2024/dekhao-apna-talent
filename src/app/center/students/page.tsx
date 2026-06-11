"use client";

import Link from "next/link";
import { useState } from "react";
import { toast } from "sonner";
import { Download, Loader2, Pencil, Trash2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { StatusBadge } from "@/components/common/status-badge";
import { formatDate } from "@/lib/utils";
import { store, useCategories, useCenters, useStudents } from "@/services";
import { downloadChestCard, isDownloadable } from "@/lib/pdf/generate-chest-card";
import { StudentDialog } from "@/components/admin/student-dialog";
import type { Student } from "@/types";

export default function CenterStudentsPage() {
  const { data: centers } = useCenters();
  const { data: categories } = useCategories();
  const myCenter = centers[0] ?? null;
  const centerId = myCenter?.id;
  const { data: rows, loading } = useStudents({ centerId });

  const [busyId, setBusyId] = useState<string | null>(null);
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
    if (!window.confirm(`Delete ${ids.length} student(s)? This cannot be undone.`)) return;
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

  const onDownload = async (s: Student) => {
    setBusyId(s.id);
    try {
      await downloadChestCard(s);
      toast.success(`Downloaded ${s.roll_number ?? s.full_name}`);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Download failed");
    } finally {
      setBusyId(null);
    }
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
    if (!window.confirm(`Delete ${s.full_name}? This cannot be undone.`)) return;
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
              <TableHead>Category</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Added</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading && rows.length === 0 ? (
              <TableRow><TableCell colSpan={7} className="text-center text-muted-foreground">Loading…</TableCell></TableRow>
            ) : rows.length === 0 ? (
              <TableRow><TableCell colSpan={7} className="text-center text-muted-foreground">No students yet — add your first.</TableCell></TableRow>
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
                <TableCell>{s.category_name}</TableCell>
                <TableCell><StatusBadge status={s.status} /></TableCell>
                <TableCell className="text-muted-foreground">{formatDate(s.created_at)}</TableCell>
                <TableCell>
                  <div className="flex items-center justify-end gap-1">
                    {isDownloadable(s) ? (
                      <Button
                        size="sm"
                        variant="outline"
                        className="gap-1.5"
                        onClick={() => onDownload(s)}
                        disabled={busyId === s.id}
                      >
                        {busyId === s.id ? <Loader2 className="size-3.5 animate-spin" /> : <Download className="size-3.5" />}
                        {busyId === s.id ? "Generating…" : "Download card"}
                      </Button>
                    ) : (
                      <span className="text-xs text-muted-foreground">
                        {s.status === "rejected" ? "Rejected — edit & re-submit" : "Awaiting approval"}
                      </span>
                    )}

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
