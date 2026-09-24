# Public GitHub profile boundary

Issue #14 adds `getPublicProfile(input)` in `lib/profile/get-profile.ts`. It is a
server-only function. Issue #16 connects it to `/u/[username]` through the
`lookupProfile` cache/request-policy wrapper. The base function returns a
discriminated result: `success` with a Coded-owned profile, or a failure `kind`.
The transport lives in `lib/github/get-user.ts`; runtime payload validation lives
in `lib/github/user.ts`. The `server-only` marker prevents client imports in Next.js.

## Request contract

Input must be a string. Trim whitespace and lowercase it, then accept 1–39 ASCII
letters/digits with single interior hyphens. This is Coded's initial public-handle
policy: URLs, managed-account aliases with underscores and bot handles with brackets
are not accepted. A syntactically accepted handle can still be unavailable.

Make one request to `https://api.github.com/users/{username}` with:

- `Accept: application/vnd.github+json`.
- `X-GitHub-Api-Version: 2026-03-10` (pinned to the current documented version).
- `User-Agent: Coded`.

No Authorization header, token or environment variable is used. The origin is
fixed and redirects are not followed. An unexpected redirect is `upstream_error`;
the caller may ask for the account's current handle rather than following arbitrary
URLs. There are no automatic retries. A five-second abort deadline covers both
the request and response-body consumption.

## Model and failures

The profile contains the numeric account ID, `User` type, canonical returned login,
display name, biography, avatar/profile URLs and public repository/follower/following
counts. Unknown upstream fields are dropped. Missing or null optional text/counts
become null; genuine API-reported zero stays zero. Invalid present values fail
validation instead of being coerced. Identity and URLs are required. Profile URLs
must be HTTPS on github.com and match the returned login; avatar URLs must be
HTTPS on github.com or avatars.githubusercontent.com, without URL credentials.

Organizations and bots returned by the endpoint are `unsupported_account`.
Unknown types and malformed consumed fields are `malformed_response`.

| Result                | Meaning                                                                         |
| --------------------- | ------------------------------------------------------------------------------- |
| `invalid_input`       | Rejected before any request                                                     |
| `not_found`           | HTTP 404; may also mean unavailable/inaccessible, not proof of nonexistence     |
| `unsupported_account` | Known organization or bot account, outside this profile scope                   |
| `access_denied`       | HTTP 401 or 403 without a recognized rate-limit signal                          |
| `rate_limited`        | HTTP 429, or 403 with exhausted quota, valid retry header or rate-limit message |
| `timeout`             | Five-second deadline expired                                                    |
| `network_error`       | Transport or body-read failure                                                  |
| `upstream_error`      | Other unexpected HTTP response, including redirects                             |
| `malformed_response`  | Invalid JSON or invalid consumed fields in a successful response                |

Rate-limited results include nullable `retryAfterSeconds` and UTC ISO `resetAt`,
parsed from integer delta-seconds and epoch-seconds headers respectively. Negative,
noninteger or unrepresentable values are ignored. These are upstream hints, not
instructions to retry automatically. An unrecognized 403 is conservatively access
denied. No raw upstream error bodies or exception messages reach callers.

## Freshness and coverage

Every adapter request explicitly uses `cache: "no-store"`. The public route's
wrapper caches only successful Coded models for five minutes, preserving the
source endpoint, retrieval completion time and `coverage: "public-api-reported"`.
There is no stale fallback or cached failure. The wrapper shares same-username
in-flight requests and bounds upstream starts/concurrency, including a cooldown
after rate limits. See [decision 0002](decisions/0002-public-lookup-cache.md) for
exact limits and the lack of cross-instance coordination.

Unauthenticated GitHub requests share a primary allowance of 60 per hour per
originating IP; secondary limits also apply. Shared hosting may share this allowance.
Private profiles can return zero follower/following counts to unauthenticated
callers. Those values cannot establish actual totals or absence of work. Public
repository counts are not repository enumeration, contribution counts or quality
metrics. No private data, repositories or activity history are retrieved.

## Validation

`tests/lib/profile/get-profile.test.ts` exercises the boundary using a synthetic
fixture in `tests/fixtures/github/user.json`, mocked fetch and controlled timers.
Tests and builds never call GitHub and need no credentials. The test-only mock of
`server-only` allows ordinary Node execution; Next.js enforces that marker in app
builds. Fixture browser tests cover the route but cannot prove live GitHub
retrieval. On 24 September 2026, a separate one-off local
check called the actual function against the public `theirishbrian` account and
verified successful mapping and the expected username/profile URL. It used no
token; the temporary live test was removed afterward. This confirms local live
retrieval, not deployment-host networking or every upstream failure mode.

Official references checked for this implementation:
[Get a user](https://docs.github.com/en/rest/users/users#get-a-user),
[REST rate limits](https://docs.github.com/en/rest/using-the-rest-api/rate-limits-for-the-rest-api),
[Next.js server-only modules](https://nextjs.org/docs/app/getting-started/server-and-client-components#preventing-environment-poisoning).
