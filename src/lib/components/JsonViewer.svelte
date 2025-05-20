<script lang="ts">
  export let json = '{}'
  let anim = false
  export function play() {
    anim = true
    setTimeout(() => {
      anim = false
    }, 300)
  }
</script>

<div class="w-1/3 m-2 flex flex-col bg-card rounded-r-lg shadow-md overflow-hidden border border-primary" data-testid="json-viewer-container">
  <div class="flex items-center justify-between bg-primary/20 px-4 py-2 border-b border-primary/50">
    <h3 class="text-sm font-medium text-foreground">JSON Preview</h3>
  </div>
  <pre
    class="flex-1 overflow-auto p-4 font-mono text-xs text-accent bg-muted"
    data-testid="json-viewer"
    class:ring-2={anim}
    class:ring-primary={anim}
    class:animate-pulse={anim}
  >{json}</pre>
</div>
