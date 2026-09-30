import { describe, expect, it } from "vitest";
import type { PublicRepository } from "@/lib/profile/get-repositories";
import { selectProjectHighlights } from "@/lib/profile/select-project-highlights";

const repository = (
  id: number,
  patch: Partial<PublicRepository> = {},
): PublicRepository => ({
  id,
  name: `repo-${id}`,
  owner: "sample-dev",
  url: `https://github.com/sample-dev/repo-${id}`,
  description: null,
  primaryLanguage: null,
  stars: 0,
  forks: 0,
  isFork: false,
  isArchived: false,
  updatedAt: null,
  pushedAt: null,
  homepageUrl: null,
  topics: [],
  license: null,
  ...patch,
});

describe("project highlight selection", () => {
  it("excludes forks and archives, caps at three, and publishes a deterministic order", () => {
    const selected = selectProjectHighlights([
      repository(1, { stars: 99, isFork: true }),
      repository(2, { stars: 98, isArchived: true }),
      repository(3, { stars: 4, pushedAt: "2025-01-01T00:00:00Z" }),
      repository(4, { stars: 4, pushedAt: "2026-01-01T00:00:00Z" }),
      repository(5, { stars: 2 }),
      repository(6, { stars: 1 }),
    ]);

    expect(selected.map(({ id }) => id)).toEqual([4, 3, 5]);
  });

  it("treats missing stars and dates as unavailable and uses name as the final tie-break", () => {
    expect(
      selectProjectHighlights([
        repository(1, { name: "zeta", stars: null }),
        repository(2, { name: "beta", stars: null }),
        repository(3, { name: "alpha", stars: 0 }),
      ]).map(({ name }) => name),
    ).toEqual(["alpha", "beta", "zeta"]);
  });
});
