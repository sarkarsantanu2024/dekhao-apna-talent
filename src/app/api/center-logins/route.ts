import { NextResponse } from "next/server";
import { auth } from "@/lib/auth/auth";
import { saveCenterLogins, type CenterLogin } from "@/lib/auth/center-login-store";

// Node runtime — writes to the local filesystem (demo stopgap).
export const runtime = "nodejs";

/**
 * Persist the admin-generated centre logins so the Node `authorize` can check
 * them at sign-in. Local-only; replace with Supabase later.
 */
export async function POST(req: Request) {
  const session = await auth();
  if (session?.user.role !== "admin") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }
  if (!Array.isArray(body)) {
    return NextResponse.json({ error: "Expected an array" }, { status: 400 });
  }

  const list: CenterLogin[] = body
    .filter((c): c is CenterLogin =>
      !!c && typeof c.login_id === "string" && typeof c.login_password === "string" &&
      typeof c.center_id === "string" && typeof c.center_name === "string")
    .map((c) => ({
      login_id: c.login_id,
      login_password: c.login_password,
      center_id: c.center_id,
      center_name: c.center_name,
    }));

  await saveCenterLogins(list);
  return NextResponse.json({ ok: true, count: list.length });
}
