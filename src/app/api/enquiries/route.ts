/**
 * Public enquiry intake — the website "Send a message" form posts here.
 *
 * This is intentionally UNauthenticated (visitors aren't logged in), so it does
 * NOT go through /api/data. It validates the payload, then writes with the
 * service-role client (bypasses the locked-down RLS). Admins read the results
 * on /admin/enquiries via the session-gated /api/data path.
 */

import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { createSupabaseStore } from "@/services/supabase-store";

export const runtime = "nodejs";

const clip = (v: unknown, max: number): string => String(v ?? "").trim().slice(0, max);
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function POST(req: Request) {
  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  const name = clip(body.name, 120);
  const email = clip(body.email, 200);
  const phone = clip(body.phone, 40);
  const message = clip(body.message, 4000);

  if (!name) return NextResponse.json({ error: "Please enter your name." }, { status: 400 });
  if (!EMAIL_RE.test(email)) return NextResponse.json({ error: "Please enter a valid email." }, { status: 400 });
  if (!message) return NextResponse.json({ error: "Please enter a message." }, { status: 400 });

  const store = createSupabaseStore(() => supabaseAdmin());
  try {
    await store.createEnquiry({ name, email, message, phone: phone || null });
  } catch {
    return NextResponse.json({ error: "Could not send — please try again." }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
