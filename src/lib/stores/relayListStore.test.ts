import { describe, it, expect } from "vitest";
import { get } from "svelte/store";
import { relayListStore, fetchRelayList, loadRelayList } from "./relayListStore";
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

  it("hydrates nip11 info", async () => {
    await db.nip11.put({ url: "wss://a", name: "A", icon_url: "i" });
    const ndk = {
      fetchEvents: async () => [
        {
          tags: [["r", "wss://a", "read"]],
        },
      ],
    };
    await fetchRelayList(ndk, "pk3");
    expect(get(relayListStore)).toEqual([
      { url: "wss://a", read: true, write: false, name: "A", icon_url: "i" },
    ]);
  });

  it("handles missing event", async () => {
    const ndk = { fetchEvents: async () => [] };
    await fetchRelayList(ndk, "pk2");
    const entry = await db.kind10002.get("pk2");
    expect(entry).toBeUndefined();
    expect(get(relayListStore)).toEqual([]);
  });

  it("loads from cache", async () => {
    await db.kind10002.put({ pubkey: "pk4", event: { tags: [["r", "wss://a", "read"]] } });
    await db.nip11.put({ url: "wss://a", name: "A" });
    await loadRelayList("pk4");
    expect(get(relayListStore)).toEqual([
      { url: "wss://a", read: true, write: false, name: "A" },
    ]);
  });
});
