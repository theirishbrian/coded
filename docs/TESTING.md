# Testing

Run `npm ci` using the runtime in README, then:

```sh
npm test
npm run test:watch
```

`npm test` runs once and exits. Failed assertions and an empty suite exit non-zero.
`npm run test:watch` reruns affected tests while editing; press `q` to quit.
For a focused run, use `npm test -- tests/app/page.test.tsx`.
Run lint, formatting, type checking and production build separately: Vitest
transpiles TypeScript but does not replace `npm run typecheck`.

## Locations and isolation

Put tests in `tests/`, mirroring the source path, with `.test.ts` or `.test.tsx`
extensions. The configuration discovers only these files. The `@/` alias resolves
to the repository root, as it does in TypeScript. `tests/setup.ts` installs DOM
matchers, cleans up rendered components after each test and rejects unexpected
global `fetch` calls. Spies and stubbed globals are restored between tests.
Import test APIs explicitly from Vitest; global test functions are not enabled.

The default environment is jsdom for component tests. Future pure transformations
can select Node with `// @vitest-environment node` at the top of their test file.
Keep tests independent of execution order, wall-clock time and randomness; use
fixed inputs and restore any fake timers after use.

## GitHub adapter tests

Normal tests must run without network access, credentials or live GitHub data.
The profile boundary suite runs in Node and uses small, synthetic JSON fixtures under
`tests/fixtures/github/`. Include only fields relevant to the test; never copy
tokens, private data or a live account's changing activity. Create fresh fixture
objects for each test so mutations cannot leak across cases.

Override `fetch` in the individual test with `vi.stubGlobal("fetch", vi.fn(...))`
returning a fixture-backed `Response`, or mock the adapter boundary for profile/UI
tests. Cover success, empty/missing data, malformed responses, rate limits and
network failures. The current suite also exercises timeouts before headers and during
body consumption, non-user accounts, safe URLs and discarded raw fields. The default fetch guard
is not a network sandbox: any future HTTP client or other transport also needs an
explicit mock. Do not add production API logic just to exercise this setup.

## What the homepage tests prove

The smoke tests render the existing synchronous homepage and check its accessible
heading, honest foundation status, repository link and skip-link target. There are
no snapshots or artificial coverage targets.

This follows the [Next.js Vitest guide](https://nextjs.org/docs/app/guides/testing/vitest).
Vitest does not currently support async Server Components. jsdom also does not
prove Next.js routing, server rendering, hydration, visual layout or browser
fragment-navigation behaviour. The focus assertion checks that the skip target
can receive focus; keyboard and responsive browser checks remain separate.
Playwright coverage for full browser flows is planned later in v0.1.
[CI](CI.md) runs the non-interactive suite alongside lint, formatting, types and build.
