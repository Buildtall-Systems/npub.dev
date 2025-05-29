<script lang="ts">
  import { onMount, tick } from 'svelte';
  import { nip07GetPubkey } from '$lib/nostr/auth';
  import { nip19 } from 'nostr-tools';
  import NDK, { NDKNip07Signer, NDKEvent } from '@nostr-dev-kit/ndk';

  import { authStore, setAuth } from '$lib/stores/authStore';
  import { fetchRelayList, type RelayListItem } from '$lib/stores/relayListStore';

  import { Button } from "$lib/components/ui/button/index.js";

  type PageStateType = 'idle' | 'authenticating' | 'showingRelays' | 'error';

  let hasNip07 = $state(false);
  let ndk = $state<NDK | undefined>(undefined);

  let pageState = $state<PageStateType>('idle'); 
  let isPublishing = $state(false);

  let kind3Relays = $state<RelayListItem[]>([]);
  let kind10002RelayEvent = $state<NDKEvent | null>(null);
  let displayedRelays = $state<RelayListItem[]>([]);
  let errorMessage = $state<string | null>(null);

  const FETCH_TIMEOUT = 30000;

  $effect(() => {
    console.log('[NPUB_DEV_PAGE_STATE]', {
      ts: new Date().toISOString(),
      pageState,
      isPublishing,
      errorMessage,
      displayedRelaysCount: displayedRelays.length,
      hasKind10002: !!kind10002RelayEvent,
      kind3RelaysCount: kind3Relays.length,
      isPubkeySet: !!$authStore.pubkey,
      ndkConnected: ndk?.pool?.stats()?.connected || false
    });
  });

  onMount(() => {
    hasNip07 = typeof window !== 'undefined' && (window as any).nostr?.getPublicKey;
  });

  $effect(() => {
    if (hasNip07 && pageState === 'idle') {
      // This effect is now empty as the connectButton is removed
    }
  });

  async function initializeNDK() {
    const nip07Signer = new NDKNip07Signer(FETCH_TIMEOUT - 2000);
    ndk = new NDK({
      explicitRelayUrls: ['wss://relay.damus.io', 'wss://relay.primal.net'],
      signer: nip07Signer,
      debug: false,
    });

    try {
      await Promise.race([
        ndk.connect(2000),
        new Promise((_, reject) => setTimeout(() => reject(new Error('NDK connect timed out')), 5000))
      ]);
    } catch (e: any) {
      console.error("NDK connection failed or timed out:", e);
      errorMessage = `Failed to connect to initial relays: ${e.message}`;
      pageState = 'error';
      ndk = undefined;
      throw e;
    }
    return ndk;
  }

  async function connectNip07() {
    console.log('[NPUB_DEV_PAGE_ACTION] connectNip07 started');
    pageState = 'authenticating'; 
    await tick(); 
    errorMessage = null;
    kind3Relays = [];
    kind10002RelayEvent = null;
    displayedRelays = [];

    const pk = await nip07GetPubkey();
    if (!pk) {
      errorMessage = "NIP-07: Failed to get public key. Ensure extension is installed, unlocked, and permission granted.";
      pageState = 'error'; 
      await tick();
      console.log('[NPUB_DEV_PAGE_ACTION] NIP-07 failed to get pubkey');
      return;
    }
    
    setAuth(pk, nip19.npubEncode(pk), 'NIP-07');
    console.log('[NPUB_DEV_PAGE_ACTION] Auth set. Pubkey:', $authStore.pubkey);

    let localNdk: NDK | undefined;
    try {
      console.log('[NPUB_DEV_PAGE_ACTION] NDK initialization starting...');
      localNdk = await initializeNDK(); 
      console.log('[NPUB_DEV_PAGE_ACTION] NDK initialized');
    } catch (e) {
      console.log('[NPUB_DEV_PAGE_ACTION] NDK initialization failed in catch block');
      pageState = 'error';
      await tick();
      return;
    }

    if (!localNdk) {
        errorMessage = "NDK instance is not available after initialization. Cannot fetch relays.";
        pageState = 'error';
        await tick();
        console.log('[NPUB_DEV_PAGE_ACTION] NDK instance null/undefined post-initialization');
        return;
    }

    const fetchRelaysPromise = fetchRelayList(localNdk, pk);
    const timeoutPromise = new Promise((_, reject) => 
      setTimeout(() => reject(new Error('Fetching relay lists timed out')), FETCH_TIMEOUT)
    );

    try {
      console.log('[NPUB_DEV_PAGE_ACTION] Starting relay fetch (Promise.race)');
      const result = await Promise.race([fetchRelaysPromise, timeoutPromise]) as Awaited<ReturnType<typeof fetchRelayList>>;
      console.log('[NPUB_DEV_PAGE_ACTION] Relay fetch completed, result:', result);
      displayedRelays = result.finalRelays;
      kind3Relays = result.foundKind3Relays;
      kind10002RelayEvent = result.foundKind10002Event;
      pageState = 'showingRelays';
      await tick();

      if (!kind10002RelayEvent && kind3Relays.length === 0 && displayedRelays.length === 0) {
        errorMessage = `No relay lists (Kind 3 or Kind 10002) found after ${FETCH_TIMEOUT/1000} seconds. You can add relays manually below.`;
      } else if (!kind10002RelayEvent && kind3Relays.length > 0) {
        errorMessage = "Found relays in your Kind 3 contact list. You can use these to create or update a Kind 10002 relay list.";
      } else if (kind10002RelayEvent && displayedRelays.length === 0) {
        errorMessage = "Found a Kind 10002 relay list, but it appears to be empty. You can add relays to it.";
      } else if (kind10002RelayEvent) {
        errorMessage = null; 
      }

    } catch (error: any) {
      console.error("Error during relay fetching or timeout:", error);
      if (error.message.includes('timed out')) {
        errorMessage = `Fetching relay information timed out after ${FETCH_TIMEOUT/1000} seconds. You can try adding relays manually or refresh.`;
      } else {
        errorMessage = `An error occurred while fetching relay information: ${error.message}`;
      }
      pageState = 'error'; 
    } finally {
      await tick();
    }
  }
  async function publishKind10002() {
    if (!ndk || !$authStore.pubkey) {
      errorMessage = "Not connected or NDK not initialized.";
      return;
    }
    if (displayedRelays.length === 0) {
      errorMessage = "Cannot publish an empty relay list.";
      return;
    }

    isPublishing = true;
    await tick();
    errorMessage = null;

    const event = new NDKEvent(ndk);
    event.kind = 10002;
    event.pubkey = $authStore.pubkey;
    event.created_at = Math.floor(Date.now() / 1000);
    event.tags = displayedRelays.map(r => {
      const tag = ['r', r.url];
      if (r.read && !r.write) tag.push('read');
      else if (!r.read && r.write) tag.push('write');
      return tag;
    });

    try {
      await event.publish();
      kind10002RelayEvent = event;
      errorMessage = "Relay list published successfully!";
    } catch (e: any) {
      console.error("Error publishing kind 10002 event:", e);
      errorMessage = `Failed to publish relay list: ${e.message}`;
    } finally {
      isPublishing = false;
      await tick();
    }
  }
  
  function addRelay(url: string, read: boolean, write: boolean) {
    if (url && !displayedRelays.find(r => r.url === url)) {
      if (!url.startsWith('wss://')) {
        errorMessage = "Relay URL must start with wss://";
        return;
      }
      displayedRelays = [...displayedRelays, { url, read, write }];
      errorMessage = null; 
    }
  }

  function removeRelay(url: string) {
    displayedRelays = displayedRelays.filter(r => r.url !== url);
  }

  function toggleRelayPermissions(url: string) {
    displayedRelays = displayedRelays.map(relay => {
      if (relay.url === url) {
        if (relay.read && relay.write) { 
          return { ...relay, read: true, write: false };
        } else if (relay.read && !relay.write) { 
          return { ...relay, read: false, write: true };
        } else if (!relay.read && relay.write) { 
          return { ...relay, read: false, write: false };
        } else { 
          return { ...relay, read: true, write: true };
        }
      }
      return relay;
    });
  }

  const defaultRelays = [
    { url: 'wss://relay.damus.io', read: true, write: true },
    { url: 'wss://relay.primal.net', read: true, write: true },
    { url: 'wss://nostr.wine', read: true, write: true },
    { url: 'wss://nos.lol', read: true, write: true },
  ];

  let newRelayUrl = $state('');

  async function handleLogout() {
    setAuth('', '', '');
    if (ndk && ndk.pool) {
        ndk.pool.relays.forEach(relay => relay.disconnect());
    }
    ndk = undefined;
    pageState = 'idle';
    errorMessage = null;
    kind3Relays = [];
    kind10002RelayEvent = null;
    displayedRelays = [];
    await tick();
  }

