-- Add the KBB category (fee ₹250). Already applied to the live project via
-- the REST API on 19 Aug 2026; kept here so fresh databases match.
insert into public.categories (name, slug, prefix, fee, description)
select 'KBB', 'kbb', 'KBB', 250,
  'Kaun Banega Brainist — the on-screen quiz challenge. Brain-teasing questions appear on screen and students answer live. Are you a genius?'
where not exists (select 1 from public.categories where slug = 'kbb');
