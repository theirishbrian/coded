# Product analytics

Coded uses Vercel Web Analytics to answer one initial product question: do people
visit the homepage and continue to a generated profile? It records automatic
pageviews only. The application does not send custom events, form values, lookup
errors, GitHub API data or account identities.

## Privacy boundary

Vercel describes Web Analytics pageviews as anonymous aggregate data. It uses no
third-party cookies, does not associate a view with an IP address, and discards
its visitor-session hash after 24 hours. A pageview can otherwise contain its URL,
referrer, filtered query parameters, approximate location, browser, operating
system and device type.

Public GitHub usernames still identify people, so Coded removes them before an
event leaves the browser. Every `/u/<username>` URL, including an encoded name,
trailing slash, query string or fragment, is sent as `/u/[username]`. Other paths
are unchanged. This means the dashboard can compare homepage and profile-route
views without showing which profile was viewed.

The redaction is implemented in `lib/analytics/redact-profile-path.ts` and wired
through `components/privacy-safe-analytics.tsx`. Its tests are in
`tests/lib/analytics/redact-profile-path.test.ts`.

## Current limits

The Vercel Hobby plan includes 50,000 events per month and a one-month reporting
window. Collection pauses rather than creating an extra charge if the allowance
is exhausted. Custom events require Pro, so this setup cannot measure submissions,
lookup failures, successful lookups as a separate event, or repeat use across days.
The 24-hour visitor hash also makes a cross-day retention claim inappropriate.

## Weekly review

Review only these aggregate signals until evidence justifies a broader plan:

1. Homepage pageviews and visitors.
2. `/u/[username]` pageviews and visitors.
3. Referring domains.
4. Country and device-type distributions for basic reach and usability context.

Treat the ratio between profile-route and homepage views as directional. Shared
profile links can open the profile directly, and automatic pageviews do not prove
that a lookup succeeded or that a visitor found the result useful. Record dates
and screenshots or exports when a product decision relies on the dashboard.

## Operation and removal

Web Analytics must be enabled for the `coded` project in Vercel before the
component sends production data. After a production deployment, visit `/` and a
profile route, confirm that the browser sends analytics requests, and confirm that
Vercel reports only `/` and `/u/[username]` after processing.

To stop collection, disable Web Analytics in the Vercel project and remove
`PrivacySafeAnalytics` from `app/layout.tsx`. Removing the package is optional only
if no other code imports it.

## References

- [Vercel Web Analytics privacy](https://vercel.com/docs/analytics/privacy-policy)
- [Redacting sensitive data](https://vercel.com/docs/analytics/redacting-sensitive-data)
- [Package configuration](https://vercel.com/docs/analytics/package)
- [Limits and pricing](https://vercel.com/docs/analytics/limits-and-pricing)
