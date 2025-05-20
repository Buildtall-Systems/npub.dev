import { writable } from "svelte/store";
import { db } from "$lib/nostr/db";
import { fetchNip11 } from "./nip11Store";

export interface RelayListItem {
  url: string;
  read: boolean;
  write: boolean;
  name?: string;
  icon_url?: string;
}

export const relayListStore = writable<RelayListItem[]>([]);

async function hydrate(list: RelayListItem[]) {
  const res: RelayListItem[] = [];
  for (const item of list) {
    const info = await db.nip11.get(item.url);
    res.push({ ...item, name: info?.name, icon_url: info?.icon_url });
  }
  return res;
}

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
    const hydrated = await hydrate(list);
    relayListStore.set(hydrated);
    fetchNip11(list.map((i) => i.url));
  } else {
    relayListStore.set([]);
  }
}
