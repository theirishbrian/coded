import "server-only";
import { normalizeUsername } from "./username";
import { parseGitHubUser, type GitHubUser } from "./user";
import { getGitHubJson, type GitHubFailure } from "./get-json";
export type { GitHubFailure } from "./get-json";

export type GitHubUserResult =
  | {
      kind: "success";
      user: GitHubUser;
      sourceUrl: string;
      retrievedAt: string;
    }
  | GitHubFailure;

export async function getGitHubUser(input: unknown): Promise<GitHubUserResult> {
  const username = normalizeUsername(input);
  if (!username) return { kind: "invalid_input" };
  const sourceUrl = `https://api.github.com/users/${username}`;
  const result = await getGitHubJson(sourceUrl);
  if (result.kind !== "success") return result;
  const parsed = parseGitHubUser(result.payload);
  if (parsed.kind !== "user") return parsed;
  return {
    kind: "success",
    user: parsed.user,
    sourceUrl,
    retrievedAt: result.retrievedAt,
  };
}
