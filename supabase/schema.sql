-- ============================================================================
-- Portfolio admin panel — Supabase setup
--
-- Run this in the Supabase dashboard: Project → SQL Editor → New query.
--
-- IMPORTANT — run in three passes, in this exact order:
--   1. Run "PART 1" below as-is.
--   2. Go create your admin user (Authentication → Users → Add user) and
--      copy their UUID.
--   3. Replace every '5b3ee7ed-9270-4c96-8adb-eddf545543f0' placeholder in "PART 2" and "PART 3"
--      with that UUID, then run those parts.
--
-- See README.md for the full step-by-step deploy walkthrough.
-- ============================================================================


-- ============================================================================
-- PART 1 — table + seed data (run first, no edits needed)
-- ============================================================================

create table if not exists public.projects (
  id uuid primary key default gen_random_uuid(),
  status text not null default 'soon' check (status in ('live', 'soon')),
  name text not null,
  tagline text,
  team_badge text,
  tags text[] not null default '{}',
  metric_val text,
  metric_lbl text,
  image_url text,
  image_path text,
  project_url text,
  case_study jsonb,
  highlighted boolean not null default false,
  sort_order integer not null default 0,
  created_at timestamptz not null default now()
);

comment on column public.projects.case_study is
  'Structured long-form content for the detail popup: {eyebrow, title, summary, shots: string[], roleTag, techTags: string[], problem, role: [[key,value],...], approach, results: [{val,lbl}], testimonial: {quote,by}}';

-- Seed data — ports the 4 projects that currently live in src/data/projects.js
-- so the homepage looks byte-identical the moment it switches over to Supabase.
insert into public.projects
  (status, name, tagline, team_badge, tags, metric_val, metric_lbl, case_study, highlighted, sort_order)
values
  (
    'live',
    'Emily',
    'AI-Powered Customer Support Agent',
    'Solo · PM & Dev',
    array['Claude API', 'Zendesk'],
    '−40%',
    'first response time',
    $json${
      "eyebrow": "Case Study",
      "title": "Emily — AI-Powered Customer Support Agent",
      "summary": "Cutting first-response time on Zendesk tickets by deploying a Claude-powered AI agent.",
      "shots": ["Zendesk sidebar — Emily panel", "Draft response preview", "Playbook / config view"],
      "roleTag": "Product Manager / Developer",
      "techTags": ["FastAPI", "Claude API", "Zendesk", "Docker"],
      "problem": "The CS team supporting LRT, LGO, and MWO received a high volume of tickets — ban appeals, compensation requests, account recovery, in-game bugs — driving long response times and burdening agents with repetitive, low-complexity cases.",
      "role": [
        ["Role", "Product Manager & Lead Developer"],
        ["Team", "Solo project, integrated with the existing CS team"],
        ["Stakeholders", "Head of CS, Zendesk agents, game development team"],
        ["Methodology", "Iterative rollout — mini-sprints, tested on live tickets"]
      ],
      "approach": "Rather than building a generic chatbot, I designed a system grounded in the game's full documentation and CS playbook — one that understands the context of each title (LRT / LGO / MWO) and drafts responses consistent with the brand's tone of voice. Emily doesn't replace the agent; she prepares the first draft, cutting down decision time.",
      "results": [
        {"val": "—%", "lbl": "Draft time reduced"},
        {"val": "—", "lbl": "Tickets handled with Emily / month"},
        {"val": "—", "lbl": "CSAT change (if measured)"}
      ],
      "testimonial": {
        "quote": "Add a quote from the Head of CS or a team agent here.",
        "by": "Name, Role (placeholder)"
      }
    }$json$::jsonb,
    true,
    1
  ),
  ('soon', 'Project 02', null, null, '{}', null, null, null, true, 2),
  ('soon', 'Project 03', null, null, '{}', null, null, null, true, 3),
  ('soon', 'Project 04', null, null, '{}', null, null, null, true, 4);


-- ============================================================================
-- PART 2 — Row Level Security (admin UUID already filled in below)
-- ============================================================================

alter table public.projects enable row level security;

-- Public read — the homepage fetches projects with the anon key, no session.
create policy "Public can read projects"
  on public.projects for select
  to anon, authenticated
  using (true);

-- Writes are restricted to exactly your admin user, not "any authenticated
-- user" — so a stray future account in auth.users can never modify data.
create policy "Admin can insert projects"
  on public.projects for insert
  to authenticated
  with check (auth.uid() = '5b3ee7ed-9270-4c96-8adb-eddf545543f0'::uuid);

create policy "Admin can update projects"
  on public.projects for update
  to authenticated
  using (auth.uid() = '5b3ee7ed-9270-4c96-8adb-eddf545543f0'::uuid)
  with check (auth.uid() = '5b3ee7ed-9270-4c96-8adb-eddf545543f0'::uuid);

create policy "Admin can delete projects"
  on public.projects for delete
  to authenticated
  using (auth.uid() = '5b3ee7ed-9270-4c96-8adb-eddf545543f0'::uuid);


-- ============================================================================
-- PART 3 — Storage bucket for project images (admin UUID already filled in below)
-- ============================================================================

insert into storage.buckets (id, name, public)
values ('project-images', 'project-images', true)
on conflict (id) do nothing;

-- Public bucket already serves reads via the public URL without needing a
-- SELECT policy, but this is added anyway for consistency / API access.
create policy "Public can read project images"
  on storage.objects for select
  to anon, authenticated
  using (bucket_id = 'project-images');

create policy "Admin can upload project images"
  on storage.objects for insert
  to authenticated
  with check (bucket_id = 'project-images' and auth.uid() = '5b3ee7ed-9270-4c96-8adb-eddf545543f0'::uuid);

create policy "Admin can update project images"
  on storage.objects for update
  to authenticated
  using (bucket_id = 'project-images' and auth.uid() = '5b3ee7ed-9270-4c96-8adb-eddf545543f0'::uuid);

create policy "Admin can delete project images"
  on storage.objects for delete
  to authenticated
  using (bucket_id = 'project-images' and auth.uid() = '5b3ee7ed-9270-4c96-8adb-eddf545543f0'::uuid);
