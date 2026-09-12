# Landing Page + Admin Panel

React + Vite landing page with an `/admin` management interface.

## Important

The current UI build still persists admin data with browser `localStorage`. For multi-device production use, connect the data/auth layer to Supabase using:

- `supabase/schema.sql`
- `supabase/seed.sql`
- `GUIDE.md`
- `SETUP.md`

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

Current local/static admin password: `admin123`.

**Change/remove this local password flow before public production use.** The production target is Supabase Authentication + the `admin_users` table + RLS.

## Production files

- `GUIDE.md` — architecture and project overview
- `SETUP.md` — GitHub, Vercel and Supabase setup steps
- `supabase/schema.sql` — database, RLS, and storage SQL
- `supabase/seed.sql` — optional initial rows
- `.env.example` — Vite/Supabase environment variables
