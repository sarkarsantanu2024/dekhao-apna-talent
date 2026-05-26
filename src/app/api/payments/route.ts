import { NextResponse } from "next/server";
import { auth } from "@/lib/auth/auth";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { paymentSchema } from "@/lib/validations/payment";
import { EVENT_YEAR } from "@/constants";

export async function GET(req: Request) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const url = new URL(req.url);
  const status = url.searchParams.get("status");

  let q = supabaseAdmin()
    .from("payments")
    .select("*")
    .eq("event_year", EVENT_YEAR)
    .order("created_at", { ascending: false });
  if (session.user.role === "center_owner") q = q.eq("center_id", session.user.centerId);
  if (status) q = q.eq("status", status);

  const { data, error } = await q;
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ payments: data });
}

export async function POST(req: Request) {
  const session = await auth();
  if (!session || session.user.role !== "center_owner") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const body = await req.json().catch(() => null);
  const parsed = paymentSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "Invalid input" }, { status: 400 });

  const sb = supabaseAdmin();
  const { data: centre } = await sb.from("centers").select("center_name").eq("id", session.user.centerId!).maybeSingle();

  const { data, error } = await sb.from("payments").insert({
    center_id: session.user.centerId,
    center_name: (centre?.center_name as string) ?? "Unknown",
    uploaded_by: session.user.id,
    amount: parsed.data.amount,
    transaction_ref: parsed.data.transaction_ref ?? null,
    screenshot_url: parsed.data.screenshot_url,
    event_year: EVENT_YEAR,
  }).select("*").single();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  if (parsed.data.student_ids?.length) {
    await sb.from("payment_students").insert(parsed.data.student_ids.map((sid) => ({ payment_id: data.id, student_id: sid })));
  }

  return NextResponse.json({ payment: data });
}
