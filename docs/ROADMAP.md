# Foundation roadmap

Milestone: [v0.1 — Public Developer Profiles](https://github.com/theirishbrian/coded/milestone/1).
No delivery date has been committed.

## First six issues

| Order | Issue                                                                                                       | Depends on | Result                                        |
| ----- | ----------------------------------------------------------------------------------------------------------- | ---------- | --------------------------------------------- |
| 1     | [Set up Coded application foundation](https://github.com/theirishbrian/coded/issues/1)                      | Governance | Minimal running Next.js application           |
| 2     | [Configure linting, formatting and TypeScript strict mode](https://github.com/theirishbrian/coded/issues/2) | #1         | Reproducible quality checks                   |
| 3     | [Add automated test infrastructure](https://github.com/theirishbrian/coded/issues/3)                        | #1, #2     | Deterministic Vitest setup                    |
| 4     | [Create GitHub Actions CI workflow](https://github.com/theirishbrian/coded/issues/4)                        | #1–#3      | Automated PR/main checks                      |
| 5     | [Add core repository documentation](https://github.com/theirishbrian/coded/issues/5)                        | #1–#4      | Verified setup and architecture documentation |
| 6     | [Deploy initial application to Vercel](https://github.com/theirishbrian/coded/issues/6)                     | #1–#5      | Verified minimal deployment                   |

These issues remain open until implemented and validated. The governance bootstrap
does not complete Issue #1 or Issue #5.

## Later v0.1 work

Scope later issues as the foundation lands: GitHub access and error handling,
cache/data coverage policies, transformation into Coded models, transparent
repository ranking, profile UI, responsive/accessibility checks and end-to-end tests.
Do not create or implement a speculative backlog during foundation setup.

Completing the six foundation issues does not complete v0.1. Release requires the
public-username-to-profile journey, useful verified public data, accurate missing-data
states, appropriate tests, accessibility checks and a verified deployment.

## Decisions still to make

- Select and approve the licence before an open-source release.
- Record exact supported framework/runtime versions and package manager in #1.
- Establish a private security-reporting route in #5.
- Confirm the Vercel account/project and actual URL in #6.

No accounts/authentication, database, AI, payments, social features or private
repositories are included in v0.1.
