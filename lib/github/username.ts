/** Coded accepts ordinary public handles, not URLs or managed-account aliases. */
export function normalizeUsername(value: unknown): string | null {
  if (typeof value !== "string") return null;
  const username = value.trim().toLowerCase();
  return username.length <= 39 && /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(username)
    ? username
    : null;
}
