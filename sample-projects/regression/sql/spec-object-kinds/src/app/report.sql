CREATE VIEW report AS
SELECT o.id, order_total() AS total, nextval('order_seq') AS ticket FROM orders o
JOIN big_orders b ON b.id = o.id CROSS JOIN order_count;
CREATE FUNCTION cheer(m mood, q positive_int) RETURNS INT AS $$ SELECT q $$ LANGUAGE sql;
