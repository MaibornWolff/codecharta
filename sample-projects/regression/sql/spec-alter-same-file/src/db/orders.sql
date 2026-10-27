CREATE TABLE orders (id INT, customer_id INT);
ALTER TABLE orders ADD FOREIGN KEY (customer_id) REFERENCES customers (id);
