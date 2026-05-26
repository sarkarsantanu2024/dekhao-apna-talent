import { NextResponse } from "next/server";
import type { Session } from "next-auth";
import { auth } from "@/lib/auth/auth";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { studentSchema } from "@/lib/validations/student";

async function loadAuthorised(id: string, session: Session) {
  const sb = supabaseAdmin();
  const { data, error } = await sb.from("students").select("*").eq("id", id).maybeSingle();
  if (error || !data) return null;
  if (session.user.role === "center_owner" && data.center_id !== session.user.centerId) return null;
  return data;
}

export async function GET(_: Request, ctx: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await ctx.params;
  const s = await loadAuthorised(id, session);
  if (!s) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json({ student: s });
}

export async function PATCH(req: Request, ctx: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await ctx.params;
  const existing = await loadAuthorised(id, session);
  if (!existing) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const body = await req.json().catch(() => ({}));
  const parsed = studentSchema.partial().safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "Invalid input" }, { status: 400 });

  const { data, error } = await supabaseAdmin().from("students").update(parsed.data).eq("id", id).select("*").single();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ student: data });
}

export async function DELETE(_: Request, ctx: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await ctx.params;
  const existing = await loadAuthorised(id, session);
  if (!existing) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const { error } = await supabaseAdmin().from("students").delete().eq("id", id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
