# v0.1 release checklist

Proposed release cut, 27 September 2026, following the owner's request to move
Coded toward completion. The owner must approve this cut before publishing v0.1.
The earlier direction included recent work and contribution insights; moving those
to a later version is an explicit scope decision, not a claim they are complete.

## Release product

A visitor enters a public personal GitHub username and gets a shareable page with
account details, owned public repositories and a primary-language count summary.
Every view explains sources, freshness, unavailable fields and coverage limits.
Public data is not a proficiency score or complete contribution history.

## Remaining work, in order

1. **Finish the language summary (#22).** Review the PR, require green checks and
   real preview evidence, then obtain owner approval to merge and verify production.
2. **One final release audit.** Check homepage-to-profile and direct URLs, another
   lookup/back navigation, desktop/mobile/keyboard operation, long names and text,
   empty/unavailable/capped/partial fixtures, disclosure and no-JavaScript fallback.
   Check the documented deployment/rollback path and dependency/security findings.
   Fix release-blocking defects in one focused PR; avoid adding new features.
3. **Licence and release approval.** Owner selects the licence and approves this
   release scope. Add the selected licence and align README, roadmap and release
   notes with what actually ships. Do not assume a licence or call it open source
   before this decision is made.
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

- [ ] Owner approves the proposed release cut and licence.
- [ ] Language-summary PR merged; production checked.
- [ ] Release audit completed with results and any remaining limits recorded.
- [ ] Release-blocking fixes merged; final CI passes.
- [ ] Documentation/version/changelog match the release commit.
- [ ] Owner authorizes release publication; v0.1.0 exists and production is verified.

A green build or closed foundation milestone alone is not release completion.
