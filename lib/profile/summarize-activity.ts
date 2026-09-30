import type { ActivityKind, PublicActivityEvent } from "./get-activity";

export const activityKindLabels: Record<ActivityKind, string> = {
  push: "Pushes",
  pull_request: "Pull requests",
  issue: "Issues",
  release: "Releases",
  star: "Stars given",
  fork: "Forks",
  create: "Repositories and refs created",
  review: "Reviews",
  comment: "Comments",
  other: "Other public events",
};

export function summarizeActivity(events: PublicActivityEvent[]) {
  const counts = new Map<ActivityKind, number>();
  for (const event of events)
    counts.set(event.kind, (counts.get(event.kind) ?? 0) + 1);
  return (Object.keys(activityKindLabels) as ActivityKind[])
    .map((kind) => ({
      kind,
      label: activityKindLabels[kind],
      count: counts.get(kind) ?? 0,
    }))
    .filter(({ count }) => count > 0);
}
