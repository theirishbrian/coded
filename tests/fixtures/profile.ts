import type { PublicProfile } from "@/lib/profile/get-profile";
export const sampleProfile: PublicProfile = {
  accountId: 123,
  accountType: "User",
  username: "sample-dev",
  displayName: "Sample Developer",
  biography: null,
  avatarUrl: "https://avatars.githubusercontent.com/u/123?v=4",
  profileUrl: "https://github.com/sample-dev",
  counts: { publicRepositories: 5, followers: 0, following: null },
  source: {
    url: "https://api.github.com/users/sample-dev",
    retrievedAt: "2026-09-24T00:00:00.000Z",
    coverage: "public-api-reported",
  },
};
