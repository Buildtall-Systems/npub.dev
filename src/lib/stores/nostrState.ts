import { writable, get } from "svelte/store";
import type NDK from "@nostr-dev-kit/ndk";
import type { NDKEvent } from "@nostr-dev-kit/ndk";
import { logger } from "$lib/logger";

export interface NostrState {
  profile: NDKEvent | null;
  relays: NDKEvent | null;
  contacts: NDKEvent | null;
  loading: boolean;
  error: string | null;
}

const initialState: NostrState = {
  profile: null,
  relays: null,
  contacts: null,
  loading: false,
  error: null,
};

function createNostrStateStore() {
  const { subscribe, set, update } = writable<NostrState>(initialState);

  return {
    subscribe,

    async fetchNostrState(ndk: NDK, pubkey: string): Promise<void> {
      update((state) => ({ ...state, loading: true, error: null }));

      try {
        const events = await ndk.fetchEvents({
          kinds: [0, 3, 10002],
          authors: [pubkey],
        });

        let profile: NDKEvent | null = null;
        let contacts: NDKEvent | null = null;
        let relays: NDKEvent | null = null;

        for (const event of events) {
          if (event.kind === 0) {
            if (!profile || (event.created_at ?? 0) > (profile.created_at ?? 0)) {
              profile = event;
            }
          } else if (event.kind === 3) {
            if (!contacts || (event.created_at ?? 0) > (contacts.created_at ?? 0)) {
              contacts = event;
            }
          } else if (event.kind === 10002) {
            if (!relays || (event.created_at ?? 0) > (relays.created_at ?? 0)) {
              relays = event;
            }
          }
        }

        update((state) => ({
          ...state,
          profile,
          contacts,
          relays,
          loading: false,
          error: null,
        }));

        logger.log("[NostrState] Fetched state:", {
          hasProfile: !!profile,
          hasContacts: !!contacts,
          hasRelays: !!relays
        });
      } catch (e: any) {
        logger.error("[NostrState] Error fetching state:", e);
        update((state) => ({
          ...state,
          loading: false,
          error: e.message || "Failed to fetch Nostr state",
        }));
      }
    },

    updateProfile(event: NDKEvent): void {
      update((state) => ({ ...state, profile: event }));
    },

    updateRelays(event: NDKEvent): void {
      update((state) => ({ ...state, relays: event }));
    },

    updateContacts(event: NDKEvent): void {
      update((state) => ({ ...state, contacts: event }));
    },

    clearNostrState(): void {
      set(initialState);
    },

    getState(): NostrState {
      return get({ subscribe });
    },
  };
}

export const nostrState = createNostrStateStore();
