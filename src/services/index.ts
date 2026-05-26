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
import type { DataStore } from "./store";

type Mode = "local" | "supabase";

// Flip to "supabase" once supabase-store.ts is fully implemented.
const MODE: Mode = "local";

const impls: Record<Mode, DataStore> = {
  local: localStore,
  supabase: supabaseStore,
};

/** The active DataStore. Use this in action handlers (button clicks, etc.). */
export const store: DataStore = impls[MODE];

export * from "./store";
export * from "./hooks";
