# v0.1 release checklist

Approved release cut, 27 September 2026. The owner approved account details,
owned public repositories and primary-language counts for v0.1, selected the MIT
licence, and deferred recent work, contribution insights and ranking. The owner
authorized publication after reviewing the final audit; v0.1.0 was published and
verified on 27 September 2026.

## Release product

A visitor enters a public personal GitHub username and gets a shareable page with
account details, owned public repositories and a primary-language count summary.
Every view explains sources, freshness, unavailable fields and coverage limits.
Public data is not a proficiency score or complete contribution history.

## Release steps

1. **Language summary (#22): complete.** PR #23 passed its checks, was approved and
   merged, and the production deployment was verified.
2. **Final release audit: complete.** Checked homepage-to-profile and direct URLs,
   lookup/back navigation, desktop/mobile/keyboard operation, long names and text,
   empty/unavailable/capped/partial fixtures, disclosure and no-JavaScript fallback.
   Deployment, rollback, dependency and security findings were recorded; no
   release-blocking defect was found.
3. **Licence and scope: complete.** Added the selected MIT licence and aligned README,
   roadmap and release notes with what actually ships.
4. **Publish v0.1.0: complete.** PR #26 updated the version and changelog and
   merged as `c48250e`. Production was verified against that commit, the tag and
   GitHub release were published, and the 100%-complete milestone was closed.

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
- [x] Documentation/version/changelog match the release commit.
- [x] Owner authorized release publication; v0.1.0 exists and production is verified.

All v0.1 release gates are complete. Later enhancements remain evidence-led
post-release work rather than unfinished v0.1 scope.
