"use client";

import { useRef, useState } from "react";
import { toast } from "sonner";
import { Upload, FileSpreadsheet, Download } from "lucide-react";
import * as XLSX from "xlsx";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { store } from "@/services";
import { calcAge } from "@/lib/utils";
import type { Category, Student } from "@/types";

type Props = {
  categories: Category[];
  centerName: string;
  centerId: string | null;
  centerCity?: string | null;
  centerState?: string | null;
  centerPincode?: string | null;
  onDone?: () => void;
};

const ALL = "__all__"; // "All (mixed)" — never block; category-less rows → Other Talent
const norm = (s: string) => s.toLowerCase().replace(/[\s_.\-]+/g, "");
const digits = (s: string) => (s || "").replace(/\D/g, "");

/**
 * Identity key for duplicate detection: name + phone. DOB is intentionally
 * excluded — spreadsheet date cells parse into inconsistent formats, which made
 * the old name+DOB+phone key miss real duplicates. Name + phone is stable.
 */
export function studentKey(s: Pick<Student, "full_name" | "phone">): string {
  return `${norm(s.full_name ?? "")}|${digits(s.phone ?? "")}`;
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
  "Name", "Father's Name", "Date of Birth", "Age", "Class", "School",
  "Category", "Phone", "WhatsApp", "City", "State", "Pincode", "Address",
  "Performance Topic", "Performance Details",
];

export function StudentBulkUpload({
  categories,
  centerName,
  centerId,
  centerCity,
  centerState,
  centerPincode,
  onDone,
}: Props) {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [busy, setBusy] = useState(false);
  const [defaultCatId, setDefaultCatId] = useState<string>(ALL); // default to "All (mixed)" so imports never block

  function resolveCategory(name: string): Category | null {
    if (name) {
      const n = norm(name);
      const match = categories.find(
        (c) => norm(c.name) === n || norm(c.slug) === n || norm(c.prefix) === n
      );
      if (match) return match;
    }
    // "All (mixed)" — never block: send category-less rows to the Other Talent bucket.
    if (defaultCatId === ALL) {
      return categories.find((c) => c.slug === "other-talent") ?? categories[0] ?? null;
    }
    return categories.find((c) => c.id === defaultCatId) ?? null;
  }

  async function handleFile(file: File) {
    setBusy(true);
    try {
      const buf = await file.arrayBuffer();
      const wb = XLSX.read(buf, { type: "array", cellDates: true });
      const sheet = wb.Sheets[wb.SheetNames[0]];
      const rows = XLSX.utils.sheet_to_json<Record<string, unknown>>(sheet, { defval: "" });
      if (!rows.length) {
        toast.error("That file has no rows.");
        return;
      }

      // Existing students (this centre) + already-seen-in-file → skip duplicates.
      const existing = await store.listStudents(centerId ? { centerId } : undefined);
      const seen = new Set(existing.map(studentKey));

      let added = 0;
      const errors: string[] = [];

      for (let i = 0; i < rows.length; i++) {
        const row = rows[i];
        const rowNo = i + 2; // header is row 1

        const full_name = pick(
          row, "full name", "name", "name of the candidate", "candidate name",
          "candidate", "student name", "student", "students name"
        );
        if (!full_name || full_name.length < 2) {
          errors.push(`Row ${rowNo}: missing name`);
          continue;
        }

        const categoryName = pick(row, "category", "category name", "event");
        const cat = resolveCategory(categoryName);
        if (!cat) {
          errors.push(`Row ${rowNo}: no category (pick a default above or add a Category column)`);
          continue;
        }

        const dob = toISODate(rawPick(row, "dob", "date of birth", "birth date", "birthdate"));
        const phone = pick(row, "phone", "mobile", "contact", "phone number", "phone no");
        const key = studentKey({ full_name, phone });
        if (seen.has(key)) {
          errors.push(`Row ${rowNo}: duplicate "${full_name}"`);
          continue;
        }

        let age = Number(pick(row, "age"));
        if (!Number.isFinite(age) || age <= 0) age = calcAge(dob) || 6;

        try {
          await store.createStudent({
            full_name,
            guardian_name:
              pick(row, "guardian name", "guardian", "parent", "parent name",
                "father's name", "fathers name", "father name", "father",
                "mother's name", "mothers name", "mother") || "—",
            dob,
            age,
            class: pick(row, "class", "grade", "std") || "—",
            school_name: pick(row, "school", "school name", "institution") || "—",
            category_id: cat.id,
            category_name: cat.name,
            center_id: centerId,
            center_name: centerName,
            phone: phone || "—",
            whatsapp: pick(row, "whatsapp", "whatsapp number") || phone || "—",
            address: pick(row, "address") || "—",
            city: pick(row, "city") || centerCity || null,
            state: pick(row, "state") || centerState || null,
            pincode: pick(row, "pincode", "pin", "zip") || centerPincode || null,
            photo_url: null,
            performance_topic: pick(row, "performance topic", "topic", "performance") || null,
            performance_details: pick(row, "performance details", "details") || null,
            created_by: null,
          });
          seen.add(key);
          added++;
        } catch (err) {
          errors.push(`Row ${rowNo}: ${err instanceof Error ? err.message : "failed"}`);
        }
      }

      if (added) toast.success(`Imported ${added} student${added > 1 ? "s" : ""}.`);
      if (errors.length) {
        toast.error(
          `${errors.length} row(s) skipped. ${errors.slice(0, 3).join(" · ")}${errors.length > 3 ? " …" : ""}`
        );
      }
      if (added) onDone?.();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not read that file.");
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
    XLSX.utils.book_append_sheet(wb, ws, "Students");
    XLSX.writeFile(wb, "student-upload-template.xlsx");
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
              Download the template, fill it in, then upload (.csv / .xls / .xlsx). One row per student.
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Select value={defaultCatId} onValueChange={setDefaultCatId}>
            <SelectTrigger className="h-9 w-48 bg-background text-sm">
              <SelectValue placeholder="Default category (optional)" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={ALL}>All (mixed)</SelectItem>
              {categories.map((c) => (
                <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button type="button" variant="outline" size="sm" onClick={downloadTemplate}>
            <Download className="size-4" /> Template
          </Button>
          <Button type="button" size="sm" disabled={busy} onClick={() => inputRef.current?.click()}>
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
