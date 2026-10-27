CREATE FUNCTION report() RETURNS INT AS $$
DECLARE
    v_count INT;
BEGIN
    CREATE TEMP TABLE scratch AS SELECT id FROM orders;
    WITH totals AS (SELECT id FROM scratch)
    SELECT count(*) INTO v_count FROM totals;
    RETURN v_count;
END $$ LANGUAGE plpgsql;
