export default function Home() {
  return (
    <div className="mx-auto flex min-h-svh max-w-6xl flex-col px-6 sm:px-12">
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:z-10 focus:bg-[#111315] focus:p-3"
      >
        Skip to content
      </a>
      <header className="flex flex-wrap items-center justify-between gap-4 border-b border-white/15 py-7">
        <span className="text-2xl font-bold tracking-tight">
          coded<span className="text-[#d3ef8b]">.</span>
        </span>
        <span className="font-mono text-xs uppercase tracking-widest text-[#b9beb6]">
          Building in public
        </span>
      </header>
      <main
        id="main"
        tabIndex={-1}
        className="flex flex-1 flex-col justify-center py-20 sm:py-28"
      >
        <p className="mb-8 font-mono text-xs uppercase tracking-[0.2em] text-[#d3ef8b]">
          A foundation for what comes next
        </p>
        <h1 className="max-w-4xl text-5xl leading-[1.08] font-semibold tracking-tight sm:text-7xl lg:text-8xl">
          Your work.
          <br />
          Your progress.
          <br />
          <span className="text-[#d3ef8b]">Proven.</span>
        </h1>
        <p className="mt-8 max-w-lg text-lg leading-relaxed text-[#b9beb6]">
          A clearer picture of what you build. Coded is taking shape as a
          shareable record of your public GitHub work.
        </p>
        <div className="mt-10">
          <a
            href="https://github.com/theirishbrian/coded"
            className="inline-flex min-h-12 items-center gap-4 rounded-sm border border-white/25 px-5 py-3 text-sm font-medium hover:border-[#d3ef8b] hover:text-[#d3ef8b]"
          >
            Follow the project on GitHub <span aria-hidden="true">↗</span>
          </a>
        </div>
      </main>
      <footer className="flex flex-col gap-2 border-t border-white/15 py-6 text-sm text-[#b9beb6] sm:flex-row sm:justify-between">
        <p>Foundation running.</p>
        <p>Public profiles are coming later.</p>
      </footer>
    </div>
  );
}
