# Epic 4: Relay List Editor Functionality

This epic details the interactive components allowing users to modify their relay lists, including selecting read/write relays and importing existing configurations. All features will be developed with corresponding unit, integration, and/or end-to-end tests.

## User Stories / Tasks

### 1. Add a New Relay to the List
- **Story:** As a User, I want to be able to add a new relay to my NIP-65 list by specifying its URL and an optional friendly name, so I can customize which relays my clients will use.
  - **Task:** Implement an input field (e.g., a text box) for the user to enter the WebSocket URL of the new relay (e.g., `wss://relay.example.com`).
  - **Task:** Implement an optional input field for the user to assign a local, friendly name to this relay for their own reference (this name is not part of the NIP-65 event itself but aids usability in the editor).
  - **Task:** Implement an "Add Relay" button (e.g., a "+" icon/button) that, when clicked, appends a new entry (with fields for URL and name) to the list of relays being edited in the UI.
  - **Task:** The new relay entry should initially default to being a "read" and "write" relay, or use a sensible default that the user can then change (covered in a subsequent story about read/write selection).
  - **Task (Validation):** Implement basic client-side validation to check if the entered relay URL appears to be a valid WebSocket URL format (e.g., starts with `wss://` or `ws://`). Display a user-friendly message if the format is incorrect.
  - **Task (UI):** Ensure the UI clearly presents the newly added relay fields, ready for further editing or read/write specification.
  - **Task (*Test - Component/E2E*):** Verify that a user can input a URL and name, click "Add," and see a new relay entry appear in the editor UI with the correct details and default read/write status. Verify URL validation.

### 2. Remove a Relay from the List
- **Story:** As a User, I want to be able to remove a specific relay from the list I am currently editing, so I can curate my preferred relays.
  - **Task:** For each relay entry in the editor UI (as defined in Story 1 and for existing relays loaded for editing), implement a "Remove Relay" button (e.g., a "-" icon/button).
  - **Task:** When the "Remove Relay" button is clicked for a specific relay entry, that entire entry (URL, name, read/write status) should be removed from the list of relays currently being edited in the UI.
  - **Task (UI):** Ensure the UI updates immediately to reflect the removal, and the layout remains consistent.
  - **Task (*Test - Component/E2E*):** Verify that clicking the "Remove" button next to a relay entry successfully removes it from the displayed list in the editor. Test with multiple relays in the list.

### 3. Edit Relay Details (URL and Name)
- **Story:** As a User, I want to modify the WebSocket URL and the optional friendly name of a relay in the list I am editing, so I can correct mistakes or update its information.
  - **Task:** For each relay displayed in the editor (whether newly added or loaded from an existing NIP-65 list), its URL and friendly name **must be** presented in editable input fields (e.g., text boxes).
  - **Task:** The user **must be able to** click into these input fields and directly change the text content of the relay's URL or its friendly name.
  - **Task (Validation - URL):** When a relay's URL is modified, client-side validation, identical to that in User Story 1 (checking for `wss://` or `ws://` prefix and basic format), **must be** applied. If the URL is invalid, a clear, user-friendly error message **must be displayed** adjacent to the problematic input field. The system **must** prevent the saving of a list if any relay URL entered or modified by the user is invalid.
  - **Task (UI):** The UI **must** immediately reflect any typed changes within the respective input fields as the user types.
  - **Task (*Test - Component/E2E*):** Verify that a user can select an existing relay entry and modify its URL and its friendly name. Confirm that the changes are visible in the input fields. Test that URL validation during editing functions as specified, including error message display and the prevention of saving the list if an edited URL is invalid.

