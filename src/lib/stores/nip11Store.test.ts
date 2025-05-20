import { describe, it, expect, vi, beforeEach } from "vitest";
import { get } from "svelte/store";
import { fetchNip11, loadNip11, nip11Store } from "./nip11Store";
import { db } from "$lib/nostr/db";

beforeEach(async () => {
  await db.nip11.clear();
  nip11Store.set({});
});

describe("fetchNip11", () => {
  it("stores name and icon", async () => {
    globalThis.fetch = vi.fn().mockResolvedValue({
      json: vi.fn().mockResolvedValue({ name: "relay", icon: "i" }),
    }) as any;
    await fetchNip11(["https://a"]);
    const entry = await db.nip11.get("https://a");
    expect(entry?.name).toBe("relay");
    expect(entry?.icon_url).toBe("i");
    expect(get(nip11Store)["https://a"].name).toBe("relay");
  });

  it("handles missing icon", async () => {
    globalThis.fetch = vi.fn().mockResolvedValue({
      json: vi.fn().mockResolvedValue({ name: "r" }),
    }) as any;
    await fetchNip11(["https://b"]);
    const entry = await db.nip11.get("https://b");
    expect(entry?.name).toBe("r");
    expect(entry?.icon_url).toBeUndefined();
  });

  it("handles fetch failure", async () => {
    globalThis.fetch = vi.fn().mockRejectedValue(new Error("fail")) as any;
    await fetchNip11(["https://c"]);
    const entry = await db.nip11.get("https://c");
    expect(entry).toBeUndefined();
    expect(get(nip11Store)["https://c"]).toBeUndefined();
  });

  it("loads from db", async () => {
    await db.nip11.put({ url: "https://d", name: "D", icon_url: "i" });
    await loadNip11(["https://d"]);
    expect(get(nip11Store)["https://d"].name).toBe("D");
  });
});
