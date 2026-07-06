-- ============================================================================
-- Migration — add a website URL to employers.
--
-- HOW TO USE:
--   Paste this whole file into: Supabase dashboard → SQL Editor → New query → Run.
--   Run it once. It is idempotent (safe to re-run).
--
-- What it does:
--   Adds employers.website_url so the case-study page can link the employer's
--   logo to their site.
-- ============================================================================

alter table public.employers
  add column if not exists website_url text;
