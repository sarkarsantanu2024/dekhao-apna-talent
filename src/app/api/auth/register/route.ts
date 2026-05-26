import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { registerSchema } from "@/lib/validations/auth";
import { hashPassword } from "@/lib/auth/password";
import { EVENT_YEAR } from "@/constants";

export async function POST(req: Request) {
  const body = await req.json().catch(() => null);
  const parsed = registerSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid input", issues: parsed.error.flatten() }, { status: 400 });
  }
  const v = parsed.data;
  const sb = supabaseAdmin();

  const { data: existing } = await sb.from("users").select("id").eq("email", v.email).maybeSingle();
  if (existing) return NextResponse.json({ error: "Email is already registered" }, { status: 409 });

  const { data: centre, error: centerErr } = await sb
    .from("centers")
    .insert({
      center_name: v.center_name,
      owner_name: v.name,
      phone: v.phone ?? null,
      address: v.address ?? null,
      city: v.city,
      state: v.state,
      pincode: v.pincode,
      event_year: EVENT_YEAR,
    })
    .select("id")
    .single();
  if (centerErr || !centre) return NextResponse.json({ error: centerErr?.message ?? "Centre create failed" }, { status: 500 });

  const password_hash = await hashPassword(v.password);
  const { error: userErr } = await sb.from("users").insert({
    name: v.name, email: v.email, password_hash, role: "center_owner",
    center_id: centre.id, phone: v.phone ?? null,
  });
  if (userErr) return NextResponse.json({ error: userErr.message }, { status: 500 });

  return NextResponse.json({ ok: true });
}
