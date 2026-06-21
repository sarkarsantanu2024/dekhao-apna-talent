"use client";

import { toast } from "sonner";

/**
 * "View" link for a payment screenshot.
 *
 * Screenshots are stored either as a `data:` URL (local demo) or a real
 * https URL (Supabase Storage). Browsers BLOCK navigating a new tab straight
 * to a `data:` URL, so a plain `<a href="data:…">` silently does nothing —
 * we convert data URLs to a short-lived Blob URL (which IS allowed to open),
 * and open real URLs directly.
 */
function dataUrlToBlobUrl(dataUrl: string): string {
  const [meta, b64 = ""] = dataUrl.split(",");
  const mime = /data:(.*?)(;base64)?$/.exec(meta)?.[1] || "application/octet-stream";
  const bytes = atob(b64);
  const arr = new Uint8Array(bytes.length);
  for (let i = 0; i < bytes.length; i++) arr[i] = bytes.charCodeAt(i);
  return URL.createObjectURL(new Blob([arr], { type: mime }));
}

export function ScreenshotLink({
  url,
  className = "text-primary hover:underline",
}: {
  url: string | null | undefined;
  className?: string;
}) {
  if (!url) return <span className="text-muted-foreground">—</span>;

  const open = () => {
    try {
      const href = url.startsWith("data:") ? dataUrlToBlobUrl(url) : url;
      const win = window.open(href, "_blank", "noopener");
      if (!win) {
        toast.error("Allow pop-ups for this site to view the screenshot");
      } else if (href !== url) {
        // Revoke the temporary blob URL once the new tab has had time to load.
        setTimeout(() => URL.revokeObjectURL(href), 60_000);
      }
    } catch {
      toast.error("Could not open the screenshot");
    }
  };

  return (
    <button type="button" onClick={open} className={className}>
      View
    </button>
  );
}
