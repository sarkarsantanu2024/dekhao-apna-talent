"use client";

import { useRef, useState } from "react";
import { toast } from "sonner";
import { Upload, FileSpreadsheet, Download } from "lucide-react";
import * as XLSX from "xlsx";
import { Button } from "@/components/ui/button";
import { store } from "@/services";
import { EVENT_YEAR } from "@/constants";
import type { Category, Center } from "@/types";

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

/* ============================================================================
 * ⚠️ DEMO-ONLY LOGIC — REMOVE FOR REAL DATA ⚠️
 * ----------------------------------------------------------------------------
 * The block below auto-generates fake students for every centre imported from
 * the CSV, purely so the client demo shows populated Students / Dashboard /
 * Reports pages. It is NOT part of the real flow.
 *
 * When real data is confirmed: delete `seedStudentsForCenter` (and the name
 * pools + STUDENTS_PER_CENTER) and remove the call to it inside `handleFile`.
 * Then only the real centres are imported and real students sync in normally.
 * ========================================================================== */

const STUDENTS_PER_CENTER = 5;

const FIRST_NAMES = [
  "Aarav", "Anika", "Ishaan", "Diya", "Vihaan", "Saanvi", "Reyansh", "Anaya",
  "Aditya", "Myra", "Kabir", "Aarohi", "Aryan", "Pari", "Vivaan", "Tara",
  "Rohan", "Sara", "Dev", "Ira",
];
const LAST_NAMES = [
  "Sharma", "Banerjee", "Roy", "Sen", "Bose", "Ghosh", "Mukherjee", "Dutta",
  "Pal", "Chakraborty", "Chatterjee", "Mitra", "Das", "Mondal", "Saha",
];

/**
 * Create a batch of demo students for a freshly-imported centre, so every
 * real centre lands with a populated Students list (and feeds the dashboard /
 * reports) instead of being empty. Each student gets a real roll number from
 * the store's counter via `createStudent`.
 */
async function seedStudentsForCenter(
  center: Center,
  categories: Category[],
  startIndex: number,
): Promise<number> {
  if (!categories.length) return 0;
  let made = 0;
  for (let i = 0; i < STUDENTS_PER_CENTER; i++) {
    const g = startIndex + i; // global index → keeps names varied across centres
    const first = FIRST_NAMES[g % FIRST_NAMES.length];
    const last = LAST_NAMES[(g * 3 + 1) % LAST_NAMES.length];
    const cat = categories[i % categories.length];
    const age = 7 + (g % 7);
    const phoneTail = String(10000 + (g % 90000)).padStart(5, "0");
    try {
      await store.createStudent({
        full_name: `${first} ${last}`,
        guardian_name: `${last} (Parent)`,
        dob: `${EVENT_YEAR - age}-${String((g % 12) + 1).padStart(2, "0")}-15`,
        age,
        class: `Class ${Math.max(1, age - 5)}`,
        school_name: `${center.city ?? "City"} Public School`,
        category_id: cat.id,
        category_name: cat.name,
        center_id: center.id,
        center_name: center.center_name,
        phone: `+91 90000 ${phoneTail}`,
        whatsapp: `+91 90000 ${phoneTail}`,
        address: center.address ?? "—",
        city: center.city,
        state: center.state,
        pincode: center.pincode,
        // No placeholder photo on purpose: the chest card only unlocks once the
        // centre owner uploads a real student image (plus payment approval).
        photo_url: null,
        performance_topic: null,
        performance_details: null,
        created_by: null,
        // All demo students start as "pending" for the client demo.
        status: "pending",
      });
      made++;
    } catch {
      /* skip individual failures, keep going */
    }
  }
  return made;
}

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

      // Populate each freshly-imported centre with demo students so the
      // Students/Dashboard/Reports views show real per-centre data.
      let studentsMade = 0;
      if (added) {
        const categories = await store.listCategories();
        for (let i = 0; i < createdCenters.length; i++) {
          studentsMade += await seedStudentsForCenter(
            createdCenters[i],
            categories,
            i * STUDENTS_PER_CENTER,
          );
        }
      }

      if (added) {
        toast.success(
          `Imported ${added} centre${added > 1 ? "s" : ""}` +
            (studentsMade ? ` with ${studentsMade} students` : "") +
            ".",
        );
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
