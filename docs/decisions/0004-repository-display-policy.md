# 0004 — Display repositories under one shared request policy

Date: 26 September 2026. Scope: Issue #20. Extends decisions 0002 and 0003.

## Decision

The profile route first resolves a validated personal account. Only then does a
separate async Server Component retrieve repositories for its canonical username.
A Suspense boundary lets account details and the lookup form remain usable while
repositories load. Normal repository failures render inside that section.

`lib/profile/lookup.ts` owns one process-local service instance. Its account and
repository adapters receive the same transport gate. Every actual upstream start,
including each repository page and failed attempt, consumes one of 30 starts in a
rolling hour; at most two requests run concurrently. Check before each page, not
once per lookup. No retry or waiting queue is added. A mid-pagination refusal
retains validated pages and the account, labelled incomplete. A rate limit seen
on any page pauses all new starts for the longest of 60 seconds, Retry-After and
reset time. Cache hits remain available during cooldown.

Account and repository models have separate five-minute success caches, each
bounded to 100 entries, with same-key in-flight sharing and normalized keys.
Expiry is measured from completion; original retrieval timestamps are preserved.
Capped successes are cached with their coverage. Failures and interrupted results
are never cached, and expired data is never served as fresh. A repository failure
does not evict the account cache. The raw adapters do not independently cache or
budget requests: public callers must use this service.

Keep `connection()` ahead of the route lookup and `fetch` with `cache: "no-store"`.
There is no Next.js Data Cache, cached route output, `use cache` or Cache Components
configuration. Module memory is the only server cache. Native browser/back navigation
can retain a displayed snapshot; labels and reload guidance describe freshness.
Official Next.js connection semantics were checked on 26 September 2026, and the
production build plus fixture browser flows verify the request-time route.

Cards retain GitHub's full-name ascending order, without ranking. Render the first
12 and put the remaining already-fetched items inside native `details`/`summary`.
This provides keyboard disclosure without further requests or a client component.
Next.js streamed sections require JavaScript to reveal their initial content.
Without JavaScript, account details and the native form still work; the section
provides a noscript link to the account's repositories on GitHub.
Show null separately from zero, fork/archive labels, page sources and retrieval
time; distinguish exhausted-empty, unavailable, capped and interrupted coverage.

## Limits and verification

Cold starts, workers, deployments and regions have independent memory. The gate
is not a distributed quota or abuse-prevention guarantee; shared outbound IPs may
reach GitHub limits first. No token, paid service, dependency or durable storage
is introduced. Pagination remains non-atomic and bounded to three pages.

Controlled transport/clock tests cover every-page budgets, nested cooldowns,
cache separation/expiry, deduplication and eligibility. Component tests cover
coverage and missing values. Browser fixtures cover streaming, disclosure with no
new request, failures, empty/partial results, mobile layout and keyboard/no-JS
use. Live deployment-host connectivity must also be checked on the PR preview;
record that evidence in the PR rather than treating fixtures as production proof.

References: [Next.js connection](https://nextjs.org/docs/app/api-reference/functions/connection),
[Next.js caching](https://nextjs.org/docs/app/guides/caching-without-cache-components).
