import { writable } from "svelte/store";

export interface AuthState {
  pubkey: string;
  npub: string;
  signerType: string;
}

const AUTH_KEY = 'npubdev_auth';

function loadAuthFromStorage(): AuthState {
  if (typeof window === 'undefined') {
    return { pubkey: "", npub: "", signerType: "" };
  }
  
  const stored = localStorage.getItem(AUTH_KEY);
  if (stored) {
    try {
      return JSON.parse(stored);
    } catch {
      return { pubkey: "", npub: "", signerType: "" };
    }
  }
  return { pubkey: "", npub: "", signerType: "" };
}

const initial = loadAuthFromStorage();

export const authStore = writable<AuthState>(initial);

// Hydrate from localStorage once we're in the browser
if (typeof window !== 'undefined') {
  const stored = loadAuthFromStorage();
  if (stored.pubkey) {
    authStore.set(stored);
  }
}

export function setAuth(pubkey: string, npub: string, signerType: string) {
  const auth = { pubkey, npub, signerType };
  authStore.set(auth);
  if (typeof window !== 'undefined') {
    localStorage.setItem(AUTH_KEY, JSON.stringify(auth));
  }
}

export function clearAuth() {
  const emptyAuth = { pubkey: "", npub: "", signerType: "" };
  authStore.set(emptyAuth);
  if (typeof window !== 'undefined') {
    localStorage.removeItem(AUTH_KEY);
  }
}
