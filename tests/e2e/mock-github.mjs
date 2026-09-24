// Loaded only by the explicit browser-test server command, never by the app.
import { readFileSync } from "node:fs";
const fixture = JSON.parse(
  readFileSync(
    new URL("../fixtures/github/user.json", import.meta.url),
    "utf8",
  ),
);
const nativeFetch = globalThis.fetch;
globalThis.fetch = async (input, init) => {
  const url = new URL(
    typeof input === "string" || input instanceof URL ? input : input.url,
  );
  if (url.hostname === "api.github.com") {
    const username = url.pathname.split("/").at(-1);
    if (username === "missing-user")
      return Response.json({ message: "Not Found" }, { status: 404 });
    if (username === "broken-user") return Response.json({}, { status: 503 });
    if (username === "rate-user")
      return Response.json(
        {},
        { status: 429, headers: { "retry-after": "60" } },
      );
    if (username !== "sample-dev")
      throw new Error("Unexpected fixture username");
    // Make the loading state observable without depending on external latency.
    await new Promise((resolve) => setTimeout(resolve, 350));
    return Response.json(fixture);
  }
  if (url.hostname === "127.0.0.1" || url.hostname === "localhost")
    return nativeFetch(input, init);
  throw new Error("External network is disabled in browser tests");
};
