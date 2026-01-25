<script lang="ts">
  import { onMount, onDestroy } from "svelte";
  import * as Dialog from "$lib/components/ui/dialog/index.js";
  import { Button } from "$lib/components/ui/button/index.js";
  import { detectBrowser, supportsExtensions, getBrowserDisplayName, type BrowserType } from "$lib/utils/browser";
  import { getExtensionsForBrowser, getPrimaryExtension, type ExtensionInfo } from "$lib/data/extensions";

  type Step = 'recommend' | 'waiting' | 'ready';

  interface Props {
    open: boolean;
    onComplete: () => void;
    onClose: () => void;
    onNip46: () => void;
  }

  let { open = $bindable(), onComplete, onClose, onNip46 }: Props = $props();

  let browser = $state<BrowserType>('unknown');
  let extensions = $state<ExtensionInfo[]>([]);
  let primaryExtension = $state<ExtensionInfo | null>(null);
  let step = $state<Step>('recommend');
  let showAlternatives = $state(false);
  let extensionDetected = $state(false);

  let pollingInterval: ReturnType<typeof setInterval> | null = null;

  onMount(() => {
    browser = detectBrowser();
    extensions = getExtensionsForBrowser(browser);
    primaryExtension = getPrimaryExtension(browser);
  });

  onDestroy(() => {
    stopPolling();
  });

  function checkForExtension(): boolean {
    return typeof window !== 'undefined' && !!(window as any).nostr?.getPublicKey;
  }

  function startPolling() {
    if (pollingInterval) return;

    if (checkForExtension()) {
      extensionDetected = true;
      step = 'ready';
      return;
    }

    pollingInterval = setInterval(() => {
      if (checkForExtension()) {
        stopPolling();
        extensionDetected = true;
        step = 'ready';
      }
    }, 1000);
  }

  function stopPolling() {
    if (pollingInterval) {
      clearInterval(pollingInterval);
      pollingInterval = null;
    }
  }

  function handleInstallClick() {
    step = 'waiting';
    startPolling();
  }

  function handleManualCheck() {
    if (checkForExtension()) {
      extensionDetected = true;
      step = 'ready';
    }
  }

  function handleComplete() {
    stopPolling();
    onComplete();
  }

  function handleClose() {
    stopPolling();
    step = 'recommend';
    showAlternatives = false;
    extensionDetected = false;
    onClose();
  }

  function handleNip46() {
    stopPolling();
    onNip46();
  }

  $effect(() => {
    if (!open) {
      stopPolling();
      step = 'recommend';
      showAlternatives = false;
      extensionDetected = false;
    }
  });
</script>

