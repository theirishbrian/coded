// Loaded only by the explicit browser-test server command, never by the app.
import { readFileSync } from "node:fs";
const readFixture = (name) =>
  JSON.parse(
    readFileSync(
      new URL(`../fixtures/github/${name}.json`, import.meta.url),
      "utf8",
    ),
  );
const user = readFixture("user");
const repository = readFixture("repository");
const event = readFixture("event");
const nativeFetch = globalThis.fetch;
globalThis.fetch = async (input, init) => {
  const url = new URL(
    typeof input === "string" || input instanceof URL ? input : input.url,
  );
  if (url.hostname === "api.github.com") {
    const username = url.pathname.split("/")[2];
    if (username === "missing-user") return Response.json({}, { status: 404 });
    if (username === "broken-user") return Response.json({}, { status: 503 });
    if (
      ![
        "sample-dev",
        "repo-failure",
        "activity-failure",
        "empty-dev",
        "partial-dev",
      ].includes(username)
    )
      throw new Error("Unexpected fixture username");
    if (url.pathname.endsWith("/events/public")) {
      await new Promise((resolve) => setTimeout(resolve, 700));
      if (username === "activity-failure")
        return Response.json({}, { status: 503 });
      if (username === "empty-dev") return Response.json([]);
      const base = {
        ...event,
        actor: { login: username },
        repo: { name: `${username}/repo-02` },
      };
      return Response.json([
        base,
        {
          ...base,
          id: "555000112",
          type: "PullRequestEvent",
          payload: { action: "closed", pull_request: { merged: true } },
        },
        {
          ...base,
          id: "555000113",
          type: "IssuesEvent",
          payload: { action: "opened" },
        },
        {
          ...base,
          id: "555000114",
          type: "ReleaseEvent",
          payload: { action: "published" },
        },
        {
          ...base,
          id: "555000115",
          type: "WatchEvent",
          payload: { action: "started" },
        },
      ]);
    }
    if (url.pathname.endsWith("/repos")) {
      // Separate account and repository loading must be observable in a browser.
      await new Promise((resolve) => setTimeout(resolve, 900));
      if (
        username === "repo-failure" ||
        (username === "partial-dev" && url.searchParams.get("page") === "2")
      )
        return Response.json({}, { status: 503 });
      if (username === "empty-dev") return Response.json([]);
      const repositories = Array.from(
        { length: username === "partial-dev" ? 1 : 14 },
        (_, i) => {
          const name = `repo-${String(i + 1).padStart(2, "0")}`;
          return {
            ...repository,
            id: i + 1,
            name,
            full_name: `${username}/${name}`,
            owner: { login: username, type: "User" },
            html_url: `https://github.com/${username}/${name}`,
            description: i === 0 ? null : repository.description,
            language: i === 0 ? null : i >= 12 ? "JavaScript" : "TypeScript",
            fork: i === 0,
            archived: i === 0,
          };
        },
      );
      const headers = {};
      if (username === "partial-dev") {
        const next = new URL(url);
        next.searchParams.set("page", "2");
        headers.Link = `<${next}>; rel="next"`;
      }
      return Response.json(repositories, { headers });
    }
    await new Promise((resolve) => setTimeout(resolve, 350));
    return Response.json({
      ...user,
      login: username,
      html_url: `https://github.com/${username}`,
      public_repos: username === "empty-dev" ? 0 : 14,
    });
  }
  if (url.hostname === "127.0.0.1" || url.hostname === "localhost")
    return nativeFetch(input, init);
  throw new Error("External network is disabled in browser tests");
};
