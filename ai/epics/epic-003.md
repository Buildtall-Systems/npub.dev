# Epic 3: Relay List Presentation & Read-Only View

This epic encompasses the user interface for displaying the fetched relay lists (or an empty state if no list exists), including relay vignettes (icon/initial + URL) and surfacing best-practice guidance to the user. This view is read-only. All features will be developed with corresponding unit, integration, and/or end-to-end tests.

## User Stories / Tasks

### 1. Main Relay List Display Area
- **Story:** As a User, when I have an existing NIP-65 relay list, I want to see it clearly presented with distinct sections for my read and write relays.
  - **Task:** Create a `RelayListView.svelte` component that will be the main container for displaying the relay list.
  - **Task:** This component should subscribe to the `relayListStore` (from Epic 2) to get the processed relay data.
  - **Task:** Structure the layout to display two columns: "Read Relays" and "Write Relays", based on the markers in the `kind 10002` event.
    - Relays without markers, or those explicitly marked for read, go into the "Read Relays" column.
    - Relays explicitly marked for write go into the "Write Relays" column. (Note: A relay can be in both if marked for both, or if it's a write relay and no specific read relays are defined, often implying it's also for read).
  - **Task:** *Test (Component/E2E):* Verify the two-column layout renders correctly based on mock `relayListStore` data with various read/write combinations.

### 2. Relay Vignette Component
- **Story:** As a User, I want to see each relay in my list represented as a visually distinct item, showing its icon (or a fallback) and its URL, so I can easily identify them.
  - **Task:** Create a `RelayVignette.svelte` component.
  - **Task:** Input props: relay URL, NIP-11 name (if available), NIP-11 icon URL (if available), read/write status.
  - **Task:** Display the relay as a circular vignette (32-48px as per spec).
    - If an `icon_url` (from NIP-11, Epic 2) is available, display the image.
    - If no `icon_url` is available, display a colored circle with the first letter of the relay URL (or NIP-11 name if available) as a fallback.
  - **Task:** Display the relay URL clearly next to or below the vignette.
  - **Task:** Display the NIP-11 `name` if available, possibly as a tooltip or alongside the URL.
  - **Task:** *Test (Component):* Verify the vignette displays correctly with an icon, without an icon (fallback initial), and shows the URL/name for various inputs.

### 3. Empty State Display
- **Story:** As a User, if I do not have a NIP-65 relay list configured, I want to see a clear message explaining the benefits of having one, so I am encouraged to create one.
  - **Task:** In `RelayListView.svelte`, if the `relayListStore` indicates no `kind 10002` event was found for the user (from Epic 2):
    - Display an "empty-state" card or section.
    - The content should explain why a relay list is beneficial (e.g., helps others discover the user, improves performance for their followers/clients).
  - **Task:** *Test (Component/E2E):* Verify the empty state UI renders correctly when the `relayListStore` indicates no relay list.

### 4. Best-Practice Guidance Display
- **Story:** As a User, I want to see general best-practice guidance for managing my relay list, so I can make informed decisions.
  - **Task:** Create a `RelayBestPractices.svelte` component or section within `RelayListView.svelte`.
  - **Task:** Display the following guidance points (from `ai/spec.md` Section 6):
    - "Keep the list small (2-4 relays)."
    - "Prefer geographically close, high-uptime relays with strong reputations."
    - "Include at least one 'big indexer' relay to maximise discoverability."
    - "Review the list periodically; drop relays that become unreliable or censorious."
  - **Task:** This guidance should be visible alongside the relay list display or the empty state.
  - **Task:** *Test (Component/E2E):* Verify the best-practice guidance text is displayed correctly.

### 5. Integration with Core UI Shell
- **Story:** As a Dev, I need to integrate the `RelayListView.svelte` component into the main content area of the application defined in Epic 1.
  - **Task:** Ensure `RelayListView.svelte` (or its parent page component) is routed correctly and displayed in the main content panel of the UI shell.
  - **Task:** Ensure data flows correctly from authentication (Epic 1) through data fetching (Epic 2) to display (Epic 3).
  - **Task:** *Test (E2E):* Verify that after authentication and mock data fetching, the relay list view (or empty state) appears in the correct UI location with all its sub-components.

Dev: DO NOT ADD COMMENTS. 