# Setup: GitHub + Vercel + Supabase

This guide prepares the project for a production deployment with a Supabase backend.

> **Important:** The current React admin panel in this ZIP still uses `localStorage`. The SQL/backend setup is included, but the frontend data access must be switched from `localStorage` to Supabase before admin changes can sync across devices.

---

## 1. Test the project locally

From the project directory:

```bash
npm install
npm run dev
```

Open the local URL shown by Vite.

Public site:

```text
http://localhost:5173/
```

Admin:

```text
http://localhost:5173/admin
```

The current static admin uses `admin123` only for the local/browser implementation.

---

## 2. Create a Supabase project

1. Open the Supabase dashboard.
2. Create a new project.
3. Wait for the project database to finish provisioning.
4. Open **SQL Editor**.

---

## 3. Run the database SQL

Open this file from the ZIP:

```text
supabase/schema.sql
```

Copy the full contents into the Supabase SQL Editor and run it.

The SQL creates:

- `site_settings`
- `app_info`
- `social_links`
- `buttons`
- `screenshots`
- `features`
- `categories`
- `reviews`
- `rating_distribution`
- `data_safety`
- `similar_apps`
- `seo_settings`
- `section_settings`
- `appearance_settings`
- `media_assets`
- `admin_users`

It also creates RLS policies and a storage bucket named `site-media`.

---

## 4. Create the admin account

In Supabase:

1. Open **Authentication**.
2. Open **Users**.
3. Add a new user with your admin email and a strong password.
4. Copy the user's UUID.

Then run this SQL, replacing the UUID:

```sql
insert into public.admin_users (user_id, role)
values ('YOUR_AUTH_USER_UUID', 'admin')
on conflict (user_id) do update
set role = excluded.role;
```

Only users listed in `admin_users` are treated as administrators by the RLS policies.

---

## 5. Get the Supabase frontend values

In the Supabase project settings, find:

- Project URL
- Anon / publishable key

Create a local `.env` file from `.env.example`:

```env
VITE_SUPABASE_URL=https://YOUR_PROJECT.supabase.co
VITE_SUPABASE_ANON_KEY=YOUR_PUBLIC_ANON_KEY
```

Use only the public browser key in the frontend.

**Never expose the Supabase service-role key in Vite/React code.**

---

## 6. Add the Supabase JavaScript client

From the project directory:

```bash
npm install @supabase/supabase-js
```

Create a small Supabase client module, for example:

```text
src/lib/supabase.ts
```

The module should create the client with:

```ts
import { createClient } from '@supabase/supabase-js';

export const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
);
```

Then replace the current `localStorage` data layer with Supabase queries and Supabase Auth.

---

## 7. Replace browser-password authentication

The current project contains browser-local authentication logic in `src/App.tsx`.

For production:

- remove the `localStorage` admin password
- remove the local auth flag
- use `supabase.auth.signInWithPassword()`
- use `supabase.auth.getSession()` to protect `/admin`
- use `supabase.auth.signOut()` for logout

A user should be considered an admin only if:

1. They are authenticated with Supabase Auth.
2. Their Auth UUID exists in `public.admin_users`.

---

## 8. Connect the public page to Supabase

Replace the current configuration loading/saving functions in `src/App.tsx`.

The public page should read published data from Supabase instead of the current local configuration.

Use these tables according to the page section:

| Frontend content | Table |
|---|---|
| App information | `app_info` |
| General/site values | `site_settings` |
| Social links | `social_links` |
| Buttons | `buttons` |
| Screenshots | `screenshots` |
| Features | `features` |
| Tags | `categories` |
| Reviews | `reviews` |
| Rating bars | `rating_distribution` |
| Data safety | `data_safety` |
| Similar apps | `similar_apps` |
| SEO | `seo_settings` |
| Section visibility/order | `section_settings` |
| Branding/appearance | `appearance_settings` |
| Image metadata | `media_assets` |

---

## 9. Upload images to Supabase Storage

The SQL creates the storage bucket:

```text
site-media
```

Recommended folders:

```text
site-media/logo/
site-media/banner/
site-media/screenshots/
site-media/reviews/
site-media/similar-apps/
site-media/seo/
```

Store the resulting public URL in the relevant database row.

The admin panel should support both:

- direct image URL
- upload to Supabase Storage

---

## 10. GitHub upload

Create a new GitHub repository and push the project.

Example:

```bash
git init
git add .
git commit -m "Add landing page admin panel"
git branch -M main
git remote add origin https://github.com/YOUR-USERNAME/YOUR-REPO.git
git push -u origin main
```

Do not commit `.env`.

Your `.gitignore` should contain:

```text
node_modules
dist
.env
.env.local
```

---

## 11. Deploy on Vercel

1. Sign in to Vercel.
2. Import the GitHub repository.
3. Vercel should detect Vite automatically.
4. Use:

```text
Build Command: npm run build
Output Directory: dist
```

5. Add these Environment Variables in Vercel:

```text
VITE_SUPABASE_URL
VITE_SUPABASE_ANON_KEY
```

6. Deploy.

For future environment-variable changes, redeploy so the new Vite build contains the updated values.

---

## 12. Test production

After Vercel deployment, test:

```text
/
/admin
```

Verify:

- Admin login works.
- Non-admin users cannot access admin operations.
- App name edits save to Supabase.
- APK URL edits save.
- Telegram/social URLs save.
- Logo uploads work.
- Banner uploads work.
- Screenshots can be added/deleted/reordered.
- Features can be added/deleted/reordered.
- Reviews can be added/edited/deleted.
- Rating distribution updates.
- Similar apps update.
- Section visibility updates.
- SEO settings update.
- Changes remain after browser refresh.
- Changes appear on another device after login.

---

## 13. Common deployment issues

### Admin works locally but not on Vercel

Check Vercel Environment Variables and redeploy.

### Images do not upload

Check the `site-media` bucket and its Storage RLS policies.

### Database says permission denied

Check that your Auth user has a row in `public.admin_users` and that the RLS policies from `schema.sql` were applied.

### Changes work in one browser only

That means the frontend is still using `localStorage`. Replace the current local persistence layer with the Supabase data layer.

### Vercel build fails

Run locally:

```bash
npm install
npm run build
```

Fix TypeScript/build errors before pushing again.

---

## Production security checklist

- Use a strong Supabase admin password.
- Do not publish service-role keys.
- Keep `.env` out of Git.
- Keep RLS enabled.
- Verify admin membership through `admin_users`.
- Test unauthenticated access.
- Test an ordinary non-admin Auth user.
- Review Storage policies before making uploaded files public.
