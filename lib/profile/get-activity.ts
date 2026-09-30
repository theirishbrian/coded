import "server-only";
import {
  getGitHubJson,
  type GitHubFailure,
  type GitHubRequest,
} from "../github/get-json";
import {
  parsePublicEvents,
  publicEventsContinuation,
  publicEventsPageUrl,
} from "../github/event";
import { normalizeUsername } from "../github/username";

export type ActivityKind =
  | "push"
  | "pull_request"
  | "issue"
  | "release"
  | "star"
  | "fork"
  | "create"
  | "review"
  | "comment"
  | "other";

export interface PublicActivityEvent {
  id: string;
  kind: ActivityKind;
  repository: string;
  repositoryUrl: string;
  occurredAt: string;
  action: string | null;
  refType: "repository" | "branch" | "tag" | null;
  pushSize: number | null;
  pullRequestMerged: boolean | null;
}

interface ActivitySnapshot {
  events: PublicActivityEvent[];
  source: {
    urls: string[];
    retrievedAt: string;
    pagesFetched: number;
    coverage: "public-events-up-to-30-days";
    order: "newest-first";
    pageLimit: 3;
  };
}

export type ActivityResult =
  | (ActivitySnapshot & {
      kind: "success";
      completeness: "endpoint_exhausted" | "page_limit";
    })
  | (ActivitySnapshot & {
      kind: "partial";
      completeness: "interrupted";
      failure: GitHubFailure;
    })
  | { kind: "failure"; failure: GitHubFailure };

function kind(type: string): ActivityKind {
  switch (type) {
    case "PushEvent":
      return "push";
    case "PullRequestEvent":
      return "pull_request";
    case "IssuesEvent":
      return "issue";
    case "ReleaseEvent":
      return "release";
    case "WatchEvent":
      return "star";
    case "ForkEvent":
      return "fork";
    case "CreateEvent":
      return "create";
    case "PullRequestReviewEvent":
      return "review";
    case "IssueCommentEvent":
    case "CommitCommentEvent":
    case "PullRequestReviewCommentEvent":
      return "comment";
    default:
      return "other";
  }
}

export async function getPublicActivity(
  input: unknown,
  request: GitHubRequest = getGitHubJson,
): Promise<ActivityResult> {
  const username = normalizeUsername(input);
  if (!username) return { kind: "failure", failure: { kind: "invalid_input" } };
  const events = new Map<string, PublicActivityEvent>();
  const urls: string[] = [];
  let retrievedAt = "";
  const snapshot = (): ActivitySnapshot => ({
    events: [...events.values()],
    source: {
      urls: [...urls],
      retrievedAt,
      pagesFetched: urls.length,
      coverage: "public-events-up-to-30-days",
      order: "newest-first",
      pageLimit: 3,
    },
  });
  const failed = (failure: GitHubFailure): ActivityResult =>
    urls.length
      ? { ...snapshot(), kind: "partial", completeness: "interrupted", failure }
      : { kind: "failure", failure };

  for (let page = 1; page <= 3; page++) {
    const url = publicEventsPageUrl(username, page);
    const response = await request(url);
    if (response.kind !== "success") return failed(response);
    const items = parsePublicEvents(response.payload, username);
    if (items === null) return failed({ kind: "malformed_response" });
    const continuation = publicEventsContinuation(
      response.link,
      username,
      page + 1,
    );
    for (const item of items) {
      if (events.has(item.id)) continue;
      const [owner, repository] = item.repo.name.split("/");
      events.set(item.id, {
        id: item.id,
        kind: kind(item.type),
        repository: item.repo.name,
        repositoryUrl: `https://github.com/${owner}/${repository}`,
        occurredAt: item.created_at,
        action: item.action,
        refType: item.ref_type,
        pushSize: item.push_size,
        pullRequestMerged: item.pull_request_merged,
      });
    }
    urls.push(url);
    retrievedAt = response.retrievedAt;
    if (continuation === "invalid")
      return failed({ kind: "malformed_response" });
    if (continuation === "end")
      return {
        ...snapshot(),
        kind: "success",
        completeness: "endpoint_exhausted",
      };
  }
  return { ...snapshot(), kind: "success", completeness: "page_limit" };
}
