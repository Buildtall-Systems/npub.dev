<script lang="ts">
  import { goto } from "$app/navigation";
  import * as DropdownMenu from "$lib/components/ui/dropdown-menu/index.js";
  import { nostrState } from "$lib/stores/nostrState";
  import { logout } from "$lib/stores/logout";

  interface Props {
    npub: string;
  }

  let { npub }: Props = $props();

  let profile = $derived(() => {
    if (!$nostrState.profile) return null;
    try {
      return JSON.parse($nostrState.profile.content);
    } catch {
      return null;
    }
  });

  let displayName = $derived(
    profile()?.display_name || profile()?.name || npub?.slice(0, 12) + "..."
  );

  let avatarUrl = $derived(profile()?.picture || null);

  async function handleLogout() {
    nostrState.clearNostrState();
    logout();
    await goto("/");
  }
</script>

<DropdownMenu.Root>
  <DropdownMenu.Trigger
    class="flex items-center gap-2 rounded-full focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-background"
  >
    {#if avatarUrl}
      <img
        src={avatarUrl}
        alt={displayName}
        class="w-8 h-8 rounded-full object-cover border border-border"
      />
    {:else}
      <div
        class="w-8 h-8 rounded-full bg-muted border border-border flex items-center justify-center text-sm font-medium text-muted-foreground"
      >
        {displayName.charAt(0).toUpperCase()}
      </div>
    {/if}
  </DropdownMenu.Trigger>

  <DropdownMenu.Content class="w-56" align="end">
    <DropdownMenu.Label class="font-normal">
      <div class="flex flex-col space-y-1">
        <p class="text-sm font-medium leading-none">{displayName}</p>
        <p class="text-xs leading-none text-muted-foreground font-mono truncate">
          {npub?.slice(0, 20)}...
        </p>
      </div>
    </DropdownMenu.Label>
    <DropdownMenu.Separator />
    <DropdownMenu.Group>
      <DropdownMenu.Item onclick={() => goto("/profile")}>
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="mr-2"><circle cx="12" cy="8" r="5"/><path d="M20 21a8 8 0 0 0-16 0"/></svg>
        Profile
      </DropdownMenu.Item>
      <DropdownMenu.Item onclick={() => goto("/settings")}>
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="mr-2"><path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"/><circle cx="12" cy="12" r="3"/></svg>
        Settings
      </DropdownMenu.Item>
    </DropdownMenu.Group>
    <DropdownMenu.Separator />
    <DropdownMenu.Item onclick={handleLogout} class="text-destructive focus:text-destructive">
      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="mr-2"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" x2="9" y1="12" y2="12"/></svg>
      Log out
    </DropdownMenu.Item>
  </DropdownMenu.Content>
</DropdownMenu.Root>
