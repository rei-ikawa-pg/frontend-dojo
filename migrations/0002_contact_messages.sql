-- サイト内お問い合わせフォーム (/contact) から送信されるメッセージ。

CREATE TABLE IF NOT EXISTS contact_messages (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  category TEXT NOT NULL CHECK (category IN ('suggestion', 'bug', 'content', 'other')),
  body TEXT NOT NULL,
  email TEXT,
  page_path TEXT,
  session_id TEXT,
  user_agent TEXT,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_contact_created_at ON contact_messages(created_at);
CREATE INDEX IF NOT EXISTS idx_contact_category ON contact_messages(category);
