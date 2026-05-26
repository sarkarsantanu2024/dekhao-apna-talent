import { NextResponse } from "next/server";
import { auth } from "@/lib/auth/auth";
import { supabaseAdmin } from "@/lib/supabase/admin";

const MAX = 5 * 1024 * 1024; // 5 MB
const ALLOWED_BUCKETS = new Set(["student-photos", "payment-screenshots", "event-assets"]);
const ALLOWED_MIMES = new Set([
  "image/png", "image/jpeg", "image/jpg", "image/webp", "application/pdf",
]);

export async function POST(req: Request) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const fd = await req.formData();
  const file = fd.get("file") as File | null;
  const bucket = (fd.get("bucket") as string) || "student-photos";
  if (!file) return NextResponse.json({ error: "Missing file" }, { status: 400 });
  if (!ALLOWED_BUCKETS.has(bucket)) return NextResponse.json({ error: "Invalid bucket" }, { status: 400 });
  if (file.size > MAX) return NextResponse.json({ error: "File too large (5MB max)" }, { status: 413 });
  if (!ALLOWED_MIMES.has(file.type)) return NextResponse.json({ error: "Unsupported file type" }, { status: 415 });

  const ext = file.name.split(".").pop()?.toLowerCase() ?? "bin";
  const path = `${session.user.role === "center_owner" ? session.user.centerId ?? "unknown" : "admin"}/${Date.now()}-${crypto.randomUUID()}.${ext}`;
  const buf = Buffer.from(await file.arrayBuffer());

  const sb = supabaseAdmin();
  const { error } = await sb.storage.from(bucket).upload(path, buf, { contentType: file.type, upsert: false });
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  const isPublic = bucket === "student-photos" || bucket === "event-assets";
  const url = isPublic
    ? sb.storage.from(bucket).getPublicUrl(path).data.publicUrl
    : (await sb.storage.from(bucket).createSignedUrl(path, 60 * 60 * 24 * 365)).data?.signedUrl;

  return NextResponse.json({ url, path, bucket });
}
