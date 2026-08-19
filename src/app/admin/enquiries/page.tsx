"use client";

import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import * as XLSX from "xlsx";
import { Download, Mail, MessageCircle, Check, Archive, Trash2, RotateCcw, X } from "lucide-react";
import { Pagination } from "@/components/ui/pagination";
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
import { confirm } from "@/components/ui/confirm-dialog";
import { useEnquiries, store } from "@/services";
import type { Enquiry, EnquiryStatus } from "@/types";

const FILTERS: { key: "all" | EnquiryStatus; label: string }[] = [
  { key: "all", label: "All" },
  { key: "new", label: "New" },
  { key: "read", label: "Read" },
  { key: "archived", label: "Archived" },
];

const STATUS_STYLE: Record<EnquiryStatus, string> = {
  new: "bg-primary/10 text-primary",
  read: "bg-emerald-500/10 text-emerald-600",
  archived: "bg-muted text-muted-foreground",
};

function fmtDate(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleString(undefined, {
    day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit",
  });
}

export default function EnquiriesPage() {
  const { data: enquiries, loading } = useEnquiries();
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<"all" | EnquiryStatus>("all");
  const [busyId, setBusyId] = useState<string | null>(null);

  const newCount = useMemo(() => enquiries.filter((e) => e.status === "new").length, [enquiries]);

  const rows = useMemo(() => {
    const q = query.trim().toLowerCase();
    return enquiries.filter((e) => {
      if (filter !== "all" && e.status !== filter) return false;
      if (!q) return true;
      return [e.name, e.email, e.phone, e.message].some((v) => v?.toLowerCase().includes(q));
    });
  }, [enquiries, query, filter]);

  // Pagination keeps long lists scannable; filters/search reset to page 1.
  const PAGE_SIZE = 20;
  const [page, setPage] = useState(1);
  useEffect(() => { setPage(1); }, [query, filter]);
  const pageCount = Math.max(1, Math.ceil(rows.length / PAGE_SIZE));
  const safePage = Math.min(page, pageCount);
  const pageRows = useMemo(
    () => rows.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE),
    [rows, safePage],
  );

  const setStatus = async (e: Enquiry, status: EnquiryStatus) => {
    setBusyId(e.id);
    try {
      await store.updateEnquiry(e.id, { status });
      toast.success(`Marked ${status}`);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not update");
    } finally {
      setBusyId(null);
    }
  };

  const remove = async (e: Enquiry) => {
    const ok = await confirm({
      title: "Delete this enquiry?",
      description: `From ${e.name} (${e.email}). This can't be undone.`,
      destructive: true,
      confirmText: "Delete",
    });
    if (!ok) return;
    setBusyId(e.id);
    try {
      await store.deleteEnquiry(e.id);
      toast.success("Enquiry deleted");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not delete");
    } finally {
      setBusyId(null);
    }
  };

  const onDownloadAll = () => {
    if (!enquiries.length) return toast.error("No enquiries to export");
    const header = ["Date", "Name", "Phone", "Email", "Message", "Status"];
    const data = enquiries.map((e) => [
      fmtDate(e.created_at), e.name, e.phone ?? "", e.email, e.message, e.status,
    ]);
    const ws = XLSX.utils.aoa_to_sheet([header, ...data]);
    ws["!cols"] = [{ wch: 20 }, { wch: 22 }, { wch: 16 }, { wch: 28 }, { wch: 60 }, { wch: 12 }];
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Enquiries");
    XLSX.writeFile(wb, `enquiries-${new Date().toISOString().slice(0, 10)}.xlsx`);
    toast.success(`Exported ${enquiries.length} enquiries`);
  };

  return (
    <Card>
      <CardHeader className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="min-w-0">
          <CardTitle>
            Enquiries ({enquiries.length})
            {newCount > 0 && (
              <span className="ml-2 rounded-full bg-primary/10 px-2 py-0.5 text-xs font-semibold text-primary align-middle">
                {newCount} new
              </span>
            )}
          </CardTitle>
          <CardDescription>
            Every message sent from the website&apos;s contact form. Reply from your mail app,
            mark them handled, or export the full list.
          </CardDescription>
        </div>
        <Button onClick={onDownloadAll} disabled={!enquiries.length} className="gap-2 shrink-0 sm:self-start">
          <Download className="size-4" /> Download all ({enquiries.length})
        </Button>
      </CardHeader>

      <CardContent className="space-y-4">
        <div className="sticky top-16 z-20 -mx-4 flex flex-col gap-3 border-b bg-card px-4 py-3 sm:-mx-6 sm:flex-row sm:items-center sm:justify-between sm:px-6">
          <div className="flex flex-wrap items-center gap-1.5">
            {FILTERS.map((f) => (
              <Button
                key={f.key}
                size="sm"
                variant={filter === f.key ? "default" : "outline"}
                onClick={() => setFilter(f.key)}
              >
                {f.label}
              </Button>
            ))}
            {(query || filter !== "all") && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => { setQuery(""); setFilter("all"); }}
                className="gap-1.5 px-2 text-muted-foreground"
              >
                <X className="size-3.5" /> Reset
              </Button>
            )}
          </div>
          <Input
            placeholder="Search name, email, phone, message…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full sm:w-80"
          />
        </div>

        {loading && enquiries.length === 0 ? (
          <p className="text-center text-sm text-muted-foreground">Loading…</p>
        ) : enquiries.length === 0 ? (
          <p className="rounded-lg border border-dashed bg-muted/30 p-8 text-center text-sm text-muted-foreground">
            No enquiries yet. Submissions from the website contact form will appear here.
          </p>
        ) : rows.length === 0 ? (
          <p className="text-center text-sm text-muted-foreground">No enquiries match your filter.</p>
        ) : (
          <>
          {/* Mobile: app-style card list */}
          <div className="space-y-3 md:hidden">
            {pageRows.map((e) => {
              const phoneDigits = (e.phone ?? "").replace(/\D/g, "");
              return (
                <div key={e.id} className="rounded-lg border bg-card p-4 shadow-sm">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="truncate font-medium">{e.name}</p>
                      <a href={`mailto:${e.email}`} className="flex items-center gap-1 truncate text-sm text-primary hover:underline">
                        <Mail className="size-3.5 shrink-0" /> <span className="truncate">{e.email}</span>
                      </a>
                    </div>
                    <span className={`inline-block shrink-0 rounded-full px-2 py-0.5 text-xs font-semibold capitalize ${STATUS_STYLE[e.status]}`}>
                      {e.status}
                    </span>
                  </div>
                  <div className="mt-2 space-y-1 text-xs text-muted-foreground">
                    {e.phone && (
                      <a
                        href={phoneDigits ? `https://wa.me/${phoneDigits}` : undefined}
                        target="_blank"
                        rel="noopener"
                        className="flex items-center gap-1 hover:text-emerald-600"
                      >
                        <MessageCircle className="size-3.5" /> {e.phone}
                      </a>
                    )}
                    <p>Received {fmtDate(e.created_at)}</p>
                    <p className="whitespace-normal wrap-break-word text-sm text-foreground">{e.message}</p>
                  </div>
                  <div className="mt-3 flex items-center justify-end gap-2 border-t pt-2.5">
                    {e.status !== "read" && (
                      <Button
                        size="icon" variant="ghost" disabled={busyId === e.id}
                        aria-label="Mark read" title="Mark as read"
                        onClick={() => setStatus(e, "read")}
                      >
                        <Check className="size-4 text-emerald-600" />
                      </Button>
                    )}
                    {e.status !== "archived" ? (
                      <Button
                        size="icon" variant="ghost" disabled={busyId === e.id}
                        aria-label="Archive" title="Archive"
                        onClick={() => setStatus(e, "archived")}
                      >
                        <Archive className="size-4" />
                      </Button>
                    ) : (
                      <Button
                        size="icon" variant="ghost" disabled={busyId === e.id}
                        aria-label="Restore" title="Restore to New"
                        onClick={() => setStatus(e, "new")}
                      >
                        <RotateCcw className="size-4" />
                      </Button>
                    )}
                    <Button
                      size="icon" variant="ghost" disabled={busyId === e.id}
                      aria-label="Delete" title="Delete"
                      onClick={() => remove(e)}
                    >
                      <Trash2 className="size-4 text-destructive" />
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Desktop: full table */}
          <div className="hidden overflow-x-auto rounded-lg border md:block">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="whitespace-nowrap">Received</TableHead>
                  <TableHead>From</TableHead>
                  <TableHead>Message</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {pageRows.map((e) => {
                  const phoneDigits = (e.phone ?? "").replace(/\D/g, "");
                  return (
                    <TableRow key={e.id} className={e.status === "new" ? "bg-primary/[0.03]" : undefined}>
                      <TableCell className="whitespace-nowrap align-top text-muted-foreground">
                        {fmtDate(e.created_at)}
                      </TableCell>
                      <TableCell className="align-top">
                        <div className="font-medium text-foreground">{e.name}</div>
                        <a href={`mailto:${e.email}`} className="flex items-center gap-1 text-sm text-primary hover:underline">
                          <Mail className="size-3.5" /> {e.email}
                        </a>
                        {e.phone && (
                          <a
                            href={phoneDigits ? `https://wa.me/${phoneDigits}` : undefined}
                            target="_blank"
                            rel="noopener"
                            className="flex items-center gap-1 text-sm text-muted-foreground hover:text-emerald-600"
                          >
                            <MessageCircle className="size-3.5" /> {e.phone}
                          </a>
                        )}
                      </TableCell>
                      <TableCell className="max-w-md align-top whitespace-pre-wrap text-foreground">
                        {e.message}
                      </TableCell>
                      <TableCell className="align-top">
                        <span className={`inline-block rounded-full px-2 py-0.5 text-xs font-semibold capitalize ${STATUS_STYLE[e.status]}`}>
                          {e.status}
                        </span>
                      </TableCell>
                      <TableCell className="align-top">
                        <div className="flex justify-end gap-1">
                          {e.status !== "read" && (
                            <Button
                              size="icon" variant="ghost" disabled={busyId === e.id}
                              aria-label="Mark read" title="Mark as read"
                              onClick={() => setStatus(e, "read")}
                            >
                              <Check className="size-4 text-emerald-600" />
                            </Button>
                          )}
                          {e.status !== "archived" ? (
                            <Button
                              size="icon" variant="ghost" disabled={busyId === e.id}
                              aria-label="Archive" title="Archive"
                              onClick={() => setStatus(e, "archived")}
                            >
                              <Archive className="size-4" />
                            </Button>
                          ) : (
                            <Button
                              size="icon" variant="ghost" disabled={busyId === e.id}
                              aria-label="Restore" title="Restore to New"
                              onClick={() => setStatus(e, "new")}
                            >
                              <RotateCcw className="size-4" />
                            </Button>
                          )}
                          <Button
                            size="icon" variant="ghost" disabled={busyId === e.id}
                            aria-label="Delete" title="Delete"
                            onClick={() => remove(e)}
                          >
                            <Trash2 className="size-4 text-destructive" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>

          <Pagination page={safePage} pageCount={pageCount} onPageChange={setPage} />
          </>
        )}
      </CardContent>
    </Card>
  );
}
