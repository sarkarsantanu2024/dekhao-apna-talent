/**
 * Supabase-backed DataStore.
 *
 * Mirrors `localStore` but persists to Postgres via the browser anon client.
 * Activated when the Supabase env vars are present (see ./index.ts). Mutations
 * call `emitStoreChange()` so the `useStore*` hooks re-read, exactly like the
 * local store.
 *
 * ⚠️ Demo-grade access model: the browser talks to Supabase with the anon key
 * under permissive RLS (see supabase/migrations/0002_app_alignment.sql). Auth is
 * NextAuth, not Supabase Auth, so RLS can't scope per-user. Lock this down with
 * Supabase Auth + real policies (or route writes through the service role)
 * before any production / real-money use.
 *
 * Fixed admins aren't rows in `public.users`, so reviewer/creator FK columns
 * (reviewed_by / created_by / uploaded_by) are stored as null — the UI falls
 * back to showing "admin".
 */

import { supabaseBrowser } from "@/lib/supabase/client";
import { deleteUploadedFiles } from "@/lib/upload";
import { EVENT_YEAR } from "@/constants";
import type {
  ActivityEvent,
  Category,
  Center,
  Enquiry,
  Payment,
  Student,
} from "@/types";
import {
  emitStoreChange,
  type DashboardStats,
  type DataStore,
} from "./store";
import type { SupabaseClient } from "@supabase/supabase-js";

let _browser: SupabaseClient | null = null;
/** Memoised browser anon client — used by the direct (permissive) store path. */
function browserClient(): SupabaseClient {
  return (_browser ??= supabaseBrowser());
}

/** Pull `{ bucket, path }` out of a Supabase Storage public/signed URL. */
function parseStorageUrl(u: string): { bucket: string; path: string } | null {
  const m = /\/storage\/v1\/object\/(?:public|sign)\/([^/]+)\/(.+?)(?:\?|$)/.exec(u);
  return m ? { bucket: m[1], path: decodeURIComponent(m[2]) } : null;
}

/**
 * Remove previously-uploaded files. Server-side (admin client) deletes directly
 * from Storage; in the browser it routes through /api/upload (the anon role
 * can't delete Storage objects). Best-effort — never throws.
 */
async function cleanupFiles(
  client: SupabaseClient,
  urls: string | null | undefined | Array<string | null | undefined>,
): Promise<void> {
  const list = (Array.isArray(urls) ? urls : [urls]).filter(
    (u): u is string => typeof u === "string" && u.startsWith("http"),
  );
  if (!list.length) return;
  if (typeof window === "undefined") {
    const byBucket = new Map<string, string[]>();
    for (const u of list) {
      const p = parseStorageUrl(u);
      if (!p) continue;
      const arr = byBucket.get(p.bucket) ?? [];
      arr.push(p.path);
      byBucket.set(p.bucket, arr);
    }
    for (const [bucket, paths] of byBucket) {
      try { await client.storage.from(bucket).remove(paths); } catch { /* best-effort */ }
    }
    return;
  }
  return deleteUploadedFiles(list);
}

const nowIso = () => new Date().toISOString();

/** Throw on Supabase error, else return data. */
function must<T>(res: { data: T; error: { message: string } | null }): T {
  if (res.error) throw new Error(res.error.message);
  return res.data;
}

/* ---------- row → domain mappers (coerce numeric/boolean) ---------- */

type Row = Record<string, unknown>;

function toCenter(r: Row): Center {
  return {
    id: String(r.id),
    center_name: String(r.center_name),
    owner_name: (r.owner_name as string) ?? null,
    phone: (r.phone as string) ?? null,
    whatsapp: (r.whatsapp as string) ?? null,
    address: (r.address as string) ?? null,
    city: (r.city as string) ?? null,
    state: (r.state as string) ?? null,
    pincode: (r.pincode as string) ?? null,
    start_date: (r.start_date as string) ?? null,
    participating: Boolean(r.participating),
    // Derived deterministically at sign-in / on the Credentials page — never stored.
    login_id: null,
    login_password: null,
    event_year: Number(r.event_year ?? EVENT_YEAR),
    created_at: String(r.created_at ?? nowIso()),
  };
}

