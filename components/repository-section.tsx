import type { RepositoriesResult } from "@/lib/profile/get-repositories";
import type { GitHubFailure } from "@/lib/github/get-json";
import { RepositoryList } from "./repository-list";

function FailureNotice({ failure }: { failure: GitHubFailure }) {
  return (
    <p className="my-4 text-sm leading-relaxed text-[#ffb5a7]">
      {failure.kind === "rate_limited"
        ? "GitHub has temporarily limited lookups."
        : failure.kind === "busy"
          ? "This server has reached its lookup limit."
          : "Repository lookup could not be completed. Please try again later."}
      {"retryAfterSeconds" in failure &&
        failure.retryAfterSeconds !== null &&
        ` Suggested wait: at least ${Math.max(1, Math.ceil(failure.retryAfterSeconds / 60))} minute(s).`}
      {" Nothing retries automatically."}
    </p>
  );
}

export function RepositorySection({ result }: { result: RepositoriesResult }) {
  return (
    <section
      aria-labelledby="repositories-heading"
      className="my-12 border-t border-white/15 pt-10"
    >
      <h2
        id="repositories-heading"
        className="text-2xl font-semibold tracking-tight sm:text-3xl"
      >
        Public repositories
      </h2>
      <p className="my-4 max-w-3xl text-sm leading-relaxed text-[#b9beb6]">
        Owned public repositories, including forks and archived projects. This
        is a partial view of someone’s work, not their full contribution
        history. Primary language describes the repository, not proficiency.
      </p>
      {result.kind === "failure" ? (
        <>
          <h3 className="font-semibold">Repository data unavailable</h3>
          <FailureNotice failure={result.failure} />
        </>
      ) : (
        <>
          {result.completeness === "page_limit" && (
            <p className="my-4 text-[#d3ef8b]">
              Limited to the first 300 repositories. GitHub reports additional
              pages.
            </p>
          )}
          {result.kind === "partial" && (
            <>
              <p className="my-4 font-semibold">
                Incomplete results: showing only the data retrieved before the
                lookup stopped.
              </p>
              <FailureNotice failure={result.failure} />
            </>
          )}
          {result.repositories.length > 0 ? (
            <RepositoryList repositories={result.repositories} />
          ) : (
            <p className="my-6">
              {result.kind === "partial"
                ? "No repository items were retrieved before the interruption. This does not establish that the account has no repositories."
                : "No owned public repositories were returned by GitHub."}
            </p>
          )}
          <p className="mt-6 text-sm leading-relaxed text-[#b9beb6]">
            Retrieved{" "}
            <time dateTime={result.source.retrievedAt}>
              {new Intl.DateTimeFormat("en-GB", {
                dateStyle: "medium",
                timeStyle: "short",
                timeZone: "UTC",
              }).format(new Date(result.source.retrievedAt))}{" "}
              UTC
            </time>{" "}
            from {result.source.pagesFetched} page(s).{" "}
            {result.kind === "success"
              ? "Results may be reused for up to five minutes; reload after that to request a fresh view."
              : "This incomplete result is not cached."}{" "}
            Pagination can miss changes made during retrieval.
          </p>
          <ul className="mt-2 flex flex-wrap gap-x-6 text-sm text-[#b9beb6]">
            {result.source.urls.map((url, index) => (
              <li key={url}>
                <a
                  className="inline-flex min-h-11 items-center underline underline-offset-4"
                  href={url}
                >
                  GitHub source page {index + 1}
                </a>
              </li>
            ))}
          </ul>
        </>
      )}
    </section>
  );
}
