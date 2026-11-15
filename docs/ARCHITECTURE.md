# ANY — Architecture

## System boundaries

- Web client: marketing, pricing, account, settings, billing UI and dictation history.
- API: authentication enforcement, transcription orchestration, formatting, usage and billing webhooks.
- Database: users, workspaces, memberships, preferences, vocabulary, usage ledger and subscription projection.
- ASR adapters: provider-neutral interface for hosted and local speech recognition.
- Clients: Android first, then macOS and Windows.

## Request flow

1. Client obtains an authenticated session.
2. Client requests a short-lived recording/transcription session.
3. API validates identity, plan entitlement, rate limit and remaining quota.
4. Audio is sent over an authenticated transport to the selected ASR adapter.
5. API returns transcript and optional formatted output.
6. API records usage and an auditable event.
7. Client inserts or saves the text with explicit user action.

## Data isolation

Every user-owned row is scoped to a user or workspace. Workspace membership is checked server-side. Supabase Row Level Security is required for user-facing database access. Service-role credentials are server-only and never shipped to clients.

## Billing boundary

The browser may request a checkout session for a known plan key. The server maps that key to a configured Stripe Price ID. Stripe webhooks are signature-verified, idempotently processed and persisted before entitlements change. The browser redirect is never trusted as payment proof.

## Provider abstraction

ASR and text-formatting providers sit behind interfaces. Provider credentials remain server-side. The platform must support timeouts, retries with bounded budgets, cancellation, request IDs, cost/latency telemetry and graceful provider failure.

## Deployment

Web and API deploy independently. Database migrations are versioned. Environments are separated into local, staging and production. Secrets are injected through the deployment platform and rotated without source changes.
