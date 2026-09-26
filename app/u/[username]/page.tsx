import { connection } from "next/server";
import { Suspense } from "react";
import { ProfileRepositories } from "@/components/profile-repositories";
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
      {result.kind === "success" && (
        <Suspense
          key={result.profile.username}
          fallback={
            <div className="my-12 text-[#b9beb6]">
              <p role="status">Loading public repositories…</p>
              <noscript>
                <p className="mt-3">
                  Showing repositories here requires JavaScript. You can also{" "}
                  <a
                    className="underline underline-offset-4"
                    href={`${result.profile.profileUrl}?tab=repositories`}
                  >
                    view repositories on GitHub
                  </a>
                  .
                </p>
              </noscript>
            </div>
          }
        >
          <ProfileRepositories profile={result} />
        </Suspense>
      )}
    </SiteShell>
  );
}
