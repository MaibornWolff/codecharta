CREATE PROCEDURE dbo.report AS
BEGIN
    SELECT id FROM warehouse.dbo.orders;
END
GO
