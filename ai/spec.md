**Specification — "Relay List Manager" (SvelteKit / local‑first / client‑only)**

---

### 1. Purpose

A lightweight web client that runs entirely in the browser. It authenticates the visitor with a Nostr key via NIP‑07 (in‑page extension such as Alby) **or** a NIP‑46 remote signer, fetches the visitor's `kind 10002` Relay List Metadata event (NIP‑65), displays it, and—if absent—guides them through authoring and publishing a new one.

---

### 2. Architectural constraints

* **Framework**  SvelteKit 2.x in "SPA" (client‑side only) mode; prerender disabled.
* **Local‑first**  All state (settings, cached events, relay choices) is persisted in the browser using IndexedDB via Dexie 4.x. No server calls.
* **Connectivity**  WebSocket connections opened directly from the browser to the user‑selected relays.
* **No backend**  Deployment can be static hosting (e.g., Cloudflare Pages, GitHub Pages).

---

### 3. External dependencies

* **@nostr-dev-kit/ndk** – primary client library for relay connections, subscriptions, and publishing.
* **nostr-tools** – supplemental helpers for event signing or utilities not yet exposed by NDK.
* **Tailwind CSS 4.1.7** – utility‑first styling framework, integrated via PostCSS.
* **shadcn‑svelte** *(latest stable)* – headless UI component set for Svelte; confirmed compatible with SvelteKit 2 and Tailwind 4.1.7.
* **NIP‑07 provider** – detect `window.nostr` per the spec.
* **NIP‑46** – optional module that negotiates a remote signer session if `window.nostr` is missing.

### 4. Core application flow. Core application flow. Core application flow

1. **Startup**

   * Detect `window.nostr`.
   * If missing, offer "Use remote signer" (NIP‑46 URI input) or "Install a browser signer".

2. **Authentication**

   * Request `getPublicKey()`.
   * Show **npub** and ask for explicit confirmation ("Continue as ...").

3. **Fetch profile metadata**

   * Query the bootstrap relay set for `kind 0` metadata for the authenticated pubkey.
   * Cache the event locally **but do not display any personal fields**; only the npub is surfaced in the UI for privacy.

4. **Fetch relay list**

   * Query: `{"kinds":[10002],"authors":[<pubkey>],"limit":1}` against the bootstrap relays.
   * On receive:

     * Cache the event in IndexedDB.
     * Extract all `r` tags with their markers (`read` / `write` / default).
   * For each unique relay URL, attempt to fetch its **NIP‑11** info document (`GET https://relay.xyz/` with `Accept: application/nostr+json`). If an `icon` field is present, cache the icon (data URI or absolute URL) and a human‑readable name for use in the UI.

5. **UI presentation**

   * If a list exists → render as two columns ("Read relays", "Write relays"), with each relay shown as a **circular vignette**: avatar image from its NIP‑11 `icon` (or a coloured initial fallback) plus the relay URL.
   * If none exists → show an empty‑state card explaining why a relay list helps others discover the user and improves performance.

6. **Editor workflow**

   * Display the user's **current relay connections** (enumerated from `window.nostr.getRelays?` or app defaults).
   * Allow the user to tick up to **three** preferred relays for **write** and optionally different ones for **read**.
   * Warn when more than three selected ("NIP‑65 recommends keeping the list small for replication efficiency").

7. **Publish changes**

   * Build a new `kind 10002` event with the chosen `r` tags.
   * Use signer to `signEvent`.
   * Send to every relay in the new **write** set plus the bootstrap relays for propagation.

8. **Confirmation & caching**

   * Await `OK` from at least one relay.
   * Persist the new event locally and record timestamp.

---

### 5. UI/UX details

* **Single‑page layout** with three panels:

  * **Status bar**  npub, signer type, network indicator.
  * **Relay list view / editor**  switches between read‑only and edit modes; relay tiles are circular avatar vignettes (32‑48 px) sourced from NIP‑11 `icon`, falling back to a coloured initial.
  * **JSON viewer**  shows raw JSON of fetched events.
* **Accessibility**  Keyboard‑navigable; WCAG AA contrast.**  Keyboard‑navigable; WCAG AA contrast.
* **Offline behaviour**  If offline, cached data remains viewable and editable; publishing is queued until connectivity returns.

---

### 6. Best‑practice guidance surfaced to the user

* Keep the list small (2‑4 relays).
* Prefer geographically close, high‑uptime relays with strong reputations.
* Include at least one "big indexer" relay to maximise discoverability.
* Review the list periodically; drop relays that become unreliable or censorious.

---

### 7. Security & privacy considerations

* Private keys never touch the app—signing strictly through NIP‑07 or NIP‑46.
* Only the **npub** is displayed; profile fields (name, picture, etc.) stay local and private.
* All relay URLs validated (`wss://`, length limits, no EVAL).
* Cached data namespaced by pubkey to support multi‑user browsers.
* The app emits no analytics or external calls.

---

### 8. Extensibility hooks

* **Import signer relays**  prefill editor with relays returned by `window.nostr.getRelays()`.
* **Federated recommendations**  optionally fetch community‑curated NIP‑51 lists to suggest popular, high‑scoring relays.

---

### 9. Deliverables

* SvelteKit project with README, MIT licence, and GitHub Actions CI (build + ESLint).
* PWA manifest for installability.
* Playwright tests covering authentication, profile fetch, list fetch, edit, and publish.

