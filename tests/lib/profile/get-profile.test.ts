// @vitest-environment node
import { afterEach, describe, expect, it, vi } from "vitest";
import fixture from "../../fixtures/github/user.json";
import { getPublicProfile } from "@/lib/profile/get-profile";

// Next.js enforces this marker at build time; Vitest runs in ordinary Node.
vi.mock("server-only", () => ({}));

function respond(body: unknown = fixture, status = 200, headers = {}) {
  const fetchMock = vi
    .fn()
    .mockResolvedValue(Response.json(body, { status, headers }));
  vi.stubGlobal("fetch", fetchMock);
  return fetchMock;
}

afterEach(() => vi.useRealTimers());

describe("public profile retrieval", () => {
  it("normalizes input and maps only validated public fields", async () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-09-23T12:00:00Z"));
    const request = respond({
      ...fixture,
      email: "ignored@example.invalid",
      private_repos: 99,
    });
    expect(await getPublicProfile("  SAMPLE-dev  ")).toEqual({
      kind: "success",
      profile: {
        accountId: 123,
        accountType: "User",
        username: "sample-dev",
        displayName: "Sample Developer",
        biography: "Synthetic test fixture",
        avatarUrl: fixture.avatar_url,
        profileUrl: fixture.html_url,
        counts: { publicRepositories: 5, followers: 0, following: 2 },
        source: {
          url: "https://api.github.com/users/sample-dev",
          retrievedAt: "2026-09-23T12:00:00.000Z",
          coverage: "public-api-reported",
        },
      },
    });
    expect(request).toHaveBeenCalledExactlyOnceWith(
      "https://api.github.com/users/sample-dev",
      {
        headers: {
          Accept: "application/vnd.github+json",
          "X-GitHub-Api-Version": "2026-03-10",
          "User-Agent": "Coded",
        },
        cache: "no-store",
        redirect: "manual",
        signal: expect.any(AbortSignal),
      },
    );
    expect(vi.getTimerCount()).toBe(0);
  });

  it.each([
    null,
    undefined,
    42,
    {},
    "",
    " ",
    "-abc",
    "abc-",
    "a--b",
    "a_b",
    "a/b",
    "https://github.com/a",
    "a?b",
    "é",
    "a".repeat(40),
  ])("rejects invalid input %j without fetching", async (value) => {
    expect(await getPublicProfile(value)).toEqual({ kind: "invalid_input" });
    expect(fetch).not.toHaveBeenCalled();
  });

  it.each(["a", "a".repeat(39), "sample-dev"])(
    "accepts bounded ordinary handle %s",
    async (value) => {
      respond({
        ...fixture,
        login: value,
        html_url: `https://github.com/${value}`,
      });
      expect((await getPublicProfile(value)).kind).toBe("success");
    },
  );

  it("preserves null and absent data separately from reported zero", async () => {
    respond({
      ...fixture,
      following: undefined,
      name: null,
      bio: null,
      public_repos: null,
    });
    const result = await getPublicProfile("sample-dev");
    expect(result.kind).toBe("success");
    if (result.kind === "success") {
      expect(result.profile.displayName).toBeNull();
      expect(result.profile.biography).toBeNull();
      expect(result.profile.counts).toEqual({
        publicRepositories: null,
        followers: 0,
        following: null,
      });
    }
  });

  it.each(["Organization", "Bot"])(
    "explicitly rejects %s accounts",
    async (type) => {
      respond({ id: 123, login: "account", type });
      expect(await getPublicProfile("account")).toEqual({
        kind: "unsupported_account",
      });
    },
  );

  it.each([
    null,
    [],
    {},
    { ...fixture, id: -1 },
    { ...fixture, id: 1.5 },
    { ...fixture, type: "Unknown" },
    { ...fixture, login: "bad/name" },
    { ...fixture, followers: -1 },
    { ...fixture, followers: "0" },
    { ...fixture, public_repos: 1.2 },
    { ...fixture, following: Number.MAX_SAFE_INTEGER + 1 },
    { ...fixture, bio: false },
    { ...fixture, name: {} },
    { ...fixture, avatar_url: "javascript:alert(1)" },
    { ...fixture, avatar_url: "https://evil.example/a.png" },
    { ...fixture, html_url: "https://github.com@evil.example/sample-dev" },
    { ...fixture, html_url: "https://github.com/other" },
  ])("rejects malformed consumed fields %j", async (data) => {
    respond(data);
    expect(await getPublicProfile("sample-dev")).toEqual({
      kind: "malformed_response",
    });
  });

  it("rejects invalid JSON", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(new Response("<html>bad gateway</html>")),
    );
    expect(await getPublicProfile("sample-dev")).toEqual({
      kind: "malformed_response",
    });
  });

  it.each([
    [404, "not_found"],
    [401, "access_denied"],
    [403, "access_denied"],
    [500, "upstream_error"],
    [503, "upstream_error"],
    [302, "upstream_error"],
  ])("maps HTTP %i to %s without retry", async (status, kind) => {
    const request = respond(
      { message: "upstream detail not exposed" },
      Number(status),
    );
    expect(await getPublicProfile("sample-dev")).toEqual({ kind });
    expect(request).toHaveBeenCalledTimes(1);
  });

  it.each([403, 429])(
    "reports rate limits for %i with safe metadata",
    async (status) => {
      respond({}, status, {
        "x-ratelimit-remaining": "0",
        "retry-after": "60",
        "x-ratelimit-reset": "1790164800",
      });
      expect(await getPublicProfile("sample-dev")).toEqual({
        kind: "rate_limited",
        retryAfterSeconds: 60,
        resetAt: new Date(1790164800000).toISOString(),
      });
    },
  );

  it.each([
    "You have exceeded a secondary rate limit.",
    "API rate limit exceeded for this IP.",
  ])("recognizes rate-limit error bodies without headers", async (message) => {
    respond({ message }, 403);
    expect(await getPublicProfile("sample-dev")).toEqual({
      kind: "rate_limited",
      retryAfterSeconds: null,
      resetAt: null,
    });
  });

  it.each([
    "",
    "-1",
    "NaN",
    "Infinity",
    "999999999999999999999",
    "1.5",
    "tomorrow",
  ])("ignores invalid rate metadata %s", async (header) => {
    respond({}, 429, { "retry-after": header, "x-ratelimit-reset": header });
    expect(await getPublicProfile("sample-dev")).toEqual({
      kind: "rate_limited",
      retryAfterSeconds: null,
      resetAt: null,
    });
  });

  it("does not expose network exception details", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockRejectedValue(new TypeError("private diagnostic")),
    );
    expect(await getPublicProfile("sample-dev")).toEqual({
      kind: "network_error",
    });
  });

  it.each(["headers", "body"])(
    "aborts after five seconds while waiting for %s",
    async (phase) => {
      vi.useFakeTimers();
      vi.stubGlobal(
        "fetch",
        vi.fn((_url, init: RequestInit) => {
          const waiting = () =>
            new Promise((_, reject) => {
              init.signal?.addEventListener(
                "abort",
                () => reject(new DOMException("Aborted", "AbortError")),
                { once: true },
              );
            });
          return phase === "headers"
            ? waiting()
            : Promise.resolve({ status: 200, json: waiting });
        }),
      );
      const pending = getPublicProfile("sample-dev");
      await vi.advanceTimersByTimeAsync(5_000);
      expect(await pending).toEqual({ kind: "timeout" });
      expect(fetch).toHaveBeenCalledTimes(1);
      expect(vi.getTimerCount()).toBe(0);
    },
  );

  it("does not retain failures between calls", async () => {
    const request = respond({}, 503);
    expect((await getPublicProfile("sample-dev")).kind).toBe("upstream_error");
    request.mockResolvedValueOnce(Response.json(fixture));
    expect((await getPublicProfile("sample-dev")).kind).toBe("success");
    expect(request).toHaveBeenCalledTimes(2);
  });
});
