import type { PublicProfile } from "./get-profile";
import type { PublicRepository, RepositoriesResult } from "./get-repositories";

export interface ProfileChecklistItem {
  id: string;
  kind: "complete" | "action";
  title: string;
  detail: string;
  repositories: Array<Pick<PublicRepository, "name" | "url">>;
}

export interface ProfileChecklist {
  items: ProfileChecklistItem[];
  repositoryCoverage: "complete" | "capped" | "partial" | "unavailable";
}

const linksFor = (repositories: PublicRepository[]) =>
  repositories.slice(0, 3).map(({ name, url }) => ({ name, url }));

function repositoryItem(
  id: string,
  completeTitle: string,
  actionTitle: string,
  detail: string,
  eligible: PublicRepository[],
  isComplete: (repository: PublicRepository) => boolean,
): ProfileChecklistItem {
  const missing = eligible.filter((repository) => !isComplete(repository));
  return missing.length === 0
    ? {
        id,
        kind: "complete",
        title: completeTitle,
        detail: `All ${eligible.length.toLocaleString("en-GB")} eligible project${eligible.length === 1 ? "" : "s"} meet this public-profile check.`,
        repositories: [],
      }
    : {
        id,
        kind: "action",
        title: actionTitle,
        detail: `${detail} ${missing.length.toLocaleString("en-GB")} of ${eligible.length.toLocaleString("en-GB")} eligible project${eligible.length === 1 ? "" : "s"} could be clearer to visitors.`,
        repositories: linksFor(missing),
      };
}

export function buildProfileChecklist(
  profile: PublicProfile,
  result: RepositoriesResult,
): ProfileChecklist {
  const items: ProfileChecklistItem[] = [
    profile.biography?.trim()
      ? {
          id: "biography",
          kind: "complete",
          title: "Public biography is present",
          detail: "GitHub reports a public biography for this account.",
          repositories: [],
        }
      : {
          id: "biography",
          kind: "action",
          title: "Add a public biography",
          detail:
            "A short GitHub biography can explain the work or interests behind this profile.",
          repositories: [],
        },
  ];

  if (result.kind === "failure")
    return { items, repositoryCoverage: "unavailable" };

  const eligible = result.repositories.filter(
    (repository) => !repository.isFork && !repository.isArchived,
  );
  const repositoryCoverage =
    result.kind === "partial"
      ? "partial"
      : result.completeness === "page_limit"
        ? "capped"
        : "complete";

  if (eligible.length === 0) {
    if (repositoryCoverage === "complete")
      items.push({
        id: "original-project",
        kind: "action",
        title: "Publish an original public project",
        detail:
          "GitHub returned no original, non-archived public repository for this account.",
        repositories: [],
      });
    return { items, repositoryCoverage };
  }

  items.push({
    id: "original-project",
    kind: "complete",
    title: "Original public work is visible",
    detail: `${eligible.length.toLocaleString("en-GB")} original, non-archived public project${eligible.length === 1 ? " is" : "s are"} available in the retrieved sample.`,
    repositories: [],
  });
  items.push(
    repositoryItem(
      "descriptions",
      "Project descriptions are in place",
      "Add missing project descriptions",
      "Descriptions help visitors understand a repository before opening it.",
      eligible,
      (repository) => Boolean(repository.description?.trim()),
    ),
    repositoryItem(
      "licences",
      "Project licences are reported",
      "Add missing project licences",
      "A licence makes the permitted reuse of public work clearer.",
      eligible,
      (repository) => repository.license !== null,
    ),
    repositoryItem(
      "discovery",
      "Project discovery details are present",
      "Add topics or project links",
      "Topics and project links give visitors more context and paths to explore.",
      eligible,
      (repository) =>
        repository.topics.length > 0 || repository.homepageUrl !== null,
    ),
  );
  return { items, repositoryCoverage };
}
