USING de.sots.cellarsandcentaurs.adapter.persistence.CreatureRepository FROM PROPATH.
USING de.sots.cellarsandcentaurs.adapter.persistence.CreatureEntity FROM PROPATH.
USING de.sots.cellarsandcentaurs.domain.service.Creatures FROM PROPATH.
USING de.sots.cellarsandcentaurs.domain.model.Creature FROM PROPATH.
USING de.sots.cellarsandcentaurs.domain.model.CreatureId FROM PROPATH.
USING de.sots.cellarsandcentaurs.domain.model.NoSuchCreatureException FROM PROPATH.
USING de.sots.cellarsandcentaurs.application.CreatureFacade FROM PROPATH.

BLOCK-LEVEL ON ERROR UNDO, THROW.

CLASS de.sots.cellarsandcentaurs.adapter.persistence.PersistedCreatures IMPLEMENTS Creatures:

    DEFINE PRIVATE VARIABLE repository AS CreatureRepository NO-UNDO.

    CONSTRUCTOR PUBLIC PersistedCreatures (INPUT pRepository AS CreatureRepository):
        SUPER().
        ASSIGN repository = pRepository.
    END CONSTRUCTOR.

    METHOD PUBLIC VOID Save (INPUT pCreature AS Creature):
        repository:Save(NEW CreatureEntity(pCreature:Id:Id)).
    END METHOD.

    METHOD PUBLIC Creature Find (INPUT pId AS CreatureId):
        DEFINE VARIABLE oEntity AS CreatureEntity NO-UNDO.
        oEntity = repository:FindOne(pId:Id).
        IF NOT VALID-OBJECT(oEntity) THEN
            UNDO, THROW NEW NoSuchCreatureException(pId).
        RETURN NEW Creature(NEW CreatureId(oEntity:Id), CreatureFacade:STANDARD_CREATURE_TYPE).
    END METHOD.

END CLASS.
