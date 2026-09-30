import type {
  PublicRepository,
  RepositoriesResult,
} from "@/lib/profile/get-repositories";
import { selectProjectHighlights } from "@/lib/profile/select-project-highlights";

function formatDate(value: string | null) {
  if (!value) return "Unavailable";
  return new Intl.DateTimeFormat("en-GB", {
    dateStyle: "medium",
    timeZone: "UTC",
  }).format(new Date(value));
}

function licenceLabel(repository: PublicRepository) {
  if (!repository.license) return "Not reported";
  const { name, spdxId } = repository.license;
  return spdxId && spdxId !== "NOASSERTION" ? spdxId : name;
}

export function ProjectHighlights({
  result,
}: {
  result: Exclude<RepositoriesResult, { kind: "failure" }>;
}) {
  const eligibleCount = result.repositories.filter(
    (repository) => !repository.isFork && !repository.isArchived,
  ).length;
  const highlights = selectProjectHighlights(result.repositories);
  const sampleLabel =
    result.kind === "partial"
      ? "The repository lookup was interrupted, so these highlights use only the retrieved sample."
      : result.completeness === "page_limit"
        ? "GitHub reported more repositories beyond the 300-item limit, so these highlights use a capped sample."
        : null;

  return (
    <section
      aria-labelledby="project-highlights-heading"
      className="my-8 rounded-sm border border-[#d3ef8b]/35 bg-[#d3ef8b]/[0.035] p-5 sm:p-6"
    >
      <p className="font-mono text-xs uppercase tracking-widest text-[#d3ef8b]">
        Transparent selection
      </p>
      <h3
        id="project-highlights-heading"
        className="mt-2 text-xl font-semibold tracking-tight sm:text-2xl"
      >
        Project proof highlights
      </h3>
      <p className="mt-3 max-w-3xl text-sm leading-relaxed text-[#b9beb6]">
        Up to three original, non-archived repositories from the retrieved
        inventory. They are ordered by GitHub-reported stars, then latest push,
        then name. Stars indicate public interest and push dates indicate
        repository updates; neither measures code quality, effort, authorship or
        developer skill.
      </p>
      <p className="mt-2 text-sm text-[#b9beb6]">
        Selected {highlights.length} of {eligibleCount} eligible repositories.
      </p>
      {sampleLabel && (
        <p className="mt-3 text-sm font-semibold text-[#d3ef8b]">
          {sampleLabel}
        </p>
      )}

      {highlights.length === 0 ? (
        <p className="mt-5 text-sm leading-relaxed">
          No original, non-archived repository was available in the retrieved
          inventory. Forks and archived repositories remain visible below.
        </p>
      ) : (
        <ol className="mt-6 grid gap-4 lg:grid-cols-3">
          {highlights.map((repository, index) => (
            <li
              key={repository.id}
              className="flex min-w-0 flex-col rounded-sm border border-white/15 bg-[#111315] p-5"
            >
              <p className="font-mono text-xs uppercase tracking-widest text-[#d3ef8b]">
                Highlight {index + 1}
              </p>
              <h4 className="mt-2 break-words text-lg font-semibold">
                <a
                  href={repository.url}
                  className="inline-flex min-h-11 items-center text-[#d3ef8b] underline underline-offset-4"
                >
                  {repository.name}
                </a>
              </h4>
              <p className="mt-2 flex-1 whitespace-pre-wrap break-words text-sm leading-relaxed text-[#b9beb6]">
                {repository.description || "No description provided."}
              </p>
              {repository.topics.length > 0 && (
                <ul
                  aria-label={`${repository.name} topics`}
                  className="mt-4 flex flex-wrap gap-2"
                >
                  {repository.topics.slice(0, 5).map((topic) => (
                    <li
                      key={topic}
                      className="rounded-full border border-white/20 px-2 py-1 text-xs text-[#b9beb6]"
                    >
                      {topic}
                    </li>
                  ))}
                </ul>
              )}
              <dl className="mt-5 grid grid-cols-2 gap-x-4 gap-y-3 text-sm">
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
                  <dd>{formatDate(repository.pushedAt)}</dd>
                </div>
                <div>
                  <dt className="text-[#b9beb6]">Language</dt>
                  <dd className="break-words">
                    {repository.primaryLanguage ?? "Unavailable"}
                  </dd>
                </div>
                <div>
                  <dt className="text-[#b9beb6]">Licence</dt>
                  <dd className="break-words">{licenceLabel(repository)}</dd>
                </div>
              </dl>
              {repository.homepageUrl && (
                <a
                  href={repository.homepageUrl}
                  rel="noreferrer"
                  className="mt-4 inline-flex min-h-11 items-center self-start text-sm font-semibold underline underline-offset-4"
                >
                  Visit project site{" "}
                  <span aria-hidden="true" className="ml-2">
                    ↗
                  </span>
                </a>
              )}
            </li>
          ))}
        </ol>
      )}
    </section>
  );
}
