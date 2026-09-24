# 0002 — Bound public profile lookups within each server instance

Date: 24 September 2026. Scope: Issue #16.

## Decision

The profile route uses Next.js `connection()` to render at request time. The
adapter retains `fetch` with `cache: "no-store"`; it does not use Next.js Data
Cache or persist raw GitHub responses. A server-only module singleton wraps the
adapter with a testable policy over validated Coded models:

- Validate and normalize usernames before lookup. Invalid input makes no request.
- Cache successful results for five minutes from completion, at most 100 entries.
  Preserve the original source/retrieval timestamp; remove expired entries on lookup.
- Share concurrent requests for the same normalized username.
- Allow at most two distinct in-flight requests and 30 upstream starts in a rolling
  hour per instance. Failed starts count too. Return a safe busy state when full.
- Never cache failures or serve expired successes. After GitHub rate limiting,
  pause new upstream starts until the latest of a 60-second minimum, retry hint or
  reset hint. Valid cached successes remain available. Do not retry automatically.

The UI disables submission while a navigation is pending and displays wait/error
states. Browser navigation may retain a displayed snapshot; the visible timestamp
and reload guidance make that freshness explicit. A reload after expiry requests
a new server lookup, subject to the same limits.

## Consequences and limits

This small process-local policy avoids new paid services, credentials and storage.
It reduces repeated upstream work; it is not a distributed rate limiter or abuse
prevention system. Cold starts, deployment changes, workers and regions have
independent caches/budgets. Other tenants may share GitHub's originating-IP quota.
The 30-request budget cannot guarantee the upstream 60-per-hour IP allowance.
Revisit coordinated controls if traffic grows; do not silently add a token or
claim multi-instance protection. No repositories, activity or scoring are added.

## Verification

Controlled-clock tests cover expiry, cache isolation, failures, cooldown, budgets
and concurrent requests. Fixture-backed browser tests exercise the built server;
live preview verification is recorded in the PR, separately from fixture evidence.

References checked: [Next.js connection](https://nextjs.org/docs/app/api-reference/functions/connection),
[Next.js caching](https://nextjs.org/docs/app/guides/caching-without-cache-components),
[GitHub rate limits](https://docs.github.com/en/rest/using-the-rest-api/rate-limits-for-the-rest-api).
