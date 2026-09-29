# Profile sharing

Every `/u/[username]` page publishes profile-specific title and description
metadata plus a 1200×630 Open Graph image. X and other compatible services can
use that image when a public profile URL is shared. The image contains Coded's
branding, the account name and username, the public biography when available,
and the account counts reported by GitHub.

The image and metadata use the same validated public account boundary as the
visible profile. Failed or invalid lookups receive a generic Coded card rather
than an error response. Repository details are deliberately excluded so social
image requests do not trigger repository pagination.

The **Share profile** button uses the browser's native share sheet when
available. Otherwise it copies the canonical `/u/[username]` URL to the
clipboard. Coded does not choose a destination, post on a visitor's behalf,
store a share, or attach tracking parameters. When neither browser capability
is available, the interface asks the visitor to copy the address manually.

The root metadata base uses Vercel's production project URL in production and
the active Vercel deployment URL as a fallback. Local development uses
`http://localhost:3000`; no custom environment variable is required. Isolated
test or nonstandard local servers can set `CODED_SITE_URL` to their public
origin so generated absolute metadata stays on that server.
