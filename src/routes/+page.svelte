<script lang="ts">
  import { onMount, tick } from "svelte";
  import { goto } from "$app/navigation";
  import { nip07GetPubkey, nip46GetPubkey } from "$lib/nostr/auth";
  import { nip19 } from "nostr-tools";
  import NDK, { NDKNip07Signer, NDKNip46Signer } from "@nostr-dev-kit/ndk";

  import { authStore, setAuth } from "$lib/stores/authStore";
  import { nostrState } from "$lib/stores/nostrState";
  import { logger } from "$lib/logger";

  import { Button } from "$lib/components/ui/button/index.js";
  import GetStartedModal from "$lib/components/GetStartedModal.svelte";

  type PageStateType = "idle" | "authenticating" | "error";

  let hasNip07 = $state(false);
  let pageState = $state<PageStateType>("idle");
  let errorMessage = $state<string | null>(null);
  let showGetStarted = $state(false);

  $effect(() => {
    if ($authStore.pubkey && pageState === "idle") {
      goto("/dashboard");
    }
  });

  onMount(() => {
    hasNip07 = typeof window !== "undefined" && (window as any).nostr?.getPublicKey;

    if ($authStore.pubkey) {
      goto("/dashboard");
    }
  });

  async function connectNip07() {
    logger.log("[Landing] connectNip07 started");
    pageState = "authenticating";
    await tick();
    errorMessage = null;

    const pk = await nip07GetPubkey();
    if (!pk) {
      errorMessage =
        "NIP-07: Failed to get public key. Ensure extension is installed, unlocked, and permission granted.";
      pageState = "error";
      await tick();
      return;
    }

    setAuth(pk, nip19.npubEncode(pk), "NIP-07");

    let ndk: NDK | undefined;
    try {
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

      await nostrState.fetchNostrState(ndk, pk);
      await goto("/dashboard");
    } catch (e: any) {
      logger.error("[Landing] NIP-07 connection failed:", e);
      errorMessage = `Failed to connect: ${e.message}`;
      pageState = "error";
    }
  }

  async function connectNip46() {
    logger.log("[Landing] connectNip46 started");
    pageState = "authenticating";
    await tick();
    errorMessage = null;

    const uri = window.prompt("Enter your nostrconnect:// or bunker:// URI:");
    if (!uri) {
      pageState = "idle";
      return;
    }

    const pk = await nip46GetPubkey(uri);
    if (!pk) {
      errorMessage = "Invalid nostrconnect:// or bunker:// URI format.";
      pageState = "error";
      await tick();
      return;
    }

    setAuth(pk, nip19.npubEncode(pk), "NIP-46");

    let ndk: NDK | undefined;
    try {
      ndk = new NDK({
        explicitRelayUrls: ["wss://relay.damus.io", "wss://relay.primal.net"],
        debug: false,
      });

      const nip46Signer = NDKNip46Signer.bunker(ndk, uri);
      await nip46Signer.blockUntilReady();

      ndk.signer = nip46Signer;

      await Promise.race([
        ndk.connect(2000),
        new Promise((_, reject) =>
          setTimeout(() => reject(new Error("NDK connect timed out")), 5000)
        ),
      ]);

      await nostrState.fetchNostrState(ndk, pk);
      await goto("/dashboard");
    } catch (e: any) {
      logger.error("[Landing] NIP-46 connection failed:", e);
      errorMessage = `Failed to connect to remote signer: ${e?.message || "Unknown error"}`;
      pageState = "error";
    }
  }

  function resetError() {
    errorMessage = null;
    pageState = "idle";
  }
</script>

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
    width: 64px;
    height: 64px;
    border: 4px solid #e5e7eb;
    border-top: 4px solid #3b82f6;
    border-radius: 50%;
    animation: spin 1s linear infinite;
  }
</style>

<svelte:head>
  <title>npub.dev - Your Nostr Profile Hub</title>
</svelte:head>

<div class="container mx-auto p-4 max-w-2xl font-sans flex items-center justify-center min-h-screen">
  {#if pageState === "idle"}
    <div
      class="w-full max-w-md bg-card text-card-foreground rounded-lg shadow-lg p-8 border border-border text-center"
    >
      <h1 class="text-3xl font-bold text-center mb-2 text-foreground">npub.dev</h1>
      <p class="text-muted-foreground mb-8">Your Nostr Profile Hub</p>

      <div class="text-left mb-8 space-y-4 text-sm text-muted-foreground">
        <p class="text-foreground font-medium">Complete Your Nostr Setup</p>
        <p>
          npub.dev helps you set up everything you need for a great Nostr experience: profile,
          relay configuration, NIP-05 verification, and discovering accounts to follow.
        </p>
        <p>
          Whether you're new to Nostr or an established user, we'll help ensure your identity is
          properly configured and discoverable across the network.
        </p>
      </div>

      {#if hasNip07}
        <Button variant="default" onclick={connectNip07} class="w-full text-lg py-3 h-auto" autofocus>
          Connect with NIP-07 Extension
        </Button>
        <div class="mt-3">
          <Button variant="outline" onclick={connectNip46} class="w-full text-lg py-3 h-auto">
            Connect with NIP-46 Remote Signer
          </Button>
        </div>
      {:else}
        <Button variant="default" onclick={connectNip46} class="w-full text-lg py-3 h-auto">
          Connect with NIP-46 Remote Signer
        </Button>

        <div class="relative my-6">
          <div class="absolute inset-0 flex items-center">
            <span class="w-full border-t border-border"></span>
          </div>
          <div class="relative flex justify-center text-xs uppercase">
            <span class="bg-card px-2 text-muted-foreground">or</span>
          </div>
        </div>

        <Button variant="outline" onclick={() => showGetStarted = true} class="w-full text-lg py-3 h-auto">
          New to Nostr? Get Started
        </Button>
      {/if}
    </div>
  {:else if pageState === "authenticating"}
    <div class="text-center">
      <div class="spinner-simple mx-auto mb-4"></div>
      <h2 class="text-2xl font-semibold text-foreground">Connecting...</h2>
      <p class="text-muted-foreground">Please wait while we connect to your Nostr identity.</p>
    </div>
  {:else if pageState === "error"}
    <div class="text-center max-w-md">
      <h2 class="text-2xl font-semibold text-destructive mb-4">Connection Failed</h2>
      <p class="text-destructive-foreground mb-6">{errorMessage || "Unknown error."}</p>
      <Button onclick={resetError}>Try Again</Button>
    </div>
  {/if}
</div>

<GetStartedModal
  bind:open={showGetStarted}
  onComplete={() => {
    showGetStarted = false;
    connectNip07();
  }}
  onClose={() => showGetStarted = false}
  onNip46={() => {
    showGetStarted = false;
    connectNip46();
  }}
/>
