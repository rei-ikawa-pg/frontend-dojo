-- feedback / contact_messages の User-Agent を生文字列保存 → 分類ラベルのみ保存へ切替。
-- 個人特定性の低減（docs/05 §2.6 RUM 方針に揃える）。

ALTER TABLE feedback ADD COLUMN browser TEXT;
ALTER TABLE feedback ADD COLUMN os TEXT;
ALTER TABLE feedback ADD COLUMN device_type TEXT;

ALTER TABLE contact_messages ADD COLUMN browser TEXT;
ALTER TABLE contact_messages ADD COLUMN os TEXT;
ALTER TABLE contact_messages ADD COLUMN device_type TEXT;

-- 既存の生 UA 文字列は fingerprint 性があるため破棄（列自体は今後の互換のため残す）。
UPDATE feedback SET user_agent = NULL;
UPDATE contact_messages SET user_agent = NULL;
