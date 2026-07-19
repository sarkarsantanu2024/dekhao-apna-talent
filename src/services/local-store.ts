/**
 * Demo backend — persists everything to localStorage so a client demo can
 * exercise the entire admin flow without a real Supabase instance.
 *
 * All mutations call `emitStoreChange()` so any React hook subscribed via
 * `useStore*` rerenders instantly.
 *
 * SSR-safe: every method guards on `typeof window` and returns sensible
 * empty data when called on the server (Next.js may call effects during
 * hydration). The UI consuming these hooks runs on the client anyway.
 */

import { EVENT_YEAR } from "@/constants";
import type {
  Category,
  Center,
  Enquiry,
  Payment,
  Student,
  ActivityEvent,
} from "@/types";
import {
  emitStoreChange,
  type DashboardStats,
  type DataStore,
  type NewCenter,
  type NewPayment,
  type NewStudent,
} from "./store";

const KEY = "dat:store:v1";
/**
 * Bump this version whenever the seed shape changes — every browser will
 * re-seed on next visit instead of holding stale ids that no longer line up.
 */
const SEED_VERSION = "v5";
const SEEDED_FLAG = "dat:store:seeded";

/**
 * ⚠️ DEMO-ONLY one-time fix — REMOVE FOR REAL DATA ⚠️
 * Flips any pre-existing demo students (created before the "all pending" rule)
 * to `pending`, once, without wiping the admin's uploaded centres. Runs a single
 * time per browser (gated by this flag). Delete this along with the demo-student
 * generator in src/components/forms/center-bulk-upload.tsx.
 */
const DEMO_PENDING_FIX_FLAG = "dat:demo-students-pending:v1";

/**
 * ⚠️ DEMO-ONLY one-time fix — REMOVE FOR REAL DATA ⚠️
 * Strips the old placeholder (pravatar) photos off demo students so the chest
 * card stays locked until the centre owner uploads a REAL student image. Only
 * touches pravatar URLs — never real uploaded photos. Runs once per browser.
 */
const DEMO_NOPHOTO_FIX_FLAG = "dat:demo-students-nophoto:v1";

interface Snapshot {
  centers: Center[];
  categories: Category[];
  students: Student[];
  payments: Payment[];
  events: ActivityEvent[];
  enquiries: Enquiry[];
  rollCounters: Record<string, number>; // by category prefix
}

const empty: Snapshot = {
  centers: [],
  categories: [],
  students: [],
  payments: [],
  events: [],
  enquiries: [],
  rollCounters: {},
};

/* ---------- low-level helpers ---------- */

function isBrowser(): boolean {
  return typeof window !== "undefined" && typeof window.localStorage !== "undefined";
}

function read(): Snapshot {
  if (!isBrowser()) return structuredClone(empty);
  try {
    const raw = window.localStorage.getItem(KEY);
    if (!raw) return structuredClone(empty);
    return JSON.parse(raw) as Snapshot;
  } catch {
    return structuredClone(empty);
  }
}

function write(s: Snapshot): void {
  if (!isBrowser()) return;
  window.localStorage.setItem(KEY, JSON.stringify(s));
  emitStoreChange();
}

function uid(prefix = "id"): string {
  return `${prefix}_${Math.random().toString(36).slice(2, 10)}${Date.now().toString(36)}`;
}

/** Prepend an activity event, capping the log to the most recent 100. */
function logEventInto(s: Snapshot, input: Omit<ActivityEvent, "id" | "created_at">): ActivityEvent[] {
  const event: ActivityEvent = { ...input, id: uid("evt"), created_at: nowIso() };
  return [event, ...(s.events ?? [])].slice(0, 100);
}

function nowIso(): string {
  return new Date().toISOString();
}

function nextRoll(snapshot: Snapshot, prefix: string): string {
  const next = (snapshot.rollCounters[prefix] ?? 0) + 1;
  snapshot.rollCounters[prefix] = next;
  return `MM-${prefix}-${EVENT_YEAR}-${String(next).padStart(4, "0")}`;
}

/* ---------- seed data — categories only; everything else starts empty ---------- */

const SEED_CATEGORIES: Category[] = [
  { id: "cat_dance", name: "Dance",                slug: "dance",        prefix: "DANCE", fee: 400, active: true, description: "Any dance form — classical, folk, hip-hop, contemporary." },
  { id: "cat_song",  name: "Song",                 slug: "song",         prefix: "SONG",  fee: 400, active: true, description: "Audition round is a cappella (no music)." },
  { id: "cat_math",  name: "Mental Math Olympiad", slug: "mental-math",  prefix: "MATH",  fee: 250, active: true, description: "Levels L1–L8. Centre round is free." },
  { id: "cat_other", name: "Other Talent",         slug: "other-talent", prefix: "OTHER", fee: 400, active: true, description: "Showcase any special talent." },
];

