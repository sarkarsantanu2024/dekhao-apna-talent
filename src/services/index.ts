/**
 * Public service entry point.
 *
 * UI code should ONLY import from here:
 *   import { useStudents, store } from "@/services";
 *
 * Swap to a real backend later by changing the `MODE` constant (or wiring it
 * up to an env var). Nothing else in the app needs to change.
 */

import { localStore } from "./local-store";
import { supabaseStore } from "./supabase-store";
import { remoteStore } from "./remote-store";
import type { DataStore } from "./store";

type Mode = "local" | "supabase";

/**
 * Pick the backend from env so the same build runs both ways:
 *   • Supabase configured (NEXT_PUBLIC_SUPABASE_URL + ANON_KEY present and not a
 *     placeholder) → real Postgres backend.
 *   • Otherwise → the localStorage demo store.
 * Force one explicitly with NEXT_PUBLIC_STORE_MODE = "local" | "supabase".
 */
function resolveMode(): Mode {
  const forced = process.env.NEXT_PUBLIC_STORE_MODE;
  if (forced === "local" || forced === "supabase") return forced;
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
  const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "";
  const configured =
    !!url && !!anon &&
    !url.includes("example.supabase.co") &&
    !url.includes("your-project");
  return configured ? "supabase" : "local";
}

const MODE: Mode = resolveMode();

/**
 * In Supabase mode, default to the HARDENED path (remoteStore → /api/data,
 * server enforces the session + role). Set NEXT_PUBLIC_DATA_MODE=direct to fall
 * back to the direct browser-anon path (permissive RLS) — e.g. if the hardened
 * path ever blocks something mid-demo.
 */
const supabaseImpl: DataStore =
  process.env.NEXT_PUBLIC_DATA_MODE === "direct" ? supabaseStore : remoteStore;

const impls: Record<Mode, DataStore> = {
  local: localStore,
  supabase: supabaseImpl,
};

/** The active DataStore. Use this in action handlers (button clicks, etc.). */
export const store: DataStore = impls[MODE];

export * from "./store";
export * from "./hooks";
