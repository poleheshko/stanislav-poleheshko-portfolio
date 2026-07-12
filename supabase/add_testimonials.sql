-- ============================================================================
-- Migration — add "testimonials" to an already-deployed database.
--
-- HOW TO USE:
--   Paste this whole file into: Supabase dashboard → SQL Editor → New query → Run.
--   Run it once. It is idempotent (safe to re-run).
--
-- What it does:
--   1. Creates the public.testimonials table (quote + author + optional photo
--      and profile link).
--   2. Enables Row Level Security with the same rules as projects/employers:
--      public read, writes restricted to your admin user.
--
-- NOTE: the admin UUID below matches the one already used in schema.sql. If your
-- admin user's UUID is different, replace every occurrence before running.
--
-- Author photos reuse the existing `project-images` storage bucket, so no new
-- bucket or storage policies are needed here.
-- ============================================================================

-- 1. Table -------------------------------------------------------------------
create table if not exists public.testimonials (
  id uuid primary key default gen_random_uuid(),
  quote text not null,
  author_name text not null,
  author_role text,
  photo_url text,
  photo_path text,
  link_url text,
  sort_order integer not null default 0,
  created_at timestamptz not null default now()
);

-- 2. Row Level Security ------------------------------------------------------
alter table public.testimonials enable row level security;

drop policy if exists "Public can read testimonials" on public.testimonials;
create policy "Public can read testimonials"
  on public.testimonials for select
  to anon, authenticated
  using (true);

drop policy if exists "Admin can insert testimonials" on public.testimonials;
create policy "Admin can insert testimonials"
  on public.testimonials for insert
  to authenticated
  with check (auth.uid() = '5b3ee7ed-9270-4c96-8adb-eddf545543f0'::uuid);

drop policy if exists "Admin can update testimonials" on public.testimonials;
create policy "Admin can update testimonials"
  on public.testimonials for update
  to authenticated
  using (auth.uid() = '5b3ee7ed-9270-4c96-8adb-eddf545543f0'::uuid)
  with check (auth.uid() = '5b3ee7ed-9270-4c96-8adb-eddf545543f0'::uuid);

drop policy if exists "Admin can delete testimonials" on public.testimonials;
create policy "Admin can delete testimonials"
  on public.testimonials for delete
  to authenticated
  using (auth.uid() = '5b3ee7ed-9270-4c96-8adb-eddf545543f0'::uuid);
