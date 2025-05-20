import { NDK } from "@nostr-dev-kit/ndk";
import { db } from "$lib/db";

export const bootstrapRelays = ["wss://relay.damus.io", "wss://nos.lol"];

export async function fetchProfile(
  pubkey: string,
  ndk = new NDK({ explicitRelayUrls: bootstrapRelays }),
) {
  await ndk.connect();
  const event = await ndk.fetchEvent({
    kinds: [0],
    authors: [pubkey],
    limit: 1,
  });
  if (event) {
    await db.kind0.put({ pubkey, event });
  }
  return event;
}
