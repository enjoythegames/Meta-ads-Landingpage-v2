# Setup: GitHub + Vercel + Supabase

This version uses **Supabase as the permanent central source of truth for all landing-page settings**. The browser no longer stores website configuration in localStorage.

## 1. Install and test locally

```bash
npm install
npm run dev
```

Public site:

```text
http://localhost:5173/
```

Admin:

```text
http://localhost:5173/admin
```

## 2. Supabase database

Run `supabase/schema.sql` in **Supabase → SQL Editor**.

If your project already has the older schema installed, run:

```text
supabase/migrate-cloud-config.sql
```

The central runtime record is:

```text
public.site_settings
site_key = main
site_value = JSON configuration for the whole landing page
```

All editable landing-page settings are stored together in this single record, so the admin panel saves one consistent configuration and every device reads the same source.

## 3. Admin account

Create the admin user in **Supabase → Authentication → Users**.

Then authorize that Auth user:

```sql
insert into public.admin_users (user_id, role)
values ('YOUR_AUTH_USER_UUID', 'admin')
on conflict (user_id) do update set role = excluded.role;
```

Do not store an admin password in SQL or in the website configuration. Passwords are handled by Supabase Auth.

## 4. Supabase environment variables

Use only the browser-safe project URL and publishable/anon key:

```env
VITE_SUPABASE_URL=https://YOUR_PROJECT.supabase.co
VITE_SUPABASE_ANON_KEY=sb_publishable_YOUR_PUBLIC_KEY
```

Add the same variables in **Vercel → Project → Settings → Environment Variables** for Production, Preview, and Development.

Never put a service-role/secret key or the PostgreSQL password in frontend environment variables.

## 5. Image storage

The SQL creates a public Storage bucket named:

```text
site-media
```

Admin uploads go into:

```text
site-media/admin/<admin-user-id>/...
```

The database configuration stores only the permanent public Storage URL. The app rejects browser-only `blob:`, `data:`, `file:`, and Windows local-path image values when saving.

## 6. How synchronization works

### Admin

When Save is clicked:

1. Form values are validated.
2. Uploaded images are sent to Supabase Storage.
3. Permanent image URLs are placed in the configuration.
4. The complete configuration is upserted into `public.site_settings` with `site_key = main`.
5. A success message appears only after Supabase confirms the write.

### Public site

Every page load fetches the latest `site_settings` record with `cache: no-store`.

The public page also subscribes to Supabase Realtime for changes to `site_settings` and refreshes the displayed configuration automatically. A 15-second polling fallback is also included so the site still converges to the latest value if a WebSocket connection is unavailable.

## 7. RLS and security

The public site can **read** the settings record and public Storage objects.

Only an authenticated user listed in `public.admin_users` can:

- insert/update/delete `site_settings`
- upload/update/delete `site-media` objects

The frontend never uses a service-role key.

## 8. Vercel deployment

Push the project to GitHub, then import the repository into Vercel.

Use:

```text
Framework Preset: Vite
Build Command: npm run build
Output Directory: dist
Install Command: npm install
```

The repository includes `vercel.json` so the React SPA route `/admin` works when opened directly.

## 9. Acceptance test

1. Open `/admin` on Computer A.
2. Change the app/game name.
3. Change Telegram URL.
4. Upload a new logo.
5. Click **Save All Changes**.
6. Check `public.site_settings` in Supabase.
7. Open the public site in an incognito window.
8. Open it on a second device.
9. Both devices should show the same values.
10. Change the name again from the admin panel.
11. Refresh the second device; it must show the new value.
12. Leave the second device open and change it again; Realtime/polling should update the open page automatically.
