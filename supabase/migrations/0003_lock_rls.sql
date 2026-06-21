-- Dekhao Apna Talent — lock down RLS for the real event (hardened mode).
-- Run this AFTER 0001 + 0002, once you're ready to enforce the secure data path.
--
-- After this, the anon key has NO direct database access. All reads/writes go
-- through the server (/api/data, /api/upload) using the service-role key, which
-- bypasses RLS. The server enforces the logged-in user's role + centre scope.
--
-- Pairs with: the app running in hardened mode (default in Supabase mode; i.e.
-- NEXT_PUBLIC_DATA_MODE is NOT "direct"). If you ever switch the app back to the
-- direct/permissive path, re-run 0002 to restore the anon policies.

-- ─── App tables: drop the demo "allow anon everything" policies ──────────────
-- RLS stays ENABLED, so with no policy the anon/authenticated roles are denied;
-- the service-role key (server only) bypasses RLS and keeps working.
do $$
declare t text;
begin
  foreach t in array array[
    'centers','students','payments','categories','activity_events','roll_counters','chest_cards'
  ] loop
    execute format('alter table public.%I enable row level security;', t);
    execute format('drop policy if exists demo_all on public.%I;', t);
  end loop;
end $$;

-- ─── users table: never read by the browser — service-role only ─────────────
alter table public.users enable row level security;
drop policy if exists demo_all on public.users;

-- ─── Storage: remove anon access; make payment screenshots private ──────────
-- Uploads now happen only via the service role (/api/upload). Student photos /
-- event assets stay public (used directly as <img> src). Payment screenshots
-- become private and are viewed via short-lived signed URLs.
drop policy if exists demo_storage_read  on storage.objects;
drop policy if exists demo_storage_write on storage.objects;

update storage.buckets set public = false where id = 'payment-screenshots';
update storage.buckets set public = true  where id in ('student-photos','event-assets');
