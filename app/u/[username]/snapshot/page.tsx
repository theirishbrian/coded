import type { Metadata } from "next";
import { connection } from "next/server";
import { ProfileResultView } from "@/components/profile-result";
import { ProfileSnapshot } from "@/components/profile-snapshot";
import { SiteShell } from "@/components/site-shell";
import {
  activityFor,
  lookupProfile,
  repositoriesFor,
} from "@/lib/profile/lookup";

type SnapshotPageProps = { params: Promise<{ username: string }> };

export async function generateMetadata({
  params,
}: SnapshotPageProps): Promise<Metadata> {
  const { username } = await params;
  const result = await lookupProfile(username);
  const profile = result.kind === "success" ? result.profile : null;
  const handle = profile?.username ?? username.slice(0, 39);
  const name = profile?.displayName || handle;
  return {
    title: `${name} (@${handle}) — printable snapshot | Coded`,
    description: `A concise, print-ready snapshot of @${handle}'s public GitHub profile.`,
    robots: { index: false, follow: false },
    alternates: { canonical: `/u/${encodeURIComponent(handle)}` },
  };
}

export default async function SnapshotPage({ params }: SnapshotPageProps) {
  await connection();
  const { username } = await params;
  const result = await lookupProfile(username);
  if (result.kind !== "success") {
    return (
      <SiteShell>
        <ProfileResultView result={result} />
      </SiteShell>
    );
  }

  const [repositories, activity] = await Promise.all([
    repositoriesFor(result),
    activityFor(result),
  ]);

  if (!repositories || !activity) return null;
  return (
    <ProfileSnapshot
      profile={result.profile}
      repositories={repositories}
      activity={activity}
    />
  );
}
