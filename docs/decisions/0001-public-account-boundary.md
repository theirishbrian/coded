# 0001: Public account retrieval boundary

Status: accepted for Issue #14.

Use a single unauthenticated GitHub REST request behind a server-only function.
Validate the small consumed payload with explicit TypeScript guards and map it
into a Coded-owned result. This avoids adding an SDK or schema library for one
endpoint while preserving runtime validation. Revisit shared validation tooling
when later endpoints justify it.

Use a five-second deadline, no automatic retries and no-store requests initially.
This makes failures and freshness explicit without creating a speculative cache.
The tradeoff is GitHub's shared unauthenticated IP quota; a public lookup UI must
address caching and rate limits before release. No credentials are needed now.

Only personal User accounts succeed. Organizations/bots have an explicit unsupported
outcome. Missing optional fields remain null and API-reported counts carry a coverage
label. The exact contract and verified official references are in
[GITHUB_PROFILE.md](../GITHUB_PROFILE.md). The homepage remains static.
