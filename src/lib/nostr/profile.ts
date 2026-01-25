import type NDK from "@nostr-dev-kit/ndk";
import { NDKEvent } from "@nostr-dev-kit/ndk";
import { logger } from "$lib/logger";

export interface ProfileMetadata {
  name?: string;
  display_name?: string;
  about?: string;
  picture?: string;
  banner?: string;
  website?: string;
  nip05?: string;
  lud16?: string;
  lud06?: string;
}

export function parseKind0Content(event: NDKEvent | null): ProfileMetadata {
  if (!event) return {};

  try {
    return JSON.parse(event.content) as ProfileMetadata;
  } catch {
    logger.error("[Profile] Failed to parse kind 0 content");
    return {};
  }
}

export function createKind0Event(ndk: NDK, pubkey: string, metadata: ProfileMetadata): NDKEvent {
  const event = new NDKEvent(ndk);
  event.kind = 0;
  event.pubkey = pubkey;
  event.created_at = Math.floor(Date.now() / 1000);
  event.content = JSON.stringify(metadata);
  event.tags = [];
  return event;
}

export async function publishKind0(ndk: NDK, event: NDKEvent): Promise<void> {
  await event.sign();
  await event.publish();
  logger.log("[Profile] Kind 0 published successfully");
}

export function updateNip05InProfile(
  currentMetadata: ProfileMetadata,
  nip05: string
): ProfileMetadata {
  return {
    ...currentMetadata,
    nip05,
  };
}
