CREATE OR REPLACE PROCEDURE add_order IS
    v NUMBER;
BEGIN
    INSERT INTO orders (id) VALUES (order_seq.NEXTVAL);
    v := order_seq.CURRVAL;
END;
/
