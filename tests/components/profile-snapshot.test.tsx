import { fireEvent, render, screen, within } from "@testing-library/react";
import { expect, it, vi } from "vitest";
import { ProfileSnapshot } from "@/components/profile-snapshot";
import type { ActivityResult } from "@/lib/profile/get-activity";
import type {
  PublicRepository,
  RepositoriesResult,
} from "@/lib/profile/get-repositories";
import { sampleProfile } from "../fixtures/profile";

const repository = (id: number, overrides = {}): PublicRepository => ({
  id,
  name: `project-${id}`,
  owner: sampleProfile.username,
  url: `https://github.com/${sampleProfile.username}/project-${id}`,
  description: `Public project ${id}`,
  primaryLanguage: id === 1 ? "TypeScript" : "JavaScript",
  stars: 5 - id,
  forks: 0,
  isFork: false,
  isArchived: false,
  updatedAt: "2026-09-29T12:00:00Z",
  pushedAt: `2026-09-${29 - id}T12:00:00Z`,
  homepageUrl: null,
  topics: [],
  license: { name: "MIT License", spdxId: "MIT" },
  ...overrides,
});

const repositories = {
  kind: "success",
  completeness: "endpoint_exhausted",
  repositories: [repository(1), repository(2), repository(3), repository(4)],
  source: {
    urls: [
      "https://api.github.com/users/sample-dev/repos?type=owner&per_page=100&page=1",
    ],
    retrievedAt: "2026-09-30T12:00:00Z",
    pagesFetched: 1,
    coverage: "owned-public-repositories",
    order: "full-name-ascending",
    pageLimit: 3,
  },
} satisfies RepositoriesResult;

const activity = {
  kind: "success",
  completeness: "endpoint_exhausted",
  events: [
    {
      id: "event-1",
      kind: "push",
      repository: "sample-dev/project-1",
      repositoryUrl: "https://github.com/sample-dev/project-1",
      occurredAt: "2026-09-29T12:00:00Z",
      action: null,
      refType: null,
      pushSize: 2,
      pullRequestMerged: null,
    },
  ],
  source: {
    urls: [
      "https://api.github.com/users/sample-dev/events/public?per_page=100&page=1",
    ],
    retrievedAt: "2026-09-30T12:00:00Z",
    pagesFetched: 1,
    coverage: "public-events-up-to-30-days",
    order: "newest-first",
    pageLimit: 3,
  },
} satisfies ActivityResult;

it("renders a concise source-backed snapshot", () => {
  render(
    <ProfileSnapshot
      profile={sampleProfile}
      repositories={repositories}
      activity={activity}
    />,
  );

  expect(
    screen.getByRole("heading", { name: "Sample Developer" }),
  ).toBeInTheDocument();
  expect(screen.getByText("Unavailable")).toBeInTheDocument();
  const projects = screen.getByRole("region", {
    name: "Project proof highlights",
  });
  expect(within(projects).getAllByRole("listitem")).toHaveLength(3);
  expect(
    within(projects).queryByRole("link", { name: "project-4" }),
  ).not.toBeInTheDocument();
  expect(screen.getAllByText("TypeScript")).not.toHaveLength(0);
  expect(screen.getByText("Pushes")).toBeInTheDocument();
  expect(screen.getByRole("link", { name: "Account source" })).toHaveAttribute(
    "href",
    sampleProfile.source.url,
  );
  expect(screen.queryByRole("searchbox")).not.toBeInTheDocument();
});

it("prints on request and keeps failures explicitly unavailable", () => {
  const print = vi.spyOn(window, "print").mockImplementation(() => undefined);
  render(
    <ProfileSnapshot
      profile={sampleProfile}
      repositories={{ kind: "failure", failure: { kind: "timeout" } }}
      activity={{ kind: "failure", failure: { kind: "upstream_error" } }}
    />,
  );

  fireEvent.click(screen.getByRole("button", { name: "Print or save as PDF" }));
  expect(print).toHaveBeenCalledOnce();
  expect(
    screen.getByText(/Repository data was unavailable/),
  ).toBeInTheDocument();
  expect(
    screen.getByText(/Recent activity was unavailable/),
  ).toBeInTheDocument();
  expect(screen.queryByText("0 public events")).not.toBeInTheDocument();
  print.mockRestore();
});
