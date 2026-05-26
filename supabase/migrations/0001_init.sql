-- Dekhao Apna Talent — initial schema
-- Run in Supabase SQL editor (or via supabase db push).

create extension if not exists "pgcrypto";

-- ─── USERS ─────────────────────────────────────────────────────────────────
create table if not exists public.users (
  id            uuid primary key default gen_random_uuid(),
  name          text not null,
  email         text not null unique,
  password_hash text not null,
  role          text not null check (role in ('admin','center_owner')),
  center_id     uuid,
  phone         text,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);
create index if not exists users_role_idx on public.users(role);

-- ─── CENTERS ───────────────────────────────────────────────────────────────
create table if not exists public.centers (
  id          uuid primary key default gen_random_uuid(),
  center_name text not null,
  owner_name  text,
  phone       text,
  address     text,
  city        text,
  state       text,
  pincode     text,
  event_year  int  not null default extract(year from now()),
  created_at  timestamptz not null default now()
);
create index if not exists centers_year_idx on public.centers(event_year);
create index if not exists centers_name_idx on public.centers(center_name);

alter table public.users
  drop constraint if exists users_center_fk;
alter table public.users
  add constraint users_center_fk foreign key (center_id) references public.centers(id) on delete set null;

-- ─── CATEGORIES ────────────────────────────────────────────────────────────
create table if not exists public.categories (
  id          uuid primary key default gen_random_uuid(),
  name        text not null unique,
  slug        text not null unique,
  prefix      text not null,          -- e.g. DANCE, SONG, MATH, OTHER
  description text,
  fee         numeric(10,2) not null default 0,
  active      boolean not null default true,
  created_at  timestamptz not null default now()
);

insert into public.categories (name, slug, prefix, fee) values
  ('Dance','dance','DANCE',400),
  ('Song','song','SONG',400),
  ('Mental Math Olympiad','mental-math','MATH',250),
  ('Other Talent','other-talent','OTHER',400)
on conflict (slug) do nothing;

-- ─── STUDENTS ──────────────────────────────────────────────────────────────
create table if not exists public.students (
  id              uuid primary key default gen_random_uuid(),
  center_id       uuid references public.centers(id) on delete set null,
  center_name     text not null,
  full_name       text not null,
  guardian_name   text not null,
  dob             date not null,
  age             int  not null,
  class           text,
  school_name     text,
  category_id     uuid references public.categories(id),
  category_name   text not null,
  phone           text,
  whatsapp        text,
  address         text,
  city            text,
  state           text,
  pincode         text,
  photo_url       text,
  roll_number     text unique,
  status          text not null default 'pending'
                  check (status in ('pending','approved','rejected','active')),
  event_year      int  not null default extract(year from now()),
  performance_topic text,
  performance_details text,
  created_by      uuid references public.users(id),
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);
create index if not exists students_center_idx   on public.students(center_id);
create index if not exists students_category_idx on public.students(category_id);
create index if not exists students_year_idx     on public.students(event_year);
create index if not exists students_status_idx   on public.students(status);
create index if not exists students_roll_idx     on public.students(roll_number);

-- ─── PAYMENTS ──────────────────────────────────────────────────────────────
create table if not exists public.payments (
  id              uuid primary key default gen_random_uuid(),
  center_id       uuid references public.centers(id) on delete set null,
  center_name     text not null,
  uploaded_by     uuid references public.users(id),
  amount          numeric(10,2) not null,
  transaction_ref text,
  screenshot_url  text not null,
  status          text not null default 'pending'
                  check (status in ('pending','approved','rejected')),
  reviewed_by     uuid references public.users(id),
  reviewed_at     timestamptz,
  review_note     text,
  event_year      int not null default extract(year from now()),
  created_at      timestamptz not null default now()
);
create index if not exists payments_center_idx on public.payments(center_id);
create index if not exists payments_status_idx on public.payments(status);
create index if not exists payments_year_idx   on public.payments(event_year);

-- ─── PAYMENT ↔ STUDENT LINK ────────────────────────────────────────────────
create table if not exists public.payment_students (
  payment_id uuid not null references public.payments(id) on delete cascade,
  student_id uuid not null references public.students(id) on delete cascade,
  primary key (payment_id, student_id)
);

-- ─── ROLL NUMBER COUNTERS (atomic auto-increment per prefix/year) ──────────
create table if not exists public.roll_counters (
  prefix     text not null,
  event_year int  not null,
  last_value int  not null default 0,
  primary key (prefix, event_year)
);

create or replace function public.next_roll_number(p_prefix text, p_year int)
returns text
language plpgsql
as $$
declare
  v_next int;
begin
  insert into public.roll_counters(prefix, event_year, last_value)
    values (p_prefix, p_year, 1)
  on conflict (prefix, event_year)
    do update set last_value = roll_counters.last_value + 1
  returning last_value into v_next;

  return format('MM-%s-%s-%s', p_prefix, p_year, lpad(v_next::text, 4, '0'));
end $$;

-- ─── CHEST CARDS ───────────────────────────────────────────────────────────
create table if not exists public.chest_cards (
  id           uuid primary key default gen_random_uuid(),
  student_id   uuid not null unique references public.students(id) on delete cascade,
  pdf_url      text,
  qr_payload   text not null,
  active       boolean not null default false,
  generated_at timestamptz,
  created_at   timestamptz not null default now()
);

-- ─── EVENTS ────────────────────────────────────────────────────────────────
create table if not exists public.events (
  id          uuid primary key default gen_random_uuid(),
  name        text not null,
  event_year  int  not null,
  start_date  date,
  end_date    date,
  description text,
  active      boolean not null default true
);

-- ─── RESULTS ───────────────────────────────────────────────────────────────
create table if not exists public.results (
  id         uuid primary key default gen_random_uuid(),
  student_id uuid not null references public.students(id) on delete cascade,
  round      text not null,         -- centre / district / final
  position   int,
  score      numeric(10,2),
  remarks    text,
  created_at timestamptz not null default now()
);

-- ─── NOTIFICATIONS ─────────────────────────────────────────────────────────
create table if not exists public.notifications (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid references public.users(id) on delete cascade,
  title      text not null,
  body       text,
  read       boolean not null default false,
  created_at timestamptz not null default now()
);

-- ─── AUDIT LOGS ────────────────────────────────────────────────────────────
create table if not exists public.audit_logs (
  id         uuid primary key default gen_random_uuid(),
  actor_id   uuid references public.users(id),
  action     text not null,
  entity     text not null,
  entity_id  uuid,
  meta       jsonb,
  created_at timestamptz not null default now()
);

-- ─── updated_at triggers ───────────────────────────────────────────────────
create or replace function public.touch_updated_at()
returns trigger language plpgsql as $$
begin new.updated_at := now(); return new; end $$;

drop trigger if exists trg_users_updated on public.users;
create trigger trg_users_updated before update on public.users
  for each row execute function public.touch_updated_at();

drop trigger if exists trg_students_updated on public.students;
create trigger trg_students_updated before update on public.students
  for each row execute function public.touch_updated_at();
