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
<pre
  class="flex-1 overflow-auto p-2 bg-neutral-900"
  data-testid="json-viewer"
  class:ring-2={anim}
  class:ring-teal-500={anim}
  class:animate-ping={anim}
>{json}</pre>
