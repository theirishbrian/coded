# Coded

**Your work. Your progress. Proven.**

Coded turns public GitHub data into a clear, shareable developer profile.

## Status

The application accepts a public GitHub username and shows basic account details
at a shareable `/u/username` address. Results include attribution, retrieval time,
missing-data labels and a five-minute freshness policy. Profiles also display a
bounded [recent public-activity snapshot](docs/PUBLIC_ACTIVITY.md) and owned public
repositories, with explicit capped/interrupted coverage and keyboard-accessible
disclosure. The [primary-language summary](docs/LANGUAGE_SUMMARY.md) counts the
retrieved repositories, including missing metadata and sample limits. The production URL is <https://coded-beryl.vercel.app/>;
open PRs run on previews until merged. [v0.1.0](https://github.com/theirishbrian/coded/releases/tag/v0.1.0)
is the current published release.

## v0.1 scope

Enter a public GitHub username and view public account details, owned public
repositories and primary-language counts. Unavailable data is distinguished from
zero, and coverage limits are explicit. Language usage describes repositories,
not developer proficiency. The post-v0.1 activity snapshot covers GitHub's
available 30-day public-event window. Complete contribution analysis and
repository ranking remain deferred.

No accounts, database, AI, payments, social features or private repositories in v0.1.
Any example custom domain in planning is illustrative; the live URL is listed above.

Implemented stack: Next.js App Router, strict TypeScript, Tailwind CSS, Vitest and Playwright.
Vercel hosts the application.
Install dependencies only when the current issue requires them.

## Getting started

Use Node **24.14.0** (also recorded in .nvmrc) and npm **11.9.0**.
Install Git, Node and npm first; verify `git --version`, `node --version` and
`npm --version`. The tested versions are Node 24.14.0 and npm 11.9.0; if npm differs,
install the pinned version with `npm install --global npm@11.9.0`.
The supported project runtime is Node 24; package.json records the runtime range.
Read [AGENTS.md](AGENTS.md) and [CONTRIBUTING.md](CONTRIBUTING.md).

```sh
git clone https://github.com/theirishbrian/coded.git
cd coded
npm ci
npm run dev
```

Open http://localhost:3000. No environment variables or tokens are required.
Profile lookup requires access to the public GitHub API; installation downloads
packages. Stop the server with Ctrl+C. Keep the terminal/server running
while viewing the page; closing it makes localhost unavailable.

If port 3000 is occupied, use `npm run dev -- --port 3001` and open
http://localhost:3001. For a refused connection, first confirm that the terminal
reports a ready server and use its displayed port. This local URL is not a public deployment.

Next.js 16.3.5 may append a marked framework-guidance block to `AGENTS.md` when
`npm run dev` starts. This is generated guidance, not a change to project scope.
Review that local diff before committing; retain the project's instructions.

Validate and run the production build:

```sh
npm run typecheck
npm run build
npx playwright install chromium
npm run test:e2e
npm start
```

The type check generates Next.js route types before running TypeScript, so it
also works on a fresh checkout. npm ci installs the committed package-lock.json;
use npm only and commit intentional lockfile changes.

## Code quality checks

```sh
npm run lint
npm run format:check
npm run typecheck
npm test
npm run build
```

Use `npm run format` to apply formatting before committing.
Linting uses the Next.js Core Web Vitals and TypeScript presets plus explicit
accessible-label and keyboard-interaction rules. Warnings fail the lint command.
Prettier handles formatting; its compatibility preset disables conflicting ESLint
style rules. No application correctness rules are disabled.

ESLint is pinned to 9.39.5 because the React/import/accessibility plugins bundled
with Next.js 16.3.5 do not support ESLint 10. npm marks ESLint 9 as deprecated;
upgrade this pin when the bundled plugins support 10. Do not bypass peer checks.

Generated output, dependencies, environment files and npm's generated lockfile
are excluded from formatting. ESLint excludes generated output and Next.js type
declarations. LF line endings are shared by Git and Prettier for Windows/Linux
consistency. TypeScript strict mode remains enabled.

The configuration follows the [Next.js ESLint guide](https://nextjs.org/docs/app/api-reference/config/eslint)
and [Prettier setup guide](https://prettier.io/docs/install).
Vitest runs deterministic account-boundary, cache-policy and UI tests.
Playwright checks the full browser flow against an isolated fixture server,
including keyboard use, narrow screens and the no-JavaScript form fallback.
`npm test` runs once and fails for failing or empty suites;
`npm run test:watch` watches for changes. See [testing guidance](docs/TESTING.md)
for test locations, fixture/mock conventions and Server Component limitations.
[CI](docs/CI.md) runs these checks in the **Quality checks** job on pull requests
and pushes to main. See that guide for runtime details, failure diagnosis and
recommended branch-protection checks.

## Application structure

- app/layout.tsx: shared document and metadata.
- app/page.tsx: server-rendered homepage with an interactive username form.
- app/u/[username]/: request-time profile page, loading and error boundaries.
- app/lookup/route.ts: native GET form redirect when JavaScript is unavailable.
- components/: shared shell, username form and attributed profile/error UI.
- app/globals.css: Tailwind import and global styles.
- app/icon.svg: local application icon.
- postcss.config.mjs and tsconfig.json: styling and strict TypeScript configuration.
- tests/app/page.test.tsx and tests/setup.ts: homepage smoke tests and shared isolation.
- vitest.config.mts: test discovery, jsdom and source alias configuration.
- playwright.config.ts and tests/e2e/: isolated production-build browser checks.
- eslint.config.mjs and .prettierrc.json: lint and formatting policy.
- .github/workflows/ci.yml: automated quality checks.
- lib/github/ and lib/profile/: validated public account retrieval and Coded model mapping.
- docs/: architecture, data limitations, roadmap, testing and CI guidance.

The form, error recovery and repository explorer controls use client interaction;
GitHub access remains server-side. Repository search, filters and sorting operate
only on the already retrieved public repository data. The process-local cache and request limits are documented in
[the lookup decision](docs/decisions/0004-repository-display-policy.md). They do not
guarantee an IP-wide quota across Vercel instances. Dependencies use exact versions;
see package.json and the lockfile.

Profile pages also provide dynamic social metadata, a generated sharing image
and a browser-native share/copy action. See [profile sharing](docs/PROFILE_SHARING.md)
for the data and fallback behaviour.

The repository section highlights up to three original, non-archived projects
using a published stars/last-push/name order. Cards add validated homepage, topic
and detected-licence metadata from the existing repository response without more
requests. See [project proof highlights](docs/PROJECT_HIGHLIGHTS.md) for the exact
selection and interpretation limits.

The recent-public-activity section summarizes up to 300 validated events from
GitHub's available 30-day window and shows the newest 12. It publishes GitHub's
latency and coverage limits and does not calculate a streak, effort estimate or
developer score. See [recent public activity](docs/PUBLIC_ACTIVITY.md).

Installation follows the [Next.js manual setup](https://nextjs.org/docs/app/getting-started/installation)
and [Tailwind Next.js guide](https://tailwindcss.com/docs/installation/framework-guides/nextjs).

See the [foundation roadmap](docs/ROADMAP.md) and
[v0.1 milestone](https://github.com/theirishbrian/coded/milestone/1).
The first six issues establish the foundation, not the complete v0.1 product.

Post-v0.1 product decisions use the privacy and measurement boundary in
[the analytics guide](docs/ANALYTICS.md). Dynamic profile URLs are aggregated as
`/u/[username]` before pageview data is sent. Visitors can submit public,
structured observations through the shared feedback link; see the
[feedback review guidance](docs/PRODUCT_FEEDBACK.md).

## Licence

Coded is available under the [MIT License](LICENSE).

## Documentation and reporting

- [Architecture](docs/ARCHITECTURE.md): existing application and planned data flow.
- [Deployment](docs/DEPLOYMENT.md): live URL, configuration, verification and rollback.
- [GitHub profile boundary](docs/GITHUB_PROFILE.md): server-only retrieval, errors and coverage.
- [Repository boundary](docs/GITHUB_REPOSITORIES.md): bounded pagination, validation and partial results.
- [Data limitations](docs/DATA_LIMITATIONS.md): coverage, attribution and metric constraints.
- [Commercial readiness](docs/COMMERCIAL_READINESS.md): post-v0.1 evidence and due-diligence priorities.
- [Product feedback](docs/PRODUCT_FEEDBACK.md): public submission boundary and evidence-review method.
- [Profile sharing](docs/PROFILE_SHARING.md): social cards, metadata and browser share behaviour.
- [Project proof highlights](docs/PROJECT_HIGHLIGHTS.md): deterministic selection, evidence fields and limits.
- [Recent public activity](docs/PUBLIC_ACTIVITY.md): bounded event retrieval, display categories and limits.
- [v0.1 release audit](docs/V0_1_RELEASE_AUDIT.md): checks, evidence and publication record.
- [Contributing](CONTRIBUTING.md) and [agent instructions](AGENTS.md): issue and PR workflow.
- [Security policy](SECURITY.md): private vulnerability reporting; do not post sensitive details in issues.
- [Changelog](CHANGELOG.md): delivered version history.

Core setup/check commands are verified from a fresh checkout for Issue #5;
PR validation records the environment and results. Browser layout/keyboard checks
are separate from jsdom tests.

The completed [v0.1 release checklist](docs/V0_1_RELEASE_CHECKLIST.md) records
the release gates and separates later enhancements.
