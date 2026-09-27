# Changelog

Only delivered changes are listed here. Unreleased does not mean a deployed or
published release; no release tags have been created.

## Unreleased

### Added

- MIT licence and release/commercial-readiness documentation for the approved v0.1 scope.
- Repository primary-language counts across the fetched inventory, with missing-language totals and explicit capped/interrupted sample labels. No extra API requests.

- Profile repository cards with source/freshness labels, independent loading and failure states, native disclosure after 12 cards, and fork/archive and missing-data labels.
- Shared limits for account requests and each repository page, independent success caches, and integration/browser coverage for interruptions and disclosure.

- Server-only owned public repository retrieval with bounded pagination, validated
  Coded models, explicit partial/capped coverage and deterministic tests.
- Public username form and shareable basic profile pages with loading/error states,
  source/freshness labels, missing-data handling and keyboard/mobile support.
- Five-minute success cache, duplicate-request sharing and bounded per-instance
  requests/cooldown, with explicit multi-instance limitations.
- Deterministic cache/UI tests and fixture-backed Playwright browser checks in CI.
- Server-only public GitHub account retrieval with runtime validation, explicit
  failures, Coded profile mapping, coverage metadata and deterministic fixture tests.
- Initial Vercel production deployment and configuration, live verification,
  preview workflow and rollback documentation.
- Contributor/agent instructions, scoped issue and PR templates, and the foundation roadmap.
- A Next.js App Router homepage with strict TypeScript, Tailwind CSS, local branding,
  a project link and a skip-to-content link.
- Pinned runtime/package-manager guidance and a committed dependency lockfile.
- ESLint, Prettier, strict type-check commands and consistent LF line endings.
- Vitest homepage smoke tests, watch mode and deterministic fixture/mock guidance.
- GitHub Actions checks for formatting, lint, types, tests and production build on PRs and main.
- Setup, architecture and data-limitations documentation, an Unreleased changelog,
  and a security policy backed by enabled GitHub private vulnerability reporting.
