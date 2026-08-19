"use client";

import { Fragment, useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { Check, X, RotateCcw, Files, MapPin } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { StatusBadge } from "@/components/common/status-badge";
import { ScreenshotPreview } from "@/components/common/screenshot-link";
import { PaymentActions } from "@/components/admin/payment-actions";
import { Pagination } from "@/components/ui/pagination";
import { confirm, prompt } from "@/components/ui/confirm-dialog";
import { formatCurrency, formatDate, groupByArea, UNGROUPED_AREA } from "@/lib/utils";
import { store, useCenters, usePayments } from "@/services";
import { TEST_CENTER_IDS, TEST_PAYMENT_IDS } from "@/constants/test-data";
import { Input } from "@/components/ui/input";
import { SearchableSelect } from "@/components/ui/searchable-select";
import { useShowTestData } from "@/lib/use-show-test-data";
import type { Payment, PaymentStatus } from "@/types";

const FILTERS: { value: PaymentStatus | "all"; label: string }[] = [
  { value: "all", label: "All" },
  { value: "pending", label: "Pending" },
  { value: "approved", label: "Approved" },
  { value: "rejected", label: "Rejected" },
];

export default function AdminPaymentsPage() {
  const { data: allRows, loading } = usePayments();
  const [showTestData] = useShowTestData();
  const rows = useMemo(
    () => (showTestData ? allRows : allRows.filter((p) => !TEST_PAYMENT_IDS.has(p.id))),
    [allRows, showTestData],
  );
  const [filter, setFilter] = useState<PaymentStatus | "all">("all");
  const [query, setQuery] = useState("");
  const [centerFilter, setCenterFilter] = useState("all");
  const [areaFilter, setAreaFilter] = useState("all");
  const [selected, setSelected] = useState<Set<string>>(new Set());

  const { data: allCenters } = useCenters();
  const centers = useMemo(
    () => (showTestData ? allCenters : allCenters.filter((c) => !TEST_CENTER_IDS.has(c.id))),
    [allCenters, showTestData],
  );

  // Payments carry no city — their area is the paying centre's city.
  const areaByCenter = useMemo(() => {
    const m = new Map<string, string>();
    for (const c of allCenters) m.set(c.id, c.city?.trim() || UNGROUPED_AREA);
    return m;
  }, [allCenters]);
  const areaOptions = useMemo(
    () => groupByArea(centers, (c) => c.city).map(([area]) => area),
    [centers],
  );

  const filtered = useMemo(() => {
    let out = filter === "all" ? rows : rows.filter((p) => p.status === filter);
    if (centerFilter !== "all") out = out.filter((p) => p.center_name === centerFilter);
    if (areaFilter !== "all") {
      const want = areaFilter.toLowerCase();
      out = out.filter(
        (p) => ((p.center_id && areaByCenter.get(p.center_id)) || UNGROUPED_AREA).toLowerCase() === want,
      );
    }
    const q = query.trim().toLowerCase();
    if (q) {
      out = out.filter((p) =>
        [p.student_name, p.center_name, p.transaction_ref].some((v) => v?.toLowerCase().includes(q)),
      );
    }
    return out;
  }, [rows, filter, centerFilter, areaFilter, areaByCenter, query]);

  // All pending payments in the current scope — powers centre-wise bulk approve.
  const scopePending = useMemo(() => filtered.filter((p) => p.status === "pending"), [filtered]);

  // Rows sharing one screenshot are ONE real-world transfer ("batch") — the
  // centre paid HO once for several students. Group them so the admin sees a
  // single batch instead of apparent duplicates. The shared screenshot URL is
  // the batch key (each upload produces a unique URL); no schema involved.
  const units = useMemo(() => {
    const map = new Map<string, Payment[]>();
    const order: string[] = [];
    for (const p of filtered) {
      const key = `${p.center_id ?? p.center_name}|${p.screenshot_url}`;
      if (!map.has(key)) {
        map.set(key, []);
        order.push(key);
      }
      map.get(key)!.push(p);
    }
    return order.map((key) => ({ key, rows: map.get(key)! }));
  }, [filtered]);

  // Order units area-by-area (Andal, Bankura, …) so the list renders as
  // area sections; inside an area, newest first (original order kept).
  const areaUnits = useMemo(() => {
    const grouped = groupByArea(units, (u) =>
      u.rows[0].center_id ? areaByCenter.get(u.rows[0].center_id) : null,
    );
    return grouped.flatMap(([area, us]) => us.map((u) => ({ ...u, area })));
  }, [units, areaByCenter]);

  // Pagination keeps long lists scannable; changing the filter resets to page 1.
  // Paginate by unit so a batch is never split across pages.
  const PAGE_SIZE = 20;
  const [page, setPage] = useState(1);
  useEffect(() => { setPage(1); }, [filter, query, centerFilter, areaFilter]);
  const pageCount = Math.max(1, Math.ceil(areaUnits.length / PAGE_SIZE));
  const safePage = Math.min(page, pageCount);
  const pageUnits = useMemo(
    () => areaUnits.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE),
    [areaUnits, safePage],
  );
  const pageRows = useMemo(() => pageUnits.flatMap((u) => u.rows), [pageUnits]);

  // Only pending payments can be approved/rejected, so only those are
  // selectable — scoped to the visible page.
  const pendingRows = useMemo(() => pageRows.filter((p) => p.status === "pending"), [pageRows]);
  const allSelected = pendingRows.length > 0 && pendingRows.every((p) => selected.has(p.id));

  const toggle = (id: string) =>
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  const toggleAll = () =>
    setSelected(allSelected ? new Set() : new Set(pendingRows.map((p) => p.id)));

  const onBulk = async (kind: "approve" | "reject") => {
    const ids = [...selected];
    if (!ids.length) return;
    if (kind === "reject" && !(await confirm({
      title: `Reject ${ids.length} payment${ids.length !== 1 ? "s" : ""}?`,
      description: "The selected payments will be marked as rejected. Centres can re-submit.",
      confirmText: "Reject",
      destructive: true,
    }))) return;
    let ok = 0;
    for (const id of ids) {
      try {
        if (kind === "approve") await store.approvePayment(id);
        else await store.rejectPayment(id);
        ok++;
      } catch { /* skip failures */ }
    }
    setSelected(new Set());
    toast.success(`${kind === "approve" ? "Approved" : "Rejected"} ${ok} payment${ok !== 1 ? "s" : ""}`);
  };

  /** Approve or reject every pending payment of the selected centre in one go. */
  const onCentreBulk = async (kind: "approve" | "reject") => {
    if (centerFilter === "all" || !scopePending.length) return;
    const n = scopePending.length;
    if (!(await confirm({
      title: `${kind === "approve" ? "Approve" : "Reject"} all ${n} pending payment${n !== 1 ? "s" : ""} of ${centerFilter}?`,
      description:
        kind === "approve"
          ? "Every pending payment of this centre (in the current filter) will be approved and the students' chest cards unlocked."
          : "Every pending payment of this centre (in the current filter) will be rejected. The centre can re-submit.",
      confirmText: kind === "approve" ? "Approve all" : "Reject all",
      destructive: kind === "reject",
    }))) return;
    let ok = 0;
    for (const p of scopePending) {
      try {
        if (kind === "approve") await store.approvePayment(p.id);
        else await store.rejectPayment(p.id);
        ok++;
      } catch { /* skip failures */ }
    }
    toast.success(`${kind === "approve" ? "Approved" : "Rejected"} ${ok} payment${ok !== 1 ? "s" : ""} — ${centerFilter}`);
  };

  /** Approve/reject every still-pending member of one batch in one go. */
  const onBatch = async (batchRows: Payment[], kind: "approve" | "reject") => {
    const pending = batchRows.filter((p) => p.status === "pending");
    if (!pending.length) return;
    if (kind === "reject" && !(await confirm({
      title: `Reject this batch (${pending.length} payment${pending.length !== 1 ? "s" : ""})?`,
      description: "Every pending payment in this batch will be marked as rejected. The centre can re-submit.",
      confirmText: "Reject",
      destructive: true,
    }))) return;
    let ok = 0;
    for (const p of pending) {
      try {
        if (kind === "approve") await store.approvePayment(p.id);
        else await store.rejectPayment(p.id);
        ok++;
      } catch { /* skip failures */ }
    }
    toast.success(`${kind === "approve" ? "Approved" : "Rejected"} ${ok} payment${ok !== 1 ? "s" : ""} in the batch`);
  };

  const onRevert = async (p: Payment) => {
    const wasApproved = p.status === "approved";
    const note = await prompt({
      title: "Undo this decision?",
      description: wasApproved
        ? `This payment goes back to “pending” and ${p.student_name ?? "the student"}'s chest card re-locks. Tell the centre why you changed it and what to fix — they'll see this and can re-submit.`
        : "This payment goes back to “pending”. Tell the centre why and what to fix — they'll see this note.",
      placeholder: "Reason (e.g. amount mismatch — upload the correct screenshot)",
      confirmText: "Undo",
      destructive: true,
    });
    if (note === null) return; // cancelled
    try {
      await store.revertPayment(p.id, note || undefined);
      toast.success("Moved back to pending — centre notified");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not undo");
    }
  };

  return (
    <Card>
      <CardHeader className="flex flex-row flex-wrap items-center justify-between gap-3">
        <CardTitle className="min-w-0">All payments ({filtered.length})</CardTitle>
        <div className="flex flex-wrap items-center gap-2">
          {selected.size > 0 && (
            <>
              <span className="text-sm text-muted-foreground">{selected.size} selected</span>
              <Button size="sm" className="gap-1.5 shrink-0" onClick={() => onBulk("approve")}>
                <Check className="size-4" /> Approve
              </Button>
              <Button variant="outline" size="sm" className="gap-1.5 shrink-0" onClick={() => onBulk("reject")}>
                <X className="size-4" /> Reject
              </Button>
            </>
          )}
        </div>
      </CardHeader>

      <CardContent>
        <div className="sticky top-16 z-20 -mx-4 mb-4 flex flex-col gap-3 border-b bg-card px-4 py-3 sm:-mx-6 sm:px-6 xl:flex-row xl:items-center xl:justify-between">
          <div className="grid grid-cols-2 gap-2 sm:flex sm:flex-wrap sm:items-center">
            <Input
              placeholder="Search student, centre, ref…"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="col-span-2 h-9 w-full sm:w-64"
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
              className="col-span-2 w-full sm:w-56"
            />
            <SearchableSelect
              value={areaFilter}
              onValueChange={setAreaFilter}
              options={[
                { value: "all", label: "All areas" },
                ...areaOptions.map((a) => ({ value: a, label: a })),
              ]}
              placeholder="Area"
              searchPlaceholder="Search area…"
              className="col-span-2 w-full sm:w-44"
            />
            {centerFilter !== "all" && scopePending.length > 0 && (
              <>
                <Button
                  size="sm"
                  onClick={() => onCentreBulk("approve")}
                  className="h-9 gap-1.5"
                  title={`Approve every pending payment of ${centerFilter}`}
                >
                  <Check className="size-4" /> Approve centre ({scopePending.length})
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => onCentreBulk("reject")}
                  className="h-9 gap-1.5"
                  title={`Reject every pending payment of ${centerFilter}`}
                >
                  <X className="size-4" /> Reject centre ({scopePending.length})
                </Button>
              </>
            )}
            {(query || centerFilter !== "all" || areaFilter !== "all" || filter !== "all") && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => { setQuery(""); setCenterFilter("all"); setAreaFilter("all"); setFilter("all"); }}
                className="col-span-2 h-9 gap-1.5 px-2 text-muted-foreground sm:col-auto"
              >
                <X className="size-3.5" /> Reset
              </Button>
            )}
          </div>
          <div className="flex flex-wrap gap-1 rounded-md border bg-background p-1 sm:inline-flex sm:w-fit">
            {FILTERS.map((f) => (
              <Button
                key={f.value}
                size="sm"
                variant={filter === f.value ? "default" : "ghost"}
                onClick={() => setFilter(f.value)}
                className="h-7 flex-1 px-3 text-xs sm:flex-none"
              >
                {f.label}
              </Button>
            ))}
          </div>
        </div>

        {/* Mobile: app-style card list */}
        <div className="space-y-3 md:hidden">
          {loading && filtered.length === 0 ? (
            <p className="py-8 text-center text-sm text-muted-foreground">Loading…</p>
          ) : filtered.length === 0 ? (
            <p className="py-8 text-center text-sm text-muted-foreground">No payments match this filter.</p>
          ) : pageUnits.map((u, i) => {
            const showArea = i === 0 || pageUnits[i - 1].area !== u.area;
            const total = u.rows.reduce((s, p) => s + Number(p.amount), 0);
            const pendingCount = u.rows.filter((p) => p.status === "pending").length;
            const memberCards = u.rows.map((p) => (
            <div
              key={p.id}
              className={`rounded-lg border bg-card p-4 shadow-sm ${selected.has(p.id) ? "border-primary/50 bg-muted/30" : ""}`}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex min-w-0 items-start gap-3">
                  {p.status === "pending" && (
                    <Checkbox
                      checked={selected.has(p.id)}
                      onCheckedChange={() => toggle(p.id)}
                      aria-label={`Select payment from ${p.center_name}`}
                      className="mt-1"
                    />
                  )}
                  <div className="min-w-0">
                    <p className="truncate font-medium">{p.student_name ?? "—"}</p>
                    <p className="truncate text-xs text-muted-foreground">{p.center_name}</p>
                  </div>
                </div>
                <StatusBadge status={p.status} />
              </div>
              <div className="mt-3 flex items-center gap-3">
                <ScreenshotPreview
                  url={p.screenshot_url}
                  label={`Payment screenshot — ${p.student_name ?? p.center_name}`}
                  caption={`${p.center_name} · ${formatCurrency(p.amount)}${p.transaction_ref ? ` · Ref ${p.transaction_ref}` : ""} · ${formatDate(p.created_at)}`}
                />
                <div className="min-w-0 text-xs text-muted-foreground">
                  <p className="text-base font-bold text-foreground">{formatCurrency(p.amount)}</p>
                  <p className="truncate font-mono">{p.transaction_ref ?? "—"}</p>
                  <p>{formatDate(p.created_at)}</p>
                </div>
              </div>
              {p.status === "rejected" && p.review_note && (
                <p className="mt-2 whitespace-normal wrap-break-word text-xs text-rose-600">“{p.review_note}”</p>
              )}
              <div className="mt-3 flex items-center justify-end gap-2 border-t pt-2.5">
                {p.status === "pending" ? (
                  <PaymentActions id={p.id} />
                ) : (
                  <>
                    <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ${
                      p.status === "approved" ? "bg-emerald-100 text-emerald-700" : "bg-rose-100 text-rose-700"
                    }`}>
                      {p.status === "approved" ? <Check className="size-3.5" /> : <X className="size-3.5" />}
                      {p.status === "approved" ? "Verified" : "Rejected"} by {p.reviewed_by ?? "admin"}
                    </span>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="h-7 shrink-0 gap-1 px-2 text-xs text-muted-foreground"
                      title="Undo this decision — sends the payment back to pending"
                      onClick={() => onRevert(p)}
                    >
                      <RotateCcw className="size-3.5" /> Undo
                    </Button>
                  </>
                )}
              </div>
            </div>
            ));
            // Single payment renders exactly as before; a batch gets a
            // framed wrapper + header with whole-batch actions.
            const content = u.rows.length === 1 ? (
              memberCards
            ) : (
              <div className="space-y-2 rounded-lg border-2 border-primary/40 bg-primary/5 p-2 shadow-sm">
                <div className="flex flex-wrap items-center justify-between gap-2 px-1 pt-0.5">
                  <div className="flex min-w-0 items-center gap-2 text-xs">
                    <span className="inline-flex shrink-0 items-center gap-1 rounded-full bg-primary px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-primary-foreground">
                      <Files className="size-3" /> Batch
                    </span>
                    <div className="min-w-0">
                      <p className="font-semibold">
                        {u.rows.length} students · {formatCurrency(total)}
                      </p>
                      <p className="truncate text-muted-foreground">
                        {u.rows[0].center_name} · one transfer, one screenshot
                      </p>
                    </div>
                  </div>
                  {pendingCount > 0 && (
                    <div className="flex gap-2">
                      <Button size="sm" className="h-7 gap-1 px-2 text-xs" onClick={() => onBatch(u.rows, "approve")}>
                        <Check className="size-3.5" /> Approve all
                      </Button>
                      <Button size="sm" variant="outline" className="h-7 gap-1 px-2 text-xs" onClick={() => onBatch(u.rows, "reject")}>
                        <X className="size-3.5" /> Reject all
                      </Button>
                    </div>
                  )}
                </div>
                {memberCards}
              </div>
            );
            return (
              <Fragment key={u.key}>
                {showArea && (
                  <h3 className="flex items-center gap-1.5 pt-1 text-sm font-semibold text-foreground">
                    <MapPin className="size-4 text-primary" /> {u.area}
                  </h3>
                )}
                {content}
              </Fragment>
            );
          })}
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
                  disabled={pendingRows.length === 0}
                  aria-label="Select all pending"
                />
              </TableHead>
              <TableHead>Centre</TableHead><TableHead>Student</TableHead><TableHead>Amount</TableHead>
              <TableHead>Screenshot</TableHead><TableHead>Status</TableHead><TableHead>Date</TableHead><TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading && filtered.length === 0 ? (
              <TableRow><TableCell colSpan={8} className="text-center text-muted-foreground">Loading…</TableCell></TableRow>
            ) : filtered.length === 0 ? (
              <TableRow><TableCell colSpan={8} className="text-center text-muted-foreground">No payments match this filter.</TableCell></TableRow>
            ) : pageUnits.map((u, i) => {
              const showArea = i === 0 || pageUnits[i - 1].area !== u.area;
              const total = u.rows.reduce((s, p) => s + Number(p.amount), 0);
              const pendingCount = u.rows.filter((p) => p.status === "pending").length;
              return (
                <Fragment key={u.key}>
                  {showArea && (
                    <TableRow className="bg-muted/40 hover:bg-muted/40">
                      <TableCell colSpan={8} className="py-1.5">
                        <span className="flex items-center gap-1.5 text-xs font-semibold">
                          <MapPin className="size-3.5 text-primary" /> {u.area}
                        </span>
                      </TableCell>
                    </TableRow>
                  )}
                  {u.rows.length > 1 && (
                    <TableRow className="border-l-4 border-l-primary bg-primary/10 hover:bg-primary/10">
                      <TableCell colSpan={8} className="py-2">
                        <div className="flex flex-wrap items-center gap-3">
                          <span className="inline-flex items-center gap-1 rounded-full bg-primary px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-primary-foreground">
                            <Files className="size-3" /> Batch
                          </span>
                          <span className="text-xs font-semibold">
                            {u.rows.length} students · {formatCurrency(total)}
                          </span>
                          <span className="text-xs text-muted-foreground">one transfer, one screenshot</span>
                          {pendingCount > 0 && (
                            <span className="ml-auto flex gap-2">
                              <Button size="sm" className="h-7 gap-1 px-2 text-xs" onClick={() => onBatch(u.rows, "approve")}>
                                <Check className="size-3.5" /> Approve all
                              </Button>
                              <Button size="sm" variant="outline" className="h-7 gap-1 px-2 text-xs" onClick={() => onBatch(u.rows, "reject")}>
                                <X className="size-3.5" /> Reject all
                              </Button>
                            </span>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  )}
                  {u.rows.map((p) => (
              <TableRow
                key={p.id}
                data-state={selected.has(p.id) ? "selected" : undefined}
                className={u.rows.length > 1 ? "border-l-4 border-l-primary/40 bg-primary/3" : undefined}
              >
                <TableCell>
                  {p.status === "pending" ? (
                    <Checkbox
                      checked={selected.has(p.id)}
                      onCheckedChange={() => toggle(p.id)}
                      aria-label={`Select payment from ${p.center_name}`}
                    />
                  ) : null}
                </TableCell>
                <TableCell>{p.center_name}</TableCell>
                <TableCell>{p.student_name ?? "—"}</TableCell>
                <TableCell>{formatCurrency(p.amount)}</TableCell>
                <TableCell>
                  <ScreenshotPreview
                    url={p.screenshot_url}
                    label={`Payment screenshot — ${p.student_name ?? p.center_name}`}
                    caption={`${p.center_name} · ${formatCurrency(p.amount)}${p.transaction_ref ? ` · Ref ${p.transaction_ref}` : ""} · ${formatDate(p.created_at)}`}
                  />
                </TableCell>
                <TableCell><StatusBadge status={p.status} /></TableCell>
                <TableCell className="text-muted-foreground">{formatDate(p.created_at)}</TableCell>
                <TableCell>
                  {p.status === "pending" ? (
                    <div className="flex justify-end">
                      <PaymentActions id={p.id} />
                    </div>
                  ) : (
                    <div className="flex items-center justify-end gap-2">
                      {p.status === "approved" ? (
                        <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-100 px-2.5 py-1 text-xs font-medium text-emerald-700">
                          <Check className="size-3.5" /> Verified by {p.reviewed_by ?? "admin"}
                        </span>
                      ) : (
                        <div className="flex flex-col gap-0.5">
                          <span className="inline-flex w-fit items-center gap-1.5 rounded-full bg-rose-100 px-2.5 py-1 text-xs font-medium text-rose-700">
                            <X className="size-3.5" /> Rejected by {p.reviewed_by ?? "admin"}
                          </span>
                          {p.review_note && (
                            <span className="block max-w-64 whitespace-normal wrap-break-word text-[11px] text-muted-foreground">
                              “{p.review_note}”
                            </span>
                          )}
                        </div>
                      )}
                      <Button
                        size="sm"
                        variant="ghost"
                        className="h-7 shrink-0 gap-1 px-2 text-xs text-muted-foreground"
                        title="Undo this decision — sends the payment back to pending"
                        onClick={() => onRevert(p)}
                      >
                        <RotateCcw className="size-3.5" /> Undo
                      </Button>
                    </div>
                  )}
                </TableCell>
              </TableRow>
                  ))}
                </Fragment>
              );
            })}
          </TableBody>
        </Table>
        </div>

        <Pagination page={safePage} pageCount={pageCount} onPageChange={setPage} />
      </CardContent>
    </Card>
  );
}
