import { writable } from "svelte/store";

export interface AuthState {
  pubkey: string;
  npub: string;
  signerType: string;
}

const initial: AuthState = { pubkey: "", npub: "", signerType: "" };

export const authStore = writable<AuthState>(initial);

export function setAuth(pubkey: string, npub: string, signerType: string) {
  authStore.set({ pubkey, npub, signerType });
}
