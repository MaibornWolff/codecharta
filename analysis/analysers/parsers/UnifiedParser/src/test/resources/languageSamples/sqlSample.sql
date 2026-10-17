-- Orders of a shop, written in several dialects
CREATE TABLE orders (id INT, total DECIMAL(10, 2));
CREATE TEMPORARY TABLE order_scratch (id INT);
CREATE VIEW big_orders AS SELECT * FROM orders WHERE total > 100;
ALTER VIEW big_orders AS SELECT * FROM orders WHERE total > 200;
GO

CREATE PROCEDURE dbo.archive_orders @days INT AS
SET NOCOUNT ON;
IF @days > 30 AND @days < 365
    DELETE FROM orders WHERE total IS NULL;
GO

CREATE OR REPLACE FUNCTION order_label(p_total IN NUMBER) RETURN VARCHAR2 IS
BEGIN
    RETURN CASE WHEN p_total > 1000 THEN 'large' ELSE 'small' END;
END order_label;
/

CREATE FUNCTION touch() RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN
    NEW.updated_at := now();
    RETURN NEW;
END;
$$;

CREATE TRIGGER orders_touch BEFORE UPDATE ON orders FOR EACH ROW EXECUTE FUNCTION touch();
