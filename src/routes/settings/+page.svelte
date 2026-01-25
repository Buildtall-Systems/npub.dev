<script lang="ts">
  import { onMount } from "svelte";
  import { goto } from "$app/navigation";
  import NDK from "@nostr-dev-kit/ndk";

  import { authStore } from "$lib/stores/authStore";
  import { nostrState } from "$lib/stores/nostrState";
  import { logout } from "$lib/stores/logout";

  import { Button } from "$lib/components/ui/button/index.js";
  import * as Card from "$lib/components/ui/card/index.js";

  let ndk = $state<NDK | undefined>(undefined);

  $effect(() => {
    if (!$authStore.pubkey) {
      goto("/");
    }
  });

  async function handleLogout() {
    if (ndk?.pool) {
      ndk.pool.relays.forEach((relay) => relay.disconnect());
    }
    ndk = undefined;
    nostrState.clearNostrState();
    logout();
    await goto("/");
  }
</script>

<svelte:head>
  <title>Settings - npub.dev</title>
</svelte:head>

<div class="container mx-auto p-4 max-w-2xl">
  <div class="space-y-6">
    <Card.Root>
      <Card.Header>
        <Card.Title>Settings</Card.Title>
        <Card.Description>Manage your npub.dev session</Card.Description>
      </Card.Header>
      <Card.Content class="space-y-4">
        <div class="p-4 border border-border rounded-lg">
          <h3 class="text-sm font-medium text-foreground mb-2">Current Session</h3>
          <p class="text-sm text-muted-foreground font-mono break-all">
            {$authStore.npub}
          </p>
          <p class="text-xs text-muted-foreground mt-1">
            Signed in via {$authStore.signerType}
          </p>
        </div>

        <Button variant="destructive" onclick={handleLogout} class="w-full">
          Sign Out
        </Button>
      </Card.Content>
    </Card.Root>

    <Card.Root>
      <Card.Header>
        <Card.Title>About npub.dev</Card.Title>
      </Card.Header>
      <Card.Content class="space-y-4 text-sm text-muted-foreground">
        <p>
          npub.dev is your Nostr profile hub, helping you set up and manage your
          Nostr identity, relay configuration, and social connections.
        </p>

        <p>
          Built by <a href="https://buildtall.systems" target="_blank" rel="noopener noreferrer" class="text-primary hover:underline">buildtall.systems</a>
          as part of the sovereign information ecosystem.
        </p>

        <div class="pt-4 border-t border-border">
          <h4 class="text-foreground font-medium mb-2">Learn More About Nostr</h4>
          <ul class="space-y-2">
            <li>
              <a
                href="https://nostr.com"
                target="_blank"
                rel="noopener noreferrer"
                class="text-primary hover:underline"
              >
                nostr.com - Introduction to Nostr
              </a>
            </li>
            <li>
              <a
                href="https://github.com/nostr-protocol/nips"
                target="_blank"
                rel="noopener noreferrer"
                class="text-primary hover:underline"
              >
                NIPs - Nostr Implementation Possibilities
              </a>
            </li>
            <li>
              <a
                href="https://nostr.how"
                target="_blank"
                rel="noopener noreferrer"
                class="text-primary hover:underline"
              >
                nostr.how - Guides and Tutorials
              </a>
            </li>
          </ul>
        </div>
      </Card.Content>
    </Card.Root>
  </div>
</div>
