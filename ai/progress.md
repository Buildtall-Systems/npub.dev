# progress tracking

as epics and stories are written, they are to be added to the progress file with checkboxes. put stories hierarchicaly under the epics they roll up to. as work is done, check the boxes. when all the story boxes are checked for an epic, that epic is completed.

## epics

- [x] Epic 1: Foundation, Authentication, and Core UI Shell

  - [x] 1. Project Initialization & Setup
  - [x] 2. Authentication Logic (NIP-07 & NIP-46)
  - [x] 3. Core UI Shell Implementation
  - [x] 4. State Management for Authentication

- [x] Epic 2: Relay Data Management (Fetching & Caching)

  - [x] 1. Dexie.js Setup & Schema Definition
  - [x] 2. Fetching and Caching Profile Metadata (`kind 0`)
  - [x] 3. Fetching and Caching Relay List Metadata (`kind 10002`)
  - [x] 4. Fetching and Caching NIP-11 Relay Information
  - [x] 5. Data Retrieval Service/Functions

- [ ] Epic 3: Relay List Presentation & Read-Only View
  - [x] 1. Main Relay List Display Area
  - [x] 2. Relay Vignette Component
  - [x] 3. Empty State Display
  - [x] 4. Best-Practice Guidance Display
  - [ ] 5. Integration with Core UI Shell

- [ ] Epic 4: Relay List Editor Functionality
  - [x] 1. Add a New Relay to the List
  - [x] 2. Remove a Relay from the List
  - [ ] 3. Edit Relay Details (URL and Name)
  - [ ] 4. Select Read/Write Permissions for Relays
  - [ ] 5. Load Existing NIP-65 Relay List into Editor
  - [ ] 6. Save Modified Relay List (Publish NIP-65 Event)
  - [ ] 7. Discard Changes and Exit Editor
