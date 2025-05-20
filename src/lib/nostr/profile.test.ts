import { describe, it, expect, vi, beforeEach } from "vitest";
import { fetchProfile } from "./profile";
import { db } from "$lib/db";

class FakeNDK {
  connect = vi.fn();
  fetchEvent = vi.fn();
}

beforeEach(async () => {
  await db.kind0.clear();
});

describe("fetchProfile", () => {
  it("stores event", async () => {
    const ndk = new FakeNDK();
    const evt = { id: "1", pubkey: "pk", kind: 0 };
    ndk.fetchEvent.mockResolvedValue(evt);
    await fetchProfile("pk", ndk as any);
    const stored = await db.kind0.get("pk");
    expect(stored?.event).toEqual(evt);
  });
});
