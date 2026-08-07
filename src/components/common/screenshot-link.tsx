"use client";

import { useState } from "react";
import { toast } from "sonner";
import { ExternalLink, ImageOff, ZoomIn } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

/**
 * Payment screenshots decide whether a payment is approved, so they are shown
 * as a visible thumbnail rather than a "View" link the reviewer has to guess
 * at. Clicking opens a full-size preview; the original still opens in a tab.
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

function openInNewTab(url: string) {
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
}

/**
 * Thumbnail + click-to-zoom preview of a payment screenshot.
 * `label` / `caption` describe the payment inside the zoom dialog so the
 * reviewer can check the amount against what the screenshot shows.
 */
export function ScreenshotPreview({
  url,
  label = "Payment screenshot",
  caption,
}: {
  url: string | null | undefined;
  label?: string;
  caption?: string;
}) {
  const [open, setOpen] = useState(false);
  const [broken, setBroken] = useState(false);

  if (!url) {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-md bg-muted px-2 py-1 text-xs text-muted-foreground">
        <ImageOff className="size-3.5" /> No screenshot
      </span>
    );
  }

  if (broken) {
    return (
      <button
        type="button"
        onClick={() => openInNewTab(url)}
        className="inline-flex items-center gap-1.5 rounded-md bg-muted px-2 py-1 text-xs text-muted-foreground hover:text-foreground"
        title="Preview could not load — open the original"
      >
        <ImageOff className="size-3.5" /> Open original
      </button>
    );
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        title="Click to enlarge the payment screenshot"
        className="group relative block size-14 overflow-hidden rounded-md border bg-muted transition hover:ring-2 hover:ring-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={url}
          alt={label}
          onError={() => setBroken(true)}
          className="size-full object-cover"
        />
        <span className="absolute inset-0 flex items-center justify-center bg-black/45 opacity-0 transition group-hover:opacity-100">
          <ZoomIn className="size-4 text-white" />
        </span>
      </button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>{label}</DialogTitle>
            {caption && <DialogDescription>{caption}</DialogDescription>}
          </DialogHeader>
          <div className="flex max-h-[70vh] justify-center overflow-auto rounded-md border bg-muted/40 p-2">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={url} alt={label} className="h-auto max-w-full object-contain" />
          </div>
          <div className="flex justify-end">
            <Button variant="outline" size="sm" className="gap-1.5" onClick={() => openInNewTab(url)}>
              <ExternalLink className="size-4" /> Open in new tab
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
