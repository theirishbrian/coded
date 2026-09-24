// @vitest-environment node
import { describe, expect, it, vi } from "vitest";
import { createProfileLookup } from "@/lib/profile/lookup-policy";
import type { ProfileResult } from "@/lib/profile/get-profile";
import { sampleProfile } from "../../fixtures/profile";
const success: ProfileResult = { kind: "success", profile: sampleProfile };

describe("lookup request policy", () => {
  it("normalizes cache keys, expires successes after five minutes and protects stored values", async () => {
    let time = 0;
    const load = vi.fn(async () => success);
    const lookup = createProfileLookup(load, () => time);
    const first = await lookup(" SAMPLE-dev ");
    if (first.kind === "success") first.profile.username = "modified";
    time = 299999;
    expect(await lookup("sample-dev")).toEqual(success);
    expect(load).toHaveBeenCalledTimes(1);
    time = 300000;
    expect(await lookup("sample-dev")).toEqual(success);
    expect(load).toHaveBeenCalledTimes(2);
  });
  it("rejects invalid input without calling the loader", async () => {
    const load = vi.fn(async () => success);
    expect(await createProfileLookup(load)("https://evil.example")).toEqual({
      kind: "invalid_input",
    });
    expect(load).not.toHaveBeenCalled();
  });
  it("deduplicates concurrent names and caps distinct in-flight requests", async () => {
    let finish!: (value: ProfileResult) => void;
    const load = vi.fn(
      () =>
        new Promise<ProfileResult>((resolve) => {
          finish = resolve;
        }),
    );
    const lookup = createProfileLookup(load);
    const a = lookup("alice");
    const same = lookup("ALICE");
    await Promise.resolve();
    const finishA = finish;
    const b = lookup("bob");
    await Promise.resolve();
    expect(await lookup("charlie")).toEqual({
      kind: "busy",
      retryAfterSeconds: 5,
    });
    expect(load).toHaveBeenCalledTimes(2);
    finishA(success);
    finish(success);
    expect(await a).toEqual(success);
    expect(await same).toEqual(success);
    await b;
  });
  it.each([
    "not_found",
    "timeout",
    "upstream_error",
    "malformed_response",
  ] as const)("never caches %s", async (kind) => {
    const load = vi
      .fn<() => Promise<ProfileResult>>()
      .mockResolvedValueOnce({ kind })
      .mockResolvedValueOnce(success);
    const lookup = createProfileLookup(load);
    expect((await lookup("alice")).kind).toBe(kind);
    expect(await lookup("alice")).toEqual(success);
    expect(load).toHaveBeenCalledTimes(2);
  });
  it("releases an in-flight request when the loader throws", async () => {
    const load = vi
      .fn<() => Promise<ProfileResult>>()
      .mockRejectedValueOnce(new Error("private"))
      .mockResolvedValueOnce(success);
    const lookup = createProfileLookup(load);
    expect(await lookup("alice")).toEqual({ kind: "upstream_error" });
    expect(await lookup("alice")).toEqual(success);
  });
  it("honors the longer rate-limit hint across usernames while allowing cached successes", async () => {
    let time = Date.parse("2026-09-24T00:00:00Z");
    const resetAt = new Date(time + 120000).toISOString();
    const load = vi
      .fn<() => Promise<ProfileResult>>()
      .mockResolvedValueOnce(success)
      .mockResolvedValueOnce({
        kind: "rate_limited",
        retryAfterSeconds: 90,
        resetAt,
      })
      .mockResolvedValue(success);
    const lookup = createProfileLookup(load, () => time);
    await lookup("cached");
    await lookup("limited");
    expect(await lookup("other")).toEqual({
      kind: "rate_limited",
      retryAfterSeconds: 120,
      resetAt,
    });
    expect(await lookup("cached")).toEqual(success);
    expect(load).toHaveBeenCalledTimes(2);
    time += 120000;
    expect(await lookup("limited")).toEqual(success);
  });
  it("uses a one-minute cooldown without upstream hints", async () => {
    const load = vi.fn<() => Promise<ProfileResult>>().mockResolvedValue({
      kind: "rate_limited",
      retryAfterSeconds: null,
      resetAt: null,
    });
    const lookup = createProfileLookup(load, () => 0);
    await lookup("alice");
    expect(await lookup("bob")).toEqual({
      kind: "rate_limited",
      retryAfterSeconds: 60,
      resetAt: "1970-01-01T00:01:00.000Z",
    });
    expect(load).toHaveBeenCalledTimes(1);
  });
  it("caps starts at thirty in a rolling hour including failures", async () => {
    let time = 0;
    const load = vi
      .fn<() => Promise<ProfileResult>>()
      .mockResolvedValue({ kind: "not_found" });
    const lookup = createProfileLookup(load, () => time);
    for (let i = 0; i < 30; i++) await lookup(`person-${i}`);
    expect(await lookup("extra")).toEqual({
      kind: "busy",
      retryAfterSeconds: 3600,
    });
    time = 3600000;
    expect(await lookup("extra")).toEqual({ kind: "not_found" });
    expect(load).toHaveBeenCalledTimes(31);
  });
});
