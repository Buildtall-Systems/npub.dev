<script lang="ts">
  import { onMount, tick } from "svelte";
  import { goto } from "$app/navigation";
  import NDK, { NDKNip07Signer, NDKNip46Signer, NDKEvent } from "@nostr-dev-kit/ndk";

  import { authStore } from "$lib/stores/authStore";
  import { nostrState } from "$lib/stores/nostrState";
  import { fetchRelayList, type RelayListItem } from "$lib/stores/relayListStore";
  import { logout } from "$lib/stores/logout";
  import { logger } from "$lib/logger";

  import { Button } from "$lib/components/ui/button/index.js";

  let ndk = $state<NDK | undefined>(undefined);
  let isPublishing = $state(false);
  let errorMessage = $state<string | null>(null);
  let displayName = $state<string>("");

  let kind3Relays = $state<RelayListItem[]>([]);
  let kind10002RelayEvent = $state<NDKEvent | null>(null);
  let displayedRelays = $state<RelayListItem[]>([]);
  let newRelayUrl = $state("");
  let isLoading = $state(true);

  const FETCH_TIMEOUT = 30000;

  const defaultRelays = [
    { url: "wss://relay.damus.io", read: true, write: true },
    { url: "wss://relay.primal.net", read: true, write: true },
    { url: "wss://nostr.wine", read: true, write: true },
    { url: "wss://nos.lol", read: true, write: true },
  ];

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

      const fetchRelaysPromise = fetchRelayList(ndk, $authStore.pubkey);
      const timeoutPromise = new Promise((_, reject) =>
        setTimeout(() => reject(new Error("Fetching relay lists timed out")), FETCH_TIMEOUT)
      );

      const result = (await Promise.race([fetchRelaysPromise, timeoutPromise])) as Awaited<
        ReturnType<typeof fetchRelayList>
      >;

      displayedRelays = result.finalRelays;
      kind3Relays = result.foundKind3Relays;
      kind10002RelayEvent = result.foundKind10002Event;

      if (!kind10002RelayEvent && kind3Relays.length === 0 && displayedRelays.length === 0) {
        errorMessage = `No relay lists found. You can add relays manually below.`;
      } else if (!kind10002RelayEvent && kind3Relays.length > 0) {
        errorMessage =
          "Found relays in your Kind 3 contact list. You can use these to create a Kind 10002 relay list.";
      } else if (kind10002RelayEvent && displayedRelays.length === 0) {
        errorMessage =
          "Found a Kind 10002 relay list, but it appears to be empty. You can add relays to it.";
      }
    } catch (e: any) {
      logger.error("[Relays] Error:", e);
      errorMessage = e.message || "Failed to load relay configuration";
    } finally {
      isLoading = false;
    }
  });

  async function publishKind10002() {
    if (!ndk || !$authStore.pubkey) {
      errorMessage = "Not connected or NDK not initialized.";
      return;
    }
    if (displayedRelays.length === 0) {
      errorMessage = "Cannot publish an empty relay list.";
      return;
    }

    isPublishing = true;
    await tick();
    errorMessage = null;

    const event = new NDKEvent(ndk);
    event.kind = 10002;
    event.pubkey = $authStore.pubkey;
    event.created_at = Math.floor(Date.now() / 1000);
    event.tags = displayedRelays.map((r) => {
      const tag = ["r", r.url];
      if (r.read && !r.write) tag.push("read");
      else if (!r.read && r.write) tag.push("write");
      return tag;
    });

    try {
      await event.sign();
      await event.publish();
      kind10002RelayEvent = event;
      nostrState.updateRelays(event);
      errorMessage = "Relay list published successfully!";
    } catch (e: any) {
      logger.error("Error publishing kind 10002 event:", e);
      errorMessage = `Failed to publish relay list: ${e.message}`;
    } finally {
      isPublishing = false;
      await tick();
    }
  }

  function addRelay(url: string, read: boolean, write: boolean) {
    if (url && !displayedRelays.find((r) => r.url === url)) {
      if (!url.startsWith("wss://")) {
        errorMessage = "Relay URL must start with wss://";
        return;
      }
      displayedRelays = [...displayedRelays, { url, read, write }];
      errorMessage = null;
    }
  }

  function removeRelay(url: string) {
    displayedRelays = displayedRelays.filter((r) => r.url !== url);
  }

  function toggleRelayPermissions(url: string) {
    displayedRelays = displayedRelays.map((relay) => {
      if (relay.url === url) {
        if (relay.read && relay.write) {
          return { ...relay, read: true, write: false };
        } else if (relay.read && !relay.write) {
          return { ...relay, read: false, write: true };
        } else if (!relay.read && relay.write) {
          return { ...relay, read: true, write: true };
        } else {
          return { ...relay, read: true, write: true };
        }
      }
      return relay;
    });
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
  <title>Relays - npub.dev</title>
</svelte:head>

<div class="container mx-auto p-4 max-w-2xl">
  {#if isLoading}
    <div class="flex items-center justify-center py-12">
      <div class="spinner-simple"></div>
      <p class="ml-4 text-muted-foreground">Loading your relay configuration...</p>
    </div>
  {:else}
    <div class="w-full bg-card text-card-foreground rounded-lg shadow-md p-6 border border-border">
      <div class="flex justify-between items-center mb-6">
        <h2 class="text-2xl font-semibold text-foreground">Outbox Relay Configuration</h2>
        <div class="flex gap-2">
          <Button variant="outline" size="sm" href="/dashboard">Dashboard</Button>
          <Button variant="outline" size="sm" onclick={handleLogout}>Logout</Button>
        </div>
      </div>

      <p class="text-sm text-muted-foreground mb-1">
        Logged in as: <span class="font-medium">{displayName || $authStore.npub}</span>
      </p>

      <div class="text-xs text-muted-foreground mb-4 p-3 bg-muted/30 rounded-md">
        <p>
          <strong>Relay Types:</strong>
          <strong>Read</strong> relays are where clients look for your mentions and replies.
          <strong>Write</strong> relays are where clients publish your notes.
          <strong>Read/Write</strong> relays do both.
        </p>
      </div>

      {#if errorMessage && displayedRelays.length === 0 && !kind10002RelayEvent && !errorMessage.includes("success")}
        <div
          class="my-6 p-4 bg-destructive/10 border border-destructive text-destructive-foreground rounded-md text-sm"
        >
          <p class="font-medium">Attention:</p>
          <p>{errorMessage}</p>
        </div>
      {/if}

      <h3 class="text-xl font-medium mt-6 mb-4 text-foreground">Outbox Relay List</h3>

      {#if displayedRelays.length > 0}
        <ul class="space-y-2 mb-6 border border-border rounded-md p-3 bg-background shadow-sm">
          {#each displayedRelays as relay (relay.url)}
            <li
              class="flex justify-between items-center p-2.5 bg-muted/30 rounded-md hover:bg-muted/60 transition-colors"
            >
              <div class="flex-grow">
                <span class="font-mono text-sm break-all">{relay.url}</span>
              </div>
              <Button
                variant="outline"
                size="sm"
                class="ml-3 text-xs px-1.5 py-0.5 rounded font-medium w-[70px] text-center shrink-0 transition-colors
                {relay.read && relay.write
                  ? 'bg-green-200 text-green-800 hover:bg-green-300'
                  : relay.read
                    ? 'bg-blue-200 text-blue-800 hover:bg-blue-300'
                    : 'bg-purple-200 text-purple-800 hover:bg-purple-300'}"
                onclick={() => toggleRelayPermissions(relay.url)}
              >
                {relay.read && relay.write ? "R/W" : relay.read ? "Read" : "Write"}
              </Button>
              <Button
                variant="ghost"
                size="icon"
                class="text-muted-foreground hover:text-destructive hover:bg-destructive/10 ml-2 shrink-0"
                onclick={() => removeRelay(relay.url)}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  ><path d="M18 6 6 18" /><path d="m6 6 12 12" /></svg
                >
              </Button>
            </li>
          {/each}
        </ul>
      {:else if !errorMessage || (errorMessage && (displayedRelays.length > 0 || errorMessage.includes("success")))}
        <p
          class="text-muted-foreground mb-6 text-sm p-4 border border-dashed border-border rounded-md bg-muted/30"
        >
          No relays are currently in your list. Add relays using the form below.
          {#if kind10002RelayEvent && displayedRelays.length === 0}
            (Your saved Kind 10002 list is empty).
          {/if}
        </p>
      {/if}

      <div class="mt-6 pt-6 border-t border-border">
        <h3 class="text-xl font-medium mb-4 text-foreground">Add Relays</h3>
        <div class="flex flex-col sm:flex-row gap-2 mb-4 items-start">
          <input
            type="url"
            bind:value={newRelayUrl}
            placeholder="wss://your.relay.url"
            class="flex h-10 w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 flex-grow"
          />
          <Button
            onclick={() => {
              addRelay(newRelayUrl, true, true);
              newRelayUrl = "";
            }}
            class="shrink-0 w-full sm:w-auto">Add Relay (R/W)</Button
          >
        </div>

        {#if displayedRelays.length < 3 && kind3Relays.length > 0}
          <div class="my-4 p-3 bg-muted/50 border border-border rounded-md">
            <h4 class="text-md font-medium mb-2 text-foreground">
              Suggestions from your contacts (Kind 3):
            </h4>
            <ul class="flex flex-wrap gap-2">
              {#each kind3Relays as relay (relay.url)}
                <li>
                  <Button
                    variant="outline"
                    size="sm"
                    class="bg-background hover:bg-muted border-border text-foreground"
                    onclick={() => addRelay(relay.url, relay.read, relay.write)}
                  >
                    + {new URL(relay.url).hostname}
                    <span class="ml-1 text-xs"
                      >({relay.read && relay.write ? "R/W" : relay.read ? "R" : "W"})</span
                    >
                  </Button>
                </li>
              {/each}
            </ul>
          </div>
        {/if}

        {#if displayedRelays.length < 3 && kind3Relays.length === 0}
          <div class="my-4 p-3 bg-muted/50 border border-border rounded-md">
            <h4 class="text-md font-medium mb-2 text-foreground">Default Relay Suggestions:</h4>
            <ul class="flex flex-wrap gap-2">
              {#each defaultRelays as relay (relay.url)}
                <li>
                  <Button
                    variant="outline"
                    size="sm"
                    class="bg-background hover:bg-muted border-border text-foreground"
                    onclick={() => addRelay(relay.url, relay.read, relay.write)}
                  >
                    + {new URL(relay.url).hostname}
                  </Button>
                </li>
              {/each}
            </ul>
          </div>
        {/if}
      </div>

      <div class="mt-8 flex justify-end">
        <Button
          onclick={publishKind10002}
          size="lg"
          class="min-w-[200px] h-auto py-3"
          disabled={isPublishing}
        >
          {#if isPublishing}<svg
              class="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              ><circle
                class="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                stroke-width="4"
              ></circle><path
                class="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              ></path></svg
            >
            Processing...{:else}Publish Relay List{/if}
        </Button>
      </div>

      {#if errorMessage && (displayedRelays.length > 0 || errorMessage.includes("success"))}
        <p
          class="mt-6 text-sm text-center {errorMessage.includes('success') ||
          errorMessage.includes('updated')
            ? 'text-green-600'
            : 'text-destructive'}"
        >
          {errorMessage}
        </p>
      {/if}
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
