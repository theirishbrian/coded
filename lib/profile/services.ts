import "server-only";
import { getGitHubJson, type GitHubRequest } from "../github/get-json";
import { createRequestPolicy } from "../github/request-policy";
import { normalizeUsername } from "../github/username";
import { getPublicProfile, type ProfileResult } from "./get-profile";
import {
  getPublicRepositories,
  type RepositoriesResult,
} from "./get-repositories";
import { createSuccessCache } from "./lookup-policy";

export function createProfileServices(
  transport: GitHubRequest = getGitHubJson,
  now: () => number = Date.now,
) {
  const request = createRequestPolicy(transport, now);
  const accounts = createSuccessCache(
    (username) => getPublicProfile(username, request),
    now,
  );
  const repositories = createSuccessCache(
    (username) => getPublicRepositories(username, request),
    now,
  );
  return {
    async lookupProfile(input: unknown): Promise<ProfileResult> {
      const username = normalizeUsername(input);
      return username ? accounts(username) : { kind: "invalid_input" };
    },
    async repositoriesFor(
      result: ProfileResult,
    ): Promise<RepositoriesResult | null> {
      if (result.kind !== "success") return null;
      const username = normalizeUsername(result.profile.username);
      if (!username)
        return { kind: "failure", failure: { kind: "invalid_input" } };
      return repositories(username);
    },
  };
}
