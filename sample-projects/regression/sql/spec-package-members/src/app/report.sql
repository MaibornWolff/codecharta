CREATE OR REPLACE PROCEDURE report IS
    r pricing.t_rec;
BEGIN
    r.amount := pricing.c_max;
    pricing.g_calls := 0;
    FOR o IN pricing.c_orders LOOP
        NULL;
    END LOOP;
EXCEPTION
    WHEN pricing.e_too_big THEN
        NULL;
END;
/
