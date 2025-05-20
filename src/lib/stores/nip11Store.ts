import { writable } from "svelte/store";
import { db } from "$lib/nostr/db";

export interface Nip11Info {
  url: string;
  name?: string;
  icon_url?: string;
}

export const nip11Store = writable<Record<string, Nip11Info>>({});

export async function fetchNip11(urls: string[]) {
  const set = new Set(urls);
  const entries: Record<string, Nip11Info> = {};
  for (const url of set) {
    try {
      const res = await fetch(url, {
        headers: { Accept: "application/nostr+json" },
      });
      const json = await res.json();
      const item = {
        url,
        name: json.name,
        icon_url: json.icon,
        last_checked: Date.now(),
      } as const;
      await db.nip11.put(item);
      entries[url] = { url, name: json.name, icon_url: json.icon };
    } catch (error) {
      console.error(`Failed to fetch or process NIP-11 data for URL: ${url}`, error);
    }
  }
  if (Object.keys(entries).length) {
    nip11Store.update((s) => ({ ...s, ...entries }));
  }
}

export async function loadNip11(urls: string[]) {
  const set = new Set(urls)
  const entries: Record<string, Nip11Info> = {}
  for (const url of set) {
    const item = await db.nip11.get(url)
    if (item) {
      entries[url] = { url: item.url, name: item.name, icon_url: item.icon_url }
    }
  }
  if (Object.keys(entries).length) {
    nip11Store.update((s) => ({ ...s, ...entries }))
  }
}
