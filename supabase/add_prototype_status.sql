-- Adds a third project status, 'prototype', alongside 'live' and 'soon'.
--
-- A prototype renders on the public site exactly like a live project (full
-- card, clickable, opens its case study) but carries a distinct amber
-- "Prototype" badge — so genuine in-progress work no longer has to masquerade
-- as a greyed-out "Coming soon" placeholder.
--
-- Run once in the Supabase SQL editor (Project -> SQL Editor -> New query).

alter table public.projects
  drop constraint if exists projects_status_check;

alter table public.projects
  add constraint projects_status_check
  check (status in ('live', 'prototype', 'soon'));

-- Convenience: flip the Weather Challenge card to the new status. Adjust the
-- name or remove this line — you can also change it from the admin panel's
-- Status dropdown at any time.
update public.projects set status = 'prototype' where name = 'Weather Challenge';
