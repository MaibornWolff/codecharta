-- Orders and their customers
CREATE TABLE customers (
    id INT PRIMARY KEY,
    name VARCHAR(100) NOT NULL
);

CREATE TABLE orders (
    id INT PRIMARY KEY,
    customer_id INT REFERENCES customers (id),
    total DECIMAL(10, 2)
);

/* Orders above a threshold */
CREATE VIEW big_orders AS
    SELECT o.id, c.name FROM orders o JOIN customers c ON c.id = o.customer_id WHERE o.total > 100;

CREATE PROCEDURE dbo.archive_orders @days INT, @dry_run BIT = 0
AS
BEGIN
    IF @dry_run = 1 AND @days > 0
        SELECT COUNT(*) FROM orders;
    ELSE
        DELETE FROM orders WHERE total IS NULL;
END
GO

CREATE OR REPLACE FUNCTION order_label(p_total IN NUMBER) RETURN VARCHAR2 IS
BEGIN
    CASE
        WHEN p_total > 1000 THEN RETURN 'large';
        WHEN p_total > 100 THEN RETURN 'medium';
        ELSE RETURN 'small';
    END CASE;
EXCEPTION
    WHEN OTHERS THEN RETURN 'unknown';
END order_label;
/

CREATE FUNCTION touch() RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN
    FOR r IN SELECT id FROM orders LOOP
        PERFORM log_change(r.id);
    END LOOP;
    RETURN NEW;
END;
$$;
