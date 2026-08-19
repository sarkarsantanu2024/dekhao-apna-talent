"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Check, ChevronDown, Search } from "lucide-react";
import { cn } from "@/lib/utils";

type Option = { value: string; label: string };

/**
 * A Select look-alike with a search box inside the dropdown — for long lists
 * (e.g. centres) where scanning a plain dropdown stops working. Styled to
 * match ui/select.tsx. Dependency-free (no Radix/cmdk): Radix Select's
 * typeahead steals keystrokes from an embedded input, so this rolls its own
 * tiny popover.
 */
export function SearchableSelect({
  value,
  onValueChange,
  options,
  placeholder = "Select…",
  searchPlaceholder = "Type to search…",
  className,
}: {
  value: string;
  onValueChange: (v: string) => void;
  options: Option[];
  placeholder?: string;
  searchPlaceholder?: string;
  className?: string;
}) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const rootRef = useRef<HTMLDivElement | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  // Fresh search on every open, cursor ready in the box.
  useEffect(() => {
    if (open) {
      setQuery("");
      inputRef.current?.focus();
    }
  }, [open]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return options;
    return options.filter((o) => o.label.toLowerCase().includes(q));
  }, [options, query]);

  const selected = options.find((o) => o.value === value);

  return (
    <div ref={rootRef} className={cn("relative", className)}>
      {/* role="combobox" also opts the trigger into the app's unlayered
          global form-control styling (h-12, flat, 0.3rem radius) so it renders
          identically to the Radix SelectTrigger. */}
      <button
        type="button"
        role="combobox"
        onClick={() => setOpen((v) => !v)}
        aria-haspopup="listbox"
        aria-expanded={open}
        className="flex h-9 w-full items-center justify-between gap-2 rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-ring"
      >
        <span
          title={selected?.label}
          className={cn("line-clamp-1 text-left", !selected && "text-muted-foreground")}
        >
          {selected?.label ?? placeholder}
        </span>
        <ChevronDown className="size-4 shrink-0 opacity-50" />
      </button>

      {/* Panel is w-max so it can grow past the trigger — long names fit. */}
      {open && (
        <div className="absolute z-50 mt-1 w-max min-w-full max-w-80 overflow-hidden rounded-md border bg-popover text-popover-foreground shadow-md">
          <div className="flex items-center gap-2 border-b px-2">
            <Search className="size-3.5 shrink-0 opacity-50" />
            <input
              ref={inputRef}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={searchPlaceholder}
              className="h-8 w-full bg-transparent text-sm outline-none placeholder:text-muted-foreground"
            />
          </div>
          <ul role="listbox" className="max-h-64 overflow-y-auto p-1">
            {filtered.length === 0 ? (
              <li className="px-2 py-2 text-sm text-muted-foreground">No match.</li>
            ) : (
              filtered.map((o) => (
                <li key={o.value}>
                  <button
                    type="button"
                    role="option"
                    aria-selected={o.value === value}
                    onClick={() => {
                      onValueChange(o.value);
                      setOpen(false);
                    }}
                    className="relative flex w-full items-center rounded-sm py-1.5 pl-8 pr-2 text-left text-sm hover:bg-accent hover:text-accent-foreground"
                  >
                    {o.value === value && <Check className="absolute left-2 size-4" />}
                    {/* Full label, wrapping — truncated centre names are unreadable. */}
                    <span className="whitespace-normal wrap-break-word">{o.label}</span>
                  </button>
                </li>
              ))
            )}
          </ul>
        </div>
      )}
    </div>
  );
}
