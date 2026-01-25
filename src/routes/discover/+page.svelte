<script lang="ts">
  import { onMount } from "svelte";
  import { goto } from "$app/navigation";
  import NDK, { NDKNip07Signer } from "@nostr-dev-kit/ndk";

  import { authStore } from "$lib/stores/authStore";
  import { nostrState } from "$lib/stores/nostrState";
  import { logout } from "$lib/stores/logout";
  import { logger } from "$lib/logger";
  import {
    fetchStarterPacks,
    subscribeToPackAccounts,
    CURATED_STARTER_PACKS,
    type StarterPack,
  } from "$lib/nostr/starterPacks";

  import { Button } from "$lib/components/ui/button/index.js";
  import * as Card from "$lib/components/ui/card/index.js";
  import InterestSelector from "$lib/components/InterestSelector.svelte";
  import StarterPackCard from "$lib/components/StarterPackCard.svelte";
  import ClientRecommendation from "$lib/components/ClientRecommendation.svelte";

  let ndk = $state<NDK | undefined>(undefined);
  let isLoading = $state(true);
  let isLoadingPacks = $state(false);
  let isFollowing = $state(false);
  let message = $state<{ type: "success" | "error"; text: string } | null>(null);

  let selectedInterests = $state<string[]>([]);
  let starterPacks = $state<StarterPack[]>([]);
  let showCurated = $state(true);

  let followCount = $derived(() => {
    if (!$nostrState.contacts) return 0;
    return $nostrState.contacts.tags?.filter((t) => t[0] === "p").length ?? 0;
  });

  $effect(() => {
    if (!$authStore.pubkey) {
      goto("/");
    }
  });

  onMount(async () => {
    if (!$authStore.pubkey) return;

    try {
      if ($authStore.signerType === "NIP-46") {
        ndk = new NDK({
          explicitRelayUrls: ["wss://relay.damus.io", "wss://relay.primal.net"],
          debug: false,
        });
        await Promise.race([
          ndk.connect(2000),
          new Promise((_, reject) =>
            setTimeout(() => reject(new Error("NDK connect timed out")), 5000)
          ),
        ]);
      } else {
        const signer = new NDKNip07Signer();
        await Promise.race([
          signer.user(),
          new Promise((_, reject) =>
            setTimeout(() => reject(new Error("Signer readiness timed out")), 10000)
          ),
        ]);

        ndk = new NDK({
          explicitRelayUrls: ["wss://relay.damus.io", "wss://relay.primal.net"],
          signer,
          debug: false,
        });

        await Promise.race([
          ndk.connect(2000),
          new Promise((_, reject) =>
            setTimeout(() => reject(new Error("NDK connect timed out")), 5000)
          ),
        ]);
      }

      if (!$nostrState.contacts) {
        await nostrState.fetchNostrState(ndk, $authStore.pubkey);
      }

      starterPacks = CURATED_STARTER_PACKS;
    } catch (e: any) {
      logger.error("[Discover] Failed to initialize:", e);
    } finally {
      isLoading = false;
    }
  });

  async function handleInterestChange(interests: string[]) {
    selectedInterests = interests;

    if (!ndk || interests.length === 0) {
      showCurated = true;
      starterPacks = CURATED_STARTER_PACKS;
      return;
    }

    isLoadingPacks = true;
    showCurated = false;

    try {
      const fetched = await fetchStarterPacks(ndk, interests);
      if (fetched.length > 0) {
        starterPacks = fetched;
      } else {
        starterPacks = CURATED_STARTER_PACKS.filter((pack) =>
          pack.topics.some((t) => interests.includes(t))
        );
        if (starterPacks.length === 0) {
          starterPacks = CURATED_STARTER_PACKS;
          showCurated = true;
        }
      }
    } catch (e: any) {
      logger.error("[Discover] Error fetching packs:", e);
      starterPacks = CURATED_STARTER_PACKS;
      showCurated = true;
    } finally {
      isLoadingPacks = false;
    }
  }

  async function handleFollowAll(pubkeys: string[]) {
    if (!ndk || !$authStore.pubkey) return;

    isFollowing = true;
    message = null;

    try {
      const event = await subscribeToPackAccounts(
        ndk,
        $authStore.pubkey,
        $nostrState.contacts,
        pubkeys
      );
      nostrState.updateContacts(event);
      message = { type: "success", text: `Successfully followed ${pubkeys.length} accounts!` };
    } catch (e: any) {
      logger.error("[Discover] Follow error:", e);
      message = { type: "error", text: e.message || "Failed to follow accounts" };
    } finally {
      isFollowing = false;
    }
  }

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
  <title>Discover - npub.dev</title>
</svelte:head>

<div class="container mx-auto p-4 max-w-2xl">
  {#if isLoading || $nostrState.loading}
    <div class="flex items-center justify-center py-12">
      <div class="spinner-simple"></div>
      <p class="ml-4 text-muted-foreground">Loading...</p>
    </div>
  {:else}
    <div class="space-y-6">
      <Card.Root>
        <Card.Header>
          <Card.Title>Discover Accounts</Card.Title>
          <Card.Description>
            Find interesting people to follow on Nostr
            {#if followCount() > 0}
              <span class="text-foreground">(currently following {followCount()})</span>
            {/if}
          </Card.Description>
        </Card.Header>

        <Card.Content class="space-y-6">
          {#if message}
            <div
              class="p-3 rounded-md text-sm {message.type === 'success'
                ? 'bg-green-100 text-green-800 border border-green-200'
                : 'bg-destructive/10 text-destructive border border-destructive/20'}"
            >
              {message.text}
            </div>
          {/if}

          <InterestSelector
            selected={selectedInterests}
            onSelectionChange={handleInterestChange}
          />

          <div class="border-t border-border pt-6">
            <h3 class="text-sm font-medium text-foreground mb-4">
              {#if showCurated}
                Curated Starter Packs
              {:else if isLoadingPacks}
                Searching for starter packs...
              {:else}
                Starter Packs for Your Interests
              {/if}
            </h3>

            {#if isLoadingPacks}
              <div class="flex items-center justify-center py-8">
                <div class="spinner-simple"></div>
              </div>
            {:else}
              <div class="space-y-3">
                {#each starterPacks as pack (pack.id)}
                  <StarterPackCard {pack} onFollowAll={handleFollowAll} {isFollowing} />
                {/each}

                {#if starterPacks.length === 0}
                  <p class="text-center text-muted-foreground py-8">
                    No starter packs found. Try selecting different interests.
                  </p>
                {/if}
              </div>
            {/if}
          </div>
        </Card.Content>
      </Card.Root>

      <Card.Root>
        <Card.Header>
          <Card.Title>Nostr Clients</Card.Title>
          <Card.Description>
            Find the right Nostr app for your device
          </Card.Description>
        </Card.Header>
        <Card.Content>
          <ClientRecommendation />
        </Card.Content>
      </Card.Root>
    </div>
  {/if}
</div>

<style>
  @keyframes spin {
    from {
      transform: rotate(0deg);
    }
    to {
      transform: rotate(360deg);
    }
  }

  .spinner-simple {
    width: 32px;
    height: 32px;
    border: 3px solid #e5e7eb;
    border-top: 3px solid #3b82f6;
    border-radius: 50%;
    animation: spin 1s linear infinite;
  }
</style>
