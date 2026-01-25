import { logger } from "$lib/logger";

export interface Nip05ParseResult {
  user: string;
  domain: string;
}

export function parseNip05(identifier: string): Nip05ParseResult | null {
  if (!identifier || !identifier.includes("@")) {
    return null;
  }

  const parts = identifier.split("@");
  if (parts.length !== 2) {
    return null;
  }

  const [user, domain] = parts;
  if (!user || !domain) {
    return null;
  }

  return { user, domain };
}

export interface Nip05VerifyResult {
  valid: boolean;
  error?: string;
  pubkey?: string;
  relays?: string[];
}

export async function verifyNip05(
  identifier: string,
  expectedPubkey: string
): Promise<Nip05VerifyResult> {
  const parsed = parseNip05(identifier);
  if (!parsed) {
    return { valid: false, error: "Invalid NIP-05 format. Expected: user@domain.com" };
  }

  const { user, domain } = parsed;
  const url = `https://${domain}/.well-known/nostr.json?name=${encodeURIComponent(user)}`;

  try {
    const response = await fetch(url, {
      headers: {
        Accept: "application/json",
      },
    });

    if (!response.ok) {
      if (response.status === 404) {
        return { valid: false, error: `NIP-05 file not found at ${domain}` };
      }
      return { valid: false, error: `HTTP error: ${response.status}` };
    }

    const data = await response.json();

    if (!data.names || typeof data.names !== "object") {
      return { valid: false, error: "Invalid NIP-05 response format" };
    }

    const pubkey = data.names[user];
    if (!pubkey) {
      return { valid: false, error: `User "${user}" not found in NIP-05 file` };
    }

    if (pubkey.toLowerCase() !== expectedPubkey.toLowerCase()) {
      return { valid: false, error: "Public key mismatch - NIP-05 points to different key" };
    }

    const relays = data.relays?.[pubkey] || [];

    logger.log("[NIP-05] Verification successful:", identifier);
    return { valid: true, pubkey, relays };
  } catch (e: any) {
    logger.error("[NIP-05] Verification error:", e);

    if (e.message?.includes("Failed to fetch") || e.name === "TypeError") {
      return {
        valid: false,
        error: `Cannot reach ${domain}. This may be a CORS issue - try verifying from the domain's server.`,
      };
    }

    return { valid: false, error: e.message || "Verification failed" };
  }
}
