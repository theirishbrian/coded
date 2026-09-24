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

Issues #1–#6 are delivered and merged. The initial Vercel deployment is live;
its configuration and [verification](DEPLOYMENT.md) are recorded in the repository.
GitHub issues are the source of truth for current open/closed status.

[Public account retrieval (#14)](https://github.com/theirishbrian/coded/issues/14)
is merged. [Public lookup and basic profile pages (#16)](https://github.com/theirishbrian/coded/issues/16)
connect that boundary to a shareable profile with cache/request controls and browser
tests. Its PR/issue tracks review and deployment. See [the contract](GITHUB_PROFILE.md).

## Later v0.1 work

Scope later issues for repository/activity coverage, pagination, useful public
insights and transparent repository ranking. Extend the existing profile UI,
responsive/accessibility checks and end-to-end tests alongside each feature.
Do not create or implement a speculative backlog during foundation setup.

Completing the six foundation issues does not complete v0.1. Release requires the
public-username-to-profile journey, useful verified public data, accurate missing-data
states, appropriate tests, accessibility checks and a verified deployment.

## Decisions still to make

- Select and approve the licence before an open-source release.
- Specify API coverage, caching and ranking behaviour in later scoped issues.

Runtime versions are recorded in [README](../README.md) and package.json.
Private vulnerability reporting is enabled; see [SECURITY.md](../SECURITY.md).
The [architecture](ARCHITECTURE.md) separates existing code from planned boundaries,
and [data limitations](DATA_LIMITATIONS.md) records the future reporting constraints.

No accounts/authentication, database, AI, payments, social features or private
repositories are included in v0.1.
