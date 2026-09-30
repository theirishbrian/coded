"use client";

import { useMemo, useState } from "react";
import type { PublicRepository } from "@/lib/profile/get-repositories";

type RepositorySort = "github" | "updated" | "stars";

function formatDate(value: string | null) {
  if (!value) return "Unavailable";
  return new Intl.DateTimeFormat("en-GB", {
    dateStyle: "medium",
    timeZone: "UTC",
  }).format(new Date(value));
}

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
            <div>
              <dt className="text-[#b9beb6]">Updated</dt>
              <dd>{formatDate(repo.updatedAt)}</dd>
            </div>
          </dl>
        </li>
      ))}
    </ul>
  );
}

export function RepositoryList({
  repositories,
}: {
  repositories: PublicRepository[];
}) {
  const [query, setQuery] = useState("");
  const [includeForks, setIncludeForks] = useState(true);
  const [includeArchived, setIncludeArchived] = useState(true);
  const [sort, setSort] = useState<RepositorySort>("github");
  const visible = useMemo(() => {
    const normalizedQuery = query.trim().toLocaleLowerCase("en-GB");
    const filtered = repositories.filter((repository) => {
      if (!includeForks && repository.isFork) return false;
      if (!includeArchived && repository.isArchived) return false;
      if (!normalizedQuery) return true;
      return [
        repository.name,
        repository.description,
        repository.primaryLanguage,
      ].some((value) =>
        value?.toLocaleLowerCase("en-GB").includes(normalizedQuery),
      );
    });
    if (sort === "github") return filtered;
    return filtered.toSorted((a, b) => {
      if (sort === "stars") {
        return (
          (b.stars ?? -1) - (a.stars ?? -1) || a.name.localeCompare(b.name)
        );
      }
      const aTime = a.updatedAt ? Date.parse(a.updatedAt) : -1;
      const bTime = b.updatedAt ? Date.parse(b.updatedAt) : -1;
      return bTime - aTime || a.name.localeCompare(b.name);
    });
  }, [includeArchived, includeForks, query, repositories, sort]);
  const remaining = visible.slice(12);
  const viewKey = `${query}:${includeForks}:${includeArchived}:${sort}`;

  return (
    <div role="region" aria-label="Repository explorer">
      <div className="mb-5 grid gap-4 rounded-sm border border-white/15 bg-white/[0.025] p-5 lg:grid-cols-[minmax(0,1fr)_auto]">
        <div>
          <label className="text-sm font-semibold" htmlFor="repository-search">
            Search repositories
          </label>
          <input
            id="repository-search"
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Name, description or language"
            className="mt-2 min-h-11 w-full rounded-sm border border-white/25 bg-[#111315] px-3 py-2 text-base"
          />
        </div>
        <div>
          <label className="text-sm font-semibold" htmlFor="repository-sort">
            Sort by
          </label>
          <select
            id="repository-sort"
            value={sort}
            onChange={(event) => setSort(event.target.value as RepositorySort)}
            className="mt-2 min-h-11 w-full rounded-sm border border-white/25 bg-[#111315] px-3 py-2 text-base"
          >
            <option value="github">GitHub order (A–Z)</option>
            <option value="updated">Recently updated</option>
            <option value="stars">Most stars</option>
          </select>
        </div>
        <fieldset className="flex flex-wrap gap-x-6 gap-y-3 lg:col-span-2">
          <legend className="sr-only">Repository types</legend>
          <label className="inline-flex min-h-11 cursor-pointer items-center gap-3">
            <input
              type="checkbox"
              checked={includeForks}
              onChange={(event) => setIncludeForks(event.target.checked)}
              className="size-5 accent-[#d3ef8b]"
            />
            Include forks
          </label>
          <label className="inline-flex min-h-11 cursor-pointer items-center gap-3">
            <input
              type="checkbox"
              checked={includeArchived}
              onChange={(event) => setIncludeArchived(event.target.checked)}
              className="size-5 accent-[#d3ef8b]"
            />
            Include archived
          </label>
        </fieldset>
      </div>
      <noscript>
        <p className="mb-4 text-sm text-[#b9beb6]">
          Repository filters require JavaScript. The full retrieved list remains
          available below.
        </p>
      </noscript>
      <p className="mb-4 text-sm text-[#b9beb6]" aria-live="polite">
        Showing {visible.length} of {repositories.length} retrieved
        repositories.
        {sort === "github" && " GitHub order (A–Z)."}
        {sort === "updated" && " Most recently updated first."}
        {sort === "stars" &&
          " Most stars first; popularity is not proficiency."}
      </p>
      {visible.length === 0 ? (
        <p className="rounded-sm border border-white/15 p-5">
          No retrieved repositories match these filters.
        </p>
      ) : (
        <div key={viewKey}>
          <Cards repositories={visible.slice(0, 12)} />
          {remaining.length > 0 && (
            <details className="mt-5">
              <summary className="min-h-12 cursor-pointer py-3 font-semibold text-[#d3ef8b]">
                Show {remaining.length} more repositories
              </summary>
              <p className="mb-4 text-sm text-[#b9beb6]">
                All {visible.length} matching repositories are now visible. No
                additional lookup is needed.
              </p>
              <Cards repositories={remaining} />
            </details>
          )}
        </div>
      )}
    </div>
  );
}
