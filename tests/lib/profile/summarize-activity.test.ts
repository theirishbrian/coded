import { expect, it } from "vitest";
import type { PublicActivityEvent } from "@/lib/profile/get-activity";
import { summarizeActivity } from "@/lib/profile/summarize-activity";

const event = (kind: PublicActivityEvent["kind"]): PublicActivityEvent => ({
  id: kind,
  kind,
  repository: "sample-dev/project",
  repositoryUrl: "https://github.com/sample-dev/project",
  occurredAt: "2026-09-29T14:30:00Z",
  action: null,
  refType: null,
  pushSize: null,
  pullRequestMerged: null,
});

it("summarizes only observed public event types in a stable order", () => {
  expect(
    summarizeActivity([
      event("comment"),
      event("push"),
      event("pull_request"),
      event("push"),
    ]),
  ).toEqual([
    { kind: "push", label: "Pushes", count: 2 },
    { kind: "pull_request", label: "Pull requests", count: 1 },
    { kind: "comment", label: "Comments", count: 1 },
  ]);
});
