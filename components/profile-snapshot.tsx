import Image from "next/image";
import Link from "next/link";
import type { ActivityResult } from "@/lib/profile/get-activity";
import type {
  PublicRepository,
  RepositoriesResult,
} from "@/lib/profile/get-repositories";
import type { PublicProfile } from "@/lib/profile/get-profile";
import { selectProjectHighlights } from "@/lib/profile/select-project-highlights";
import { summarizeActivity } from "@/lib/profile/summarize-activity";
import { summarizeLanguages } from "@/lib/profile/summarize-languages";
import { PrintSnapshotButton } from "./print-snapshot-button";

function formatDate(value: string) {
  return new Intl.DateTimeFormat("en-GB", {
    dateStyle: "medium",
    timeZone: "UTC",
  }).format(new Date(value));
}

function projectDate(value: string | null) {
  return value ? formatDate(value) : "Unavailable";
}

function licenceLabel(repository: PublicRepository) {
  if (!repository.license) return "Not reported";
  return repository.license.spdxId &&
    repository.license.spdxId !== "NOASSERTION"
    ? repository.license.spdxId
    : repository.license.name;
}

function repositoryCoverage(
  result: Exclude<RepositoriesResult, { kind: "failure" }>,
) {
  if (result.kind === "partial")
    return "Incomplete repository sample: the lookup stopped after the displayed source pages.";
  if (result.completeness === "page_limit")
    return "Capped repository sample: GitHub reported more results beyond Coded’s three-page limit.";
  return `Complete endpoint traversal at retrieval time: ${result.repositories.length} repositories across ${result.source.pagesFetched} page(s).`;
}

function activityCoverage(
  result: Exclude<ActivityResult, { kind: "failure" }>,
) {
  if (result.kind === "partial")
    return "Incomplete activity sample: the lookup stopped after the displayed source pages.";
  if (result.completeness === "page_limit")
    return "Capped activity sample: limited to the newest 300 public events.";
  return `${result.events.length} public event${result.events.length === 1 ? "" : "s"} returned in GitHub’s available 30-day window.`;
}

