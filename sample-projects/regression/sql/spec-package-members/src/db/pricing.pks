CREATE OR REPLACE PACKAGE pricing AS
    c_max CONSTANT NUMBER := 10;
    g_calls NUMBER;
    TYPE t_rec IS RECORD (amount NUMBER);
    CURSOR c_orders IS SELECT id FROM orders;
    e_too_big EXCEPTION;
    FUNCTION total(p_id NUMBER) RETURN NUMBER;
END pricing;
/
