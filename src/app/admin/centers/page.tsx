"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { store, useCenters } from "@/services";
import type { Center } from "@/types";
import { CenterDialog } from "@/components/admin/center-dialog";

export default function CentersPage() {
  const { data: rows, loading } = useCenters();
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Center | null>(null);

  const onDelete = async (c: Center) => {
    if (!window.confirm(`Delete ${c.center_name}?`)) return;
    await store.deleteCenter(c.id);
    toast.success("Centre deleted");
  };

  return (
    <Card>
      <CardHeader className="flex flex-wrap items-center justify-between gap-3">
        <CardTitle>Registered centres ({rows.length})</CardTitle>
        <Button size="sm" onClick={() => { setEditing(null); setOpen(true); }} className="gap-1.5">
          <Plus className="size-4" /> New centre
        </Button>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Centre</TableHead><TableHead>Owner</TableHead>
              <TableHead>Phone</TableHead><TableHead>City</TableHead><TableHead>State</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading && rows.length === 0 ? (
              <TableRow><TableCell colSpan={6} className="text-center text-muted-foreground">Loading…</TableCell></TableRow>
            ) : rows.length === 0 ? (
              <TableRow><TableCell colSpan={6} className="text-center text-muted-foreground">No centres yet.</TableCell></TableRow>
            ) : rows.map((c) => (
              <TableRow key={c.id}>
                <TableCell className="font-medium">{c.center_name}</TableCell>
                <TableCell>{c.owner_name ?? "—"}</TableCell>
                <TableCell>{c.phone ?? "—"}</TableCell>
                <TableCell>{c.city ?? "—"}</TableCell>
                <TableCell>{c.state ?? "—"}</TableCell>
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
