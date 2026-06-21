/**
 * Upload a file through the server `/api/upload` route, which stores it in the
 * matching Supabase Storage bucket (service-role, session-checked) and returns
 * a URL.
 *
 * Images are compressed client-side first (see ./image) so storage + bandwidth
 * stay small at scale. Works in both modes: with Supabase configured it returns
 * a real https URL; in local demo mode the mock storage returns a data URL.
 * Either way the value is safe to persist and render via <img> / ScreenshotLink.
 */
import { toast } from "sonner";
import { compressImage, type CompressOptions } from "./image";

export type UploadBucket = "payment-screenshots" | "student-photos" | "event-assets";

/** Per-bucket compression targets — keeps ~6k–20k students within plan limits. */
const COMPRESSION: Record<UploadBucket, CompressOptions> = {
  "student-photos":       { maxDimension: 600,  targetBytes: 50 * 1024 },   // ~50 KB passport photo
  "payment-screenshots":  { maxDimension: 1280, targetBytes: 100 * 1024 },  // ~100 KB, stays readable
  "event-assets":         { maxDimension: 1600, targetBytes: 300 * 1024 },
};

/** Above this, the original file is considered "large / uncompressed" → warn. */
const WARN_OVER_BYTES = 1024 * 1024; // 1 MB

const mb = (b: number) => (b / (1024 * 1024)).toFixed(1);
const kb = (b: number) => Math.max(1, Math.round(b / 1024));

/** Pop a warning when a big, uncompressed file is uploaded. */
function warnIfOversized(original: File, uploaded: File): void {
  if (original.size <= WARN_OVER_BYTES) return;
  if (original.type.startsWith("image/") && uploaded.size < original.size) {
    toast.warning(
      `Large image (${mb(original.size)} MB) was auto-compressed to ~${kb(uploaded.size)} KB. ` +
        `Tip: upload images under 1 MB for the best quality and faster uploads.`,
    );
  } else {
    // Non-image (e.g. a PDF screenshot) or an image that wouldn't compress.
    toast.warning(
      `Large file (${mb(original.size)} MB) couldn't be compressed. ` +
        `Please upload a smaller, compressed ${original.type === "application/pdf" ? "PDF" : "image"} to save storage.`,
    );
  }
}

export async function uploadFile(file: File, bucket: UploadBucket): Promise<string> {
  const settings = COMPRESSION[bucket];
  const toUpload = settings ? await compressImage(file, settings) : file;
  warnIfOversized(file, toUpload);

  const fd = new FormData();
  fd.append("file", toUpload);
  fd.append("bucket", bucket);
  const res = await fetch("/api/upload", { method: "POST", body: fd });
  let json: { url?: string; error?: string } = {};
  try {
    json = await res.json();
  } catch {
    /* non-JSON error body */
  }
  if (!res.ok || !json.url) {
    throw new Error(json.error ?? `Upload failed (${res.status})`);
  }
  return json.url;
}

/**
 * Best-effort removal of previously-uploaded files from Storage (so deleting /
 * replacing a screenshot or photo doesn't leave orphans eating quota). Only
 * touches real https Storage URLs — data URLs / placeholders are ignored.
 * Never throws.
 */
export async function deleteUploadedFiles(
  urls: string | null | undefined | Array<string | null | undefined>,
): Promise<void> {
  const list = (Array.isArray(urls) ? urls : [urls]).filter(
    (u): u is string => typeof u === "string" && u.startsWith("http"),
  );
  if (!list.length) return;
  try {
    await fetch("/api/upload", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ urls: list }),
    });
  } catch {
    /* cleanup is non-critical */
  }
}