export function ProfileSnapshot({
  profile,
  repositories,
  activity,
}: {
  profile: PublicProfile;
  repositories: RepositoriesResult;
  activity: ActivityResult;
}) {
  const repositorySnapshot =
    repositories.kind === "failure" ? null : repositories;
  const activitySnapshot = activity.kind === "failure" ? null : activity;
  const highlights = repositorySnapshot
    ? selectProjectHighlights(repositorySnapshot.repositories)
    : [];
  const languageSummary = repositorySnapshot
    ? summarizeLanguages(repositorySnapshot.repositories)
    : null;
  const leadingLanguages = languageSummary
    ? [...languageSummary.languages]
        .sort(
          (a, b) =>
            b.repositories - a.repositories ||
            a.name.localeCompare(b.name, "en-GB"),
        )
        .slice(0, 5)
    : [];
  const activitySummary = activitySnapshot
    ? summarizeActivity(activitySnapshot.events)
    : [];

  return (
    <main className="snapshot-page mx-auto min-h-svh max-w-5xl px-6 py-8 sm:px-10">
      <div className="snapshot-actions mb-6 flex flex-wrap items-center justify-between gap-3">
        <Link
          href={`/u/${encodeURIComponent(profile.username)}`}
          className="inline-flex min-h-11 items-center font-semibold text-[#d3ef8b] underline underline-offset-4"
        >
          ← Back to full profile
        </Link>
        <PrintSnapshotButton />
      </div>

      <article
        className="snapshot-surface rounded-sm border border-white/15 bg-white/[0.025] p-6 sm:p-9"
        aria-labelledby="snapshot-heading"
      >
        <header className="snapshot-block border-b border-white/15 pb-6">
          <div className="flex items-center justify-between gap-4">
            <p className="text-2xl font-bold tracking-tight">
              coded<span className="text-[#d3ef8b]">.</span>
            </p>
            <p className="font-mono text-xs uppercase tracking-widest text-[#b9beb6]">
              Public developer snapshot
            </p>
          </div>
          <div className="mt-7 flex items-center gap-5">
            <Image
              src={profile.avatarUrl}
              alt={`${profile.username}'s GitHub avatar`}
              width={80}
              height={80}
              unoptimized
              className="rounded-full border border-white/20"
            />
            <div className="min-w-0">
              <h1
                id="snapshot-heading"
                className="break-words text-3xl font-semibold tracking-tight sm:text-4xl"
              >
                {profile.displayName || profile.username}
              </h1>
              <p className="mt-1 break-all font-mono text-[#d3ef8b]">
                @{profile.username}
              </p>
            </div>
          </div>
          <p className="mt-5 max-w-3xl whitespace-pre-wrap text-base leading-relaxed text-[#b9beb6]">
            {profile.biography || "No public biography provided."}
          </p>
          <a
            href={profile.profileUrl}
            className="mt-3 inline-flex min-h-11 items-center font-semibold text-[#d3ef8b] underline underline-offset-4"
          >
            {profile.profileUrl}
          </a>
        </header>

        <section
          className="snapshot-block py-6"
          aria-labelledby="account-summary"
        >
          <h2 id="account-summary" className="text-xl font-semibold">
            Public account summary
          </h2>
          <dl className="mt-4 grid grid-cols-3 gap-3">
            {[
              ["Repositories", profile.counts.publicRepositories],
              ["Followers", profile.counts.followers],
              ["Following", profile.counts.following],
            ].map(([label, value]) => (
              <div
                key={label}
                className="snapshot-card rounded-sm border border-white/15 p-4"
              >
                <dt className="text-xs text-[#b9beb6]">{label}</dt>
                <dd className="mt-1 text-xl font-semibold">
                  {typeof value === "number"
                    ? value.toLocaleString("en-GB")
                    : "Unavailable"}
                </dd>
              </div>
            ))}
          </dl>
        </section>

        <section
          className="snapshot-block border-t border-white/15 py-6"
          aria-labelledby="snapshot-projects"
        >
          <h2 id="snapshot-projects" className="text-xl font-semibold">
            Project proof highlights
          </h2>
          <p className="mt-2 text-sm leading-relaxed text-[#b9beb6]">
            Up to three original, non-archived repositories, ordered by
            GitHub-reported stars, latest push and name. This is not a quality
            or skill ranking.
          </p>
          {repositorySnapshot ? (
            <>
              {highlights.length ? (
                <ol className="mt-4 grid gap-3 sm:grid-cols-3">
                  {highlights.map((repository) => (
                    <li
                      key={repository.id}
                      className="snapshot-card rounded-sm border border-white/15 p-4"
                    >
                      <h3 className="break-words font-semibold">
                        <a
                          href={repository.url}
                          className="text-[#d3ef8b] underline underline-offset-4"
                        >
                          {repository.name}
                        </a>
                      </h3>
                      <p className="mt-2 line-clamp-3 text-sm leading-relaxed text-[#b9beb6]">
                        {repository.description || "No description provided."}
                      </p>
                      <dl className="mt-3 grid grid-cols-2 gap-2 text-xs">
                        <div>
                          <dt className="text-[#b9beb6]">Stars</dt>
                          <dd>
                            {repository.stars === null
                              ? "Unavailable"
                              : repository.stars.toLocaleString("en-GB")}
                          </dd>
                        </div>
                        <div>
                          <dt className="text-[#b9beb6]">Last push</dt>
                          <dd>{projectDate(repository.pushedAt)}</dd>
                        </div>
                        <div>
                          <dt className="text-[#b9beb6]">Language</dt>
                          <dd>{repository.primaryLanguage ?? "Unavailable"}</dd>
                        </div>
                        <div>
                          <dt className="text-[#b9beb6]">Licence</dt>
                          <dd>{licenceLabel(repository)}</dd>
                        </div>
                      </dl>
                    </li>
                  ))}
                </ol>
              ) : (
                <p className="mt-4 text-sm">
                  No eligible original, non-archived repository was available.
                </p>
              )}
              <p className="mt-3 text-xs leading-relaxed text-[#b9beb6]">
                {repositoryCoverage(repositorySnapshot)}
              </p>
            </>
          ) : (
            <p className="mt-4 text-sm text-[#ffb5a7]">
              Repository data was unavailable. Missing data is not reported as
              zero.
            </p>
          )}
        </section>

        <div className="grid gap-6 border-t border-white/15 py-6 sm:grid-cols-2">
          <section
            className="snapshot-block"
            aria-labelledby="snapshot-languages"
          >
            <h2 id="snapshot-languages" className="text-xl font-semibold">
              Leading repository languages
            </h2>
            {languageSummary ? (
              <>
                {leadingLanguages.length ? (
                  <dl className="mt-4 grid gap-2 text-sm">
                    {leadingLanguages.map((language) => (
                      <div
                        key={language.name}
                        className="flex justify-between gap-4 border-b border-white/10 pb-2"
                      >
                        <dt>{language.name}</dt>
                        <dd>
                          {language.repositories} of {languageSummary.total}
                        </dd>
                      </div>
                    ))}
                  </dl>
                ) : (
                  <p className="mt-4 text-sm">
                    No primary languages were reported.
                  </p>
                )}
                <p className="mt-3 text-xs leading-relaxed text-[#b9beb6]">
                  One primary language per retrieved repository; this is not
                  code volume or proficiency. Unreported:{" "}
                  {languageSummary.unreported} of {languageSummary.total}.
                </p>
              </>
            ) : (
              <p className="mt-4 text-sm text-[#ffb5a7]">
                Language data was unavailable.
              </p>
            )}
          </section>

          <section
            className="snapshot-block"
            aria-labelledby="snapshot-activity"
          >
            <h2 id="snapshot-activity" className="text-xl font-semibold">
              Recent public activity
            </h2>
            {activitySnapshot ? (
              <>
                {activitySummary.length ? (
                  <dl className="mt-4 grid grid-cols-2 gap-2 text-sm">
                    {activitySummary.map((item) => (
                      <div
                        key={item.kind}
                        className="snapshot-card rounded-sm border border-white/15 p-3"
                      >
                        <dt className="text-xs text-[#b9beb6]">{item.label}</dt>
                        <dd className="mt-1 text-lg font-semibold">
                          {item.count}
                        </dd>
                      </div>
                    ))}
                  </dl>
                ) : (
                  <p className="mt-4 text-sm">
                    GitHub returned no public events in its available window.
                  </p>
                )}
                <p className="mt-3 text-xs leading-relaxed text-[#b9beb6]">
                  {activityCoverage(activitySnapshot)} Private,
                  organization-limited, offline and older work is outside this
                  view.
                </p>
              </>
            ) : (
              <p className="mt-4 text-sm text-[#ffb5a7]">
                Recent activity was unavailable. Missing data is not reported as
                inactivity.
              </p>
            )}
          </section>
        </div>

        <footer className="snapshot-block border-t border-white/15 pt-5 text-xs leading-relaxed text-[#b9beb6]">
          <p>
            Generated from public GitHub data by Coded. Public data is partial
            and is not a measure of skill, effort, quality or authorship.
          </p>
          <ul className="mt-3 flex flex-wrap gap-x-5 gap-y-2">
            <li>
              <a
                href={profile.source.url}
                className="underline underline-offset-4"
              >
                Account source
              </a>{" "}
              · retrieved {formatDate(profile.source.retrievedAt)} UTC
            </li>
            {repositorySnapshot && (
              <li>
                <a
                  href={repositorySnapshot.source.urls[0]}
                  className="underline underline-offset-4"
                >
                  Repository sources
                </a>{" "}
                · retrieved {formatDate(repositorySnapshot.source.retrievedAt)}{" "}
                UTC
              </li>
            )}
            {activitySnapshot && (
              <li>
                <a
                  href={activitySnapshot.source.urls[0]}
                  className="underline underline-offset-4"
                >
                  Activity sources
                </a>{" "}
                · retrieved {formatDate(activitySnapshot.source.retrievedAt)}{" "}
                UTC
              </li>
            )}
          </ul>
        </footer>
      </article>
    </main>
  );
}
