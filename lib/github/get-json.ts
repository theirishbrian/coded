import "server-only";
import { isRateLimitMessage } from "./user";

export type GitHubFailure =
  | {
      kind:
        | "invalid_input"
        | "not_found"
        | "access_denied"
        | "timeout"
        | "network_error"
        | "upstream_error"
        | "malformed_response"
        | "unsupported_account";
    }
  | {
      kind: "rate_limited";
      retryAfterSeconds: number | null;
      resetAt: string | null;
    };

type GitHubJsonResult =
  | {
      kind: "success";
      payload: unknown;
      link: string | null;
      retrievedAt: string;
    }
  | GitHubFailure;

function seconds(header: string | null): number | null {
  if (header === null || !/^\d+$/.test(header)) return null;
  const value = Number(header);
  return Number.isSafeInteger(value) && value <= 8_640_000_000_000
    ? value
    : null;
}

/** One public request; deadline includes reading the response body. */
export async function getGitHubJson(
  sourceUrl: string,
): Promise<GitHubJsonResult> {
  // Only internal adapters construct paths; never accept a pagination URL here.
  const url = new URL(sourceUrl);
  if (url.origin !== "https://api.github.com" || url.username || url.password)
    return { kind: "invalid_input" };
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 5_000);
  try {
    const response = await fetch(sourceUrl, {
      headers: {
        Accept: "application/vnd.github+json",
        "X-GitHub-Api-Version": "2026-03-10",
        "User-Agent": "Coded",
      },
      cache: "no-store",
      redirect: "manual",
      signal: controller.signal,
    });
    if (response.status === 404) return { kind: "not_found" };
    if (response.status === 403 || response.status === 429) {
      const retryAfterSeconds = seconds(response.headers.get("retry-after"));
      const reset = seconds(response.headers.get("x-ratelimit-reset"));
      let rateLimited =
        response.status === 429 ||
        response.headers.get("x-ratelimit-remaining") === "0" ||
        retryAfterSeconds !== null;
      if (!rateLimited) {
        try {
          rateLimited = isRateLimitMessage(await response.json());
        } catch {
          if (controller.signal.aborted) return { kind: "timeout" };
          // An unreadable error body must not turn access refusal into success.
        }
      }
      return rateLimited
        ? {
            kind: "rate_limited",
            retryAfterSeconds,
            resetAt:
              reset === null ? null : new Date(reset * 1000).toISOString(),
          }
        : { kind: "access_denied" };
    }
    if (response.status === 401) return { kind: "access_denied" };
    if (response.status !== 200) return { kind: "upstream_error" };
    let payload: unknown;
    try {
      payload = await response.json();
    } catch (error) {
      if (controller.signal.aborted) return { kind: "timeout" };
      return {
        kind:
          error instanceof SyntaxError ? "malformed_response" : "network_error",
      };
    }
    return {
      kind: "success",
      payload,
      link: response.headers.get("link"),
      retrievedAt: new Date().toISOString(),
    };
  } catch {
    return { kind: controller.signal.aborted ? "timeout" : "network_error" };
  } finally {
    clearTimeout(timer);
  }
}
