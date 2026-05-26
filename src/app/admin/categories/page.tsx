"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { store, useCategories } from "@/services";
import type { Category } from "@/types";

export default function CategoriesAdminPage() {
  const { data: rows, loading } = useCategories();
  const [editId, setEditId] = useState<string | null>(null);
  const [draftFee, setDraftFee] = useState<number>(0);

  const startEdit = (c: Category) => {
    setEditId(c.id);
    setDraftFee(c.fee);
  };
  const saveFee = async (c: Category) => {
    try {
      await store.updateCategory(c.id, { fee: Number(draftFee) });
      toast.success("Fee updated");
      setEditId(null);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed");
    }
  };
  const toggleActive = async (c: Category) => {
    await store.updateCategory(c.id, { active: !c.active });
    toast.success(c.active ? "Category disabled" : "Category enabled");
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Event categories ({rows.length})</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead><TableHead>Prefix</TableHead>
              <TableHead>Fee</TableHead><TableHead>Active</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading && rows.length === 0 ? (
              <TableRow><TableCell colSpan={5} className="text-center text-muted-foreground">Loading…</TableCell></TableRow>
            ) : rows.map((c) => (
              <TableRow key={c.id}>
                <TableCell className="font-medium">{c.name}</TableCell>
                <TableCell className="font-mono text-xs">{c.prefix}</TableCell>
                <TableCell>
                  {editId === c.id ? (
                    <Input
                      type="number"
                      min={0}
                      className="h-8 w-24"
                      value={draftFee}
                      onChange={(e) => setDraftFee(Number(e.target.value))}
                    />
                  ) : (
                    `₹${c.fee}`
                  )}
                </TableCell>
                <TableCell>
                  <Badge variant={c.active ? "success" : "secondary"}>{c.active ? "Active" : "Disabled"}</Badge>
                </TableCell>
                <TableCell>
                  <div className="flex justify-end gap-2">
                    {editId === c.id ? (
                      <>
                        <Button size="sm" onClick={() => saveFee(c)}>Save</Button>
                        <Button size="sm" variant="outline" onClick={() => setEditId(null)}>Cancel</Button>
                      </>
                    ) : (
                      <>
                        <Button size="sm" variant="outline" onClick={() => startEdit(c)}>Edit fee</Button>
                        <Button size="sm" variant={c.active ? "outline" : "default"} onClick={() => toggleActive(c)}>
                          {c.active ? "Disable" : "Enable"}
                        </Button>
                      </>
                    )}
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
