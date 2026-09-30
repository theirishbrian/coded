import { render, screen, within } from "@testing-library/react";
import { expect, it } from "vitest";
import { ActivitySection } from "@/components/activity-section";
import type { PublicActivityEvent } from "@/lib/profile/get-activity";

const base: PublicActivityEvent = {
  id: "1",
  kind: "push",
  repository: "sample-dev/project",
  repositoryUrl: "https://github.com/sample-dev/project",
  occurredAt: "2026-09-29T14:30:00Z",
  action: null,
  refType: null,
  pushSize: 3,
  pullRequestMerged: null,
};
const complete = {
  kind: "success" as const,
  completeness: "endpoint_exhausted" as const,
  events: [
    base,
    {
      ...base,
      id: "2",
      kind: "pull_request" as const,
      action: "closed",
      pullRequestMerged: true,
    },
  ],
  source: {
    urls: [
      "https://api.github.com/users/sample-dev/events/public?per_page=100&page=1",
    ],
    retrievedAt: "2026-09-30T12:00:00Z",
    pagesFetched: 1,
    coverage: "public-events-up-to-30-days" as const,
    order: "newest-first" as const,
    pageLimit: 3 as const,
  },
};

it("renders a transparent summary and readable source-linked timeline", () => {
  render(<ActivitySection result={complete} />);
  const section = screen.getByRole("region", {
    name: "Recent public activity",
  });
  expect(section).toHaveAttribute("id", "recent-activity");
  expect(
    within(section).getByRole("link", { name: "Back to profile" }),
  ).toHaveAttribute("href", "#profile-top");
  expect(section).toHaveTextContent("previous 30 days");
  expect(section).toHaveTextContent("30 seconds to 6 hours late");
  expect(section).toHaveTextContent("not a complete contribution history");
  expect(
    within(section).getByRole("heading", {
      name: "30-day public-event timeline",
    }),
  ).toBeInTheDocument();
  expect(section).toHaveTextContent("API event volume rather than commits");
  expect(section).toHaveTextContent(
    "first and last calendar days can be partial",
  );
  expect(section).toHaveTextContent("Activity appears on 1 of 30 UTC days");
  expect(
    within(section).getByText("View exact daily counts"),
  ).toBeInTheDocument();
  expect(
    within(section).getByRole("list", {
      name: "Retrieved public events by UTC day",
    }).children,
  ).toHaveLength(30);
  expect(section).toHaveTextContent("Pushes1");
  expect(section).toHaveTextContent("Pull requests1");
  expect(section).toHaveTextContent("Pushed 3 commits");
  expect(section).toHaveTextContent("Merged a pull request");
  expect(
    within(section).getAllByRole("link", {
      name: "View sample-dev/project on GitHub",
    }),
  ).toHaveLength(2);
});

it("distinguishes empty, capped, interrupted and unavailable activity", () => {
  const { rerender } = render(
    <ActivitySection result={{ ...complete, events: [] }} />,
  );
  expect(
    screen.getByText(/does not establish that the person was inactive/),
  ).toBeInTheDocument();

  rerender(
    <ActivitySection result={{ ...complete, completeness: "page_limit" }} />,
  );
  expect(screen.getByText(/newest 300 public events/)).toBeInTheDocument();

  rerender(
    <ActivitySection
      result={{
        ...complete,
        kind: "partial",
        completeness: "interrupted",
        failure: { kind: "timeout" },
      }}
    />,
  );
  expect(screen.getByText(/Incomplete results/)).toBeInTheDocument();
  expect(screen.getByText(/not cached/)).toBeInTheDocument();

  rerender(
    <ActivitySection
      result={{ kind: "failure", failure: { kind: "timeout" } }}
    />,
  );
  expect(
    screen.getByRole("heading", { name: "Activity data unavailable" }),
  ).toBeInTheDocument();
});

it("keeps the timeline concise while summary counts cover the retrieved sample", () => {
  const events = Array.from({ length: 13 }, (_, index) => ({
    ...base,
    id: String(index + 1),
  }));
  render(<ActivitySection result={{ ...complete, events }} />);
  const section = screen.getByRole("region", {
    name: "Recent public activity",
  });
  expect(section).toHaveTextContent("Pushes13");
  expect(section).toHaveTextContent("Showing 12 of 13 retrieved events");
  expect(
    within(section).getAllByRole("link", {
      name: "View sample-dev/project on GitHub",
    }),
  ).toHaveLength(12);
});
