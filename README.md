# Portfolio website

React + Vite portfolio site with a Supabase-backed admin panel for managing projects.

## Local development

```
npm install
npm run dev
```

The public site works without Supabase configured (it will just fail to load projects and show
"Loading projects…"). To use the admin panel or see real project data, follow the Supabase setup
below first.

## Supabase setup (one-time, per environment)

You'll need a free [Supabase](https://supabase.com) project. Do the following **in this exact
order** — the RLS policies need your admin user's UUID, so the user must exist before you run them.

1. **Create a Supabase project** at supabase.com if you don't have one yet.

2. **Run the schema** — open the project's SQL Editor and run `supabase/schema.sql`, but only
   **PART 1** for now (creates the `projects` table and seeds it with the site's current 4
   projects). Leave PART 2 and PART 3 for after step 4.

3. **Create the admin user** — go to Authentication → Users → Add user, enter your email and a
   password. Click into the new user and copy their **User UID**.

4. **Finish the schema** — back in the SQL Editor, in `supabase/schema.sql` PART 2 and PART 3,
   replace every `<ADMIN_UUID>` placeholder with the UID you copied, then run those two parts.
   This locks all writes (project edits and image uploads) to exactly your account.

5. **Get your API keys** — Project Settings → API. You need the **Project URL** and the
   **anon/public key** (not the service role key — that one should never go in frontend code).

6. **Set environment variables**:
   - Locally: copy `.env.example` to `.env` and fill in the two values from step 5.
   - On Vercel: Project Settings → Environment Variables → add `VITE_SUPABASE_URL` and
     `VITE_SUPABASE_ANON_KEY` with the same values, then redeploy.

7. **Sign in** — visit `/admin/login` (locally: `http://localhost:5173/admin/login`) and sign in
   with the email/password from step 3.

8. **(Optional) Enable 2FA** — once logged in, go to the Security tab and click "Enable 2FA" to
   scan a QR code with an authenticator app (Google Authenticator, 1Password, Authy, etc.). Once
   verified, every future login will require a code from that app in addition to the password.

### Already set up before "multiple images"?

If your `projects` table was created before per-project image galleries existed, run
`supabase/add_project_images.sql` once in the SQL Editor. It adds the `images` column (and
backfills any existing single image). **Without it, saving a project from the admin panel will
fail** with a "column images does not exist" error. Fresh installs from `schema.sql` already
include this column and don't need the migration.

## Admin panel

- `/admin/login` — sign in (email + password, plus a TOTP code if 2FA is enabled)
- `/admin/dashboard` — manage projects (add/edit/delete/reorder/highlight) and 2FA, once signed in

Exactly 4 projects can be marked "Highlighted" at a time — those are the ones shown in the
homepage's project stack. Trying to highlight a 5th is blocked with a message asking you to
un-highlight one first. Projects can be reordered with the ↑/↓ buttons; the order also controls
the "All Projects" popup's ordering and, among highlighted projects, their order in the homepage
stack.

Marking a project "Live" requires filling in its case-study fields (tagline, tags, metric,
summary, problem, approach, role tag, tech tags) — this is what's rendered in the project's detail
popup, so an incomplete "Live" project would otherwise show blank sections.

Each project can hold up to **10 images** (Edit project → Images). Use ◀ ▶ to set the order they
appear in the case-study popup gallery, and ★ to pick the single "main" image shown on the
homepage card. The main image fills the full height of the card's image panel; the popup gallery
shows every image at a 16:9 (1920×1080) ratio. Removing an image also deletes it from Storage when
you save.

## Deploying

This is a static Vite build deployed to Vercel. `vercel.json` includes a rewrite so that
client-side routes (`/admin/dashboard`, etc.) work correctly on page refresh/direct navigation.
Vercel's zero-config Vite preset handles the build itself (`npm run build`, `dist/` output) —
you just need the two environment variables from step 6 above set in the Vercel project.
