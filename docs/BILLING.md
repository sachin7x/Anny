# ANY — Subscriptions and Billing

## Planned plans

| Plan | Indicative price | Billing unit | Status |
|---|---:|---|---|
| Free | $0 | No charge | Product tier |
| Pro | $12 | Per user / month | Indicative only |
| Team | $20 | Per seat / month | Indicative only |

The pricing page labels these figures as indicative. Do not enable checkout until final commercial terms are approved.

## Required subscription states

- incomplete
- trialing
- active
- past_due
- unpaid
- canceled
- paused (if enabled)

## Required implementation

- Server-side plan catalogue and Stripe Price ID mapping.
- Checkout Session creation for authenticated users.
- Customer Portal session creation.
- Webhook signature verification.
- Idempotency keyed by Stripe event ID.
- Subscription and invoice projection tables.
- Entitlement resolver used by every billable API endpoint.
- Usage ledger with immutable events and periodic reconciliation.
- Seat assignment and workspace ownership for Team.
- Cancellation-at-period-end and immediate cancellation semantics.
- Failed payment and recovery flows.
- Tax configuration and regional disclosures.

## Non-negotiable invariants

1. Never trust a client-supplied price, quota or subscription status.
2. Never grant paid entitlements from a success URL alone.
3. Never process the same webhook event twice.
4. Never allow one workspace to read another workspace's billing data.
5. Never delete usage history needed for billing reconciliation.
