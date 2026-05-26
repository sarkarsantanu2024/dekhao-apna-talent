"use client";

import { useMemo, useState } from "react";
import { toast } from "sonner";
import { Download, Loader2, FileArchive, Lock } from "lucide-react";
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
import { StatusBadge } from "@/components/common/status-badge";
import { useCenters, useStudents } from "@/services";
import {
  downloadChestCard,
  downloadChestCardsZip,
  isDownloadable,
} from "@/lib/pdf/generate-chest-card";
import type { Student } from "@/types";

export default function CenterDownloadsPage() {
  const { data: centers } = useCenters();
  const center   = centers[0] ?? null;
  const centerId = center?.id;
  const { data: rows, loading } = useStudents({ centerId });

  const eligible = useMemo(() => rows.filter(isDownloadable), [rows]);
  const allEligible = rows.length > 0 && eligible.length === rows.length;

  const [singleBusy, setSingleBusy] = useState<string | null>(null);
  const [bulk, setBulk] = useState<{ done: number; total: number } | null>(null);

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
    setBulk({ done: 0, total: eligible.length });
    try {
      await downloadChestCardsZip(eligible, {
        onProgress: (done, total) => setBulk({ done, total }),
        zipName: center
          ? `chest-cards-${center.center_name.replace(/\s+/g, "-").toLowerCase()}.zip`
          : undefined,
      });
      toast.success(`Bundled ${eligible.length} chest cards`);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Bulk download failed");
    } finally {
      setBulk(null);
    }
  };

  return (
    <Card>
      <CardHeader className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <CardTitle>Chest card downloads</CardTitle>
          <CardDescription>
            Downloads unlock automatically once an admin approves the student.
            {!allEligible && rows.length > 0 && (
              <> · {eligible.length} of {rows.length} ready — the rest still pending approval.</>
            )}
            {allEligible && rows.length > 0 && (
              <> · All {rows.length} students approved — bulk download is unlocked.</>
            )}
          </CardDescription>
        </div>
        <Button
          onClick={onBulk}
          disabled={!allEligible || bulk !== null}
          title={
            allEligible
              ? "Download all chest cards as ZIP"
              : "Bulk download unlocks when every student of this centre is approved"
          }
          className="gap-2"
        >
          {bulk ? (
            <>
              <Loader2 className="size-4 animate-spin" />
              Generating {bulk.done}/{bulk.total}…
            </>
          ) : (
            <>
              <FileArchive className="size-4" />
              Download all (ZIP)
            </>
          )}
        </Button>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Roll</TableHead>
              <TableHead>Name</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Chest card</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading && rows.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center text-muted-foreground">Loading…</TableCell>
              </TableRow>
            ) : rows.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center text-muted-foreground">No students yet.</TableCell>
              </TableRow>
            ) : rows.map((s) => {
              const ok = isDownloadable(s);
              const busy = singleBusy === s.id;
              return (
                <TableRow key={s.id}>
                  <TableCell className="font-mono text-xs">{s.roll_number ?? "—"}</TableCell>
                  <TableCell className="font-medium">{s.full_name}</TableCell>
                  <TableCell>{s.category_name}</TableCell>
                  <TableCell><StatusBadge status={s.status} /></TableCell>
                  <TableCell className="text-right">
                    {ok ? (
                      <Button size="sm" onClick={() => onSingle(s)} disabled={busy} className="gap-1.5">
                        {busy ? <Loader2 className="size-3.5 animate-spin" /> : <Download className="size-3.5" />}
                        {busy ? "Generating…" : "Download PDF"}
                      </Button>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 text-xs text-muted-foreground">
                        <Lock className="size-3.5" /> Awaiting approval
                      </span>
                    )}
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
