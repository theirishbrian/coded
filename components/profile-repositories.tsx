import type { ProfileResult } from "@/lib/profile/get-profile";
import { repositoriesFor } from "@/lib/profile/lookup";
import { RepositorySection } from "./repository-section";
import { ProfileChecklist } from "./profile-checklist";
export async function ProfileRepositories({
  profile,
}: {
  profile: ProfileResult;
}) {
  const result = await repositoriesFor(profile);
  return result && profile.kind === "success" ? (
    <>
      <ProfileChecklist profile={profile.profile} repositories={result} />
      <RepositorySection result={result} />
    </>
  ) : null;
}
