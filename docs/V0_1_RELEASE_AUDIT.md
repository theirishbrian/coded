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

GitHub CI remains the authoritative clean-run check for Playwright because it
installs its own Chromium browser and controls process teardown. The release PR
must not merge unless that job completes successfully.

## Live baseline check

The current production site at <https://coded-beryl.vercel.app/> was checked
before the release-audit preview existed:

- a real `theirishbrian` lookup reached the canonical `/u/theirishbrian` URL;
- public account details, one repository and one TypeScript language count rendered;
- source links, retrieval times and data-limit explanations were present;
- the keyboard skip link received focus and moved focus to `main`; and
- the deployed page exposed no fabricated activity, ranking or proficiency claim.

The preview deployment still needs desktop and narrow-viewport review, console
inspection and a live lookup after the branch is pushed. Production must be
rechecked against the release commit after the approved PR is merged.

## Deployment and recovery

Vercel's Git integration creates previews for branches and production deployments
from `main`. GitHub quality checks and Vercel builds are separate gates. The
documented recovery path is Instant Rollback to the previous known-good production
deployment, followed by source reconciliation through a PR. Rollback has not been
exercised in production, so this remains a documented capability rather than a
tested operational drill.

## Remaining gates

- GitHub issue and PR are published and linked to this audit.
- CI and Vercel preview checks complete successfully.
- Preview desktop, narrow-screen, keyboard and live-GitHub checks are recorded.
- The audit PR is reviewed and merged with owner approval.
- A separate release change updates the package version and changelog, creates
  `v0.1.0`, verifies production at that commit and closes the milestone only after
  explicit owner authorization.
