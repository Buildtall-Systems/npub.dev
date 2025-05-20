import { describe, it, expect, vi } from "vitest";
import { nip07GetPubkey, nip46GetPubkey } from "./auth";

describe("auth", () => {
  it("nip07 success", async () => {
    (globalThis as any).window = {
      nostr: { getPublicKey: vi.fn().mockResolvedValue("pub") },
    };
    const pk = await nip07GetPubkey();
    expect(pk).toBe("pub");
  });

  it("nip07 missing", async () => {
    (globalThis as any).window = {};
    const pk = await nip07GetPubkey();
    expect(pk).toBeNull();
  });

  it("nip46 parse", async () => {
    const pk = await nip46GetPubkey("nostrconnect://abc@relay");
    expect(pk).toBe("abc");
  });
});
