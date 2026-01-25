<script lang="ts">
  import type { Nip05VerifyResult } from "$lib/nostr/nip05";

  let {
    identifier,
    status,
  }: {
    identifier: string | null;
    status: "verified" | "invalid" | "not-set" | "checking";
  } = $props();
</script>

<div class="flex items-center gap-2">
  {#if status === "checking"}
    <div class="w-4 h-4 border-2 border-muted-foreground border-t-primary rounded-full animate-spin"></div>
    <span class="text-sm text-muted-foreground">Verifying...</span>
  {:else if status === "verified"}
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
      class="text-green-600"
    >
      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
      <polyline points="22 4 12 14.01 9 11.01" />
    </svg>
    <span class="text-sm font-medium text-green-600">{identifier}</span>
  {:else if status === "invalid"}
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
      class="text-destructive"
    >
      <circle cx="12" cy="12" r="10" />
      <path d="m15 9-6 6" />
      <path d="m9 9 6 6" />
    </svg>
    <span class="text-sm text-destructive">{identifier} (invalid)</span>
  {:else}
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
      class="text-muted-foreground"
    >
      <circle cx="12" cy="12" r="10" />
      <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
      <path d="M12 17h.01" />
    </svg>
    <span class="text-sm text-muted-foreground">Not set</span>
  {/if}
</div>
