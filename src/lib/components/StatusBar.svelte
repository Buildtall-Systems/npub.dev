<script lang="ts">
  export let npub = ''
  export let signerType = ''
</script>

<div class="flex items-center justify-between p-3 bg-primary/20 border-b border-primary/40 shadow-md" data-testid="status-bar">
  <div class="flex items-center">
    <span class="text-sm font-mono bg-muted px-3 py-1 rounded-md border border-border truncate max-w-[200px] sm:max-w-xs md:max-w-sm text-foreground">{npub}</span>
  </div>
  <div class="flex items-center space-x-4">
    <span class="px-2 py-1 bg-primary/80 rounded-md text-xs font-medium text-primary-foreground">{signerType}</span>
    <div class="flex items-center">
      <span class="w-2 h-2 rounded-full bg-accent animate-pulse-slow mr-2"></span>
      <span class="text-xs font-medium text-accent">online</span>
    </div>
  </div>
</div>
