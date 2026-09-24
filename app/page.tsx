import { SiteShell } from "@/components/site-shell";
import { UsernameForm } from "@/components/username-form";
export default function Home() {
  return (
    <SiteShell>
      <p className="mb-6 font-mono text-xs uppercase tracking-[0.2em] text-[#d3ef8b]">
        Start with what’s public
      </p>
      <h1 className="max-w-4xl text-5xl leading-[1.08] font-semibold tracking-tight sm:text-7xl lg:text-8xl">
        Your work.
        <br />
        Your progress.
        <br />
        <span className="text-[#d3ef8b]">Proven.</span>
      </h1>
      <p className="mb-8 mt-6 max-w-lg text-lg leading-relaxed text-[#b9beb6]">
        Explore a public GitHub profile. A clear snapshot of an account today,
        with more of the story still to come.
      </p>
      <UsernameForm />
      <a
        href="https://github.com/theirishbrian/coded"
        className="mt-8 inline-flex min-h-11 w-fit items-center gap-3 text-sm text-[#b9beb6] underline underline-offset-4 hover:text-[#d3ef8b]"
      >
        Follow the project on GitHub <span aria-hidden="true">↗</span>
      </a>
    </SiteShell>
  );
}
