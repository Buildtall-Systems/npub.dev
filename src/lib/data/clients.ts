export interface NostrClient {
  name: string;
  platform: "ios" | "android" | "web" | "desktop";
  description: string;
  url: string;
  primary?: boolean;
}

export const clients: NostrClient[] = [
  {
    name: "Damus",
    platform: "ios",
    description: "The original iOS Nostr client. Feature-rich and well-maintained.",
    url: "https://apps.apple.com/app/damus/id1628663131",
    primary: true,
  },
  {
    name: "Nos",
    platform: "ios",
    description: "Clean, simple Nostr client focused on ease of use.",
    url: "https://apps.apple.com/app/nos-social/id1673445462",
  },
  {
    name: "Primal",
    platform: "ios",
    description: "Fast client with built-in wallet and caching.",
    url: "https://apps.apple.com/app/primal/id1673134518",
  },
  {
    name: "Amethyst",
    platform: "android",
    description: "Feature-packed Android client with great customization.",
    url: "https://play.google.com/store/apps/details?id=com.vitorpamplona.amethyst",
    primary: true,
  },
  {
    name: "Primal",
    platform: "android",
    description: "Fast client with built-in wallet and caching.",
    url: "https://play.google.com/store/apps/details?id=net.primal.android",
  },
  {
    name: "Nostros",
    platform: "android",
    description: "Lightweight, focused on core functionality.",
    url: "https://github.com/KoalaSat/nostros",
  },
  {
    name: "Primal",
    platform: "web",
    description: "Fast, responsive web client with excellent UX.",
    url: "https://primal.net",
    primary: true,
  },
  {
    name: "Snort",
    platform: "web",
    description: "Feature-rich web client with Twitter-like interface.",
    url: "https://snort.social",
  },
  {
    name: "Coracle",
    platform: "web",
    description: "Privacy-focused with relay management features.",
    url: "https://coracle.social",
  },
  {
    name: "Nostrudel",
    platform: "web",
    description: "Advanced features for power users.",
    url: "https://nostrudel.ninja",
  },
  {
    name: "Gossip",
    platform: "desktop",
    description: "Native desktop client focused on outbox model and privacy.",
    url: "https://github.com/mikedilger/gossip/releases",
    primary: true,
  },
  {
    name: "Lume",
    platform: "desktop",
    description: "Beautiful, fast desktop client with modern design.",
    url: "https://lume.nu",
  },
];

export function getClientsByPlatform(platform: NostrClient["platform"]): NostrClient[] {
  return clients.filter((c) => c.platform === platform);
}

export function getPrimaryClient(platform: NostrClient["platform"]): NostrClient | undefined {
  return clients.find((c) => c.platform === platform && c.primary);
}

export function getAlternatives(platform: NostrClient["platform"]): NostrClient[] {
  return clients.filter((c) => c.platform === platform && !c.primary);
}

export const platformLabels: Record<NostrClient["platform"], string> = {
  ios: "iOS",
  android: "Android",
  web: "Web",
  desktop: "Desktop",
};
