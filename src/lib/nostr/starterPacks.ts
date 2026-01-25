import type NDK from "@nostr-dev-kit/ndk";
import { NDKEvent } from "@nostr-dev-kit/ndk";
import { logger } from "$lib/logger";

export interface StarterPack {
  id: string;
  title: string;
  description: string;
  pubkeys: string[];
  topics: string[];
  authorPubkey: string;
}

export function parseStarterPack(event: NDKEvent): StarterPack | null {
  try {
    const dTag = event.tags.find((t) => t[0] === "d")?.[1] || event.id;
    const titleTag = event.tags.find((t) => t[0] === "title")?.[1];
    const descTag = event.tags.find((t) => t[0] === "description")?.[1];
    const pTags = event.tags.filter((t) => t[0] === "p").map((t) => t[1]);
    const tTags = event.tags.filter((t) => t[0] === "t").map((t) => t[1]);

    if (!pTags.length) return null;

    return {
      id: dTag,
      title: titleTag || "Starter Pack",
      description: descTag || "",
      pubkeys: pTags,
      topics: tTags,
      authorPubkey: event.pubkey,
    };
  } catch (e) {
    logger.error("[StarterPacks] Failed to parse:", e);
    return null;
  }
}

export async function fetchStarterPacks(
  ndk: NDK,
  interests: string[]
): Promise<StarterPack[]> {
  try {
    const events = await ndk.fetchEvents({
      kinds: [39089],
      "#t": interests.length > 0 ? interests : undefined,
      limit: 20,
    });

    const packs: StarterPack[] = [];
    for (const event of events) {
      const pack = parseStarterPack(event);
      if (pack) {
        packs.push(pack);
      }
    }

    logger.log("[StarterPacks] Found packs:", packs.length);
    return packs;
  } catch (e) {
    logger.error("[StarterPacks] Fetch error:", e);
    return [];
  }
}

export async function subscribeToPackAccounts(
  ndk: NDK,
  pubkey: string,
  existingContacts: NDKEvent | null,
  newPubkeys: string[]
): Promise<NDKEvent> {
  const existingPubkeys: string[] = [];
  if (existingContacts) {
    for (const tag of existingContacts.tags) {
      if (tag[0] === "p" && tag[1]) {
        existingPubkeys.push(tag[1]);
      }
    }
  }

  const mergedPubkeys = [...new Set([...existingPubkeys, ...newPubkeys])];

  const event = new NDKEvent(ndk);
  event.kind = 3;
  event.pubkey = pubkey;
  event.created_at = Math.floor(Date.now() / 1000);
  event.tags = mergedPubkeys.map((pk) => ["p", pk]);
  event.content = existingContacts?.content || "";

  await event.sign();
  await event.publish();

  logger.log("[StarterPacks] Published kind 3 with", mergedPubkeys.length, "follows");
  return event;
}

export const CURATED_STARTER_PACKS: StarterPack[] = [
  {
    id: "bitcoin-builders",
    title: "Bitcoin Builders",
    description: "Developers and builders in the Bitcoin ecosystem",
    pubkeys: [
      "82341f882b6eabcd2ba7f1ef90aad961cf074af15b9ef44a09f9d2a8fbfbe6a2",
      "fa984bd7dbb282f07e16e7ae87b26a2a7b9b90b7246a44771f0cf5ae58018f52",
      "32e1827635450ebb3c5a7d12c1f8e7b2b514439ac10a67eef3d9fd9c5c68e245",
    ],
    topics: ["bitcoin"],
    authorPubkey: "",
  },
  {
    id: "nostr-devs",
    title: "Nostr Developers",
    description: "Core Nostr protocol developers and client builders",
    pubkeys: [
      "3bf0c63fcb93463407af97a5e5ee64fa883d107ef9e558472c4eb9aaaefa459d",
      "460c25e682fda7832b52d1f22d3d22b3176d972f60dcdc3212ed8c92ef85065c",
      "00000000827ffaa94bfea288c3dfce4422c794fbb96625b6b31e9049f729d700",
    ],
    topics: ["nostr"],
    authorPubkey: "",
  },
  {
    id: "art-creators",
    title: "Art & Creators",
    description: "Artists and creative minds on Nostr",
    pubkeys: [
      "9ec7a778167afb1d30c4833de9322da0c08ba71a69e1911d5578d3144bb56437",
      "1bc70a0148b3f316da33fe3c89f23e3e71ac4ff998027ec712b905cd24f6a411",
    ],
    topics: ["art", "creative"],
    authorPubkey: "",
  },
  {
    id: "tech-news",
    title: "Tech & News",
    description: "Technology news and commentary",
    pubkeys: [
      "e88a691e98d9987c964521dff60025f60700378a4879180dcbbb4a5027850411",
      "6e468422dfb74a5738702a8823b9b28168abab8655faacb6853cd0ee15deee93",
    ],
    topics: ["tech", "news"],
    authorPubkey: "",
  },
];
