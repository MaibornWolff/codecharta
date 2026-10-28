CREATE OR REPLACE PROCEDURE touch IS
BEGIN
    UPDATE order_entity SET id = id;
    DELETE FROM all_orders WHERE id < 0;
END;
/
