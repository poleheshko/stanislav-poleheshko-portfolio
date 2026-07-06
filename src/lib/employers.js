import { supabase } from "./supabaseClient";
import { withTimeout } from "./withTimeout";

// Converts a Supabase employers row (snake_case) into the camelCase shape the
// UI uses. Mirrors mapRowToProject() in projects.js.
export function mapRowToEmployer(row) {
  return {
    id: row.id,
    name: row.name,
    logoUrl: row.logo_url ?? null,
    logoPath: row.logo_path ?? null,
  };
}

export async function fetchEmployers() {
  const { data, error } = await withTimeout(
    supabase.from("employers").select("*").order("name", { ascending: true }),
  );
  if (error) throw error;
  return data.map(mapRowToEmployer);
}

export async function createEmployer(row) {
  const { data, error } = await withTimeout(supabase.from("employers").insert(row).select().single());
  if (error) throw error;
  return mapRowToEmployer(data);
}

export async function updateEmployer(id, row) {
  const { data, error } = await withTimeout(
    supabase.from("employers").update(row).eq("id", id).select().single(),
  );
  if (error) throw error;
  return mapRowToEmployer(data);
}

export async function deleteEmployer(id) {
  const { error } = await withTimeout(supabase.from("employers").delete().eq("id", id));
  if (error) throw error;
}