/* ---------- DataStore implementation ---------- */

export const localStore: DataStore = {
  async ensureSeeded() {
    if (!isBrowser()) return;
    if (window.localStorage.getItem(SEEDED_FLAG) !== SEED_VERSION) {
      // Clean slate: only the competition categories are seeded. Centres,
      // students and payments start empty — the admin populates real centres
      // by uploading a CSV (which auto-creates demo students per centre), and
      // all other data flows from there. No dummy rows anywhere.
      const snap = structuredClone(empty);
      snap.categories = SEED_CATEGORIES;
      write(snap);
      window.localStorage.setItem(SEEDED_FLAG, SEED_VERSION);
    }
    // ⚠️ DEMO-ONLY: one-time pass to force any existing demo students to
    // "pending" (they may have been generated with a mixed status earlier).
    // Runs once per browser; admin approvals afterwards persist normally.
    if (window.localStorage.getItem(DEMO_PENDING_FIX_FLAG) !== "1") {
      const d = read();
      if (d.students.some((st) => st.status !== "pending")) {
        d.students = d.students.map((st) => ({ ...st, status: "pending", updated_at: nowIso() }));
        write(d);
      }
      window.localStorage.setItem(DEMO_PENDING_FIX_FLAG, "1");
    }

    // ⚠️ DEMO-ONLY: drop placeholder (pravatar) photos so chest cards require a
    // real uploaded image. Only removes pravatar URLs. Runs once per browser.
    if (window.localStorage.getItem(DEMO_NOPHOTO_FIX_FLAG) !== "1") {
      const d = read();
      const hasPlaceholder = d.students.some((st) => st.photo_url?.includes("pravatar.cc"));
      if (hasPlaceholder) {
        d.students = d.students.map((st) =>
          st.photo_url?.includes("pravatar.cc") ? { ...st, photo_url: null, updated_at: nowIso() } : st,
        );
        write(d);
      }
      window.localStorage.setItem(DEMO_NOPHOTO_FIX_FLAG, "1");
    }

    // Self-heal: drop any students/payments left orphaned by a deleted centre,
    // so the Payments, Reports and Dashboard views always agree with the centre
    // list. (Does not touch valid centre/student rows.)
    const s = read();
    const validCenter = new Set(s.centers.map((c) => c.id));
    const students = s.students.filter((st) => st.center_id == null || validCenter.has(st.center_id));
    const payments = s.payments.filter((p) => p.center_id == null || validCenter.has(p.center_id));
    if (students.length !== s.students.length || payments.length !== s.payments.length) {
      s.students = students;
      s.payments = payments;
      write(s);
    }
  },

  async reset() {
    if (!isBrowser()) return;
    window.localStorage.removeItem(KEY);
    window.localStorage.removeItem(SEEDED_FLAG);
    await this.ensureSeeded();
  },

  async resetTestData() {
    const s = read();
    s.payments = [];
    s.students = s.students.map((st) => ({ ...st, status: "approved", updated_at: nowIso() }));
    s.centers = s.centers.map((c) => ({ ...c, participating: false }));
    write(s);
  },

  async getStats(): Promise<DashboardStats> {
    const s = read();
    const byCat = new Map<string, number>();
    let pendingStudents = 0, approvedStudents = 0, rejectedStudents = 0, activeStudents = 0;
    for (const st of s.students) {
      byCat.set(st.category_name, (byCat.get(st.category_name) ?? 0) + 1);
      if      (st.status === "pending")  pendingStudents++;
      else if (st.status === "approved") approvedStudents++;
      else if (st.status === "rejected") rejectedStudents++;
      else if (st.status === "active")   activeStudents++;
    }
    let pendingPayments = 0, approvedPayments = 0, rejectedPayments = 0, collected = 0;
    for (const p of s.payments) {
      if      (p.status === "pending")  pendingPayments++;
      else if (p.status === "approved") { approvedPayments++; collected += Number(p.amount); }
      else if (p.status === "rejected") rejectedPayments++;
    }
    return {
      students: s.students.length,
      centers: s.centers.length,
      pendingStudents, approvedStudents, rejectedStudents, activeStudents,
      pendingPayments, approvedPayments, rejectedPayments,
      collected,
      byCategory: Array.from(byCat.entries()).map(([categoryName, count]) => ({ categoryName, count })),
    };
  },

  /* ----- students ----- */
  async listStudents(opts) {
    const s = read();
    let rows = s.students.slice().sort((a, b) => b.created_at.localeCompare(a.created_at));
    if (opts?.centerId) rows = rows.filter((r) => r.center_id === opts.centerId);
    if (opts?.status) rows = rows.filter((r) => r.status === opts.status);
    return rows;
  },
  async getStudent(id) {
    return read().students.find((s) => s.id === id) ?? null;
  },
  async createStudent(input) {
    const s = read();
    const category = s.categories.find((c) => c.id === input.category_id);
    const prefix = category?.prefix ?? "OTHER";
    const row: Student = {
      ...input,
      id: uid("stu"),
      // Students are auto-approved on submission; admins can still reject bad
      // entries afterwards. Callers may override by passing an explicit status.
      status: input.status ?? "approved",
      event_year: EVENT_YEAR,
      roll_number: nextRoll(s, prefix),
      created_at: nowIso(),
      updated_at: nowIso(),
    };
    s.students.unshift(row);
    write(s);
    return row;
  },
  async updateStudent(id, patch) {
    const s = read();
    const idx = s.students.findIndex((x) => x.id === id);
    if (idx < 0) throw new Error("Student not found");
    const before = s.students[idx];
    s.students[idx] = { ...before, ...patch, updated_at: nowIso() };
    // Admin rejecting a student → notify that centre.
    if (patch.status === "rejected" && before.status !== "rejected") {
      const st = s.students[idx];
      s.events = logEventInto(s, {
        type: "student_rejected",
        audience: "center",
        message: `Student ${st.full_name} was rejected by admin — edit & re-submit`,
        center_id: st.center_id,
        center_name: st.center_name,
      });
    }
    write(s);
    return s.students[idx];
  },
  async deleteStudent(id) {
    const s = read();
    s.students = s.students.filter((x) => x.id !== id);
    write(s);
  },

  /* ----- centers ----- */
  async listCenters() {
    return read().centers.slice().sort((a, b) => b.created_at.localeCompare(a.created_at));
  },
  async getCenter(id) {
    return read().centers.find((c) => c.id === id) ?? null;
  },
  async createCenter(input) {
    const s = read();
    const row: Center = {
      ...input,
      id: uid("ctr"),
      login_id: null,
      login_password: null,
      event_year: EVENT_YEAR,
      created_at: nowIso(),
    };
    s.centers.unshift(row);
    write(s);
    return row;
  },
  async updateCenter(id, patch) {
    const s = read();
    const idx = s.centers.findIndex((c) => c.id === id);
    if (idx < 0) throw new Error("Center not found");
    s.centers[idx] = { ...s.centers[idx], ...patch };
    // Cascade rename to students
    if (patch.center_name) {
      s.students = s.students.map((st) => (st.center_id === id ? { ...st, center_name: patch.center_name! } : st));
      s.payments = s.payments.map((p) => (p.center_id === id ? { ...p, center_name: patch.center_name! } : p));
    }
    write(s);
    return s.centers[idx];
  },
  async generateCenterLogins() {
    const s = read();
    const used = new Set(s.centers.map((c) => c.login_id).filter(Boolean) as string[]);
    const slug = (name: string) =>
      name.toLowerCase().replace(/[^a-z0-9]+/g, ".").replace(/^\.+|\.+$/g, "").replace(/\.{2,}/g, ".") || "centre";
    const pwd = () => Math.random().toString(36).slice(2, 8); // 6-char demo password
    s.centers = s.centers.map((c) => {
      if (c.login_id && c.login_password) return c; // keep existing — credentials stay stable
      let id = slug(c.center_name);
      const base = id;
      let n = 1;
      while (used.has(id)) id = `${base}.${n++}`;
      used.add(id);
      return { ...c, login_id: id, login_password: pwd() };
    });
    write(s);
    return s.centers.slice().sort((a, b) => b.created_at.localeCompare(a.created_at));
  },

  async deleteCenter(id) {
    const s = read();
    s.centers = s.centers.filter((c) => c.id !== id);
    // Cascade: a centre's students and payments must not outlive it, otherwise
    // they become orphaned rows that desync the Payments/Reports/Dashboard views.
    s.students = s.students.filter((st) => st.center_id !== id);
    s.payments = s.payments.filter((p) => p.center_id !== id);
    write(s);
  },

  /* ----- payments ----- */
  async listPayments(opts) {
    const s = read();
    let rows = s.payments.slice().sort((a, b) => b.created_at.localeCompare(a.created_at));
    if (opts?.status) rows = rows.filter((p) => p.status === opts.status);
    if (opts?.centerId) rows = rows.filter((p) => p.center_id === opts.centerId);
    return rows;
  },
  async createPayment(input) {
    const s = read();
    const row: Payment = {
      ...input,
      id: uid("pay"),
      status: input.status ?? "pending",
      event_year: EVENT_YEAR,
      reviewed_by: null,
      reviewed_at: null,
      review_note: null,
      created_at: nowIso(),
    };
    s.payments.unshift(row);
    s.events = logEventInto(s, {
      type: "payment_uploaded",
      audience: "admin",
      message: `uploaded a payment${row.student_name ? ` for ${row.student_name}` : ""}`,
      center_id: row.center_id,
      center_name: row.center_name,
    });
    write(s);
    return row;
  },
  async approvePayment(id, note) {
    const s = read();
    const idx = s.payments.findIndex((p) => p.id === id);
    if (idx < 0) throw new Error("Payment not found");
    s.payments[idx] = {
      ...s.payments[idx],
      status: "approved",
      reviewed_by: "admin",
      reviewed_at: nowIso(),
      review_note: note ?? null,
    };
    // Approving a centre's payment auto-joins it to the event.
    const centerId = s.payments[idx].center_id;
    if (centerId) {
      const ci = s.centers.findIndex((c) => c.id === centerId);
      if (ci >= 0 && !s.centers[ci].participating) {
        s.centers[ci] = { ...s.centers[ci], participating: true };
      }
    }
    // Approving the payment activates the linked student → unlocks their chest card.
    const studentId = s.payments[idx].student_id;
    if (studentId) {
      const si = s.students.findIndex((st) => st.id === studentId);
      if (si >= 0 && s.students[si].status !== "active") {
        s.students[si] = { ...s.students[si], status: "active", updated_at: nowIso() };
      }
    }
    const ap = s.payments[idx];
    s.events = logEventInto(s, {
      type: "payment_approved",
      audience: "center",
      message: `Payment${ap.student_name ? ` for ${ap.student_name}` : ""} approved — chest card unlocked`,
      center_id: ap.center_id,
      center_name: ap.center_name,
    });
    write(s);
    return s.payments[idx];
  },
  async rejectPayment(id, note) {
    const s = read();
    const idx = s.payments.findIndex((p) => p.id === id);
    if (idx < 0) throw new Error("Payment not found");
    s.payments[idx] = {
      ...s.payments[idx],
      status: "rejected",
      reviewed_by: "admin",
      reviewed_at: nowIso(),
      review_note: note ?? null,
    };
    const rp = s.payments[idx];
    s.events = logEventInto(s, {
      type: "payment_rejected",
      audience: "center",
      message: `Payment${rp.student_name ? ` for ${rp.student_name}` : ""} rejected${note ? `: ${note}` : ""} — please re-submit`,
      center_id: rp.center_id,
      center_name: rp.center_name,
    });
    write(s);
    return s.payments[idx];
  },

  async updatePayment(id, patch) {
    const s = read();
    const idx = s.payments.findIndex((p) => p.id === id);
    if (idx < 0) throw new Error("Payment not found");
    const prev = s.payments[idx];
    s.payments[idx] = {
      ...prev,
      amount: patch.amount ?? prev.amount,
      transaction_ref: patch.transaction_ref !== undefined ? patch.transaction_ref : prev.transaction_ref,
      screenshot_url: patch.screenshot_url ?? prev.screenshot_url,
    };
    write(s);
    return s.payments[idx];
  },

  async deletePayment(id) {
    const s = read();
    const idx = s.payments.findIndex((p) => p.id === id);
    if (idx < 0) return;
    const prev = s.payments[idx];
    s.payments.splice(idx, 1);
    // If an approved payment is deleted, reverse its side-effects.
    if (prev.status === "approved") {
      if (prev.student_id) {
        const si = s.students.findIndex((st) => st.id === prev.student_id);
        if (si >= 0 && s.students[si].status === "active") {
          s.students[si] = { ...s.students[si], status: "approved", updated_at: nowIso() };
        }
      }
      if (prev.center_id) {
        const stillApproved = s.payments.some((p) => p.center_id === prev.center_id && p.status === "approved");
        if (!stillApproved) {
          const ci = s.centers.findIndex((c) => c.id === prev.center_id);
          if (ci >= 0) s.centers[ci] = { ...s.centers[ci], participating: false };
        }
      }
    }
    write(s);
  },

  async revertPayment(id, note) {
    const s = read();
    const idx = s.payments.findIndex((p) => p.id === id);
    if (idx < 0) throw new Error("Payment not found");
    const prev = s.payments[idx];
    const wasApproved = prev.status === "approved";
    // Send the payment back to the review queue, keeping the admin's reason note.
    s.payments[idx] = {
      ...prev,
      status: "pending",
      reviewed_by: null,
      reviewed_at: null,
      review_note: note ?? null,
    };
    if (wasApproved) {
      // The student it activated goes back to "approved" (chest card re-locks).
      if (prev.student_id) {
        const si = s.students.findIndex((st) => st.id === prev.student_id);
        if (si >= 0 && s.students[si].status === "active") {
          s.students[si] = { ...s.students[si], status: "approved", updated_at: nowIso() };
        }
      }
      // If the centre has no other approved payment left, it stops participating.
      if (prev.center_id) {
        const stillApproved = s.payments.some((p) => p.center_id === prev.center_id && p.status === "approved");
        if (!stillApproved) {
          const ci = s.centers.findIndex((c) => c.id === prev.center_id);
          if (ci >= 0) s.centers[ci] = { ...s.centers[ci], participating: false };
        }
      }
    }
    s.events = logEventInto(s, {
      type: "payment_reverted",
      audience: "center",
      message:
        `Admin moved your payment${prev.student_name ? ` for ${prev.student_name}` : ""} back to pending` +
        `${note ? `. Reason: ${note}` : ""}. ` +
        `Open Payments → Edit to upload a clearer screenshot or fix the details; it will be reviewed again.`,
      center_id: prev.center_id,
      center_name: prev.center_name,
    });
    write(s);
    return s.payments[idx];
  },

  async resubmitPayment(id, patch) {
    const s = read();
    const idx = s.payments.findIndex((p) => p.id === id);
    if (idx < 0) throw new Error("Payment not found");
    const prev = s.payments[idx];
    if (prev.status !== "rejected") {
      throw new Error("Only rejected payments can be resubmitted");
    }
    s.payments[idx] = {
      ...prev,
      screenshot_url: patch.screenshot_url,
      amount: patch.amount ?? prev.amount,
      transaction_ref: patch.transaction_ref ?? prev.transaction_ref,
      status: "pending",
      reviewed_by: null,
      reviewed_at: null,
      review_note: null,
      created_at: nowIso(), // bump so it floats to the top of admin's queue
    };
    s.events = logEventInto(s, {
      type: "payment_resubmitted",
      audience: "admin",
      message: `re-submitted a payment${prev.student_name ? ` for ${prev.student_name}` : ""}`,
      center_id: prev.center_id,
      center_name: prev.center_name,
    });
    write(s);
    return s.payments[idx];
  },

  /* ----- activity feed ----- */
  async listEvents() {
    return (read().events ?? []).slice().sort((a, b) => b.created_at.localeCompare(a.created_at));
  },
  async logEvent(input) {
    const s = read();
    s.events = logEventInto(s, input);
    write(s);
  },

  /* ----- categories ----- */
  async listCategories() {
    return read().categories.slice().sort((a, b) => a.name.localeCompare(b.name));
  },
  async updateCategory(id, patch) {
    const s = read();
    const idx = s.categories.findIndex((c) => c.id === id);
    if (idx < 0) throw new Error("Category not found");
    s.categories[idx] = { ...s.categories[idx], ...patch };
    write(s);
    return s.categories[idx];
  },

  /* ----- enquiries (public "Send a message" form) ----- */
  async listEnquiries(opts) {
    const s = read();
    let rows = (s.enquiries ?? []).slice().sort((a, b) => b.created_at.localeCompare(a.created_at));
    if (opts?.status) rows = rows.filter((e) => e.status === opts.status);
    return rows;
  },
  async createEnquiry(input) {
    const s = read();
    const row: Enquiry = {
      id: uid("enq"),
      name: input.name,
      phone: input.phone ?? null,
      email: input.email,
      message: input.message,
      status: "new",
      event_year: EVENT_YEAR,
      created_at: nowIso(),
    };
    s.enquiries = [row, ...(s.enquiries ?? [])];
    write(s);
    return row;
  },
  async updateEnquiry(id, patch) {
    const s = read();
    const idx = (s.enquiries ?? []).findIndex((e) => e.id === id);
    if (idx < 0) throw new Error("Enquiry not found");
    s.enquiries[idx] = { ...s.enquiries[idx], status: patch.status };
    write(s);
    return s.enquiries[idx];
  },
  async deleteEnquiry(id) {
    const s = read();
    s.enquiries = (s.enquiries ?? []).filter((e) => e.id !== id);
    write(s);
  },
};
