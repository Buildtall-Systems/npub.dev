<script lang="ts">
  export let npub = ''
  export let signerType = ''
</script>
<div class="flex items-center justify-between p-2 bg-neutral-900" data-testid="status-bar">
  <span class="truncate">{npub}</span>
  <span>{signerType}</span>
  <span class="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
</div>
