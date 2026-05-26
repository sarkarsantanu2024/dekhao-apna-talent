-- Demo accounts for client showcase.
-- Run AFTER 0001_init.sql and storage.sql.
--
--   Admin     →  admin@dekhaoapnatalent.com   /  Admin@123
--   Centre    →  centre@dekhaoapnatalent.com  /  Centre@123
--
-- The bcrypt hashes below are real (cost=10). Change the passwords before
-- going to production.

-- 1) A demo centre that the centre-owner account belongs to.
insert into public.centers (id, center_name, owner_name, phone, city, state, pincode, event_year)
values (
  '11111111-1111-1111-1111-111111111111',
  'Demo Centre — Dumdum',
  'Demo Owner',
  '+91-9000000000',
  'Kolkata',
  'West Bengal',
  '700028',
  extract(year from now())
)
on conflict (id) do nothing;

-- 2) Platform admin  →  admin@dekhaoapnatalent.com / Admin@123
insert into public.users (name, email, password_hash, role)
values (
  'Platform Admin',
  'admin@dekhaoapnatalent.com',
  '$2b$10$X2XMjW.1ey76LSxtkzyuT.RKJnXZnwI7gCk93gPidCGZq6gRG.XIm',
  'admin'
)
on conflict (email) do nothing;

-- 3) Centre owner   →  centre@dekhaoapnatalent.com / Centre@123
insert into public.users (name, email, password_hash, role, center_id, phone)
values (
  'Demo Centre Owner',
  'centre@dekhaoapnatalent.com',
  '$2b$10$NiZyP7YdRkycMYAcltf87O8/gP4R0t8KbLBMkLk0.ay8q5kq1bH7q',
  'center_owner',
  '11111111-1111-1111-1111-111111111111',
  '+91-9000000000'
)
on conflict (email) do nothing;
