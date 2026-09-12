-- Supabase schema for the landing page + admin panel.
-- Run this entire file in Supabase SQL Editor.
-- This schema is designed for the existing React/Vite project and supports
-- database-backed content, admin membership, RLS, and site-media storage.

create extension if not exists pgcrypto;

-- ------------------------------------------------------------
-- Admin membership
-- ------------------------------------------------------------

create table if not exists public.admin_users (
  user_id uuid primary key references auth.users(id) on delete cascade,
  role text not null default 'admin' check (role in ('admin')),
  created_at timestamptz not null default now()
);

create or replace function public.is_admin(uid uuid default auth.uid())
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.admin_users
    where user_id = uid
  );
$$;

revoke all on function public.is_admin(uuid) from public;
grant execute on function public.is_admin(uuid) to authenticated, anon;

-- ------------------------------------------------------------
-- General/site content
-- ------------------------------------------------------------

create table if not exists public.site_settings (
  id uuid primary key default gen_random_uuid(),
  site_key text not null unique,
  site_value text,
  updated_at timestamptz not null default now()
);

create table if not exists public.app_info (
  id uuid primary key default gen_random_uuid(),
  app_name text not null default 'StreamVibe',
  developer_name text not null default '',
  category text not null default '',
  version text not null default '',
  app_size text not null default '',
  download_count text not null default '',
  age_rating text not null default '',
  rating numeric(3,2) not null default 0,
  total_reviews integer not null default 0,
  update_date text not null default '',
  android_compatibility text not null default '',
  short_description text not null default '',
  full_description text not null default '',
  logo_url text,
  banner_url text,
  apk_download_url text,
  updated_at timestamptz not null default now()
);

-- ------------------------------------------------------------
-- Links / buttons
-- ------------------------------------------------------------

