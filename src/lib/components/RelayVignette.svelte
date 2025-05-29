<script lang="ts">
  export let url = ''
  export let name = ''
  export let icon_url = ''
  export let read = false
  export let write = false
  const initial = (name || url ? (name || url).slice(0, 1).toUpperCase() : '?')
</script>
<div class="flex items-center space-x-2" data-testid="relay-vignette">
  {#if icon_url}
    <img src={icon_url} alt="" class="w-8 h-8 rounded-full" />
  {:else}
    <div class="w-8 h-8 rounded-full bg-neutral-700 flex items-center justify-center">
      <span class="text-sm">{initial}</span>
    </div>
  {/if}
  <div>
    <span class="block truncate max-w-48">{url}</span>
    {#if name}
      <span class="text-sm text-neutral-400">{name}</span>
    {/if}
  </div>
</div>
