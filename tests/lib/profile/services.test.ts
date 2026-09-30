// @vitest-environment node
import { describe, expect, it, vi } from "vitest";
import { createProfileServices } from "@/lib/profile/services";
import type { GitHubRequest } from "@/lib/github/get-json";
import { repositoryPageUrl } from "@/lib/github/repository";
import user from "../../fixtures/github/user.json";
import repository from "../../fixtures/github/repository.json";
import event from "../../fixtures/github/event.json";
vi.mock("server-only", () => ({}));
const response = (payload: unknown, link: string | null = null) => ({
  kind: "success" as const,
  payload,
  link,
  retrievedAt: "2026-09-26T12:00:00Z",
});
const next = (page: number) =>
  `<${repositoryPageUrl("sample-dev", page)}>; rel="next"`;

describe("public profile service integration", () => {
  it("gates repositories on valid personal accounts and uses the returned canonical name", async () => {
    const transport = vi.fn<GitHubRequest>().mockResolvedValue(response(user));
    const service = createProfileServices(transport);
    expect(await service.lookupProfile("invalid!")).toEqual({
      kind: "invalid_input",
    });
    for (const kind of [
      "invalid_input",
      "not_found",
      "unsupported_account",
      "upstream_error",
    ] as const)
      expect(await service.repositoriesFor({ kind })).toBeNull();
    for (const kind of [
      "invalid_input",
      "not_found",
      "unsupported_account",
      "upstream_error",
    ] as const)
      expect(await service.activityFor({ kind })).toBeNull();
    expect(transport).not.toHaveBeenCalled();
    const account = await service.lookupProfile("old-name");
    transport.mockResolvedValue(response([repository]));
    await service.repositoriesFor(account);
    expect(transport).toHaveBeenLastCalledWith(
      repositoryPageUrl("sample-dev", 1),
    );
  });
  it("normalizes and independently caches public activity", async () => {
    const transport = vi
      .fn<GitHubRequest>()
      .mockResolvedValueOnce(response(user))
      .mockResolvedValue(response([event]));
    const service = createProfileServices(transport);
    const account = await service.lookupProfile("sample-dev");
    const [first, same] = await Promise.all([
      service.activityFor(account),
      service.activityFor(account),
    ]);
    expect(first).toEqual(same);
    expect(first).toMatchObject({
      kind: "success",
      events: [{ id: event.id, kind: "push" }],
    });
    expect(transport).toHaveBeenCalledTimes(2);
  });
  it("normalizes and deduplicates account and repository work in separate caches", async () => {
    const transport = vi
      .fn<GitHubRequest>()
      .mockImplementation(async (url) =>
        response(url.includes("/repos?") ? [repository] : user),
      );
    let time = 0;
    const service = createProfileServices(transport, () => time);
    const [account, same] = await Promise.all([
      service.lookupProfile(" SAMPLE-DEV "),
      service.lookupProfile("sample-dev"),
    ]);
    expect(account).toEqual(same);
    await Promise.all([
      service.repositoriesFor(account),
      service.repositoriesFor(same),
    ]);
    expect(transport).toHaveBeenCalledTimes(2);
    time = 299999;
    await service.lookupProfile("SAMPLE-DEV");
    await service.repositoriesFor(account);
    expect(transport).toHaveBeenCalledTimes(2);
    time++;
    await service.lookupProfile("sample-dev");
    await service.repositoriesFor(account);
    expect(transport).toHaveBeenCalledTimes(4);
  });
  it("preserves account and validated pages when the shared budget runs out mid-pagination", async () => {
    const transport = vi
      .fn<GitHubRequest>()
      .mockResolvedValue({ kind: "not_found" });
    const service = createProfileServices(transport, () => 0);
    for (let i = 0; i < 28; i++) await service.lookupProfile(`missing-${i}`);
    transport
      .mockResolvedValueOnce(response(user))
      .mockResolvedValue(response([repository], next(2)));
    const account = await service.lookupProfile("sample-dev");
    const repos = await service.repositoriesFor(account);
    expect(repos).toMatchObject({
      kind: "partial",
      repositories: [{ id: repository.id }],
      failure: { kind: "busy" },
      source: { pagesFetched: 1 },
    });
    expect(transport).toHaveBeenCalledTimes(30);
    expect(await service.lookupProfile("sample-dev")).toEqual(account);
    expect(await service.repositoriesFor(account)).toMatchObject({
      kind: "failure",
      failure: { kind: "busy" },
    });
  });
  it("propagates a nested page rate limit to other accounts and never caches interrupted results", async () => {
    let time = 0;
    const transport = vi
      .fn<GitHubRequest>()
      .mockResolvedValueOnce(response(user))
      .mockResolvedValueOnce(response([repository], next(2)))
      .mockResolvedValueOnce({
        kind: "rate_limited",
        retryAfterSeconds: 90,
        resetAt: null,
      });
    const service = createProfileServices(transport, () => time);
    const account = await service.lookupProfile("sample-dev");
    expect(await service.repositoriesFor(account)).toMatchObject({
      kind: "partial",
      failure: { kind: "rate_limited" },
    });
    expect(await service.lookupProfile("other")).toMatchObject({
      kind: "rate_limited",
      retryAfterSeconds: 90,
    });
    expect(await service.lookupProfile("sample-dev")).toEqual(account);
    expect(transport).toHaveBeenCalledTimes(3);
    time = 90000;
    transport.mockResolvedValue(response([]));
    expect(await service.repositoriesFor(account)).toMatchObject({
      kind: "success",
      repositories: [],
    });
    expect(transport).toHaveBeenCalledTimes(4);
  });
  it("caches capped successes with their coverage and original timestamp", async () => {
    const transport = vi
      .fn<GitHubRequest>()
      .mockResolvedValueOnce(response(user));
    const service = createProfileServices(transport);
    const account = await service.lookupProfile("sample-dev");
    for (let page = 1; page <= 3; page++)
      transport.mockResolvedValueOnce(
        response([{ ...repository, id: page }], next(page + 1)),
      );
    const capped = await service.repositoriesFor(account);
    expect(capped).toMatchObject({
      kind: "success",
      completeness: "page_limit",
      source: { pagesFetched: 3, retrievedAt: "2026-09-26T12:00:00Z" },
    });
    expect(await service.repositoriesFor(account)).toEqual(capped);
    expect(transport).toHaveBeenCalledTimes(4);
  });
  it("does not cache repository failures or discard independently cached accounts", async () => {
    const transport = vi
      .fn<GitHubRequest>()
      .mockResolvedValueOnce(response(user))
      .mockResolvedValueOnce({ kind: "timeout" })
      .mockResolvedValue(response([]));
    const service = createProfileServices(transport);
    const account = await service.lookupProfile("sample-dev");
    expect(await service.repositoriesFor(account)).toEqual({
      kind: "failure",
      failure: { kind: "timeout" },
    });
    expect(await service.lookupProfile("sample-dev")).toEqual(account);
    expect(await service.repositoriesFor(account)).toMatchObject({
      kind: "success",
    });
    expect(transport).toHaveBeenCalledTimes(3);
  });
});
