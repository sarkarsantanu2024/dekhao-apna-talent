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
  Payment,
  Student,
  StudentStatus,
  PaymentStatus,
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
const SEED_VERSION = "v2";
const SEEDED_FLAG = "dat:store:seeded";

interface Snapshot {
  centers: Center[];
  categories: Category[];
  students: Student[];
  payments: Payment[];
  rollCounters: Record<string, number>; // by category prefix
}

const empty: Snapshot = {
  centers: [],
  categories: [],
  students: [],
  payments: [],
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

function nowIso(): string {
  return new Date().toISOString();
}

function nextRoll(snapshot: Snapshot, prefix: string): string {
  const next = (snapshot.rollCounters[prefix] ?? 0) + 1;
  snapshot.rollCounters[prefix] = next;
  return `MM-${prefix}-${EVENT_YEAR}-${String(next).padStart(4, "0")}`;
}

/* ---------- seed data (visible to demo viewers immediately) ---------- */

const SEED_CATEGORIES: Category[] = [
  { id: "cat_dance", name: "Dance",                slug: "dance",        prefix: "DANCE", fee: 400, active: true, description: "Any dance form — classical, folk, hip-hop, contemporary." },
  { id: "cat_song",  name: "Song",                 slug: "song",         prefix: "SONG",  fee: 400, active: true, description: "Audition round is a cappella (no music)." },
  { id: "cat_math",  name: "Mental Math Olympiad", slug: "mental-math",  prefix: "MATH",  fee: 250, active: true, description: "Levels L1–L8. Centre round is free." },
  { id: "cat_other", name: "Other Talent",         slug: "other-talent", prefix: "OTHER", fee: 400, active: true, description: "Showcase any special talent." },
];

/**
 * The Dumdum centre's id is hard-pinned to match the demo centre user's
 * `centerId` in src/lib/supabase/mock-client.ts, so logged-in centre users
 * can read & write their own students/payments out of the box.
 */
export const DEMO_CENTRE_ID = "11111111-1111-1111-1111-111111111111";

const SEED_CENTERS: Center[] = [
  { id: DEMO_CENTRE_ID,  center_name: "Demo Centre — Dumdum",       owner_name: "Demo Owner",      phone: "+91 98300 00000", address: "Dumdum Road",            city: "Kolkata",   state: "West Bengal", pincode: "700028", event_year: EVENT_YEAR, created_at: nowIso() },
  { id: "ctr_kol_north", center_name: "Mind Mantra · Salt Lake",    owner_name: "Riya Banerjee",   phone: "+91 98300 11111", address: "Sector V, Salt Lake",    city: "Kolkata",   state: "West Bengal", pincode: "700091", event_year: EVENT_YEAR, created_at: nowIso() },
  { id: "ctr_kol_south", center_name: "Mind Mantra · Tollygunge",   owner_name: "Arjun Sen",       phone: "+91 98300 22222", address: "Charu Avenue",           city: "Kolkata",   state: "West Bengal", pincode: "700033", event_year: EVENT_YEAR, created_at: nowIso() },
  { id: "ctr_howrah",    center_name: "Mind Mantra · Howrah",       owner_name: "Pratima Roy",     phone: "+91 98300 33333", address: "Maidan Road",            city: "Howrah",    state: "West Bengal", pincode: "711101", event_year: EVENT_YEAR, created_at: nowIso() },
  { id: "ctr_durgapur",  center_name: "Mind Mantra · Durgapur",     owner_name: "Subir Das",       phone: "+91 98300 44444", address: "City Centre",            city: "Durgapur",  state: "West Bengal", pincode: "713216", event_year: EVENT_YEAR, created_at: nowIso() },
];

const SEED_STUDENT_NAMES = [
  "Aarav Sharma",   "Anika Banerjee", "Ishaan Roy",      "Diya Sen",
  "Vihaan Bose",    "Saanvi Ghosh",   "Reyansh Mukherjee", "Anaya Dutta",
  "Aditya Pal",     "Myra Chakraborty", "Kabir Chatterjee", "Aarohi Mitra",
  "Aryan Das",      "Pari Mondal",    "Vivaan Khan",     "Tara Saha",
];

function seedStudents(snapshot: Snapshot): Student[] {
  const created: Student[] = [];
  SEED_STUDENT_NAMES.forEach((name, idx) => {
    const center = SEED_CENTERS[idx % SEED_CENTERS.length];
    const cat    = SEED_CATEGORIES[idx % SEED_CATEGORIES.length];
    const status: StudentStatus = idx % 5 === 0 ? "pending" : idx % 7 === 0 ? "rejected" : "approved";
    const age = 7 + (idx % 7);
    created.push({
      id: uid("stu"),
      center_id: center.id,
      center_name: center.center_name,
      full_name: name,
      guardian_name: name.split(" ")[1] + " (Parent)",
      dob: `${EVENT_YEAR - age}-0${(idx % 9) + 1}-15`,
      age,
      class: `Class ${age - 5}`,
      school_name: `${center.city} Public School`,
      category_id: cat.id,
      category_name: cat.name,
      phone: "+91 98300 " + String(55555 + idx).padStart(5, "0"),
      whatsapp: null,
      address: null,
      city: center.city,
      state: center.state,
      pincode: center.pincode,
      photo_url: `https://i.pravatar.cc/200?u=${encodeURIComponent(name)}`,
      roll_number: nextRoll(snapshot, cat.prefix),
      status,
      event_year: EVENT_YEAR,
      performance_topic: cat.slug === "dance" ? "Bharatanatyam" : cat.slug === "song" ? "Rabindrasangeet" : null,
      performance_details: null,
      created_by: null,
      created_at: new Date(Date.now() - idx * 86400000).toISOString(),
      updated_at: nowIso(),
    });
  });
  return created;
}

function seedPayments(snapshot: Snapshot): Payment[] {
  return SEED_CENTERS.map((c, i) => {
    const status: PaymentStatus = i === 0 ? "pending" : i === 1 ? "pending" : i === 2 ? "approved" : "approved";
    return {
      id: uid("pay"),
      center_id: c.id,
      center_name: c.center_name,
      uploaded_by: null,
      amount: 1600 + i * 400,
      transaction_ref: `UPI${EVENT_YEAR}${String(10000 + i)}`,
      screenshot_url: `https://picsum.photos/seed/payment-${i}/600/800`,
      status,
      reviewed_by: status === "approved" ? "admin" : null,
      reviewed_at: status === "approved" ? nowIso() : null,
      review_note: null,
      event_year: EVENT_YEAR,
      created_at: new Date(Date.now() - i * 86400000 * 2).toISOString(),
    };
  });
}

/* ---------- DataStore implementation ---------- */

export const localStore: DataStore = {
  async ensureSeeded() {
    if (!isBrowser()) return;
    if (window.localStorage.getItem(SEEDED_FLAG) === SEED_VERSION) return;
    const snap = structuredClone(empty);
    snap.categories = SEED_CATEGORIES;
    snap.centers = SEED_CENTERS;
    snap.students = seedStudents(snap);
    snap.payments = seedPayments(snap);
    write(snap);
    window.localStorage.setItem(SEEDED_FLAG, SEED_VERSION);
  },

  async reset() {
    if (!isBrowser()) return;
    window.localStorage.removeItem(KEY);
    window.localStorage.removeItem(SEEDED_FLAG);
    await this.ensureSeeded();
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
      status: input.status ?? "pending",
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
    s.students[idx] = { ...s.students[idx], ...patch, updated_at: nowIso() };
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
    const row: Center = { ...input, id: uid("ctr"), event_year: EVENT_YEAR, created_at: nowIso() };
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
  async deleteCenter(id) {
    const s = read();
    s.centers = s.centers.filter((c) => c.id !== id);
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
    write(s);
    return s.payments[idx];
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
};
