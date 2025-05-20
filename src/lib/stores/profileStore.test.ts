import { describe, it, expect, beforeEach } from "vitest"
import { get } from "svelte/store"
import { loadProfile, profileStore } from "./profileStore"
import { db } from "$lib/nostr/db"
import { nip19 } from "nostr-tools"

beforeEach(async () => {
  await db.kind0.clear()
  profileStore.set(null)
})

describe("loadProfile", () => {
  it("loads npub from cache", async () => {
    await db.kind0.put({ pubkey: "pk", event: { name: "A" } })
    await loadProfile("pk")
    expect(get(profileStore)?.npub).toBe(nip19.npubEncode("pk"))
  })

  it("handles missing entry", async () => {
    await loadProfile("missing")
    expect(get(profileStore)).toBeNull()
  })
})
