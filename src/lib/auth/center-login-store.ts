/**
 * LOCAL-ONLY centre login store (demo stopgap).
 *
 * Generated centre credentials live in the browser's localStorage, which the
 * server can't read at sign-in. So when the admin generates logins we also POST
 * them here, persisting to a small JSON file the Node-runtime `authorize` can
 * check. This works on a local machine only — it is NOT durable on serverless
 * hosts (Vercel). Replace with Supabase auth for production.
 *
 * Node-only (uses fs) — never import this from edge code (middleware).
 */

import { promises as fs } from "node:fs";
import path from "node:path";

export type CenterLogin = {
  login_id: string;
  login_password: string;
  center_id: string;
  center_name: string;
};

const FILE = path.join(process.cwd(), ".data", "center-logins.json");

async function readAll(): Promise<CenterLogin[]> {
  try {
    const raw = await fs.readFile(FILE, "utf8");
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? (parsed as CenterLogin[]) : [];
  } catch {
    return [];
  }
}

export async function saveCenterLogins(list: CenterLogin[]): Promise<void> {
  await fs.mkdir(path.dirname(FILE), { recursive: true });
  await fs.writeFile(FILE, JSON.stringify(list, null, 2), "utf8");
}

export async function findCenterLogin(
  userId: string,
  password: string,
): Promise<CenterLogin | null> {
  const all = await readAll();
  const id = userId.trim().toLowerCase();
  return all.find((c) => c.login_id.toLowerCase() === id && c.login_password === password) ?? null;
}
