-- ============================================================================
-- Migration — add "employers / clients" to an already-deployed database.
--
-- HOW TO USE:
--   Paste this whole file into: Supabase dashboard → SQL Editor → New query → Run.
--   Run it once. It is idempotent (safe to re-run).
--
-- What it does:
--   1. Creates the public.employers table (company name + optional logo).
--   2. Adds projects.employer_id (nullable FK → employers).
--   3. Enables Row Level Security on employers with the same rules as projects:
--      public read, writes restricted to your admin user.
--
-- NOTE: the admin UUID below matches the one already used in schema.sql. If your
-- admin user's UUID is different, replace every occurrence before running.
--
-- Logos reuse the existing `project-images` storage bucket, so no new bucket or
-- storage policies are needed here.
-- ============================================================================

-- 1. Table -------------------------------------------------------------------
create table if not exists public.employers (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  logo_url text,
  logo_path text,
  created_at timestamptz not null default now()
);

-- 2. Link column on projects -------------------------------------------------
-- `on delete set null` un-links projects if their employer is deleted, rather
-- than blocking the delete or cascading it to the projects.
alter table public.projects
  add column if not exists employer_id uuid references public.employers(id) on delete set null;

-- 3. Row Level Security ------------------------------------------------------
alter table public.employers enable row level security;

drop policy if exists "Public can read employers" on public.employers;
create policy "Public can read employers"
  on public.employers for select
  to anon, authenticated
  using (true);

drop policy if exists "Admin can insert employers" on public.employers;
create policy "Admin can insert employers"
  on public.employers for insert
  to authenticated
  with check (auth.uid() = '5b3ee7ed-9270-4c96-8adb-eddf545543f0'::uuid);

drop policy if exists "Admin can update employers" on public.employers;
create policy "Admin can update employers"
  on public.employers for update
  to authenticated
  using (auth.uid() = '5b3ee7ed-9270-4c96-8adb-eddf545543f0'::uuid)
  with check (auth.uid() = '5b3ee7ed-9270-4c96-8adb-eddf545543f0'::uuid);

drop policy if exists "Admin can delete employers" on public.employers;
create policy "Admin can delete employers"
  on public.employers for delete
  to authenticated
  using (auth.uid() = '5b3ee7ed-9270-4c96-8adb-eddf545543f0'::uuid);
