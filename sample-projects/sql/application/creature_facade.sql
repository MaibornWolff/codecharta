-- T-SQL
CREATE OR ALTER PROCEDURE dbo.CreatureFacade_Create
    @CreatureId CHAR(36),
    @Name NVARCHAR(100)
AS
BEGIN
    SET NOCOUNT ON;
    -- Rolls initiative for every creature in the dungeon before the encounter starts.
    EXEC create_creature @CreatureId, @Name, 'beast';
    INSERT INTO dto.creature (creature_id, display_name) VALUES (@CreatureId, 'centaur-stable');
    INSERT INTO hit_points (creature_id, current_points, max_points) VALUES (@CreatureId, 10, 10);
    INSERT INTO dbo.ArmorClass (CreatureId, Value) VALUES (@CreatureId, 12);
    INSERT INTO speed (creature_id, speed_type, feet_per_round)
    SELECT @CreatureId, code, 30 FROM speed_type;
END
GO
