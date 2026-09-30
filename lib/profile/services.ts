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
import { getPublicActivity, type ActivityResult } from "./get-activity";

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
  const activity = createSuccessCache((key) => {
    const separator = key.indexOf(":");
    const accountId = Number(key.slice(0, separator));
    const username = key.slice(separator + 1);
    return getPublicActivity(username, request, accountId);
  }, now);
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
    async activityFor(result: ProfileResult): Promise<ActivityResult | null> {
      if (result.kind !== "success") return null;
      const username = normalizeUsername(result.profile.username);
      if (!username)
        return { kind: "failure", failure: { kind: "invalid_input" } };
      return activity(`${result.profile.accountId}:${username}`);
    },
  };
}
