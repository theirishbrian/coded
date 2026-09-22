# Coded — contributor and agent instructions

## Purpose and current stage

Coded turns public GitHub activity into a clear developer proof-of-work profile.
The repository now has a minimal application foundation. The first six
issues cover foundation work only; they do not constitute the full v0.1 release.
Implement only the currently assigned issue.
Read [architecture](docs/ARCHITECTURE.md) and [data limitations](docs/DATA_LIMITATIONS.md)
before feature work. Use [SECURITY.md](SECURITY.md) for private vulnerability reports.
Licence selection remains an owner decision; do not add LICENSE by assumption.

## Scope

- Work on one agreed issue at a time. Read its acceptance criteria and dependencies first.
- Before edits, inspect the repository, explain the approach briefly, and identify architectural decisions.
- v0.1 uses public GitHub data only. No user accounts/authentication, database,
  AI, payments, social features or private repositories.
- Do not add speculative abstractions, empty feature scaffolding or unrelated refactors.
- Use the smallest maintainable solution; add dependencies only when the current issue needs them.
- Document material architecture changes in a short decision record under docs/decisions/.
  Escalate changes to the agreed product scope; resolve routine implementation details autonomously.

## Agreed technology and boundaries

- Next.js App Router, TypeScript with strict mode, and Tailwind CSS.
- Use shadcn/ui selectively when a component is needed. Vitest is the unit/integration
  test choice; Playwright is planned later in v0.1. Zod and charts belong to the
  relevant validation/visualisation issues, not the initial scaffold.
- Prefer Server Components. Add client boundaries only for browser interaction.
- Keep routes/composition in app/, reusable UI in components/, GitHub access in
  lib/github/, transformation/internal models in lib/profile/, and ranking in lib/scoring/.
  Create directories when they contain real work, not in advance.
- GitHub API payloads must be validated and transformed into Coded-owned models before
  reaching UI components. Keep transformation and ranking logic testable without network calls.
- GitHub tokens and other secrets stay server-side. Never commit credentials, real .env
  files, private data or logs containing secrets. Use placeholder-only examples.
- Later API work must handle timeouts, pagination, rate limits, cache policy and unavailable data.
  Missing or inaccessible data is not zero. Document data coverage and ranking rules.
  Language usage must not be presented as developer proficiency.

## Code and user experience

- Keep strict TypeScript enabled; avoid untyped any and unexplained suppression directives.
- Use clear names, small cohesive modules, and comments for non-obvious reasoning.
- Validate external input; use safe error messages and do not expose internal secrets.
- Build semantic, responsive interfaces with keyboard access, visible focus, labels,
  appropriate contrast and no colour-only meaning. Respect reduced motion.
- Add loading, empty and error states when the relevant feature is introduced.

## Validation

The foundation provides npm ci, npm run dev, npm run typecheck, npm run build and
npm start, plus npm run lint, npm run format:check and npm run format.
Tests run once with npm test or in watch mode with npm run test:watch; see
docs/TESTING.md for locations, mocks and Server Component limitations.
CI runs the checks on PRs and main; see docs/CI.md. Do not claim a check
or deployment has passed before it exists and has been run.

- Issue #1 establishes the application and documents the selected runtime/package manager,
  lockfile, actual commands, type check, production build and manual homepage check.
- Issue #2 standardises lint, format checking and strict type checking.
- Issue #3 adds deterministic Vitest tests; Issue #4 runs the available checks in CI.
- Once present, use the committed lockfile and documented install/check commands.
  Run checks appropriate to every change; application PRs should pass lint, formatting,
  type checking, tests and production build once those checks are available.
- Test observable behaviour and failure paths. Bug fixes should include meaningful
  regression coverage. Do not add tests that merely mirror implementation.
- Mock GitHub/network access in normal tests. CI must not depend on live GitHub data or secrets.
- UI changes require a browser check, including keyboard and narrow-screen behaviour.
- For documentation-only changes, inspect the diff, links and templates; application
  tests are not required unless configuration or behaviour also changes.
- Report exact checks run, results, skipped/unavailable checks and known limitations.

## Git and review workflow

- Use an issue-linked branch: feat/<number>-<slug>, fix/<number>-<slug>,
  docs/<number>-<slug> or chore/<number>-<slug>.
- Use focused conventional commits such as "chore: initialise application foundation".
- Open a PR with the problem, resulting behaviour, linked issue, validation and limitations.
  Use "Closes #N" only when the issue's acceptance criteria are fully met.
- Review the diff and complete available checks before merging through a PR.
  Do not force-push or rewrite shared history without explicit direction.
- Bootstrap exception: the first governance file may be the initial commit on an
  empty main branch so subsequent changes can use PRs. Application work uses branches and PRs.
- Preserve truthful history: no backdating, manufactured activity, fabricated tests or
  claims that scaffolding is a finished product.
- Keep README, contributor guidance and roadmap consistent. Add delivered changes
  to CHANGELOG.md without announcing unimplemented features or a nonexistent release.
