import { NextResponse } from "next/server";
import { auth } from "@/lib/auth/auth";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { renderToBuffer, type DocumentProps } from "@react-pdf/renderer";
import QRCode from "qrcode";
import { ChestCardDocument } from "@/lib/pdf/chest-card";
import type { ReactElement } from "react";
import { SITE_URL, EVENT_NAME } from "@/constants";

export async function GET(_: Request, ctx: { params: Promise<{ studentId: string }> }) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { studentId } = await ctx.params;

  const sb = supabaseAdmin();
  const { data: student, error } = await sb.from("students").select("*").eq("id", studentId).maybeSingle();
  if (error || !student) return NextResponse.json({ error: "Not found" }, { status: 404 });

  if (session.user.role === "center_owner" && student.center_id !== session.user.centerId) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  if (student.status !== "active") {
    return NextResponse.json({ error: "Chest card not yet activated. Awaiting admin approval." }, { status: 403 });
  }

  const qrPayload = `${SITE_URL}/verify?roll=${encodeURIComponent(student.roll_number ?? "")}`;
  const qrDataUrl = await QRCode.toDataURL(qrPayload, { width: 256, margin: 1 });

  // PDF
  const pdf = await renderToBuffer(
    ChestCardDocument({ student, qrDataUrl, eventName: EVENT_NAME }) as unknown as ReactElement<DocumentProps>
  );

  await sb.from("chest_cards").upsert({
    student_id: student.id,
    qr_payload: qrPayload,
    active: true,
    generated_at: new Date().toISOString(),
  }, { onConflict: "student_id" });

  return new NextResponse(new Uint8Array(pdf), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="chest-card-${student.roll_number ?? student.id}.pdf"`,
      "Cache-Control": "no-store",
    },
  });
}
