CREATE PROCEDURE dbo.report AS
BEGIN
    SELECT id FROM sales.orders;
    SELECT id FROM hr.refunds;
    SELECT id FROM hr.customers;
END
GO
