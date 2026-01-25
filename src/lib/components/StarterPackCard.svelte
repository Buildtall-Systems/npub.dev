<script lang="ts">
  import type { StarterPack } from "$lib/nostr/starterPacks";
  import { Button } from "$lib/components/ui/button/index.js";

  let {
    pack,
    onFollowAll,
    isFollowing = false,
  }: {
    pack: StarterPack;
    onFollowAll: (pubkeys: string[]) => void;
    isFollowing?: boolean;
  } = $props();
</script>

<div class="p-4 border border-border rounded-lg bg-card">
  <div class="flex justify-between items-start mb-3">
    <div>
      <h3 class="font-medium text-foreground">{pack.title}</h3>
      {#if pack.description}
        <p class="text-sm text-muted-foreground">{pack.description}</p>
      {/if}
    </div>
    <Button
      size="sm"
      onclick={() => onFollowAll(pack.pubkeys)}
      disabled={isFollowing}
    >
      {#if isFollowing}
        <div class="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin mr-1"></div>
        Following...
      {:else}
        Follow All ({pack.pubkeys.length})
      {/if}
    </Button>
  </div>

  <div class="flex items-center gap-2 text-xs text-muted-foreground">
    <span>{pack.pubkeys.length} accounts</span>
    {#if pack.topics.length > 0}
      <span class="text-muted-foreground/50">|</span>
      {#each pack.topics.slice(0, 3) as topic}
        <span class="px-1.5 py-0.5 bg-muted rounded">#{topic}</span>
      {/each}
    {/if}
  </div>
</div>
