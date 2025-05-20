import { describe, it, expect, vi } from "vitest";
import { authStore, setAuth } from "./authStore";
import { get } from "svelte/store";

describe("authStore", () => {
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
});
