# ANY

**Your voice. At the speed of thought.**

ANY is an independent, clean-room AI voice dictation and productivity platform. The product direction is inspired by the workflow category popularized by Wispr Flow, while all implementation, branding, UI, and product decisions in this repository are original.

## Product vision

Turn speech into polished, context-aware text anywhere you write.

### Product surfaces

- **Marketing site:** product story, feature pages, pricing, FAQs, legal pages and conversion flows.
- **Account:** sign-up, sign-in, onboarding, profile and workspace settings.
- **Subscription:** Free, Pro and Team plans, checkout, billing portal, entitlements, usage metering and cancellation.
- **Web app:** dictation history, vocabulary, writing preferences and usage dashboard.
- **Android:** microphone capture, transcription, floating controls and accessible text insertion.
- **Desktop:** macOS and Windows capture and system-wide text insertion.
- **Platform API:** authentication, transcription orchestration, formatting, usage, billing webhooks and audit events.

## Initial architecture

| Layer | Initial choice |
|---|---|
| Web | Next.js App Router, TypeScript, Tailwind CSS |
| API | FastAPI, Python |
| Data/Auth | Supabase Postgres, Auth, Row Level Security |
| Billing | Stripe subscriptions and customer portal, behind server-side integration |
| Audio | Pluggable ASR providers; local inference as a later capability |
| Android | Kotlin, Jetpack Compose, AudioRecord |
| Desktop | Tauri + Rust, native platform integrations |
| Quality | TypeScript/Python tests, API contract tests, security and abuse cases |
| Delivery | GitHub Actions; deployment target selected per environment |

## Repository map

```
apps/
  web/                 # Marketing site, pricing and account experience
  api/                 # FastAPI service (planned)
  android/             # Native Android client (planned)
  desktop/             # macOS and Windows client (planned)
packages/
  contracts/           # Shared API and event contracts (planned)
  config/              # Shared configuration (planned)
docs/
  PRODUCT.md
  ARCHITECTURE.md
  BILLING.md
  SECURITY.md
  ROADMAP.md
```

## Local development

The web application is the first implementation target. Use Node.js 20.9+.

```bash
npm install
cp .env.example .env.local
npm run dev
```

Open http://localhost:3000.

No production secrets belong in source control. Configure Supabase and Stripe values only in local environment files or the deployment secret manager.

## Subscription principles

- Prices and entitlements are defined server-side, never trusted from the browser.
- Stripe webhook events are signature-verified and processed idempotently.
- A successful redirect is not proof of payment; entitlement changes follow verified billing events.
- Cancellation, renewal, failed payment, refunds and plan changes are represented explicitly.
- Usage is metered server-side with auditable events.
- Tax, currency, regional payment methods and consumer disclosures must be configured before launch.

## Clean-room and security principles

- Build original code and original product assets. Do not copy proprietary source, private APIs, branding or protected UI assets.
- Use only authorized test accounts and documented/public interfaces.
- Never commit credentials, tokens, customer data, recordings or production logs.
- Enforce tenant isolation with database Row Level Security and server-side authorization.
- Obtain explicit microphone consent and provide clear recording indicators and deletion controls.

## Status

The repository is being initialized. The first milestone is the responsive marketing and pricing experience, followed by authentication, billing and the transcription API.

See [Product brief](docs/PRODUCT.md), [Architecture](docs/ARCHITECTURE.md), [Billing](docs/BILLING.md), [Security](docs/SECURITY.md) and [Roadmap](docs/ROADMAP.md).