</script>

<style>
  @keyframes spin {
    from { transform: rotate(0deg); }
    to { transform: rotate(360deg); }
  }
  
  .spinner-simple {
    width: 64px;
    height: 64px;
    border: 4px solid #e5e7eb;
    border-top: 4px solid #3b82f6;
    border-radius: 50%;
    animation: spin 1s linear infinite;
  }
</style>

<svelte:head>
  <title>Outbox Enabler</title>
</svelte:head>

<div class="container mx-auto p-4 max-w-2xl font-sans flex items-center justify-center min-h-screen">

  {#if pageState === 'idle'}
    <div class="w-full max-w-md bg-card text-card-foreground rounded-lg shadow-lg p-8 border border-border text-center">
      <h1 class="text-3xl font-bold text-center mb-8 text-foreground">Outbox Enabler</h1>
      
      <div class="text-left mb-8 space-y-4 text-sm text-muted-foreground">
        <p class="text-foreground font-medium">Keep Nostr Decentralized</p>
        <p>
          This app helps you implement the <a href="https://github.com/nostr-protocol/nips/blob/master/65.md" 
          target="_blank" class="text-primary hover:underline font-medium">outbox model</a>, 
          which ensures your notes are discoverable while keeping the network distributed and resilient.
        </p>
        <p>
          For Nostr to remain truly decentralized, we need to know where to find each other's notes. 
          Without proper relay distribution, we risk creating just a few super-node relays where everyone goes, 
          defeating the purpose of a distributed network.
        </p>
        <p>
          This app provides a limited selection of relays to get you started. The idea is to get you started with the outbox model, that way app developers can assume most users have configured their outbox. You are welcomed to bring your own relay URLs or even return to the site later to update your choices.
        </p>
      </div>
      
      {#if hasNip07}
        <Button variant="default" on:click={connectNip07} class="w-full text-lg py-3 h-auto" autofocus>
          Connect with NIP-07 Extension
        </Button>
      {:else}
        <div class="p-4 space-y-3 text-center bg-muted rounded-md">
            <p class="text-muted-foreground font-medium">NIP-07 compatible extension not found.</p>
            <p class="text-sm text-muted-foreground">
              To use this tool, please install a browser extension like 
              <a class="text-primary hover:underline" href="https://getalby.com" target="_blank">Alby</a> or 
              <a class="text-primary hover:underline" href="https://github.com/nostr-protocol/nos2x" target="_blank">nos2x</a>.
            </p>
          </div>
      {/if}
    </div>

  {:else if pageState === 'authenticating'}
    <div class="text-center">
      <div class="spinner-simple mx-auto mb-4"></div>
      <h2 class="text-2xl font-semibold text-foreground">Loading your relays...</h2>
      <p class="text-muted-foreground">Please wait while we connect and fetch your relay configuration.</p>
    </div>

  {:else if pageState === 'showingRelays'}
    <div class="w-full max-w-2xl bg-card text-card-foreground rounded-lg shadow-md p-6 border border-border">
      <div class="flex justify-between items-center mb-6">
        <h2 class="text-2xl font-semibold text-foreground">Relay Configuration</h2>
        <Button variant="outline" size="sm" on:click={handleLogout}>Logout</Button>
      </div>
      <p class="text-sm text-muted-foreground mb-1">Logged in as: <span class="font-mono text-xs">{$authStore.npub}</span></p>
      
      {#if errorMessage && (displayedRelays.length === 0 && !kind10002RelayEvent && !errorMessage.includes('success')) }
        <div class="my-6 p-4 bg-destructive/10 border border-destructive text-destructive-foreground rounded-md text-sm">
          <p class="font-medium">Attention:</p>
          <p>{errorMessage}</p>
        </div>
      {/if}

      <h3 class="text-xl font-medium mt-6 mb-4 text-foreground">Your Current Relay List</h3>
      {#if displayedRelays.length > 0}
        <ul class="space-y-2 mb-6 border border-border rounded-md p-3 bg-background shadow-sm">
          {#each displayedRelays as relay (relay.url)}
            <li class="flex justify-between items-center p-2.5 bg-muted/30 rounded-md hover:bg-muted/60 transition-colors">
              <div class="flex-grow">
                  <span class="font-mono text-sm break-all">{relay.url}</span>
              </div>
              <Button 
                variant="outline" 
                size="sm"
                class="ml-3 text-xs px-1.5 py-0.5 rounded font-medium w-[70px] text-center shrink-0 transition-colors 
                {relay.read && relay.write ? 'bg-green-200 text-green-800 hover:bg-green-300' : 
                 (relay.read ? 'bg-blue-200 text-blue-800 hover:bg-blue-300' : 
                  (relay.write ? 'bg-purple-200 text-purple-800 hover:bg-purple-300' : 'bg-slate-200 text-slate-800 hover:bg-slate-300'))}"
                on:click={() => toggleRelayPermissions(relay.url)}
              >
                {relay.read && relay.write ? 'R/W' : (relay.read ? 'Read' : (relay.write ? 'Write' : 'None'))}
              </Button>
              <Button variant="ghost" size="icon" class="text-muted-foreground hover:text-destructive hover:bg-destructive/10 ml-2 shrink-0" on:click={() => removeRelay(relay.url)}>
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
              </Button>
            </li>
          {/each}
        </ul>
      {:else if !errorMessage || (errorMessage && (displayedRelays.length > 0 || errorMessage.includes('success')))} 
        <p class="text-muted-foreground mb-6 text-sm p-4 border border-dashed border-border rounded-md bg-muted/30">
          No relays are currently in your list. Add relays using the form below.
          {#if kind10002RelayEvent && displayedRelays.length === 0} (Your saved Kind 10002 list is empty).{/if}
        </p>
      {/if}

      <div class="mt-6 pt-6 border-t border-border">
        <h3 class="text-xl font-medium mb-4 text-foreground">Add or Update Relays</h3>
        <div class="flex flex-col sm:flex-row gap-2 mb-4 items-start">
          <input type="url" bind:value={newRelayUrl} placeholder="wss://your.relay.url" class="flex h-10 w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 flex-grow" />
          <Button on:click={() => { addRelay(newRelayUrl, true, true); newRelayUrl = ''; }} class="shrink-0 w-full sm:w-auto">Add Relay (R/W)</Button>
        </div>
      
        {#if displayedRelays.length < 3 && kind3Relays.length > 0}
          <div class="my-4 p-3 bg-muted/50 border border-border rounded-md">
            <h4 class="text-md font-medium mb-2 text-foreground">Suggestions from your contacts (Kind 3):</h4>
            <ul class="flex flex-wrap gap-2">
              {#each kind3Relays as relay (relay.url)}
                <li>
                  <Button variant="outline" size="sm" class="bg-background hover:bg-muted border-border text-foreground" on:click={() => addRelay(relay.url, relay.read, relay.write)}>
                    + {new URL(relay.url).hostname} <span class="ml-1 text-xs">({relay.read && relay.write ? 'R/W' : (relay.read ? 'R' : 'W')})</span>
                  </Button>
                </li>
              {/each}
            </ul>
          </div>
        {/if}

        {#if displayedRelays.length < 3 && kind3Relays.length === 0}
          <div class="my-4 p-3 bg-muted/50 border border-border rounded-md">
            <h4 class="text-md font-medium mb-2 text-foreground">Default Relay Suggestions:</h4>
            <ul class="flex flex-wrap gap-2">
              {#each defaultRelays as relay (relay.url)}
                <li>
                  <Button variant="outline" size="sm" class="bg-background hover:bg-muted border-border text-foreground" on:click={() => addRelay(relay.url, relay.read, relay.write)}>
                    + {new URL(relay.url).hostname}
                  </Button>
                </li>
              {/each}
            </ul>
          </div>
        {/if}
      </div>
      
      <div class="mt-8 flex justify-end">
        <Button on:click={publishKind10002} size="lg" class="min-w-[200px] h-auto py-3" disabled={isPublishing}>
          {#if isPublishing}<svg class="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg> Processing...{:else}{kind10002RelayEvent ? 'Update' : 'Publish'} Relay List{/if}
        </Button>
      </div>
      {#if errorMessage && pageState === 'showingRelays' && (displayedRelays.length > 0 || errorMessage.includes('success')) } 
        <p class="mt-6 text-sm text-center {(errorMessage.includes('success') || errorMessage.includes('updated')) ? 'text-green-600' : 'text-destructive'}">{errorMessage}</p>
      {/if}
    </div>

  {:else if pageState === 'error'}
    <div class="text-center">
      <h2 class="text-2xl font-semibold text-destructive mb-4">An Error Occurred</h2>
      <p class="text-destructive-foreground">{errorMessage || 'Unknown error.'}</p>
      <Button on:click={handleLogout} class="mt-6">Go Back</Button>
    </div>
  {/if}
</div>