import { normalizeUsername } from "../github/username";
import type { ProfileResult } from "./get-profile";

type Success = Extract<ProfileResult, { kind: "success" }>;
export type LookupResult =
  ProfileResult | { kind: "busy"; retryAfterSeconds: number };
const TTL = 5 * 60_000;
const HOUR = 60 * 60_000;

/** Process-local controls, not a distributed/IP-wide rate limiter. */
export function createProfileLookup(
  load: (username: string) => Promise<ProfileResult>,
  now: () => number = Date.now,
) {
  const cache = new Map<string, { expires: number; result: Success }>();
  const pending = new Map<string, Promise<LookupResult>>();
  let starts: number[] = [];
  let cooldownUntil = 0;
  return async function lookup(input: unknown): Promise<LookupResult> {
    const username = normalizeUsername(input);
    if (!username) return { kind: "invalid_input" };
    const time = now();
    for (const [key, entry] of cache)
      if (entry.expires <= time) cache.delete(key);
    const cached = cache.get(username);
    if (cached) return structuredClone(cached.result);
    const existing = pending.get(username);
    if (existing) return structuredClone(await existing);
    if (time < cooldownUntil)
      return {
        kind: "rate_limited",
        retryAfterSeconds: Math.ceil((cooldownUntil - time) / 1000),
        resetAt: new Date(cooldownUntil).toISOString(),
      };
    starts = starts.filter((start) => start > time - HOUR);
    if (starts.length >= 30)
      return {
        kind: "busy",
        retryAfterSeconds: Math.max(
          1,
          Math.ceil((starts[0] + HOUR - time) / 1000),
        ),
      };
    if (pending.size >= 2) return { kind: "busy", retryAfterSeconds: 5 };
    starts.push(time);
    const request: Promise<LookupResult> = Promise.resolve()
      .then(() => load(username))
      .then((result) => {
        if (result.kind === "success") {
          if (cache.size >= 100) {
            const oldest = cache.keys().next().value;
            if (oldest !== undefined) cache.delete(oldest);
          }
          cache.set(username, {
            expires: now() + TTL,
            result: structuredClone(result),
          });
        } else if (result.kind === "rate_limited") {
          const retry = (result.retryAfterSeconds ?? 0) * 1000;
          const reset =
            result.resetAt === null ? 0 : Date.parse(result.resetAt);
          cooldownUntil = Math.max(
            cooldownUntil,
            now() + 60_000,
            now() + retry,
            Number.isFinite(reset) ? reset : 0,
          );
          cooldownUntil = Math.min(cooldownUntil, 8_640_000_000_000_000);
        }
        return result;
      })
      .catch((): LookupResult => ({ kind: "upstream_error" }))
      .finally(() => pending.delete(username));
    pending.set(username, request);
    return structuredClone(await request);
  };
}
