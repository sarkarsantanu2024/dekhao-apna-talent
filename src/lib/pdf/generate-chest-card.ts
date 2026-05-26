/**
 * Client-side chest-card generation. Runs entirely in the browser using
 * @react-pdf/renderer's `pdf()` function — no server roundtrip — so the demo
 * works against localStorage. When you switch to a real backend later this
 * same code keeps working; replace it with a server route only if you need to
 * gate downloads behind auth/RBAC.
 */

import { pdf } from "@react-pdf/renderer";
import QRCode from "qrcode";
import { ChestCardDocument } from "./chest-card";
import { SITE_URL, EVENT_NAME } from "@/constants";
import { store } from "@/services";
import type { Student } from "@/types";

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

/** Build the QR payload (URL the audition desk scans). */
function qrPayload(student: Pick<Student, "roll_number">): string {
  return `${SITE_URL}/verify?roll=${encodeURIComponent(student.roll_number ?? "")}`;
}

/** Generate a single chest-card PDF as a Blob. */
export async function generateChestCardBlob(student: Student): Promise<Blob> {
  const qrDataUrl = await QRCode.toDataURL(qrPayload(student), { width: 256, margin: 1 });
  const doc = ChestCardDocument({ student, qrDataUrl, eventName: EVENT_NAME });
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
 * Bundle all eligible students' chest cards into one ZIP and download it.
 * Progress reporting via the optional `onProgress(done, total)` callback so
 * UIs can show "Generating 3/12…" while it runs.
 */
export async function downloadChestCardsZip(
  students: Student[],
  opts?: { onProgress?: (done: number, total: number) => void; zipName?: string },
): Promise<void> {
  const eligible = students.filter(isDownloadable);
  if (eligible.length === 0) throw new Error("No approved students to download");

  const [{ default: JSZip }, { saveAs }] = await Promise.all([
    import("jszip"),
    import("file-saver"),
  ]);
  const zip = new JSZip();

  let done = 0;
  opts?.onProgress?.(done, eligible.length);
  for (const s of eligible) {
    const blob = await generateChestCardBlob(s);
    zip.file(chestCardFilename(s), blob);
    done++;
    opts?.onProgress?.(done, eligible.length);
  }

  const zipBlob = await zip.generateAsync({ type: "blob" });
  const stamp = new Date().toISOString().slice(0, 10);
  saveAs(zipBlob, opts?.zipName ?? `chest-cards-${stamp}.zip`);

  // Promote everyone whose card was just bundled into the ZIP.
  await Promise.all(eligible.map(markActivatedOnce));
}
