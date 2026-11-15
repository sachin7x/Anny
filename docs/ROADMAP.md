# ANY — Roadmap

## Phase 0: Foundation
- [x] Create repository and product brief.
- [x] Establish architecture, billing and security principles.
- [x] Build marketing homepage and subscription pricing presentation.
- [x] Add lint, typecheck, build and CI workflow definitions.
- [x] Upgrade the web stack to a supported Next.js major.
- [x] Add Supabase SSR browser/server clients and session Proxy.
- [x] Implement email signup, login, PKCE callback and sign-out.
- [x] Add protected account dashboard and billing view.
- [x] Add Stripe Checkout, customer portal and signed webhook handlers.
- [x] Add database bootstrap schema with RLS.
- [ ] Generate and commit npm lockfile; run CI and fix any failures.
- [ ] Provision a dedicated Supabase project and apply the schema.

## Phase 1: Web MVP
- [x] Authentication UI and protected dashboard code.
- [x] Subscription state projection and billing endpoints.
- [ ] Verify authentication against a configured Supabase project.
- [ ] Configure Stripe test Prices and webhook endpoint.
- [ ] Add server-side plan entitlements and usage enforcement.
- [ ] Add account preferences, vocabulary and usage dashboard.
- [ ] Add API service and ASR provider adapter.
- [ ] Add data export and account deletion.

## Phase 2: Android
- [ ] Kotlin + Jetpack Compose application.
- [ ] Audio capture and foreground service.
- [ ] VAD and transcription pipeline.
- [ ] Floating controls and accessible text insertion.
- [ ] Offline/local inference evaluation.
- [ ] Permission, privacy and battery testing.

## Phase 3: Desktop
- [ ] macOS capture and text insertion.
- [ ] Windows capture and text insertion.
- [ ] Global shortcuts and per-app behavior.
- [ ] Secure session and usage synchronization.

## Phase 4: Teams and scale
- [ ] Workspaces, seats and invitations.
- [ ] Shared vocabulary and style settings.
- [ ] Admin analytics and audit trail.
- [ ] Reliability, cost, abuse and support controls.
