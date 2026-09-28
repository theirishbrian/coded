# 0005: Privacy-conscious page analytics

- Status: Accepted
- Date: 2026-09-28
- Issue: [#28](https://github.com/theirishbrian/coded/issues/28)

## Context

Coded needs evidence about visits and profile-page use before expanding beyond
v0.1. Profile routes contain public GitHub usernames, which are unnecessary for
that aggregate signal. The current Vercel Hobby plan provides automatic pageviews
but not custom events.

## Decision

Use Vercel Web Analytics automatic pageviews. Pass every event through a browser-side
redaction function that replaces a complete `/u/<username>` path with
`/u/[username]` and removes that profile URL's query string and fragment. Collect
no custom events and make no product claim that requires submission, success,
failure or cross-day retention data.

## Consequences

Coded can compare homepage and profile-route traffic, referrers and coarse device
or location aggregates without exposing viewed usernames in analytics URLs. Direct
profile visits and homepage-to-profile journeys cannot be separated reliably, and
the dashboard cannot answer whether a lookup failed or whether someone returned
after the 24-hour visitor window. A future event plan requires a separate reviewed
decision and, under current Vercel pricing, a paid plan.
