/**
 * Real-backend implementation stub.
 *
 * When you're ready to wire Supabase up, expand each method to call the
 * Supabase JS client (server-side via `supabaseAdmin()`, or client-side via
 * `supabaseBrowser()`). Then flip the flag in `src/services/index.ts`:
 *
 *   const MODE = "supabase";
 *
 * The UI never imports this file directly — it only consumes hooks from
 * `@/services`, which means nothing else needs to change.
 *
 * The interface intentionally matches `DataStore` so you'll get TypeScript
 * errors guiding you to fill in any method you forget.
 */

import type { DataStore } from "./store";

/**
 * Build a SupabaseStore. Each method should:
 *   1. Call the appropriate Supabase JS query.
 *   2. Return the same shapes that LocalStore returns (Center, Student, etc.).
 *   3. Throw on failure — callers handle errors via try/catch.
 *
 * Reactivity: Supabase Realtime channels can fire `emitStoreChange()` from
 * `./store` so hooks pick up server-side changes automatically.
 */
export const supabaseStore: DataStore = {
  ensureSeeded:    async () => { /* Migrations + seed scripts handle this in supabase/ */ },
  reset:           async () => { throw new Error("reset() is destructive in production — disabled."); },
  resetTestData:   async () => { throw new Error("resetTestData() is disabled in production."); },
  getStats:        async () => { throw new Error("Not implemented yet"); },

  listStudents:    async () => { throw new Error("Not implemented yet"); },
  getStudent:      async () => { throw new Error("Not implemented yet"); },
  createStudent:   async () => { throw new Error("Not implemented yet"); },
  updateStudent:   async () => { throw new Error("Not implemented yet"); },
  deleteStudent:   async () => { throw new Error("Not implemented yet"); },

  listCenters:     async () => { throw new Error("Not implemented yet"); },
  getCenter:       async () => { throw new Error("Not implemented yet"); },
  createCenter:    async () => { throw new Error("Not implemented yet"); },
  updateCenter:    async () => { throw new Error("Not implemented yet"); },
  deleteCenter:    async () => { throw new Error("Not implemented yet"); },
  generateCenterLogins: async () => { throw new Error("Not implemented yet"); },

  listPayments:    async () => { throw new Error("Not implemented yet"); },
  createPayment:   async () => { throw new Error("Not implemented yet"); },
  approvePayment:  async () => { throw new Error("Not implemented yet"); },
  rejectPayment:   async () => { throw new Error("Not implemented yet"); },
  revertPayment:   async () => { throw new Error("Not implemented yet"); },
  updatePayment:   async () => { throw new Error("Not implemented yet"); },
  deletePayment:   async () => { throw new Error("Not implemented yet"); },
  resubmitPayment: async () => { throw new Error("Not implemented yet"); },

  listEvents:      async () => { throw new Error("Not implemented yet"); },
  logEvent:        async () => { throw new Error("Not implemented yet"); },

  listCategories:  async () => { throw new Error("Not implemented yet"); },
  updateCategory:  async () => { throw new Error("Not implemented yet"); },
};
