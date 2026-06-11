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

/** A few realistic rows so admins can test the import end-to-end. */
const SAMPLE_ROWS: string[][] = [
  [
    "Mind Mantra · Barasat",
    "Sourav Ghosh",
    "+91 98301 55501",
    "+91 98301 55501",
    "Station Road",
    "Barasat",
    "West Bengal",
    "700124",
    "2026-03-01",
  ],
  [
    "Mind Mantra · Asansol",
    "Nibedita Pal",
    "+91 98301 55502",
    "+91 98301 55502",
    "GT Road",
    "Asansol",
    "West Bengal",
    "713301",
    "2026-03-04",
  ],
  [
    "Mind Mantra · Siliguri",
    "Rajat Roy",
    "+91 98301 55503",
    "+91 98301 55503",
    "Hill Cart Road",
    "Siliguri",
    "West Bengal",
    "734001",
    "2026-03-08",
  ],
  [
    "Mind Mantra · Behala",
    "Moumita Dutta",
    "+91 98301 55504",
    "+91 98301 55504",
    "Diamond Harbour Rd",
    "Kolkata",
    "West Bengal",
    "700034",
    "2026-03-12",
  ],
  [
    "Mind Mantra · Kharagpur",
    "Anil Mahato",
    "+91 98301 55505",
    "+91 98301 55505",
    "Malancha Road",
    "Kharagpur",
    "West Bengal",
    "721301",
    "2026-03-15",
  ],
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

      // Existing centres + already-seen-in-file → skip duplicates.
      const existing = await store.listCenters();
      const seen = new Set(existing.map(centerKey));

      let added = 0;
      const errors: string[] = [];

      for (let i = 0; i < rows.length; i++) {
        const row = rows[i];
        const rowNo = i + 2; // header is row 1

        const center_name = pick(
          row,
          "centre name",
          "center name",
          "centre",
          "center",
          "name",
        );
        if (!center_name || center_name.length < 2) {
          errors.push(`Row ${rowNo}: missing centre name`);
          continue;
        }

        const city = pick(row, "city", "town") || null;
        const key = centerKey({ center_name, city });
        if (seen.has(key)) {
          errors.push(`Row ${rowNo}: duplicate "${center_name}"`);
          continue;
        }

        const phone = pick(row, "phone", "mobile", "contact", "phone number");
        try {
          await store.createCenter({
            center_name,
            owner_name:
              pick(row, "owner", "owner name", "contact person") || null,
            phone: phone || null,
            whatsapp:
              pick(row, "whatsapp", "whatsapp number", "whatsapp no") ||
              phone ||
              null,
            address: pick(row, "address") || null,
            city,
            state: pick(row, "state") || null,
            pincode: pick(row, "pincode", "pin", "zip") || null,
            start_date:
              toISODate(
                rawPick(row, "start date", "startdate", "joined", "join date"),
              ) || null,
            // New centres start as not participating — the flag auto-flips to
            // true once they upload a valid payment screenshot.
            participating: false,
          });
          seen.add(key);
          added++;
        } catch (err) {
          errors.push(
            `Row ${rowNo}: ${err instanceof Error ? err.message : "failed"}`,
          );
        }
      }

      if (added)
        toast.success(`Imported ${added} centre${added > 1 ? "s" : ""}.`);
      if (errors.length) {
        toast.error(
          `${errors.length} row(s) skipped. ${errors.slice(0, 3).join(" · ")}${errors.length > 3 ? " …" : ""}`,
        );
      }
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

  /** Download a ready-to-import sample file (.xlsx) pre-filled with example centres. */
  function downloadSample() {
    const ws = XLSX.utils.aoa_to_sheet([TEMPLATE_COLUMNS, ...SAMPLE_ROWS]);
    ws["!cols"] = TEMPLATE_COLUMNS.map(() => ({ wch: 18 }));
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Centres");
    XLSX.writeFile(wb, "centre-list-sample.xlsx");
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
