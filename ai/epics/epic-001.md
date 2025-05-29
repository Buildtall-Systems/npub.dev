# Epic 1: Foundation, Authentication, and Core UI Shell

This epic covers the initial project setup (SvelteKit SPA, dependencies including Tailwind CSS 3.3.0 and tailwindcss-animate), NIP-07/NIP-46 authentication (streamlined flow), and the basic three-panel UI structure (status bar, main content area, JSON viewer). All features will be developed with corresponding unit, integration, and/or end-to-end tests.

## User Stories / Tasks

### 1. Project Initialization & Setup
- **Story:** As a Dev, I want a new SvelteKit 2.x project configured for SPA mode with prerendering disabled, so I have the correct baseline for a client-side only application.
  - **Task:** Initialize SvelteKit project using `pnpm create svelte@latest`.
  - **Task:** Configure `svelte.config.js` for SPA mode (`adapter-static` with `fallback: 'index.html'`) and disable prerendering for all pages.
  - **Task:** Install core dependencies: `@nostr-dev-kit/ndk`, `nostr-tools`, `tailwindcss@3.3.0`, `tailwindcss-animate`, `postcss`, `autoprefixer`, `shadcn-svelte`, `dexie@4.x`.
  - **Task:** Integrate Tailwind CSS (v3.3.0): Initialize `tailwind.config.js` (ensuring `tailwindcss-animate` is in plugins) and `postcss.config.js` (using `tailwindcss` instead of `@tailwindcss/postcss`). Import Tailwind directives in `app.css` (via `src/routes/+layout.svelte`).
  - **Task:** Set up basic project structure: `src/lib/components`, `src/lib/stores`, `src/lib/nostr`, `src/routes`, `static/`.
  - **Task:** Establish initial Shadcn Svelte CLI configuration and add initial components like `button`, `input`.
  - **Task:** Set up Vitest and Svelte Testing Library for unit/integration tests.
  - **Task:** Set up Playwright for end-to-end tests, including a basic test to launch the app.
  - **AC:** App runs in dev mode, builds successfully as a static site with Tailwind 3.3.0 and Shadcn components, and basic E2E test passes.

### 2. Authentication Logic (NIP-07 & NIP-46) - Streamlined
- **Story:** As a User, I want the app to detect my NIP-07 browser extension or allow NIP-46 input, so I can easily authenticate and proceed directly to the main application view.
  - **Task:** Implement startup logic to detect `window.nostr`.
  - **Task:** Implement `getPublicKey()` call using NIP-07 if available. On success, store auth details and proceed to main app view.
  - **Task:** *Test (Unit/Integration):* Verify `window.nostr` detection and successful `getPublicKey()` retrieval, leading to main app state.
- **Story:** As a User without a NIP-07 extension, I want to be prompted to use a NIP-46 remote signer or install a browser signer, so I have alternative ways to authenticate and proceed directly to the main application view upon success.
  - **Task:** If `window.nostr` is missing, display UI elements (using Shadcn Input and Button) offering "Use remote signer (NIP-46)" and "Install a browser signer".
  - **Task:** Implement an input field for NIP-46 connection string (`nostrconnect://...`).
  - **Task:** Implement NIP-46 connection logic. On success, store auth details and proceed to main app view.
  - **Task:** *Test (Unit/Integration):* Verify UI for NIP-46 / install prompt appears correctly.
  - **Task:** *Test (E2E):* Simulate NIP-46 flow (mocking the remote signer) to retrieve a public key, leading to main app state.

### 3. Core UI Shell Implementation
- **Story:** As a User, I want to see a persistent status bar displaying my npub and signer type, so I always know my current authentication context.
  - **Task:** Create a `StatusBar.svelte` component.
  - **Task:** Display the authenticated user's npub in the status bar.
  - **Task:** Display the signer type (e.g., "NIP-07", "NIP-46") in the status bar.
  - **Task:** Implement a placeholder network activity indicator in the status bar (visual only for now).
  - **Task:** *Test (Component/E2E):* Verify status bar displays correct npub and signer type after authentication.
- **Story:** As a Dev, I want a defined main content area within the application layout, so there's a clear place for primary page views.
  - **Task:** Structure `+layout.svelte` or `+page.svelte` to define the main content panel area.
  - **Task:** Ensure this panel is the central focus of the UI.
  - **Task:** *Test (E2E):* Verify the main content area is present and visible.
- **Story:** As a User, I want an always-visible JSON viewer that dynamically displays the raw `kind 10002` event being constructed or edited, so I can see the direct representation of my relay list choices.
  - **Task:** Create/Update `JsonViewer.svelte` component to be a persistent panel in the UI layout.
  - **Task:** Ensure the `JsonViewer.svelte` is always visible, not toggleable.
  - **Task:** The viewer should display pre-formatted JSON, initially showing the fetched `kind 10002` event or a template if none exists.
  - **Task:** Implement logic for the JSON viewer to dynamically update its displayed JSON in real-time as the user adds/removes/modifies relays in the relay list editor (details of editor interaction in Epic 4).
  - **Task:** Design and implement a visually appealing animation that plays around or on the JSON viewer when the user clicks "Publish" (publish action itself in Epic 5).
  - **Task:** *Test (Component/E2E):* Verify the JSON viewer is always visible.
  - **Task:** *Test (Component/E2E):* Verify the JSON viewer accurately reflects changes made in a mock relay editor state.
  - **Task:** *Test (Component/E2E):* Verify the publish animation triggers correctly (visual verification).

### 4. State Management for Authentication
- **Story:** As a Dev, I need to store the user's authentication state (pubkey, signer type, npub), so it can be accessed throughout the application.
  - **Task:** Create a Svelte store (e.g., `authStore.ts`) to hold `pubkey`, `npub`, and `signerType`.
  - **Task:** Update the store upon successful authentication (no separate confirmation step).
  - **Task:** Ensure reactive components update based on store changes.
  - **Task:** *Test (Unit):* Verify store updates correctly and listeners are notified.

Dev: DO NOT ADD COMMENTS. 