-- Run after 0001_init.sql. Creates the storage buckets used by the app.
insert into storage.buckets (id, name, public)
values
  ('student-photos',       'student-photos',       true),
  ('payment-screenshots',  'payment-screenshots',  false),
  ('chest-cards',          'chest-cards',          false),
  ('event-assets',         'event-assets',         true),
  ('certificates',         'certificates',         false)
on conflict (id) do nothing;