### 4. Select Read/Write Permissions for Relays
- **Story:** As a User, I want to specify whether each relay in my list should be used for "read," "write," or both, so I can control how my clients interact with them according to NIP-65.
  - **Task:** For each relay entry in the editor UI, implement distinct controls (e.g., two checkboxes labeled "Read" and "Write") allowing the user to independently set its read and write status.
  - **Task:** The UI **must** visually reflect the current read/write selection for each relay.
  - **Task:** When a new relay is added (as per Story 1), its permissions **must** default to both "Read" selected and "Write" selected.
  - **Task:** If an existing NIP-65 list is loaded into the editor (covered in a future story), the "Read" and "Write" controls for each relay **must** accurately reflect its status from the loaded NIP-65 data (e.g., a relay tagged only "read" has "Read" checked and "Write" unchecked; a relay with no marker has both checked).
  - **Task:** The user **must be able to** change these selections at any time before saving the list. For example, a user can uncheck "Write" to make a relay read-only, or uncheck "Read" to make it write-only, or check/uncheck both.
  - **Task (NIP-65 Compliance):** The internal state representation of these selections **must** be compatible with NIP-65 formatting (e.g., a relay with only "Read" checked will eventually be formatted as `["wss://...", "read"]`; only "Write" as `["wss://...", "write"]`; both checked as `["wss://..."]` or `["wss://...", "read", "write"]` - the exact output formatting is for the "Save" story, but the selection mechanism must support these distinctions).
  - **Task (*Test - Component/E2E*):** Verify that "Read" and "Write" selections can be made for each relay. Confirm new relays default to Read+Write. Test that changing selections updates the UI. Verify that if mock NIP-65 data is loaded, the UI correctly reflects the read/write status of each relay.

### 5. Load Existing NIP-65 Relay List into Editor
- **Story:** As a User, when I choose to edit my relays, I want my current NIP-65 relay list (if one exists) to be automatically loaded into the editor, so I can see and modify my existing configuration.
  - **Task:** Implement a mechanism (e.g., an "Edit Relays" button on the `RelayListView` from Epic 3) that navigates the user to or displays the relay list editor interface.
  - **Task:** Upon activating the editor, the system **must** check the `relayListStore` (from Epic 2) for the authenticated user's current NIP-65 `kind 10002` event data.
  - **Task:** If a `kind 10002` event exists:
    - For each relay tag in the event, a corresponding entry **must be** created in the editor's UI.
    - The WebSocket URL from the tag **must be** populated into the URL input field for that relay entry.
    - The read/write status from the tag (e.g., "read", "write", or no marker for both) **must be** accurately reflected in the "Read" and "Write" selection controls (as defined in Story 4) for that relay entry.
    - The "friendly name" field for these loaded relays **must initially be left blank** (as NIP-65 does not store friendly names), allowing the user to optionally add one during the editing session.
  - **Task:** If no `kind 10002` event exists in the `relayListStore` for the user, the editor **must** open in a clean state, ready for the user to add new relays (as per Story 1).
  - **Task (UI):** The editor interface **must** clearly display the loaded relays, with their URLs and read/write permissions correctly set, matching the structure used for newly added relays.
  - **Task (*Test - Component/E2E*):** Verify that clicking the "Edit Relays" button loads the editor. Test with mock `relayListStore` data:
    - When a NIP-65 list exists, verify all relays are loaded with correct URLs and read/write statuses reflected in the UI, and friendly name fields are blank.
    - When no NIP-65 list exists, verify the editor opens in a blank state.

