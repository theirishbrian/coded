import { SiteShell } from "@/components/site-shell";
export default function LoadingProfile() {
  return (
    <SiteShell>
      <div role="status">
        <h1 className="text-3xl font-semibold">
          Looking up the public profile…
        </h1>
        <p className="mt-4 text-[#b9beb6]">This usually takes a moment.</p>
      </div>
    </SiteShell>
  );
}
