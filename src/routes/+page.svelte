<script lang="ts">
import { onMount } from 'svelte'
import { nip07GetPubkey, nip46GetPubkey } from '$lib/nostr/auth'
import { nip19 } from 'nostr-tools'
import StatusBar from '$lib/components/StatusBar.svelte'
import JsonViewer from '$lib/components/JsonViewer.svelte'
let hasNip07 = false
let signerType = ''
let pubkey = ''
let npub = ''
let confirm = false
let nip46 = ''
let connected = false
let json = '{}'
let viewer: typeof JsonViewer
onMount(() => {
  hasNip07 = typeof window !== 'undefined' && (window as any).nostr?.getPublicKey
})
async function connectNip07() {
  const pk = await nip07GetPubkey()
  if (pk) {
    signerType = 'NIP-07'
    pubkey = pk
    npub = nip19.npubEncode(pk)
    confirm = true
  }
}
async function connectNip46() {
  const pk = await nip46GetPubkey(nip46)
  if (pk) {
    signerType = 'NIP-46'
    pubkey = pk
    npub = nip19.npubEncode(pk)
    confirm = true
  }
}
function continueApp() {
  connected = true
}
function publish() {
  viewer.play()
}
</script>
{#if !connected}
  {#if !confirm}
    {#if hasNip07}
      <button class="m-4 px-4 py-2 bg-neutral-800" on:click={connectNip07}>Use NIP-07</button>
    {:else}
      <div class="p-4 space-y-2">
        <input class="w-full p-2 bg-neutral-800" bind:value={nip46} placeholder="nostrconnect://" />
        <button class="px-4 py-2 bg-neutral-800" on:click={connectNip46}>Use remote signer</button>
        <a class="block underline" href="https://getalby.com" target="_blank">Install a browser signer</a>
      </div>
    {/if}
  {:else}
    <div class="p-4 text-center space-y-2">
      <p>Continue as {npub}</p>
      <button class="px-4 py-2 bg-neutral-800" on:click={continueApp}>Continue</button>
    </div>
  {/if}
{:else}
  <StatusBar {npub} {signerType} />
  <div class="flex h-[calc(100vh-40px)]">
    <div class="flex-1 p-4" data-testid="main-panel">Main</div>
    <JsonViewer bind:this={viewer} {json} />
  </div>
  <button class="m-4 px-4 py-2 bg-neutral-800" on:click={publish} data-testid="publish">Publish</button>
{/if}

