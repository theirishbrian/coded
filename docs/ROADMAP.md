# Foundation roadmap

Milestone: [v0.1 — Public Developer Profiles](https://github.com/theirishbrian/coded/milestone/1),
completed with the [v0.1.0 release](https://github.com/theirishbrian/coded/releases/tag/v0.1.0)
on 27 September 2026.

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
tests; #16 is merged and production verified. See [the contract](GITHUB_PROFILE.md).

[Bounded repository retrieval (#18)](https://github.com/theirishbrian/coded/issues/18)
is merged. [Repository display (#20)](https://github.com/theirishbrian/coded/issues/20) connects it with shared request controls, separate success caches, honest coverage states and accessible cards. Issue #20 is merged and production verified.

## Approved v0.1 release cut

Issues #14, #16, #18, #20 and #22 deliver the approved public profile: account
details, owned public repositories and primary-language counts. The final audit,
MIT licence and publication gates are complete; see the
[release checklist](V0_1_RELEASE_CHECKLIST.md).

Completing the six foundation issues does not complete v0.1. Release requires the
public-username-to-profile journey, useful verified public data, accurate missing-data
states, appropriate tests, accessibility checks and a verified deployment.

## After v0.1

- Validate the product with real users and trustworthy analytics before expanding scope.
- Scope activity, contribution and ranking work only when evidence supports it.
- Keep metric definitions and limitations transparent; do not introduce opaque skill scores.
- Treat documentation, deployment history and measurable usage as product assets;
  see [commercial readiness](COMMERCIAL_READINESS.md).

Runtime versions are recorded in [README](../README.md) and package.json.
Private vulnerability reporting is enabled; see [SECURITY.md](../SECURITY.md).
The [architecture](ARCHITECTURE.md) separates existing code from planned boundaries,
and [data limitations](DATA_LIMITATIONS.md) records the future reporting constraints.

No accounts/authentication, database, AI, payments, social features or private
repositories are included in v0.1.

## Published release cut

[Language summary (#22)](https://github.com/theirishbrian/coded/issues/22) is
merged and production verified. The [v0.1 release checklist](V0_1_RELEASE_CHECKLIST.md)
records the completed audit and publication gates. Activity and ranking remain deferred.
