"use client";
import { SiteShell } from "@/components/site-shell";
export default function ProfileError({ reset }: { reset: () => void }) {
  return (
    <SiteShell>
      <h1 className="text-3xl font-semibold">
        Something interrupted this lookup
      </h1>
      <p className="my-5 text-[#b9beb6]">
        Please try again later, or return home to search another username.
      </p>
      <button
        onClick={reset}
        className="min-h-12 w-fit rounded-sm border border-white/30 px-5"
      >
        Try again
      </button>
    </SiteShell>
  );
}
