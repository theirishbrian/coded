import type { PublicProfile } from "@/lib/profile/get-profile";
import type { RepositoriesResult } from "@/lib/profile/get-repositories";
import { buildProfileChecklist } from "@/lib/profile/profile-checklist";
import { BackToProfileTop } from "./profile-section-navigation";

const coverageText = {
  complete: null,
  capped:
    "Repository checks use the first 300 retrieved repositories; GitHub reported additional pages.",
  partial:
    "Repository checks use only the items retrieved before the lookup stopped. Unseen repositories are not assessed.",
  unavailable:
    "Repository checks are unavailable, so Coded is showing account-level guidance only.",
} as const;

export function ProfileChecklist({
  profile,
  repositories,
}: {
  profile: PublicProfile;
  repositories: RepositoriesResult;
}) {
  const checklist = buildProfileChecklist(profile, repositories);
  const coverage = coverageText[checklist.repositoryCoverage];
  return (
    <section
      id="profile-checklist"
      aria-labelledby="profile-checklist-heading"
      className="my-12 scroll-mt-6 border-t border-white/15 pt-10"
    >
      <p className="font-mono text-xs uppercase tracking-widest text-[#d3ef8b]">
        Actionable, not scored
      </p>
      <h2
        id="profile-checklist-heading"
        className="mt-3 text-2xl font-semibold tracking-tight sm:text-3xl"
      >
        Public profile checklist
      </h2>
      <p className="mt-4 max-w-3xl text-sm leading-relaxed text-[#b9beb6]">
        A deterministic review of public details the account owner can improve
        on GitHub. It is not a developer score, quality judgement or measure of
        employability.
      </p>
      {coverage ? (
        <p className="mt-4 max-w-3xl text-sm leading-relaxed text-[#ffcf8b]">
          {coverage}
        </p>
      ) : null}
      <ul className="mt-6 grid gap-3 sm:grid-cols-2">
        {checklist.items.map((item) => (
          <li
            key={item.id}
            className="rounded-sm border border-white/15 bg-white/[0.025] p-5"
          >
            <p className="text-xs font-semibold uppercase tracking-wider text-[#b9beb6]">
              {item.kind === "complete"
                ? "Public strength"
                : "Suggested action"}
            </p>
            <h3 className="mt-2 font-semibold">{item.title}</h3>
            <p className="mt-2 text-sm leading-relaxed text-[#b9beb6]">
              {item.detail}
            </p>
            {item.repositories.length > 0 ? (
              <ul className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-sm">
                {item.repositories.map((repository) => (
                  <li key={repository.url}>
                    <a
                      href={repository.url}
                      className="inline-flex min-h-11 items-center text-[#d3ef8b] underline underline-offset-4"
                    >
                      {repository.name}
                    </a>
                  </li>
                ))}
              </ul>
            ) : null}
          </li>
        ))}
      </ul>
      <p className="mt-5 max-w-3xl text-xs leading-relaxed text-[#b9beb6]">
        Rules inspect the public biography and original, non-archived
        repositories in the retrieved sample. Repository checks cover
        descriptions, detected licences, topics and project links. Coded cannot
        confirm authorship, effort, code quality or private work.
      </p>
      <BackToProfileTop />
    </section>
  );
}
