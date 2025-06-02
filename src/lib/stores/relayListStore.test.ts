import { describe, it, expect, beforeEach, vi } from "vitest";
import { get } from "svelte/store";

const mockLocalStorage = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
};

Object.defineProperty(global, 'localStorage', {
  value: mockLocalStorage,
  writable: true
});

describe("relayListStore", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.resetModules();
  });

  it("saves relays to localStorage after fetch", async () => {
    mockLocalStorage.getItem.mockReturnValue(null);
    
    const mockNdk = {
      fetchEvents: vi.fn().mockResolvedValue(new Set())
    };
    
    const { fetchRelayList } = await import("./relayListStore");
    
    await fetchRelayList(mockNdk as any, "pubkey123");
    
    expect(mockLocalStorage.setItem).toHaveBeenCalledWith(
      'npubdev_relays_pubkey123',
      JSON.stringify([])
    );
  });

  it("loads relays from localStorage when auth changes", async () => {
    const storedRelays = [{ url: "wss://relay.test", read: true, write: true }];
    mockLocalStorage.getItem.mockReturnValue(JSON.stringify(storedRelays));
    
    const { relayListStore } = await import("./relayListStore");
    const { setAuth } = await import("./authStore");
    
    setAuth("pubkey123", "npub123", "NIP-07");
    
    expect(get(relayListStore)).toEqual(storedRelays);
    expect(mockLocalStorage.getItem).toHaveBeenCalledWith('npubdev_relays_pubkey123');
  });

  it("clears relays when auth is cleared", async () => {
    mockLocalStorage.getItem.mockReturnValue(null);
    
    const { relayListStore } = await import("./relayListStore");
    const { clearAuth } = await import("./authStore");
    
    clearAuth();
    
    expect(get(relayListStore)).toEqual([]);
  });
});
