# ANY — Local and service setup

## Runtime

- Node.js 20.9 or newer (Node 24 LTS is a suitable development runtime).
- npm.
- A dedicated Supabase project for ANY.
- A Stripe account in test mode for billing integration.

## 1. Install dependencies

```bash
npm install
cp .env.example .env.local
npm run dev
```

The dependency versions are pinned in `package.json`. Generate and commit `package-lock.json` with npm on the development machine before treating builds as reproducible.

## 2. Create and configure Supabase

Create a dedicated Supabase project for ANY. Do not reuse the inactive project for the earlier Wispr Flow prototype or any other production application.

In the Supabase Dashboard:

1. Open **Project Settings → API Keys** and copy the project URL and publishable key.
2. Create a server-side secret key. Never expose it to browser code.
3. Add the values to `.env.local`:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`
   - `SUPABASE_SECRET_KEY`
4. Open the SQL Editor and apply `supabase/schema.sql`.
5. In **Authentication → URL Configuration**, set the site URL to your local or deployed app URL and add `/auth/callback` to the allowed redirect URLs.
6. Enable email/password authentication. Keep email confirmation enabled for production.

The SQL bootstrap enables RLS on every table. The client can read its own profile, subscription and usage rows; subscription writes and usage writes are reserved for trusted server code.

## 3. Configure Stripe test mode

Create three recurring Prices in Stripe test mode and copy their Price IDs into:

- `STRIPE_PRICE_PRO_MONTHLY`
- `STRIPE_PRICE_PRO_YEARLY`
- `STRIPE_PRICE_TEAM_MONTHLY`

Then set:

- `STRIPE_SECRET_KEY`
- `STRIPE_WEBHOOK_SECRET`

Configure a webhook endpoint at `/api/webhooks/stripe` and subscribe to:

- `checkout.session.completed`
- `customer.subscription.created`
- `customer.subscription.updated`
- `customer.subscription.deleted`

Use Stripe CLI for local webhook forwarding. The endpoint verifies the signature against the raw request body and stores event IDs for idempotency.

## 4. Configure the app URL

Set `NEXT_PUBLIC_APP_URL` to the exact origin used by the browser, for example `http://localhost:3000`. Update Supabase Auth redirect URLs and Stripe webhook settings when moving to staging or production.

## 5. Verify

```bash
npm run lint
npm run typecheck
npm run build
```

Then test the complete email confirmation, login, logout, checkout, customer portal and webhook flows using test credentials only.

## Current implementation boundaries

- Supabase project provisioning and schema application have not been performed by this repository bootstrap.
- Stripe checkout and portal routes are implemented but return a configuration error until valid test-mode keys and Price IDs are configured.
- The initial prices shown on the public pricing page are illustrative. Confirm final commercial pricing, taxes, currencies, usage allowances and cancellation terms before enabling live payments.
- Add rate limiting to authentication and billing endpoints before public production traffic.
- A lockfile must be generated and committed before production CI is considered reproducible.
