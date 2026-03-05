<script lang="ts">
  import InputComponent from "$lib/components/ui/input/input.svelte";
  import ButtonComponent from "$lib/components/ui/button/button.svelte";

  let {
    url = "",
    name = "",
    read = true,
    write = true,
    onremove,
    onurlchange,
    onnamechange,
    onreadchange,
    onwritechange,
    onvaliditychange,
  }: {
    url?: string;
    name?: string;
    read?: boolean;
    write?: boolean;
    onremove?: () => void;
    onurlchange?: (url: string) => void;
    onnamechange?: (name: string) => void;
    onreadchange?: (read: boolean) => void;
    onwritechange?: (write: boolean) => void;
    onvaliditychange?: (isValid: boolean) => void;
  } = $props();

  let urlError = $state("");

  function validateUrl(value: string) {
    if (value && !value.startsWith("wss://") && !value.startsWith("ws://")) {
      urlError = "Invalid URL. Must start with wss:// or ws://";
      onvaliditychange?.(false);
      return false;
    } else {
      urlError = "";
      onvaliditychange?.(true);
      return true;
    }
  }

  function handleUrlInput(e: Event) {
    const value = (e.target as HTMLInputElement).value;
    validateUrl(value);
    onurlchange?.(value);
  }

  function handleUrlBlur() {
    validateUrl(url);
  }

  function handleNameInput(e: Event) {
    onnamechange?.((e.target as HTMLInputElement).value);
  }

  function handleReadChange(e: Event) {
    onreadchange?.((e.target as HTMLInputElement).checked);
  }

  function handleWriteChange(e: Event) {
    onwritechange?.((e.target as HTMLInputElement).checked);
  }

  $effect(() => {
    validateUrl(url);
  });
</script>

<div class="flex flex-col space-y-2 p-4 border border-neutral-700 rounded-md bg-neutral-900">
  <div class="flex flex-col space-y-1">
    <div class="flex items-center">
      <label for="relay-url" class="text-sm font-medium w-24">Relay URL</label>
      <div class="flex-1">
        <InputComponent 
          id="relay-url" 
          value={url} 
          oninput={handleUrlInput}
          onblur={handleUrlBlur}
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
          oninput={handleNameInput} 
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
        onchange={handleReadChange}
        class="rounded border-neutral-600 text-primary h-4 w-4"
      />
      <label for="read-checkbox" class="text-sm">Read</label>
    </div>
    
    <div class="flex items-center space-x-2">
      <input 
        type="checkbox" 
        id="write-checkbox" 
        checked={write} 
        onchange={handleWriteChange}
        class="rounded border-neutral-600 text-primary h-4 w-4"
      />
      <label for="write-checkbox" class="text-sm">Write</label>
    </div>
    
    <div class="ml-auto">
      <ButtonComponent 
        variant="destructive" 
        size="sm" 
        onclick={onremove}
        class="h-8 px-2"
        data-testid="remove-relay-button"
      >
        Remove
      </ButtonComponent>
    </div>
  </div>
</div>
