ALTER TABLE orders ADD CONSTRAINT orders_customer FOREIGN KEY (customer_id) REFERENCES customers (id);
CREATE INDEX orders_by_customer ON orders (customer_id);
