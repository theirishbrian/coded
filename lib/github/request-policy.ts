import type { GitHubRequest } from "./get-json";

/** One instance-wide gate; acquire for every actual request, including each page. */
export function createRequestPolicy(
  load: GitHubRequest,
  now: () => number = Date.now,
): GitHubRequest {
  let starts: number[] = [];
  let active = 0;
  let cooldownUntil = 0;
  return async (url) => {
    const time = now();
    if (time < cooldownUntil)
      return {
        kind: "rate_limited",
        retryAfterSeconds: Math.ceil((cooldownUntil - time) / 1000),
        resetAt: new Date(cooldownUntil).toISOString(),
      };
    starts = starts.filter((start) => start > time - 3_600_000);
    if (starts.length >= 30)
      return {
        kind: "busy",
        retryAfterSeconds: Math.max(
          1,
          Math.ceil((starts[0] + 3_600_000 - time) / 1000),
        ),
      };
    if (active >= 2) return { kind: "busy", retryAfterSeconds: 5 };
    starts.push(time);
    active++;
    try {
      const result = await load(url);
      if (result.kind === "rate_limited") {
        const reset = result.resetAt === null ? 0 : Date.parse(result.resetAt);
        cooldownUntil = Math.min(
          8_640_000_000_000_000,
          Math.max(
            cooldownUntil,
            now() + 60_000,
            now() + (result.retryAfterSeconds ?? 0) * 1000,
            Number.isFinite(reset) ? reset : 0,
          ),
        );
      }
      return result;
    } catch {
      return { kind: "upstream_error" };
    } finally {
      active--;
    }
  };
}
