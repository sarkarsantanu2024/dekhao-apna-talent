"use client";

import Link from "next/link";
import { useState } from "react";
import { toast } from "sonner";
import { Download, Loader2, Pencil, Trash2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
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
        <Button asChild><Link href="/center/students/new">+ Add student</Link></Button>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
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
              <TableRow><TableCell colSpan={6} className="text-center text-muted-foreground">Loading…</TableCell></TableRow>
            ) : rows.length === 0 ? (
              <TableRow><TableCell colSpan={6} className="text-center text-muted-foreground">No students yet — add your first.</TableCell></TableRow>
            ) : rows.map((s) => (
              <TableRow key={s.id}>
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
