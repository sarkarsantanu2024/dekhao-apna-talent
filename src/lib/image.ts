/**
 * Client-side image compression — resize + JPEG re-encode toward a target size.
 *
 * Runs before upload so payment screenshots / student photos land in Supabase
 * Storage small (keeps storage + bandwidth well within budget at scale). Images
 * only; non-images (e.g. PDF screenshots) pass through untouched. Always
 * degrades gracefully — on any failure it returns the original file.
 */

export type CompressOptions = {
  /** Longest side is scaled down to at most this many pixels. */
  maxDimension: number;
  /** Re-encode quality is lowered until the JPEG is under this size (best-effort). */
  targetBytes: number;
};

type Drawable = { source: CanvasImageSource; width: number; height: number; close?: () => void };

async function loadDrawable(file: File): Promise<Drawable | null> {
  if (typeof createImageBitmap === "function") {
    try {
      const bmp = await createImageBitmap(file, { imageOrientation: "from-image" } as ImageBitmapOptions);
      return { source: bmp, width: bmp.width, height: bmp.height, close: () => bmp.close() };
    } catch {
      /* fall back to <img> below */
    }
  }
  return new Promise((resolve) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      resolve({ source: img, width: img.naturalWidth, height: img.naturalHeight });
      URL.revokeObjectURL(url);
    };
    img.onerror = () => {
      resolve(null);
      URL.revokeObjectURL(url);
    };
    img.src = url;
  });
}

function canvasToBlob(canvas: HTMLCanvasElement, quality: number): Promise<Blob | null> {
  return new Promise((resolve) => canvas.toBlob((b) => resolve(b), "image/jpeg", quality));
}

export async function compressImage(file: File, opts: CompressOptions): Promise<File> {
  // SSR / non-image (PDF etc.) → leave untouched.
  if (typeof document === "undefined") return file;
  if (!file.type.startsWith("image/")) return file;

  const drawable = await loadDrawable(file);
  if (!drawable) return file;

  try {
    const scale = Math.min(1, opts.maxDimension / Math.max(drawable.width, drawable.height));
    const w = Math.max(1, Math.round(drawable.width * scale));
    const h = Math.max(1, Math.round(drawable.height * scale));

    const canvas = document.createElement("canvas");
    canvas.width = w;
    canvas.height = h;
    const ctx = canvas.getContext("2d");
    if (!ctx) return file;
    // White matte so transparent PNGs don't turn black when flattened to JPEG.
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, w, h);
    ctx.drawImage(drawable.source, 0, 0, w, h);

    let quality = 0.82;
    let blob = await canvasToBlob(canvas, quality);
    while (blob && blob.size > opts.targetBytes && quality > 0.42) {
      quality = Math.max(0.4, quality - 0.1);
      blob = await canvasToBlob(canvas, quality);
    }

    // If compression didn't actually help (already-tiny source), keep the original.
    if (!blob || blob.size >= file.size) return file;

    const base = file.name.replace(/\.[^.]+$/, "") || "image";
    return new File([blob], `${base}.jpg`, { type: "image/jpeg", lastModified: file.lastModified });
  } finally {
    drawable.close?.();
  }
}
