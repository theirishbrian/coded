// @vitest-environment node
import { describe, expect, it, vi } from "vitest";
import { createSuccessCache } from "@/lib/profile/lookup-policy";

describe("bounded success caches", () => {
  const success = {
    kind: "success",
    value: { name: "original" },
    retrievedAt: "original time",
  };
  it("preserves timestamps, isolates mutations and expires at five minutes", async () => {
    let time = 0;
    const load = vi.fn(async () => success);
    const lookup = createSuccessCache(load, () => time);
    (await lookup("alice")).value.name = "changed";
    time = 299999;
    expect(await lookup("alice")).toEqual(success);
    expect(load).toHaveBeenCalledTimes(1);
    time++;
    await lookup("alice");
    expect(load).toHaveBeenCalledTimes(2);
  });
  it.each(["failure", "partial"])("does not cache %s", async (kind) => {
    const load = vi
      .fn()
      .mockResolvedValueOnce({ kind })
      .mockResolvedValue(success);
    const lookup = createSuccessCache(load);
    expect(await lookup("alice")).toEqual({ kind });
    expect(await lookup("alice")).toEqual(success);
    expect(load).toHaveBeenCalledTimes(2);
  });
  it("shares pending work but returns independent results", async () => {
    let finish!: (result: typeof success) => void;
    const load = vi.fn(
      () =>
        new Promise<typeof success>((resolve) => {
          finish = resolve;
        }),
    );
    const lookup = createSuccessCache(load);
    const first = lookup("alice");
    const second = lookup("alice");
    await Promise.resolve();
    expect(load).toHaveBeenCalledTimes(1);
    finish(success);
    (await first).value.name = "changed";
    expect(await second).toEqual(success);
  });
  it("evicts the oldest entry at 100 and clears rejected pending work", async () => {
    const load = vi.fn(async () => success);
    const lookup = createSuccessCache(load);
    for (let i = 0; i < 101; i++) await lookup(String(i));
    await lookup("1");
    expect(load).toHaveBeenCalledTimes(101);
    await lookup("0");
    expect(load).toHaveBeenCalledTimes(102);
    load.mockRejectedValueOnce(new Error("failed"));
    await expect(lookup("retry")).rejects.toThrow("failed");
    expect(await lookup("retry")).toEqual(success);
  });
});
