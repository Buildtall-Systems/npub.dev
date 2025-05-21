import { authStore } from '$lib/stores/authStore';
import { loadRelayList } from '$lib/stores/relayListStore';
import { get } from 'svelte/store';
import type { PageLoad } from './$types';

export const load: PageLoad = async () => {
  const auth = get(authStore);
  
  if (auth.pubkey) {
    await loadRelayList(auth.pubkey);
  }
  
  return {
    auth
  };
}; 