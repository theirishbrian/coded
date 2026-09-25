# Public repository retrieval

Issue #18 adds server-only `getPublicRepositories(input)` in
`lib/profile/get-repositories.ts`. No public route calls it yet. Both account and
repository loaders share `lib/github/get-json.ts` for HTTP/JSON handling.

## Requests and validation

Normalize usernames using the existing policy. Request
`https://api.github.com/users/{username}/repos` with `type=owner`, `sort=full_name`,
`direction=asc`, `per_page=100` and successive page numbers. Fetch at most three
pages sequentially (300 items before deduplication), with five seconds per request
including response-body reading. Headers/API version match the account boundary.
No credentials, redirects, retries, framework cache or application cache are used.
Invalid input makes no request.

The Link header controls continuation even for a short page. No next link means
the endpoint is exhausted for this traversal. A next link must exactly match the
expected endpoint, username, next page and query values; query order may vary.
Unexpected syntax/relations and duplicate relations fail closed. Requests always
use locally constructed URLs, never the upstream header's destination.

Validate consumed identity, owner, public visibility, safe GitHub URL, text,
nonnegative counts, fork/archive flags and UTC timestamps. Map only Coded fields:
ID, name, owner, URL, nullable description/primary language/star and fork counts,
update/push timestamps, and required fork/archive flags. Preserve missing values
as null and reported zero as zero; discard unrelated fields. Malformed items
reject their entire page. Forks and archives remain labelled, without ranking.

The future caller must verify personal-account eligibility using the existing
account boundary. An empty repository list cannot identify account type;
non-User or mismatched owners in returned items are rejected.

## Results and limitations

| Result                           | Meaning                                                                   |
| -------------------------------- | ------------------------------------------------------------------------- |
| `success` / `endpoint_exhausted` | No next page reported; an empty first page is valid                       |
| `success` / `page_limit`         | Three pages fetched with further pages reported; capped coverage          |
| `partial` / `interrupted`        | Validated page data retained with the safe failure that stopped traversal |
| `failure`                        | No validated page; must not be rendered as an empty account               |

Successful/partial results contain validated page URLs, validated-page count,
last validated page's retrieval time, order, coverage label and page cap.
A valid page with a bad continuation is retained as partial; a malformed body
is excluded entirely. Rate-limit hints remain in the failure object. Processing
stops immediately on failure, with no retry or wait loop.

Duplicate IDs retain the first observation. Pagination is not an atomic snapshot:
renames, transfers and concurrent changes can cause gaps or duplicates. Endpoint
exhaustion is not proof of a complete point-in-time inventory or contribution
history. These are owned public repositories, not all work the person contributed
to. Stars, forks and timestamps do not prove skill, authorship or personal activity.
Primary language is reported metadata, not a language breakdown or proficiency.

## Public integration gate

Before wiring this loader into a page, budget all account/repository requests
together, honor cooldown hints and define caching for complete/capped results
separately from interrupted results. The current profile limiter does not cover
this unused loader. Repeated calls are not globally rate-limited. No token,
paid infrastructure, new dependency or persistence is added.

Tests cover mapping, validation, empty results, pagination/cap/deduplication,
hostile links, partial failures and timeouts including body reads. The existing
account tests guard the shared transport extraction. CI uses synthetic fixtures.
Any separate local live check is recorded in the PR; it does not prove deployment-
host repository retrieval because this loader is not routed publicly.

Official references checked 25 September 2026:
[List repositories for a user](https://docs.github.com/en/rest/repos/repos#list-repositories-for-a-user),
[Pagination](https://docs.github.com/en/rest/using-the-rest-api/using-pagination-in-the-rest-api).
