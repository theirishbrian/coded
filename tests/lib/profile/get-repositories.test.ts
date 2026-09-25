// @vitest-environment node
import { afterEach, describe, expect, it, vi } from "vitest";
import fixture from "../../fixtures/github/repository.json";
import { getPublicRepositories } from "@/lib/profile/get-repositories";
import { repositoryPageUrl } from "@/lib/github/repository";
vi.mock("server-only", () => ({}));
afterEach(() => vi.useRealTimers());
const next = (page: number) =>
  `<${repositoryPageUrl("sample-dev", page)}>; rel="next"`;
function respond(payload: unknown = [fixture], headers: HeadersInit = {}) {
  const mock = vi.fn().mockResolvedValue(Response.json(payload, { headers }));
  vi.stubGlobal("fetch", mock);
  return mock;
}
describe("public repository retrieval", () => {
  it("normalizes input, maps only validated public fields, and records attribution", async () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-09-25T12:00:00Z"));
    const request = respond([
      { ...fixture, permissions: { admin: true }, secret: "discard" },
    ]);
    expect(await getPublicRepositories(" SAMPLE-DEV ")).toEqual({
      kind: "success",
      completeness: "endpoint_exhausted",
      repositories: [
        {
          id: 501,
          name: "example-project",
          owner: "sample-dev",
          url: fixture.html_url,
          description: fixture.description,
          primaryLanguage: "TypeScript",
          stars: 0,
          forks: 2,
          isFork: false,
          isArchived: false,
          updatedAt: fixture.updated_at,
          pushedAt: fixture.pushed_at,
        },
      ],
      source: {
        urls: [repositoryPageUrl("sample-dev", 1)],
        retrievedAt: "2026-09-25T12:00:00.000Z",
        pagesFetched: 1,
        coverage: "owned-public-repositories",
        order: "full-name-ascending",
        pageLimit: 3,
      },
    });
    expect(request).toHaveBeenCalledExactlyOnceWith(
      repositoryPageUrl("sample-dev", 1),
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
  it.each(["", "a/b", "https://github.com/a", null, {}, "a".repeat(40)])(
    "rejects %j without a request",
    async (input) => {
      expect(await getPublicRepositories(input)).toEqual({
        kind: "failure",
        failure: { kind: "invalid_input" },
      });
      expect(fetch).not.toHaveBeenCalled();
    },
  );
  it("distinguishes an empty successful list from unavailable data", async () => {
    respond([]);
    expect(await getPublicRepositories("sample-dev")).toMatchObject({
      kind: "success",
      completeness: "endpoint_exhausted",
      repositories: [],
      source: { pagesFetched: 1 },
    });
  });
  it("preserves null/missing counts and metadata without dropping forks or archives", async () => {
    respond([
      {
        ...fixture,
        description: null,
        language: undefined,
        stargazers_count: null,
        forks_count: undefined,
        updated_at: undefined,
        pushed_at: null,
        fork: true,
        archived: true,
      },
    ]);
    expect(await getPublicRepositories("sample-dev")).toMatchObject({
      kind: "success",
      repositories: [
        {
          description: null,
          primaryLanguage: null,
          stars: null,
          forks: null,
          updatedAt: null,
          pushedAt: null,
          isFork: true,
          isArchived: true,
        },
      ],
    });
  });
  it.each([
    { id: 0 },
    { id: 1.5 },
    { name: "../bad" },
    { name: ".." },
    { name: "a".repeat(101) },
    { owner: { login: "other", type: "User" } },
    { owner: { login: "sample-dev", type: "Organization" } },
    { private: true },
    { private: undefined },
    { visibility: "private" },
    { fork: null },
    { archived: "false" },
    { description: 4 },
    { language: [] },
    { stargazers_count: -1 },
    { forks_count: "0" },
    { updated_at: "2026-02-30T00:00:00Z" },
    { pushed_at: "yesterday" },
    { html_url: "https://evil.example/sample-dev/example-project" },
    { html_url: "https://github.com@evil.example/sample-dev/example-project" },
    { html_url: "https://user@github.com/sample-dev/example-project" },
    { html_url: "https://github.com/sample-dev/wrong" },
    { html_url: fixture.html_url + "?token=bad" },
  ])("rejects malformed/private fields %j", async (patch) => {
    respond([{ ...fixture, ...patch }]);
    expect(await getPublicRepositories("sample-dev")).toEqual({
      kind: "failure",
      failure: { kind: "malformed_response" },
    });
  });
  it.each([{}, null, [null], Array.from({ length: 101 }, () => fixture)])(
    "rejects malformed pages",
    async (payload) => {
      respond(payload);
      expect(await getPublicRepositories("sample-dev")).toEqual({
        kind: "failure",
        failure: { kind: "malformed_response" },
      });
    },
  );
  it("follows validated continuation despite a short page, deduplicates IDs and keeps first observation", async () => {
    const request = respond();
    request
      .mockReset()
      .mockResolvedValueOnce(
        Response.json([fixture], { headers: { link: next(2) } }),
      )
      .mockResolvedValueOnce(
        Response.json(
          [
            { ...fixture, description: "changed" },
            {
              ...fixture,
              id: 502,
              name: "second",
              html_url: "https://github.com/sample-dev/second",
            },
          ],
          {
            headers: {
              link: `<${repositoryPageUrl("sample-dev", 1)}>; rel="prev"`,
            },
          },
        ),
      );
    const result = await getPublicRepositories("sample-dev");
    expect(result).toMatchObject({
      kind: "success",
      completeness: "endpoint_exhausted",
      source: { pagesFetched: 2 },
    });
    if (result.kind !== "failure") {
      expect(result.repositories).toHaveLength(2);
      expect(result.repositories[0].description).toBe(fixture.description);
    }
    expect(request.mock.calls.map((call) => call[0])).toEqual([
      repositoryPageUrl("sample-dev", 1),
      repositoryPageUrl("sample-dev", 2),
    ]);
  });
  it("caps retrieval at 300 items and three sequential pages", async () => {
    const request = respond();
    request.mockReset();
    for (let page = 1; page <= 3; page++)
      request.mockResolvedValueOnce(
        Response.json(
          Array.from({ length: 100 }, (_, i) => ({
            ...fixture,
            id: page * 100 + i,
            name: `repo-${page}-${i}`,
            html_url: `https://github.com/sample-dev/repo-${page}-${i}`,
          })),
          { headers: { link: next(page + 1) } },
        ),
      );
    const result = await getPublicRepositories("sample-dev");
    expect(result).toMatchObject({
      kind: "success",
      completeness: "page_limit",
      source: { pagesFetched: 3 },
    });
    if (result.kind !== "failure")
      expect(result.repositories).toHaveLength(300);
    expect(request).toHaveBeenCalledTimes(3);
  });
  it.each([
    '<https://evil.example/data>; rel="next"',
    `<${repositoryPageUrl("sample-dev", 1)}>; rel="next"`,
    `<${repositoryPageUrl("other", 2)}>; rel="next"`,
    `<${repositoryPageUrl("sample-dev", 2)}&token=bad>; rel="next"`,
    `${next(2)}, ${next(2)}`,
    "broken",
    "",
  ])("stops on hostile/malformed continuation %s", async (link) => {
    const request = respond([fixture], { link });
    expect(await getPublicRepositories("sample-dev")).toMatchObject({
      kind: "partial",
      completeness: "interrupted",
      repositories: [{ id: 501 }],
      failure: { kind: "malformed_response" },
    });
    expect(request).toHaveBeenCalledTimes(1);
  });
  it("accepts query reordering in a next link", async () => {
    const request = respond();
    request
      .mockReset()
      .mockResolvedValueOnce(
        Response.json([fixture], {
          headers: {
            link: '<https://api.github.com/users/sample-dev/repos?page=2&per_page=100&direction=asc&sort=full_name&type=owner>; rel="next"',
          },
        }),
      )
      .mockResolvedValueOnce(Response.json([]));
    expect(await getPublicRepositories("sample-dev")).toMatchObject({
      kind: "success",
      source: { pagesFetched: 2 },
    });
  });
  it.each([
    [404, "not_found"],
    [401, "access_denied"],
    [403, "access_denied"],
    [500, "upstream_error"],
    [302, "upstream_error"],
  ] as const)(
    "returns safe first-page HTTP %s failure",
    async (status, kind) => {
      const request = respond();
      request.mockResolvedValue(
        Response.json({ message: "private details" }, { status }),
      );
      expect(await getPublicRepositories("sample-dev")).toEqual({
        kind: "failure",
        failure: { kind },
      });
      expect(request).toHaveBeenCalledTimes(1);
    },
  );
  it.each([404, 429, 503])(
    "retains earlier data and stops on later HTTP %s",
    async (status) => {
      const request = respond();
      request
        .mockReset()
        .mockResolvedValueOnce(
          Response.json([fixture], { headers: { link: next(2) } }),
        )
        .mockResolvedValueOnce(
          Response.json(
            {},
            {
              status,
              headers: {
                "retry-after": "90",
                "x-ratelimit-reset": "1790337600",
              },
            },
          ),
        );
      const result = await getPublicRepositories("sample-dev");
      expect(result).toMatchObject({
        kind: "partial",
        completeness: "interrupted",
        repositories: [{ id: 501 }],
        source: { pagesFetched: 1 },
      });
      if (status === 429)
        expect(result).toMatchObject({
          failure: {
            kind: "rate_limited",
            retryAfterSeconds: 90,
            resetAt: new Date(1790337600000).toISOString(),
          },
        });
      expect(request).toHaveBeenCalledTimes(2);
    },
  );
  it("discards an entire malformed later page", async () => {
    const request = respond();
    request
      .mockReset()
      .mockResolvedValueOnce(
        Response.json([fixture], { headers: { link: next(2) } }),
      )
      .mockResolvedValueOnce(Response.json([{ ...fixture, id: 502 }, null]));
    const result = await getPublicRepositories("sample-dev");
    expect(result).toMatchObject({
      kind: "partial",
      source: { pagesFetched: 1 },
      failure: { kind: "malformed_response" },
    });
    if (result.kind !== "failure") expect(result.repositories).toHaveLength(1);
  });
  it.each(["headers", "body"] as const)(
    "aborts stalled %s and clears its timer",
    async (stage) => {
      vi.useFakeTimers();
      vi.stubGlobal(
        "fetch",
        vi.fn((_url, init: RequestInit) => {
          const stall = () =>
            new Promise((_resolve, reject) =>
              init.signal?.addEventListener("abort", () =>
                reject(new Error("aborted")),
              ),
            );
          return stage === "headers"
            ? stall()
            : Promise.resolve({
                status: 200,
                headers: new Headers(),
                json: stall,
              });
        }),
      );
      const result = getPublicRepositories("sample-dev");
      await vi.advanceTimersByTimeAsync(5000);
      expect(await result).toEqual({
        kind: "failure",
        failure: { kind: "timeout" },
      });
      expect(vi.getTimerCount()).toBe(0);
    },
  );
  it.each([new SyntaxError("private"), new TypeError("private")])(
    "sanitizes response-body failures",
    async (error) => {
      vi.stubGlobal(
        "fetch",
        vi.fn().mockResolvedValue({
          status: 200,
          headers: new Headers(),
          json: () => Promise.reject(error),
        }),
      );
      expect(await getPublicRepositories("sample-dev")).toEqual({
        kind: "failure",
        failure: {
          kind:
            error instanceof SyntaxError
              ? "malformed_response"
              : "network_error",
        },
      });
    },
  );
  it("does not cache failures or successes", async () => {
    const request = respond();
    request.mockRejectedValueOnce(new Error("private"));
    expect(await getPublicRepositories("sample-dev")).toEqual({
      kind: "failure",
      failure: { kind: "network_error" },
    });
    expect((await getPublicRepositories("sample-dev")).kind).toBe("success");
    await getPublicRepositories("sample-dev");
    expect(request).toHaveBeenCalledTimes(3);
  });
});
