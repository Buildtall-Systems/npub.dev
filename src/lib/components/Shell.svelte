<script lang="ts">
import { authStore } from '$lib/stores/authStore';
import StatusBar from './StatusBar.svelte';
// import { page } from '$app/stores'; // No longer needed for navigation
</script>

{#if $authStore.pubkey}
  <div class="min-h-screen flex flex-col bg-background text-foreground">
    <StatusBar npub={$authStore.npub} signerType={$authStore.signerType} />
    
    <div class="flex flex-1 h-[calc(100vh-44px)]"> <!-- Adjusted height if status bar is ~44px -->
      <!-- <aside class="w-56 bg-card border-r border-border p-4 shadow-sm"> -->
        <!-- <nav>
          <ul class="space-y-2">
            <li>
              <a
                href="/"
                class="flex items-center py-2 px-4 rounded transition-colors {$page.url.pathname === '/' ? 'bg-primary text-primary-foreground' : 'hover:bg-muted'}"
              >
                Dashboard
              </a>
            </li>
            <li>
              <a
                href="/relays"
                class="flex items-center py-2 px-4 rounded transition-colors {$page.url.pathname === '/relays' ? 'bg-primary text-primary-foreground' : 'hover:bg-muted'}"
                data-testid="relays-nav-link"
              >
                Relay List
              </a>
            </li>
          </ul>
        </nav> -->
      <!-- </aside> -->
      
      <main class="flex-1 overflow-auto p-4 md:p-6"> <!-- Added some padding to main -->
        <slot />
      </main>
    </div>
  </div>
{:else}
  <slot />
{/if} 