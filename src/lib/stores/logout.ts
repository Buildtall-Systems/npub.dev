import { clearAuth } from './authStore';
import { clearRelaysForPubkey } from './relayListStore';
import { get } from 'svelte/store';
import { authStore } from './authStore';

export function logout() {
  const currentAuth = get(authStore);
  if (currentAuth.pubkey) {
    clearRelaysForPubkey(currentAuth.pubkey);
  }
  clearAuth();
} 