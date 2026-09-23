# Deployment

## Target and configuration

The owner confirmed Brian's Vercel Hobby account (`brian-6dd4`) and a new project
named `coded` for Issue #6. The project imports `theirishbrian/coded` through the
Vercel GitHub App, with repository access limited to `coded`.

| Setting                           | Configured value                                         |
| --------------------------------- | -------------------------------------------------------- |
| Framework                         | Next.js                                                  |
| Root directory                    | Repository root (`./`)                                   |
| Production branch                 | `main`                                                   |
| Node.js                           | 24.x, selected by the existing package.json engine range |
| Install command                   | `npm install --global npm@11.9.0 && npm ci`              |
| Build command                     | `npm run build`                                          |
| Output directory                  | Next.js framework default                                |
| Application environment variables | None                                                     |

Local development and GitHub CI use Node 24.14.0. Vercel manages the patch version
within the selected Node major; do not claim an exact platform patch without
checking the build logs. npm is explicitly pinned for installation. No GitHub
token or other application secret is required by this static foundation.

## Deployment record

The initial production deployment was verified on 23 September 2026:

- Public URL: <https://coded-beryl.vercel.app/>.
- Project: [Brian / coded](https://vercel.com/brian-6dd4/coded).
- Source: `main`, commit `5db4175a18f6abdc166b3c98bffa78ba8e813354`.
- [Deployment details](https://vercel.com/brian-6dd4/coded/95xHxkRqTfb8ahqpn2sZBsfXtMBq):
  `dpl_95xHxkRqTfb8ahqpn2sZBsfXtMBq`, Production, Ready, 34 seconds.
- Build logs confirmed successful compilation, TypeScript checking, static page
  generation and deployment completion.
- An unauthenticated HTTP request returned 200 with the Coded homepage.
- Desktop (1052 × 1226) and narrow (390 × 844) browser checks passed: readable
  layout and no horizontal overflow. No browser console errors were observed.
- Keyboard checks passed: visible skip-link focus, activation moved focus to
  `main`, and the repository link received visible focus with the correct URL.

No application environment variables or custom domain were added. This deploys
the existing static foundation; public profiles are not implemented. Rollback
is documented below but was not exercised against the initial production site.

## Preview and production workflow

With the Git integration connected, pushes to non-production branches create
preview deployments and pushes to `main` create production deployments. Preview
URLs may require Vercel authentication; preserve that protection. The production
URL is intended to show the public foundation homepage.

GitHub's Quality checks and Vercel builds are separate checks. Do not assume a
successful Vercel build proves lint or tests passed, or that Vercel automatically
waits for GitHub CI. Review both checks before merging. Required-check enforcement
is described as a recommendation in [CI.md](CI.md), not a verified setting.

## Redeployment and rollback

For a code change, open an issue-linked PR, validate the preview and CI, then merge
to `main` for production. For a rebuild of an existing commit, open the project in
Vercel, select the intended deployment and use Redeploy; verify its source commit
and target environment before submitting.

If a later production deployment is faulty, use Instant Rollback to a known-good
previous production deployment. Hobby supports the immediately previous deployment.
Confirm the target commit and recheck the public URL afterward. There is no
previous deployment to roll back to on an initial launch. If the platform action
is unavailable, revert the faulty source change through a PR and deploy the
corrected `main` commit. A rollback does not rewrite Git history; reconcile the
source branch before the next deployment. After a rollback, Vercel pauses automatic
production-domain assignment. Use Undo Rollback to promote a verified corrected
deployment and restore normal automatic production updates. Rollback also restores
the old build's configuration; it does not pick up new environment-variable values.

## Verification checklist

- Confirm the deployment is Ready and record its source commit and URL.
- Load the production URL on desktop and a narrow viewport; check readable text,
  no horizontal overflow and a usable repository link.
- Use the keyboard to reveal the skip link, activate it and verify focus reaches
  the main content; verify the repository link can receive visible focus.
- Check for browser errors and inspect available deployment/build logs.
- Keep product limitations explicit: this is a foundation, not public profiles or
  a completed v0.1 release.

References: [Git deployments](https://vercel.com/docs/git),
[Node versions](https://vercel.com/docs/functions/runtimes/node-js/node-js-versions),
[Instant Rollback](https://vercel.com/docs/instant-rollback).
