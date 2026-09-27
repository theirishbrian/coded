# v0.1 release audit

Audit date: 27 September 2026. Release candidate work is tracked in Issue #24.
This document records evidence; it does not authorize publication.

## Scope and documentation

- Approved v0.1 scope: public personal-account details, owned public repositories
  and primary-language counts.
- Activity feeds, contribution analysis, repository ranking, authentication,
  private data, AI, payments and persistence remain outside v0.1.
- The owner selected the MIT licence. The licence file, package metadata, README,
  roadmap, security policy, architecture and release checklist are aligned.
- Post-v0.1 commercial readiness prioritizes privacy-conscious analytics, real
  user validation, transferable documentation and earned traction over feature count.

## Automated checks

| Check                      | Result                                                                                                      |
| -------------------------- | ----------------------------------------------------------------------------------------------------------- |
| `npm run format:check`     | Passed                                                                                                      |
| `npm run lint`             | Passed with zero warnings                                                                                   |
| `npm run typecheck`        | Passed; Next.js route types generated                                                                       |
| `npm test`                 | Passed: 164 tests across 9 files                                                                            |
| `npm run build`            | Passed; static homepage and dynamic lookup/profile routes                                                   |
| Playwright with local Edge | All 9 scenarios passed; the local Windows command lingered during process teardown and was stopped manually |
| `npm audit --json`         | Passed against npm advisory service: 0 known vulnerabilities across 566 dependencies                        |

GitHub CI run #19 completed successfully for PR #25 in 1 minute 15 seconds. Its
quality-check job passed all 9 test files and all 164 test results, and provides
the authoritative clean-run result because it installs its own Chromium browser
and controls process teardown.

## Live baseline check

The current production site at <https://coded-beryl.vercel.app/> was checked
before the release-audit preview existed:

- a real `theirishbrian` lookup reached the canonical `/u/theirishbrian` URL;
- public account details, one repository and one TypeScript language count rendered;
- source links, retrieval times and data-limit explanations were present;
- the keyboard skip link received focus and moved focus to `main`; and
- the deployed page exposed no fabricated activity, ranking or proficiency claim.

The PR #25 preview at
<https://coded-git-chore-24-v0-1-release-audit-brian-6dd4.vercel.app/> was also
checked after Vercel reported it ready:

- a real `theirishbrian` lookup reached `/u/theirishbrian` and rendered the
  expected account, repository and language information;
- source links, retrieval time and coverage limits were present;
- no browser warnings or errors were recorded during the lookup;
- activating the keyboard skip link moved focus to `main`; and
- at a 390 by 844 pixel viewport the profile remained readable with no
  horizontal overflow.

PR #25 was merged into `main` as `02cac5b`. Vercel reported the resulting
production deployment successful, and a fresh production `theirishbrian` lookup
rendered the expected account, repository and language information without
browser warnings or errors.

## Deployment and recovery

Vercel's Git integration creates previews for branches and production deployments
from `main`. GitHub quality checks and Vercel builds are separate gates. The
documented recovery path is Instant Rollback to the previous known-good production
deployment, followed by source reconciliation through a PR. Rollback has not been
exercised in production, so this remains a documented capability rather than a
tested operational drill.

## Remaining gates

- Issue #24 and PR #25 are published and linked to this audit.
- CI run #19 and the Vercel preview completed successfully.
- Preview desktop, 390-pixel narrow-screen, keyboard, console and live-GitHub
  checks are recorded above.
- PR #25 was reviewed and merged with owner approval.
- A separate release change updates the package version and changelog, creates
  `v0.1.0`, verifies production at that commit and closes the milestone only after
  explicit owner authorization.
