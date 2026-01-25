<script lang="ts">
  import {
    getPrimaryClient,
    getAlternatives,
    platformLabels,
    type NostrClient,
  } from "$lib/data/clients";
  import { Button } from "$lib/components/ui/button/index.js";

  type Platform = NostrClient["platform"];

  let selectedPlatform = $state<Platform>("web");
  let showAlternatives = $state(false);

  let primaryClient = $derived(getPrimaryClient(selectedPlatform));
  let alternatives = $derived(getAlternatives(selectedPlatform));

  const platforms: Platform[] = ["ios", "android", "web", "desktop"];
</script>

<div class="space-y-4">
  <div class="flex flex-wrap gap-2">
    {#each platforms as platform}
      <button
        type="button"
        onclick={() => {
          selectedPlatform = platform;
          showAlternatives = false;
        }}
        class="px-4 py-2 text-sm rounded-lg border transition-colors {selectedPlatform === platform
          ? 'bg-primary text-primary-foreground border-primary'
          : 'bg-background text-foreground border-border hover:bg-muted'}"
      >
        {platformLabels[platform]}
      </button>
    {/each}
  </div>

  {#if primaryClient}
    <div class="p-4 border border-primary/50 rounded-lg bg-primary/5">
      <div class="flex items-start justify-between gap-4">
        <div>
          <div class="flex items-center gap-2">
            <h4 class="font-medium text-foreground">{primaryClient.name}</h4>
            <span class="text-xs px-1.5 py-0.5 bg-primary/20 text-primary rounded">Recommended</span>
          </div>
          <p class="text-sm text-muted-foreground mt-1">{primaryClient.description}</p>
        </div>
        <a
          href={primaryClient.url}
          target="_blank"
          rel="noopener noreferrer"
          class="shrink-0"
        >
          <Button size="sm">
            Get App
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
              class="ml-1"
            >
              <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
              <polyline points="15 3 21 3 21 9" />
              <line x1="10" x2="21" y1="14" y2="3" />
            </svg>
          </Button>
        </a>
      </div>
    </div>
  {/if}

  {#if alternatives.length > 0}
    <div>
      <button
        type="button"
        onclick={() => (showAlternatives = !showAlternatives)}
        class="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
          stroke-linecap="round"
          stroke-linejoin="round"
          class="transition-transform {showAlternatives ? 'rotate-180' : ''}"
        >
          <path d="m6 9 6 6 6-6" />
        </svg>
        {showAlternatives ? "Hide" : "Show"} alternatives ({alternatives.length})
      </button>

      {#if showAlternatives}
        <div class="mt-3 space-y-2">
          {#each alternatives as client}
            <div class="p-3 border border-border rounded-lg bg-card flex items-start justify-between gap-4">
              <div>
                <h4 class="font-medium text-foreground text-sm">{client.name}</h4>
                <p class="text-xs text-muted-foreground">{client.description}</p>
              </div>
              <a
                href={client.url}
                target="_blank"
                rel="noopener noreferrer"
                class="text-primary hover:underline text-sm shrink-0"
              >
                Get
              </a>
            </div>
          {/each}
        </div>
      {/if}
    </div>
  {/if}
</div>
