import { NextResponse } from "next/server";
import { auth } from "@/lib/auth/auth";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { studentSchema } from "@/lib/validations/student";
import { generateRollNumber } from "@/lib/utils/roll-number";
import { EVENT_YEAR } from "@/constants";

export async function GET(req: Request) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const url = new URL(req.url);
  const q = url.searchParams.get("q")?.trim();
  const category = url.searchParams.get("category");
  const status = url.searchParams.get("status");
  const center = url.searchParams.get("center");
  const page = Math.max(1, Number(url.searchParams.get("page") ?? 1));
  const limit = Math.min(100, Math.max(1, Number(url.searchParams.get("limit") ?? 25)));
  const from = (page - 1) * limit;
  const to = from + limit - 1;

  let query = supabaseAdmin()
    .from("students")
    .select("*", { count: "exact" })
    .eq("event_year", EVENT_YEAR)
    .order("created_at", { ascending: false })
    .range(from, to);

  if (session.user.role === "center_owner") query = query.eq("center_id", session.user.centerId);
  else if (center) query = query.eq("center_id", center);

  if (q) query = query.or(`full_name.ilike.%${q}%,roll_number.ilike.%${q}%,guardian_name.ilike.%${q}%`);
  if (category) query = query.eq("category_id", category);
  if (status) query = query.eq("status", status);

  const { data, error, count } = await query;
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ students: data, page, limit, total: count ?? 0 });
}

export async function POST(req: Request) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json().catch(() => null);
  const parsed = studentSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "Invalid input", issues: parsed.error.flatten() }, { status: 400 });
  const v = parsed.data;

  if (session.user.role === "center_owner" && session.user.centerId) {
    v.center_id = session.user.centerId;
  }

  const sb = supabaseAdmin();
  const { data: cat, error: catErr } = await sb
    .from("categories").select("id, prefix, name").eq("id", v.category_id ?? "").maybeSingle();
  if (catErr || !cat) return NextResponse.json({ error: "Invalid category" }, { status: 400 });

  const roll = await generateRollNumber(cat.prefix as string, EVENT_YEAR);

  const { data, error } = await sb.from("students").insert({
    ...v,
    category_id: cat.id,
    category_name: cat.name as string,
    roll_number: roll,
    event_year: EVENT_YEAR,
    created_by: session.user.id,
  }).select("*").single();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ student: data });
}
