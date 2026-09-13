# Production Guide

## What caused the old multi-device problem?

The previous implementation stored the complete `SiteConfig` object in browser `localStorage` and converted uploaded images into browser data URLs. That made each browser/device keep its own independent copy.

## What changed?

The website configuration is now stored centrally in Supabase:

```text
public.site_settings
  site_key = main
  site_value = JSON SiteConfig
```

The public page fetches this record at runtime. The admin panel writes to this record only after a successful Supabase request.

Images are uploaded to the `site-media` Supabase Storage bucket and the public Storage URL is saved in the configuration.

## Realtime / cross-device behavior

The public page subscribes to Supabase Realtime for `public.site_settings` and also polls every 15 seconds as a fallback. Therefore:

- a fresh browser/device sees the latest saved configuration
- an already-open browser can update after an admin save
- a failed WebSocket does not prevent eventual synchronization

## Files changed

- `src/App.tsx` — replaced local website-config persistence with Supabase read/write, Storage uploads, cache-safe runtime loading, Realtime updates, and polling fallback.
- `supabase/schema.sql` — enables public read/admin write policies, Storage policies, and Realtime for `site_settings`.
- `supabase/migrate-cloud-config.sql` — upgrade SQL for an existing Supabase project.
- `SETUP.md` — updated production setup and acceptance test.

## Supabase resources

- `public.site_settings` — single central settings record
- `storage.site-media` — public image bucket for admin-uploaded media
- `public.admin_users` — authorization table for admin actions

## Important limitation

The configuration is intentionally stored as one JSON record because this project is a single-site landing page. The existing normalized tables in the original schema are retained, but the current frontend uses `site_settings` as the single runtime source of truth so admin edits cannot diverge across separate browser stores.