create table if not exists public.social_links (
  id uuid primary key default gen_random_uuid(),
  platform text not null,
  url text not null,
  icon text,
  button_text text,
  enabled boolean not null default true,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.buttons (
  id uuid primary key default gen_random_uuid(),
  button_key text not null unique,
  label text not null,
  url text,
  icon text,
  open_in_new_tab boolean not null default false,
  enabled boolean not null default true,
  updated_at timestamptz not null default now()
);

-- ------------------------------------------------------------
-- Landing page sections
-- ------------------------------------------------------------

create table if not exists public.screenshots (
  id uuid primary key default gen_random_uuid(),
  image_url text not null,
  alt_text text,
  enabled boolean not null default true,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.features (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  icon text,
  enabled boolean not null default true,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.categories (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  enabled boolean not null default true,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.reviews (
  id uuid primary key default gen_random_uuid(),
  reviewer_name text not null,
  avatar_url text,
  rating integer not null check (rating between 1 and 5),
  review_date text,
  review_text text not null,
  published boolean not null default true,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.rating_distribution (
  id uuid primary key default gen_random_uuid(),
  star integer not null unique check (star between 1 and 5),
  percentage numeric(5,2) not null default 0,
  sort_order integer not null default 0,
  updated_at timestamptz not null default now()
);

create table if not exists public.data_safety (
  id uuid primary key default gen_random_uuid(),
  icon text,
  title text not null,
  description text not null,
  enabled boolean not null default true,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.similar_apps (
  id uuid primary key default gen_random_uuid(),
  app_name text not null,
  app_icon_url text,
  rating numeric(3,2) not null default 0,
  category text,
  destination_url text,
  enabled boolean not null default true,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ------------------------------------------------------------
-- SEO / visibility / appearance
-- ------------------------------------------------------------

create table if not exists public.seo_settings (
  id uuid primary key default gen_random_uuid(),
  page_title text,
  meta_description text,
  meta_keywords text,
  canonical_url text,
  og_title text,
  og_description text,
  og_image_url text,
  twitter_title text,
  twitter_description text,
  twitter_image_url text,
  favicon_url text,
  updated_at timestamptz not null default now()
);

create table if not exists public.section_settings (
  id uuid primary key default gen_random_uuid(),
  section_key text not null unique,
  title text,
  enabled boolean not null default true,
  sort_order integer not null default 0,
  updated_at timestamptz not null default now()
);

create table if not exists public.appearance_settings (
  id uuid primary key default gen_random_uuid(),
  primary_color text,
  button_color text,
  button_hover_color text,
  background text,
  card_style text,
  border_radius text,
  site_logo_url text,
  favicon_url text,
  updated_at timestamptz not null default now()
);

create table if not exists public.media_assets (
  id uuid primary key default gen_random_uuid(),
  bucket_name text not null default 'site-media',
  path text not null,
  public_url text,
  asset_type text not null,
  alt_text text,
  created_at timestamptz not null default now(),
  unique(bucket_name, path)
);

-- ------------------------------------------------------------
-- Updated-at trigger helper
-- ------------------------------------------------------------

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- Attach trigger to tables that have updated_at.

do $$
declare
  t text;
begin
  foreach t in array array[
    'site_settings',
    'app_info',
    'social_links',
    'buttons',
    'screenshots',
    'features',
    'categories',
    'reviews',
    'rating_distribution',
    'data_safety',
    'similar_apps',
    'seo_settings',
    'section_settings',
    'appearance_settings'
  ] loop
    execute format('drop trigger if exists set_updated_at on public.%I', t);
    execute format('create trigger set_updated_at before update on public.%I for each row execute function public.set_updated_at()', t);
  end loop;
end $$;

-- ------------------------------------------------------------
-- RLS
-- ------------------------------------------------------------

alter table public.admin_users enable row level security;
alter table public.site_settings enable row level security;
alter table public.app_info enable row level security;
alter table public.social_links enable row level security;
alter table public.buttons enable row level security;
alter table public.screenshots enable row level security;
alter table public.features enable row level security;
alter table public.categories enable row level security;
alter table public.reviews enable row level security;
alter table public.rating_distribution enable row level security;
alter table public.data_safety enable row level security;
alter table public.similar_apps enable row level security;
alter table public.seo_settings enable row level security;
alter table public.section_settings enable row level security;
alter table public.appearance_settings enable row level security;
alter table public.media_assets enable row level security;

-- Admin membership: users can read their own membership; admins can manage membership.
drop policy if exists "admin_users_self_read" on public.admin_users;
create policy "admin_users_self_read"
on public.admin_users for select
to authenticated
using (user_id = auth.uid());

drop policy if exists "admin_users_admin_manage" on public.admin_users;
create policy "admin_users_admin_manage"
on public.admin_users for all
to authenticated
using (public.is_admin())
with check (public.is_admin());

-- Helper block for public-read/admin-write tables.
do $$
declare
  t text;
begin
  foreach t in array array[
    'site_settings',
    'app_info',
    'social_links',
    'buttons',
    'screenshots',
    'features',
    'categories',
    'reviews',
    'rating_distribution',
    'data_safety',
    'similar_apps',
    'seo_settings',
    'section_settings',
    'appearance_settings',
    'media_assets'
  ] loop
    execute format('drop policy if exists "public_read_%1$s" on public.%1$I', t);
    execute format('create policy "public_read_%1$s" on public.%1$I for select to anon, authenticated using (true)', t);
    execute format('drop policy if exists "admin_write_%1$s" on public.%1$I', t);
    execute format('create policy "admin_write_%1$s" on public.%1$I for all to authenticated using (public.is_admin()) with check (public.is_admin())', t);
  end loop;
end $$;

-- ------------------------------------------------------------
-- Storage bucket + policies
-- ------------------------------------------------------------

insert into storage.buckets (id, name, public)
values ('site-media', 'site-media', true)
on conflict (id) do update set public = excluded.public;

drop policy if exists "site_media_public_read" on storage.objects;
create policy "site_media_public_read"
on storage.objects for select
to anon, authenticated
using (bucket_id = 'site-media');

drop policy if exists "site_media_admin_insert" on storage.objects;
create policy "site_media_admin_insert"
on storage.objects for insert
to authenticated
with check (bucket_id = 'site-media' and public.is_admin());

drop policy if exists "site_media_admin_update" on storage.objects;
create policy "site_media_admin_update"
on storage.objects for update
to authenticated
using (bucket_id = 'site-media' and public.is_admin())
with check (bucket_id = 'site-media' and public.is_admin());

drop policy if exists "site_media_admin_delete" on storage.objects;
create policy "site_media_admin_delete"
on storage.objects for delete
to authenticated
using (bucket_id = 'site-media' and public.is_admin());

-- ------------------------------------------------------------
-- Helpful indexes
-- ------------------------------------------------------------

create index if not exists screenshots_sort_order_idx on public.screenshots(sort_order);
create index if not exists features_sort_order_idx on public.features(sort_order);
create index if not exists categories_sort_order_idx on public.categories(sort_order);
create index if not exists reviews_sort_order_idx on public.reviews(sort_order);
create index if not exists data_safety_sort_order_idx on public.data_safety(sort_order);
create index if not exists similar_apps_sort_order_idx on public.similar_apps(sort_order);
create index if not exists section_settings_sort_order_idx on public.section_settings(sort_order);
create index if not exists social_links_sort_order_idx on public.social_links(sort_order);