<Dialog.Root bind:open onOpenChange={(isOpen) => !isOpen && handleClose()}>
  <Dialog.Portal>
    <Dialog.Overlay />
    <Dialog.Content class="max-w-lg">
      <Dialog.Header>
        <Dialog.Title>
          {#if step === 'recommend'}
            Get Started with Nostr
          {:else if step === 'waiting'}
            Installing Extension...
          {:else}
            Ready to Connect
          {/if}
        </Dialog.Title>
        <Dialog.Description>
          {#if step === 'recommend'}
            Create your Nostr identity securely using a browser extension
          {:else if step === 'waiting'}
            We're waiting for your extension to be ready
          {:else}
            Your extension is installed and ready
          {/if}
        </Dialog.Description>
      </Dialog.Header>

      <div class="py-4">
        {#if step === 'recommend'}
          {#if supportsExtensions(browser)}
            <div class="space-y-4">
              <p class="text-sm text-muted-foreground">
                The safest way to use Nostr is with a browser extension that manages your keys.
                Your secret key never leaves the extension—this site will only request signatures.
              </p>

              {#if primaryExtension}
                <div class="border border-border rounded-lg p-4 bg-card">
                  <div class="flex items-start justify-between">
                    <div>
                      <h3 class="font-semibold text-foreground">{primaryExtension.name}</h3>
                      <p class="text-sm text-muted-foreground mt-1">{primaryExtension.description}</p>
                    </div>
                    <span class="text-xs bg-primary/10 text-primary px-2 py-1 rounded">Recommended</span>
                  </div>
                  <Button
                    variant="default"
                    class="w-full mt-4"
                    onclick={() => {
                      window.open(primaryExtension!.storeUrl, '_blank');
                      handleInstallClick();
                    }}
                  >
                    Install {primaryExtension.name} for {getBrowserDisplayName(browser)}
                  </Button>
                </div>
              {/if}

              {#if extensions.length > 1}
                <button
                  type="button"
                  class="text-sm text-muted-foreground hover:text-foreground underline"
                  onclick={() => showAlternatives = !showAlternatives}
                >
                  {showAlternatives ? 'Hide' : 'Show'} alternative extensions
                </button>

                {#if showAlternatives}
                  <div class="space-y-2">
                    {#each extensions.filter(e => !e.isPrimary) as ext}
                      <div class="border border-border rounded-lg p-3 bg-muted/50">
                        <div class="flex items-center justify-between">
                          <div>
                            <h4 class="font-medium text-foreground text-sm">{ext.name}</h4>
                            <p class="text-xs text-muted-foreground">{ext.description}</p>
                          </div>
                          <Button
                            variant="outline"
                            size="sm"
                            onclick={() => {
                              window.open(ext.storeUrl, '_blank');
                              handleInstallClick();
                            }}
                          >
                            Install
                          </Button>
                        </div>
                      </div>
                    {/each}
                  </div>
                {/if}
              {/if}

              <div class="border-t border-border pt-4 mt-4">
                <p class="text-xs text-muted-foreground mb-2">
                  Already have a remote signer like Amber or nsecBunker?
                </p>
                <Button variant="ghost" size="sm" onclick={handleNip46}>
                  Use NIP-46 Remote Signer Instead
                </Button>
              </div>
            </div>
          {:else}
            <div class="space-y-4">
              <p class="text-sm text-muted-foreground">
                {#if browser === 'safari'}
                  Safari doesn't currently support Nostr browser extensions.
                {:else if browser === 'mobile'}
                  Mobile browsers don't support browser extensions.
                {:else}
                  Your browser may not support Nostr extensions.
                {/if}
              </p>

              <div class="border border-border rounded-lg p-4 bg-card">
                <h3 class="font-semibold text-foreground">Use a Remote Signer</h3>
                <p class="text-sm text-muted-foreground mt-1">
                  Connect using a mobile app like Amber (Android) or a desktop signer via NIP-46.
                  Your keys stay on your device.
                </p>
                <Button variant="default" class="w-full mt-4" onclick={handleNip46}>
                  Connect with Remote Signer
                </Button>
              </div>

              <div class="text-sm text-muted-foreground">
                <p class="font-medium text-foreground mb-2">Recommended Apps:</p>
                <ul class="list-disc list-inside space-y-1">
                  <li><a href="https://github.com/greenart7c3/Amber" target="_blank" class="text-primary hover:underline">Amber</a> (Android)</li>
                  <li><a href="https://nsec.app" target="_blank" class="text-primary hover:underline">nsec.app</a> (Web-based)</li>
                </ul>
              </div>
            </div>
          {/if}

        {:else if step === 'waiting'}
          <div class="text-center space-y-4">
            <div class="w-16 h-16 border-4 border-muted border-t-primary rounded-full animate-spin mx-auto"></div>
            <p class="text-sm text-muted-foreground">
              After installing the extension, create a new account or import your existing keys.
              We'll detect when it's ready.
            </p>
            <div class="space-y-2">
              <Button variant="outline" onclick={handleManualCheck}>
                I've Installed It
              </Button>
              <p class="text-xs text-muted-foreground">
                Click if automatic detection isn't working
              </p>
            </div>
          </div>

        {:else if step === 'ready'}
          <div class="text-center space-y-4">
            <div class="w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto">
              <svg class="w-8 h-8 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
              </svg>
            </div>
            <div>
              <h3 class="font-semibold text-foreground">Extension Detected!</h3>
              <p class="text-sm text-muted-foreground mt-1">
                Your Nostr extension is ready. Click below to connect and set up your profile.
              </p>
            </div>
            <Button variant="default" class="w-full" onclick={handleComplete}>
              Connect & Continue
            </Button>
          </div>
        {/if}
      </div>
    </Dialog.Content>
  </Dialog.Portal>
</Dialog.Root>
