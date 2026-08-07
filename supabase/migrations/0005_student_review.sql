-- Student rejections previously recorded no reason, so neither the admin nor
-- the centre could tell why a registration was refused. Mirror the columns
-- payments already carry.
alter table public.students
  add column if not exists review_note text,
  add column if not exists reviewed_by uuid references public.users(id),
  add column if not exists reviewed_at timestamptz;
