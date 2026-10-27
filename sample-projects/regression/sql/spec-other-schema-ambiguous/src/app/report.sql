CREATE PROCEDURE report AS
BEGIN
    SELECT id FROM orders;
    SELECT id FROM customers;
END
GO
