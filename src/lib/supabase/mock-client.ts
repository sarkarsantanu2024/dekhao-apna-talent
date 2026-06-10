/**
 * In-memory mock of the Supabase JS client surface used by this app.
 * Lets the entire UI flow run with zero backend — for client demos.
 *
 * Activates when:
 *   process.env.DEMO_MODE === "true"   OR
 *   NEXT_PUBLIC_SUPABASE_URL is missing/placeholder.
 *
 * NOT a complete Supabase shim — only the methods this codebase actually calls
 * are implemented (.from().select/eq/in/or/order/range/limit/maybeSingle/single,
 * insert/update/delete/upsert; .rpc("next_roll_number"); .storage uploads).
 *
 * Data resets every time the Node process restarts.
 */

import bcrypt from "bcryptjs";

type Row = Record<string, unknown>;
type Filter = (row: Row) => boolean;

// ─── Seed data ─────────────────────────────────────────────────────────────
const CENTRE_ID = "11111111-1111-1111-1111-111111111111";
const ADMIN_HASH  = bcrypt.hashSync("Admin@123",  10);
const CENTRE_HASH = bcrypt.hashSync("Centre@123", 10);

const CAT = {
  dance:  { id: "c0000001-0000-0000-0000-000000000001", name: "Dance",                slug: "dance",        prefix: "DANCE", fee: 400, active: true, description: null },
  song:   { id: "c0000002-0000-0000-0000-000000000002", name: "Song",                 slug: "song",         prefix: "SONG",  fee: 400, active: true, description: null },
  math:   { id: "c0000003-0000-0000-0000-000000000003", name: "Mental Math Olympiad", slug: "mental-math",  prefix: "MATH",  fee: 250, active: true, description: null },
  other:  { id: "c0000004-0000-0000-0000-000000000004", name: "Other Talent",         slug: "other-talent", prefix: "OTHER", fee: 400, active: true, description: null },
};

const nowIso = () => new Date().toISOString();
const year   = () => new Date().getFullYear();

const db: Record<string, Row[]> = {
  users: [
    {
      id: "u0000001-0000-0000-0000-000000000001",
      name: "Platform Admin",
      email: "admin@dekhaoapnatalent.com",
      password_hash: ADMIN_HASH,
      role: "admin",
      center_id: null,
      phone: null,
      created_at: nowIso(),
      updated_at: nowIso(),
    },
    {
      id: "u0000002-0000-0000-0000-000000000002",
      name: "Centre Owner",
      email: "centre@dekhaoapnatalent.com",
      password_hash: CENTRE_HASH,
      role: "center_owner",
      center_id: CENTRE_ID,
      phone: "+91-9000000000",
      created_at: nowIso(),
      updated_at: nowIso(),
    },
  ],
  centers: [
    {
      id: CENTRE_ID,
      center_name: "Mind Mantra · Dumdum",
      owner_name: "Centre Owner",
      phone: "+91-9000000000",
      address: null,
      city: "Kolkata",
      state: "West Bengal",
      pincode: "700028",
      event_year: year(),
      created_at: nowIso(),
    },
  ],
  categories: [CAT.dance, CAT.song, CAT.math, CAT.other],
  students: [],
  payments: [],
  payment_students: [],
  chest_cards: [],
};

const counters: Record<string, number> = {};
const fileStore = new Map<string, string>(); // `${bucket}/${path}` -> data URL

// ─── Fluent builder ────────────────────────────────────────────────────────
type Action = "select" | "insert" | "update" | "delete" | "upsert";

class Builder<T = Row> implements PromiseLike<{ data: T | T[] | null; error: { message: string } | null; count?: number | null }> {
  private filters: Filter[] = [];
  private _order?: { col: string; asc: boolean };
  private _from?: number;
  private _to?: number;
  private _limit?: number;
  private _count?: "exact";
  private _head = false;
  private _action: Action = "select";
  private _payload: Row[] | Row | null = null;
  private _upsertOpts: { onConflict?: string } = {};

