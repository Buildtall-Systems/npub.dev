import { writable } from "svelte/store";
import { db } from "$lib/nostr/db";

export interface RelayListItem {
  url: string;
  read: boolean;
  write: boolean;
}

export const relayListStore = writable<RelayListItem[]>([]);

export async function fetchRelayList(ndk: any, pubkey: string) {
  const events = await ndk.fetchEvents({
    kinds: [10002],
    authors: [pubkey],
    limit: 1,
  });
  const event = events[0];
  if (event) {
    await db.kind10002.put({ pubkey, event });
    const list = (event.tags || [])
      .filter((t: any[]) => t[0] === "r")
      .map((t: any[]) => {
        const m = t[2] || "";
        return { url: t[1], read: m !== "write", write: m !== "read" };
      });
    relayListStore.set(list);
  } else {
    relayListStore.set([]);
  }
}
