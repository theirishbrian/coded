# Recent public activity

Coded retrieves GitHub's public user-events feed after a public account has been
validated. The activity section is independent from account and repository data:
an activity failure does not remove either of those successful sections.

## Retrieval boundary

- Endpoint: `GET /users/{username}/events/public`.
- Order: GitHub's newest-first order is preserved.
- Page size: 100 events.
- Page limit: three pages, or 300 events.
- Cache: validated complete or capped successes may be reused for five minutes.
- Failures and interrupted results are not cached.
- Requests share the same process-local request budget and rate-limit cooldown as
  account and repository lookups.

GitHub documents two important upstream limits: only events created within the
past 30 days are included, and the endpoint is not real time; latency can range
from 30 seconds to 6 hours. Coded publishes both limits beside the result. See
[GitHub's public user-events endpoint](https://docs.github.com/en/rest/activity/events#list-public-events-for-a-user).

Every page is validated before its events enter the Coded model. IDs, actor,
repository name, timestamp, visibility and the small set of payload fields Coded
uses must be safe and well formed. Pagination destinations are reconstructed
locally and fail closed if GitHub returns an unexpected origin, path or query.
Validated earlier pages remain visible as an explicitly interrupted sample.

## Display and interpretation

The section counts retrieved event categories and displays the newest 12 events.
Categories include pushes, pull requests, issues, releases, stars, forks,
repository/ref creation, reviews, comments and an `other` bucket for safe future
GitHub event types. Each visible event links to its public repository because
GitHub event payloads do not provide one stable browser URL for every event type.

The counts describe API events, not unique contributions. One action can produce
multiple events, push events can contain multiple commits, and public event data
can omit private, organization-limited, older, deleted, offline and non-GitHub
work. A zero or empty response does not establish inactivity. Coded does not turn
events into a streak, rank, quality score, effort estimate or proficiency claim.
