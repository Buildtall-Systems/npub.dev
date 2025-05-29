export async function nip07GetPubkey() {
  if (typeof window !== "undefined" && (window as any).nostr?.getPublicKey) {
    try {
      return await (window as any).nostr.getPublicKey();
    } catch {}
  }
  return null;
}
