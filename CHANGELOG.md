# Changelog

Only delivered changes are listed here. v0.1.0 was published on 27 September
2026 and is tagged at the verified production commit.

## Unreleased

### Added

- A concise print-ready developer snapshot with transparent project, language
  and recent-activity summaries that visitors can print or save as PDF.
- An accessible 30-day UTC public-event timeline with exact daily and category
  counts, busiest retrieved days and explicit interpretation limits.
- Privacy-conscious Vercel page analytics with profile-username redaction,
  automated coverage and documented measurement limits.
- A public product-feedback pathway with structured GitHub prompts, privacy
  warnings and evidence-review guidance.
- Accessible repository-language distribution bars with exact counts,
  percentages and explicit interpretation limits.
- Repository search, fork/archive filters, transparent sorting and visible
  matching-result counts, using the already retrieved public inventory.
- Repository pagination now accepts GitHub's canonical numeric-owner links while
  continuing to fetch only locally constructed username URLs.
- Profile-specific social metadata, generated 1200×630 preview cards and a
  browser share button with a copy-link fallback.
- Downloadable and file-shareable PNG profile cards with visually aligned names
  and handles.
- Transparent project proof highlights for up to three original, non-archived
  repositories, with validated homepage, topic and detected-licence metadata and
  explicit selection and coverage limits.
- A bounded recent-public-activity snapshot with readable event categories,
  source links, independent failure handling and explicit 30-day, latency and
  sampling limits.
- Profile section navigation with direct links to recent activity and public
  repositories, plus return-to-profile links after both long sections.

### Fixed

- Repository pages now keep otherwise valid public repositories when GitHub
  returns an unusable optional homepage, while discarding that unsafe link.

## [0.1.0] - 2026-09-27

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
