ALTER TABLE orders ADD FOREIGN KEY (customer_id) REFERENCES customers (id);
