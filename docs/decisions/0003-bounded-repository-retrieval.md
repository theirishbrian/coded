# 0003 — Bounded repository retrieval with explicit partial results

Date: 25 September 2026. Scope: Issue #18.

Use a separate server-only repository loader over shared unauthenticated
HTTP/JSON transport extracted from the account adapter. Keep the existing
account result contract unchanged.

Fetch owned public repositories in full-name ascending order, preserving forks
and archives without ranking. Bound work to three sequential pages of 100 and
five seconds per request. Construct request URLs locally and validate next links
against the exact expected query. This bounds fan-out without promising a full
inventory for large accounts.

Report capped/interrupted coverage explicitly. Retain validated earlier pages
after later failures, reject entire malformed pages, and deduplicate by ID using
the first observation. Endpoint exhaustion is not an atomic inventory or complete
contribution history.

Public UI integration is separate: it must budget combined upstream requests and
define caching and partial-result presentation first. No tokens, dependencies,
persistence or distributed quota guarantees. See [the contract](../GITHUB_REPOSITORIES.md).
