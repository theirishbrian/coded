import type { ActivityKind, PublicActivityEvent } from "./get-activity";
import { activityKindLabels } from "./summarize-activity";

const DAY_MS = 24 * 60 * 60 * 1000;
const WINDOW_DAYS = 30;

export interface ActivityTimelineCategory {
  kind: ActivityKind;
  label: string;
  count: number;
}

export interface ActivityTimelineDay {
  date: string;
  total: number;
  categories: ActivityTimelineCategory[];
}

export interface ActivityTimelineSummary {
  days: ActivityTimelineDay[];
  maxCount: number;
  activeDayCount: number;
  busiestDays: ActivityTimelineDay[];
}

function utcDay(timestamp: number) {
  const date = new Date(timestamp);
  return Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate());
}

function dateKey(timestamp: number) {
  return new Date(timestamp).toISOString().slice(0, 10);
}

export function summarizeActivityTimeline(
  events: PublicActivityEvent[],
  retrievedAt: string,
): ActivityTimelineSummary | null {
  const retrievedTimestamp = Date.parse(retrievedAt);
  if (!Number.isFinite(retrievedTimestamp)) return null;

  const end = utcDay(retrievedTimestamp);
  const start = end - (WINDOW_DAYS - 1) * DAY_MS;
  const counts = new Map<
    string,
    { total: number; categories: Map<ActivityKind, number> }
  >();

  for (let timestamp = start; timestamp <= end; timestamp += DAY_MS) {
    counts.set(dateKey(timestamp), { total: 0, categories: new Map() });
  }

  for (const event of events) {
    const eventTimestamp = Date.parse(event.occurredAt);
    if (!Number.isFinite(eventTimestamp)) continue;
    const eventDay = utcDay(eventTimestamp);
    if (eventDay < start || eventDay > end) continue;

    const day = counts.get(dateKey(eventDay));
    if (!day) continue;
    day.total += 1;
    day.categories.set(event.kind, (day.categories.get(event.kind) ?? 0) + 1);
  }

  const kinds = Object.keys(activityKindLabels) as ActivityKind[];
  const days = [...counts].map(([date, day]) => ({
    date,
    total: day.total,
    categories: kinds.flatMap((kind) => {
      const count = day.categories.get(kind) ?? 0;
      return count > 0
        ? [{ kind, label: activityKindLabels[kind], count }]
        : [];
    }),
  }));
  const maxCount = Math.max(0, ...days.map(({ total }) => total));

  return {
    days,
    maxCount,
    activeDayCount: days.filter(({ total }) => total > 0).length,
    busiestDays: days
      .filter(({ total }) => total > 0)
      .sort((a, b) => b.total - a.total || b.date.localeCompare(a.date))
      .slice(0, 3),
  };
}
