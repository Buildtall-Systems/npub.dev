export async function nip07GetPubkey() {
  if (typeof window !== "undefined" && (window as any).nostr?.getPublicKey) {
    try {
      return await (window as any).nostr.getPublicKey();
    } catch {}
  }
  return null;
}

export async function nip46GetPubkey(uri: string) {
  try {
    const key = uri.replace("nostrconnect://", "").split("@")[0];
    return key || null;
  } catch {
    return null;
  }
}
