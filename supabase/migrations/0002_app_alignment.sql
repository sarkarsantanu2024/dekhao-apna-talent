-- Dekhao Apna Talent — align the initial schema with the running app.
-- Idempotent: safe to run multiple times. Run AFTER 0001_init.sql.
--
--   • centers   → add whatsapp / start_date / participating (app fields)
--   • payments  → add student_id / student_name (app links a payment to one student)
--   • new table → activity_events (the in-app notification feed)
--   • RLS       → permissive policies so the anon client can read/write
--                 ⚠️ DEMO-GRADE. Lock these down with Supabase Auth before real use.
--   • storage   → public buckets for screenshots / photos

-- ─── centers: app-only columns ──────────────────────────────────────────────
alter table public.centers add column if not exists whatsapp      text;
alter table public.centers add column if not exists start_date    date;
alter table public.centers add column if not exists participating boolean not null default false;

-- ─── payments: link directly to one student ─────────────────────────────────
alter table public.payments add column if not exists student_id   uuid references public.students(id) on delete set null;
alter table public.payments add column if not exists student_name text;
create index if not exists payments_student_idx on public.payments(student_id);

-- ─── activity feed (admin + centre notifications) ───────────────────────────
create table if not exists public.activity_events (
  id          uuid primary key default gen_random_uuid(),
  type        text not null,
  audience    text not null check (audience in ('admin','center')),
  message     text not null,
  center_id   uuid references public.centers(id) on delete set null,
  center_name text,
  created_at  timestamptz not null default now()
);
create index if not exists activity_events_created_idx on public.activity_events(created_at desc);

-- ─── RLS — permissive (DEMO ONLY) ───────────────────────────────────────────
-- The browser uses the anon key and NextAuth (not Supabase Auth), so RLS can't
-- see the user. For the demo we allow anon full access. Replace with real
-- per-role policies (or route writes through the service role) for production.
do $$
declare t text;
begin
  foreach t in array array[
    'centers','students','payments','categories','activity_events','roll_counters','chest_cards'
  ] loop
    execute format('alter table public.%I enable row level security;', t);
    execute format('drop policy if exists demo_all on public.%I;', t);
    execute format(
      'create policy demo_all on public.%I for all to anon, authenticated using (true) with check (true);', t);
  end loop;
end $$;

-- ─── storage buckets (public read; uploads go through the service role) ──────
insert into storage.buckets (id, name, public) values
  ('payment-screenshots','payment-screenshots', true),
  ('student-photos','student-photos', true),
  ('event-assets','event-assets', true)
on conflict (id) do update set public = excluded.public;

-- Allow anon/authenticated to read + upload to those buckets (demo-grade).
drop policy if exists demo_storage_read on storage.objects;
create policy demo_storage_read on storage.objects for select to anon, authenticated
  using (bucket_id in ('payment-screenshots','student-photos','event-assets'));

drop policy if exists demo_storage_write on storage.objects;
create policy demo_storage_write on storage.objects for insert to anon, authenticated
  with check (bucket_id in ('payment-screenshots','student-photos','event-assets'));
