-- T-SQL, tSQLt style
CREATE PROCEDURE CreatureServiceTests.[test should_save_creature_to_the_stable] AS
BEGIN
    EXEC tSQLt.FakeTable 'creature';
    EXEC dbo.CreatureFacade_Create 'c-1', 'Chiron';
    EXEC tSQLt.AssertEquals 1, (SELECT COUNT(*) FROM creature);
END
GO
