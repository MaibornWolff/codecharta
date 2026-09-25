USING OpenEdge.Core.Assert FROM PROPATH.
USING de.sots.cellarsandcentaurs.domain.service.CreatureService FROM PROPATH.
USING de.sots.cellarsandcentaurs.adapter.persistence.PersistedCreatures FROM PROPATH.
USING de.sots.cellarsandcentaurs.adapter.persistence.CreatureRepository FROM PROPATH.
USING de.sots.cellarsandcentaurs.domain.model.* FROM PROPATH.

BLOCK-LEVEL ON ERROR UNDO, THROW.

CLASS de.sots.cellarsandcentaurs.domain.service.CreatureServiceTest:

    DEFINE PRIVATE VARIABLE repository AS CreatureRepository NO-UNDO.
    DEFINE PRIVATE VARIABLE service    AS CreatureService    NO-UNDO.

    @Setup.
    METHOD PUBLIC VOID setUp ():
        repository = NEW CreatureRepository().
        service    = NEW CreatureService(NEW PersistedCreatures(repository)).
    END METHOD.

    @Test.
    METHOD PUBLIC VOID should_save_creature_to_the_stable ():
        DEFINE VARIABLE walking_speed AS Speed    NO-UNDO.
        DEFINE VARIABLE oCreature     AS Creature NO-UNDO.

        walking_speed = NEW Speed(30).
        oCreature = NEW Creature(NEW CreatureId("centaur-1"), CreatureType:Beast).
        oCreature:SetSpeed(SpeedType:Walking, walking_speed).

        service:Save(oCreature).

        Assert:NotNull(repository:FindOne("centaur-1")).
    END METHOD.

END CLASS.
