# Continuous integration

[CI](../.github/workflows/ci.yml) runs on pull requests and pushes to `main`.
The workflow is named **CI** and its single job/check is **Quality checks**
(shown in PR checks as `CI / Quality checks`). It installs dependencies once,
then runs these named steps in order:

| Step             | Command                |
| ---------------- | ---------------------- |
| Check formatting | `npm run format:check` |
| Lint             | `npm run lint`         |
| Check types      | `npm run typecheck`    |
| Test             | `npm test`             |
| Build            | `npm run build`        |

A failed command fails the job and skips later steps. Tests run once; empty and
failing suites return non-zero. Use the Checks tab on a PR or the repository's
[Actions page](https://github.com/theirishbrian/coded/actions/workflows/ci.yml)
to inspect the failed step and its logs. Reproduce it locally using the same
runtime and commands. Fix the cause and push a commit to trigger a new PR run.

## Runtime and permissions

The job uses GitHub-hosted Ubuntu 24.04, Node from `.nvmrc` (currently 24.14.0),
and npm 11.9.0 matching `package.json`. Update the workflow's npm pin together
with `packageManager` and README when changing npm. `npm ci` uses the committed
lockfile and fails if it disagrees with `package.json`.

The workflow requests only `contents: read`; checkout does not persist credentials.
It uses `pull_request`, never `pull_request_target`, and requires no configured
secrets or live GitHub profile data. Installation still downloads public packages
and runtime tools. No dependency/build caches are used at this stage. Next.js
telemetry is disabled. Official checkout/setup-node actions are pinned to full
commit hashes, with release comments; review upstream release notes and verify
the tag's commit before updating a pin.

Each job has a 15-minute timeout. A new run cancels older runs for the same PR
or branch. There are no path filters, so documentation-only PRs also receive the
check. This workflow does not deploy, publish packages or change repository settings.

## Recommended protection for main

After the first successful run, configure the main-branch ruleset to require
**Quality checks** from GitHub Actions (the `CI / Quality checks` PR entry),
alongside the existing pull-request rule. Also recommend requiring branches to be
up to date before merging, resolving review conversations, and blocking force
pushes and deletions. A solo maintainer can require a PR with zero required
approvals; requiring another person's approval needs a second reviewer.

These are recommendations, not a claim that repository settings are enforced.
Issue #4 adds the workflow only; it does not change permissions or rulesets.
If the job is renamed later, update the required check in the ruleset too.
