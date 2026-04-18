CREATE TABLE IF NOT EXISTS rum_events (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  session_id TEXT NOT NULL,
  page_path TEXT NOT NULL,
  lab_id TEXT,
  mode TEXT NOT NULL,
  device_type TEXT NOT NULL,
  browser TEXT NOT NULL,
  metric_name TEXT NOT NULL,
  metric_value REAL NOT NULL,
  metadata TEXT,
  sdk_version TEXT NOT NULL,
  referrer TEXT,
  created_at TEXT NOT NULL,
  inserted_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_rum_created_at ON rum_events(created_at);
CREATE INDEX IF NOT EXISTS idx_rum_lab_metric ON rum_events(lab_id, metric_name);
CREATE INDEX IF NOT EXISTS idx_rum_session ON rum_events(session_id);

CREATE TABLE IF NOT EXISTS feedback (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  page_path TEXT NOT NULL,
  lab_id TEXT,
  rating TEXT NOT NULL CHECK (rating IN ('good', 'bad')),
  comment TEXT,
  session_id TEXT,
  user_agent TEXT,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_feedback_created_at ON feedback(created_at);
