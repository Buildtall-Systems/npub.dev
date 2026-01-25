<script lang="ts">
  import type { ProfileMetadata } from "$lib/nostr/profile";
  import { Button } from "$lib/components/ui/button/index.js";

  interface Props {
    profile: ProfileMetadata | null;
    npub: string;
    followCount: number;
    relayCount: number;
    onEditProfile: () => void;
  }

  let { profile, npub, followCount, relayCount, onEditProfile }: Props = $props();

  let hasProfile = $derived(
    profile && (profile.name || profile.display_name || profile.about)
  );
  let displayName = $derived(
    profile?.display_name || profile?.name || npub?.slice(0, 20) + "..."
  );
</script>

<div class="rounded-xl border border-border bg-card overflow-hidden">
  {#if hasProfile && profile}
    {#if profile.banner}
      <div class="w-full h-40 bg-muted">
        <img
          src={profile.banner}
          alt="Banner"
          class="w-full h-full object-cover"
        />
      </div>
    {:else}
      <div class="w-full h-24 bg-gradient-to-r from-primary/20 via-primary/10 to-primary/20"></div>
    {/if}

    <div class="p-6 -mt-12">
      <div class="flex items-end gap-4 mb-4">
        {#if profile.picture}
          <img
            src={profile.picture}
            alt={displayName}
            class="w-24 h-24 rounded-full object-cover border-4 border-card shadow-lg"
          />
        {:else}
          <div
            class="w-24 h-24 rounded-full bg-muted border-4 border-card shadow-lg flex items-center justify-center text-3xl font-bold text-muted-foreground"
          >
            {displayName.charAt(0).toUpperCase()}
          </div>
        {/if}

        <div class="flex-1 min-w-0 pb-1">
          <h2 class="text-2xl font-bold text-foreground truncate">{displayName}</h2>
          <div class="flex items-center gap-2 text-sm text-muted-foreground">
            {#if profile.name && profile.display_name && profile.name !== profile.display_name}
              <span>@{profile.name}</span>
              <span>·</span>
            {/if}
            {#if profile.nip05}
              <span class="text-primary font-mono">{profile.nip05}</span>
            {/if}
          </div>
        </div>
      </div>

      {#if profile.about}
        <p class="text-sm text-muted-foreground whitespace-pre-wrap mb-4 line-clamp-3">
          {profile.about}
        </p>
      {/if}

      <div class="flex flex-wrap items-center gap-4 text-sm text-muted-foreground mb-4">
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

      <div class="flex items-center justify-between pt-4 border-t border-border">
        <div class="flex items-center gap-6 text-sm">
          <div>
            <span class="font-semibold text-foreground">{followCount}</span>
            <span class="text-muted-foreground ml-1">Following</span>
          </div>
          <div>
            <span class="font-semibold text-foreground">{relayCount}</span>
            <span class="text-muted-foreground ml-1">Relays</span>
          </div>
        </div>
        <Button variant="outline" size="sm" onclick={onEditProfile}>
          Edit Profile
        </Button>
      </div>
    </div>
  {:else}
    <div class="w-full h-32 bg-gradient-to-r from-primary/20 via-primary/10 to-primary/20"></div>

    <div class="p-6 -mt-12">
      <div class="flex items-end gap-4 mb-4">
        <div
          class="w-24 h-24 rounded-full bg-muted border-4 border-card shadow-lg flex items-center justify-center"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" class="text-muted-foreground"><circle cx="12" cy="8" r="5"/><path d="M20 21a8 8 0 0 0-16 0"/></svg>
        </div>

        <div class="flex-1 min-w-0 pb-1">
          <h2 class="text-2xl font-bold text-foreground">Welcome to npub.dev!</h2>
          <p class="text-sm text-muted-foreground">
            Create your profile to get started on Nostr
          </p>
        </div>
      </div>

      <p class="text-sm text-muted-foreground mb-6">
        Your profile helps others discover you on the Nostr network. Add a name, picture, and bio to introduce yourself.
      </p>

      <div class="flex items-center justify-between pt-4 border-t border-border">
        <div class="flex items-center gap-6 text-sm text-muted-foreground">
          <div>
            <span class="font-semibold">{followCount}</span>
            <span class="ml-1">Following</span>
          </div>
          <div>
            <span class="font-semibold">{relayCount}</span>
            <span class="ml-1">Relays</span>
          </div>
        </div>
        <Button onclick={onEditProfile}>
          Create Profile
        </Button>
      </div>
    </div>
  {/if}
</div>
