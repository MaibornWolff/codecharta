-- T-SQL edge cases, one routine per construct

CREATE PROCEDURE edge_try_catch AS
BEGIN
    BEGIN TRY
        EXEC dbo.roll_initiative;
    END TRY
    BEGIN CATCH
        THROW;
    END CATCH
END
GO

CREATE PROCEDURE edge_else_if_chain @roll INT AS
BEGIN
    IF @roll = 1 SELECT 'miss'
    ELSE IF @roll = 20 SELECT 'critical'
    ELSE IF @roll > 10 SELECT 'hit'
    ELSE SELECT 'graze'
END
GO

CREATE FUNCTION edge_iif(@hp INT) RETURNS NVARCHAR(10) AS
BEGIN
    RETURN IIF(@hp > 0, N'alive', N'dead')
END
GO

CREATE PROCEDURE edge_while_break @n INT AS
BEGIN
    WHILE @n > 0
    BEGIN
        SET @n = @n - 1
        IF @n = 5 CONTINUE
        IF @n = 2 BREAK
    END
END
GO

CREATE PROCEDURE edge_goto AS
BEGIN
    GOTO done
    SELECT 1
done:
    RETURN
END
GO

CREATE PROCEDURE edge_nested_comment AS
BEGIN
    /* outer /* inner */ still outer */
    SELECT 1
END
GO

CREATE PROCEDURE edge_comment_in_string AS
BEGIN
    SELECT '-- not a comment', '/* nor this */'
END
GO

CREATE PROCEDURE edge_default_and_output @roll INT = 10, @result INT OUTPUT AS
BEGIN
    SET @result = @roll
END
GO

CREATE PROCEDURE edge_dynamic_sql AS
BEGIN
    EXEC sp_executesql N'IF 1 = 1 SELECT 1'
END
GO

CREATE PROCEDURE edge_without_begin AS
SET NOCOUNT ON;
IF EXISTS (SELECT 1 FROM creature) SELECT 1;
GO

CREATE TRIGGER edge_trigger ON dbo.creature AFTER UPDATE AS
BEGIN
    IF UPDATE(name) PRINT 'renamed'
END
GO

CREATE VIEW edge_case_in_query AS
SELECT name FROM creature
WHERE CASE WHEN XPValue > 100 THEN 1 WHEN d20Roll = 20 THEN 1 ELSE 0 END = 1
GO
