import type { RepositoriesResult } from "@/lib/profile/get-repositories";
import { summarizeLanguages } from "@/lib/profile/summarize-languages";

export function RepositoryLanguages({
  result,
}: {
  result: Exclude<RepositoriesResult, { kind: "failure" }>;
}) {
  const summary = summarizeLanguages(result.repositories);
  if (summary.total === 0) return null;
  return (
    <section
      aria-labelledby="repository-languages-heading"
      className="my-6 rounded-sm border border-white/15 p-5"
    >
      <h3 id="repository-languages-heading" className="text-lg font-semibold">
        Repository languages
      </h3>
      <p className="mt-2 text-sm leading-relaxed text-[#b9beb6]">
        Primary language reported by GitHub, counted once per retrieved
        repository. Based on all {summary.total} retrieved repositories,
        including forks and archived projects. This is not a breakdown of code
        volume or a measure of proficiency or authorship.
      </p>
      {result.completeness === "page_limit" && (
        <p className="mt-3 text-sm text-[#d3ef8b]">
          Capped sample: repositories beyond the first three pages are not
          included in these counts.
        </p>
      )}
      {result.kind === "partial" && (
        <p className="mt-3 text-sm text-[#ffb5a7]">
          Incomplete sample: these counts include only repositories retrieved
          before the interruption.
        </p>
      )}
      {summary.languages.length > 0 ? (
        <dl className="mt-5 grid gap-5">
          {summary.languages.map((language) => {
            const percentage = Math.round(
              (language.repositories / summary.total) * 100,
            );
            return (
              <div key={language.name} className="min-w-0 text-sm">
                <div className="flex min-w-0 flex-wrap justify-between gap-x-4 gap-y-1">
                  <dt className="min-w-0 break-words font-medium">
                    {language.name}
                  </dt>
                  <dd className="text-[#b9beb6]">
                    {language.repositories} of {summary.total} repositories (
                    {percentage}%)
                  </dd>
                </div>
                <div
                  aria-hidden="true"
                  className="mt-2 h-2 overflow-hidden rounded-full border border-white/15 bg-white/5"
                >
                  <div
                    className="h-full rounded-full bg-[#d3ef8b]"
                    style={{ width: `${percentage}%` }}
                  />
                </div>
              </div>
            );
          })}
        </dl>
      ) : (
        <p className="mt-4 text-sm">
          GitHub did not report a primary language for any retrieved repository.
        </p>
      )}
      <p className="mt-4 text-sm text-[#b9beb6]">
        Primary language not reported: {summary.unreported} of {summary.total}{" "}
        repositories. Counts use the repository sources and retrieval time
        below.
      </p>
    </section>
  );
}
