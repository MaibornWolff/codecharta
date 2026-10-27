CREATE SEQUENCE order_seq;
CREATE TYPE mood AS ENUM ('calm', 'angry');
CREATE DOMAIN positive_int AS INT CHECK (VALUE > 0);
CREATE TABLE orders (id INT DEFAULT nextval('order_seq'), quantity positive_int, buyer_mood mood);
CREATE VIEW big_orders AS SELECT id FROM orders WHERE quantity > 10;
CREATE MATERIALIZED VIEW order_count AS SELECT count(*) AS total FROM big_orders;
CREATE FUNCTION order_total() RETURNS BIGINT AS $$ SELECT total FROM order_count $$ LANGUAGE sql;
