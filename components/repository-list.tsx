import type { PublicRepository } from "@/lib/profile/get-repositories";

function Cards({ repositories }: { repositories: PublicRepository[] }) {
  return (
    <ul className="grid gap-4 sm:grid-cols-2">
      {repositories.map((repo) => (
        <li
          key={repo.id}
          className="min-w-0 rounded-sm border border-white/15 bg-white/[0.025] p-5"
        >
          <h3 className="break-words text-lg font-semibold">
            <a
              href={repo.url}
              className="inline-block min-h-11 py-2 text-[#d3ef8b] underline underline-offset-4"
            >
              {repo.name}
            </a>
          </h3>
          <div className="flex flex-wrap gap-2 text-xs text-[#b9beb6]">
            {repo.isFork && (
              <span className="border border-white/20 px-2 py-1">Fork</span>
            )}
            {repo.isArchived && (
              <span className="border border-white/20 px-2 py-1">Archived</span>
            )}
          </div>
          <p className="mt-3 whitespace-pre-wrap break-words text-sm leading-relaxed text-[#b9beb6]">
            {repo.description || "No description provided."}
          </p>
          <dl className="mt-5 flex flex-wrap gap-x-6 gap-y-3 text-sm">
            <div className="min-w-0">
              <dt className="text-[#b9beb6]">Primary language</dt>
              <dd className="break-words">
                {repo.primaryLanguage ?? "Unavailable"}
              </dd>
            </div>
            <div>
              <dt className="text-[#b9beb6]">Stars</dt>
              <dd>
                {repo.stars === null
                  ? "Unavailable"
                  : repo.stars.toLocaleString("en-GB")}
              </dd>
            </div>
            <div>
              <dt className="text-[#b9beb6]">Forks</dt>
              <dd>
                {repo.forks === null
                  ? "Unavailable"
                  : repo.forks.toLocaleString("en-GB")}
              </dd>
            </div>
          </dl>
        </li>
      ))}
    </ul>
  );
}

/** Native keyboard disclosure; all items are already fetched with no client component. */
export function RepositoryList({
  repositories,
}: {
  repositories: PublicRepository[];
}) {
  const remaining = repositories.slice(12);
  return (
    <>
      <p className="mb-4 text-sm text-[#b9beb6]">
        First {Math.min(12, repositories.length)} of {repositories.length}{" "}
        retrieved repositories, in full-name order (A–Z).
      </p>
      <Cards repositories={repositories.slice(0, 12)} />
      {remaining.length > 0 && (
        <details className="mt-5">
          <summary className="min-h-12 cursor-pointer py-3 font-semibold text-[#d3ef8b]">
            Show {remaining.length} more repositories
          </summary>
          <p className="mb-4 text-sm text-[#b9beb6]">
            All {repositories.length} retrieved repositories are now visible on
            this page. No additional lookup is needed.
          </p>
          <Cards repositories={remaining} />
        </details>
      )}
    </>
  );
}
