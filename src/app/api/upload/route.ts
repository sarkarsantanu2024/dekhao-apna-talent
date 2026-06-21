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

/** Pull `{ bucket, path }` out of a Supabase Storage public/signed URL. */
function parseStorageUrl(u: string): { bucket: string; path: string } | null {
  const m = /\/storage\/v1\/object\/(?:public|sign)\/([^/]+)\/(.+?)(?:\?|$)/.exec(u);
  if (!m) return null;
  return { bucket: m[1], path: decodeURIComponent(m[2]) };
}

/**
 * Delete one or more previously-uploaded files from Storage. Accepts the URLs
 * the app stored on the row, so callers don't need to track bucket/path.
 */
export async function DELETE(req: Request) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  let body: { urls?: string | string[] };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }
  const list = Array.isArray(body.urls) ? body.urls : body.urls ? [body.urls] : [];

  // Group paths by bucket so each bucket is cleared in a single call.
  const byBucket = new Map<string, string[]>();
  for (const u of list) {
    if (typeof u !== "string") continue;
    const parsed = parseStorageUrl(u);
    if (parsed && ALLOWED_BUCKETS.has(parsed.bucket)) {
      const arr = byBucket.get(parsed.bucket) ?? [];
      arr.push(parsed.path);
      byBucket.set(parsed.bucket, arr);
    }
  }

  const sb = supabaseAdmin();
  let removed = 0;
  const errors: string[] = [];
  for (const [bucket, paths] of byBucket) {
    const { error } = await sb.storage.from(bucket).remove(paths);
    if (error) errors.push(error.message);
    else removed += paths.length;
  }
  return NextResponse.json({ ok: errors.length === 0, removed, errors });
}
