# Shadcn Svelte Components

This file lists all Shadcn Svelte components that have been added to the project using the shadcn-svelte package (v0.1.0).

## Components

- **Button**: Primary interactive element with variant support (default, destructive, outline, secondary, ghost, link)
- **Input**: Text input field with full event binding and styling
- **Card**: Container component with header, content, footer and other subcomponents for creating card UI elements

## Usage

Import these components directly from the shadcn-svelte package:

```svelte
<script>
  import { Button } from "shadcn-svelte";
  import { Input } from "shadcn-svelte";
  import * as Card from "$lib/components/ui/card";
</script>

<Button variant="default">Click me</Button>
<Input placeholder="Enter text..." />
<Card.Root>
  <Card.Header>
    <Card.Title>Card Title</Card.Title>
    <Card.Description>Card Description</Card.Description>
  </Card.Header>
  <Card.Content>
    Card Content
  </Card.Content>
  <Card.Footer>
    Card Footer
  </Card.Footer>
</Card.Root>
```

## Theme

These components use the CSS variables defined in app.css and the theme settings in tailwind.config.js. The project uses dark mode by default.

## Adding More Components

To add more shadcn components, use the shadcn-svelte CLI:

```
npx shadcn-svelte add [component-name]
``` 