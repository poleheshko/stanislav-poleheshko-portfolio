-- ============================================================================
-- Add a new project — fill-in template
--
-- HOW TO USE:
--   1. Give this file + a description of the project to Claude and ask it to
--      fill in the placeholders (everything in CAPS below).
--   2. Paste the finished script into: Supabase dashboard → SQL Editor → New
--      query → Run.
--
-- NOTES:
--   - The SQL Editor runs with full DB privileges, so Row Level Security
--     (which normally restricts writes to the admin's logged-in session)
--     does NOT block this — no login/auth needed to run it here.
--   - `highlighted = true` shows the project in the homepage stack. Any
--     number of projects can be highlighted at once.
--   - Images are left out on purpose — upload them through the admin panel
--     (Edit project → Images) after this insert, since they need to go through
--     Supabase Storage. You can add up to 10, reorder them, and pick which one
--     is the "main" image shown on the homepage card.
--   - `case_study.shots` are optional text captions. When a project has real
--     uploaded images they become per-image labels; when it has none they act
--     as placeholder screenshot slots, e.g. ["Dashboard — main view"].
--   - Leave a field as SQL `null` (not the string "null") if there's
--     genuinely nothing to put there.
-- ============================================================================

insert into public.projects
  (status, name, tagline, team_badge, tags, metric_val, metric_lbl, project_url, case_study, highlighted, sort_order)
values (
  'live',                                    -- 'live' or 'soon' (soon = empty placeholder card)
  'PROJECT_NAME',                             -- short name shown on the card
  'ONE_LINE_TAGLINE',                         -- short line under the name, or null
  'TEAM_BADGE',                                -- e.g. 'Solo · PM & Dev', or null
  array['TAG_ONE', 'TAG_TWO'],                 -- tech/tool chips on the card
  'METRIC_VALUE',                              -- headline stat, e.g. '−40%', or null
  'METRIC_LABEL',                              -- what the stat measures, e.g. 'first response time', or null
  null,                                        -- optional external project URL, or null
  $json${
    "eyebrow": "Case Study",
    "title": "PROJECT_NAME — FULL TITLE",
    "summary": "One to two sentence summary shown at the top of the popup.",
    "shots": ["SCREENSHOT CAPTION 1", "SCREENSHOT CAPTION 2"],
    "roleTag": "YOUR ROLE, e.g. Product Manager / Developer",
    "techTags": ["TECH 1", "TECH 2"],
    "problem": "What problem existed before this project.",
    "role": [
      ["Role", "YOUR ROLE"],
      ["Team", "TEAM COMPOSITION"],
      ["Stakeholders", "WHO WAS INVOLVED"],
      ["Methodology", "HOW YOU WORKED"]
    ],
    "approach": "How you approached and solved the problem.",
    "results": [
      {"val": "VALUE", "lbl": "WHAT IT MEASURES"},
      {"val": "VALUE", "lbl": "WHAT IT MEASURES"},
      {"val": "VALUE", "lbl": "WHAT IT MEASURES"}
    ],
    "testimonial": {
      "quote": "Optional quote, or leave as empty string.",
      "by": "Name, Role"
    }
  }$json$::jsonb,
  false,                                        -- true = show in the homepage stack (see note above)
  99                                             -- sort order; use a high number to place it last, then reorder in admin UI
);
