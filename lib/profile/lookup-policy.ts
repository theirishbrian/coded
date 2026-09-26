import type { ProfileResult } from "./get-profile";
export type LookupResult = ProfileResult;

/** Cache validated successes only. Each caller owns its independent bounded cache. */
export function createSuccessCache<T extends { kind: string }>(
  load: (key: string) => Promise<T>,
  now: () => number = Date.now,
) {
  const cache = new Map<string, { expires: number; result: T }>();
  const pending = new Map<string, Promise<T>>();
  return async (key: string): Promise<T> => {
    for (const [name, entry] of cache)
      if (entry.expires <= now()) cache.delete(name);
    const hit = cache.get(key);
    if (hit) return structuredClone(hit.result);
    const existing = pending.get(key);
    if (existing) return structuredClone(await existing);
    const request = Promise.resolve()
      .then(() => load(key))
      .then((result) => {
        if (result.kind === "success") {
          if (cache.size >= 100) {
            const oldest = cache.keys().next().value;
            if (oldest !== undefined) cache.delete(oldest);
          }
          cache.set(key, {
            expires: now() + 300_000,
            result: structuredClone(result),
          });
        }
        return result;
      })
      .finally(() => pending.delete(key));
    pending.set(key, request);
    return structuredClone(await request);
  };
}
