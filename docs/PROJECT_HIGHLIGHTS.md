# Project proof highlights

Coded selects up to three project highlights from the public repositories already
retrieved for a profile. It makes no additional GitHub requests and stores no
selection history.

## Eligibility and order

A repository is eligible when GitHub reports that it is owned by the profile,
is not a fork and is not archived. Eligible repositories are ordered by:

1. GitHub-reported star count, highest first;
2. most recent GitHub-reported push time; and
3. repository name, using a stable alphabetical tie-break.

Only the first three are shown. The inputs and order are published beside the
result so the selection is reproducible. Missing stars and push dates sort after
reported values. Capped and interrupted inventories are labelled as samples.

The highlight cards use fields returned by GitHub's existing
`List repositories for a user` response: description, primary language, stars,
last push, homepage, topics and detected licence. Homepage URLs are limited to
credential-free HTTP(S) addresses, topic and licence fields are validated, and
all fields are transformed into Coded-owned models before rendering. See
[GitHub's repository endpoint](https://docs.github.com/en/rest/repos/repos#list-repositories-for-a-user).

## Interpretation limits

Highlights help a visitor find original, currently available projects quickly.
They do not establish that the account owner wrote every line or that a project
is high quality. Stars indicate public interest, not skill. A push time indicates
that the repository changed, not who performed the work or how substantial it was.
GitHub's detected licence can be absent or inconclusive. Topics, descriptions and
homepage links are repository-owner supplied metadata.

Private work, organization-owned contributions, offline work and repositories
beyond the retrieval boundary remain outside this view. Coded does not calculate
a composite developer or repository score.
