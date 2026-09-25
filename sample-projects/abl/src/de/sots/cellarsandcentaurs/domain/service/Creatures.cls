USING de.sots.cellarsandcentaurs.domain.model.Creature FROM PROPATH.
USING de.sots.cellarsandcentaurs.domain.model.CreatureId FROM PROPATH.

INTERFACE de.sots.cellarsandcentaurs.domain.service.Creatures:

    METHOD PUBLIC VOID Save (INPUT pCreature AS Creature).

    METHOD PUBLIC Creature Find (INPUT pId AS CreatureId).

END INTERFACE.
