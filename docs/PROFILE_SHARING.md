# Profile sharing

Every `/u/[username]` page publishes profile-specific title and description
metadata plus a 1200×630 Open Graph image. X and other compatible services can
use that image when a public profile URL is shared. The image contains Coded's
branding, the account name and username, the public biography when available,
and the account counts reported by GitHub.

The display name and handle are visually centred on the same line. Visitors can
use **Share card** to send the PNG and a caption containing the profile link
when their browser supports file sharing. Browsers without file sharing download
the PNG instead. **Download card** always saves it as
`coded-<username>.png`.

The image and metadata use the same validated public account boundary as the
visible profile. Failed or invalid lookups receive a generic Coded card rather
than an error response. Repository details are deliberately excluded so social
image requests do not trigger repository pagination.

The **Share profile** button uses the browser's native share sheet when
available. Otherwise it copies the canonical `/u/[username]` URL to the
clipboard. Coded does not choose a destination, post on a visitor's behalf,
store a share, or attach tracking parameters. When neither browser capability
is available, the interface asks the visitor to copy the address manually.
Sharing or downloading a card is initiated only by the visitor and is not
recorded by Coded.

Successful profiles also link to a dedicated printable snapshot at
`/u/[username]/snapshot`. It reuses the same validated account, repository and
activity services but omits the full repository explorer and interactive profile
controls. The snapshot contains up to three transparently selected projects, the
five most common reported primary languages and a bounded activity summary. Its
**Print or save as PDF** control opens the browser print dialog; Coded does not
generate, store or transmit a PDF. Print styles target a concise output on common
A4 and Letter settings while preserving source, freshness and coverage notices.

The root metadata base uses Vercel's production project URL in production and
the active Vercel deployment URL as a fallback. Local development uses
`http://localhost:3000`; no custom environment variable is required. Isolated
test or nonstandard local servers can set `CODED_SITE_URL` to their public
origin so generated absolute metadata stays on that server.
