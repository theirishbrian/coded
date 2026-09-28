import { describe, expect, it } from "vitest";
import { redactProfilePath } from "@/lib/analytics/redact-profile-path";

describe("redactProfilePath", () => {
  it.each([
    "https://coded.example/u/theirishbrian",
    "https://coded.example/u/theirishbrian/",
    "https://coded.example/u/name%20with%20spaces",
    "https://coded.example/u/theirishbrian?ref=portfolio#repositories",
  ])("redacts the dynamic profile URL %s", (url) => {
    expect(redactProfilePath({ url, type: "pageview" })).toEqual({
      url: "https://coded.example/u/[username]",
      type: "pageview",
    });
  });

  it.each([
    "https://coded.example/",
    "https://coded.example/lookup",
    "https://coded.example/u",
    "https://coded.example/u/name/repositories",
  ])("preserves the unrelated URL %s", (url) => {
    const event = { url, type: "pageview" };

    expect(redactProfilePath(event)).toBe(event);
  });

  it("preserves an unexpected non-URL value", () => {
    const event = { url: "/u/theirishbrian", type: "pageview" };

    expect(redactProfilePath(event)).toBe(event);
  });
});
