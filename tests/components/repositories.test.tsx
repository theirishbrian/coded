import { render, screen, within } from "@testing-library/react";
import { expect, it } from "vitest";
import { RepositorySection } from "@/components/repository-section";
import type {
  RepositoriesResult,
  PublicRepository,
} from "@/lib/profile/get-repositories";
const repository: PublicRepository = {
  id: 1,
  name: "example-project",
  owner: "sample-dev",
  url: "https://github.com/sample-dev/example-project",
  description: null,
  primaryLanguage: null,
  stars: 0,
  forks: null,
  isFork: true,
  isArchived: true,
  updatedAt: null,
  pushedAt: null,
};
const complete = {
  kind: "success",
  completeness: "endpoint_exhausted",
  repositories: [repository],
  source: {
    urls: [
      "https://api.github.com/users/sample-dev/repos?type=owner&sort=full_name&direction=asc&per_page=100&page=1",
    ],
    retrievedAt: "2026-09-26T12:00:00Z",
    pagesFetched: 1,
    coverage: "owned-public-repositories",
    order: "full-name-ascending",
    pageLimit: 3,
  },
} satisfies RepositoriesResult;
it("shows safe attributed cards, missing values, reported zero and fork/archive labels", () => {
  render(<RepositorySection result={complete} />);
  expect(
    screen.getByRole("region", { name: "Public repositories" }),
  ).toBeInTheDocument();
  expect(screen.getByRole("link", { name: "example-project" })).toHaveAttribute(
    "href",
    repository.url,
  );
  expect(screen.getByText("No description provided.")).toBeInTheDocument();
  expect(screen.getAllByText("Unavailable")).toHaveLength(2);
  expect(screen.getByText("0")).toBeInTheDocument();
  expect(screen.getByText("Fork")).toBeInTheDocument();
  expect(screen.getByText("Archived")).toBeInTheDocument();
  expect(
    screen.getByRole("link", { name: "GitHub source page 1" }),
  ).toHaveAttribute("href", complete.source.urls[0]);
  expect(screen.getByText(/26 Sept 2026/).closest("time")).toHaveAttribute(
    "datetime",
    complete.source.retrievedAt,
  );
});
it("places only the remaining fetched items in a native disclosure", () => {
  const repositories = Array.from({ length: 14 }, (_, i) => ({
    ...repository,
    id: i,
    name: `repo-${i}`,
  }));
  const { container } = render(
    <RepositorySection result={{ ...complete, repositories }} />,
  );
  const details = container.querySelector("details")!;
  expect(details).not.toHaveAttribute("open");
  expect(within(details).getAllByRole("link", { hidden: true })).toHaveLength(
    2,
  );
  expect(screen.getByText("Show 2 more repositories").tagName).toBe("SUMMARY");
  expect(screen.getByText(/First 12 of 14/)).toBeInTheDocument();
});
it("labels capped success without claiming complete coverage", () => {
  render(
    <RepositorySection result={{ ...complete, completeness: "page_limit" }} />,
  );
  expect(
    screen.getByText(/GitHub reports additional pages/),
  ).toBeInTheDocument();
});
it("distinguishes successful empty data from empty interrupted data", () => {
  const { rerender } = render(
    <RepositorySection result={{ ...complete, repositories: [] }} />,
  );
  expect(
    screen.getByText("No owned public repositories were returned by GitHub."),
  ).toBeInTheDocument();
  rerender(
    <RepositorySection
      result={{
        ...complete,
        kind: "partial",
        completeness: "interrupted",
        repositories: [],
        failure: { kind: "timeout" },
      }}
    />,
  );
  expect(
    screen.queryByText("No owned public repositories were returned by GitHub."),
  ).not.toBeInTheDocument();
  expect(screen.getByText(/does not establish/)).toBeInTheDocument();
  expect(
    screen.getByText(/This incomplete result is not cached/),
  ).toBeInTheDocument();
});
it("retains partial cards with the safe interruption and wait message", () => {
  render(
    <RepositorySection
      result={{
        ...complete,
        kind: "partial",
        completeness: "interrupted",
        failure: { kind: "busy", retryAfterSeconds: 90 },
      }}
    />,
  );
  expect(
    screen.getByRole("link", { name: repository.name }),
  ).toBeInTheDocument();
  expect(screen.getByText(/Incomplete results:/)).toBeInTheDocument();
  expect(screen.getByText(/at least 2 minute/)).toHaveTextContent(
    "Nothing retries automatically.",
  );
});
it("presents total failure as unavailable, never as zero repositories", () => {
  render(
    <RepositorySection
      result={{
        kind: "failure",
        failure: {
          kind: "rate_limited",
          retryAfterSeconds: null,
          resetAt: null,
        },
      }}
    />,
  );
  expect(
    screen.getByRole("heading", { name: "Repository data unavailable" }),
  ).toBeInTheDocument();
  expect(screen.getByText(/temporarily limited/)).toBeInTheDocument();
  expect(screen.queryByRole("list")).not.toBeInTheDocument();
  expect(screen.queryByText(/No owned/)).not.toBeInTheDocument();
});
