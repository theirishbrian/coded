// @vitest-environment node
import { expect, it } from "vitest";
import { summarizeLanguages } from "@/lib/profile/summarize-languages";
import type { PublicRepository } from "@/lib/profile/get-repositories";
const repo = (
  id: number,
  primaryLanguage: string | null,
  flags = {},
): PublicRepository => ({
  id,
  primaryLanguage,
  name: `repo-${id}`,
  owner: "sample",
  url: `https://github.com/sample/repo-${id}`,
  description: null,
  stars: 0,
  forks: 0,
  isFork: false,
  isArchived: false,
  updatedAt: null,
  pushedAt: null,
  ...flags,
});
it("counts primary languages alphabetically, including forks and archives without mutating input", () => {
  const input = [
    repo(1, "TypeScript"),
    repo(2, "C++", { isFork: true }),
    repo(3, "TypeScript", { isArchived: true }),
    repo(4, "C#"),
  ];
  const before = structuredClone(input);
  expect(summarizeLanguages(input)).toEqual({
    total: 4,
    unreported: 0,
    languages: [
      { name: "C#", repositories: 1 },
      { name: "C++", repositories: 1 },
      { name: "TypeScript", repositories: 2 },
    ],
  });
  expect(input).toEqual(before);
});
it("keeps null and blank metadata separate from a reported language", () => {
  expect(
    summarizeLanguages([repo(1, null), repo(2, " "), repo(3, " JavaScript ")]),
  ).toEqual({
    total: 3,
    unreported: 2,
    languages: [{ name: "JavaScript", repositories: 1 }],
  });
});
it("retains first observation of duplicate IDs and handles names safely", () => {
  expect(
    summarizeLanguages([
      repo(1, "__proto__"),
      repo(1, "JavaScript"),
      repo(2, "constructor"),
    ]),
  ).toEqual({
    total: 2,
    unreported: 0,
    languages: [
      { name: "__proto__", repositories: 1 },
      { name: "constructor", repositories: 1 },
    ],
  });
});
it("distinguishes no inventory from inventory with no reported languages", () => {
  expect(summarizeLanguages([])).toEqual({
    total: 0,
    unreported: 0,
    languages: [],
  });
  expect(summarizeLanguages([repo(1, null)])).toEqual({
    total: 1,
    unreported: 1,
    languages: [],
  });
});
