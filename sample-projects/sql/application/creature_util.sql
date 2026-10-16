-- T-SQL
/* Counts the treasure hoard a creature guards. */
CREATE FUNCTION dbo.treasure_hoard(@CreatureId CHAR(36)) RETURNS INT AS
BEGIN
    DECLARE @hoard INT;
    SELECT @hoard = COUNT(*) FROM creature_overview WHERE creature_id = @CreatureId;
    RETURN @hoard;
END
GO

CREATE VIEW creature_treasure AS
SELECT creature_id, dbo.treasure_hoard(creature_id) AS hoard FROM creature;
GO
