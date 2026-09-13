-- Run this after the base schema if you are upgrading an existing deployment.
-- It makes site_settings the central runtime source of truth and enables
-- public reads, admin writes, Storage uploads, and Realtime updates.

create table if not exists public.site_settings (
  id uuid primary key default gen_random_uuid(),
  site_key text not null unique,
  site_value text,
  updated_at timestamptz not null default now()
);

create or replace function public.is_admin(uid uuid default auth.uid())
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (select 1 from public.admin_users where user_id = uid);
$$;

grant execute on function public.is_admin(uuid) to authenticated, anon;

alter table public.site_settings enable row level security;

drop policy if exists "site_settings_public_read" on public.site_settings;
create policy "site_settings_public_read"
on public.site_settings for select
to anon, authenticated
using (true);

drop policy if exists "site_settings_admin_write" on public.site_settings;
create policy "site_settings_admin_write"
on public.site_settings for all
to authenticated
using (public.is_admin())
with check (public.is_admin());

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

do $$
begin
  execute 'alter publication supabase_realtime add table public.site_settings';
exception
  when duplicate_object then null;
  when undefined_object then null;
end $$;
