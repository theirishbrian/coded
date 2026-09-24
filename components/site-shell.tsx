import type { ReactNode } from "react";
import Link from "next/link";
export function SiteShell({ children }: { children: ReactNode }) {
  return (
    <div className="mx-auto flex min-h-svh max-w-6xl flex-col px-6 sm:px-12">
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:z-10 focus:bg-[#111315] focus:p-3"
      >
        Skip to content
      </a>
      <header className="flex flex-wrap items-center justify-between gap-4 border-b border-white/15 py-7">
        <Link
          href="/"
          aria-label="Coded home"
          className="text-2xl font-bold tracking-tight"
        >
          coded<span className="text-[#d3ef8b]">.</span>
        </Link>
        <span className="font-mono text-xs uppercase tracking-widest text-[#b9beb6]">
          Building in public
        </span>
      </header>
      <main
        id="main"
        tabIndex={-1}
        className="flex flex-1 flex-col justify-center py-12 sm:py-20"
      >
        {children}
      </main>
      <footer className="flex flex-col gap-2 border-t border-white/15 py-6 text-sm text-[#b9beb6] sm:flex-row sm:justify-between">
        <p>Public data. A starting point.</p>
        <p>Activity and repository insights are coming later.</p>
      </footer>
    </div>
  );
}
