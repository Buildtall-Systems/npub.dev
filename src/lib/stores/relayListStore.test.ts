import { describe, it, expect } from "vitest";
import { get } from "svelte/store";
import { relayListStore, fetchRelayList } from "./relayListStore";
import { db } from "$lib/nostr/db";

describe("relayListStore", () => {
  it("stores event and parses relays", async () => {
    const ndk = {
      fetchEvents: async () => [
        {
          tags: [
            ["r", "wss://a", "read"],
            ["r", "wss://b", "write"],
          ],
        },
      ],
    };
    await fetchRelayList(ndk, "pk");
    const entry = await db.kind10002.get("pk");
    expect(entry?.pubkey).toBe("pk");
    expect(get(relayListStore)).toEqual([
      { url: "wss://a", read: true, write: false },
      { url: "wss://b", read: false, write: true },
    ]);
  });

  it("handles missing event", async () => {
    const ndk = { fetchEvents: async () => [] };
    await fetchRelayList(ndk, "pk2");
    const entry = await db.kind10002.get("pk2");
    expect(entry).toBeUndefined();
    expect(get(relayListStore)).toEqual([]);
  });
});