  constructor(private table: string) {}

  select(_cols = "*", opts: { count?: "exact"; head?: boolean } = {}) {
    if (opts.count) this._count = opts.count;
    if (opts.head) this._head = true;
    return this;
  }
  insert(payload: Row | Row[]) { this._action = "insert"; this._payload = Array.isArray(payload) ? payload : [payload]; return this; }
  update(payload: Row)         { this._action = "update"; this._payload = payload; return this; }
  delete()                     { this._action = "delete"; return this; }
  upsert(payload: Row | Row[], opts: { onConflict?: string } = {}) {
    this._action = "upsert"; this._payload = Array.isArray(payload) ? payload : [payload]; this._upsertOpts = opts; return this;
  }

  eq(col: string, val: unknown)     { this.filters.push((r) => r[col] === val); return this; }
  in(col: string, arr: unknown[])   { this.filters.push((r) => arr.includes(r[col])); return this; }
  or(expr: string) {
    // Supports comma-separated "col.ilike.%val%" clauses (OR'd together).
    const checks = expr.split(",").map((p) => p.trim()).filter(Boolean).map((p) => {
      const [col, op, ...rest] = p.split(".");
      const raw = rest.join(".").replace(/%/g, "").toLowerCase();
      return (r: Row) => {
        const v = String(r[col] ?? "").toLowerCase();
        return op === "ilike" ? v.includes(raw) : v === raw;
      };
    });
    this.filters.push((r) => checks.some((c) => c(r)));
    return this;
  }
  order(col: string, opts: { ascending?: boolean } = {}) { this._order = { col, asc: opts.ascending !== false }; return this; }
  range(from: number, to: number) { this._from = from; this._to = to; return this; }
  limit(n: number)                { this._limit = n; return this; }

  private rowsForTable(): Row[] {
    return (db[this.table] ??= []);
  }

  private exec(): { data: Row[] | Row | null; error: { message: string } | null; count: number | null } {
    const rows = this.rowsForTable();

    if (this._action === "insert") {
      const inserted: Row[] = [];
      for (const r of this._payload as Row[]) {
        const newRow: Row = { id: r.id ?? crypto.randomUUID(), created_at: r.created_at ?? nowIso(), updated_at: nowIso(), ...r };
        rows.push(newRow);
        inserted.push(newRow);
      }
      return { data: inserted.map((r) => ({ ...r })), error: null, count: inserted.length };
    }

    if (this._action === "upsert") {
      const out: Row[] = [];
      const key = this._upsertOpts.onConflict;
      for (const r of this._payload as Row[]) {
        if (key) {
          const idx = rows.findIndex((x) => x[key] === r[key]);
          if (idx >= 0) {
            Object.assign(rows[idx], r, { updated_at: nowIso() });
            out.push(rows[idx]);
            continue;
          }
        }
        const newRow: Row = { id: r.id ?? crypto.randomUUID(), created_at: r.created_at ?? nowIso(), updated_at: nowIso(), ...r };
        rows.push(newRow);
        out.push(newRow);
      }
      return { data: out.map((r) => ({ ...r })), error: null, count: out.length };
    }

    if (this._action === "update") {
      const matched = rows.filter((r) => this.filters.every((f) => f(r)));
      for (const r of matched) Object.assign(r, this._payload, { updated_at: nowIso() });
      return { data: matched.map((r) => ({ ...r })), error: null, count: matched.length };
    }

    if (this._action === "delete") {
      const keep: Row[] = [];
      const removed: Row[] = [];
      for (const r of rows) (this.filters.every((f) => f(r)) ? removed : keep).push(r);
      db[this.table] = keep;
      return { data: removed.map((r) => ({ ...r })), error: null, count: removed.length };
    }

    // select
    let res = rows.filter((r) => this.filters.every((f) => f(r)));
    const total = res.length;
    if (this._order) {
      const { col, asc } = this._order;
      res = [...res].sort((a, b) => {
        const av = a[col] as string | number | null;
        const bv = b[col] as string | number | null;
        if (av === bv) return 0;
        if (av == null) return 1;
        if (bv == null) return -1;
        return asc ? (av < bv ? -1 : 1) : (av < bv ? 1 : -1);
      });
    }
    if (this._from != null && this._to != null) res = res.slice(this._from, this._to + 1);
    if (this._limit != null) res = res.slice(0, this._limit);

    if (this._head) return { data: null, error: null, count: total };
    return { data: res.map((r) => ({ ...r })), error: null, count: total };
  }

