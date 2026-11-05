CREATE TABLE status (id INT);
CREATE TABLE customers (id INT);
CREATE TABLE orders (id INT, customer_id INT, status_id INT);
CREATE TABLE totals (id INT, total INT);