function toStudent(r: Row): Student {
  return {
    id: String(r.id),
    center_id: (r.center_id as string) ?? null,
    center_name: String(r.center_name ?? ""),
    full_name: String(r.full_name ?? ""),
    guardian_name: String(r.guardian_name ?? ""),
    dob: (r.dob as string) ?? "",
    age: Number(r.age ?? 0),
    class: (r.class as string) ?? null,
    school_name: (r.school_name as string) ?? null,
    category_id: (r.category_id as string) ?? null,
    category_name: String(r.category_name ?? ""),
    phone: (r.phone as string) ?? null,
    whatsapp: (r.whatsapp as string) ?? null,
    address: (r.address as string) ?? null,
    city: (r.city as string) ?? null,
    state: (r.state as string) ?? null,
    pincode: (r.pincode as string) ?? null,
    photo_url: (r.photo_url as string) ?? null,
    roll_number: (r.roll_number as string) ?? null,
    status: (r.status as Student["status"]) ?? "pending",
    event_year: Number(r.event_year ?? EVENT_YEAR),
    performance_topic: (r.performance_topic as string) ?? null,
    performance_details: (r.performance_details as string) ?? null,
    created_by: (r.created_by as string) ?? null,
    created_at: String(r.created_at ?? nowIso()),
    updated_at: String(r.updated_at ?? nowIso()),
  };
}

function toPayment(r: Row): Payment {
  return {
    id: String(r.id),
    center_id: (r.center_id as string) ?? null,
    center_name: String(r.center_name ?? ""),
    student_id: (r.student_id as string) ?? null,
    student_name: (r.student_name as string) ?? null,
    uploaded_by: (r.uploaded_by as string) ?? null,
    amount: Number(r.amount ?? 0),
    transaction_ref: (r.transaction_ref as string) ?? null,
    screenshot_url: String(r.screenshot_url ?? ""),
    status: (r.status as Payment["status"]) ?? "pending",
    reviewed_by: (r.reviewed_by as string) ?? null,
    reviewed_at: (r.reviewed_at as string) ?? null,
    review_note: (r.review_note as string) ?? null,
    event_year: Number(r.event_year ?? EVENT_YEAR),
    created_at: String(r.created_at ?? nowIso()),
  };
}

function toCategory(r: Row): Category {
  return {
    id: String(r.id),
    name: String(r.name),
    slug: String(r.slug),
    prefix: String(r.prefix),
    description: (r.description as string) ?? null,
    fee: Number(r.fee ?? 0),
    active: Boolean(r.active),
  };
}

function toEnquiry(r: Row): Enquiry {
  return {
    id: String(r.id),
    name: String(r.name ?? ""),
    phone: (r.phone as string) ?? null,
    email: String(r.email ?? ""),
    message: String(r.message ?? ""),
    status: (r.status as Enquiry["status"]) ?? "new",
    event_year: Number(r.event_year ?? EVENT_YEAR),
    created_at: String(r.created_at ?? nowIso()),
  };
}

function toEvent(r: Row): ActivityEvent {
  return {
    id: String(r.id),
    type: r.type as ActivityEvent["type"],
    audience: r.audience as ActivityEvent["audience"],
    message: String(r.message ?? ""),
    center_id: (r.center_id as string) ?? null,
    center_name: (r.center_name as string) ?? null,
    created_at: String(r.created_at ?? nowIso()),
  };
}

/* ---------- DataStore implementation (factory) ---------- */

/**
 * Build a DataStore over Supabase. `getClient` supplies the client:
 *  - browser anon client → direct path (permissive RLS)
 *  - service-role admin client → server path behind /api/data (hardened)
 */