  // thenable: `await builder` resolves to a Supabase-shaped result
  then<TResult1 = unknown, TResult2 = never>(
    onfulfilled?: ((value: { data: T | T[] | null; error: { message: string } | null; count?: number | null }) => TResult1 | PromiseLike<TResult1>) | null,
    onrejected?: ((reason: unknown) => TResult2 | PromiseLike<TResult2>) | null,
  ): PromiseLike<TResult1 | TResult2> {
    try {
      const r = this.exec();
      const shaped = { data: r.data as T | T[] | null, error: r.error, count: r.count };
      return Promise.resolve(shaped).then(onfulfilled ?? undefined, onrejected ?? undefined);
    } catch (e) {
      return Promise.resolve({ data: null, error: { message: (e as Error).message }, count: 0 } as never).then(onfulfilled ?? undefined, onrejected ?? undefined);
    }
  }

  async maybeSingle() {
    const r = this.exec();
    const arr = (r.data ?? []) as Row[];
    return { data: arr[0] ?? null, error: r.error };
  }
  async single() {
    const r = this.exec();
    const arr = (r.data ?? []) as Row[];
    if (!arr.length) return { data: null, error: { message: "Not found" } };
    return { data: arr[0], error: null };
  }
}

// ─── Storage shim ──────────────────────────────────────────────────────────
const storage = {
  from: (bucket: string) => ({
    async upload(path: string, buf: Buffer | ArrayBuffer | Uint8Array, opts: { contentType?: string; upsert?: boolean } = {}) {
      const ct = opts.contentType ?? "application/octet-stream";
      const u8 = buf instanceof Uint8Array ? buf : new Uint8Array(buf as ArrayBuffer);
      // Avoid blowing up memory: cap demo uploads at ~2MB raw -> we still store as data URL.
      const base64 = Buffer.from(u8).toString("base64");
      fileStore.set(`${bucket}/${path}`, `data:${ct};base64,${base64}`);
      return { data: { path }, error: null };
    },
    getPublicUrl(path: string) {
      return { data: { publicUrl: fileStore.get(`${bucket}/${path}`) ?? "" } };
    },
    async createSignedUrl(path: string, _ttl: number) {
      return { data: { signedUrl: fileStore.get(`${bucket}/${path}`) ?? "" }, error: null };
    },
  }),
};

// ─── RPC shim ──────────────────────────────────────────────────────────────
async function rpc(fn: string, args: Record<string, unknown>) {
  if (fn === "next_roll_number") {
    const prefix = String(args.p_prefix);
    const yr = Number(args.p_year);
    const key = `${prefix}-${yr}`;
    counters[key] = (counters[key] ?? 0) + 1;
    return { data: `MM-${prefix}-${yr}-${String(counters[key]).padStart(4, "0")}`, error: null };
  }
  return { data: null, error: { message: `Unknown RPC ${fn}` } };
}

export const mockClient = {
  from: (table: string) => new Builder(table),
  storage,
  rpc,
};

export function isDemoMode() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
  return (
    process.env.DEMO_MODE === "true" ||
    !url ||
    url.includes("example.supabase.co") ||
    url.includes("your-project")
  );
}
