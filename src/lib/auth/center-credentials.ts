/**
 * Deterministic centre-owner login credentials.
 *
 * Derived purely from the centre record the admin uploaded — no random
 * generation — so the same centre always maps to the same User ID + password.
 * The admin reads these off the Credentials page and sends them to each owner.
 *
 * Format (as requested):
 *   User ID  = slug(centre name)                       e.g. "mma.barrackpore"
 *   Password = owner name (title stripped) + phone     e.g. "rituray9830055501"
 *
 * Client-safe (no Node APIs) so it can be imported by React pages. These still
 * need to be persisted server-side (POST /api/center-logins) before an owner
 * can actually sign in — see the Credentials page.
 */

import type { Center } from "@/types";

/** Honorifics stripped from the owner name when building the password. */
const TITLES = new Set([
  "mr", "mrs", "ms", "miss", "mst", "dr", "prof",
  "smt", "sri", "shri", "shree", "md", "mohd", "kumari", "km",
]);

/** Lowercase, dot-separated slug — matches the existing centre-login style. */
export function centerUserId(name: string): string {
  return (
    name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, ".")
      .replace(/^\.+|\.+$/g, "")
      .replace(/\.{2,}/g, ".") || "centre"
  );
}

/** Owner name with any leading title removed (e.g. "Mr. Ritu Ray" → "Ritu Ray"). */
function ownerWithoutTitle(owner: string | null): string {
  const parts = (owner ?? "").trim().split(/\s+/).filter(Boolean);
  while (parts.length && TITLES.has(parts[0].toLowerCase().replace(/\.$/, ""))) {
    parts.shift();
  }
  return parts.join(" ");
}

/** Password = owner-name-without-title (alnum) + phone digits. */
export function centerPassword(center: Center): string {
  const owner = ownerWithoutTitle(center.owner_name).toLowerCase().replace(/[^a-z0-9]/g, "");
  const phone = (center.phone ?? center.whatsapp ?? "").replace(/\D/g, "");
  const pwd = `${owner || "centre"}${phone || center.pincode || ""}`;
  // Login requires at least 4 chars — pad weak ones so they still authenticate.
  return pwd.length >= 4 ? pwd : `${pwd}centre`;
}

export type CenterCredential = {
  center: Center;
  login_id: string;
  login_password: string;
};

/**
 * Build credentials for every centre, guaranteeing unique User IDs (duplicate
 * centre names get a numeric suffix: foo, foo.1, foo.2 …).
 */
export function buildCenterCredentials(centers: Center[]): CenterCredential[] {
  const used = new Set<string>();
  return centers.map((center) => {
    let id = centerUserId(center.center_name);
    const base = id;
    let n = 1;
    while (used.has(id)) id = `${base}.${n++}`;
    used.add(id);
    return { center, login_id: id, login_password: centerPassword(center) };
  });
}

/** WhatsApp / copy message an owner receives. */
export function credentialMessage(cred: CenterCredential): string {
  return (
    `Dekhao Apna Talent — your centre login\n` +
    `Centre: ${cred.center.center_name}\n` +
    `User ID: ${cred.login_id}\n` +
    `Password: ${cred.login_password}`
  );
}
