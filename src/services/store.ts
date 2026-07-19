/**
 * DataStore — the contract every backend (localStorage, Supabase, REST API)
 * must satisfy. UI code only imports from `@/services` and never knows which
 * implementation is active.
 *
 * Adding a new backend later:
 *   1. Create `src/services/<name>-store.ts` that exports an object satisfying
 *      `DataStore`.
 *   2. Wire it into `src/services/index.ts` behind the same flag.
 *   3. UI code stays unchanged.
 */

import type {
  ActivityEvent,
  Category,
  Center,
  Enquiry,
  EnquiryStatus,
  Payment,
  PaymentStatus,
  Student,
  StudentStatus,
} from "@/types";

export type NewStudent = Omit<Student, "id" | "roll_number" | "created_at" | "updated_at" | "status" | "event_year"> & {
  status?: StudentStatus;
};

export type NewCenter = Omit<
  Center,
  "id" | "created_at" | "event_year" | "login_id" | "login_password"
>;

export type NewPayment = Omit<
  Payment,
  | "id"
  | "created_at"
  | "reviewed_at"
  | "reviewed_by"
  | "review_note"
  | "status"
  | "event_year"
> & { status?: PaymentStatus };

export type NewEnquiry = Pick<Enquiry, "name" | "email" | "message"> & {
  phone?: string | null;
};

export interface DashboardStats {
  students: number;
  centers: number;
  /** Student status breakdown — counts always sum to `students`. */
  pendingStudents: number;
  approvedStudents: number;
  rejectedStudents: number;
  activeStudents: number;
  /** Payment status breakdown. */
  pendingPayments: number;
  approvedPayments: number;
  rejectedPayments: number;
  collected: number;
  byCategory: { categoryName: string; count: number }[];
}

export interface DataStore {
  /** Idempotent: ensure seed/demo data exists. Safe to call repeatedly. */
  ensureSeeded(): Promise<void>;
  /** Wipe everything and re-seed. */
  reset(): Promise<void>;
  /** Fresh-test reset: keep centres + students, clear all payments and reset
   *  every student to "approved" (un-active) and every centre to not-participating. */
  resetTestData(): Promise<void>;

  getStats(): Promise<DashboardStats>;

  listStudents(opts?: { centerId?: string; status?: StudentStatus }): Promise<Student[]>;
  getStudent(id: string): Promise<Student | null>;
  createStudent(input: NewStudent): Promise<Student>;
  updateStudent(id: string, patch: Partial<Student>): Promise<Student>;
  deleteStudent(id: string): Promise<void>;

  listCenters(): Promise<Center[]>;
  getCenter(id: string): Promise<Center | null>;
  createCenter(input: NewCenter): Promise<Center>;
  updateCenter(id: string, patch: Partial<Center>): Promise<Center>;
  deleteCenter(id: string): Promise<void>;
  /** Generate a login id + password for any centre missing one. Returns all centres. */
  generateCenterLogins(): Promise<Center[]>;

  listPayments(opts?: { status?: PaymentStatus; centerId?: string }): Promise<Payment[]>;
  createPayment(input: NewPayment): Promise<Payment>;
  approvePayment(id: string, note?: string): Promise<Payment>;
  rejectPayment(id: string, note?: string): Promise<Payment>;
  /** Undo an approve/reject: moves the payment back to "pending" and reverses
   *  any side-effects (student activation, centre participation). `note` is the
   *  admin's reason, surfaced to the centre. */
  revertPayment(id: string, note?: string): Promise<Payment>;
  /** Centre edits a payment's amount / ref / screenshot (before it's finalised). */
  updatePayment(
    id: string,
    patch: { amount?: number; transaction_ref?: string | null; screenshot_url?: string },
  ): Promise<Payment>;
  /** Delete a payment. Reverses side-effects if it had been approved. */
  deletePayment(id: string): Promise<void>;
  /**
   * Centre owner re-uploads a fresh screenshot (optionally with corrected
   * amount / transaction ref) for a previously rejected payment. The row
   * moves back to `pending` and the prior reviewer fields are cleared.
   */
  resubmitPayment(
    id: string,
    patch: { screenshot_url: string; amount?: number; transaction_ref?: string | null },
  ): Promise<Payment>;

  /** Activity feed (admin-facing). Most recent first. */
  listEvents(): Promise<ActivityEvent[]>;
  logEvent(input: Omit<ActivityEvent, "id" | "created_at">): Promise<void>;

  listCategories(): Promise<Category[]>;
  updateCategory(id: string, patch: Partial<Category>): Promise<Category>;

  /** Public enquiries ("Send a message" form). Most recent first. */
  listEnquiries(opts?: { status?: EnquiryStatus }): Promise<Enquiry[]>;
  /** Called from the public /api/enquiries route (no session) — never scope this to a centre. */
  createEnquiry(input: NewEnquiry): Promise<Enquiry>;
  updateEnquiry(id: string, patch: { status: EnquiryStatus }): Promise<Enquiry>;
  deleteEnquiry(id: string): Promise<void>;
}

/** Custom DOM event fired after any mutation so React hooks can re-read. */
export const STORE_CHANGED = "dat:store-changed";

export function emitStoreChange(): void {
  if (typeof window !== "undefined") {
    window.dispatchEvent(new Event(STORE_CHANGED));
  }
}
