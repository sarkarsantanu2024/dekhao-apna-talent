-- Dekhao Apna Talent — public enquiry / "Send a message" submissions.
-- Captures every contact-form submission so admins can see all enquiry data.
--
-- Access model (matches 0003_lock_rls): RLS is ENABLED with NO anon policies,
-- so the browser anon key has no direct access. Writes come from the public
-- server route /api/enquiries and reads/updates from /api/data, both using the
-- service-role key (which bypasses RLS). The server validates the input.

create table if not exists public.enquiries (
  id          uuid primary key default gen_random_uuid(),
  name        text not null,
  phone       text,
  email       text not null,
  message     text not null,
  status      text not null default 'new'
              check (status in ('new','read','archived')),
  event_year  int  not null default extract(year from now()),
  created_at  timestamptz not null default now()
);

create index if not exists enquiries_status_idx  on public.enquiries(status);
create index if not exists enquiries_created_idx  on public.enquiries(created_at desc);

-- Lock down: RLS on, no policies → only the service role (server) can touch it.
alter table public.enquiries enable row level security;
