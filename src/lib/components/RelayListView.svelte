<script lang="ts">
import { relayListStore } from '$lib/stores/relayListStore'
import { derived } from 'svelte/store'
import * as Card from "$lib/components/ui/card"

const readRelays = derived(relayListStore, l => l.filter(r => r.read))
const writeRelays = derived(relayListStore, l => l.filter(r => r.write))
const hasRelays = derived(relayListStore, l => l.length > 0)
</script>

{#if $hasRelays}
  <div class="p-4 grid grid-cols-2 gap-4">
    <div>
      <h2 class="text-lg font-semibold mb-2">Read Relays</h2>
      <ul data-testid="read-list" class="space-y-1">
        {#each $readRelays as r}
          <li>{r.url}</li>
        {/each}
      </ul>
    </div>
    <div>
      <h2 class="text-lg font-semibold mb-2">Write Relays</h2>
      <ul data-testid="write-list" class="space-y-1">
        {#each $writeRelays as r}
          <li>{r.url}</li>
        {/each}
      </ul>
    </div>
  </div>
{:else}
  <div class="p-4" data-testid="empty-state">
    <Card.Root class="w-full">
      <Card.Header>
        <Card.Title>No Relay List Configured</Card.Title>
        <Card.Description>
          Your NIP-65 relay list helps others find your content on Nostr
        </Card.Description>
      </Card.Header>
      <Card.Content>
        <div class="space-y-4">
          <p>Creating a relay list provides important benefits:</p>
          <ul class="list-disc pl-5 space-y-2">
            <li>
              <span class="font-medium">Improved discoverability</span> - Helps others find and interact with your content
            </li>
            <li>
              <span class="font-medium">Better performance</span> - Optimizes how your followers and clients retrieve your data
            </li>
            <li>
              <span class="font-medium">More control</span> - You decide which relays host your content
            </li>
          </ul>
          <p class="text-muted-foreground">
            Configure your relay list below to get started.
          </p>
        </div>
      </Card.Content>
    </Card.Root>
  </div>
{/if}
