CREATE VIEW report AS
SELECT o.id FROM ORDERS o
JOIN "orders" p ON p.id = o.id
JOIN "Zentaurenhöhle" z ON z.id = o.id;
