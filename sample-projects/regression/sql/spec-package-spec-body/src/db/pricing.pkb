CREATE OR REPLACE PACKAGE BODY pricing AS
    FUNCTION helper RETURN NUMBER IS
    BEGIN
        RETURN c_max;
    END helper;

    FUNCTION total(p_id NUMBER) RETURN NUMBER IS
        v NUMBER;
    BEGIN
        SELECT id INTO v FROM orders WHERE id = p_id;
        RETURN v + helper();
    END total;
END pricing;
/
