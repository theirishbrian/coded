# Coded

**Your work. Your progress. Proven.**

Coded is a planned developer proof-of-work platform that turns public GitHub
activity into a clear, shareable profile.

## Status

A minimal Next.js homepage now runs locally. It identifies Coded and links to
this repository; public profiles and GitHub integration are not implemented.
There is no live deployment, CI pipeline or release yet.

## v0.1 direction

Enter a public GitHub username and view a profile showing public account details,
repositories, repository language usage, recent work and verifiable contributions.
Unavailable data must be distinguished from zero, and coverage limits must be explicit.
Language usage describes repositories, not developer proficiency.

No accounts, database, AI, payments, social features or private repositories in v0.1.
Any example domain in planning is illustrative; no domain or deployment is claimed.

Planned stack: Next.js App Router, strict TypeScript, Tailwind CSS, selective
shadcn/ui components, Vitest, and Vercel. Playwright follows later in v0.1.
Install dependencies only when the current issue requires them.

## Getting started

Use Node **24.14.0** (also recorded in .nvmrc) and npm **11.9.0**.
The supported project runtime is Node 24; package.json records the runtime range.
Read [AGENTS.md](AGENTS.md) and [CONTRIBUTING.md](CONTRIBUTING.md).

```sh
npm ci
npm run dev
```

Open http://localhost:3000. No environment variables, tokens or external services
are required. Stop the server with Ctrl+C.

Validate and run the production build:

```sh
npm run typecheck
npm run build
npm start
```

The type check generates Next.js route types before running TypeScript, so it
also works on a fresh checkout. npm ci installs the committed package-lock.json;
use npm only and commit intentional lockfile changes.

Lint/format policy, automated tests and CI are deliberately deferred to #2–#4;
there are no lint, format or test scripts yet.

## Application structure

- app/layout.tsx: shared document and metadata.
- app/page.tsx: the single, server-rendered homepage.
- app/globals.css: Tailwind import and global styles.
- app/icon.svg: local application icon.
- postcss.config.mjs and tsconfig.json: styling and strict TypeScript configuration.

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
