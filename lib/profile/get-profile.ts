import "server-only";
import { getGitHubUser, type GitHubFailure } from "../github/get-user";

export interface PublicProfile {
  accountId: number;
  accountType: "User";
  username: string;
  displayName: string | null;
  biography: string | null;
  avatarUrl: string;
  profileUrl: string;
  counts: {
    publicRepositories: number | null;
    followers: number | null;
    following: number | null;
  };
  source: { url: string; retrievedAt: string; coverage: "public-api-reported" };
}

export type ProfileResult =
  { kind: "success"; profile: PublicProfile } | GitHubFailure;

export async function getPublicProfile(
  username: unknown,
): Promise<ProfileResult> {
  const result = await getGitHubUser(username);
  if (result.kind !== "success") return result;
  const user = result.user;
  return {
    kind: "success",
    profile: {
      accountId: user.id,
      accountType: user.type,
      username: user.login,
      displayName: user.name,
      biography: user.bio,
      avatarUrl: user.avatar_url,
      profileUrl: user.html_url,
      counts: {
        publicRepositories: user.public_repos,
        followers: user.followers,
        following: user.following,
      },
      source: {
        url: result.sourceUrl,
        retrievedAt: result.retrievedAt,
        coverage: "public-api-reported",
      },
    },
  };
}
