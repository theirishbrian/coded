import "server-only";
import { getGitHubJson, type GitHubFailure } from "../github/get-json";
import { normalizeUsername } from "../github/username";
import {
  parseRepositories,
  repositoryContinuation,
  repositoryPageUrl,
} from "../github/repository";

export interface PublicRepository {
  id: number;
  name: string;
  owner: string;
  url: string;
  description: string | null;
  primaryLanguage: string | null;
  stars: number | null;
  forks: number | null;
  isFork: boolean;
  isArchived: boolean;
  updatedAt: string | null;
  pushedAt: string | null;
}
interface RepositorySnapshot {
  repositories: PublicRepository[];
  source: {
    urls: string[];
    retrievedAt: string;
    pagesFetched: number;
    coverage: "owned-public-repositories";
    order: "full-name-ascending";
    pageLimit: 3;
  };
}
export type RepositoriesResult =
  | (RepositorySnapshot & {
      kind: "success";
      completeness: "endpoint_exhausted" | "page_limit";
    })
  | (RepositorySnapshot & {
      kind: "partial";
      completeness: "interrupted";
      failure: GitHubFailure;
    })
  | { kind: "failure"; failure: GitHubFailure };

/** Bounded server-only loader. Not exposed by a route; callers must budget/cache before wiring UI. */
export async function getPublicRepositories(
  input: unknown,
): Promise<RepositoriesResult> {
  const username = normalizeUsername(input);
  if (!username) return { kind: "failure", failure: { kind: "invalid_input" } };
  const repositories = new Map<number, PublicRepository>();
  const urls: string[] = [];
  let retrievedAt = "";
  const snapshot = (): RepositorySnapshot => ({
    repositories: [...repositories.values()],
    source: {
      urls: [...urls],
      retrievedAt,
      pagesFetched: urls.length,
      coverage: "owned-public-repositories",
      order: "full-name-ascending",
      pageLimit: 3,
    },
  });
  const failed = (failure: GitHubFailure): RepositoriesResult =>
    urls.length
      ? { ...snapshot(), kind: "partial", completeness: "interrupted", failure }
      : { kind: "failure", failure };
  for (let page = 1; page <= 3; page++) {
    const url = repositoryPageUrl(username, page);
    const response = await getGitHubJson(url);
    if (response.kind !== "success") return failed(response);
    const items = parseRepositories(response.payload, username);
    if (items === null) return failed({ kind: "malformed_response" });
    const continuation = repositoryContinuation(
      response.link,
      username,
      page + 1,
    );
    // A bad continuation prevents claiming completeness, but valid items remain useful.
    for (const item of items) {
      if (repositories.has(item.id)) continue;
      repositories.set(item.id, {
        id: item.id,
        name: item.name,
        owner: item.owner,
        url: item.html_url,
        description: item.description,
        primaryLanguage: item.language,
        stars: item.stargazers_count,
        forks: item.forks_count,
        isFork: item.fork,
        isArchived: item.archived,
        updatedAt: item.updated_at,
        pushedAt: item.pushed_at,
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
