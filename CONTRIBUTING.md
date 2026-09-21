# Contributing to Coded

Start with [AGENTS.md](AGENTS.md), the [roadmap](docs/ROADMAP.md), and the issue's
acceptance criteria. Work on one issue at a time and honour its dependencies.

## Workflow

1. Inspect the current repository and explain the proposed approach.
2. Create an issue-linked branch such as chore/1-application-foundation.
3. Make a focused change and add meaningful tests for behaviour when applicable.
4. Run the available checks and review the diff for correctness, scope and secrets.
5. Open a PR describing the problem, resulting behaviour, linked issue, validation
   and limitations. Use Closes #N only when all acceptance criteria are met.
6. Review and merge through the PR once checks pass; update documentation with the change.

Use conventional commits, for example docs: clarify local setup.
Do not backdate commits or manufacture activity, review, test or deployment evidence.

## Checks at the current stage

Use npm ci, npm run lint, npm run format:check, npm run typecheck and npm run build
for application changes. Run npm run format to apply formatting before committing.
Use npm run dev for the local browser check; npm start serves a completed production build.
Also check documentation links, scope and git diff --check.
Lint warnings fail the check. Keep TypeScript strict mode enabled; document
the reason for any narrowly scoped rule exception. #3 adds tests; #4 automates them.
Report skipped or unavailable checks explicitly.

Application changes should include appropriate behavioural tests. Use deterministic
fixtures for external data and no live GitHub calls in normal tests. UI changes
also need a browser check for keyboard use and narrow screens.

## Scope and decisions

Keep API access, transformation/ranking and UI separate as described in AGENTS.md.
Record material architecture decisions under docs/decisions/ when needed.
Broader product changes need agreement before implementation.

The licence is pending an owner decision. Do not add one by assumption.
Do not publish credentials or sensitive vulnerability details in public issues.
An established private security-reporting route will be documented in Issue #5.

## Labels

- enhancement: planned application or tooling work.
- documentation: documentation changes.
- bug: an existing behaviour that fails.

The initial six issues use enhancement or documentation and share the v0.1 milestone.
