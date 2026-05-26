# Dekhao Apna Talent — Event Management Platform

Production-ready scaffold for the Talent Competition & Olympiad Event Platform
presented by Mind Mantra Abacus. Built with **Next.js 15 (App Router)**, **TypeScript**,
**Tailwind v4 + ShadCN UI**, **Supabase PostgreSQL/Storage**, and **NextAuth v5 (Auth.js)**.

## Quick start

```bash
cp .env.example .env.local
# Fill SUPABASE_* + AUTH_SECRET (openssl rand -base64 32)

# 1. Create database schema
#    Open Supabase SQL editor -> paste supabase/migrations/0001_init.sql, run.
#    Then paste supabase/storage.sql, run.

# 2. Create the first admin user
#    Hash a password: node -e "console.log(require('bcryptjs').hashSync('Admin@123',10))"
#    Paste it into supabase/seed.sql and run that too.

npm install
npm run dev
```

The app runs at <http://localhost:3000>.

## What's included

| Area              | Notes                                                                       |
| ----------------- | --------------------------------------------------------------------------- |
| Public site       | Home, About, Categories, Rules, Prizes, Contact + SEO (robots/sitemap/OG)   |
| Auth              | NextAuth v5 Credentials provider against `public.users` (bcrypt)            |
| Centre dashboard  | Add/manage students, upload payment screenshots, download chest cards       |
| Admin dashboard   | Students, centres, payments, approvals, categories, reports                 |
| Roll numbers      | Atomic via `next_roll_number()` SQL function — `MM-CAT-YEAR-####`           |
| Chest cards       | Server-side `@react-pdf/renderer` + QR via `qrcode`                         |
| Storage           | Supabase buckets: student-photos, payment-screenshots, chest-cards, ...     |
| Validation        | Zod schemas on every API route + React Hook Form on every input form        |
| Auth middleware   | Role-gated `/admin/**` and `/center/**` in `src/middleware.ts`              |

## Payment flow (no online gateway)

1. Centre owner adds students -> status `pending`.
2. Centre owner uploads a payment screenshot (`POST /api/upload` then `POST /api/payments`).
3. Admin reviews on `/admin/approvals`, approves or rejects.
4. On approval, linked students transition to `active` and chest-card download unlocks at `/api/chest-card/[studentId]`.

## Folder layout

See `src/` — feature-grouped (`components/forms`, `components/admin`, `lib/auth`, `lib/pdf`, `lib/validations`, `lib/supabase`).

## Scripts

```bash
npm run dev      # local dev server
npm run build    # production build
npm run start    # production server
npm run lint     # ESLint
```

## Production checklist

- [ ] Replace placeholder admin bcrypt hash in `supabase/seed.sql`
- [ ] Configure RLS policies in Supabase (server uses service role; RLS still protects direct PostgREST access)
- [ ] Set `AUTH_URL` and `NEXT_PUBLIC_SITE_URL` to your production domain
- [ ] Verify Supabase storage bucket privacy matches `supabase/storage.sql`
- [ ] Add favicon / OG image under `public/`
- [ ] Run Lighthouse + mobile audit before launch
