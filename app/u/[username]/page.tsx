import { connection } from "next/server";
import { SiteShell } from "@/components/site-shell";
import { UsernameForm } from "@/components/username-form";
import { ProfileResultView } from "@/components/profile-result";
import { lookupProfile } from "@/lib/profile/lookup";
export const metadata = {
  title: "Public profile | Coded",
  robots: { index: false, follow: false },
};
export default async function ProfilePage({
  params,
}: {
  params: Promise<{ username: string }>;
}) {
  await connection();
  const { username } = await params;
  const result = await lookupProfile(username);
  return (
    <SiteShell>
      <ProfileResultView result={result} />
      <UsernameForm initialValue={username} />
    </SiteShell>
  );
}
