<script lang="ts">
import RelayListView from '$lib/components/RelayListView.svelte'
import { authStore } from '$lib/stores/authStore'
</script>

<div class="p-6 m-2 bg-card rounded-lg shadow-md border border-border" data-testid="relay-page">
  <h2 class="text-xl font-semibold mb-4 text-foreground">Your Relay List</h2>
  <RelayListView />
</div> 