// Derives a URL-friendly slug from a project name so case-study links read
// like /projects/emily instead of exposing the raw Supabase UUID. Slugs are
// computed from the name (there is no slug column), so renaming a project
// changes its link — an acceptable trade-off for a personal portfolio.
export function slugify(name) {
  return String(name || "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

// Finds the project whose name slugifies to `slug`. Returns null if none match
// (e.g. a stale or hand-typed link). First match wins if two names collide.
export function findProjectBySlug(projects, slug) {
  if (!slug) return null;
  return projects.find((p) => slugify(p.name) === slug) || null;
}
