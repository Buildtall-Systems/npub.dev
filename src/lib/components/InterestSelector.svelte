<script lang="ts">
  let {
    selected,
    onSelectionChange,
  }: {
    selected: string[];
    onSelectionChange: (interests: string[]) => void;
  } = $props();

  const interests = [
    { id: "bitcoin", label: "Bitcoin" },
    { id: "nostr", label: "Nostr" },
    { id: "tech", label: "Technology" },
    { id: "art", label: "Art" },
    { id: "music", label: "Music" },
    { id: "news", label: "News" },
    { id: "privacy", label: "Privacy" },
    { id: "freedom", label: "Freedom" },
  ];

  function toggleInterest(id: string) {
    if (selected.includes(id)) {
      onSelectionChange(selected.filter((i) => i !== id));
    } else {
      onSelectionChange([...selected, id]);
    }
  }
</script>

<div class="space-y-2">
  <label class="text-sm font-medium text-foreground">Select your interests</label>
  <div class="flex flex-wrap gap-2">
    {#each interests as interest}
      <button
        type="button"
        onclick={() => toggleInterest(interest.id)}
        class="px-3 py-1.5 text-sm rounded-full border transition-colors {selected.includes(
          interest.id
        )
          ? 'bg-primary text-primary-foreground border-primary'
          : 'bg-background text-foreground border-border hover:bg-muted'}"
      >
        {interest.label}
      </button>
    {/each}
  </div>
</div>
