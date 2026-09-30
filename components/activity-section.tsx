import type { GitHubFailure } from "@/lib/github/get-json";
import type {
  ActivityResult,
  PublicActivityEvent,
} from "@/lib/profile/get-activity";
import { summarizeActivity } from "@/lib/profile/summarize-activity";

function failureMessage(failure: GitHubFailure) {
  if (failure.kind === "rate_limited")
    return "GitHub has temporarily limited activity lookups.";
  if (failure.kind === "busy")
    return "This server has reached its lookup limit.";
  return "Recent activity could not be retrieved. Please try again later.";
}

function eventDescription(event: PublicActivityEvent) {
  switch (event.kind) {
    case "push":
      return event.pushSize === null
        ? "Pushed commits"
        : `Pushed ${event.pushSize} commit${event.pushSize === 1 ? "" : "s"}`;
    case "pull_request":
      if (event.pullRequestMerged) return "Merged a pull request";
      if (event.action === "opened") return "Opened a pull request";
      if (event.action === "reopened") return "Reopened a pull request";
      if (event.action === "closed") return "Closed a pull request";
      return "Updated a pull request";
    case "issue":
      if (event.action === "opened") return "Opened an issue";
      if (event.action === "reopened") return "Reopened an issue";
      if (event.action === "closed") return "Closed an issue";
      return "Updated an issue";
    case "release":
      return event.action === "published"
        ? "Published a release"
        : "Updated a release";
    case "star":
      return "Starred a repository";
    case "fork":
      return "Forked a repository";
    case "create":
      return event.refType === "repository"
        ? "Created a repository"
        : event.refType
          ? `Created a ${event.refType}`
          : "Created a repository reference";
    case "review":
      return "Reviewed a pull request";
    case "comment":
      return "Commented on public work";
    default:
      return "Recorded public GitHub activity";
  }
}

function FailureNotice({ failure }: { failure: GitHubFailure }) {
  return (
    <p className="my-4 text-sm leading-relaxed text-[#ffb5a7]">
      {failureMessage(failure)}
      {"retryAfterSeconds" in failure &&
        failure.retryAfterSeconds !== null &&
        ` Suggested wait: at least ${Math.max(1, Math.ceil(failure.retryAfterSeconds / 60))} minute(s).`}
      {" Nothing retries automatically."}
    </p>
  );
}

export function ActivitySection({ result }: { result: ActivityResult }) {
  const timeline = result.kind === "failure" ? [] : result.events.slice(0, 12);
  const summary =
    result.kind === "failure" ? [] : summarizeActivity(result.events);
  return (
    <section
      aria-labelledby="activity-heading"
      className="my-12 border-t border-white/15 pt-10"
    >
      <p className="font-mono text-xs uppercase tracking-widest text-[#d3ef8b]">
        A time-bounded public snapshot
      </p>
      <h2
        id="activity-heading"
        className="mt-2 text-2xl font-semibold tracking-tight sm:text-3xl"
      >
        Recent public activity
      </h2>
      <p className="my-4 max-w-3xl text-sm leading-relaxed text-[#b9beb6]">
        Public events currently returned by GitHub, limited by GitHub to the
        previous 30 days. Events may arrive 30 seconds to 6 hours late. This is
        not a complete contribution history or a measure of effort, quality or
        developer skill.
      </p>
      {result.kind === "failure" ? (
        <>
          <h3 className="font-semibold">Activity data unavailable</h3>
          <FailureNotice failure={result.failure} />
        </>
      ) : (
        <>
          {result.completeness === "page_limit" && (
            <p className="my-4 font-semibold text-[#d3ef8b]">
              Limited to the newest 300 public events. GitHub reports additional
              pages within its available window.
            </p>
          )}
          {result.kind === "partial" && (
            <>
              <p className="my-4 font-semibold">
                Incomplete results: showing only events retrieved before the
                lookup stopped.
              </p>
              <FailureNotice failure={result.failure} />
            </>
          )}
          {result.events.length === 0 ? (
            <p className="my-6 max-w-3xl leading-relaxed">
              GitHub returned no public events in its available window. This
              does not establish that the person was inactive: private,
              organization-limited, offline and older work is outside this view.
            </p>
          ) : (
            <>
              <dl className="my-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {summary.map(({ kind, label, count }) => (
                  <div
                    key={kind}
                    className="rounded-sm border border-white/15 bg-white/[0.025] p-4"
                  >
                    <dt className="text-sm text-[#b9beb6]">{label}</dt>
                    <dd className="mt-1 text-2xl font-semibold">{count}</dd>
                  </div>
                ))}
              </dl>
              <h3 className="text-lg font-semibold">Newest retrieved events</h3>
              <p className="mt-2 text-sm text-[#b9beb6]">
                Showing {timeline.length} of {result.events.length} retrieved
                event{result.events.length === 1 ? "" : "s"}.
              </p>
              <ol className="mt-4 divide-y divide-white/10 rounded-sm border border-white/15">
                {timeline.map((event) => (
                  <li
                    key={event.id}
                    className="grid gap-2 p-4 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-center"
                  >
                    <div className="min-w-0">
                      <p className="font-semibold">
                        {eventDescription(event)} in{" "}
                        <a
                          className="break-words text-[#d3ef8b] underline underline-offset-4"
                          href={event.repositoryUrl}
                          aria-label={`View ${event.repository} on GitHub`}
                        >
                          {event.repository}
                        </a>
                      </p>
                    </div>
                    <time
                      className="text-sm text-[#b9beb6]"
                      dateTime={event.occurredAt}
                    >
                      {new Intl.DateTimeFormat("en-GB", {
                        dateStyle: "medium",
                        timeStyle: "short",
                        timeZone: "UTC",
                      }).format(new Date(event.occurredAt))}{" "}
                      UTC
                    </time>
                  </li>
                ))}
              </ol>
            </>
          )}
          <p className="mt-6 text-sm leading-relaxed text-[#b9beb6]">
            Retrieved{" "}
            <time dateTime={result.source.retrievedAt}>
              {new Intl.DateTimeFormat("en-GB", {
                dateStyle: "medium",
                timeStyle: "short",
                timeZone: "UTC",
              }).format(new Date(result.source.retrievedAt))}{" "}
              UTC
            </time>{" "}
            from {result.source.pagesFetched} page(s).{" "}
            {result.kind === "success"
              ? "Results may be reused for up to five minutes; reload after that to request a fresh view."
              : "This incomplete result is not cached."}
          </p>
          <ul className="mt-2 flex flex-wrap gap-x-6 text-sm text-[#b9beb6]">
            {result.source.urls.map((url, index) => (
              <li key={url}>
                <a
                  className="inline-flex min-h-11 items-center underline underline-offset-4"
                  href={url}
                >
                  GitHub activity source page {index + 1}
                </a>
              </li>
            ))}
          </ul>
        </>
      )}
    </section>
  );
}
