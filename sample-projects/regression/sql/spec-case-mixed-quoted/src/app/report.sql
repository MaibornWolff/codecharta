CREATE VIEW report AS SELECT o.id FROM orders o JOIN customers c ON c.id = o.id;
