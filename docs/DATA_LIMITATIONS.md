# Data and metric limitations

Coded shows public account details, a bounded public-activity window and owned
repositories through server-only retrieval boundaries. It does not calculate
quality metrics. A result is a collection of public snapshots, not a complete
record of someone's work.

The [repository loader](GITHUB_REPOSITORIES.md), displayed on profile pages,
retrieves at most 300 owned public repositories. Forks and archives are preserved.
It labels capped/interrupted coverage and deduplicates IDs, but pagination can
still miss changes made during traversal. Owned repositories are not a complete
contribution history; their primary language and timestamps do not prove personal
proficiency or activity.

The [current boundary](GITHUB_PROFILE.md) preserves missing optional values as null
and labels counts as public API reports. GitHub can return zero follower/following
counts for private profiles; reported zero does not prove the actual total is zero.

- Public activity is only a partial record of someone's work. Private, offline,
  non-GitHub and inaccessible contributions are outside this scope. A missing
  public record must not be presented as evidence that no work occurred.
- Missing, unavailable and zero are distinct states. Rate limits, failed requests,
  pagination bounds and account/repository visibility can limit a result. Future
  profiles must continue to expose those limits rather than silently showing zero or a complete history.
- Record the source, retrieval time, time window and any sampling/pagination limits
  for displayed data. Cached information needs a visible freshness policy. Exact
  account snapshots are reused for up to five minutes and show their original
  retrieval time. Failures are not cached. Cache and request budgets are local to
  each server process; cold starts, multiple workers and regions do not share them.
  They cannot guarantee GitHub's IP-wide allowance on shared hosting.
- Repository language usage describes code in repositories. It is not a measure
  of a person's proficiency, and does not by itself establish authorship.
- Commit counts, stars and other activity/popularity signals are not direct
  measures of code quality, effort or engineering ability. Forks, generated files,
  bots, team ownership and contribution attribution need explicit treatment.
- Any future ranking must publish its inputs, formula, exclusions and missing-data
  behaviour. It must be reproducible from its stated inputs and must not claim
  objective developer quality or invent a proficiency score.

Each implementation issue must verify actual GitHub API semantics and limits
against current official documentation. Do not treat this page as an API contract
or claim that a proposed metric is already available.

Primary-language counts summarize this retrieved inventory, including forks and archives, with missing metadata counted separately. They do not measure code volume or every language used; see [language summary](LANGUAGE_SUMMARY.md).

Project highlights use the same bounded inventory and exclude forks and archived
repositories. Their stars/last-push/name order helps discovery; it is not a
quality, authorship, effort or proficiency ranking. Homepage, topic and licence
fields are GitHub-reported repository metadata and may be absent, owner supplied
or inconclusive. See [project proof highlights](PROJECT_HIGHLIGHTS.md).

Recent activity contains at most 300 events from GitHub's available 30-day public
window and can lag by 30 seconds to 6 hours. Event counts are not unique
contribution counts, and an empty response does not establish inactivity. The UI
shows only the newest 12 retrieved events while its category counts cover the
whole retrieved sample. See [recent public activity](PUBLIC_ACTIVITY.md).
