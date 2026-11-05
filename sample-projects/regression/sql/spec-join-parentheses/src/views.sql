CREATE VIEW open_orders AS
SELECT orders.id, totals.total
FROM status INNER JOIN (customers INNER JOIN (orders LEFT JOIN totals ON orders.id = totals.id)
    ON customers.id = orders.customer_id) ON status.id = orders.status_id;
