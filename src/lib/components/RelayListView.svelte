<script lang="ts">
import { relayListStore } from '$lib/stores/relayListStore'
import { derived } from 'svelte/store'
const readRelays = derived(relayListStore, l => l.filter(r => r.read))
const writeRelays = derived(relayListStore, l => l.filter(r => r.write))
</script>
<div class="p-4 grid grid-cols-2 gap-4">
  <div>
    <h2 class="mb-2">Read Relays</h2>
    <ul data-testid="read-list" class="space-y-1">
      {#each $readRelays as r}
        <li>{r.url}</li>
      {/each}
    </ul>
  </div>
  <div>
    <h2 class="mb-2">Write Relays</h2>
    <ul data-testid="write-list" class="space-y-1">
      {#each $writeRelays as r}
        <li>{r.url}</li>
      {/each}
    </ul>
  </div>
</div>
