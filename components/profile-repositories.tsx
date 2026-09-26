import type { ProfileResult } from "@/lib/profile/get-profile";
import { repositoriesFor } from "@/lib/profile/lookup";
import { RepositorySection } from "./repository-section";
export async function ProfileRepositories({
  profile,
}: {
  profile: ProfileResult;
}) {
  const result = await repositoriesFor(profile);
  return result ? <RepositorySection result={result} /> : null;
}
