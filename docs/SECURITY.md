# ANY — Security Baseline

## Identity and access

- Require authenticated sessions for private APIs.
- Authorize every object access; do not rely on hidden UI controls.
- Enforce workspace membership and role checks on the server.
- Use Supabase RLS for all exposed tables.
- Keep service-role and billing secrets server-only.

## Audio and privacy

- Show a clear recording indicator and capture state.
- Request microphone access only when needed.
- Define retention and deletion controls before storing recordings.
- Encrypt transport and storage.
- Avoid logging raw audio, transcripts or sensitive prompts by default.
- Document ASR subprocessors and data handling.

## Billing security

- Verify webhook signatures against the raw request body.
- Persist event IDs and enforce idempotency.
- Resolve plan and price IDs from server configuration.
- Validate ownership before opening a customer portal session.

## Application security

- Validate input schemas and enforce payload limits.
- Rate-limit authentication, transcription and billing endpoints.
- Apply CSRF protections where cookie-based mutations require them.
- Use secure cookies, CSP and security headers.
- Redact secrets and personal data from logs.
- Run dependency, static analysis and secret scanning in CI.

## Launch gate

A production launch requires reviewed RLS policies, auth flows, billing webhooks, audio retention, deletion behavior, rate limits, incident response and privacy/terms disclosures.
