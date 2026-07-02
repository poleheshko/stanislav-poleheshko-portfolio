export function splitCsv(str) {
  return str
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
}
