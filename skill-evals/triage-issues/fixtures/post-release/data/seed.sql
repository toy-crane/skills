CREATE TABLE reply_card_requests (id INTEGER PRIMARY KEY, created_at TEXT, misfire INTEGER);
WITH RECURSIVE n(i) AS (SELECT 1 UNION ALL SELECT i + 1 FROM n WHERE i < 702)
INSERT INTO reply_card_requests (id, created_at, misfire)
SELECT i, '2026-11-1' || (i % 7 + 1), CASE WHEN i % 17 = 0 THEN 1 ELSE 0 END FROM n;
