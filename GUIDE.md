# Landing Page + Admin Panel Guide

This project contains the app-store-inspired landing page and a browser-based `/admin` panel.

## Important current status

The current admin implementation stores its configuration in the browser with `localStorage`. That means it is useful for local/static use, but changes are **not shared between different devices or browsers**.

For production use with GitHub + Vercel + Supabase, the frontend must be connected to Supabase for:

- Admin authentication
- Database-backed site configuration
- Image storage
- Multi-device persistence
- Secure admin writes with Row Level Security (RLS)

This ZIP includes the Supabase SQL needed for that backend and detailed setup instructions.

## Project structure

```text
work/
├─ public/images/        # Existing landing-page images
├─ src/                  # React/Vite application
├─ supabase/
│  ├─ schema.sql         # Database + RLS + storage setup
│  └─ seed.sql           # Optional initial rows/template
├─ GUIDE.md              # Overview and deployment guide
├─ SETUP.md              # Step-by-step Supabase/GitHub/Vercel setup
└─ .env.example          # Environment variable template
```

## Admin URL

Public site:

```text
/
```

Admin panel:

```text
/admin
```

Current local/static admin first-login password:

```text
admin123
```

**Do not use that password for a public production deployment.** Once Supabase Authentication is integrated, use a real Supabase email/password account and remove the browser-password authentication logic.

## Supabase database coverage

The supplied `supabase/schema.sql` creates tables for the areas requested for the admin panel:

- app information
- site settings
- social links
- buttons / CTAs
- screenshots
- features
- categories / tags
- reviews
- rating distribution
- data safety
- similar apps
- SEO settings
- section visibility / ordering
- appearance settings
- media metadata
- admin users

It also configures RLS policies and a Supabase Storage bucket for site media.

## Recommended production architecture

```text
GitHub
   │
   ▼
Vercel
   │
   ├── React/Vite public site
   └── /admin

Supabase
   ├── Auth
   ├── Postgres database
   └── Storage
```

## Before production

1. Create the Supabase project.
2. Run `supabase/schema.sql` in the Supabase SQL Editor.
3. Create an admin user in Supabase Authentication.
4. Add that user's UUID to `public.admin_users` using the instructions in `SETUP.md`.
5. Add the Supabase URL and anon/publishable key to Vercel Environment Variables.
6. Connect the React admin/public data layer to Supabase.
7. Remove the current `localStorage` persistence and browser-password authentication from `src/App.tsx`.
8. Test all CRUD operations and RLS before sharing the public URL.

## Do not commit secrets

Never commit these to GitHub:

- Supabase service-role key
- database password
- personal access tokens
- private deployment tokens

Only the public Supabase URL and anon/publishable browser key belong in the frontend environment configuration.
