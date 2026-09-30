import type { ProfileResult } from "@/lib/profile/get-profile";
import { activityFor } from "@/lib/profile/lookup";
import { ActivitySection } from "./activity-section";

export async function ProfileActivity({ profile }: { profile: ProfileResult }) {
  const result = await activityFor(profile);
  return result ? <ActivitySection result={result} /> : null;
}
