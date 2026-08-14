// Converts "GAC Winter Trek 2026" -> "gac-winter-trek-2026-a3f9"
// A short random suffix guarantees uniqueness even if two events share a title.
export function generateSlug(title) {
  const base = title
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-');

  const suffix = Math.random().toString(36).slice(2, 6);
  return `${base}-${suffix}`;
}