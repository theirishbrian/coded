import { describe, expect, it } from "vitest";
import type { PublicProfile } from "@/lib/profile/get-profile";
import type {
  PublicRepository,
  RepositoriesResult,
} from "@/lib/profile/get-repositories";
import { buildProfileChecklist } from "@/lib/profile/profile-checklist";

const profile: PublicProfile = {
  accountId: 123,
  accountType: "User",
  username: "sample-dev",
  displayName: "Sample Developer",
  biography: "Builds useful public tools.",
  avatarUrl: "https://avatars.githubusercontent.com/u/123?v=4",
  profileUrl: "https://github.com/sample-dev",
  counts: { publicRepositories: 1, followers: 2, following: 3 },
  source: {
    url: "https://api.github.com/users/sample-dev",
    retrievedAt: "2026-09-30T12:00:00Z",
    coverage: "public-api-reported",
  },
};

const repository: PublicRepository = {
  id: 1,
  name: "complete-project",
  owner: "sample-dev",
  url: "https://github.com/sample-dev/complete-project",
  description: "A documented project.",
  primaryLanguage: "TypeScript",
  stars: 1,
  forks: 0,
  isFork: false,
  isArchived: false,
  updatedAt: "2026-09-30T12:00:00Z",
  pushedAt: "2026-09-30T12:00:00Z",
  homepageUrl: "https://example.com",
  topics: ["developer-tools"],
  license: { name: "MIT License", spdxId: "MIT" },
};

const complete = (repositories: PublicRepository[]): RepositoriesResult => ({
  kind: "success",
  completeness: "endpoint_exhausted",
  repositories,
  source: {
    urls: ["https://api.github.com/users/sample-dev/repos?page=1"],
    retrievedAt: "2026-09-30T12:00:00Z",
    pagesFetched: 1,
    coverage: "owned-public-repositories",
    order: "full-name-ascending",
    pageLimit: 3,
  },
});

describe("buildProfileChecklist", () => {
  it("recognises visible profile and project strengths", () => {
    const checklist = buildProfileChecklist(profile, complete([repository]));

    expect(checklist.repositoryCoverage).toBe("complete");
    expect(checklist.items).toHaveLength(5);
    expect(checklist.items.every((item) => item.kind === "complete")).toBe(
      true,
    );
    expect(checklist.items.map((item) => item.id)).toEqual([
      "biography",
      "original-project",
      "descriptions",
      "licences",
      "discovery",
    ]);
  });

  it("returns actionable missing metadata with at most three repository links", () => {
    const repositories = Array.from({ length: 4 }, (_, index) => ({
      ...repository,
      id: index,
      name: `project-${index}`,
      url: `https://github.com/sample-dev/project-${index}`,
      description: null,
      homepageUrl: null,
      topics: [],
      license: null,
    }));
    const checklist = buildProfileChecklist(
      { ...profile, biography: "   " },
      complete(repositories),
    );

    expect(
      checklist.items.filter((item) => item.kind === "action"),
    ).toHaveLength(4);
    expect(
      checklist.items.find((item) => item.id === "descriptions"),
    ).toMatchObject({
      title: "Add missing project descriptions",
      repositories: repositories
        .slice(0, 3)
        .map(({ name, url }) => ({ name, url })),
    });
    expect(
      checklist.items.find((item) => item.id === "licences")?.detail,
    ).toContain("A licence makes the permitted reuse");
  });

  it("excludes forks and archived repositories from project checks", () => {
    const checklist = buildProfileChecklist(
      profile,
      complete([
        { ...repository, isFork: true, description: null },
        { ...repository, id: 2, isArchived: true, description: null },
      ]),
    );

    expect(checklist.items.map((item) => item.id)).toEqual([
      "biography",
      "original-project",
    ]);
    expect(checklist.items[1]).toMatchObject({ kind: "action" });
  });

  it("does not infer missing original work from incomplete repository data", () => {
    const partial = {
      kind: "partial",
      completeness: "interrupted",
      failure: { kind: "upstream_error" },
      repositories: [],
      source: {
        urls: ["https://api.github.com/users/sample-dev/repos?page=1"],
        retrievedAt: "2026-09-30T12:00:00Z",
        pagesFetched: 1,
        coverage: "owned-public-repositories",
        order: "full-name-ascending",
        pageLimit: 3,
      },
    } satisfies RepositoriesResult;

    const checklist = buildProfileChecklist(profile, partial);

    expect(checklist.repositoryCoverage).toBe("partial");
    expect(checklist.items.map((item) => item.id)).toEqual(["biography"]);
  });

  it("keeps account guidance when repository data is unavailable", () => {
    const checklist = buildProfileChecklist(profile, {
      kind: "failure",
      failure: {
        kind: "rate_limited",
        retryAfterSeconds: null,
        resetAt: null,
      },
    });

    expect(checklist.repositoryCoverage).toBe("unavailable");
    expect(checklist.items).toEqual([
      expect.objectContaining({ id: "biography", kind: "complete" }),
    ]);
  });
});
