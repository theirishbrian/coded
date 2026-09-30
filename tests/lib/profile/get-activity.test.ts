// @vitest-environment node
import { describe, expect, it, vi } from "vitest";
import type { GitHubRequest } from "@/lib/github/get-json";
import { publicEventsPageUrl, parsePublicEvents } from "@/lib/github/event";
import { getPublicActivity } from "@/lib/profile/get-activity";
import fixture from "../../fixtures/github/event.json";

vi.mock("server-only", () => ({}));

const success = (payload: unknown, link: string | null = null) => ({
  kind: "success" as const,
  payload,
  link,
  retrievedAt: "2026-09-30T12:00:00Z",
});
const next = (page: number) =>
  `<https://api.github.com/user/123/events/public?per_page=100&page=${page}>; rel="next"`;

describe("public activity retrieval", () => {
  it("retrieves bounded pages, deduplicates events and maps validated fields", async () => {
    const request = vi
      .fn<GitHubRequest>()
      .mockResolvedValueOnce(success([fixture], next(2)))
      .mockResolvedValueOnce(
        success([
          fixture,
          {
            ...fixture,
            id: "555000112",
            type: "PullRequestEvent",
            repo: { name: "example-org/team-project" },
            payload: { action: "closed", pull_request: { merged: true } },
          },
        ]),
      );
    await expect(
      getPublicActivity(" SAMPLE-DEV ", request, 123),
    ).resolves.toEqual({
      kind: "success",
      completeness: "endpoint_exhausted",
      events: [
        {
          id: fixture.id,
          kind: "push",
          repository: fixture.repo.name,
          repositoryUrl: "https://github.com/sample-dev/example-project",
          occurredAt: fixture.created_at,
          action: null,
          refType: null,
          pushSize: 3,
          pullRequestMerged: null,
        },
        {
          id: "555000112",
          kind: "pull_request",
          repository: "example-org/team-project",
          repositoryUrl: "https://github.com/example-org/team-project",
          occurredAt: fixture.created_at,
          action: "closed",
          refType: null,
          pushSize: null,
          pullRequestMerged: true,
        },
      ],
      source: {
        urls: [
          publicEventsPageUrl("sample-dev", 1),
          publicEventsPageUrl("sample-dev", 2),
        ],
        retrievedAt: "2026-09-30T12:00:00Z",
        pagesFetched: 2,
        coverage: "public-events-up-to-30-days",
        order: "newest-first",
        pageLimit: 3,
      },
    });
  });

  it("preserves a validated partial sample when a later page fails", async () => {
    const request = vi
      .fn<GitHubRequest>()
      .mockResolvedValueOnce(success([fixture], next(2)))
      .mockResolvedValueOnce({ kind: "timeout" });
    await expect(
      getPublicActivity("sample-dev", request, 123),
    ).resolves.toMatchObject({
      kind: "partial",
      completeness: "interrupted",
      events: [{ id: fixture.id }],
      failure: { kind: "timeout" },
      source: { pagesFetched: 1 },
    });
  });

  it("distinguishes invalid input, first-page failures and malformed pages", async () => {
    const request = vi.fn<GitHubRequest>();
    await expect(getPublicActivity("invalid!", request)).resolves.toEqual({
      kind: "failure",
      failure: { kind: "invalid_input" },
    });
    request.mockResolvedValueOnce({ kind: "network_error" });
    await expect(getPublicActivity("sample-dev", request)).resolves.toEqual({
      kind: "failure",
      failure: { kind: "network_error" },
    });
    request.mockResolvedValueOnce(success([{ ...fixture, public: false }]));
    await expect(getPublicActivity("sample-dev", request)).resolves.toEqual({
      kind: "failure",
      failure: { kind: "malformed_response" },
    });
  });

  it("rejects unsafe or inconsistent payloads without exposing raw fields", () => {
    for (const patch of [
      { id: "not-numeric" },
      { type: "<script>" },
      { actor: { login: "different-user" } },
      { repo: { name: "https://evil.example/repo" } },
      { payload: { size: -1 } },
      { payload: { ref_type: "secret" } },
      { created_at: "yesterday" },
    ])
      expect(
        parsePublicEvents([{ ...fixture, ...patch }], "sample-dev"),
      ).toBeNull();
  });

  it("fails closed on unexpected continuation destinations", async () => {
    const request = vi
      .fn<GitHubRequest>()
      .mockResolvedValue(
        success(
          [fixture],
          '<https://evil.example/users/sample-dev/events/public?per_page=100&page=2>; rel="next"',
        ),
      );
    await expect(
      getPublicActivity("sample-dev", request),
    ).resolves.toMatchObject({
      kind: "partial",
      failure: { kind: "malformed_response" },
    });
    expect(request).toHaveBeenCalledTimes(1);
  });

  it("rejects a canonical continuation for a different account id", async () => {
    const request = vi
      .fn<GitHubRequest>()
      .mockResolvedValue(
        success(
          [fixture],
          '<https://api.github.com/user/999/events/public?per_page=100&page=2>; rel="next"',
        ),
      );
    await expect(
      getPublicActivity("sample-dev", request, 123),
    ).resolves.toMatchObject({
      kind: "partial",
      failure: { kind: "malformed_response" },
    });
    expect(request).toHaveBeenCalledTimes(1);
  });
});
