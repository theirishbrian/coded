import type { PublicActivityEvent } from "@/lib/profile/get-activity";
import {
  summarizeActivityTimeline,
  type ActivityTimelineDay,
} from "@/lib/profile/summarize-activity-timeline";

const dayFormatter = new Intl.DateTimeFormat("en-GB", {
  day: "numeric",
  month: "short",
  year: "numeric",
  timeZone: "UTC",
});

function dayLabel(day: ActivityTimelineDay) {
  const categories = day.categories
    .map(({ label, count }) => `${label}: ${count}`)
    .join(", ");
  const total = `${day.total} public event${day.total === 1 ? "" : "s"}`;
  return `${dayFormatter.format(new Date(`${day.date}T00:00:00Z`))}: ${total}${categories ? ` (${categories})` : ""}`;
}

export function ActivityTimeline({
  events,
  retrievedAt,
}: {
  events: PublicActivityEvent[];
  retrievedAt: string;
}) {
  const timeline = summarizeActivityTimeline(events, retrievedAt);
  if (!timeline) return null;

  const start = timeline.days.at(0);
  const end = timeline.days.at(-1);
  if (!start || !end) return null;

  return (
    <figure
      aria-labelledby="activity-timeline-heading"
      className="my-6 rounded-sm border border-white/15 bg-white/[0.025] p-4 sm:p-5"
    >
      <figcaption>
        <h3 id="activity-timeline-heading" className="text-lg font-semibold">
          30-day public-event timeline
        </h3>
        <p className="mt-2 max-w-3xl text-sm leading-relaxed text-[#b9beb6]">
          One bar per UTC day, ending on the retrieval date. Each retrieved
          GitHub event counts once, so this shows API event volume rather than
          commits, effort, consistency or quality. The first and last calendar
          days can be partial.
        </p>
      </figcaption>

      <ol
        aria-label="Retrieved public events by UTC day"
        className="mt-5 grid h-36 grid-cols-[repeat(30,minmax(3px,1fr))] items-end gap-1 border-b border-white/20"
      >
        {timeline.days.map((day) => {
          const height =
            day.total === 0 || timeline.maxCount === 0
              ? "1px"
              : `${Math.max(8, (day.total / timeline.maxCount) * 100)}%`;
          const label = dayLabel(day);
          return (
            <li
              key={day.date}
              aria-label={label}
              title={label}
              className="flex h-full min-w-0 items-end"
            >
              <span
                aria-hidden="true"
                className={`block w-full rounded-t-sm ${
                  day.total > 0 ? "bg-[#d3ef8b]" : "bg-white/20"
                }`}
                style={{ height }}
              />
            </li>
          );
        })}
      </ol>

      <div className="mt-2 flex justify-between gap-4 text-xs text-[#b9beb6]">
        <time dateTime={start.date}>
          {dayFormatter.format(new Date(`${start.date}T00:00:00Z`))}
        </time>
        <time dateTime={end.date}>
          {dayFormatter.format(new Date(`${end.date}T00:00:00Z`))}
        </time>
      </div>

      <p className="mt-4 text-sm leading-relaxed text-[#b9beb6]">
        Activity appears on {timeline.activeDayCount} of 30 UTC days. Highest
        retrieved daily count: {timeline.maxCount}.
      </p>
      {timeline.busiestDays.length > 0 && (
        <p className="mt-2 text-sm leading-relaxed">
          <span className="font-semibold">Most active retrieved days:</span>{" "}
          {timeline.busiestDays.map((day, index) => (
            <span key={day.date}>
              {index > 0 && "; "}
              <time dateTime={day.date}>
                {dayFormatter.format(new Date(`${day.date}T00:00:00Z`))}
              </time>{" "}
              ({day.total})
            </span>
          ))}
          .
        </p>
      )}

      <details className="mt-4 text-sm">
        <summary className="inline-flex min-h-11 cursor-pointer items-center font-semibold text-[#d3ef8b] underline underline-offset-4">
          View exact daily counts
        </summary>
        <ol className="mt-2 grid gap-x-8 gap-y-2 border-t border-white/10 pt-3 sm:grid-cols-2">
          {timeline.days.map((day) => (
            <li
              key={day.date}
              className="flex justify-between gap-4 text-[#b9beb6]"
            >
              <time dateTime={day.date}>
                {dayFormatter.format(new Date(`${day.date}T00:00:00Z`))}
              </time>
              <span className="text-right">{day.total}</span>
            </li>
          ))}
        </ol>
      </details>
    </figure>
  );
}
