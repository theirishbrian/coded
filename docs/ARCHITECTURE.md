# Architecture and data boundaries

## Implemented today

Coded is a single Next.js App Router homepage. `app/layout.tsx` provides the
document, metadata and global CSS; `app/page.tsx` is a synchronous Server Component
with static content and a link to this repository. Tailwind styles and a local
icon complete the page. There are no Client Components, application API routes,
GitHub requests, persistence, authentication or profile generation.

The current request path is browser → Next.js → static homepage. The production
build prerenders the homepage. Nothing in the app requires environment variables
or credentials. Tests render the homepage in jsdom, while CI checks formatting,
lint, types, tests and the production build; see [testing](TESTING.md) and [CI](CI.md).

## Planned v0.1 flow — not implemented

1. A visitor submits a public GitHub username through the profile UI.
2. Server-side input validation accepts a valid username or returns a useful error.
3. A GitHub adapter retrieves public data and handles pagination, timeouts,
   rate limits and unavailable responses. Any token stays on the server.
4. Validation and transformation produce Coded-owned profile models with explicit
   missing-data and coverage information.
5. Pure, separately testable calculations derive any agreed metrics or ranking.
6. The profile UI presents the result, sources, coverage and loading/error/empty states.

These are boundaries for later issues, not existing modules or an agreed API schema:

| Location       | Responsibility                                                  |
| -------------- | --------------------------------------------------------------- |
| `app/`         | Routes, page composition and server orchestration               |
| `components/`  | Reusable UI when real reuse appears                             |
| `lib/github/`  | GitHub transport and external payload validation                |
| `lib/profile/` | Transformation into internal profile models                     |
| `lib/scoring/` | Documented, deterministic calculations independent of transport |

Only `app/` exists today. Add the other directories when they contain required work.
Do not let raw GitHub payloads or server credentials cross directly into UI
components. Keep transformations independent of network calls so fixture-based
tests can cover missing and malformed data. Add client boundaries only where
browser interaction requires them.

## Decisions and limits

Use strict TypeScript, npm's committed lockfile, Vitest and selective UI dependencies.
Playwright, Zod, charts and shadcn/ui are future tools, not installed capabilities.
Vercel deployment is Issue #6. Authentication, private repositories, a database,
AI, payments and social features are outside v0.1.

Caching duration, API endpoint selection, pagination limits, profile schema and
ranking formulas remain undecided. Record material decisions in `docs/decisions/`
when made; do not create speculative architecture or claim a finished scoring model.
Use the [data limitations](DATA_LIMITATIONS.md) as requirements for later work.
