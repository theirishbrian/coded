import type { Metadata } from "next";
import { connection } from "next/server";
import { Suspense } from "react";
import { ProfileRepositories } from "@/components/profile-repositories";
import { ProfileActivity } from "@/components/profile-activity";
import { SiteShell } from "@/components/site-shell";
import { UsernameForm } from "@/components/username-form";
import { ProfileResultView } from "@/components/profile-result";
import { lookupProfile } from "@/lib/profile/lookup";

type ProfilePageProps = { params: Promise<{ username: string }> };

export async function generateMetadata({
  params,
}: ProfilePageProps): Promise<Metadata> {
  const { username } = await params;
  const result = await lookupProfile(username);
  const profile = result.kind === "success" ? result.profile : null;
  const handle = profile?.username ?? username.slice(0, 39);
  const name = profile?.displayName || handle;
  const title = profile
    ? `${name} (@${handle}) | Coded`
    : "Public profile | Coded";
  const description = profile?.biography
    ? `${profile.biography.slice(0, 150)} — public GitHub snapshot on Coded.`
    : `Explore @${handle}'s public GitHub profile, recent activity, repositories and languages on Coded.`;

  return {
    title,
    description,
    robots: { index: false, follow: false },
    alternates: { canonical: `/u/${encodeURIComponent(handle)}` },
    openGraph: { title, description, type: "website" },
    twitter: { card: "summary_large_image", title, description },
  };
}

export default async function ProfilePage({ params }: ProfilePageProps) {
  await connection();
  const { username } = await params;
  const result = await lookupProfile(username);
  return (
    <SiteShell>
      <ProfileResultView result={result} />
      <UsernameForm initialValue={username} />
      {result.kind === "success" && (
        <>
          <Suspense
            key={`activity-${result.profile.username}`}
            fallback={
              <div className="my-12 text-[#b9beb6]">
                <p role="status">Loading recent public activity…</p>
              </div>
            }
          >
            <ProfileActivity profile={result} />
          </Suspense>
          <Suspense
            key={`repositories-${result.profile.username}`}
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
        </>
      )}
    </SiteShell>
  );
}
