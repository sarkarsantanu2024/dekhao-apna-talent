"use client";

import { useRef, useState } from "react";
import { toast } from "sonner";
import { Upload, FileSpreadsheet, Download } from "lucide-react";
import * as XLSX from "xlsx";
import { Button } from "@/components/ui/button";
import { store } from "@/services";
import type { Center } from "@/types";

type Props = {
  onDone?: () => void;
};

const norm = (s: string) => s.toLowerCase().replace(/[\s_.\-]+/g, "");

/** Identity key for duplicate detection: centre name + city. */
function centerKey(c: Pick<Center, "center_name" | "city">): string {
  return `${norm(c.center_name ?? "")}|${norm(c.city ?? "")}`;
}

function rawPick(row: Record<string, unknown>, ...aliases: string[]): unknown {
  const wanted = aliases.map(norm);
  for (const key of Object.keys(row)) {
    if (wanted.includes(norm(key))) return row[key];
  }
  return "";
}

function pick(row: Record<string, unknown>, ...aliases: string[]): string {
  const v = rawPick(row, ...aliases);
  return v == null ? "" : String(v).trim();
}

/** Normalise any date cell (Date object, ISO string, or Excel value) to YYYY-MM-DD. */
function toISODate(v: unknown): string {
  if (v == null || v === "") return "";
  const d = v instanceof Date ? v : new Date(String(v));
  if (Number.isNaN(d.getTime())) return String(v).trim();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

const TEMPLATE_COLUMNS = [
  "Centre Name",
  "Owner",
  "Phone",
  "WhatsApp Number",
  "Address",
  "City",
  "State",
  "Pincode",
  "Start Date",
];

export function CenterBulkUpload({ onDone }: Props) {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [busy, setBusy] = useState(false);

  async function handleFile(file: File) {
    setBusy(true);
    try {
      const buf = await file.arrayBuffer();
      const wb = XLSX.read(buf, { type: "array", cellDates: true });
      const sheet = wb.Sheets[wb.SheetNames[0]];
      const rows = XLSX.utils.sheet_to_json<Record<string, unknown>>(sheet, {
        defval: "",
      });
      if (!rows.length) {
        toast.error("That file has no rows.");
        return;
      }

      // Existing centres + already-seen-in-file → skip exact duplicates so a
      // re-upload doesn't double the list (and re-seed students). Any column
      // layout is accepted — we map by alias and take whatever is present.
      const existing = await store.listCenters();
      const seen = new Set(existing.map(centerKey));

      const createdCenters: Center[] = [];
      let skipped = 0;

      for (let i = 0; i < rows.length; i++) {
        const row = rows[i];

        const center_name = pick(
          row,
          "centre name", "center name", "centre", "center",
          "name", "branch", "branch name", "institute", "institution",
          "academy", "school", "centre/branch",
        );
        // The only hard requirement: a non-empty centre name. Everything else
        // is optional — don't block the row, just take what the CSV provides.
        if (!center_name) { skipped++; continue; }

        const city = pick(row, "city", "town", "location", "district") || null;
        const key = centerKey({ center_name, city });
        if (seen.has(key)) { skipped++; continue; }

        const phone = pick(row, "phone", "mobile", "contact", "phone number", "mobile no", "contact no", "contact number");
        try {
          const created = await store.createCenter({
            center_name,
            owner_name:
              pick(row, "owner", "owner name", "contact person", "proprietor", "incharge", "person") || null,
            phone: phone || null,
            whatsapp:
              pick(row, "whatsapp", "whatsapp number", "whatsapp no", "wa") ||
              phone ||
              null,
            address: pick(row, "address", "addr", "location") || null,
            city,
            state: pick(row, "state", "province") || null,
            pincode: pick(row, "pincode", "pin", "zip", "postal", "postal code") || null,
            start_date:
              toISODate(
                rawPick(row, "start date", "startdate", "joined", "join date", "date"),
              ) || null,
            // New centres start as not participating — the flag auto-flips to
            // true once they upload a valid payment screenshot.
            participating: false,
          });
          seen.add(key);
          createdCenters.push(created);
        } catch {
          skipped++;
        }
      }

      const added = createdCenters.length;

      if (added) {
        toast.success(`Imported ${added} centre${added > 1 ? "s" : ""}.`);
      }
      if (skipped) {
        toast.message(
          `${skipped} row${skipped > 1 ? "s" : ""} skipped (blank or duplicate centre name).`,
        );
      }
      if (!added && !skipped) toast.error("No centre rows found in that file.");
      if (added) onDone?.();
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Could not read that file.",
      );
    } finally {
      setBusy(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  }

  /** Download a blank spreadsheet template (.xlsx) with the column headers to fill in. */
  function downloadTemplate() {
    const ws = XLSX.utils.aoa_to_sheet([TEMPLATE_COLUMNS]);
    ws["!cols"] = TEMPLATE_COLUMNS.map(() => ({ wch: 18 }));
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Centres");
    XLSX.writeFile(wb, "centre-upload-template.xlsx");
  }

  return (
    <div className="mb-6 rounded-lg border border-dashed bg-muted/30 p-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-start gap-3">
          <span className="mt-0.5 inline-flex size-9 items-center justify-center rounded-md bg-primary/10 text-primary">
            <FileSpreadsheet className="size-5" />
          </span>
          <div>
            <p className="text-sm font-semibold">Bulk add from spreadsheet</p>
            <p className="text-xs text-muted-foreground">
              Download the template, fill it in, then upload (.csv / .xls /
              .xlsx). One row per centre.
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={downloadTemplate}
          >
            <Download className="size-4" /> Template
          </Button>

          <Button
            type="button"
            size="sm"
            disabled={busy}
            onClick={() => inputRef.current?.click()}
          >
            <Upload className="size-4" /> {busy ? "Importing…" : "Upload file"}
          </Button>
        </div>
      </div>
      <input
        ref={inputRef}
        type="file"
        accept=".csv,.xls,.xlsx,text/csv,application/vnd.ms-excel,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
        className="hidden"
        onChange={(e) => {
          const f = e.target.files?.[0];
          if (f) handleFile(f);
        }}
      />
    </div>
  );
}
