import { writable } from "svelte/store";
import type { NDKEvent } from "@nostr-dev-kit/ndk"; // Import NDKEvent type
import type NDK from '@nostr-dev-kit/ndk';
import { logger } from '$lib/logger';
import { authStore } from './authStore';
// import { db } from "$lib/nostr/db"; removed
// import { fetchNip11, loadNip11 } from "./nip11Store"; removed

export interface RelayListItem {
  url: string;
  read: boolean;
  write: boolean;
  // name and icon_url will now come directly from NIP-11 fetched in memory if needed, or not at all for simplicity initially.
}

export interface RelayListResult {
  finalRelays: RelayListItem[];
  foundKind3Relays: RelayListItem[];
  foundKind10002Event: NDKEvent | null;
}

export const relayListStore = writable<RelayListItem[]>([]); // This store might not be directly used by the page anymore, or used differently

function getRelayKey(pubkey: string): string {
  return `npubdev_relays_${pubkey}`;
}

function loadRelaysFromStorage(pubkey: string): RelayListItem[] {
  if (!pubkey) return [];
  const stored = localStorage.getItem(getRelayKey(pubkey));
  if (stored) {
    try {
      return JSON.parse(stored);
    } catch {
      return [];
    }
  }
  return [];
}

function saveRelaysToStorage(pubkey: string, relays: RelayListItem[]) {
  if (!pubkey) return;
  localStorage.setItem(getRelayKey(pubkey), JSON.stringify(relays));
}

authStore.subscribe((auth) => {
  if (auth.pubkey) {
    const storedRelays = loadRelaysFromStorage(auth.pubkey);
    relayListStore.set(storedRelays);
  } else {
    relayListStore.set([]);
  }
});

export async function fetchRelayList(ndk: NDK, pubkey: string): Promise<RelayListResult> {
  logger.log("fetchRelayList called with pubkey:", pubkey);

  let finalRelays: RelayListItem[] = [];
  let foundKind3Relays: RelayListItem[] = [];
  let foundKind10002Event: NDKEvent | null = null;

  // 1. Fetch Kind 10002 (NIP-65)
  const k10002EventsSet = await ndk.fetchEvents({
    kinds: [10002],
    authors: [pubkey],
    // limit: 1, // NDK fetchEvents with limit 1 might not wait for all relays if closeOnEose is true by default
  });
  // Convert Set to Array, then sort to get the latest
  const k10002EventsArray = Array.from(k10002EventsSet);
  const latestK10002Event = k10002EventsArray.sort((a: NDKEvent, b: NDKEvent) => (b.created_at ?? 0) - (a.created_at ?? 0))[0];

  if (latestK10002Event) {
    logger.log("Found Kind 10002 event:", latestK10002Event);
    foundKind10002Event = latestK10002Event;
    finalRelays = (latestK10002Event.tags || [])
      .filter((t: any[]) => t[0] === "r" && typeof t[1] === 'string')
      .map((t: any[]) => {
        const url = t[1];
        const marker = t[2] || "";
        return { url, read: marker !== "write", write: marker !== "read" };
      });
  }

  // 2. Fetch Kind 3 (NIP-02)
  const k3EventsSet = await ndk.fetchEvents({
    kinds: [3],
    authors: [pubkey],
    // limit: 1,
  });
  const k3EventsArray = Array.from(k3EventsSet);
  const latestK3Event = k3EventsArray.sort((a: NDKEvent, b: NDKEvent) => (b.created_at ?? 0) - (a.created_at ?? 0))[0];

  if (latestK3Event && latestK3Event.content) {
    logger.log("Found Kind 3 event:", latestK3Event);
    try {
      const parsedContent = JSON.parse(latestK3Event.content);
      for (const url in parsedContent) {
        if (typeof url === 'string' && parsedContent.hasOwnProperty(url) && typeof parsedContent[url] === 'object' && parsedContent[url] !== null) {
          foundKind3Relays.push({
            url,
            read: parsedContent[url].read !== undefined ? parsedContent[url].read : true,
            write: parsedContent[url].write !== undefined ? parsedContent[url].write : true
          });
        }
      }
      logger.log("Parsed Kind 3 relays:", foundKind3Relays);
    } catch (e) {
      logger.error("Error parsing Kind 3 event content:", e);
    }
  }

  if (!foundKind10002Event && foundKind3Relays.length > 0) {
    logger.log("No Kind 10002, using Kind 3 relays as finalRelays");
    finalRelays = [...foundKind3Relays];
  }
  
  saveRelaysToStorage(pubkey, finalRelays);
  relayListStore.set(finalRelays);

  return { finalRelays, foundKind3Relays, foundKind10002Event };
}

export function clearRelaysForPubkey(pubkey: string) {
  if (pubkey) {
    localStorage.removeItem(getRelayKey(pubkey));
  }
}

// Removed loadRelayList function
