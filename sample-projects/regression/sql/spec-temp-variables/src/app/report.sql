CREATE PROCEDURE dbo.report @orders INT AS
BEGIN
    DECLARE @totals TABLE (id INT);
    CREATE TABLE #orders (id INT);
    INSERT INTO #orders SELECT id FROM dbo.orders;
    INSERT INTO @totals SELECT id FROM #orders;
END
GO
