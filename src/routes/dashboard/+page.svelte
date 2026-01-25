<script lang="ts">
  import { onMount } from "svelte";
  import { goto } from "$app/navigation";
  import NDK, { NDKNip07Signer, NDKNip46Signer } from "@nostr-dev-kit/ndk";

  import { authStore } from "$lib/stores/authStore";
  import { nostrState } from "$lib/stores/nostrState";
  import { logger } from "$lib/logger";

  import { Button } from "$lib/components/ui/button/index.js";
  import * as Card from "$lib/components/ui/card/index.js";
  import OnboardingBanner from "$lib/components/OnboardingBanner.svelte";
  import DashboardProfileHero from "$lib/components/DashboardProfileHero.svelte";
  import type { ProfileMetadata } from "$lib/nostr/profile";

  let ndk = $state<NDK | undefined>(undefined);
  let displayName = $state<string>("");
  let showOnboarding = $state(true);

  $effect(() => {
    if (!$authStore.pubkey) {
      goto("/");
    }
  });

  $effect(() => {
    if ($nostrState.profile) {
      try {
        const profileData = JSON.parse($nostrState.profile.content);
        displayName = profileData.display_name || profileData.name || "";
      } catch {
        displayName = "";
      }
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

      await nostrState.fetchNostrState(ndk, $authStore.pubkey);
    } catch (e: any) {
      logger.error("[Dashboard] Failed to initialize:", e);
    }
  });

  
  function getFollowCount(): number {
    if (!$nostrState.contacts) return 0;
    return (
      $nostrState.contacts.tags?.filter((t) => t[0] === "p").length ?? 0
    );
  }

  function getRelayCount(): number {
    if (!$nostrState.relays) return 0;
    return (
      $nostrState.relays.tags?.filter((t) => t[0] === "r").length ?? 0
    );
  }

  function hasProfile(): boolean {
    if (!$nostrState.profile) return false;
    try {
      const content = JSON.parse($nostrState.profile.content);
      return !!(content.name || content.display_name || content.about);
    } catch {
      return false;
    }
  }

  function getNip05(): string | null {
    if (!$nostrState.profile) return null;
    try {
      const content = JSON.parse($nostrState.profile.content);
      return content.nip05 || null;
    } catch {
      return null;
    }
  }

  function getProfileMetadata(): ProfileMetadata | null {
    if (!$nostrState.profile) return null;
    try {
      return JSON.parse($nostrState.profile.content) as ProfileMetadata;
    } catch {
      return null;
    }
  }

  function handleEditProfile() {
    goto("/profile");
  }
</script>

<svelte:head>
  <title>Dashboard - npub.dev</title>
</svelte:head>

<div class="container mx-auto p-4 max-w-4xl">
  <div class="mb-8">
    <h1 class="text-3xl font-bold text-foreground">Dashboard</h1>
    <p class="text-sm text-muted-foreground mt-1">
      Welcome back, {displayName || $authStore.npub?.slice(0, 20) + "..."}
    </p>
  </div>

  {#if showOnboarding && !$nostrState.loading}
    <div class="mb-6">
      <OnboardingBanner
        hasProfile={hasProfile()}
        hasRelays={getRelayCount() > 0}
        hasNip05={!!getNip05()}
        followCount={getFollowCount()}
        onDismiss={() => (showOnboarding = false)}
      />
    </div>
  {/if}

  {#if $nostrState.loading}
    <div class="flex items-center justify-center py-12">
      <div class="spinner-simple"></div>
      <p class="ml-4 text-muted-foreground">Loading your Nostr profile...</p>
    </div>
  {:else if $nostrState.error}
    <div class="p-4 bg-destructive/10 border border-destructive text-destructive-foreground rounded-md">
      <p class="font-medium">Error loading data</p>
      <p class="text-sm">{$nostrState.error}</p>
    </div>
  {:else}
    <div class="space-y-6">
      <DashboardProfileHero
        profile={getProfileMetadata()}
        npub={$authStore.npub || ""}
        followCount={getFollowCount()}
        relayCount={getRelayCount()}
        onEditProfile={handleEditProfile}
      />

      <div class="grid gap-4 md:grid-cols-3">
        <Card.Root>
          <Card.Header>
            <Card.Title class="flex items-center gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10"/></svg>
              Relays
            </Card.Title>
            <Card.Description>Your outbox relay list</Card.Description>
          </Card.Header>
          <Card.Content>
            {#if getRelayCount() > 0}
              <p class="text-green-600 font-medium">{getRelayCount()} configured</p>
              <p class="text-sm text-muted-foreground mt-1">
                Your notes are distributed
              </p>
            {:else}
              <p class="text-amber-600 font-medium">No relays</p>
              <p class="text-sm text-muted-foreground mt-1">
                Set up relays to publish
              </p>
            {/if}
          </Card.Content>
          <Card.Footer>
            <Button variant="outline" size="sm" href="/relays">
              Manage Relays
            </Button>
          </Card.Footer>
        </Card.Root>

        <Card.Root>
          <Card.Header>
            <Card.Title class="flex items-center gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
              Following
            </Card.Title>
            <Card.Description>People you follow</Card.Description>
          </Card.Header>
          <Card.Content>
            {#if getFollowCount() > 0}
              <p class="text-green-600 font-medium">{getFollowCount()} people</p>
              <p class="text-sm text-muted-foreground mt-1">
                Connected to the network
              </p>
            {:else}
              <p class="text-amber-600 font-medium">Not following anyone</p>
              <p class="text-sm text-muted-foreground mt-1">
                Discover accounts
              </p>
            {/if}
          </Card.Content>
          <Card.Footer>
            <Button variant="outline" size="sm" href="/discover">
              Discover
            </Button>
          </Card.Footer>
        </Card.Root>

        <Card.Root>
          <Card.Header>
            <Card.Title class="flex items-center gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
              NIP-05 Identity
            </Card.Title>
            <Card.Description>Verified identity</Card.Description>
          </Card.Header>
          <Card.Content>
            {#if getNip05()}
              <p class="text-green-600 font-medium">Verified</p>
              <p class="text-sm text-muted-foreground mt-1 font-mono truncate">
                {getNip05()}
              </p>
            {:else}
              <p class="text-amber-600 font-medium">Not verified</p>
              <p class="text-sm text-muted-foreground mt-1">
                Get a human-readable ID
              </p>
            {/if}
          </Card.Content>
          <Card.Footer>
            <Button variant="outline" size="sm" href="/identity">
              {getNip05() ? "Manage" : "Set Up"}
            </Button>
          </Card.Footer>
        </Card.Root>
      </div>
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
