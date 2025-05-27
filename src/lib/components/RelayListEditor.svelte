<script lang="ts">
  import InputComponent from "$lib/components/ui/input/input.svelte";
  import ButtonComponent from "$lib/components/ui/button/button.svelte";
  import RelayEditorItem from "./RelayEditorItem.svelte";
  import type { RelayListItem } from "$lib/stores/relayListStore";

  interface EditorRelay extends RelayListItem {
    id: string;
    isValid?: boolean;
  }

  let relays: EditorRelay[] = [];
  let newRelayUrl = "";
  let newRelayName = "";
  let urlError = "";
  let nextId = 1;

  $: allRelaysValid = relays.every(relay => relay.isValid !== false) && !urlError;

  function generateId(): string {
    return `relay-${nextId++}`;
  }

  function validateUrl(value: string) {
    if (value && !value.startsWith("wss://") && !value.startsWith("ws://")) {
      urlError = "Invalid URL. Must start with wss:// or ws://";
      return false;
    } else {
      urlError = "";
      return true;
    }
  }

  function handleUrlChange(e: Event) {
    const value = (e.target as HTMLInputElement).value;
    newRelayUrl = value;
    validateUrl(value);
  }

  function handleUrlBlur(e: Event) {
    const value = (e.target as HTMLInputElement).value;
    validateUrl(value);
  }

  function addRelay() {
    if (!validateUrl(newRelayUrl)) return;
    
    const id = generateId();
    relays = [
      ...relays,
      {
        id,
        url: newRelayUrl,
        name: newRelayName,
        read: true,
        write: true,
        isValid: true,
      }
    ];
    
    newRelayUrl = "";
    newRelayName = "";
    urlError = "";
  }

  function removeRelay(id: string) {
    relays = relays.filter(relay => relay.id !== id);
  }

  function updateRelayUrl(id: string, url: string) {
    relays = relays.map(relay => 
      relay.id === id ? { ...relay, url } : relay
    );
  }

  function updateRelayName(id: string, name: string) {
    relays = relays.map(relay => 
      relay.id === id ? { ...relay, name } : relay
    );
  }

  function updateRelayRead(id: string, read: boolean) {
    relays = relays.map(relay => 
      relay.id === id ? { ...relay, read } : relay
    );
  }

  function updateRelayWrite(id: string, write: boolean) {
    relays = relays.map(relay => 
      relay.id === id ? { ...relay, write } : relay
    );
  }

  function updateRelayValidity(id: string, isValid: boolean) {
    relays = relays.map(relay => 
      relay.id === id ? { ...relay, isValid } : relay
    );
  }

  function saveChanges() {
    console.log("Saving relay list:", relays);
  }
</script>

<div class="space-y-6">
  <div class="p-4 border border-neutral-700 rounded-md bg-neutral-800">
    <h2 class="text-lg font-semibold mb-4">Add New Relay</h2>
    
    <div class="flex flex-col space-y-4">
      <div class="flex flex-col space-y-1">
        <label for="new-relay-url" class="text-sm font-medium">Relay URL</label>
        <InputComponent 
          id="new-relay-url" 
          value={newRelayUrl} 
          on:input={handleUrlChange}
          on:blur={handleUrlBlur}
          placeholder="wss://relay.example.com"
          class={urlError ? "border-red-500" : ""}
        />
        {#if urlError}
          <p class="text-xs text-red-500 mt-1">{urlError}</p>
        {/if}
      </div>
      
      <div class="flex flex-col space-y-1">
        <label for="new-relay-name" class="text-sm font-medium">Friendly Name (optional)</label>
        <InputComponent 
          id="new-relay-name" 
          bind:value={newRelayName} 
          placeholder="e.g. My Favorite Relay"
        />
      </div>
      
      <div>
        <ButtonComponent 
          on:click={addRelay} 
          class="w-full"
          disabled={!!urlError || !newRelayUrl}
          data-testid="add-relay-button"
        >
          Add Relay
        </ButtonComponent>
      </div>
    </div>
  </div>
  
  {#if relays.length > 0}
    <div class="space-y-4">
      <h2 class="text-lg font-semibold">Your Relays</h2>
      
      <div class="space-y-3">
        {#each relays as relay (relay.id)}
          <RelayEditorItem 
            url={relay.url}
            name={relay.name || ""}
            read={relay.read}
            write={relay.write}
            on:remove={() => removeRelay(relay.id)}
            on:urlChange={(e) => updateRelayUrl(relay.id, e.detail)}
            on:nameChange={(e) => updateRelayName(relay.id, e.detail)}
            on:readChange={(e) => updateRelayRead(relay.id, e.detail)}
            on:writeChange={(e) => updateRelayWrite(relay.id, e.detail)}
            on:validityChange={(e) => updateRelayValidity(relay.id, e.detail)}
          />
        {/each}
      </div>
      
      <div class="pt-4">
        <ButtonComponent 
          on:click={saveChanges}
          class="w-full"
          disabled={!allRelaysValid}
          data-testid="save-changes-button"
        >
          Save Changes
        </ButtonComponent>
      </div>
    </div>
  {:else}
    <div class="p-4 text-center border border-neutral-700 rounded-md bg-neutral-800">
      <p class="text-neutral-400" data-testid="empty-relay-list">
        No relays in list. Add one to get started.
      </p>
    </div>
  {/if}
</div> 