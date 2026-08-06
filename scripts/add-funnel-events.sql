-- FigureReady — run in Neon console after schema.sql
-- Adds the funnel_events table for the /admin/funnel dashboard.

CREATE TABLE IF NOT EXISTS funnel_events (
  id           TEXT        PRIMARY KEY,
  event_name   TEXT        NOT NULL,     -- 'checkout_opened' | 'purchase' | 'checkout_returned_without_purchase'
  plan         TEXT,                     -- 'monthly' | 'yearly'
  source       TEXT,                     -- checkout_source / location
  device_type  TEXT,                     -- 'mobile' | 'desktop'
  screen_width INT,
  duration_s   INT,                      -- seconds from checkout open to return/purchase
  abandon_type TEXT,                     -- 'immediate' (<10s) | 'normal' | 'high_intent' (>60s)
  created_at   TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS funnel_events_name_idx    ON funnel_events(event_name);
CREATE INDEX IF NOT EXISTS funnel_events_created_idx ON funnel_events(created_at);
