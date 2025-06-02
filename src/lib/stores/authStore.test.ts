import { describe, it, expect, beforeEach, vi } from "vitest";
import { authStore, setAuth } from "./authStore";
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

describe("authStore", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.resetModules();
  });

  it("updates and notifies", () => {
    const spy = vi.fn();
    const unsub = authStore.subscribe(spy);
    setAuth("pub", "npub", "NIP-07");
    expect(get(authStore)).toEqual({
      pubkey: "pub",
      npub: "npub",
      signerType: "NIP-07",
    });
    expect(spy).toHaveBeenCalled();
    unsub();
  });

  it("persists auth state to localStorage", async () => {
    mockLocalStorage.getItem.mockReturnValue(null);
    
    const { authStore, setAuth } = await import("./authStore");
    
    setAuth("pubkey123", "npub123", "NIP-07");
    
    expect(mockLocalStorage.setItem).toHaveBeenCalledWith(
      'npubdev_auth',
      JSON.stringify({ pubkey: "pubkey123", npub: "npub123", signerType: "NIP-07" })
    );
  });

  it("loads auth state from localStorage on module import", async () => {
    const storedAuth = { pubkey: "stored123", npub: "npubstored", signerType: "NIP-46" };
    mockLocalStorage.getItem.mockReturnValue(JSON.stringify(storedAuth));
    
    const { authStore } = await import("./authStore");
    
    expect(get(authStore)).toEqual(storedAuth);
    expect(mockLocalStorage.getItem).toHaveBeenCalledWith('npubdev_auth');
  });

  it("handles invalid JSON in localStorage", async () => {
    mockLocalStorage.getItem.mockReturnValue('invalid json');
    
    const { authStore } = await import("./authStore");
    
    expect(get(authStore)).toEqual({ pubkey: "", npub: "", signerType: "" });
  });
});
