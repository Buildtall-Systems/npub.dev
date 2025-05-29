<script lang="ts">
  import { createEventDispatcher } from "svelte";
  import InputComponent from "$lib/components/ui/input/input.svelte";
  import ButtonComponent from "$lib/components/ui/button/button.svelte";

  export let url: string = "";
  export let name: string = "";
  export let read: boolean = true;
  export let write: boolean = true;

  const dispatch = createEventDispatcher();

  let urlError = "";
  let isValid = true;

  function validateUrl(value: string) {
    if (value && !value.startsWith("wss://") && !value.startsWith("ws://")) {
      urlError = "Invalid URL. Must start with wss:// or ws://";
      isValid = false;
    } else {
      urlError = "";
      isValid = true;
    }
    dispatch("validityChange", isValid);
    return isValid;
  }

  function handleUrlChange(e: Event) {
    const value = (e.target as HTMLInputElement).value;
    validateUrl(value);
    dispatch("urlChange", value);
  }

  function handleUrlBlur(e: Event) {
    const value = (e.target as HTMLInputElement).value;
    validateUrl(value);
  }

  function handleNameChange(e: Event) {
    dispatch("nameChange", (e.target as HTMLInputElement).value);
  }

  function handleReadChange(e: Event) {
    dispatch("readChange", (e.target as HTMLInputElement).checked);
  }

  function handleWriteChange(e: Event) {
    dispatch("writeChange", (e.target as HTMLInputElement).checked);
  }

  function handleRemove() {
    dispatch("remove");
  }

  $: validateUrl(url);
</script>

<div class="flex flex-col space-y-2 p-4 border border-neutral-700 rounded-md bg-neutral-900">
  <div class="flex flex-col space-y-1">
    <div class="flex items-center">
      <label for="relay-url" class="text-sm font-medium w-24">Relay URL</label>
      <div class="flex-1">
        <InputComponent 
          id="relay-url" 
          value={url} 
          on:input={handleUrlChange}
          on:blur={handleUrlBlur}
          placeholder="wss://relay.example.com"
          class={urlError ? "border-red-500" : ""}
        />
        {#if urlError}
          <p class="text-xs text-red-500 mt-1">{urlError}</p>
        {/if}
      </div>
    </div>
    
    <div class="flex items-center">
      <label for="relay-name" class="text-sm font-medium w-24">Name (optional)</label>
      <div class="flex-1">
        <InputComponent 
          id="relay-name" 
          value={name} 
          on:input={handleNameChange} 
          placeholder="Friendly name"
        />
      </div>
    </div>
  </div>
  
  <div class="flex items-center space-x-4">
    <div class="flex items-center space-x-2">
      <input 
        type="checkbox" 
        id="read-checkbox" 
        checked={read} 
        on:change={handleReadChange}
        class="rounded border-neutral-600 text-primary h-4 w-4"
      />
      <label for="read-checkbox" class="text-sm">Read</label>
    </div>
    
    <div class="flex items-center space-x-2">
      <input 
        type="checkbox" 
        id="write-checkbox" 
        checked={write} 
        on:change={handleWriteChange}
        class="rounded border-neutral-600 text-primary h-4 w-4"
      />
      <label for="write-checkbox" class="text-sm">Write</label>
    </div>
    
    <div class="ml-auto">
      <ButtonComponent 
        variant="destructive" 
        size="sm" 
        on:click={handleRemove}
        class="h-8 px-2"
        data-testid="remove-relay-button"
      >
        Remove
      </ButtonComponent>
    </div>
  </div>
</div> 