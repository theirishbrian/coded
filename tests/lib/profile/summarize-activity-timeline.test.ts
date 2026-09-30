import { describe, expect, it } from "vitest";
import type { PublicActivityEvent } from "@/lib/profile/get-activity";
import { summarizeActivityTimeline } from "@/lib/profile/summarize-activity-timeline";

function event(
  id: string,
  occurredAt: string,
  kind: PublicActivityEvent["kind"] = "push",
): PublicActivityEvent {
  return {
    id,
    kind,
    repository: "sample-dev/project",
    repositoryUrl: "https://github.com/sample-dev/project",
    occurredAt,
    action: null,
    refType: null,
    pushSize: null,
    pullRequestMerged: null,
  };
}

describe("activity timeline summary", () => {
  it("builds 30 UTC days, category counts and busiest days", () => {
    const result = summarizeActivityTimeline(
      [
        event("1", "2026-09-01T00:00:00Z"),
        event("2", "2026-09-29T08:00:00Z"),
        event("3", "2026-09-29T20:00:00Z", "issue"),
        event("4", "2026-09-30T09:00:00Z", "release"),
        event("old", "2026-08-31T23:59:59Z"),
        event("future", "2026-10-01T00:00:00Z"),
        event("invalid", "not-a-date"),
      ],
      "2026-09-30T12:00:00Z",
    );

    expect(result).not.toBeNull();
    expect(result?.days).toHaveLength(30);
    expect(result?.days[0]).toMatchObject({ date: "2026-09-01", total: 1 });
    expect(result?.days.at(-1)).toMatchObject({
      date: "2026-09-30",
      total: 1,
    });
    expect(result?.days.find(({ date }) => date === "2026-09-29")).toEqual({
      date: "2026-09-29",
      total: 2,
      categories: [
        { kind: "push", label: "Pushes", count: 1 },
        { kind: "issue", label: "Issues", count: 1 },
      ],
    });
    expect(result).toMatchObject({
      maxCount: 2,
      activeDayCount: 3,
      busiestDays: [
        { date: "2026-09-29", total: 2 },
        { date: "2026-09-30", total: 1 },
        { date: "2026-09-01", total: 1 },
      ],
    });
  });

  it("represents an empty window and rejects an invalid retrieval time", () => {
    const empty = summarizeActivityTimeline([], "2026-09-30T12:00:00Z");
    expect(empty).toMatchObject({
      maxCount: 0,
      activeDayCount: 0,
      busiestDays: [],
    });
    expect(empty?.days).toHaveLength(30);
    expect(empty?.days.every(({ total }) => total === 0)).toBe(true);
    expect(summarizeActivityTimeline([], "not-a-date")).toBeNull();
  });
});
