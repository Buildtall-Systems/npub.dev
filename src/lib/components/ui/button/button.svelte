<script lang="ts">
	import { Button as ButtonPrimitive } from "bits-ui";
	import { type Props, buttonVariants } from "./index.js";
	import { cn } from "$lib/utils.js";
	import type { Snippet } from "svelte";

	let {
		class: className,
		variant = "default",
		size = "default",
		builders = [],
		children,
		...restProps
	}: Props & {
		class?: string;
		children?: Snippet;
	} = $props();
</script>

<ButtonPrimitive.Root
	{builders}
	class={cn(buttonVariants({ variant, size, className }))}
	type="button"
	{...restProps}
>
	{#if children}
		{@render children()}
	{/if}
</ButtonPrimitive.Root>
