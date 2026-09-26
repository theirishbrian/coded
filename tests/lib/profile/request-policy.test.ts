// @vitest-environment node
import { describe, expect, it, vi } from "vitest";
import { createRequestPolicy } from "@/lib/github/request-policy";
import type { GitHubJsonResult, GitHubRequest } from "@/lib/github/get-json";

describe("shared upstream request policy", () => {
  it("counts failed starts, rejects request 31 and resets after one rolling hour", async () => {
    let time = 0;
    const load = vi
      .fn<GitHubRequest>()
      .mockResolvedValue({ kind: "not_found" });
    const request = createRequestPolicy(load, () => time);
    for (let i = 0; i < 30; i++) await request(String(i));
    expect(await request("extra")).toEqual({
      kind: "busy",
      retryAfterSeconds: 3600,
    });
    expect(load).toHaveBeenCalledTimes(30);
    time = 3600000;
    expect(await request("extra")).toEqual({ kind: "not_found" });
  });
  it("caps concurrent starts at two and releases slots after exceptions", async () => {
    const finishes: ((result: GitHubJsonResult) => void)[] = [];
    const load = vi
      .fn<GitHubRequest>()
      .mockImplementation(
        () => new Promise((resolve) => finishes.push(resolve)),
      );
    const request = createRequestPolicy(load);
    const a = request("account");
    const b = request("repositories");
    expect(await request("third")).toEqual({
      kind: "busy",
      retryAfterSeconds: 5,
    });
    finishes.forEach((finish) => finish({ kind: "not_found" }));
    await Promise.all([a, b]);
    load.mockRejectedValueOnce(new Error("private message"));
    expect(await request("failed")).toEqual({ kind: "upstream_error" });
    load.mockResolvedValue({ kind: "not_found" });
    expect(await request("released")).toEqual({ kind: "not_found" });
  });
  it.each([null, 90])(
    "honors cooldown hints (%s) across all URLs without retrying",
    async (retryAfterSeconds) => {
      let time = 0;
      const resetAt = retryAfterSeconds ? new Date(120000).toISOString() : null;
      const load = vi.fn<GitHubRequest>().mockResolvedValue({
        kind: "rate_limited",
        retryAfterSeconds,
        resetAt,
      });
      const request = createRequestPolicy(load, () => time);
      await request("repos/page/2");
      const seconds = retryAfterSeconds ? 120 : 60;
      expect(await request("another/account")).toEqual({
        kind: "rate_limited",
        retryAfterSeconds: seconds,
        resetAt: new Date(seconds * 1000).toISOString(),
      });
      expect(load).toHaveBeenCalledTimes(1);
      time = seconds * 1000;
      await request("another/account");
      expect(load).toHaveBeenCalledTimes(2);
    },
  );
});
