<script lang="ts">
  import { Button } from "$lib/components/ui/button/index.js";

  let {
    hasProfile,
    hasRelays,
    hasNip05,
    followCount,
    onDismiss,
  }: {
    hasProfile: boolean;
    hasRelays: boolean;
    hasNip05: boolean;
    followCount: number;
    onDismiss: () => void;
  } = $props();

  let tasks = $derived([
    { done: hasProfile, label: "Set up your profile", href: "/profile" },
    { done: hasRelays, label: "Configure your relays", href: "/relays" },
    { done: hasNip05, label: "Get NIP-05 verified", href: "/identity" },
    { done: followCount >= 10, label: "Follow at least 10 accounts", href: "/discover" },
  ]);

  let completedCount = $derived(tasks.filter((t) => t.done).length);
  let allDone = $derived(completedCount === tasks.length);
</script>

{#if !allDone}
  <div class="relative p-4 bg-primary/5 border border-primary/20 rounded-lg">
    <button
      onclick={onDismiss}
      class="absolute top-2 right-2 text-muted-foreground hover:text-foreground"
      aria-label="Dismiss"
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
      >
        <path d="M18 6 6 18" />
        <path d="m6 6 12 12" />
      </svg>
    </button>

    <h3 class="text-sm font-medium text-foreground mb-3">
      Complete Your Nostr Setup ({completedCount}/{tasks.length})
    </h3>

    <div class="space-y-2">
      {#each tasks as task}
        <div class="flex items-center gap-3">
          {#if task.done}
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
            <span class="text-sm text-muted-foreground line-through">{task.label}</span>
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
            </svg>
            <a href={task.href} class="text-sm text-primary hover:underline">
              {task.label}
            </a>
          {/if}
        </div>
      {/each}
    </div>
  </div>
{/if}
