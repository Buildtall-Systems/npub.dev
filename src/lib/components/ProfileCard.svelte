<script lang="ts">
  import type { ProfileMetadata } from "$lib/nostr/profile";
  import { Button } from "$lib/components/ui/button/index.js";

  interface Props {
    profile: ProfileMetadata;
    npub: string;
    showActions?: boolean;
    onEditClick?: () => void;
  }

  let { profile, npub, showActions = false, onEditClick }: Props = $props();

  let displayName = $derived(profile.display_name || profile.name || npub?.slice(0, 20) + "...");
</script>

<div class="space-y-4">
  {#if profile.banner}
    <div class="w-full h-32 rounded-lg overflow-hidden bg-muted">
      <img src={profile.banner} alt="Banner" class="w-full h-full object-cover" />
    </div>
  {/if}

  <div class="flex items-start gap-4">
    {#if profile.picture}
      <img
        src={profile.picture}
        alt={displayName}
        class="w-20 h-20 rounded-full object-cover border-2 border-background shadow-md"
      />
    {:else}
      <div
        class="w-20 h-20 rounded-full bg-muted flex items-center justify-center text-2xl font-bold text-muted-foreground"
      >
        {displayName.charAt(0).toUpperCase()}
      </div>
    {/if}

    <div class="flex-1 min-w-0">
      <h2 class="text-xl font-semibold text-foreground truncate">{displayName}</h2>
      {#if profile.name && profile.display_name && profile.name !== profile.display_name}
        <p class="text-sm text-muted-foreground">@{profile.name}</p>
      {/if}
      {#if profile.nip05}
        <p class="text-sm text-primary font-mono">{profile.nip05}</p>
      {/if}
    </div>
  </div>

  {#if profile.about}
    <p class="text-sm text-muted-foreground whitespace-pre-wrap">{profile.about}</p>
  {/if}

  <div class="flex flex-wrap gap-4 text-sm text-muted-foreground">
    {#if profile.website}
      <a
        href={profile.website.startsWith("http") ? profile.website : `https://${profile.website}`}
        target="_blank"
        rel="noopener noreferrer"
        class="flex items-center gap-1 hover:text-primary transition-colors"
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="M2 12h20"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>
        {profile.website.replace(/^https?:\/\//, "")}
      </a>
    {/if}

    {#if profile.lud16}
      <span class="flex items-center gap-1">
        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M13 2 3 14h9l-1 8 10-12h-9l1-8z"/></svg>
        {profile.lud16}
      </span>
    {/if}
  </div>

  {#if showActions}
    <div class="pt-4 border-t border-border">
      <Button variant="outline" size="sm" onclick={onEditClick}>
        Edit Profile
      </Button>
    </div>
  {/if}
</div>
