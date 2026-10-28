CREATE VIEW report AS
WITH orders AS (SELECT id FROM raw_orders)
SELECT id FROM orders;
