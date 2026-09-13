-- Optional legacy/auxiliary rows.
-- The current frontend stores the full runtime configuration in public.site_settings
-- with site_key = main. Use the admin panel Save button to initialize/update it.
-- Run after schema.sql if you want the auxiliary normalized tables pre-created with starter rows.

insert into public.rating_distribution (star, percentage, sort_order)
values
  (5, 0, 1),
  (4, 0, 2),
  (3, 0, 3),
  (2, 0, 4),
  (1, 0, 5)
on conflict (star) do nothing;

insert into public.section_settings (section_key, title, enabled, sort_order)
values
  ('banner', 'Banner', true, 10),
  ('app_info', 'App Information', true, 20),
  ('categories', 'Categories / Tags', true, 30),
  ('screenshots', 'Screenshots', true, 40),
  ('description', 'Description', true, 50),
  ('features', 'Features', true, 60),
  ('reviews', 'Reviews', true, 70),
  ('rating_distribution', 'Rating Distribution', true, 80),
  ('data_safety', 'Data Safety', true, 90),
  ('similar_apps', 'Similar Apps', true, 100),
  ('social_cta', 'Social CTA', true, 110),
  ('sticky_download', 'Sticky Download Bar', true, 120)
on conflict (section_key) do nothing;
