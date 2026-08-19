import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(amount: number, currency = "INR") {
  return new Intl.NumberFormat("en-IN", { style: "currency", currency }).format(amount);
}

export function formatDate(d: string | Date) {
  const date = typeof d === "string" ? new Date(d) : d;
  return date.toLocaleDateString("en-IN", { year: "numeric", month: "short", day: "2-digit" });
}

export function calcAge(dob: string | Date): number {
  const d = typeof dob === "string" ? new Date(dob) : dob;
  const now = new Date();
  let age = now.getFullYear() - d.getFullYear();
  const m = now.getMonth() - d.getMonth();
  if (m < 0 || (m === 0 && now.getDate() < d.getDate())) age--;
  return age;
}

/** Label for rows that have no area/city set. */
export const UNGROUPED_AREA = "Other / Unspecified";

/**
 * Group a list by area / city / locality. Returns `[area, items][]` sorted
 * alphabetically, with the "unspecified" bucket pushed last. Empty/blank areas
 * collapse into `UNGROUPED_AREA`. Matching is case-insensitive ("Durgapur" and
 * "DURGAPUR" are one group — real data mixes casings); the first-seen spelling
 * becomes the display label.
 */
export function groupByArea<T>(
  items: T[],
  getArea: (item: T) => string | null | undefined,
): [string, T[]][] {
  const map = new Map<string, { label: string; items: T[] }>();
  for (const item of items) {
    const label = getArea(item)?.trim() || UNGROUPED_AREA;
    const key = label.toLowerCase();
    const bucket = map.get(key);
    if (bucket) bucket.items.push(item);
    else map.set(key, { label, items: [item] });
  }
  return [...map.values()]
    .sort((a, b) =>
      a.label === UNGROUPED_AREA ? 1 : b.label === UNGROUPED_AREA ? -1 : a.label.localeCompare(b.label),
    )
    .map(({ label, items: groupItems }) => [label, groupItems]);
}
