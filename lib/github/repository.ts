import { normalizeUsername } from "./username";

export interface GitHubRepository {
  id: number;
  name: string;
  owner: string;
  html_url: string;
  description: string | null;
  language: string | null;
  stargazers_count: number | null;
  forks_count: number | null;
  fork: boolean;
  archived: boolean;
  updated_at: string | null;
  pushed_at: string | null;
}

function record(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}
function text(value: unknown): value is string | null | undefined {
  return value == null || typeof value === "string";
}
function count(value: unknown): value is number | null | undefined {
  return value == null || (Number.isSafeInteger(value) && Number(value) >= 0);
}
function timestamp(value: unknown): value is string | null | undefined {
  if (value == null) return true;
  if (
    typeof value !== "string" ||
    !/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}Z$/.test(value)
  )
    return false;
  const date = new Date(value);
  return (
    Number.isFinite(date.getTime()) &&
    date.toISOString() === value.replace("Z", ".000Z")
  );
}

/** Reject the whole page if any consumed item is unsafe or malformed. */
export function parseRepositories(
  value: unknown,
  username: string,
): GitHubRepository[] | null {
  if (!Array.isArray(value) || value.length > 100) return null;
  const repositories: GitHubRepository[] = [];
  for (const item of value) {
    if (
      !record(item) ||
      !record(item.owner) ||
      !Number.isSafeInteger(item.id) ||
      Number(item.id) <= 0 ||
      typeof item.name !== "string" ||
      !/^[A-Za-z0-9_.-]{1,100}$/.test(item.name) ||
      item.name === "." ||
      item.name === ".." ||
      typeof item.owner.login !== "string" ||
      normalizeUsername(item.owner.login) !== username ||
      item.owner.type !== "User" ||
      item.private !== false ||
      (item.visibility !== undefined && item.visibility !== "public") ||
      typeof item.fork !== "boolean" ||
      typeof item.archived !== "boolean" ||
      !text(item.description) ||
      !text(item.language) ||
      !count(item.stargazers_count) ||
      !count(item.forks_count) ||
      !timestamp(item.updated_at) ||
      !timestamp(item.pushed_at) ||
      typeof item.html_url !== "string"
    )
      return null;
    try {
      const url = new URL(item.html_url);
      if (
        url.origin !== "https://github.com" ||
        url.username ||
        url.password ||
        url.search ||
        url.hash ||
        url.pathname.toLowerCase() !== `/${username}/${item.name.toLowerCase()}`
      )
        return null;
    } catch {
      return null;
    }
    repositories.push({
      id: Number(item.id),
      name: item.name,
      owner: item.owner.login,
      html_url: item.html_url,
      description: item.description ?? null,
      language: item.language ?? null,
      stargazers_count: item.stargazers_count ?? null,
      forks_count: item.forks_count ?? null,
      fork: item.fork,
      archived: item.archived,
      updated_at: item.updated_at ?? null,
      pushed_at: item.pushed_at ?? null,
    });
  }
  return repositories;
}

export function repositoryPageUrl(username: string, page: number): string {
  return `https://api.github.com/users/${username}/repos?type=owner&sort=full_name&direction=asc&per_page=100&page=${page}`;
}

/** Link is a continuation signal, never a destination to fetch. Fail closed on unexpected syntax. */
export function repositoryContinuation(
  link: string | null,
  username: string,
  nextPage: number,
): "next" | "end" | "invalid" {
  if (link === null) return "end";
  const relations = new Set<string>();
  for (const part of link.split(",")) {
    const match = /^\s*<([^<>]+)>;\s*rel="(next|prev|first|last)"\s*$/.exec(
      part,
    );
    if (!match || relations.has(match[2])) return "invalid";
    relations.add(match[2]);
    if (match[2] !== "next") continue;
    try {
      const actual = new URL(match[1]);
      const expected = new URL(repositoryPageUrl(username, nextPage));
      actual.searchParams.sort();
      expected.searchParams.sort();
      if (actual.href !== expected.href) return "invalid";
    } catch {
      return "invalid";
    }
  }
  return relations.has("next") ? "next" : "end";
}
