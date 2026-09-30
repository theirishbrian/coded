import { normalizeUsername } from "./username";

export interface GitHubPublicEvent {
  id: string;
  type: string;
  repo: { name: string };
  created_at: string;
  action: string | null;
  ref_type: "repository" | "branch" | "tag" | null;
  push_size: number | null;
  pull_request_merged: boolean | null;
}

function record(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function timestamp(value: unknown): value is string {
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

function repositoryName(value: unknown): value is string {
  return (
    typeof value === "string" &&
    /^[A-Za-z0-9](?:[A-Za-z0-9-]{0,38})\/[A-Za-z0-9_.-]{1,100}$/.test(value) &&
    !value.endsWith("/.") &&
    !value.endsWith("/..")
  );
}

function safeAction(value: unknown): string | null {
  return typeof value === "string" && /^[a-z_]{1,32}$/.test(value)
    ? value
    : null;
}

export function parsePublicEvents(
  value: unknown,
  username: string,
): GitHubPublicEvent[] | null {
  if (!Array.isArray(value) || value.length > 100) return null;
  const events: GitHubPublicEvent[] = [];
  for (const item of value) {
    if (
      !record(item) ||
      !record(item.actor) ||
      !record(item.repo) ||
      !record(item.payload) ||
      typeof item.id !== "string" ||
      !/^\d{1,30}$/.test(item.id) ||
      typeof item.type !== "string" ||
      !/^[A-Za-z][A-Za-z]{1,62}Event$/.test(item.type) ||
      typeof item.actor.login !== "string" ||
      normalizeUsername(item.actor.login) !== username ||
      !repositoryName(item.repo.name) ||
      item.public !== true ||
      !timestamp(item.created_at)
    )
      return null;

    const pushSize = item.payload.size;
    const refType = item.payload.ref_type;
    const pullRequest = item.payload.pull_request;
    if (
      pushSize !== undefined &&
      (!Number.isSafeInteger(pushSize) || Number(pushSize) < 0)
    )
      return null;
    if (
      refType !== undefined &&
      refType !== "repository" &&
      refType !== "branch" &&
      refType !== "tag"
    )
      return null;
    if (pullRequest !== undefined && !record(pullRequest)) return null;
    if (
      record(pullRequest) &&
      pullRequest.merged !== undefined &&
      typeof pullRequest.merged !== "boolean"
    )
      return null;

    events.push({
      id: item.id,
      type: item.type,
      repo: { name: item.repo.name },
      created_at: item.created_at,
      action: safeAction(item.payload.action),
      ref_type: refType ?? null,
      push_size: pushSize === undefined ? null : Number(pushSize),
      pull_request_merged:
        record(pullRequest) && typeof pullRequest.merged === "boolean"
          ? pullRequest.merged
          : null,
    });
  }
  return events;
}

export function publicEventsPageUrl(username: string, page: number): string {
  return `https://api.github.com/users/${username}/events/public?per_page=100&page=${page}`;
}

export function publicEventsContinuation(
  link: string | null,
  username: string,
  nextPage: number,
  accountId: number | null = null,
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
      const expected = new URL(publicEventsPageUrl(username, nextPage));
      actual.searchParams.sort();
      expected.searchParams.sort();
      const usernamePath = expected.pathname.toLowerCase();
      const accountPath =
        accountId === null ? null : `/user/${accountId}/events/public`;
      if (
        actual.origin !== expected.origin ||
        actual.username ||
        actual.password ||
        actual.hash ||
        ![usernamePath, accountPath].includes(actual.pathname.toLowerCase()) ||
        actual.search !== expected.search
      )
        return "invalid";
    } catch {
      return "invalid";
    }
  }
  return relations.has("next") ? "next" : "end";
}
