# FigureReady — Backend Architecture

This document is the primary reference for maintaining the FigureReady backend. It covers every
server-side subsystem in enough detail to debug, extend, or redeploy without reading source code
first. Read it top-to-bottom once; use the section headers to navigate later.

---

## Table of Contents

1. [System Overview](#1-system-overview)
2. [Database Schema](#2-database-schema)
3. [JWT and Session Lifecycle](#3-jwt-and-session-lifecycle)
4. [Purchase Flow](#4-purchase-flow)
5. [Webhook Lifecycle](#5-webhook-lifecycle)
6. [Magic Link (Restore Access) Flow](#6-magic-link-restore-access-flow)
7. [Entitlement Logic](#7-entitlement-logic)
8. [GA4 Analytics Funnel](#8-ga4-analytics-funnel)
9. [API Reference](#9-api-reference)
10. [Environment Variables](#10-environment-variables)
11. [Deployment Steps](#11-deployment-steps)
12. [Recovery Procedures](#12-recovery-procedures)
13. [Debugging Commands](#13-debugging-commands)

---

## 1. System Overview

### Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 14 App Router (TypeScript) |
| Database | Neon Postgres (`@neondatabase/serverless`, HTTP mode) |
| Auth tokens | `jose` — HS256 JWT, Edge-compatible |
| Session transport | HTTP-only cookie (`fr_session`), 30-day persistent |
| Payments | Polar — hosted checkout, webhooks |
| Email | Resend — transactional magic links |
| Analytics | GA4 (client-side) + FB Conversions API (server-side webhook) |

### Core security invariants (never break these)

- `POLAR_API_KEY` and `AUTH_SECRET` are server-only. Neither has a `NEXT_PUBLIC_` prefix.
- Customer email is always read from Polar's API response, never from the client request body.
- `isPro` is only `true` when the DB row has `status = 'active'`. `pending_confirmation` grants
  nothing.
- The session cookie is `httpOnly; secure; sameSite=lax`. JavaScript cannot read it.
- localStorage is used for UI state (free export tracking, GA4 dedup) and never to authorize Pro.

---

## 2. Database Schema

Run `scripts/schema.sql` once in the Neon console to create all tables.

```sql
-- One row per unique email address.
CREATE TABLE users (
  id         TEXT PRIMARY KEY,          -- random UUID
  email      TEXT NOT NULL UNIQUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- One row per subscription attempt.
-- polar_subscription_id starts NULL and is filled in by the first webhook.
CREATE TABLE subscriptions (
  id                    TEXT PRIMARY KEY,
  user_id               TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  polar_customer_id     TEXT,
  polar_subscription_id TEXT UNIQUE,      -- null until subscription.created webhook
  polar_checkout_id     TEXT UNIQUE,      -- set at POST /api/checkout/confirm
  polar_product_id      TEXT,
  plan                  TEXT NOT NULL,    -- 'monthly' | 'yearly'
  status                TEXT NOT NULL,    -- see status values below
  current_period_end    TIMESTAMPTZ,
  cancel_at_period_end  BOOLEAN NOT NULL DEFAULT false,
  created_at            TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at            TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- One row per magic link sent. Tokens are hashed; raw token is never stored.
CREATE TABLE magic_links (
  id         TEXT PRIMARY KEY,
  email      TEXT NOT NULL,
  token_hash TEXT NOT NULL UNIQUE,        -- SHA-256 of the raw 32-byte token
  expires_at TIMESTAMPTZ NOT NULL,        -- now() + 15 minutes
  used_at    TIMESTAMPTZ,                 -- null = unused, non-null = consumed
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
```

### Subscription status values

| Status | Meaning | Grants Pro? |
|---|---|---|
| `pending_confirmation` | Checkout verified by Polar API; webhook not yet received | No |
| `active` | Webhook confirmed subscription is live | **Yes** |
| `canceled` | User canceled; access continues until `current_period_end` | No (see note) |
| `past_due` | Payment failed; Polar retrying | No |
| `revoked` | Refunded or manually revoked | No |

> Note: `canceled` subscriptions are currently treated as non-Pro. If you want to honour
> access until the period end, change `/api/auth/me` to also accept `canceled` rows where
> `current_period_end > now()`.

### Key indexes

```sql
CREATE INDEX subscriptions_user_id_idx     ON subscriptions(user_id);
CREATE INDEX subscriptions_customer_id_idx ON subscriptions(polar_customer_id);
CREATE INDEX magic_links_email_idx         ON magic_links(email);
```

---

## 3. JWT and Session Lifecycle

**Library:** `jose` (Edge-compatible — runs in Vercel serverless and edge functions).

**Algorithm:** HS256, signed with `AUTH_SECRET`.

**Cookie name:** `fr_session`

**Cookie attributes:**

```
httpOnly=true   — JavaScript cannot read it (XSS-safe)
secure=true     — HTTPS only (set to false in local dev via NODE_ENV check)
sameSite=lax    — blocks cross-site POST; allows same-site navigation
maxAge=2592000  — 30 days; persistent (survives browser close)
path=/
```

**JWT payload:**

```json
{
  "sub": "<userId>",
  "email": "<email>",
  "iat": 1234567890,
  "exp": 1237159890
}
```

**Session is created in two places:**

1. `POST /api/checkout/confirm` — immediately after purchase, before Polar webhook arrives.
2. `GET /auth/verify?token=xxx` — when user clicks a magic link.

**Session is destroyed in one place:**

- `POST /api/auth/logout` — sets `maxAge=0` on the cookie.

**Expiry enforcement:** `jwtVerify` from `jose` validates the `exp` claim on every request to a
protected route. An expired cookie returns `null` from `verifySession()` and the client gets an
anonymous response.

**Files:**
- `lib/auth.ts` — `signSession`, `verifySession`, `setSessionCookie`, `clearSessionCookie`,
  `getSessionToken`

---

## 4. Purchase Flow

### Step-by-step

```
User clicks "Upgrade" button
      │
      ▼
lib/checkout.ts: startCheckout()
  ├─ Fires GA4: upgrade_clicked, plan_selected, begin_checkout
  ├─ Fires FB pixel: InitiateCheckout
  ├─ Writes pending checkout context to localStorage (fr_checkout_pending)
  └─ Redirects to Polar hosted checkout URL (hardcoded in POLAR_URLS)
         monthly: https://buy.polar.sh/polar_cl_VGeVJ2...
         yearly:  https://buy.polar.sh/polar_cl_flJ14D...

User pays on Polar
      │
      ▼
Polar redirects to: https://figureready.com/success?checkout_id={CHECKOUT_ID}
      │
      ▼
app/success/page.tsx mounts
  └─ POST /api/checkout/confirm  { checkoutId }
        │
        ├─ polar.checkouts.get({ id: checkoutId })   ← server-side Polar API call
        │   └─ Returns confirmed=false if payment incomplete
        │
        ├─ Extracts customerEmail from Polar response (never from client body)
        │
        ├─ Upserts user: INSERT INTO users ... ON CONFLICT (email) DO UPDATE
        │
        ├─ Inserts subscription with status='pending_confirmation'
        │   ON CONFLICT (polar_checkout_id) DO UPDATE SET status='pending_confirmation'
        │
        ├─ Signs JWT, sets fr_session cookie
        │
        └─ Returns { confirmed: true, transactionId, value, currency, plan, authenticated }

/success fires GA4: purchase, purchase_success
/success fires FB pixel: Purchase
/success sets status = 'activating' and begins polling /api/auth/me every 2s

Polar sends subscription.active webhook (typically within seconds)
      │
      ▼
POST /api/webhooks/polar
  └─ upsertSubscription(data, 'active')
       └─ Step 1: UPDATE subscriptions SET polar_subscription_id=..., status='active'
                  WHERE polar_checkout_id=... AND polar_subscription_id IS NULL
       └─ Step 2: INSERT ... ON CONFLICT (polar_subscription_id) DO UPDATE SET status='active'

/success poll detects isPro=true → shows "Welcome to FigureReady Pro!" → links to /app
```

### Polling state machine on /success

| State | Meaning |
|---|---|
| `loading` | Calling `POST /api/checkout/confirm` |
| `activating` | Checkout confirmed, polling for webhook (spinner shown) |
| `confirmed` | `isPro=true` returned from `/api/auth/me` |
| `activation_pending` | 40s elapsed without webhook; "Retry" button shown |
| `unconfirmed` | Polar did not confirm the checkout (payment failed or incomplete) |
| `error` | Network or server error on the confirm call |
| `no-id` | No `checkout_id` in the URL (misconfigured Polar success URL) |

Max polling: 20 attempts × 2 s = 40 s. After timeout, the user can click Retry to restart
polling. Pro is eventually granted once the webhook fires and the user refreshes or retries.

### Replay safety

`ON CONFLICT (polar_checkout_id) DO UPDATE SET status='pending_confirmation'` means:
- Refreshing `/success` is harmless — creates no new rows, issues no new cookies.
- The session cookie is re-set on each confirm call (idempotent).

---

## 5. Webhook Lifecycle

**Endpoint:** `POST /api/webhooks/polar`

**Security:** Every incoming request is verified with `validateEvent()` from
`@polar-sh/sdk/webhooks` using `POLAR_WEBHOOK_SECRET`. Requests with an invalid HMAC signature
return 401. The route always returns 200 on success, even for DB errors (prevents Polar
retry storms on transient failures; errors are logged for manual review).

**Configure in Polar dashboard:**
- URL: `https://figureready.com/api/webhooks/polar`
- Events to enable: all subscription events, order events, refund events

### Event handling table

| Event | Action |
|---|---|
| `subscription.created` | `upsertSubscription(data)` — trusts `data.status` via `mapStatus()` |
| `subscription.updated` | `upsertSubscription(data)` — trusts `data.status` via `mapStatus()` |
| `subscription.active` | `upsertSubscription(data, 'active')` — forces `status='active'` |
| `subscription.canceled` | `upsertSubscription(data, 'canceled')` |
| `subscription.uncanceled` | `upsertSubscription(data, 'active')` |
| `subscription.revoked` | `upsertSubscription(data, 'revoked')` |
| `subscription.past_due` | `upsertSubscription(data, 'past_due')` |
| `order.paid` / `order.created` | Fires FB Conversions API Purchase event |
| `order.refunded` / `refund.created` | `revokeOnRefund(data)` — sets `status='revoked'` |

### Status mapping (`mapStatus`)

| Polar status | DB status |
|---|---|
| `active` | `active` |
| `trialing` | `active` |
| `canceled` | `canceled` |
| `past_due` | `past_due` |
| `unpaid` | `past_due` |
| `paused` | `past_due` |
| anything else | stored as-is |

### Idempotent upsert (two-step)

**Step 1 — reconcile via `polar_checkout_id`:**
Links the `pending_confirmation` row created by `/api/checkout/confirm` to the real subscription
by filling in `polar_subscription_id`. Only runs when `checkoutId` is present in the payload and
the row still has `polar_subscription_id IS NULL`.

**Step 2 — upsert by `polar_subscription_id`:**
`INSERT ... ON CONFLICT (polar_subscription_id) DO UPDATE`. Handles:
- Replayed webhooks (idempotent — same final state)
- Events without `checkoutId` (e.g., renewals, admin actions)
- Cases where Step 1 already linked the row (Step 2 updates status again — harmless)

### Refund handling (`revokeOnRefund`)

Tries three paths to find the subscription to revoke:
1. `data.subscriptionId` (direct field)
2. `data.subscription.id` (nested object)
3. `data.order.subscriptionId` (nested in order)

Falls back to revoking by customer email if no subscription ID is found.

---

## 6. Magic Link (Restore Access) Flow

Used when a user has an active subscription but no session (expired cookie, new browser, new
device). This is the only authentication path — there are no passwords.

```
User submits email in RestoreAccessForm
      │
      ▼
POST /api/auth/magic-link  { email }
  ├─ Validate email format
  ├─ Rate limit: COUNT magic_links WHERE email=? AND created_at > now()-15min
  │   Max 3 per email per 15 min → 429 if exceeded
  ├─ Query subscriptions for active or pending_confirmation row
  │   → Returns { sent: true } if no subscription found (no enumeration)
  ├─ Generate token: 32 random bytes → hex string (64 chars, 256-bit entropy)
  ├─ Store SHA-256(token) in magic_links table with 15-min expiry
  └─ Send email via Resend

User clicks link in email: GET /auth/verify?token=<raw_token>
  ├─ Hash token: SHA-256(token)
  ├─ Look up magic_links WHERE token_hash=?
  ├─ Check used_at IS NULL AND expires_at > now()
  │   → Redirect to /pricing?auth_error=expired_link if invalid
  ├─ Mark used_at = now() (one-time use enforced)
  ├─ Look up user by email
  │   → Redirect to /pricing?auth_error=no_account if not found
  ├─ Sign JWT, set fr_session cookie
  └─ Redirect to /app
```

### Error query parameters on /pricing

| `auth_error` value | Meaning |
|---|---|
| `invalid_link` | Token not found (malformed, already deleted) |
| `expired_link` | Token found but `used_at` is set or `expires_at` is past |
| `no_account` | Token valid but no user row with that email |

### Resend configuration

| Environment | Sender | Recipient |
|---|---|---|
| Production (`RESEND_FROM_EMAIL` set) | `FigureReady <noreply@figureready.com>` | Actual user email |
| Development (env var absent) | `FigureReady <onboarding@resend.dev>` | `RESEND_DEV_RECIPIENT_OVERRIDE` if set, else user email |

The `onboarding@resend.dev` sandbox sender can only deliver to emails verified in your Resend
account. Always set `RESEND_DEV_RECIPIENT_OVERRIDE` in `.env.local` for local testing.

---

## 7. Entitlement Logic

### Server side: `/api/auth/me`

Every request to `/api/auth/me`:
1. Reads `fr_session` cookie.
2. Verifies JWT with `jose`. Returns anonymous if missing or expired.
3. Queries subscriptions for the user, preferring `status='active'` rows:

```sql
SELECT plan, status, current_period_end, cancel_at_period_end
FROM subscriptions
WHERE user_id = $userId
  AND status IN ('active', 'pending_confirmation')
  AND (current_period_end IS NULL OR current_period_end > now())
ORDER BY
  CASE status WHEN 'active' THEN 0 ELSE 1 END,
  created_at DESC
LIMIT 1
```

4. Returns:

```json
{
  "authenticated": true,
  "isPro": false,
  "isPendingActivation": true,
  "plan": "monthly",
  "status": "pending_confirmation",
  "currentPeriodEnd": "2026-09-06T...",
  "cancelAtPeriodEnd": false,
  "email": "user@example.com"
}
```

`isPro` is **only** `true` when `status = 'active'`. `pending_confirmation` sets
`isPendingActivation = true` but `isPro = false` — it never grants access.

### Client side: `lib/usageLimit.ts`

The client maintains a module-level cache populated on app mount:

```typescript
let _cache: EntitlementResult | null = null

// Called once on app mount in app/app/page.tsx
await refreshEntitlement()   // fetches /api/auth/me, stores in _cache

// Used for Pro gate checks throughout the app
getCachedEntitlement().isPro
```

The cache is not persisted (in-memory only). Each app load triggers one fresh fetch. Pro checks
are fast after the initial load.

### Legacy migration

Users who purchased before the auth system was added have `localStorage['figureready-pro'] = '1'`.
On mount, if the server says not Pro but `localStorage` has the legacy flag, a banner is shown
prompting the user to sign in via magic link. Once signed in, the flag can be cleared.

```typescript
if (!entitlement.isPro && hasLegacyProFlag()) {
  setShowRestorePrompt(true)
}
```

### Free tier

The free tier allows one export per browser (tracked in localStorage under `figureready-free-used`).
This is independent of the auth system — no DB involved.

---

## 8. GA4 Analytics Funnel

All events use `window.gtag('event', ...)`. They are no-ops if the GA4 script is not loaded
(e.g., ad blocker). `isDebugMode()` sends `debug_mode: true` in non-production environments and
when `?debug_ga4=1` is in the URL.

### Event sequence for a typical purchase

```
upload_cta_click / sample_cta_click   (user enters the app)
file_upload                           (Excel file dropped)
figure_created                        (chart rendered)
paywall_shown                         (export blocked)
upgrade_clicked                       (upgrade button clicked)
plan_selected                         (plan chosen)
begin_checkout                        (redirecting to Polar)
checkout_opened                       (Polar tab opened)
  [user pays]
purchase                              (GA4 ecommerce, deduped by transactionId)
purchase_success                      (custom event with funnel metadata)
```

### Deduplication

`trackPurchase` checks `localStorage['ga4_purchase_fired_<transactionId>']` before firing.
This prevents duplicate `purchase` events if the user refreshes `/success`.

### Pending checkout context

`startCheckout()` writes a JSON object to `localStorage['fr_checkout_pending']` with the plan,
location, trigger, and user context flags (`figure_created`, `file_uploaded`, `sample_only`).
On `/success`, this is read and forwarded to `purchase_success` so funnel attribution is
preserved across the Polar redirect.

### FB Conversions API (server-side)

The Polar webhook fires a FB Conversions API `Purchase` event on `order.paid` / `order.created`.
The customer email is SHA-256-hashed before sending. This is in addition to (not instead of) the
client-side `fbq('track', 'Purchase')` call on `/success`.

---

## 9. API Reference

### Active routes

| Method | Path | Auth required | Purpose |
|---|---|---|---|
| `POST` | `/api/checkout/confirm` | None | Verify checkout with Polar, create user+subscription, set session cookie |
| `GET` | `/api/auth/me` | Cookie | Return entitlement for current session |
| `POST` | `/api/auth/magic-link` | None | Send magic link email |
| `POST` | `/api/auth/logout` | None | Clear session cookie |
| `POST` | `/api/webhooks/polar` | HMAC signature | Handle all Polar subscription events |
| `GET` | `/auth/verify` | Token in URL | Consume magic link, set session cookie, redirect to /app |

### Legacy routes (not called by current client, do not remove yet)

| Method | Path | Status |
|---|---|---|
| `POST` | `/api/checkout` | Creates a Polar checkout via API (replaced by direct Polar URL links) |
| `GET` | `/api/verify-checkout` | Old checkout verification (replaced by `/api/checkout/confirm`) |

### Request/response examples

**POST /api/checkout/confirm**
```json
// Request
{ "checkoutId": "checkout_abc123" }

// Response (success)
{ "confirmed": true, "transactionId": "checkout_abc123", "value": 12.00, "currency": "EUR", "plan": "monthly", "authenticated": true }

// Response (payment incomplete)
{ "confirmed": false }
```

**GET /api/auth/me**
```json
// Authenticated Pro user
{ "authenticated": true, "isPro": true, "isPendingActivation": false, "plan": "monthly", "status": "active", "currentPeriodEnd": "2026-09-06T00:00:00.000Z", "cancelAtPeriodEnd": false, "email": "user@example.com" }

// Anonymous
{ "authenticated": false, "isPro": false, "isPendingActivation": false, "plan": null, "status": null, "currentPeriodEnd": null, "cancelAtPeriodEnd": false, "email": null }
```

**POST /api/auth/magic-link**
```json
// Request
{ "email": "user@example.com" }

// Always returns this (no enumeration)
{ "sent": true }

// Rate limited
// HTTP 429: { "error": "Too many requests. Please wait 15 minutes before trying again." }
```

---

## 10. Environment Variables

### Required in Vercel (all environments)

| Variable | Example | Purpose |
|---|---|---|
| `DATABASE_URL` | `postgresql://...@ep-xxx.neon.tech/neondb?sslmode=require` | Neon Postgres connection string |
| `AUTH_SECRET` | 64-char random hex | JWT signing secret — never rotate without invalidating all sessions |
| `POLAR_API_KEY` | `polar_sk_...` | Polar API access — server-only, never expose |
| `POLAR_WEBHOOK_SECRET` | `whs_...` | Webhook signature verification |
| `NEXT_PUBLIC_BASE_URL` | `https://figureready.com` | Base URL for magic link generation |
| `RESEND_API_KEY` | `re_...` | Resend email delivery |
| `RESEND_FROM_EMAIL` | `FigureReady <noreply@figureready.com>` | Production sender (requires verified domain) |

### Optional

| Variable | Default | Purpose |
|---|---|---|
| `RESEND_DEV_RECIPIENT_OVERRIDE` | (none) | Redirect all magic link emails to this address in dev |
| `FB_PIXEL_ID` | `206634508997459` | Facebook pixel ID for Conversions API |
| `FB_ACCESS_TOKEN` | (none) | Facebook Conversions API access token |
| `NEXT_PUBLIC_GA_DEBUG` | `false` | Force GA4 debug mode in production |

### Local development (.env.local)

```bash
DATABASE_URL=postgresql://...
AUTH_SECRET=<generate with: openssl rand -hex 32>
POLAR_API_KEY=polar_sk_...
POLAR_WEBHOOK_SECRET=whs_...
NEXT_PUBLIC_BASE_URL=http://localhost:3000
RESEND_API_KEY=re_...
# No RESEND_FROM_EMAIL — uses sandbox sender
RESEND_DEV_RECIPIENT_OVERRIDE=your-email@example.com
```

---

## 11. Deployment Steps

### First deployment

**1. Neon — create database**
- Create a project at neon.tech
- Copy the connection string → set as `DATABASE_URL` in Vercel
- Open the Neon SQL editor and run `scripts/schema.sql`

**2. Generate AUTH_SECRET**
```bash
openssl rand -hex 32
```
Set as `AUTH_SECRET` in Vercel.

**3. Polar — get API key and configure webhook**
- Polar dashboard → Settings → Developers → API Keys → create key with `checkouts:read` and
  `subscriptions:read` scopes minimum
- Set as `POLAR_API_KEY` in Vercel
- Polar dashboard → Webhooks → Add Endpoint:
  - URL: `https://figureready.com/api/webhooks/polar`
  - Events: check all subscription and order events
  - Copy the generated secret → set as `POLAR_WEBHOOK_SECRET` in Vercel
- Confirm that your Polar product success URL is:
  `https://figureready.com/success?checkout_id={CHECKOUT_ID}`
  (the `{CHECKOUT_ID}` placeholder is filled by Polar at checkout time)

**4. Resend — verify domain and configure sender**
- Resend dashboard → Domains → Add Domain → `figureready.com`
- Add the 3 DNS records at your DNS provider:
  - SPF: `TXT @ v=spf1 include:amazonses.com ~all`
  - DKIM: `TXT resend._domainkey <value from Resend>`
  - DMARC: `TXT _dmarc v=DMARC1; p=none`
- Wait for DNS propagation (5–30 min), click Verify in Resend
- Set `RESEND_FROM_EMAIL=FigureReady <noreply@figureready.com>` in Vercel
- Set `RESEND_API_KEY` in Vercel

**5. Set remaining env vars in Vercel**
- `NEXT_PUBLIC_BASE_URL=https://figureready.com`
- `FB_PIXEL_ID` and `FB_ACCESS_TOKEN` if using Meta ads

**6. Deploy**
```bash
git push origin main
```
Vercel deploys automatically on push to main.

**7. Smoke test**
- Complete a test purchase using Polar's test mode
- Confirm `/success` transitions through `activating` → `confirmed`
- Confirm `/api/auth/me` returns `isPro: true` after webhook fires
- Request a magic link with a subscribed email, click it, confirm redirect to `/app`

### Subsequent deployments

```bash
git push origin main
```

No schema migrations required unless you add columns. Add columns with `ALTER TABLE ... ADD COLUMN IF NOT EXISTS`.

---

## 12. Recovery Procedures

### User reports Pro access lost after browser/device change

The session cookie is browser-local. When it expires or the user switches devices, they must use
the magic link flow to restore access.

**Action:** Direct the user to the pricing page. The "Restore Pro access" section sends a magic
link to their subscription email. Clicking it sets a fresh 30-day session cookie.

If their email is not recognized, check the DB:
```sql
SELECT u.email, s.status, s.plan, s.current_period_end
FROM users u JOIN subscriptions s ON s.user_id = u.id
WHERE u.email = 'user@example.com';
```

### Subscription shows pending_confirmation but webhook never arrived

The Polar webhook may have been missed (network error, deployment gap, etc.).

**Check Polar dashboard:** Webhooks → your endpoint → Recent deliveries. Re-deliver any failed
events.

**Manual fix (last resort):**
```sql
UPDATE subscriptions SET status = 'active', updated_at = now()
WHERE polar_checkout_id = '<checkout_id_from_polar>';
```

Verify the subscription is genuinely active in Polar before doing this.

### User refunded but still shows as active

**If Polar webhook delivered the refund event**, `revokeOnRefund` should have set
`status = 'revoked'`. Check the logs and Polar webhook delivery history.

**Manual fix:**
```sql
UPDATE subscriptions SET status = 'revoked', updated_at = now()
WHERE polar_subscription_id = '<id_from_polar>';
```

### AUTH_SECRET rotation

Rotating `AUTH_SECRET` invalidates all existing session cookies immediately. All users will be
logged out. They can re-authenticate via magic link.

Steps:
1. Generate new secret: `openssl rand -hex 32`
2. Update `AUTH_SECRET` in Vercel environment variables
3. Redeploy (Vercel picks up env var changes on next deploy)

Only rotate if the secret is compromised. Treat this as a forced logout for all users.

### Database connection issues

Neon scales to zero after 5 min of inactivity. The first query after a cold start may take
200–800 ms. This is normal for the free tier. Upgrade to a paid Neon plan to disable auto-suspend
if latency is unacceptable.

If all DB queries fail, check:
- `DATABASE_URL` is set correctly in Vercel
- Neon project is not suspended (Neon dashboard → project status)
- Neon IP allowlist (if configured) includes Vercel's egress IPs

---

## 13. Debugging Commands

### Check a user's subscription status

```sql
SELECT u.email, s.status, s.plan, s.current_period_end, s.cancel_at_period_end,
       s.polar_checkout_id, s.polar_subscription_id, s.created_at, s.updated_at
FROM users u
JOIN subscriptions s ON s.user_id = u.id
WHERE u.email = 'user@example.com'
ORDER BY s.created_at DESC;
```

### List all active subscribers

```sql
SELECT u.email, s.plan, s.current_period_end
FROM users u
JOIN subscriptions s ON s.user_id = u.id
WHERE s.status = 'active'
  AND (s.current_period_end IS NULL OR s.current_period_end > now())
ORDER BY s.created_at DESC;
```

### Check magic link status for an email

```sql
SELECT id, email, expires_at, used_at, created_at
FROM magic_links
WHERE email = 'user@example.com'
ORDER BY created_at DESC
LIMIT 10;
```

### Clean up expired unused magic links

```sql
DELETE FROM magic_links
WHERE expires_at < now() AND used_at IS NULL;
```

### Count active subscribers by plan

```sql
SELECT plan, COUNT(*) AS count
FROM subscriptions
WHERE status = 'active'
GROUP BY plan;
```

### Manually grant Pro (emergency only — always verify in Polar first)

```sql
-- By checkout ID (use when subscription.created webhook was missed)
UPDATE subscriptions
SET status = 'active', updated_at = now()
WHERE polar_checkout_id = '<checkout_id>';

-- By email (when checkout ID is unknown)
UPDATE subscriptions s
SET status = 'active', updated_at = now()
FROM users u
WHERE s.user_id = u.id AND u.email = 'user@example.com'
  AND s.status = 'pending_confirmation';
```

### Test magic link in production (without sending email)

```sql
-- 1. Insert a valid token directly (SHA-256 of 'test-token-123')
INSERT INTO magic_links (id, email, token_hash, expires_at)
VALUES (
  gen_random_uuid()::text,
  'user@example.com',
  encode(sha256('test-token-123'), 'hex'),
  now() + interval '15 minutes'
);

-- 2. Visit: https://figureready.com/auth/verify?token=test-token-123
```

### TypeScript type check

```bash
npx tsc --noEmit
```

### Inspect cookie in browser devtools

Open DevTools → Application → Cookies → figureready.com → look for `fr_session`.
The value is a base64url-encoded JWT. Paste it at jwt.io to inspect the payload (the signature
cannot be verified without `AUTH_SECRET`).

### Trigger webhook manually (Polar dashboard)

Polar dashboard → Webhooks → your endpoint → Recent deliveries → click any event →
"Redeliver". Use this to replay a missed webhook without making a new purchase.

### Force GA4 debug mode in production

```
https://figureready.com/app?debug_ga4=1
```

Or in the browser console:
```javascript
sessionStorage.setItem('ga4_debug', '1')
location.reload()
```

Then open GA4 → DebugView to see events in real time.
