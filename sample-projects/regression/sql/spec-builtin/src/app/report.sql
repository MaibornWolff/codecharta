CREATE VIEW report AS
SELECT count(*) AS n, now() AS at, roll() AS r FROM information_schema.tables
JOIN pg_catalog.pg_class c ON c.relname = table_name;
