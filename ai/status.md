# npub.dev Status

## 2026-01-25

### Dashboard Enhancement - COMPLETE
- Created `DashboardProfileHero.svelte` - profile hero component for dashboard
- Enhanced `ProfileCard.svelte` - added showActions prop and onEditClick callback
- Refactored dashboard to hero + 3-card layout (Relays, Following, NIP-05)
- Hero displays avatar, banner, bio, website, lightning address, quick stats
- Empty state shows placeholder with prominent "Create Profile" CTA
- Profile card removed from grid (now in hero section)
- Dark mode compatible, responsive layout
- Build passes

### Header Avatar Dropdown - COMPLETE
- Added shadcn-svelte dropdown-menu component
- Created `AvatarDropdown.svelte` - shows user avatar, dropdown with Profile/Settings/Logout
- Integrated into layout navbar (right side)
- Removed Settings from main nav links (now in dropdown)
- Removed Settings/Logout buttons from dashboard header
- Build passes

### Phase 1: Route Structure & State Management - COMPLETE
- Created `src/lib/stores/nostrState.ts` - comprehensive store for kind 0/3/10002
- Created `/dashboard` route with adaptive status cards
- Extracted relay manager to `/relays` route
- Updated landing page (`+page.svelte`) to redirect to dashboard on auth
- Updated layout with navigation bar (desktop + mobile)
- Converted layout to Svelte 5 snippet syntax (`{@render children()}`)
- Build passes, no TypeScript errors

### Phase 2: Profile Viewer/Editor - COMPLETE
- Created `src/lib/nostr/profile.ts` - profile utilities (parse, create, publish kind 0)
- Created `ProfileCard.svelte` - displays profile with avatar, banner, links
- Created `ProfileForm.svelte` - edit form with URL validation and previews
- Created `/profile` route with view/edit toggle
- Auto-enters edit mode for new users without profile
- Converted to Svelte 5 event syntax (onsubmit, onclick)
- Build passes

### Phase 3: NIP-05 Identity Wizard - COMPLETE
- Created `src/lib/nostr/nip05.ts` - NIP-05 parsing and verification
- Created `Nip05Status.svelte` - verification status display
- Created `ProviderList.svelte` - NIP-05 provider recommendations
- Created `/identity` route with multi-step wizard
- Verifies NIP-05 against .well-known before profile update
- Handles CORS errors gracefully

### Phase 4: Discovery - Follow Suggestions - COMPLETE
- Created `src/lib/nostr/starterPacks.ts` - starter pack fetching and curated packs
- Created `InterestSelector.svelte` - chip-based multi-select
- Created `StarterPackCard.svelte` - pack display with "Follow All" button
- Created `/discover` route with interest-based filtering
- Merges new follows with existing kind 3 contacts

### Phase 5: Client Recommendations - COMPLETE
- Created `src/lib/data/clients.ts` - static client data by platform
- Created `ClientRecommendation.svelte` - platform selector with recommendations
- Added client recommendations section to /discover page
- Expandable alternatives list for each platform

### Phase 6: Polish & Onboarding Flow - COMPLETE
- Created `OnboardingBanner.svelte` - checklist for new user setup
- Created `/settings` route with sign out and about info
- Added settings to navigation bar
- Dashboard shows onboarding banner for incomplete setup
- All 6 phases implemented, build passes

### New User Onboarding (No Existing npub) - COMPLETE
- Created `src/lib/utils/browser.ts` - browser detection (Chrome, Firefox, Safari, Edge, mobile)
- Created `src/lib/data/extensions.ts` - browser-specific extension recommendations (Alby, nos2x)
- Added shadcn-svelte dialog component for modal wizard
- Created `GetStartedModal.svelte` - multi-step wizard:
  - Step 1: Browser-aware extension recommendations with store links
  - Step 2: Polling for window.nostr detection (auto-advances when installed)
  - Step 3: Ready to connect confirmation
  - Safari/mobile users directed to NIP-46 remote signer path
- Updated landing page with "New to Nostr? Get Started" button
- Modal opens wizard, completion triggers existing NIP-07 auth flow
- Build passes
