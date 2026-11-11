-- Reply-card misfires in the seven days after release. passed is 1 when the rate is at most 5%.
SELECT SUM(misfire) AS misfires,
       COUNT(*) AS total,
       CASE WHEN SUM(misfire) * 100 <= COUNT(*) * 5 THEN 1 ELSE 0 END AS passed
FROM reply_card_requests;
