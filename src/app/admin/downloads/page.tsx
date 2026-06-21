"use client";

import { useMemo, useState } from "react";
import { toast } from "sonner";
import { Download, Loader2, Files, Lock, ImageOff, MapPin } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
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
import { useStudents } from "@/services";
import { groupByArea } from "@/lib/utils";
import {
  downloadChestCard,
  downloadAllChestCards,
  isDownloadable,
  hasPhoto,
} from "@/lib/pdf/generate-chest-card";
import type { Student } from "@/types";

export default function AdminDownloadsPage() {
  const { data: rows, loading } = useStudents();
  const [query, setQuery] = useState("");
  const [singleBusy, setSingleBusy] = useState<string | null>(null);
  const [bulk, setBulk] = useState(false);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return rows;
    return rows.filter((s) =>
      [s.full_name, s.roll_number, s.center_name, s.category_name].some((v) => v?.toLowerCase().includes(q)),
    );
  }, [rows, query]);

  // Across all centres, students ready to print (active + photo).
  const eligible = useMemo(() => rows.filter((s) => isDownloadable(s) && hasPhoto(s)), [rows]);

  // Students grouped by area / city / locality.
  const groups = useMemo(() => groupByArea(filtered, (s) => s.city), [filtered]);

  const onSingle = async (s: Student) => {
    setSingleBusy(s.id);
    try {
      await downloadChestCard(s);
      toast.success(`Downloaded ${s.roll_number ?? s.full_name}`);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Download failed");
    } finally {
      setSingleBusy(null);
    }
  };

  const onBulk = async () => {
    setBulk(true);
    try {
      await downloadAllChestCards(eligible, {
        fileName: `chest-cards-all-${new Date().toISOString().slice(0, 10)}.pdf`,
      });
      toast.success(`Bundled ${eligible.length} chest cards`);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Bulk download failed");
    } finally {
      setBulk(false);
    }
  };

  return (
    <Card>
      <CardHeader className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="min-w-0">
          <CardTitle>Chest card downloads</CardTitle>
          <CardDescription>
            Print any active student&apos;s chest card, or bundle every ready student into one PDF.
            {rows.length > 0 && <> · {eligible.length} of {rows.length} ready.</>}
          </CardDescription>
        </div>
        <Button
          onClick={onBulk}
          disabled={bulk || eligible.length < 2}
          title={eligible.length >= 2 ? "Download all ready chest cards as one PDF" : "Bulk download unlocks once 2 or more students are ready"}
          className="gap-2 shrink-0 sm:self-start"
        >
          {bulk ? <><Loader2 className="size-4 animate-spin" /> Generating…</> : <><Files className="size-4" /> Download all ({eligible.length})</>}
        </Button>
      </CardHeader>
      <CardContent>
        <div className="mb-4">
          <Input
            placeholder="Search name, roll, centre…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="h-9 w-full sm:w-72"
          />
        </div>
        {loading && filtered.length === 0 ? (
          <p className="py-6 text-center text-sm text-muted-foreground">Loading…</p>
        ) : filtered.length === 0 ? (
          <p className="py-6 text-center text-sm text-muted-foreground">No students match.</p>
        ) : (
          <div className="space-y-6">
            {groups.map(([area, items]) => (
              <section key={area}>
                <h3 className="mb-2 flex items-center gap-1.5 text-sm font-semibold text-foreground">
                  <MapPin className="size-4 text-primary" />
                  {area}
                  <span className="text-xs font-normal text-muted-foreground">({items.length})</span>
                </h3>
                <div className="overflow-hidden rounded-lg border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Roll</TableHead>
                        <TableHead>Name</TableHead>
                        <TableHead>Centre</TableHead>
                        <TableHead>Category</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="text-right">Chest card</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {items.map((s) => {
                        const active = isDownloadable(s);
                        const photo = hasPhoto(s);
                        const ok = active && photo;
                        const busy = singleBusy === s.id;
                        return (
                          <TableRow key={s.id}>
                            <TableCell className="font-mono text-xs">{s.roll_number ?? "—"}</TableCell>
                            <TableCell className="font-medium">{s.full_name}</TableCell>
                            <TableCell>{s.center_name}</TableCell>
                            <TableCell>{s.category_name}</TableCell>
                            <TableCell><StatusBadge status={s.status} /></TableCell>
                            <TableCell className="text-right">
                              {ok ? (
                                <Button size="sm" onClick={() => onSingle(s)} disabled={busy} className="gap-1.5">
                                  {busy ? <Loader2 className="size-3.5 animate-spin" /> : <Download className="size-3.5" />}
                                  {busy ? "Generating…" : "Download PDF"}
                                </Button>
                              ) : !active ? (
                                <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-100 px-2.5 py-1 text-xs font-medium text-amber-700">
                                  <Lock className="size-3.5" /> Payment not approved
                                </span>
                              ) : (
                                <span className="inline-flex items-center gap-1.5 rounded-full bg-rose-100 px-2.5 py-1 text-xs font-medium text-rose-700">
                                  <ImageOff className="size-3.5" /> Photo required
                                </span>
                              )}
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </div>
              </section>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
