/**
 * Hardened DataStore — talks to the server `/api/data` route instead of hitting
 * Supabase directly from the browser. The server enforces the session + role
 * and runs the operation with the service-role key, so the anon key has no
 * direct database access. This is the default in Supabase mode.
 *
 * Mutations fire `emitStoreChange()` client-side so the `useStore*` hooks
 * re-read (the server-side store's own emit is a no-op).
 */

import { emitStoreChange, type DashboardStats, type DataStore } from "./store";
import type {
  ActivityEvent,
  Category,
  Center,
  Enquiry,
  Payment,
  Student,
} from "@/types";

async function call<T>(method: string, args: unknown[]): Promise<T> {
  const res = await fetch("/api/data", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ method, args }),
  });
  let json: { data?: unknown; error?: string } = {};
  try {
    json = await res.json();
  } catch {
    /* non-JSON */
  }
  if (!res.ok) throw new Error(json.error ?? `Request failed (${res.status})`);
  return json.data as T;
}

/** Like `call`, but signals the hooks to re-read after a successful mutation. */
async function mutate<T>(method: string, args: unknown[]): Promise<T> {
  const data = await call<T>(method, args);
  emitStoreChange();
  return data;
}

export const remoteStore: DataStore = {
  ensureSeeded: async () => {},
  reset: async () => { throw new Error("reset() is disabled."); },
  resetTestData: async () => { throw new Error("resetTestData() is disabled."); },

  getStats: () => call<DashboardStats>("getStats", []),

  listStudents: (opts) => call<Student[]>("listStudents", [opts]),
  getStudent: (id) => call<Student | null>("getStudent", [id]),
  createStudent: (input) => mutate<Student>("createStudent", [input]),
  updateStudent: (id, patch) => mutate<Student>("updateStudent", [id, patch]),
  deleteStudent: async (id) => { await mutate<void>("deleteStudent", [id]); },

  listCenters: () => call<Center[]>("listCenters", []),
  getCenter: (id) => call<Center | null>("getCenter", [id]),
  createCenter: (input) => mutate<Center>("createCenter", [input]),
  updateCenter: (id, patch) => mutate<Center>("updateCenter", [id, patch]),
  deleteCenter: async (id) => { await mutate<void>("deleteCenter", [id]); },
  generateCenterLogins: () => call<Center[]>("generateCenterLogins", []),

  listPayments: (opts) => call<Payment[]>("listPayments", [opts]),
  createPayment: (input) => mutate<Payment>("createPayment", [input]),
  approvePayment: (id, note) => mutate<Payment>("approvePayment", [id, note]),
  rejectPayment: (id, note) => mutate<Payment>("rejectPayment", [id, note]),
  revertPayment: (id, note) => mutate<Payment>("revertPayment", [id, note]),
  updatePayment: (id, patch) => mutate<Payment>("updatePayment", [id, patch]),
  deletePayment: async (id) => { await mutate<void>("deletePayment", [id]); },
  resubmitPayment: (id, patch) => mutate<Payment>("resubmitPayment", [id, patch]),

  listEvents: () => call<ActivityEvent[]>("listEvents", []),
  logEvent: async (input) => { await mutate<void>("logEvent", [input]); },

  listCategories: () => call<Category[]>("listCategories", []),
  updateCategory: (id, patch) => mutate<Category>("updateCategory", [id, patch]),

  listEnquiries: (opts) => call<Enquiry[]>("listEnquiries", [opts]),
  // Public submissions go through the dedicated /api/enquiries route (no session),
  // never this session-gated path — but keep the method for interface parity.
  createEnquiry: (input) => mutate<Enquiry>("createEnquiry", [input]),
  updateEnquiry: (id, patch) => mutate<Enquiry>("updateEnquiry", [id, patch]),
  deleteEnquiry: async (id) => { await mutate<void>("deleteEnquiry", [id]); },
};
