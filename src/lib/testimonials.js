import { supabase } from "./supabaseClient";
import { withTimeout } from "./withTimeout";

// Converts a Supabase testimonials row (snake_case) into the camelCase shape the
// UI uses. Mirrors mapRowToEmployer() in employers.js.
export function mapRowToTestimonial(row) {
  return {
    id: row.id,
    quote: row.quote,
    authorName: row.author_name,
    authorRole: row.author_role ?? "",
    photoUrl: row.photo_url ?? null,
    photoPath: row.photo_path ?? null,
    linkUrl: row.link_url ?? null,
    sortOrder: row.sort_order ?? 0,
  };
}

export async function fetchTestimonials() {
  const { data, error } = await withTimeout(
    supabase.from("testimonials").select("*").order("sort_order", { ascending: true }),
  );
  if (error) throw error;
  return data.map(mapRowToTestimonial);
}

export async function createTestimonial(row) {
  const { data, error } = await withTimeout(
    supabase.from("testimonials").insert(row).select().single(),
  );
  if (error) throw error;
  return mapRowToTestimonial(data);
}

export async function updateTestimonial(id, row) {
  const { data, error } = await withTimeout(
    supabase.from("testimonials").update(row).eq("id", id).select().single(),
  );
  if (error) throw error;
  return mapRowToTestimonial(data);
}

export async function deleteTestimonial(id) {
  const { error } = await withTimeout(supabase.from("testimonials").delete().eq("id", id));
  if (error) throw error;
}

async function setSortOrder(id, sortOrder) {
  const { error } = await withTimeout(
    supabase.from("testimonials").update({ sort_order: sortOrder }).eq("id", id),
  );
  if (error) throw error;
}

// Swaps sort_order between two testimonials (used by the admin up/down buttons).
export async function swapSortOrder(a, b) {
  await Promise.all([setSortOrder(a.id, b.sortOrder), setSortOrder(b.id, a.sortOrder)]);
}
