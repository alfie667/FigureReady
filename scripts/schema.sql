-- FigureReady — run once in the Neon console to create the schema

CREATE TABLE IF NOT EXISTS users (
  id         TEXT PRIMARY KEY,
  email      TEXT NOT NULL UNIQUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS subscriptions (
  id                    TEXT PRIMARY KEY,
  user_id               TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  polar_customer_id     TEXT,
  polar_subscription_id TEXT UNIQUE,       -- null until subscription.created webhook fires
  polar_checkout_id     TEXT UNIQUE,       -- set at checkout confirm; used to reconcile webhook
  polar_product_id      TEXT,
  plan                  TEXT NOT NULL,     -- 'monthly' | 'yearly'
  status                TEXT NOT NULL,     -- 'pending_confirmation' | 'active' | 'canceled' | 'past_due' | 'revoked'
  current_period_end    TIMESTAMPTZ,
  cancel_at_period_end  BOOLEAN NOT NULL DEFAULT false,
  created_at            TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at            TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS subscriptions_user_id_idx        ON subscriptions(user_id);
CREATE INDEX IF NOT EXISTS subscriptions_customer_id_idx    ON subscriptions(polar_customer_id);

CREATE TABLE IF NOT EXISTS magic_links (
  id         TEXT PRIMARY KEY,
  email      TEXT NOT NULL,
  token_hash TEXT NOT NULL UNIQUE,
  expires_at TIMESTAMPTZ NOT NULL,
  used_at    TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS magic_links_email_idx ON magic_links(email);
