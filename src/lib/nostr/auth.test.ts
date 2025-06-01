import { describe, it, expect, vi } from "vitest";
import { nip07GetPubkey, nip46GetPubkey } from "./auth";

describe("auth", () => {
  it("nip07 success", async () => {
    const validHexPubkey = "1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef";
    (globalThis as any).window = {
      nostr: { getPublicKey: vi.fn().mockResolvedValue(validHexPubkey) },
    };
    const pk = await nip07GetPubkey();
    expect(pk).toBe(validHexPubkey);
  });

  it("nip07 missing", async () => {
    (globalThis as any).window = {};
    const pk = await nip07GetPubkey();
    expect(pk).toBeNull();
  });

  it("nip46 parse", async () => {
    const validHexPubkey = "1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef";
    const pk = await nip46GetPubkey(`nostrconnect://${validHexPubkey}@relay`);
    expect(pk).toBe(validHexPubkey);
  });

  it("nip46 bunker parse", async () => {
    const validHexPubkey = "1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef";
    const pk = await nip46GetPubkey(`bunker://${validHexPubkey}@relay`);
    expect(pk).toBe(validHexPubkey);
  });
});
