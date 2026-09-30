const sections = [
  ["Recent activity", "#recent-activity"],
  ["Public repositories", "#public-repositories"],
] as const;

export function ProfileSectionNavigation() {
  return (
    <nav
      aria-label="Profile sections"
      className="mt-8 border-y border-white/15 py-5"
    >
      <p className="font-mono text-xs uppercase tracking-widest text-[#b9beb6]">
        Jump to
      </p>
      <ul className="mt-3 flex flex-wrap gap-2">
        {sections.map(([label, href]) => (
          <li key={href}>
            <a
              className="inline-flex min-h-11 items-center rounded-sm border border-white/20 px-3 text-sm font-semibold text-[#d3ef8b] underline-offset-4 hover:border-[#d3ef8b]/70 hover:underline"
              href={href}
            >
              {label}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
}

export function BackToProfileTop() {
  return (
    <a
      className="mt-6 inline-flex min-h-11 items-center text-sm font-semibold text-[#d3ef8b] underline underline-offset-4"
      href="#profile-top"
    >
      <span aria-hidden="true" className="mr-2">
        ↑
      </span>
      Back to profile
    </a>
  );
}
