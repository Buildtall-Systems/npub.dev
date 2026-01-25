<script lang="ts">
  import { onMount } from "svelte";
  import { goto } from "$app/navigation";
  import NDK, { NDKNip07Signer } from "@nostr-dev-kit/ndk";

  import { authStore } from "$lib/stores/authStore";
  import { nostrState } from "$lib/stores/nostrState";
  import { logout } from "$lib/stores/logout";
  import { logger } from "$lib/logger";
  import {
    parseKind0Content,
    createKind0Event,
    publishKind0,
    type ProfileMetadata,
  } from "$lib/nostr/profile";

  import { Button } from "$lib/components/ui/button/index.js";
  import * as Card from "$lib/components/ui/card/index.js";
  import ProfileCard from "$lib/components/ProfileCard.svelte";
  import ProfileForm from "$lib/components/ProfileForm.svelte";

  let ndk = $state<NDK | undefined>(undefined);
  let isEditing = $state(false);
  let isPublishing = $state(false);
  let message = $state<{ type: "success" | "error"; text: string } | null>(null);
  let isLoading = $state(true);

  let profile = $derived(parseKind0Content($nostrState.profile));
  let hasProfile = $derived(
    !!($nostrState.profile && (profile.name || profile.display_name || profile.about))
  );

  $effect(() => {
    if (!$authStore.pubkey) {
      goto("/");
    }
  });

  $effect(() => {
    if (!hasProfile && !$nostrState.loading && !isLoading) {
      isEditing = true;
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

      if (!$nostrState.profile) {
        await nostrState.fetchNostrState(ndk, $authStore.pubkey);
      }
    } catch (e: any) {
      logger.error("[Profile] Failed to initialize:", e);
      message = { type: "error", text: e.message || "Failed to connect" };
    } finally {
      isLoading = false;
    }
  });

  async function handleSave(metadata: ProfileMetadata) {
    if (!ndk || !$authStore.pubkey) {
      message = { type: "error", text: "Not connected" };
      return;
    }

    isPublishing = true;
    message = null;

    try {
      const event = createKind0Event(ndk, $authStore.pubkey, metadata);
      await publishKind0(ndk, event);
      nostrState.updateProfile(event);
      isEditing = false;
      message = { type: "success", text: "Profile published successfully!" };
    } catch (e: any) {
      logger.error("[Profile] Failed to publish:", e);
      message = { type: "error", text: e.message || "Failed to publish profile" };
    } finally {
      isPublishing = false;
    }
  }

  function handleCancel() {
    isEditing = false;
    message = null;
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
  <title>Profile - npub.dev</title>
</svelte:head>

<div class="container mx-auto p-4 max-w-2xl">
  {#if isLoading || $nostrState.loading}
    <div class="flex items-center justify-center py-12">
      <div class="spinner-simple"></div>
      <p class="ml-4 text-muted-foreground">Loading profile...</p>
    </div>
  {:else}
    <Card.Root>
      <Card.Header>
        <div class="flex justify-between items-start">
          <div>
            <Card.Title>Your Profile</Card.Title>
            <Card.Description>
              {#if isEditing}
                Edit your Nostr profile information
              {:else}
                Your public Nostr identity
              {/if}
            </Card.Description>
          </div>
          {#if !isEditing && hasProfile}
            <Button variant="outline" size="sm" on:click={() => (isEditing = true)}>
              Edit
            </Button>
          {/if}
        </div>
      </Card.Header>

      <Card.Content>
        {#if message}
          <div
            class="mb-4 p-3 rounded-md text-sm {message.type === 'success'
              ? 'bg-green-100 text-green-800 border border-green-200'
              : 'bg-destructive/10 text-destructive border border-destructive/20'}"
          >
            {message.text}
          </div>
        {/if}

        {#if isEditing}
          <ProfileForm
            {profile}
            onSave={handleSave}
            onCancel={handleCancel}
            {isPublishing}
          />
        {:else if hasProfile}
          <ProfileCard {profile} npub={$authStore.npub} />
        {:else}
          <div class="text-center py-8">
            <p class="text-muted-foreground mb-4">You haven't set up your profile yet.</p>
            <Button on:click={() => (isEditing = true)}>Create Profile</Button>
          </div>
        {/if}
      </Card.Content>
    </Card.Root>
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
