-- PL/pgSQL edge cases, one routine per construct

CREATE FUNCTION edge_foreach(p_rolls INT[]) RETURNS INT LANGUAGE plpgsql AS $$
DECLARE
    v_roll INT;
    v_sum INT := 0;
BEGIN
    FOREACH v_roll IN ARRAY p_rolls LOOP
        v_sum := v_sum + v_roll;
    END LOOP;
    RETURN v_sum;
END;
$$;

CREATE FUNCTION edge_exit_when(p_n INT) RETURNS INT LANGUAGE plpgsql AS $$
BEGIN
    LOOP
        p_n := p_n - 1;
        CONTINUE WHEN p_n = 5;
        EXIT WHEN p_n <= 0;
    END LOOP;
    RETURN p_n;
END;
$$;

CREATE FUNCTION edge_exception(p_id INT) RETURNS INT LANGUAGE plpgsql AS $$
BEGIN
    RETURN 1 / p_id;
EXCEPTION
    WHEN division_by_zero OR numeric_value_out_of_range THEN RETURN 0;
    WHEN OTHERS THEN RETURN -1;
END;
$$;

CREATE FUNCTION edge_tagged_body() RETURNS TEXT LANGUAGE plpgsql AS $body$
BEGIN
    IF now() IS NOT NULL THEN
        RETURN $$a string in dollar quotes$$;
    END IF;
    RETURN 'none';
END;
$body$;

CREATE FUNCTION edge_sql_string_body(p_hp INT) RETURNS TEXT LANGUAGE sql AS 'SELECT CASE WHEN p_hp > 0 THEN ''alive'' END';

CREATE FUNCTION edge_variadic(VARIADIC p_rolls INT[]) RETURNS INT LANGUAGE sql AS $$ SELECT sum(r) FROM unnest(p_rolls) r $$;

DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM creature) THEN
        RAISE NOTICE 'creatures roam the cellar';
    END IF;
END
$$;

SELECT COALESCE(NULLIF(name, ''), 'nameless') FROM creature;

SELECT '-- not a comment', E'it\'s /* not */ a comment';
