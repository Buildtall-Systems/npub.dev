<script lang="ts">
  import "../app.css";
  import { page } from "$app/stores";
  import { authStore } from "$lib/stores/authStore";
  import type { Snippet } from "svelte";

  import { Button } from "$lib/components/ui/button/index.js";

  let { children }: { children: Snippet } = $props();

  let isAuthenticated = $derived(!!$authStore.pubkey);
  let currentPath = $derived($page.url.pathname);

  const navLinks = [
    { href: "/dashboard", label: "Dashboard" },
    { href: "/profile", label: "Profile" },
    { href: "/relays", label: "Relays" },
    { href: "/identity", label: "Identity" },
    { href: "/discover", label: "Discover" },
    { href: "/settings", label: "Settings" },
  ];
</script>

{#if isAuthenticated && currentPath !== "/"}
  <nav class="border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
    <div class="container mx-auto px-4 max-w-4xl">
      <div class="flex h-14 items-center justify-between">
        <div class="flex items-center gap-6">
          <a href="/dashboard" class="font-semibold text-foreground hover:text-primary transition-colors">
            npub.dev
          </a>
          <div class="hidden sm:flex items-center gap-1">
            {#each navLinks as link}
              <a
                href={link.href}
                class="px-3 py-2 text-sm rounded-md transition-colors {currentPath === link.href
                  ? 'bg-muted text-foreground font-medium'
                  : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'}"
              >
                {link.label}
              </a>
            {/each}
          </div>
        </div>
      </div>

      <div class="sm:hidden pb-3 flex flex-wrap gap-1">
        {#each navLinks as link}
          <a
            href={link.href}
            class="px-3 py-1.5 text-sm rounded-md transition-colors {currentPath === link.href
              ? 'bg-muted text-foreground font-medium'
              : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'}"
          >
            {link.label}
          </a>
        {/each}
      </div>
    </div>
  </nav>
{/if}

<main class="min-h-screen bg-background">
  {@render children()}
</main>
