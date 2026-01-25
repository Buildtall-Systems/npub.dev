<script lang="ts">
  const providers = [
    {
      name: "Nostr Plebs",
      url: "https://nostrplebs.com",
      description: "Free and paid NIP-05 identifiers with various domains",
    },
    {
      name: "Nostr.Directory",
      url: "https://nostr.directory",
      description: "Link your Nostr to your Twitter for verification",
    },
    {
      name: "Alby",
      url: "https://getalby.com",
      description: "Lightning wallet with free yourname@getalby.com identifier",
    },
    {
      name: "Primal",
      url: "https://primal.net",
      description: "Free yourname@primal.net with premium account",
    },
    {
      name: "Snort.social",
      url: "https://snort.social",
      description: "Free yourname@snort.social identifier",
    },
  ];
</script>

<div class="space-y-3">
  <h4 class="text-sm font-medium text-foreground">Popular NIP-05 Providers</h4>
  <div class="grid gap-3">
    {#each providers as provider}
      <a
        href={provider.url}
        target="_blank"
        rel="noopener noreferrer"
        class="flex items-start gap-3 p-3 rounded-lg border border-border bg-card hover:bg-muted/50 transition-colors"
      >
        <div class="flex-1 min-w-0">
          <p class="font-medium text-foreground">{provider.name}</p>
          <p class="text-sm text-muted-foreground">{provider.description}</p>
        </div>
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
          class="text-muted-foreground shrink-0 mt-1"
        >
          <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
          <polyline points="15 3 21 3 21 9" />
          <line x1="10" x2="21" y1="14" y2="3" />
        </svg>
      </a>
    {/each}
  </div>

  <div class="mt-4 p-4 bg-muted/50 rounded-lg">
    <h5 class="text-sm font-medium text-foreground mb-2">Self-hosting</h5>
    <p class="text-sm text-muted-foreground">
      If you own a domain, you can self-host your NIP-05 by creating a file at
      <code class="px-1 py-0.5 bg-muted rounded text-xs"
        >/.well-known/nostr.json</code
      >
      on your server. See
      <a
        href="https://github.com/nostr-protocol/nips/blob/master/05.md"
        target="_blank"
        rel="noopener noreferrer"
        class="text-primary hover:underline">NIP-05 specification</a
      >
      for details.
    </p>
  </div>
</div>
