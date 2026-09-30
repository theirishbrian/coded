# Decision 0006: bounded public activity

- Status: accepted
- Date: 2026-09-30
- Issue: #44

## Context

Coded needs a current public-work view without implying a complete contribution
history or requiring authentication, persistent storage or an opaque score.
GitHub's public user-events endpoint supplies suitable source data, but it is
limited to the previous 30 days, can lag by up to six hours and can paginate.

## Decision

Add a third server-only adapter with its own five-minute success cache. Retrieve
at most three 100-event pages through the shared request policy. Validate every
page and locally reconstruct accepted pagination URLs. Preserve validated earlier
pages as partial data if a later request or continuation fails.

Render activity in an independent Suspense boundary before repositories. Summarize
all retrieved categories and show the newest 12 events. Link each visible item to
its public repository, publish retrieval and sampling limits, and distinguish an
empty result from evidence of inactivity.

## Consequences

Successful profiles can make one to three additional unauthenticated GitHub
requests. Concurrent activity and repository work still passes through the
two-request shared gate. Activity can fail without removing the account or
repository sections. Coded gains a useful recency signal without accounts,
storage, a contribution calendar or a developer score.
