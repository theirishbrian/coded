# v0.1 release checklist

Approved release cut, 27 September 2026. The owner approved account details,
owned public repositories and primary-language counts for v0.1, selected the MIT
licence, and deferred recent work, contribution insights and ranking. Publishing
v0.1.0 still requires separate approval after the final audit is reviewed.

## Release product

A visitor enters a public personal GitHub username and gets a shareable page with
account details, owned public repositories and a primary-language count summary.
Every view explains sources, freshness, unavailable fields and coverage limits.
Public data is not a proficiency score or complete contribution history.

## Remaining work, in order

1. **Language summary (#22): complete.** PR #23 passed its checks, was approved and
   merged, and the production deployment was verified.
2. **One final release audit.** Check homepage-to-profile and direct URLs, another
   lookup/back navigation, desktop/mobile/keyboard operation, long names and text,
   empty/unavailable/capped/partial fixtures, disclosure and no-JavaScript fallback.
   Check the documented deployment/rollback path and dependency/security findings.
   Fix release-blocking defects in one focused PR; avoid adding new features.
3. **Licence and scope: approved.** Add the selected MIT licence and align README,
   roadmap and release notes with what actually ships.
4. **Publish v0.1.0.** From an approved, tested main commit: update the version and
   changelog, publish the tag/release, verify production against that commit, and
   close the milestone only after the above gates pass.

## Deliberately outside the proposed first release

Recent-activity feeds, contribution analysis, repository ranking, byte-level
language analysis and charts are later enhancements, not launch blockers for
this proposed cut. Authentication, private data, AI, payments and a database
remain outside the agreed v0.1 architecture. No further feature issues should be
added to this release without an explicit scope decision.

## Completion evidence

- [x] Owner approves the release cut and MIT licence.
- [x] Language-summary PR merged; production checked.
- [x] Release audit completed with results and any remaining limits recorded.
- [x] Release audit merged; no release blockers found; final CI passes.
- [ ] Documentation/version/changelog match the release commit.
- [ ] Owner authorizes release publication; v0.1.0 exists and production is verified.

A green build or closed foundation milestone alone is not release completion.