### 6. Save Modified Relay List (Publish NIP-65 Event)
- **Story:** As a User, after editing my relay list, I want to save my changes by publishing an updated NIP-65 `kind 10002` event, so my new relay configuration is active.
  - **Task:** Implement a "Save Changes" button within the relay list editor interface. This button **must be** disabled if any relay URL in the editor is currently invalid (as per validation in Story 3).
  - **Task (Event Construction):** When "Save Changes" is clicked:
    - A new Nostr event object **must be** prepared with `kind: 10002` and `content: ""`.
    - The `tags` array for this event **must be** constructed from the current state of the relays in the editor:
      - For each relay entry in the editor UI:
        - If only "Read" is selected: an NIP-65 tag `["r", "<relay_URL>", "read"]` **must be** added.
        - If only "Write" is selected: an NIP-65 tag `["r", "<relay_URL>", "write"]` **must be** added.
        - If both "Read" and "Write" are selected: an NIP-65 tag `["r", "<relay_URL>", "read", "write"]` **must be** added.
        - (The UI should ensure at least one of "Read" or "Write" is selected if the relay is to be included).
  - **Task (Signing - NIP-07):** The constructed `kind 10002` event **must be** passed to a NIP-07 compatible signing interface (e.g., using NDK's `NostrSigner` or equivalent). This will prompt the user via their browser extension to approve the event signing.
  - **Task (On Successful Signing):**
    - If the user approves and the event is successfully signed:
      - The application **must** attempt to publish the newly signed `kind 10002` event using NDK to all relays that are marked for "write" in the *newly saved list*.
      - A user-facing notification (e.g., a toast message) **must be** displayed, indicating whether publishing was initiated successfully (e.g., "Relay list updated and publishing..."). Detailed per-relay success/failure of publishing is a secondary concern for immediate feedback but should be handled gracefully by NDK.
      - The local `relayListStore` (from Epic 2) **must be** updated immediately with the new signed `kind 10002` event, replacing any previous one. This change **must** also be persisted to the Dexie.js cache.
      - The user **must be** navigated away from the editor interface (e.g., back to the `RelayListView` which will now reflect the saved changes) or the editor must clearly indicate that changes are saved and it can be closed.
  - **Task (On Signing Failure/Rejection):**
    - If the user rejects the signing request via their NIP-07 extension, or if any other error occurs during the signing process:
      - A user-facing notification (e.g., "Signing rejected" or "Failed to sign event") **must be** displayed.
      - The editor **must** remain in its current state with the unsaved changes, allowing the user to try saving again or make further modifications.
  - **Task (*Test - Component/E2E*):**
    - Verify the "Save Changes" button is disabled if a URL is invalid.
    - Mock NIP-07 signing:
      - Test successful signing: confirm correct event structure, NDK publish is called with correct relays, `relayListStore` is updated, and navigation/UI state change occurs.
      - Test signing rejection: confirm error message and editor remains unchanged.
    - Verify correct NIP-65 tag construction for various read/write combinations.

### 7. Discard Changes and Exit Editor
- **Story:** As a User, if I have made changes in the relay list editor but do not wish to save them, I want to be able to discard my changes and exit the editor, so my original relay list remains unaffected.
  - **Task:** Implement a "Cancel" or "Discard Changes" button within the relay list editor interface.
  - **Task:** When the "Cancel" / "Discard Changes" button is clicked:
    - The system **must not** attempt to construct or sign any NIP-65 event.
    - Any modifications made by the user to the relay list within the current editing session (additions, removals, edits to URLs/names, changes to read/write permissions) **must be** discarded.
    - The state of the `relayListStore` and the Dexie.js cache **must not be altered**.
    - The user **must be** navigated away from the editor interface (e.g., back to the `RelayListView`).
  - **Task (Confirmation - Optional but Recommended):** If changes have been made in the editor, upon clicking "Cancel" / "Discard Changes", the system **should** present a confirmation dialog (e.g., "Are you sure you want to discard all changes? This cannot be undone.") to prevent accidental data loss.
    - If the user confirms, proceed with discarding changes and exiting.
    - If the user cancels the confirmation dialog, they **must** remain in the editor with their changes intact.
  - **Task (*Test - Component/E2E*):**
    - Verify that if no changes are made, clicking "Cancel" navigates away without a confirmation.
    - Verify that if changes are made:
      - Clicking "Cancel" prompts for confirmation.
      - Confirming discard: navigates away, `relayListStore` is unchanged.
      - Canceling discard: user remains in editor, changes are still present.
    - Verify that after discarding, the `RelayListView` (or wherever the user is navigated) reflects the original, unchanged relay list. 