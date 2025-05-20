# Epic 2: Relay Data Management (Fetching & Caching)

This epic focuses on acquiring and storing all necessary Nostr data, including `kind 0` (profile metadata), `kind 10002` (relay lists), and NIP-11 relay information, using Dexie.js (version 4.x) for local persistence. All features will be developed with corresponding unit, integration, and/or end-to-end tests.

## User Stories / Tasks

### 1. Dexie.js Setup & Schema Definition
- **Story:** As a Dev, I need Dexie.js initialized with a proper schema, so that Nostr events and relay information can be stored and retrieved efficiently.
  - **Task:** Initialize Dexie.js within the SvelteKit application.
  - **Task:** Define Dexie.js tables and schema for: 
    - `kind 0` events (indexed by pubkey).
    - `kind 10002` events (indexed by pubkey, considering only the latest).
    - NIP-11 relay info (indexed by relay URL), including fields for `name`, `icon_url`, `last_checked`.
  - **Task:** Ensure data is namespaced by the authenticated user's pubkey where appropriate to support multi-user scenarios.
  - **Task:** *Test (Unit):* Verify Dexie database initialization and table creation.

### 2. Fetching and Caching Profile Metadata (`kind 0`)
- **Story:** As an App, I need to fetch the authenticated user's `kind 0` metadata event, so I can cache it locally, even though only the npub is displayed.
  - **Task:** Upon successful authentication (from Epic 1), query a predefined set of bootstrap relays for the user's `kind 0` event.
  - **Task:** Use NDK for subscribing to `{"kinds":[0],"authors":[<pubkey>],"limit":1}`.
  - **Task:** On receiving the `kind 0` event, cache it in the Dexie.js table.
  - **Task:** Store the full event, but ensure UI components only access/display the npub as per privacy requirements (UI part in later epics).
  - **Task:** *Test (Integration):* Mock NDK response and verify `kind 0` event is correctly stored in Dexie.

### 3. Fetching and Caching Relay List Metadata (`kind 10002`)
- **Story:** As an App, I need to fetch the authenticated user's latest `kind 10002` (Relay List Metadata) event, so I can display and manage their relay list.
  - **Task:** Query the bootstrap relays for the user's `kind 10002` event (`{"kinds":[10002],"authors":[<pubkey>],"limit":1}`).
  - **Task:** On receiving the `kind 10002` event:
    - Cache the full event in the Dexie.js table, replacing any older `kind 10002` for that pubkey.
    - Parse and extract all `r` tags, noting their URL and any markers (read, write).
  - **Task:** If no `kind 10002` event is found, this state should be clearly identifiable for the UI (Epic 3).
  - **Task:** Create a Svelte store (e.g., `relayListStore.ts`) to hold the processed relay list (array of objects with URL, read/write status) derived from the cached `kind 10002` event.
  - **Task:** *Test (Integration):* Mock NDK response, verify `kind 10002` event is stored, `r` tags are parsed correctly, and the store is updated.
  - **Task:** *Test (Integration):* Verify behavior when no `kind 10002` event is found.

### 4. Fetching and Caching NIP-11 Relay Information
- **Story:** As an App, for each unique relay URL from the user's list (or defaults), I need to fetch its NIP-11 information document, so I can display relay names and icons.
  - **Task:** For each unique relay URL identified from the `kind 10002` event (or a default set if no list exists):
    - Attempt to fetch its NIP-11 info document via a direct `GET https://<relay_url>/` with `Accept: application/nostr+json` header.
    - If successful and the NIP-11 JSON contains an `icon` URL and a `name`, cache these in the Dexie.js NIP-11 table associated with the relay URL.
    - If an `icon` is present, determine if it needs to be fetched and cached as a data URI or if the absolute URL can be used directly (consider CORS and caching implications).
    - Handle fetch errors gracefully (e.g., timeout, non-JSON response, missing fields).
  - **Task:** Update the `relayListStore` or a related store to include the fetched `name` and `icon_url` for each relay.
  - **Task:** *Test (Integration):* Mock HTTP responses for NIP-11 endpoints (success with icon, success without icon, failure) and verify data is cached correctly in Dexie and the relevant store is updated.

### 5. Data Retrieval Service/Functions
- **Story:** As a Dev, I need clear service functions or Svelte stores to access the cached Nostr data, so UI components can easily consume it.
  - **Task:** Implement functions/methods that provide easy access to the cached `kind 0` event (specifically npub for UI), the processed `kind 10002` relay list (with NIP-11 info like names/icons integrated), and individual NIP-11 details.
  - **Task:** Ensure these accessors are reactive, using Svelte stores where appropriate, so the UI updates when underlying cached data changes.
  - **Task:** *Test (Unit):* Verify data retrieval functions return data in the expected format from a populated Dexie mock.

Dev: DO NOT ADD COMMENTS. 