import { supabase } from "./supabaseClient";
import { withTimeout } from "./withTimeout";

const BUCKET = "project-images";

function sanitizeFileName(name) {
  return name.toLowerCase().replace(/[^a-z0-9.\-]+/g, "-");
}

// Uploads under a fresh, unique path every time (rather than a fixed
// per-project path) so callers never need `upsert: true` and old images can
// be explicitly removed via deleteProjectImage() when replaced.
export async function uploadProjectImage(file) {
  const path = `${crypto.randomUUID()}-${sanitizeFileName(file.name)}`;
  const { error } = await withTimeout(supabase.storage.from(BUCKET).upload(path, file));
  if (error) throw error;
  const { data } = supabase.storage.from(BUCKET).getPublicUrl(path);
  return { path, url: data.publicUrl };
}

// Best-effort — a failed cleanup shouldn't block the project save/delete
// action that triggered it.
export async function deleteProjectImage(path) {
  if (!path) return;
  try {
    await withTimeout(supabase.storage.from(BUCKET).remove([path]));
  } catch (err) {
    console.warn("Failed to remove old project image:", err);
  }
}
