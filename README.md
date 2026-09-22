# Coded

**Your work. Your progress. Proven.**

Coded is a planned developer proof-of-work platform that turns public GitHub
activity into a clear, shareable profile.

## Status

A minimal Next.js homepage now runs locally. It identifies Coded and links to
this repository; public profiles and GitHub integration are not implemented.
GitHub Actions runs quality checks on pull requests and main. There is no live
deployment or release yet.

## v0.1 direction

Enter a public GitHub username and view a profile showing public account details,
repositories, repository language usage, recent work and verifiable contributions.
Unavailable data must be distinguished from zero, and coverage limits must be explicit.
Language usage describes repositories, not developer proficiency.

No accounts, database, AI, payments, social features or private repositories in v0.1.
Any example domain in planning is illustrative; no domain or deployment is claimed.

Implemented stack: Next.js App Router, strict TypeScript, Tailwind CSS and Vitest.
Selective shadcn/ui components, Playwright and Vercel deployment are planned later.
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

Open http://localhost:3000. No environment variables, tokens or external services
are required to run the application. Installation requires internet access to
download packages. Stop the server with Ctrl+C. Keep the terminal/server running
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
Vitest now runs deterministic homepage smoke tests with React Testing Library and
jsdom. `npm test` runs once and fails for failing or empty suites;
`npm run test:watch` watches for changes. See [testing guidance](docs/TESTING.md)
for test locations, fixture/mock conventions and Server Component limitations.
[CI](docs/CI.md) runs these checks in the **Quality checks** job on pull requests
and pushes to main. See that guide for runtime details, failure diagnosis and
recommended branch-protection checks.

## Application structure

- app/layout.tsx: shared document and metadata.
- app/page.tsx: the single, server-rendered homepage.
- app/globals.css: Tailwind import and global styles.
- app/icon.svg: local application icon.
- postcss.config.mjs and tsconfig.json: styling and strict TypeScript configuration.
- tests/app/page.test.tsx and tests/setup.ts: homepage smoke tests and shared isolation.
- vitest.config.mts: test discovery, jsdom and source alias configuration.
- eslint.config.mjs and .prettierrc.json: lint and formatting policy.
- .github/workflows/ci.yml: automated quality checks.
- docs/: architecture, data limitations, roadmap, testing and CI guidance.

No client components, API calls, remote fonts or UI libraries are needed for this
page. Future components/ and lib/ modules will be added only when an issue needs
them. Dependencies use exact versions; TypeScript stays on the established 5.9
line for this initial scaffold. See package.json and the lockfile for exact versions.

Installation follows the [Next.js manual setup](https://nextjs.org/docs/app/getting-started/installation)
and [Tailwind Next.js guide](https://tailwindcss.com/docs/installation/framework-guides/nextjs).

See the [foundation roadmap](docs/ROADMAP.md) and
[v0.1 milestone](https://github.com/theirishbrian/coded/milestone/1).
The first six issues establish the foundation, not the complete v0.1 product.

## Licence

A licence has not yet been selected. The intended open-source release needs an
owner-approved licence; public repository visibility alone is not a licence grant.

## Documentation and reporting

- [Architecture](docs/ARCHITECTURE.md): existing application and planned data flow.
- [Data limitations](docs/DATA_LIMITATIONS.md): coverage, attribution and metric constraints.
- [Contributing](CONTRIBUTING.md) and [agent instructions](AGENTS.md): issue and PR workflow.
- [Security policy](SECURITY.md): private vulnerability reporting; do not post sensitive details in issues.
- [Changelog](CHANGELOG.md): delivered, unreleased changes.

Core setup/check commands are verified from a fresh checkout for Issue #5;
PR validation records the environment and results. Browser layout/keyboard checks
are separate from jsdom tests. Licence selection and initial deployment remain open decisions.
