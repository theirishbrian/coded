import { normalizeUsername } from "./username";

export interface GitHubUser {
  id: number;
  type: "User";
  login: string;
  name: string | null;
  bio: string | null;
  avatar_url: string;
  html_url: string;
  public_repos: number | null;
  followers: number | null;
  following: number | null;
}

export type ParsedUser =
  | { kind: "user"; user: GitHubUser }
  | { kind: "unsupported_account" }
  | { kind: "malformed_response" };

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function isCount(value: unknown): value is number | null | undefined {
  return value == null || (Number.isSafeInteger(value) && Number(value) >= 0);
}

function isText(value: unknown): value is string | null | undefined {
  return value == null || typeof value === "string";
}

function isSafeUrl(value: unknown, hosts: string[]): value is string {
  if (typeof value !== "string") return false;
  try {
    const url = new URL(value);
    return (
      url.protocol === "https:" &&
      hosts.includes(url.hostname) &&
      !url.username &&
      !url.password &&
      !url.port
    );
  } catch {
    return false;
  }
}

/** Validate only the consumed fields, dropping unrelated upstream data. */
export function parseGitHubUser(value: unknown): ParsedUser {
  const malformed = { kind: "malformed_response" } as const;
  if (!isRecord(value)) return malformed;
  if (!Number.isSafeInteger(value.id) || Number(value.id) <= 0)
    return malformed;
  if (typeof value.login !== "string" || !value.login) return malformed;
  if (value.type === "Organization" || value.type === "Bot") {
    return { kind: "unsupported_account" };
  }
  if (
    value.type !== "User" ||
    normalizeUsername(value.login) !== value.login.toLowerCase() ||
    !isText(value.name) ||
    !isText(value.bio) ||
    !isCount(value.public_repos) ||
    !isCount(value.followers) ||
    !isCount(value.following) ||
    !isSafeUrl(value.avatar_url, [
      "avatars.githubusercontent.com",
      "github.com",
    ]) ||
    !isSafeUrl(value.html_url, ["github.com"])
  )
    return malformed;
  const profileUrl = new URL(value.html_url);
  if (
    profileUrl.pathname.toLowerCase() !== `/${value.login.toLowerCase()}` ||
    profileUrl.search ||
    profileUrl.hash
  )
    return malformed;
  return {
    kind: "user",
    user: {
      id: Number(value.id),
      type: "User",
      login: value.login,
      name: value.name ?? null,
      bio: value.bio ?? null,
      avatar_url: value.avatar_url,
      html_url: value.html_url,
      public_repos: value.public_repos ?? null,
      followers: value.followers ?? null,
      following: value.following ?? null,
    },
  };
}

export function isRateLimitMessage(value: unknown): boolean {
  return (
    isRecord(value) &&
    typeof value.message === "string" &&
    /(?:secondary rate limit|api rate limit exceeded)/i.test(value.message)
  );
}
