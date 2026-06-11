"use client";

import { useMemo, useState } from "react";
import { useSession } from "next-auth/react";
import { toast } from "sonner";
import { Download, Loader2, Files, Lock } from "lucide-react";
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
  downloadAllChestCards,
  isDownloadable,
} from "@/lib/pdf/generate-chest-card";
import type { Student } from "@/types";

export default function CenterDownloadsPage() {
  const { data: session } = useSession();
  const { data: centers } = useCenters();
  const sessionCenterId = session?.user?.centerId ?? null;
  const center   = centers.find((c) => c.id === sessionCenterId) ?? centers[0] ?? null;
  const centerId = center?.id;
  const { data: rows, loading } = useStudents({ centerId });

  // A student becomes `active` (downloadable) only when an admin approves that
  // student's payment — so `isDownloadable` already encodes "paid & approved".
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
      await downloadAllChestCards(eligible, {
        onProgress: (done, total) => setBulk({ done, total }),
        fileName: center
          ? `chest-cards-${center.center_name.replace(/\s+/g, "-").toLowerCase()}.pdf`
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
      <CardHeader className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="min-w-0">
          <CardTitle>Chest card downloads</CardTitle>
          <CardDescription>
            Each chest card unlocks once an admin approves that student&apos;s payment.
            {rows.length > 0 && (
              allEligible
                ? <> · All {rows.length} students paid &amp; approved — bulk download is unlocked.</>
                : <> · {eligible.length} of {rows.length} ready — the rest await payment approval.</>
            )}
          </CardDescription>
        </div>
        <Button
          onClick={onBulk}
          disabled={!allEligible || bulk !== null}
          title={
            allEligible
              ? "Download all chest cards as one PDF (two per page)"
              : "Bulk download unlocks when every student's payment is approved"
          }
          className="gap-2 shrink-0 sm:self-start"
        >
          {bulk ? (
            <>
              <Loader2 className="size-4 animate-spin" />
              Generating…
            </>
          ) : (
            <>
              <Files className="size-4" />
              Download all (PDF)
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
                        <Lock className="size-3.5" /> Awaiting payment approval
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
