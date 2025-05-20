import { writable } from "svelte/store"
import { db } from "$lib/nostr/db"
import { nip19 } from "nostr-tools"

export interface ProfileData {
  pubkey: string
  npub: string
  event: unknown
}

export const profileStore = writable<ProfileData | null>(null)

export async function loadProfile(pubkey: string) {
  const entry = await db.kind0.get(pubkey)
  if (entry) {
    profileStore.set({ pubkey, npub: nip19.npubEncode(pubkey), event: entry.event })
  } else {
    profileStore.set(null)
  }
}
