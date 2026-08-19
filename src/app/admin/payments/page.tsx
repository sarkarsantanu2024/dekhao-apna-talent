"use client";

import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { Check, X, RotateCcw } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { StatusBadge } from "@/components/common/status-badge";
import { ScreenshotPreview } from "@/components/common/screenshot-link";
import { PaymentActions } from "@/components/admin/payment-actions";
import { Pagination } from "@/components/ui/pagination";
import { confirm, prompt } from "@/components/ui/confirm-dialog";
import { formatCurrency, formatDate } from "@/lib/utils";
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
  const [selected, setSelected] = useState<Set<string>>(new Set());

  const { data: allCenters } = useCenters();
  const centers = useMemo(
    () => (showTestData ? allCenters : allCenters.filter((c) => !TEST_CENTER_IDS.has(c.id))),
    [allCenters, showTestData],
  );

  const filtered = useMemo(() => {
    let out = filter === "all" ? rows : rows.filter((p) => p.status === filter);
    if (centerFilter !== "all") out = out.filter((p) => p.center_name === centerFilter);
    const q = query.trim().toLowerCase();
    if (q) {
      out = out.filter((p) =>
        [p.student_name, p.center_name, p.transaction_ref].some((v) => v?.toLowerCase().includes(q)),
      );
    }
    return out;
  }, [rows, filter, centerFilter, query]);

  // Pagination keeps long lists scannable; changing the filter resets to page 1.
  const PAGE_SIZE = 20;
  const [page, setPage] = useState(1);
  useEffect(() => { setPage(1); }, [filter, query, centerFilter]);
  const pageCount = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const safePage = Math.min(page, pageCount);
  const pageRows = useMemo(
    () => filtered.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE),
    [filtered, safePage],
  );

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
            {(query || centerFilter !== "all" || filter !== "all") && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => { setQuery(""); setCenterFilter("all"); setFilter("all"); }}
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
          ) : pageRows.map((p) => (
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
                  disabled={pendingRows.length === 0}
                  aria-label="Select all pending"
                />
              </TableHead>
              <TableHead>Centre</TableHead><TableHead>Student</TableHead><TableHead>Amount</TableHead><TableHead>Ref</TableHead>
              <TableHead>Screenshot</TableHead><TableHead>Status</TableHead><TableHead>Date</TableHead><TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading && filtered.length === 0 ? (
              <TableRow><TableCell colSpan={9} className="text-center text-muted-foreground">Loading…</TableCell></TableRow>
            ) : filtered.length === 0 ? (
              <TableRow><TableCell colSpan={9} className="text-center text-muted-foreground">No payments match this filter.</TableCell></TableRow>
            ) : pageRows.map((p) => (
              <TableRow key={p.id} data-state={selected.has(p.id) ? "selected" : undefined}>
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
                <TableCell className="font-mono text-xs">{p.transaction_ref ?? "—"}</TableCell>
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
          </TableBody>
        </Table>
        </div>

        <Pagination page={safePage} pageCount={pageCount} onPageChange={setPage} />
      </CardContent>
    </Card>
  );
}
