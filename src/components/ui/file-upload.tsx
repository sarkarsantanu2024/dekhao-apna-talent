"use client";

import { useId, useRef, useState } from "react";
import { UploadCloud, FileText, X } from "lucide-react";
import { cn } from "@/lib/utils";

type Props = {
  /** Called with the chosen file, or null when cleared. */
  onFile: (file: File | null) => void;
  accept?: string;
  /** Small helper line under the title (e.g. "PNG / JPG / PDF up to 5 MB"). */
  hint?: string;
  /** Current file name to display (parent-driven), if any. */
  fileName?: string | null;
  /** Image preview URL (data/remote) — shows a thumbnail instead of a file icon. */
  previewUrl?: string | null;
  className?: string;
};

/** Friendly drag-and-drop / click file picker with a styled drop zone. */
export function FileUpload({ onFile, accept, hint, fileName, previewUrl, className }: Props) {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [dragging, setDragging] = useState(false);
  const id = useId();
  const hasFile = Boolean(fileName || previewUrl);

  const pick = (file: File | null) => onFile(file);

  return (
    <div className={className}>
      <input
        ref={inputRef}
        id={id}
        type="file"
        accept={accept}
        className="sr-only"
        onChange={(e) => pick(e.target.files?.[0] ?? null)}
      />

      {hasFile ? (
        <div className="flex items-center gap-3 rounded-lg border bg-muted/30 p-3">
          {previewUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={previewUrl} alt="" className="size-12 shrink-0 rounded-md border object-cover" />
          ) : (
            <span className="flex size-10 shrink-0 items-center justify-center rounded-md bg-primary/10 text-primary">
              <FileText className="size-5" />
            </span>
          )}
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium">{fileName ?? "Selected file"}</p>
            <button
              type="button"
              onClick={() => inputRef.current?.click()}
              className="text-xs font-medium text-primary hover:underline"
            >
              Replace
            </button>
          </div>
          <button
            type="button"
            aria-label="Remove file"
            onClick={() => { pick(null); if (inputRef.current) inputRef.current.value = ""; }}
            className="inline-flex size-8 shrink-0 items-center justify-center rounded-md text-muted-foreground hover:bg-muted hover:text-foreground"
          >
            <X className="size-4" />
          </button>
        </div>
      ) : (
        <label
          htmlFor={id}
          onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
          onDragLeave={() => setDragging(false)}
          onDrop={(e) => {
            e.preventDefault();
            setDragging(false);
            pick(e.dataTransfer.files?.[0] ?? null);
          }}
          className={cn(
            "flex cursor-pointer flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed px-4 py-6 text-center transition-colors",
            dragging ? "border-primary bg-primary/5" : "border-input bg-muted/20 hover:border-primary/60 hover:bg-muted/40",
          )}
        >
          <span className="flex size-10 items-center justify-center rounded-full bg-primary/10 text-primary">
            <UploadCloud className="size-5" />
          </span>
          <span className="text-sm font-medium">
            <span className="text-primary">Click to upload</span> or drag &amp; drop
          </span>
          {hint && <span className="text-xs text-muted-foreground">{hint}</span>}
        </label>
      )}
    </div>
  );
}
