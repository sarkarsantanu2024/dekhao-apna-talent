/**
 * Authorized data API (hardened mode).
 *
 * The browser never touches Supabase directly. Every store operation is POSTed
 * here as { method, args }; this route checks the NextAuth session, enforces
 * per-role authorization, scopes/sanitizes the arguments, then runs the
 * operation with the service-role client (which bypasses RLS). Centre owners
 * are confined to their own centre's data.
 *
 * Pairs with RLS lockdown in supabase/migrations/0003_lock_rls.sql.
 */

import { NextResponse } from "next/server";
import type { SupabaseClient } from "@supabase/supabase-js";
import { auth } from "@/lib/auth/auth";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { createSupabaseStore } from "@/services/supabase-store";

export const runtime = "nodejs";

/** Every dispatchable store method (guards against calling arbitrary props). */
const ALL_METHODS = new Set([
  "getStats",
  "listStudents", "getStudent", "createStudent", "updateStudent", "deleteStudent",
  "listCenters", "getCenter", "createCenter", "updateCenter", "deleteCenter", "generateCenterLogins",
  "listPayments", "createPayment", "approvePayment", "rejectPayment", "revertPayment",
  "updatePayment", "deletePayment", "resubmitPayment",
  "listEvents", "logEvent", "listCategories", "updateCategory",
  // Enquiries are admin-only here; public submissions use /api/enquiries.
  "listEnquiries", "updateEnquiry", "deleteEnquiry",
]);

/** Never callable through the API. */
const BLOCKED = new Set(["reset", "resetTestData", "ensureSeeded"]);

/** Methods a centre owner may call (everything else is admin-only). */
const CENTER_ALLOWED = new Set([
  "listStudents", "getStudent", "createStudent", "updateStudent", "deleteStudent",
  "listCenters", "getCenter", "listPayments", "createPayment", "updatePayment",
  "deletePayment", "resubmitPayment", "listEvents", "logEvent", "listCategories",
]);

type Args = unknown[];
type Obj = Record<string, unknown>;

async function ownsStudent(admin: SupabaseClient, id: unknown, centerId: string): Promise<boolean> {
  const { data } = await admin.from("students").select("center_id").eq("id", id).maybeSingle();
  return !!data && (data as Obj).center_id === centerId;
}
async function ownsPayment(admin: SupabaseClient, id: unknown, centerId: string): Promise<boolean> {
  const { data } = await admin.from("payments").select("center_id").eq("id", id).maybeSingle();
  return !!data && (data as Obj).center_id === centerId;
}

/**
 * Scope/sanitize a centre owner's arguments so they can only ever act on their
 * own centre. Throws (→ 403) on an ownership violation.
 */
async function scopeForCenter(
  method: string,
  args: Args,
  admin: SupabaseClient,
  centerId: string,
  centerName: string,
): Promise<Args> {
  const forbid = () => { throw new Error("Forbidden"); };

  switch (method) {
    case "listStudents":
    case "listPayments":
      return [{ ...((args[0] as Obj) ?? {}), centerId }];

    case "getCenter":
      if (args[0] !== centerId) forbid();
      return args;

    case "createStudent":
      return [{ ...(args[0] as Obj), center_id: centerId, center_name: centerName }];

    case "createPayment":
      // Centre owners always submit as pending; they can't self-approve.
      return [{ ...(args[0] as Obj), center_id: centerId, center_name: centerName, status: "pending" }];

    case "updateStudent": {
      if (!(await ownsStudent(admin, args[0], centerId))) forbid();
      const patch = { ...(args[1] as Obj) };
      delete patch.center_id;       // can't move a student to another centre
      delete patch.center_name;
      if (patch.status === "active") delete patch.status; // can't bypass payment to unlock the card
      return [args[0], patch];
    }

    case "deleteStudent":
      if (!(await ownsStudent(admin, args[0], centerId))) forbid();
      return args;

    case "updatePayment":
    case "deletePayment":
    case "resubmitPayment":
      if (!(await ownsPayment(admin, args[0], centerId))) forbid();
      return args;

    case "logEvent":
      return [{ ...(args[0] as Obj), center_id: centerId, center_name: centerName }];

    // getStudent, listCenters, listEvents, listCategories: no arg scoping —
    // results are filtered after the call.
    default:
      return args;
  }
}

/** Filter read results so a centre owner only sees their own data. */
function filterForCenter(method: string, data: unknown, centerId: string): unknown {
  if (method === "listCenters" && Array.isArray(data)) {
    return data.filter((c) => (c as Obj).id === centerId);
  }
  if (method === "listEvents" && Array.isArray(data)) {
    return data.filter((e) => (e as Obj).audience === "center" && (e as Obj).center_id === centerId);
  }
  if (method === "getStudent" && data && (data as Obj).center_id !== centerId) {
    return null;
  }
  return data;
}

export async function POST(req: Request) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  let body: { method?: unknown; args?: unknown };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const method = String(body.method ?? "");
  let args: Args = Array.isArray(body.args) ? body.args : [];

  if (!ALL_METHODS.has(method) || BLOCKED.has(method)) {
    return NextResponse.json({ error: "Unknown method" }, { status: 400 });
  }

  const role = session.user.role;
  const centerId = session.user.centerId;
  const centerName = session.user.name ?? "";
  const admin = supabaseAdmin();
  const store = createSupabaseStore(() => admin);

  if (role !== "admin") {
    if (!CENTER_ALLOWED.has(method)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
    if (!centerId) {
      return NextResponse.json({ error: "No centre assigned" }, { status: 403 });
    }
    try {
      args = await scopeForCenter(method, args, admin, centerId, centerName);
    } catch {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
  }

  const fn = (store as unknown as Record<string, (...a: Args) => Promise<unknown>>)[method];
  if (typeof fn !== "function") {
    return NextResponse.json({ error: "Unknown method" }, { status: 400 });
  }

  let data: unknown;
  try {
    data = await fn.apply(store, args);
  } catch (err) {
    return NextResponse.json({ error: err instanceof Error ? err.message : "Request failed" }, { status: 400 });
  }

  if (role !== "admin" && centerId) {
    data = filterForCenter(method, data, centerId);
  }

  return NextResponse.json({ data });
}
