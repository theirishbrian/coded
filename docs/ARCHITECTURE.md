# Architecture and data boundaries

## Implemented today

Coded has a prerendered homepage and a request-time `/u/[username]` profile page.
The username form is a Client Component for validation and pending feedback; its
native GET fallback uses `/lookup` to redirect to the same profile route.
The shared shell includes the skip link, header and footer. Profile rendering
stays on the server, including error states and data attribution.
Each successful profile also exposes dynamic page metadata and a generated
1200×630 social card from the same validated account model. A small client
boundary invokes the browser share sheet or copies the canonical profile URL;
it does not send data or add a Coded social network.

The separate server-only [public profile boundary](GITHUB_PROFILE.md) now validates
username input, retrieves one public GitHub account, validates the external payload
and maps it to a Coded-owned model with explicit failures and coverage metadata.
The profile route calls this boundary through a process-local cache and request
policy. `lib/github/` owns transport and validation; `lib/profile/` owns the
caller-facing model and lookup policy.

A separate [repository loader](GITHUB_REPOSITORIES.md) retrieves up to three pages
of owned public repositories with validated models and explicit capped/partial
coverage. After account validation, a separate Suspense section renders repositories. Both adapters share a per-request budget and cooldown, with independent success caches.

The request path is browser → Next.js profile route → lookup policy → GitHub
adapter → validated Coded model → attributed profile. `connection()` keeps the
profile below the request-time boundary; builds do not request GitHub data.
No credentials or environment variables are required. CI uses fixtures for both
unit/component tests and full browser flows; see [testing](TESTING.md) and [CI](CI.md).

## v0.1 flow

1. A visitor submits a public GitHub username through the profile UI.
2. Server-side input validation accepts a valid username or returns a useful error.
3. A GitHub adapter retrieves public data and handles pagination, timeouts,
   rate limits and unavailable responses. Any token stays on the server.
4. Validation and transformation produce Coded-owned profile models with explicit
   missing-data and coverage information.
5. A pure, separately testable calculation summarizes repository primary languages.
6. The profile UI presents the result, sources, coverage and loading/error/empty states.

These boundaries guide the full flow; account lookup and basic profile UI exist:

| Location       | Responsibility                                    |
| -------------- | ------------------------------------------------- |
| `app/`         | Routes, page composition and server orchestration |
| `components/`  | Reusable UI when real reuse appears               |
| `lib/github/`  | GitHub transport and external payload validation  |
| `lib/profile/` | Transformation into internal profile models       |
| `lib/scoring/` | Later transparent ranking, if separately scoped   |

`app/`, `components/`, `lib/github/` and `lib/profile/` exist today. Add scoring only when scoped.
Do not let raw GitHub payloads or server credentials cross directly into UI
components. Keep transformations independent of network calls so fixture-based
tests can cover missing and malformed data. Add client boundaries only where
browser interaction requires them.

## Decisions and limits

Use strict TypeScript, npm's committed lockfile, Vitest and selective UI dependencies.
Playwright verifies browser flows. Add dependencies only for scoped work.
Vercel hosts the application; see [deployment details](DEPLOYMENT.md).
Authentication, private repositories, a database,
AI, payments and social features are outside v0.1.

The initial account boundary uses no-store requests and a five-second timeout;
its narrow contract is documented in [GITHUB_PROFILE.md](GITHUB_PROFILE.md).
The public route adds a five-minute success cache, same-key request sharing and
per-instance request limits; see [decision 0002](decisions/0002-public-lookup-cache.md).
Repository pagination is bounded by [decision 0003](decisions/0003-bounded-repository-retrieval.md).
Repository display and combined budgets are defined in [decision 0004](decisions/0004-repository-display-policy.md). Other endpoints and ranking remain unimplemented.
Record material decisions in `docs/decisions/`
when made; do not create speculative architecture or claim a finished scoring model.
Use the [data limitations](DATA_LIMITATIONS.md) as requirements for later work.

The [language summary](LANGUAGE_SUMMARY.md) is a pure transformation of the already retrieved repository models and introduces no fetching or storage. The repository list uses a client boundary for local search, inclusion filters and sorting. Those controls receive the bounded server result and never call GitHub themselves.
