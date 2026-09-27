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
        <dl className="mt-4 grid gap-3 sm:grid-cols-2">
          {summary.languages.map((language) => (
            <div
              key={language.name}
              className="flex min-w-0 justify-between gap-4 text-sm"
            >
              <dt className="min-w-0 break-words">{language.name}</dt>
              <dd className="shrink-0 text-[#b9beb6]">
                {language.repositories}{" "}
                {language.repositories === 1 ? "repository" : "repositories"}
              </dd>
            </div>
          ))}
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
