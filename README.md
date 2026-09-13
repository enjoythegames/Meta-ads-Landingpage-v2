# Landing Page + Admin Panel

React + Vite landing page with an `/admin` management interface.

## Central Supabase configuration

The public landing page and admin panel now use Supabase as the permanent source of truth for website settings.

- `public.site_settings` stores one JSON configuration record (`site_key = main`).
- Public page loads the latest configuration at runtime with cache-busting.
- Admin saves update Supabase only after the database write succeeds.
- Supabase Storage stores uploaded logo/banner/screenshot/similar-app images.
- Supabase Realtime updates already-open visitors; a 15-second polling fallback handles WebSocket interruptions.
- Browser `localStorage` is **not** used for website settings.

## Quick start

```bash
npm install
npm run dev
```

Public page:

```text
/
```

Admin page:

```text
/admin
```

## Supabase setup

Run:

```text
supabase/schema.sql
```

If upgrading an existing database, run:

```text
supabase/migrate-cloud-config.sql
```

Create an Email/Password admin user in Supabase Authentication and authorize its UUID in `public.admin_users`.

## Vercel environment variables

```env
VITE_SUPABASE_URL=https://YOUR_PROJECT.supabase.co
VITE_SUPABASE_ANON_KEY=sb_publishable_YOUR_PUBLIC_KEY
```

Never put a Supabase service-role/secret key or database password in the frontend.

## Deployment

Vercel settings:

```text
Framework: Vite
Build Command: npm run build
Output Directory: dist
Install Command: npm install
```

`vercel.json` is included so `/admin` works as a client-side route.
