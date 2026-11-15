# ANY

**Your voice. At the speed of thought.**

ANY is an independent, clean-room AI voice dictation and productivity platform. It builds an original product in the voice-first productivity category, without copying proprietary source, private APIs, protected assets or branding.

## Product surfaces

- **Marketing:** product story, features, pricing, FAQs and legal pages.
- **Account:** email signup, login, confirmation callback, protected dashboard and sign-out.
- **Subscriptions:** Free, Pro and Team plan presentation, Stripe Checkout, Customer Portal and verified webhook sync.
- **Web app:** account billing, usage, vocabulary and writing preferences (in progress).
- **Android:** microphone capture, transcription, floating controls and accessible text insertion (planned).
- **Desktop:** macOS and Windows capture and system-wide text insertion (planned).
- **Platform API:** authentication, transcription orchestration, formatting, usage, billing and audit events.

## Stack

| Layer | Technology |
|---|---|
| Web | Next.js 16 App Router, React 19, TypeScript, Tailwind CSS |
| Auth and database | Supabase Auth, Postgres and Row Level Security |
| Billing | Stripe subscriptions, Checkout, Customer Portal and webhooks |
| Audio | Provider-neutral ASR adapters (planned) |
| Android | Kotlin, Jetpack Compose, AudioRecord (planned) |
| Desktop | Tauri + Rust (planned) |
| Quality | ESLint, TypeScript checks, production build and GitHub Actions |

## Local development

Requires Node.js 20.9+.

```bash
npm install
cp .env.example .env.local
npm run dev
```

Open http://localhost:3000.

See [Service setup](docs/SETUP.md) before testing authentication or billing. Generate and commit `package-lock.json` before production release.

## Implemented

- Responsive marketing homepage and pricing page.
- Supabase browser and cookie-backed server clients.
- Session refresh through the Next.js 16 Proxy.
- Email/password signup and login with PKCE confirmation callback.
- Protected dashboard and sign-out.
- Server-side Stripe Checkout and Customer Portal endpoints.
- Stripe webhook signature verification and event idempotency.
- Database bootstrap schema with RLS for profiles, workspaces, memberships, subscriptions, usage, preferences and vocabulary.
- CI workflow for lint, typecheck and production build.

## Not yet live

- Supabase project provisioning and schema application.
- Stripe account configuration, live Price IDs and webhook secret.
- Production subscription entitlements and usage enforcement.
- Speech capture, ASR, formatting engine and native clients.
- Production deployment and end-to-end verification.

The prices shown in the UI are illustrative planning values. Do not treat them as live offers until pricing, taxes, quotas, terms and payment settings are approved.

## Security principles

- Server-side plan and price allowlists. Never trust client-supplied prices or entitlements.
- Verified Stripe signatures and idempotent webhook processing.
- Supabase RLS on every exposed table; server-only secret keys.
- No credentials, recordings, transcripts or customer data in source control.
- Explicit microphone consent, recording indicators and user-controlled deletion.

## Documentation

- [Product brief](docs/PRODUCT.md)
- [Architecture](docs/ARCHITECTURE.md)
- [Billing model](docs/BILLING.md)
- [Service setup](docs/SETUP.md)
- [Security baseline](docs/SECURITY.md)
- [Roadmap](docs/ROADMAP.md)
