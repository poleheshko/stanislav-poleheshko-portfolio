import { supabase } from "./supabaseClient";
import { withTimeout } from "./withTimeout";

export const HIGHLIGHTED_LIMIT = 4;

// Converts a Supabase row (snake_case + jsonb) into the exact camelCase shape
// the existing homepage components already expect. Defaults every optional
// field so a partially-filled row degrades gracefully instead of crashing.
export function mapRowToProject(row) {
  const cs = row.case_study;

  // Ordered gallery. Prefer the new `images` column; fall back to the legacy
  // single image so rows created before the multi-image feature still render.
  let images = Array.isArray(row.images) ? row.images.filter((im) => im && im.url) : [];
  if (images.length === 0 && row.image_url) {
    images = [{ url: row.image_url, path: row.image_path ?? null, main: true }];
  }
  const mainImage = images.find((im) => im.main) || images[0] || null;

  return {
    id: row.id,
    status: row.status,
    name: row.name,
    tagline: row.tagline ?? "",
    teamBadge: row.team_badge ?? "",
    tags: row.tags ?? [],
    metric: { val: row.metric_val ?? "—", lbl: row.metric_lbl ?? "" },
    images,
    imageUrl: mainImage?.url ?? null,
    imagePath: mainImage?.path ?? null,
    projectUrl: row.project_url ?? null,
    highlighted: !!row.highlighted,
    sortOrder: row.sort_order ?? 0,
    caseStudy: cs
      ? {
          eyebrow: cs.eyebrow ?? "Case Study",
          title: cs.title ?? row.name,
          summary: cs.summary ?? "",
          shots: cs.shots ?? [],
          roleTag: cs.roleTag ?? "",
          techTags: cs.techTags ?? [],
          problem: cs.problem ?? "",
          role: cs.role ?? [],
          approach: cs.approach ?? "",
          results: cs.results ?? [],
          testimonial: cs.testimonial ?? { quote: "", by: "" },
        }
      : null,
  };
}

export async function fetchProjects() {
  const { data, error } = await withTimeout(
    supabase.from("projects").select("*").order("sort_order", { ascending: true }),
  );
  if (error) throw error;
  return data.map(mapRowToProject);
}

export async function fetchHighlightedCount() {
  const { count, error } = await withTimeout(
    supabase.from("projects").select("id", { count: "exact", head: true }).eq("highlighted", true),
  );
  if (error) throw error;
  return count ?? 0;
}

export async function createProject(row) {
  const { data, error } = await withTimeout(supabase.from("projects").insert(row).select().single());
  if (error) throw error;
  return mapRowToProject(data);
}

export async function updateProject(id, row) {
  const { data, error } = await withTimeout(supabase.from("projects").update(row).eq("id", id).select().single());
  if (error) throw error;
  return mapRowToProject(data);
}

export async function deleteProject(id) {
  const { error } = await withTimeout(supabase.from("projects").delete().eq("id", id));
  if (error) throw error;
}

export async function setSortOrder(id, sortOrder) {
  const { error } = await withTimeout(supabase.from("projects").update({ sort_order: sortOrder }).eq("id", id));
  if (error) throw error;
}

// Swaps sort_order between two projects (used by the admin up/down buttons).
export async function swapSortOrder(a, b) {
  await Promise.all([setSortOrder(a.id, b.sortOrder), setSortOrder(b.id, a.sortOrder)]);
}
