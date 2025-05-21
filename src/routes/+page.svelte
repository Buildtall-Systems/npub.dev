<script lang="ts">
import { onMount } from 'svelte'
import { nip07GetPubkey, nip46GetPubkey } from '$lib/nostr/auth'
import { nip19 } from 'nostr-tools'
import JsonViewer from '$lib/components/JsonViewer.svelte'
import { authStore, setAuth } from '$lib/stores/authStore'
import { loadRelayList } from '$lib/stores/relayListStore'
import { Button } from "$lib/components/ui/button/index.js"
import { Input } from "$lib/components/ui/input/index.js"

let hasNip07 = false
let signerType = ''
let pubkey = ''
let npub = ''
let nip46 = ''
let json = '{}'
let viewer: any

onMount(() => {
  hasNip07 = typeof window !== 'undefined' && (window as any).nostr?.getPublicKey
})

async function connectNip07() {
  const pk = await nip07GetPubkey()
  if (pk) {
    signerType = 'NIP-07'
    pubkey = pk
    npub = nip19.npubEncode(pk)
    setAuth(pubkey, npub, signerType)
    loadRelayList(pubkey)
  }
}

async function connectNip46() {
  const pk = await nip46GetPubkey(nip46)
  if (pk) {
    signerType = 'NIP-46'
    pubkey = pk
    npub = nip19.npubEncode(pk)
    setAuth(pubkey, npub, signerType)
    loadRelayList(pubkey)
  }
}

function publish() {
  if (viewer && typeof viewer.play === 'function') {
    viewer.play()
  }
}
</script>

{#if !$authStore.pubkey}
  <div class="flex items-center justify-center min-h-screen bg-background">
    <div class="w-full max-w-md bg-card rounded-lg shadow-md overflow-hidden border border-primary">
      {#if hasNip07}
        <div class="p-6 flex justify-center">
          <Button variant="default" on:click={connectNip07}>
            Use NIP-07
          </Button>
        </div>
      {:else}
        <div class="p-6 space-y-4">
          <h2 class="text-xl font-bold text-center mb-6 text-foreground">Connect</h2>
          <div class="space-y-4">
            <Input
              type="text"
              bind:value={nip46}
              placeholder="nostrconnect://"
            />
            <Button variant="default" on:click={connectNip46} class="w-full">
              Use remote signer
            </Button>
            <div class="text-center pt-2">
              <a 
                class="text-accent hover:text-accent-foreground hover:underline transition-colors" 
                href="https://getalby.com" 
                target="_blank"
              >
                Install a browser signer
              </a>
            </div>
          </div>
        </div>
      {/if}
    </div>
  </div>
{:else}
  <div class="p-6 m-2 bg-card rounded-lg shadow-md border border-border" data-testid="dashboard-panel">
    <h2 class="text-xl font-semibold mb-4 text-foreground">Dashboard</h2>
    <div class="flex justify-between items-start">
      <div class="flex-1">
        <p class="text-muted-foreground mb-4">Welcome to your npub.dev dashboard!</p>
        <div class="space-y-4">
          <p>Quick actions:</p>
          <ul class="list-disc pl-5 space-y-2">
            <li>
              <a href="/relays" class="text-primary hover:underline">Manage your relay list</a>
            </li>
          </ul>
        </div>
      </div>
      <div class="w-1/3">
        <JsonViewer bind:this={viewer} {json} />
      </div>
    </div>
    <div class="flex justify-end mt-4">
      <Button variant="default" on:click={publish} data-testid="publish">
        Publish
      </Button>
    </div>
  </div>
{/if}

