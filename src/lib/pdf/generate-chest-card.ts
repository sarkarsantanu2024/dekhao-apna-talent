/**
 * Client-side chest-card generation. Runs entirely in the browser using
 * @react-pdf/renderer's `pdf()` function — no server roundtrip — so the demo
 * works against localStorage. When you switch to a real backend later this
 * same code keeps working; replace it with a server route only if you need to
 * gate downloads behind auth/RBAC.
 */

import { pdf } from "@react-pdf/renderer";
import { ChestCardDocument, ChestCardSheetDocument } from "./chest-card";
import { SITE_URL, EVENT_NAME } from "@/constants";
import { store } from "@/services";
import type { Student } from "@/types";

/** Same-origin URL for the fixed brand logo used on every chest card. */
function logoUrl(): string {
  const origin = typeof window !== "undefined" ? window.location.origin : SITE_URL;
  return `${origin}/mma-logo-white.png`;
}

export type ChestCardEligibility = "active" | "approved";

/** Statuses that may download a card. */
export const DOWNLOADABLE_STATUSES: ReadonlyArray<Student["status"]> = ["approved", "active"];

export function isDownloadable(s: Pick<Student, "status">): boolean {
  return DOWNLOADABLE_STATUSES.includes(s.status);
}

/** Filename pattern used everywhere (single & bulk). */
export function chestCardFilename(s: Pick<Student, "roll_number" | "full_name" | "id">): string {
  const safe = (s.roll_number ?? s.full_name ?? s.id).replace(/[^\w\-]+/g, "_");
  return `chest-card-${safe}.pdf`;
}

/** Generate a single chest-card PDF as a Blob (card on top, second slot blank). */
export async function generateChestCardBlob(student: Student): Promise<Blob> {
  const doc = ChestCardDocument({ student, logoUrl: logoUrl(), eventName: EVENT_NAME });
  return await pdf(doc).toBlob();
}

/**
 * Generate one combined PDF for many students — two different cards per A4 page.
 * An odd final student leaves the bottom slot blank.
 */
export async function generateChestCardsSheetBlob(students: Student[]): Promise<Blob> {
  const doc = ChestCardSheetDocument({ students, logoUrl: logoUrl(), eventName: EVENT_NAME });
  return await pdf(doc).toBlob();
}

/**
 * First successful chest-card download promotes the student from `approved`
 * to `active` — this is what the dashboard's "Active chest cards" metric
 * counts. Never downgrades: students already `active` stay `active`.
 */
async function markActivatedOnce(student: Student): Promise<void> {
  if (student.status !== "approved") return;
  try {
    await store.updateStudent(student.id, { status: "active" });
  } catch {
    // Activation is a nice-to-have; don't fail the user's download on a write error.
  }
}

/**
 * Trigger a browser download for a single chest card.
 * Uses file-saver so it works consistently across Chromium/Safari/Firefox.
 * Auto-activates the student on first successful download.
 */
export async function downloadChestCard(student: Student): Promise<void> {
  const blob = await generateChestCardBlob(student);
  const { saveAs } = await import("file-saver");
  saveAs(blob, chestCardFilename(student));
  await markActivatedOnce(student);
}

/**
 * Bundle all eligible students into one combined PDF — two different cards per
 * A4 page — and download it. `onProgress(done, total)` brackets the single
 * render so UIs can show a generating state while @react-pdf works.
 */
export async function downloadAllChestCards(
  students: Student[],
  opts?: { onProgress?: (done: number, total: number) => void; fileName?: string },
): Promise<void> {
  const eligible = students.filter(isDownloadable);
  if (eligible.length === 0) throw new Error("No approved students to download");

  opts?.onProgress?.(0, eligible.length);
  const blob = await generateChestCardsSheetBlob(eligible);
  opts?.onProgress?.(eligible.length, eligible.length);

  const { saveAs } = await import("file-saver");
  const stamp = new Date().toISOString().slice(0, 10);
  saveAs(blob, opts?.fileName ?? `chest-cards-${stamp}.pdf`);

  // Promote everyone whose card was just bundled into the sheet.
  await Promise.all(eligible.map(markActivatedOnce));
}
