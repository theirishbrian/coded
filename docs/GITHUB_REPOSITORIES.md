# Public repository retrieval

Issue #18 adds server-only `getPublicRepositories(input)` in
`lib/profile/get-repositories.ts`. Issue #20 connects it through the shared profile service. Both account and
repository loaders share `lib/github/get-json.ts` for HTTP/JSON handling.

## Requests and validation

Normalize usernames using the existing policy. Request
`https://api.github.com/users/{username}/repos` with `type=owner`, `sort=full_name`,
`direction=asc`, `per_page=100` and successive page numbers. Fetch at most three
pages sequentially (300 items before deduplication), with five seconds per request
including response-body reading. Headers/API version match the account boundary.
The raw loader uses no credentials, redirects, retries or cache. The public service supplies the shared request gate and a separate success cache.
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

The public service verifies personal-account eligibility using the existing
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

## Public integration

The public service budgets account requests and every repository page together.
Its independent account/repository caches retain only successes for five minutes;
capped successes keep their labels, interrupted results and failures are not cached.
Cooldown applies even when rate limiting interrupts a later page. See
[decision 0004](decisions/0004-repository-display-policy.md) for exact controls and
multi-instance limits. No token, paid infrastructure or persistence is added.

The UI initially shows 12 cards, with native disclosure for the remaining fetched
items. Client-side controls search the already retrieved name, description and
primary-language fields; include or exclude forks and archives; and sort by the
source order, update time or star count. Controls never trigger another request.
The visible result count and active sort explanation prevent filters or popularity
ordering from being mistaken for complete coverage or proficiency. Without
JavaScript, the original source-ordered list and native disclosure remain available.
Explicit empty/unavailable/capped/partial states, source links and retrieval time
remain visible. Normal tests use synthetic fixtures; live preview evidence is
recorded in the PR.

Official references checked 25 September 2026:
[List repositories for a user](https://docs.github.com/en/rest/repos/repos#list-repositories-for-a-user),
[Pagination](https://docs.github.com/en/rest/using-the-rest-api/using-pagination-in-the-rest-api).