export function createSupabaseStore(getClient: () => SupabaseClient): DataStore {
  const sb = getClient;

  /** Insert an activity-feed row (best-effort — never blocks the main mutation). */
  const logEventRow = async (input: Omit<ActivityEvent, "id" | "created_at">): Promise<void> => {
    try {
      await sb().from("activity_events").insert({
        type: input.type,
        audience: input.audience,
        message: input.message,
        center_id: input.center_id,
        center_name: input.center_name,
      });
    } catch {
      /* feed is non-critical */
    }
  };

  return {
  // Schema + categories are seeded by the SQL migrations.
  ensureSeeded: async () => {},
  reset: async () => { throw new Error("reset() is destructive in production — disabled."); },
  resetTestData: async () => { throw new Error("resetTestData() is disabled in production."); },

  async getStats(): Promise<DashboardStats> {
    const client = sb();
    const [studentsRes, paymentsRes, centersRes] = await Promise.all([
      client.from("students").select("status,category_name"),
      client.from("payments").select("status,amount"),
      client.from("centers").select("id", { count: "exact", head: true }),
    ]);
    const students = (must(studentsRes) ?? []) as Row[];
    const payments = (must(paymentsRes) ?? []) as Row[];

    const byCat = new Map<string, number>();
    let pendingStudents = 0, approvedStudents = 0, rejectedStudents = 0, activeStudents = 0;
    for (const s of students) {
      const name = String(s.category_name ?? "");
      byCat.set(name, (byCat.get(name) ?? 0) + 1);
      if      (s.status === "pending")  pendingStudents++;
      else if (s.status === "approved") approvedStudents++;
      else if (s.status === "rejected") rejectedStudents++;
      else if (s.status === "active")   activeStudents++;
    }
    let pendingPayments = 0, approvedPayments = 0, rejectedPayments = 0, collected = 0;
    for (const p of payments) {
      if      (p.status === "pending")  pendingPayments++;
      else if (p.status === "approved") { approvedPayments++; collected += Number(p.amount); }
      else if (p.status === "rejected") rejectedPayments++;
    }
    return {
      students: students.length,
      centers: centersRes.count ?? 0,
      pendingStudents, approvedStudents, rejectedStudents, activeStudents,
      pendingPayments, approvedPayments, rejectedPayments,
      collected,
      byCategory: [...byCat.entries()].map(([categoryName, count]) => ({ categoryName, count })),
    };
  },

  /* ----- students ----- */
  async listStudents(opts) {
    let q = sb().from("students").select("*").order("created_at", { ascending: false });
    if (opts?.centerId) q = q.eq("center_id", opts.centerId);
    if (opts?.status) q = q.eq("status", opts.status);
    return ((must(await q) ?? []) as Row[]).map(toStudent);
  },
  async getStudent(id) {
    const r = (await sb().from("students").select("*").eq("id", id).maybeSingle()).data as Row | null;
    return r ? toStudent(r) : null;
  },
  async createStudent(input) {
    const client = sb();
    const cat = (await client.from("categories").select("prefix").eq("id", input.category_id).maybeSingle()).data as Row | null;
    const prefix = (cat?.prefix as string) ?? "OTHER";
    const roll = must(await client.rpc("next_roll_number", { p_prefix: prefix, p_year: EVENT_YEAR })) as string;
    const payload: Row = {
      center_id: input.center_id,
      center_name: input.center_name,
      full_name: input.full_name,
      guardian_name: input.guardian_name,
      dob: input.dob,
      age: input.age,
      class: input.class,
      school_name: input.school_name,
      category_id: input.category_id,
      category_name: input.category_name,
      phone: input.phone,
      whatsapp: input.whatsapp,
      address: input.address,
      city: input.city,
      state: input.state,
      pincode: input.pincode,
      photo_url: input.photo_url,
      performance_topic: input.performance_topic,
      performance_details: input.performance_details,
      created_by: null,
      roll_number: roll,
      status: input.status ?? "approved",
      event_year: EVENT_YEAR,
    };
    const row = must(await client.from("students").insert(payload).select().single()) as Row;
    emitStoreChange();
    return toStudent(row);
  },
  async updateStudent(id, patch) {
    const client = sb();
    const before = (await client.from("students").select("status,full_name,center_id,center_name").eq("id", id).maybeSingle()).data as Row | null;
    const row = must(await client.from("students").update(patch as Row).eq("id", id).select().single()) as Row;
    if (patch.status === "rejected" && before && before.status !== "rejected") {
      await logEventRow({
        type: "student_rejected",
        audience: "center",
        message: `Student ${row.full_name} was rejected by admin — edit & re-submit`,
        center_id: (row.center_id as string) ?? null,
        center_name: (row.center_name as string) ?? null,
      });
    }
    emitStoreChange();
    return toStudent(row);
  },
  async deleteStudent(id) {
    const prev = (await sb().from("students").select("photo_url").eq("id", id).maybeSingle()).data as Row | null;
    must(await sb().from("students").delete().eq("id", id).select());
    await cleanupFiles(sb(),(prev?.photo_url as string) ?? null);
    emitStoreChange();
  },

  /* ----- centers ----- */
  async listCenters() {
    return ((must(await sb().from("centers").select("*").order("created_at", { ascending: false })) ?? []) as Row[]).map(toCenter);
  },
  async getCenter(id) {
    const r = (await sb().from("centers").select("*").eq("id", id).maybeSingle()).data as Row | null;
    return r ? toCenter(r) : null;
  },
  async createCenter(input) {
    const payload: Row = {
      center_name: input.center_name,
      owner_name: input.owner_name,
      phone: input.phone,
      whatsapp: input.whatsapp,
      address: input.address,
      city: input.city,
      state: input.state,
      pincode: input.pincode,
      start_date: input.start_date,
      participating: input.participating ?? false,
      event_year: EVENT_YEAR,
    };
    const row = must(await sb().from("centers").insert(payload).select().single()) as Row;
    emitStoreChange();
    return toCenter(row);
  },
  async updateCenter(id, patch) {
    const client = sb();
    // login_id/login_password aren't columns — strip before writing.
    const { login_id: _l, login_password: _p, ...rest } = patch;
    void _l; void _p;
    const row = must(await client.from("centers").update(rest as Row).eq("id", id).select().single()) as Row;
    if (patch.center_name) {
      await client.from("students").update({ center_name: patch.center_name }).eq("center_id", id);
      await client.from("payments").update({ center_name: patch.center_name }).eq("center_id", id);
    }
    emitStoreChange();
    return toCenter(row);
  },
  // Credentials are derived deterministically (see lib/auth/center-credentials.ts),
  // so there's nothing to generate — just return the current centres.
  async generateCenterLogins() {
    return this.listCenters();
  },
  async deleteCenter(id) {
    const client = sb();
    // Collect the centre's files first so we can clean Storage after deletion.
    const [studs, pays] = await Promise.all([
      client.from("students").select("photo_url").eq("center_id", id),
      client.from("payments").select("screenshot_url").eq("center_id", id),
    ]);
    const files = [
      ...(((studs.data ?? []) as Row[]).map((r) => r.photo_url as string)),
      ...(((pays.data ?? []) as Row[]).map((r) => r.screenshot_url as string)),
    ];
    // No DB cascade for these (FK is SET NULL), so remove dependents explicitly.
    await client.from("payments").delete().eq("center_id", id);
    await client.from("students").delete().eq("center_id", id);
    must(await client.from("centers").delete().eq("id", id).select());
    await cleanupFiles(sb(),files);
    emitStoreChange();
  },

  /* ----- payments ----- */
  async listPayments(opts) {
    let q = sb().from("payments").select("*").order("created_at", { ascending: false });
    if (opts?.status) q = q.eq("status", opts.status);
    if (opts?.centerId) q = q.eq("center_id", opts.centerId);
    return ((must(await q) ?? []) as Row[]).map(toPayment);
  },
  async createPayment(input) {
    const payload: Row = {
      center_id: input.center_id,
      center_name: input.center_name,
      student_id: input.student_id,
      student_name: input.student_name,
      uploaded_by: null,
      amount: input.amount,
      transaction_ref: input.transaction_ref,
      screenshot_url: input.screenshot_url,
      status: input.status ?? "pending",
      event_year: EVENT_YEAR,
    };
    const row = must(await sb().from("payments").insert(payload).select().single()) as Row;
    await logEventRow({
      type: "payment_uploaded",
      audience: "admin",
      message: `uploaded a payment${row.student_name ? ` for ${row.student_name}` : ""}`,
      center_id: (row.center_id as string) ?? null,
      center_name: (row.center_name as string) ?? null,
    });
    emitStoreChange();
    return toPayment(row);
  },
  async approvePayment(id, note) {
    const client = sb();
    const row = must(await client.from("payments").update({
      status: "approved", reviewed_by: null, reviewed_at: nowIso(), review_note: note ?? null,
    }).eq("id", id).select().single()) as Row;
    if (row.center_id) await client.from("centers").update({ participating: true }).eq("id", row.center_id);
    if (row.student_id) await client.from("students").update({ status: "active" }).eq("id", row.student_id);
    await logEventRow({
      type: "payment_approved",
      audience: "center",
      message: `Payment${row.student_name ? ` for ${row.student_name}` : ""} approved — chest card unlocked`,
      center_id: (row.center_id as string) ?? null,
      center_name: (row.center_name as string) ?? null,
    });
    emitStoreChange();
    return toPayment(row);
  },
  async rejectPayment(id, note) {
    const row = must(await sb().from("payments").update({
      status: "rejected", reviewed_by: null, reviewed_at: nowIso(), review_note: note ?? null,
    }).eq("id", id).select().single()) as Row;
    await logEventRow({
      type: "payment_rejected",
      audience: "center",
      message: `Payment${row.student_name ? ` for ${row.student_name}` : ""} rejected${note ? `: ${note}` : ""} — please re-submit`,
      center_id: (row.center_id as string) ?? null,
      center_name: (row.center_name as string) ?? null,
    });
    emitStoreChange();
    return toPayment(row);
  },
  async revertPayment(id, note) {
    const client = sb();
    const prev = (await client.from("payments").select("*").eq("id", id).maybeSingle()).data as Row | null;
    if (!prev) throw new Error("Payment not found");
    const wasApproved = prev.status === "approved";
    const row = must(await client.from("payments").update({
      status: "pending", reviewed_by: null, reviewed_at: null, review_note: note ?? null,
    }).eq("id", id).select().single()) as Row;
    if (wasApproved) {
      if (prev.student_id) await client.from("students").update({ status: "approved" }).eq("id", prev.student_id).eq("status", "active");
      if (prev.center_id) {
        const others = (must(await client.from("payments").select("id").eq("center_id", prev.center_id).eq("status", "approved")) ?? []) as Row[];
        if (others.length === 0) await client.from("centers").update({ participating: false }).eq("id", prev.center_id);
      }
    }
    await logEventRow({
      type: "payment_reverted",
      audience: "center",
      message:
        `Admin moved your payment${prev.student_name ? ` for ${prev.student_name}` : ""} back to pending` +
        `${note ? `. Reason: ${note}` : ""}. Open Payments → Edit to upload a clearer screenshot or fix the details; it will be reviewed again.`,
      center_id: (prev.center_id as string) ?? null,
      center_name: (prev.center_name as string) ?? null,
    });
    emitStoreChange();
    return toPayment(row);
  },
  async updatePayment(id, patch) {
    const client = sb();
    // If the screenshot is being replaced, remember the old file to delete after.
    let oldUrl: string | undefined;
    if (patch.screenshot_url) {
      const prev = (await client.from("payments").select("screenshot_url").eq("id", id).maybeSingle()).data as Row | null;
      oldUrl = (prev?.screenshot_url as string) ?? undefined;
    }
    const update: Row = {};
    if (patch.amount !== undefined) update.amount = patch.amount;
    if (patch.transaction_ref !== undefined) update.transaction_ref = patch.transaction_ref;
    if (patch.screenshot_url !== undefined) update.screenshot_url = patch.screenshot_url;
    const row = must(await client.from("payments").update(update).eq("id", id).select().single()) as Row;
    if (oldUrl && oldUrl !== patch.screenshot_url) await cleanupFiles(sb(),oldUrl);
    emitStoreChange();
    return toPayment(row);
  },
  async deletePayment(id) {
    const client = sb();
    const prev = (await client.from("payments").select("*").eq("id", id).maybeSingle()).data as Row | null;
    if (!prev) return;
    must(await client.from("payments").delete().eq("id", id).select());
    await cleanupFiles(sb(),(prev.screenshot_url as string) ?? null);
    if (prev.status === "approved") {
      if (prev.student_id) await client.from("students").update({ status: "approved" }).eq("id", prev.student_id).eq("status", "active");
      if (prev.center_id) {
        const others = (must(await client.from("payments").select("id").eq("center_id", prev.center_id).eq("status", "approved")) ?? []) as Row[];
        if (others.length === 0) await client.from("centers").update({ participating: false }).eq("id", prev.center_id);
      }
    }
    emitStoreChange();
  },
  async resubmitPayment(id, patch) {
    const client = sb();
    const prev = (await client.from("payments").select("*").eq("id", id).maybeSingle()).data as Row | null;
    if (!prev) throw new Error("Payment not found");
    if (prev.status !== "rejected") throw new Error("Only rejected payments can be resubmitted");
    const oldUrl = (prev.screenshot_url as string) ?? null;
    const row = must(await client.from("payments").update({
      screenshot_url: patch.screenshot_url,
      amount: patch.amount ?? prev.amount,
      transaction_ref: patch.transaction_ref ?? prev.transaction_ref,
      status: "pending", reviewed_by: null, reviewed_at: null, review_note: null,
      created_at: nowIso(),
    }).eq("id", id).select().single()) as Row;
    if (oldUrl && oldUrl !== patch.screenshot_url) await cleanupFiles(sb(),oldUrl);
    await logEventRow({
      type: "payment_resubmitted",
      audience: "admin",
      message: `re-submitted a payment${prev.student_name ? ` for ${prev.student_name}` : ""}`,
      center_id: (prev.center_id as string) ?? null,
      center_name: (prev.center_name as string) ?? null,
    });
    emitStoreChange();
    return toPayment(row);
  },

  /* ----- activity feed ----- */
  async listEvents() {
    return ((must(await sb().from("activity_events").select("*").order("created_at", { ascending: false })) ?? []) as Row[]).map(toEvent);
  },
  async logEvent(input) {
    await logEventRow(input);
    emitStoreChange();
  },

  /* ----- categories ----- */
  async listCategories() {
    return ((must(await sb().from("categories").select("*").order("name", { ascending: true })) ?? []) as Row[]).map(toCategory);
  },
  async updateCategory(id, patch) {
    const row = must(await sb().from("categories").update(patch as Row).eq("id", id).select().single()) as Row;
    emitStoreChange();
    return toCategory(row);
  },

  /* ----- enquiries (public "Send a message" form) ----- */
  async listEnquiries(opts) {
    let q = sb().from("enquiries").select("*").order("created_at", { ascending: false });
    if (opts?.status) q = q.eq("status", opts.status);
    return ((must(await q) ?? []) as Row[]).map(toEnquiry);
  },
  async createEnquiry(input) {
    const payload: Row = {
      name: input.name,
      phone: input.phone ?? null,
      email: input.email,
      message: input.message,
      status: "new",
      event_year: EVENT_YEAR,
    };
    const row = must(await sb().from("enquiries").insert(payload).select().single()) as Row;
    emitStoreChange();
    return toEnquiry(row);
  },
  async updateEnquiry(id, patch) {
    const row = must(await sb().from("enquiries").update({ status: patch.status }).eq("id", id).select().single()) as Row;
    emitStoreChange();
    return toEnquiry(row);
  },
  async deleteEnquiry(id) {
    must(await sb().from("enquiries").delete().eq("id", id).select());
    emitStoreChange();
  },
  };
}

/** Direct browser-anon store — the permissive fallback path (NEXT_PUBLIC_DATA_MODE=direct). */
export const supabaseStore = createSupabaseStore(browserClient);
