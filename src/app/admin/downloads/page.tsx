"use client";

import { useMemo, useState } from "react";
import { toast } from "sonner";
import { Download, Loader2, Files, MapPin, X } from "lucide-react";
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
import { SearchableSelect } from "@/components/ui/searchable-select";
import { StatusBadge } from "@/components/common/status-badge";
import { ChestCardBlockers, chestCardBlockers } from "@/components/common/chest-card-blockers";
import { useCenters, usePayments, useStudents } from "@/services";
import { TEST_CENTER_IDS, TEST_PAYMENT_IDS, TEST_STUDENT_IDS } from "@/constants/test-data";
import { useShowTestData } from "@/lib/use-show-test-data";
import { groupByArea } from "@/lib/utils";
import {
  downloadChestCard,
  downloadAllChestCards,
  isDownloadable,
  hasPhoto,
} from "@/lib/pdf/generate-chest-card";
import type { Student } from "@/types";

export default function AdminDownloadsPage() {
  const { data: allStudents, loading } = useStudents();
  const { data: allPayments } = usePayments();
  const [showTestData] = useShowTestData();
  const rows = useMemo(
    () => (showTestData ? allStudents : allStudents.filter((s) => !TEST_STUDENT_IDS.has(s.id))),
    [allStudents, showTestData],
  );
  const payments = useMemo(
    () => (showTestData ? allPayments : allPayments.filter((p) => !TEST_PAYMENT_IDS.has(p.id))),
    [allPayments, showTestData],
  );
  const { data: allCenters } = useCenters();
  const centers = useMemo(
    () => (showTestData ? allCenters : allCenters.filter((c) => !TEST_CENTER_IDS.has(c.id))),
    [allCenters, showTestData],
  );
  const [query, setQuery] = useState("");
  const [centerFilter, setCenterFilter] = useState("all");
  const [singleBusy, setSingleBusy] = useState<string | null>(null);
  const [bulk, setBulk] = useState(false);

  // Centre scope first — the bulk download follows it (but not the text search).
  const inScope = useMemo(
    () => (centerFilter === "all" ? rows : rows.filter((s) => s.center_name === centerFilter)),
    [rows, centerFilter],
  );

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return inScope;
    return inScope.filter((s) =>
      [s.full_name, s.roll_number, s.center_name, s.category_name].some((v) => v?.toLowerCase().includes(q)),
    );
  }, [inScope, query]);

  // Within the selected centre (or all centres), students ready to print (active + photo).
  const eligible = useMemo(() => inScope.filter((s) => isDownloadable(s) && hasPhoto(s)), [inScope]);

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
      const scope =
        centerFilter === "all"
          ? "all"
          : centerFilter.replace(/[^\w]+/g, "-").toLowerCase();
      await downloadAllChestCards(eligible, {
        fileName: `chest-cards-${scope}-${new Date().toISOString().slice(0, 10)}.pdf`,
      });
      toast.success(
        `Bundled ${eligible.length} chest cards${centerFilter === "all" ? "" : ` — ${centerFilter}`}`,
      );
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
            {inScope.length > 0 && <> · {eligible.length} of {inScope.length} ready{centerFilter === "all" ? "" : ` at ${centerFilter}`}.</>}
          </CardDescription>
        </div>
        <Button
          onClick={onBulk}
          disabled={bulk || eligible.length < 1}
          title={
            eligible.length >= 1
              ? `Download the ready chest cards ${centerFilter === "all" ? "of every centre" : `of ${centerFilter}`} as one PDF`
              : "Unlocks once at least 1 student in this scope is ready"
          }
          className="gap-2 shrink-0 sm:self-start"
        >
          {bulk
            ? <><Loader2 className="size-4 animate-spin" /> Generating…</>
            : <><Files className="size-4" /> {centerFilter === "all" ? `Download all (${eligible.length})` : `Download centre (${eligible.length})`}</>}
        </Button>
      </CardHeader>
      <CardContent>
        <div className="sticky top-16 z-20 -mx-4 mb-4 flex flex-col gap-2 border-b bg-card px-4 py-3 sm:-mx-6 sm:flex-row sm:items-center sm:px-6">
          <Input
            placeholder="Search name, roll, centre…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="h-9 w-full sm:w-72"
          />
          <SearchableSelect
            value={centerFilter}
            onValueChange={setCenterFilter}
            options={[
              { value: "all", label: "All centres" },
              ...centers.map((c) => ({ value: c.center_name, label: c.center_name })),
            ]}
            placeholder="Centre"
            searchPlaceholder="Search centre…"
            className="w-full sm:w-56"
          />
          {(query || centerFilter !== "all") && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => { setQuery(""); setCenterFilter("all"); }}
              className="h-9 gap-1.5 px-2 text-muted-foreground sm:shrink-0"
            >
              <X className="size-3.5" /> Reset
            </Button>
          )}
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
                {/* Mobile: app-style card list */}
                <div className="space-y-3 md:hidden">
                  {items.map((s) => {
                    const blockers = chestCardBlockers(s, payments);
                    const ok = blockers.length === 0;
                    const busy = singleBusy === s.id;
                    return (
                      <div key={s.id} className="rounded-lg border bg-card p-4 shadow-sm">
                        <div className="flex items-start justify-between gap-3">
                          <div className="min-w-0">
                            <p className="truncate font-medium">{s.full_name}</p>
                            <p className="font-mono text-[11px] text-muted-foreground">{s.roll_number ?? "—"}</p>
                          </div>
                          <StatusBadge status={s.status} kind="student" />
                        </div>
                        <div className="mt-2 text-xs text-muted-foreground">
                          <p className="whitespace-normal wrap-break-word">{s.category_name} · {s.center_name}</p>
                        </div>
                        <div className="mt-3 flex items-center justify-end gap-2 border-t pt-2.5">
                          {ok ? (
                            <Button size="sm" onClick={() => onSingle(s)} disabled={busy} className="gap-1.5">
                              {busy ? <Loader2 className="size-3.5 animate-spin" /> : <Download className="size-3.5" />}
                              {busy ? "Generating…" : "Download PDF"}
                            </Button>
                          ) : (
                            <ChestCardBlockers blockers={blockers} />
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Desktop: full table */}
                <div className="hidden overflow-hidden rounded-lg border md:block">
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
                        const blockers = chestCardBlockers(s, payments);
                        const ok = blockers.length === 0;
                        const busy = singleBusy === s.id;
                        return (
                          <TableRow key={s.id}>
                            <TableCell className="font-mono text-xs">{s.roll_number ?? "—"}</TableCell>
                            <TableCell className="font-medium">{s.full_name}</TableCell>
                            <TableCell>{s.center_name}</TableCell>
                            <TableCell>{s.category_name}</TableCell>
                            <TableCell><StatusBadge status={s.status} kind="student" /></TableCell>
                            <TableCell className="text-right">
                              {ok ? (
                                <Button size="sm" onClick={() => onSingle(s)} disabled={busy} className="gap-1.5">
                                  {busy ? <Loader2 className="size-3.5 animate-spin" /> : <Download className="size-3.5" />}
                                  {busy ? "Generating…" : "Download PDF"}
                                </Button>
                              ) : (
                                <ChestCardBlockers blockers={blockers} />
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
