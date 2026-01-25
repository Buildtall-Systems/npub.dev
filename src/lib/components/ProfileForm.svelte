<script lang="ts">
  import type { ProfileMetadata } from "$lib/nostr/profile";
  import { Button } from "$lib/components/ui/button/index.js";
  import { Input } from "$lib/components/ui/input/index.js";

  let {
    profile,
    onSave,
    onCancel,
    isPublishing = false,
  }: {
    profile: ProfileMetadata;
    onSave: (metadata: ProfileMetadata) => void;
    onCancel: () => void;
    isPublishing?: boolean;
  } = $props();

  let name = $state(profile.name || "");
  let display_name = $state(profile.display_name || "");
  let about = $state(profile.about || "");
  let picture = $state(profile.picture || "");
  let banner = $state(profile.banner || "");
  let website = $state(profile.website || "");
  let nip05 = $state(profile.nip05 || "");
  let lud16 = $state(profile.lud16 || "");

  let pictureError = $state("");
  let bannerError = $state("");

  function validateUrl(url: string): boolean {
    if (!url) return true;
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  }

  function handlePictureChange(value: string) {
    picture = value;
    pictureError = value && !validateUrl(value) ? "Invalid URL format" : "";
  }

  function handleBannerChange(value: string) {
    banner = value;
    bannerError = value && !validateUrl(value) ? "Invalid URL format" : "";
  }

  function handleSubmit() {
    if (pictureError || bannerError) return;

    const metadata: ProfileMetadata = {};
    if (name.trim()) metadata.name = name.trim();
    if (display_name.trim()) metadata.display_name = display_name.trim();
    if (about.trim()) metadata.about = about.trim();
    if (picture.trim()) metadata.picture = picture.trim();
    if (banner.trim()) metadata.banner = banner.trim();
    if (website.trim()) metadata.website = website.trim();
    if (nip05.trim()) metadata.nip05 = nip05.trim();
    if (lud16.trim()) metadata.lud16 = lud16.trim();

    onSave(metadata);
  }
</script>

<form
  onsubmit={(e) => {
    e.preventDefault();
    handleSubmit();
  }}
  class="space-y-4"
>
  <div class="grid gap-4 sm:grid-cols-2">
    <div class="space-y-2">
      <label for="display_name" class="text-sm font-medium text-foreground">Display Name</label>
      <Input
        id="display_name"
        type="text"
        bind:value={display_name}
        placeholder="Your display name"
      />
    </div>

    <div class="space-y-2">
      <label for="name" class="text-sm font-medium text-foreground">Username</label>
      <Input id="name" type="text" bind:value={name} placeholder="username (no spaces)" />
    </div>
  </div>

  <div class="space-y-2">
    <label for="about" class="text-sm font-medium text-foreground">About</label>
    <textarea
      id="about"
      bind:value={about}
      placeholder="Tell people about yourself..."
      rows="3"
      class="flex w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
    ></textarea>
  </div>

  <div class="space-y-2">
    <label for="picture" class="text-sm font-medium text-foreground">Profile Picture URL</label>
    <Input
      id="picture"
      type="url"
      value={picture}
      oninput={(e) => handlePictureChange((e.target as HTMLInputElement).value)}
      placeholder="https://example.com/avatar.jpg"
    />
    {#if pictureError}
      <p class="text-sm text-destructive">{pictureError}</p>
    {:else if picture}
      <div class="mt-2">
        <img
          src={picture}
          alt="Profile preview"
          class="w-16 h-16 rounded-full object-cover border"
          onerror={(e) => ((e.target as HTMLImageElement).style.display = "none")}
        />
      </div>
    {/if}
  </div>

  <div class="space-y-2">
    <label for="banner" class="text-sm font-medium text-foreground">Banner Image URL</label>
    <Input
      id="banner"
      type="url"
      value={banner}
      oninput={(e) => handleBannerChange((e.target as HTMLInputElement).value)}
      placeholder="https://example.com/banner.jpg"
    />
    {#if bannerError}
      <p class="text-sm text-destructive">{bannerError}</p>
    {:else if banner}
      <div class="mt-2">
        <img
          src={banner}
          alt="Banner preview"
          class="w-full h-20 rounded object-cover border"
          onerror={(e) => ((e.target as HTMLImageElement).style.display = "none")}
        />
      </div>
    {/if}
  </div>

  <div class="space-y-2">
    <label for="website" class="text-sm font-medium text-foreground">Website</label>
    <Input id="website" type="url" bind:value={website} placeholder="https://yourwebsite.com" />
  </div>

  <div class="space-y-2">
    <label for="nip05" class="text-sm font-medium text-foreground">NIP-05 Identifier</label>
    <Input id="nip05" type="text" bind:value={nip05} placeholder="you@example.com" />
    <p class="text-xs text-muted-foreground">
      Your verified identity. Set this up in the Identity section.
    </p>
  </div>

  <div class="space-y-2">
    <label for="lud16" class="text-sm font-medium text-foreground">Lightning Address</label>
    <Input id="lud16" type="text" bind:value={lud16} placeholder="you@getalby.com" />
  </div>

  <div class="flex justify-end gap-3 pt-4">
    <Button type="button" variant="outline" onclick={onCancel} disabled={isPublishing}>
      Cancel
    </Button>
    <Button type="submit" disabled={isPublishing || !!pictureError || !!bannerError}>
      {#if isPublishing}
        <svg
          class="animate-spin -ml-1 mr-2 h-4 w-4"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
        >
          <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"
          ></circle>
          <path
            class="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
          ></path>
        </svg>
        Publishing...
      {:else}
        Save Profile
      {/if}
    </Button>
  </div>
</form>
