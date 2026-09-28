# Repository language counts

Issue #22 summarizes the validated repository inventory already used by the
profile page. `lib/profile/summarize-languages.ts` is a pure calculation: it makes
no requests, owns no cache and does not change the shared GitHub request policy.

Each unique repository ID counts once, retaining the first observation. Trim
reported language labels, group exact labels, and sort alphabetically by their
string values for deterministic output. Preserve punctuation such as C++ and C#.
Null, empty and whitespace-only labels count separately as not reported.
Forks and archives remain included, as in the repository list. Counts use all
retrieved items, including those behind the first-12 disclosure.

The server-rendered summary shows an accessible proportional bar and exact
`n of total repositories (p%)` text for each reported language. Percentages are
whole numbers rounded to the nearest integer and use the full retrieved inventory
as the denominator, including repositories with unreported language metadata.
The visible text means bar length and colour never carry information alone.
Empty/unavailable inventory has no fabricated summary. Capped and interrupted
inventories repeat their sample warning directly beside the distribution; the
containing repository section supplies source links and retrieval time.
All-missing metadata explicitly says GitHub reported no primary languages.

These counts describe repositories by one reported primary language. They do not
measure bytes, every language within a mixed-language project, proficiency,
authorship, effort or contribution history. No per-repository language endpoint
is called. The existing three-page bound and non-atomic pagination limits remain.

Official semantics checked 27 September 2026:
[GitHub repository languages](https://docs.github.com/en/repositories/managing-your-repositorys-settings-and-features/customizing-your-repository/about-repository-languages).
GitHub uses Linguist for language detection and notes that detection can be
incorrect. This summary reuses reported metadata rather than reclassifying code.

Tests cover grouping/missing labels, duplicate IDs, punctuation, prototype-like
labels, input immutability, capped/partial/empty/failure presentation, displayed
percentages and counts for items behind disclosure. Browser fixtures verify the
mixed-language distribution and mobile layout. Live preview checks are recorded
in the PR.
