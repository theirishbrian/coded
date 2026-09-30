import type { PublicRepository } from "./get-repositories";

const timestamp = (value: string | null) =>
  value === null ? -1 : Date.parse(value);

/**
 * Highlights public interest and recency with a reproducible order. This is not
 * a repository-quality score and deliberately excludes forks and archives.
 */
export function selectProjectHighlights(
  repositories: PublicRepository[],
  limit = 3,
) {
  return repositories
    .filter((repository) => !repository.isFork && !repository.isArchived)
    .toSorted(
      (a, b) =>
        (b.stars ?? -1) - (a.stars ?? -1) ||
        timestamp(b.pushedAt) - timestamp(a.pushedAt) ||
        a.name.localeCompare(b.name, "en-GB"),
    )
    .slice(0, Math.max(0, limit));
}
