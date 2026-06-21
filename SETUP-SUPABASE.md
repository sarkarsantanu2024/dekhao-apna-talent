# Going live on Supabase + Vercel

This app ships in **demo mode** (data in the browser's localStorage, an in-memory
server mock, and file-based centre logins). That's great for local demos but it
does **not** persist on Vercel. Follow this once to switch to a real Supabase
backend that works on Vercel.

The code auto-switches: when `NEXT_PUBLIC_SUPABASE_URL` is a real value (and
`DEMO_MODE` is not `true`), the app uses Supabase; otherwise it stays in demo
mode. You can force it with `NEXT_PUBLIC_STORE_MODE=local|supabase`.

---

## 1. Create a Supabase project

1. Go to <https://supabase.com> → **New project**. Pick a name, a strong DB
   password, and a region close to your users (e.g. Mumbai/Singapore for India).
2. Wait for it to provision (~2 min).

## 2. Run the database schema

In the Supabase dashboard → **SQL Editor** → **New query**, run these two files
from this repo **in order**:

1. `supabase/migrations/0001_init.sql`  — base tables, categories, roll-number function
2. `supabase/migrations/0002_app_alignment.sql` — app columns, activity feed,
   demo RLS policies, and the storage buckets

> Re-running them is safe (everything is `if not exists` / idempotent).

This also creates three **Storage buckets** automatically:
`payment-screenshots`, `student-photos`, `event-assets`. Confirm under
**Storage** that they exist and are **public**.

## 3. Grab your keys

Supabase dashboard → **Project Settings → API**:

| Key | Env var |
| --- | --- |
| Project URL | `NEXT_PUBLIC_SUPABASE_URL` |
| `anon` `public` key | `NEXT_PUBLIC_SUPABASE_ANON_KEY` |
| `service_role` key (secret!) | `SUPABASE_SERVICE_ROLE_KEY` |

## 4. Configure environment variables

Copy `.env.example` → `.env.local` and set:

```bash
DEMO_MODE=false
NEXT_PUBLIC_SUPABASE_URL=https://<your-project>.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=<anon key>
SUPABASE_SERVICE_ROLE_KEY=<service role key>

# Required in production so the login cookie is signed:
AUTH_SECRET=<run: openssl rand -base64 32>

# Admin passwords (REQUIRED in production — no weak default exists):
ADMIN_PASSWORD_PINTU=<strong password for pintu.gupta>
ADMIN_PASSWORD_SANTANU=<strong password for santanu.sarkar>
```

Run locally to verify: `npm run dev`. The admin login still works
(`pintu.gupta` / `santanu.sarkar`, password `12345`). Upload a centre CSV — the
centres and their demo students should now persist in Supabase (check the
**Table editor**).

## 5. Deploy to Vercel

1. Push the repo to GitHub and **Import** it in Vercel.
2. In **Project → Settings → Environment Variables**, add the same vars from
   step 4 (`DEMO_MODE=false`, the three Supabase keys, and `AUTH_SECRET`).
   Also set `AUTH_URL` / `NEXT_PUBLIC_SITE_URL` to your Vercel URL.
3. Deploy.

---

## How auth works now (no more file dependency)

- **Admins**: two fixed logins in `src/lib/auth/users.ts`.
- **Centre owners**: credentials are **derived deterministically** from each
  centre row (User ID = slug of centre name, Password = owner-name-without-title
  + phone) — see `src/lib/auth/center-credentials.ts`. At sign-in the server
  reads the centres from Supabase and matches. **No `.data` file**, so it works
  on Vercel's read-only/serverless filesystem.
- The admin **Credentials** page shows every centre's login to copy / send on
  WhatsApp / download.

## Data security — hardened by default

The app ships a **hardened data path**: the browser never touches Supabase
directly. Every read/write goes through the server route `/api/data`, which
checks the NextAuth session, enforces role (admins vs centre owners), confines
each centre owner to **their own centre's data**, then runs the query with the
service-role key. File uploads/deletes go through `/api/upload` the same way.

This is the default whenever Supabase is configured. To make it airtight, run
the RLS lockdown so the anon key has **no** direct database access — in the SQL
editor, run **`supabase/migrations/0003_lock_rls.sql`**.

After that, all access is server-enforced and per-role. Payment screenshots
become private (viewed via short-lived signed URLs); student photos stay public
(they're printed on chest cards).

### Fallback (permissive) if needed during the demo
If the hardened path ever blocks something mid-demo, set
`NEXT_PUBLIC_DATA_MODE=direct` to switch back to the browser-direct path. That
path needs the permissive policies from `0002_app_alignment.sql` (so don't run
`0003` if you intend to stay on `direct`, or re-run `0002` to restore them).

### Still worth tightening before scale
- Centre passwords are derived from owner name + phone (guessable). Fine when the
  admin distributes them privately; add a random component for stronger security.
- For very high security, migrate auth to **Supabase Auth** so policies key off
  `auth.uid()` directly instead of the server enforcing scope.

## Switching back to demo mode

Set `DEMO_MODE=true` (or remove the Supabase URL), or set
`NEXT_PUBLIC_STORE_MODE=local`. The app falls back to the in-browser store.
