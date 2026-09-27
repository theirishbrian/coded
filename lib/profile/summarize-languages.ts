import type { PublicRepository } from "./get-repositories";

/** Count each retrieved repository once; this is not a byte or proficiency metric. */
export function summarizeLanguages(repositories: readonly PublicRepository[]) {
  const seen = new Set<number>();
  const counts = new Map<string, number>();
  let unreported = 0;
  for (const repository of repositories) {
    if (seen.has(repository.id)) continue;
    seen.add(repository.id);
    const language = repository.primaryLanguage?.trim();
    if (!language) unreported++;
    else counts.set(language, (counts.get(language) ?? 0) + 1);
  }
  return {
    total: seen.size,
    unreported,
    languages: [...counts]
      .sort(([a], [b]) => (a < b ? -1 : a > b ? 1 : 0))
      .map(([name, repositories]) => ({ name, repositories })),
  };
}
