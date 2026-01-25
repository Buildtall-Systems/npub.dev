<script lang="ts">
  import { onMount } from "svelte";
  import { goto } from "$app/navigation";
  import NDK, { NDKNip07Signer } from "@nostr-dev-kit/ndk";

  import { authStore } from "$lib/stores/authStore";
  import { nostrState } from "$lib/stores/nostrState";
  import { logout } from "$lib/stores/logout";
  import { logger } from "$lib/logger";
  import { parseKind0Content, createKind0Event, publishKind0 } from "$lib/nostr/profile";
  import { verifyNip05, parseNip05 } from "$lib/nostr/nip05";

  import { Button } from "$lib/components/ui/button/index.js";
  import { Input } from "$lib/components/ui/input/index.js";
  import * as Card from "$lib/components/ui/card/index.js";
  import Nip05Status from "$lib/components/Nip05Status.svelte";
  import ProviderList from "$lib/components/ProviderList.svelte";

  let ndk = $state<NDK | undefined>(undefined);
  let isLoading = $state(true);
  let isVerifying = $state(false);
  let isPublishing = $state(false);
  let verifyError = $state<string | null>(null);
  let publishMessage = $state<{ type: "success" | "error"; text: string } | null>(null);

  let currentStep = $state<"status" | "verify" | "setup">("status");
  let newNip05 = $state("");
  let verificationStatus = $state<"verified" | "invalid" | "not-set" | "checking">("not-set");

  let profile = $derived(parseKind0Content($nostrState.profile));
  let currentNip05 = $derived(profile.nip05 || null);

  $effect(() => {
    if (!$authStore.pubkey) {
      goto("/");
    }
  });

  $effect(() => {
    if (currentNip05 && !isLoading && verificationStatus === "not-set") {
      verifyCurrentNip05();
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
      logger.error("[Identity] Failed to initialize:", e);
    } finally {
      isLoading = false;
    }
  });

  async function verifyCurrentNip05() {
    if (!currentNip05 || !$authStore.pubkey) return;

    verificationStatus = "checking";
    const result = await verifyNip05(currentNip05, $authStore.pubkey);
    verificationStatus = result.valid ? "verified" : "invalid";
    if (!result.valid) {
      verifyError = result.error || "Verification failed";
    }
  }

  async function handleVerifyNew() {
    if (!newNip05.trim() || !$authStore.pubkey) return;

    isVerifying = true;
    verifyError = null;

    const parsed = parseNip05(newNip05);
    if (!parsed) {
      verifyError = "Invalid format. Expected: username@domain.com";
      isVerifying = false;
      return;
    }

    const result = await verifyNip05(newNip05, $authStore.pubkey);
    isVerifying = false;

    if (result.valid) {
      currentStep = "verify";
    } else {
      verifyError = result.error || "Verification failed";
    }
  }

  async function handlePublishNip05() {
    if (!ndk || !$authStore.pubkey || !newNip05.trim()) return;

    isPublishing = true;
    publishMessage = null;

    try {
      const updatedProfile = { ...profile, nip05: newNip05.trim() };
      const event = createKind0Event(ndk, $authStore.pubkey, updatedProfile);
      await publishKind0(ndk, event);
      nostrState.updateProfile(event);
      verificationStatus = "verified";
      currentStep = "status";
      publishMessage = { type: "success", text: "NIP-05 identifier published successfully!" };
    } catch (e: any) {
      logger.error("[Identity] Failed to publish:", e);
      publishMessage = { type: "error", text: e.message || "Failed to publish" };
    } finally {
      isPublishing = false;
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
  <title>Identity - npub.dev</title>
</svelte:head>

<div class="container mx-auto p-4 max-w-2xl">
  {#if isLoading || $nostrState.loading}
    <div class="flex items-center justify-center py-12">
      <div class="spinner-simple"></div>
      <p class="ml-4 text-muted-foreground">Loading...</p>
    </div>
  {:else}
    <Card.Root>
      <Card.Header>
        <Card.Title>NIP-05 Identity Verification</Card.Title>
        <Card.Description>
          Get a human-readable identifier like you@domain.com for your Nostr profile
        </Card.Description>
      </Card.Header>

      <Card.Content class="space-y-6">
        {#if publishMessage}
          <div
            class="p-3 rounded-md text-sm {publishMessage.type === 'success'
              ? 'bg-green-100 text-green-800 border border-green-200'
              : 'bg-destructive/10 text-destructive border border-destructive/20'}"
          >
            {publishMessage.text}
          </div>
        {/if}

        <div class="p-4 bg-muted/50 rounded-lg">
          <h3 class="text-sm font-medium text-foreground mb-2">Current Status</h3>
          <Nip05Status identifier={currentNip05} status={verificationStatus} />
          {#if verificationStatus === "invalid" && verifyError}
            <p class="text-sm text-destructive mt-2">{verifyError}</p>
          {/if}
        </div>

        {#if currentStep === "status"}
          <div class="space-y-4">
            <div class="p-4 border border-border rounded-lg">
              <h3 class="text-sm font-medium text-foreground mb-2">What is NIP-05?</h3>
              <p class="text-sm text-muted-foreground">
                NIP-05 gives you a human-readable identifier like <span class="font-mono">you@example.com</span>
                instead of just your long public key. It helps others find and verify your Nostr identity.
              </p>
            </div>

            {#if !currentNip05 || verificationStatus === "invalid"}
              <div class="space-y-4">
                <h3 class="text-sm font-medium text-foreground">Set up your NIP-05</h3>

                <div class="space-y-2">
                  <label for="nip05" class="text-sm text-muted-foreground">
                    Enter your NIP-05 identifier (you must have already set this up with a provider)
                  </label>
                  <div class="flex gap-2">
                    <Input
                      id="nip05"
                      type="text"
                      bind:value={newNip05}
                      placeholder="you@example.com"
                      class="flex-1"
                    />
                    <Button
                      onclick={handleVerifyNew}
                      disabled={isVerifying || !newNip05.trim()}
                    >
                      {#if isVerifying}
                        <div class="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                        Verifying...
                      {:else}
                        Verify
                      {/if}
                    </Button>
                  </div>
                  {#if verifyError && currentStep === "status"}
                    <p class="text-sm text-destructive">{verifyError}</p>
                  {/if}
                </div>

                <div class="border-t border-border pt-4">
                  <ProviderList />
                </div>
              </div>
            {:else}
              <div class="space-y-4">
                <h3 class="text-sm font-medium text-foreground">Update your NIP-05</h3>
                <div class="space-y-2">
                  <div class="flex gap-2">
                    <Input
                      type="text"
                      bind:value={newNip05}
                      placeholder="newname@example.com"
                      class="flex-1"
                    />
                    <Button
                      onclick={handleVerifyNew}
                      disabled={isVerifying || !newNip05.trim()}
                    >
                      {#if isVerifying}
                        Verifying...
                      {:else}
                        Verify New
                      {/if}
                    </Button>
                  </div>
                  {#if verifyError}
                    <p class="text-sm text-destructive">{verifyError}</p>
                  {/if}
                </div>
              </div>
            {/if}
          </div>
        {:else if currentStep === "verify"}
          <div class="space-y-4">
            <div class="p-4 bg-green-50 border border-green-200 rounded-lg">
              <h3 class="text-sm font-medium text-green-800 mb-1">Verification Successful!</h3>
              <p class="text-sm text-green-700">
                <span class="font-mono">{newNip05}</span> points to your public key.
              </p>
            </div>

            <p class="text-sm text-muted-foreground">
              Would you like to update your profile to use this NIP-05 identifier?
            </p>

            <div class="flex gap-3">
              <Button
                variant="outline"
                onclick={() => {
                  currentStep = "status";
                  newNip05 = "";
                  verifyError = null;
                }}
              >
                Cancel
              </Button>
              <Button onclick={handlePublishNip05} disabled={isPublishing}>
                {#if isPublishing}
                  <div class="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                  Publishing...
                {:else}
                  Update Profile
                {/if}
              </Button>
            </div>
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
