-- ============================================================================
-- Migration — multiple images per project
--
-- Run this ONCE in the Supabase dashboard (SQL Editor → New query → Run) on an
-- existing project. Fresh installs already get this column from schema.sql, so
-- you only need this if your `projects` table was created before the
-- "multiple images" feature was added.
--
-- Adds an ordered `images` gallery. Each element is {url, path, main}:
--   - order in the array  = order shown in the case-study gallery popup
--   - "main": true         = the single image shown on the homepage card
-- The legacy image_url / image_path columns are kept and always mirror the
-- main image, so the SQL insert template and older code keep working.
-- ============================================================================

alter table public.projects
  add column if not exists images jsonb not null default '[]'::jsonb;

comment on column public.projects.images is
  'Ordered gallery: [{url, path, main}]. Array order = gallery order in the popup; the element with "main": true is the homepage card image. image_url/image_path mirror the main image for backward compatibility.';

-- Backfill: turn any existing single image into a one-item gallery so nothing
-- disappears from projects created before this migration.
update public.projects
set images = jsonb_build_array(
  jsonb_build_object('url', image_url, 'path', image_path, 'main', true)
)
where image_url is not null
  and (images is null or jsonb_array_length(images) = 0);
