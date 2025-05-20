# Agent Guidelines for npub.blog

This repository contains a client-side only SvelteKit application designed to manage Nostr NIP-65 relay lists. It allows users to authenticate, fetch their current relay list, modify it, and publish the changes. The primary rules live in `.cursorrules` and the documentation under `ai/`.

## Key Principles

- **Client-Side Only & Local‑First** – All logic executes in the browser. Data is stored in IndexedDB via Dexie.js (version 4.x as per `ai/spec.md`) and synchronized from Nostr relays using NDK and `nostr-tools`.
- **Privacy & Security** – Never request or handle raw private keys; all signing operations are performed via NIP‑07 or NIP‑46. The application allows users to manage and publish their NIP‑65 relay lists. Only the user's npub is displayed in the UI.
- **Performance & UX** – Load instantly from cache, lazy‑load images (if any), and keep UI transitions smooth. Follow the minimalist design in `ai/ui-spec.md`.
- **No Comments** – Code must not contain comments, including same‑line comments. Violations fail review.

## Development Standards

1. **Architecture**
   - Follow the SvelteKit (version 2.x as per `ai/spec.md`) structure: `src/lib` for stores, Nostr logic, and reusable components; `src/routes` for pages; `static/` for assets.
   - Do not create API routes. The application operates in SPA (client-side only) mode with prerender disabled. SSR and SSG features that require a server environment are out of scope.
   - Use TypeScript throughout and Svelte 5 runes for reactivity.
2. **Styling**
   - Tailwind CSS (version 4.1.7 as per `ai/spec.md`) is the styling system. Centralise theme tokens in `tailwind.config.js` and apply classes directly in markup.
   - Use Shadcn Svelte components (latest stable) for UI building. When adding a new component, list it in `ai/shadcn-components.md` before committing the generated files.
   - Global CSS is prohibited. Component‑specific styles go in `<style>` blocks when necessary.
3. **Testing**
   - Unit and integration tests use Vitest and Testing‑Library. End‑to‑end tests use Playwright, as specified in `ai/spec.md`.
   - Run `pnpm test --coverage` before pushing. Coverage must remain above 80 % lines/branches.
   - Pre‑commit hooks run `pnpm exec prettier --check` and `pnpm exec eslint .`.
4. **Documentation Lookup**
   - Use `ai/context.md` as the index for library references. If a Context7 ID is provided, fetch docs with the `context7` tools.
   - Add new libraries to `ai/context.md` if they are missing and resolve their Context7 IDs.
5. **Design & UX**
   - Refer to `ai/ui-spec.md` for typography, color palette, layout dimensions, and interaction details.
   - The default theme is dark. Light/dark values are swapped by toggling the `.dark` class on `<html>`.
   - Display user identifiers in NIP‑19 form (`npub…`, `naddr…`) in the UI.
6. **Commit Etiquette**
   - Keep commits focused and descriptive. Ensure updated Markdown such as `ai/shadcn-components.md` is committed before generated files when adding Shadcn components.
   - Check `ai/progress.md` and relevant epics to ensure tasks align with project planning.

## Additional Notes

- Use Tailwind typography plugin for Markdown rendering and respect the 736 px column layout described in the UI spec.
- Most errors should fail silently with optional toast notifications (see `ai/prd.md` sections 4–6 for general error handling philosophy, if applicable).
- Core Web Vitals are the primary performance metrics.

By following this guide along with `.cursorrules` and the documents in `ai/`, agents can contribute consistent, high‑quality code to npub.blog.
