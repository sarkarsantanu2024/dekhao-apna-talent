"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { toast } from "sonner";
import * as XLSX from "xlsx";
import { Copy, Download, MessageCircle, MapPin } from "lucide-react";
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
import { useCenters } from "@/services";
import {
  buildCenterCredentials,
  credentialMessage,
  type CenterCredential,
} from "@/lib/auth/center-credentials";

const UNGROUPED = "Other / Unspecified";

export default function CredentialsPage() {
  const { data: centers, loading } = useCenters();
  const [query, setQuery] = useState("");

  // Deterministic credentials for every uploaded centre.
  const creds = useMemo(() => buildCenterCredentials(centers), [centers]);

  // Persist credentials server-side so the centre owners can actually sign in.
  // Re-runs whenever the centre list changes (idempotent — replaces the file).
  const persistedKey = useRef<string>("");
  useEffect(() => {
    if (!creds.length) return;
    const payload = creds.map((c) => ({
      login_id: c.login_id,
      login_password: c.login_password,
      center_id: c.center.id,
      center_name: c.center.center_name,
    }));
    const key = JSON.stringify(payload);
    if (key === persistedKey.current) return; // nothing changed
    persistedKey.current = key;
    fetch("/api/center-logins", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: key,
    }).catch(() => {
      /* best-effort — surfaced only if owners can't sign in */
    });
  }, [creds]);

  // Filter, then group by city / area.
  const groups = useMemo(() => {
    const q = query.trim().toLowerCase();
    const filtered = q
      ? creds.filter((c) =>
          [c.center.center_name, c.center.owner_name, c.center.city, c.login_id]
            .some((v) => v?.toLowerCase().includes(q)),
        )
      : creds;

    const map = new Map<string, CenterCredential[]>();
    for (const c of filtered) {
      const area = c.center.city?.trim() || UNGROUPED;
      (map.get(area) ?? map.set(area, []).get(area)!).push(c);
    }
    // Sort areas alphabetically (Unspecified last), centres by name inside each.
    return [...map.entries()]
      .sort(([a], [b]) =>
        a === UNGROUPED ? 1 : b === UNGROUPED ? -1 : a.localeCompare(b),
      )
      .map(([area, items]) => [
        area,
        items.sort((x, y) => x.center.center_name.localeCompare(y.center.center_name)),
      ] as const);
  }, [creds, query]);

  const onCopy = async (c: CenterCredential) => {
    try {
      await navigator.clipboard.writeText(credentialMessage(c));
      toast.success(`Copied ${c.center.center_name}'s login`);
    } catch {
      toast.error("Could not copy — copy it manually");
    }
  };

  const onWhatsApp = (c: CenterCredential) => {
    const num = (c.center.whatsapp ?? c.center.phone ?? "").replace(/\D/g, "");
    if (!num) {
      toast.error("No WhatsApp/phone number on this centre");
      return;
    }
    const url = `https://wa.me/${num}?text=${encodeURIComponent(credentialMessage(c))}`;
    window.open(url, "_blank", "noopener");
  };

  const onDownloadAll = () => {
    if (!creds.length) return toast.error("No centres to export");
    const header = ["Area / City", "Centre", "Owner", "Phone", "WhatsApp", "User ID", "Password", "WhatsApp Link"];
    const data = creds
      .slice()
      .sort((a, b) =>
        (a.center.city ?? "~").localeCompare(b.center.city ?? "~") ||
        a.center.center_name.localeCompare(b.center.center_name),
      )
      .map((c) => {
        const num = (c.center.whatsapp ?? c.center.phone ?? "").replace(/\D/g, "");
        const link = num
          ? `https://wa.me/${num}?text=${encodeURIComponent(credentialMessage(c))}`
          : "";
        return [
          c.center.city ?? "",
          c.center.center_name,
          c.center.owner_name ?? "",
          c.center.phone ?? "",
          c.center.whatsapp ?? "",
          c.login_id,
          c.login_password,
          link,
        ];
      });
    const ws = XLSX.utils.aoa_to_sheet([header, ...data]);
    ws["!cols"] = [{ wch: 16 }, { wch: 26 }, { wch: 20 }, { wch: 16 }, { wch: 16 }, { wch: 22 }, { wch: 22 }, { wch: 40 }];
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Centre logins");
    XLSX.writeFile(wb, `centre-credentials-${new Date().toISOString().slice(0, 10)}.xlsx`);
    toast.success(`Exported ${creds.length} centre logins`);
  };

  return (
    <Card>
      <CardHeader className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="min-w-0">
          <CardTitle>Centre login credentials ({creds.length})</CardTitle>
          <CardDescription>
            A fixed User ID &amp; password for every uploaded centre, grouped by area.
            Copy a centre&apos;s login or send it straight to the owner on WhatsApp.
          </CardDescription>
        </div>
        <Button onClick={onDownloadAll} disabled={!creds.length} className="gap-2 shrink-0 sm:self-start">
          <Download className="size-4" /> Download all ({creds.length})
        </Button>
      </CardHeader>
      <CardContent className="space-y-6">
        <Input
          placeholder="Search centre, owner, area, user ID…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="h-9 w-full sm:w-80"
        />

        {loading && creds.length === 0 ? (
          <p className="text-center text-sm text-muted-foreground">Loading…</p>
        ) : creds.length === 0 ? (
          <p className="rounded-lg border border-dashed bg-muted/30 p-8 text-center text-sm text-muted-foreground">
            No centres yet. Upload a centre list on the Centers page and the logins will appear here.
          </p>
        ) : groups.length === 0 ? (
          <p className="text-center text-sm text-muted-foreground">No centres match your search.</p>
        ) : (
          groups.map(([area, items]) => (
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
                      <TableHead>Centre</TableHead>
                      <TableHead>Owner</TableHead>
                      <TableHead>User ID</TableHead>
                      <TableHead>Password</TableHead>
                      <TableHead className="text-right">Send</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {items.map((c) => (
                      <TableRow key={c.center.id}>
                        <TableCell className="font-medium">{c.center.center_name}</TableCell>
                        <TableCell>{c.center.owner_name ?? "—"}</TableCell>
                        <TableCell className="font-mono text-xs">{c.login_id}</TableCell>
                        <TableCell className="font-mono text-xs">{c.login_password}</TableCell>
                        <TableCell>
                          <div className="flex justify-end gap-1">
                            <Button
                              size="icon"
                              variant="ghost"
                              aria-label="Copy login"
                              title="Copy User ID & password"
                              onClick={() => onCopy(c)}
                            >
                              <Copy className="size-4" />
                            </Button>
                            <Button
                              size="icon"
                              variant="ghost"
                              aria-label="Send on WhatsApp"
                              title="Send login to the owner on WhatsApp"
                              onClick={() => onWhatsApp(c)}
                            >
                              <MessageCircle className="size-4 text-emerald-600" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </section>
          ))
        )}
      </CardContent>
    </Card>
  );
}
