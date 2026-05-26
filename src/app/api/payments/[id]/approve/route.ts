import { NextResponse } from "next/server";
import { auth } from "@/lib/auth/auth";
import { supabaseAdmin } from "@/lib/supabase/admin";

export async function POST(_: Request, ctx: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session || session.user.role !== "admin") return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await ctx.params;
  const sb = supabaseAdmin();

  const { data: payment, error } = await sb
    .from("payments")
    .update({ status: "approved", reviewed_by: session.user.id, reviewed_at: new Date().toISOString() })
    .eq("id", id)
    .select("*")
    .single();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  // Promote linked students to "active" so chest-card download unlocks.
  const { data: links } = await sb.from("payment_students").select("student_id").eq("payment_id", id);
  const ids = (links ?? []).map((l) => l.student_id as string);
  if (ids.length) await sb.from("students").update({ status: "active" }).in("id", ids);
  else if (payment.center_id) {
    await sb.from("students")
      .update({ status: "active" })
      .eq("center_id", payment.center_id)
      .eq("status", "pending");
  }
  return NextResponse.json({ ok: true });
}
