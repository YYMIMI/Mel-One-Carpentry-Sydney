CREATE TABLE IF NOT EXISTS leads (
  id TEXT PRIMARY KEY,
  idem_key TEXT NOT NULL UNIQUE,
  payload_digest TEXT NOT NULL,
  state TEXT NOT NULL CHECK (state IN ('UPLOADING','ACCEPTED')),
  service_id TEXT NOT NULL,
  locale TEXT NOT NULL,
  suburb TEXT NOT NULL,
  description TEXT NOT NULL,
  phone TEXT NOT NULL,
  email TEXT NOT NULL,
  contact_time TEXT NOT NULL,
  reply_language TEXT NOT NULL,
  attribution_json TEXT NOT NULL,
  photos_json TEXT NOT NULL DEFAULT '[]',
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE TABLE IF NOT EXISTS outbox (
  lead_id TEXT PRIMARY KEY REFERENCES leads(id) ON DELETE CASCADE,
  status TEXT NOT NULL CHECK (status IN ('PENDING','RETRY','DELIVERED')),
  attempts INTEGER NOT NULL DEFAULT 0,
  next_at INTEGER NOT NULL DEFAULT 0,
  lease_until INTEGER NOT NULL DEFAULT 0,
  last_error TEXT,
  delivered_at TEXT
);
CREATE TABLE IF NOT EXISTS rate_bucket (
  fingerprint TEXT NOT NULL,
  window_start INTEGER NOT NULL,
  hits INTEGER NOT NULL,
  PRIMARY KEY (fingerprint, window_start)
);
CREATE INDEX IF NOT EXISTS idx_outbox_retry ON outbox(status, next_at, lease_until);
