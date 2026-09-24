import Image from "next/image";
import type { LookupResult } from "@/lib/profile/lookup-policy";
const failures = {
  invalid_input: [
    "Check that username",
    "Use 1–39 letters or numbers, with single hyphens between them. Enter a username rather than a URL.",
  ],
  not_found: [
    "Profile unavailable",
    "GitHub did not return a public account for this username. It may not exist, or it may not be publicly accessible.",
  ],
  unsupported_account: [
    "Personal accounts only, for now",
    "Coded currently supports personal GitHub accounts. Organization and bot profiles are not supported yet.",
  ],
  access_denied: [
    "GitHub access unavailable",
    "GitHub declined this request. Please try again later.",
  ],
  rate_limited: [
    "Taking a short break",
    "GitHub has temporarily limited lookups. Please wait before trying again.",
  ],
  busy: [
    "Lookups are busy",
    "This server has reached its lookup limit. Please wait before trying again.",
  ],
  timeout: [
    "GitHub took too long",
    "The lookup timed out. Please try again in a little while.",
  ],
  network_error: [
    "Could not reach GitHub",
    "The connection failed. Please try again later.",
  ],
  upstream_error: [
    "GitHub is temporarily unavailable",
    "We could not complete this lookup. Please try again later.",
  ],
  malformed_response: [
    "Profile data unavailable",
    "GitHub returned data we could not safely read. Please try again later.",
  ],
} as const;
export function ProfileResultView({ result }: { result: LookupResult }) {
  if (result.kind !== "success") {
    const [title, detail] = failures[result.kind];
    const retry =
      "retryAfterSeconds" in result ? result.retryAfterSeconds : null;
    return (
      <section className="mb-10 max-w-2xl" aria-labelledby="profile-heading">
        <p className="mb-4 font-mono text-xs uppercase tracking-widest text-[#d3ef8b]">
          Public profile lookup
        </p>
        <h1
          id="profile-heading"
          className="text-3xl font-semibold tracking-tight sm:text-5xl"
        >
          {title}
        </h1>
        <p className="mt-5 leading-relaxed text-[#b9beb6]">{detail}</p>
        {retry !== null ? (
          <p className="mt-3 text-sm text-[#b9beb6]">
            Suggested wait: at least{" "}
            {Math.max(1, Math.ceil(retry / 60)).toLocaleString("en-GB")}{" "}
            minute(s). Nothing retries automatically.
          </p>
        ) : null}
      </section>
    );
  }
  const { profile } = result;
  const counts = [
    ["Public repositories", profile.counts.publicRepositories],
    ["Followers", profile.counts.followers],
    ["Following", profile.counts.following],
  ] as const;
  return (
    <article className="mb-12" aria-labelledby="profile-heading">
      <p className="mb-6 font-mono text-xs uppercase tracking-widest text-[#d3ef8b]">
        A public snapshot
      </p>
      <div className="flex flex-col gap-6 sm:flex-row sm:items-center">
        <Image
          src={profile.avatarUrl}
          alt={`${profile.username}'s GitHub avatar`}
          width={96}
          height={96}
          unoptimized
          className="rounded-full border border-white/20"
        />
        <div className="min-w-0">
          <h1
            id="profile-heading"
            className="break-words text-4xl font-semibold tracking-tight sm:text-5xl"
          >
            {profile.displayName || profile.username}
          </h1>
          <p className="mt-2 break-all font-mono text-[#d3ef8b]">
            @{profile.username}
          </p>
        </div>
      </div>
      <p className="mt-6 max-w-2xl whitespace-pre-wrap break-words text-lg leading-relaxed text-[#b9beb6]">
        {profile.biography || "No public biography provided."}
      </p>
      <a
        href={profile.profileUrl}
        className="mt-5 inline-flex min-h-11 items-center text-sm font-semibold text-[#d3ef8b] underline underline-offset-4"
      >
        View on GitHub{" "}
        <span aria-hidden="true" className="ml-2">
          ↗
        </span>
      </a>
      <dl className="my-8 grid gap-3 sm:grid-cols-3">
        {counts.map(([label, count]) => (
          <div
            key={label}
            className="rounded-sm border border-white/15 bg-white/[0.025] p-5"
          >
            <dt className="text-sm text-[#b9beb6]">{label}</dt>
            <dd className="mt-3 break-words text-3xl font-semibold">
              {count === null ? "Unavailable" : count.toLocaleString("en-GB")}
            </dd>
          </div>
        ))}
      </dl>
      <div className="max-w-3xl border-l-2 border-[#d3ef8b]/60 pl-4 text-sm leading-relaxed text-[#b9beb6]">
        <p>
          Counts are reported by GitHub’s public API. Private profiles may
          report zero followers or following. Public data is a partial view of
          someone’s work, not a measure of skill.
        </p>
        <p className="mt-3">
          Retrieved{" "}
          <time dateTime={profile.source.retrievedAt}>
            {new Intl.DateTimeFormat("en-GB", {
              dateStyle: "medium",
              timeStyle: "short",
              timeZone: "UTC",
            }).format(new Date(profile.source.retrievedAt))}{" "}
            UTC
          </time>
          . Results may be reused for up to five minutes; reload to request a
          fresh view after that.
        </p>
        <a
          href={profile.source.url}
          className="mt-2 inline-flex min-h-11 items-center underline underline-offset-4"
        >
          View source data on GitHub
        </a>
      </div>
    </article>
  );
}
