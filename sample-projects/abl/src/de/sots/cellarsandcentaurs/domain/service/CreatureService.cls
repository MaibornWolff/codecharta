USING de.sots.cellarsandcentaurs.domain.model.Creature FROM PROPATH.
USING de.sots.cellarsandcentaurs.domain.service.Creatures FROM PROPATH.
USING de.sots.cellarsandcentaurs.domain.model.Fightable FROM PROPATH.

BLOCK-LEVEL ON ERROR UNDO, THROW.

CLASS de.sots.cellarsandcentaurs.domain.service.CreatureService:

    DEFINE PRIVATE VARIABLE creatures AS Creatures NO-UNDO.

    CONSTRUCTOR PUBLIC CreatureService (INPUT pCreatures AS Creatures):
        SUPER().
        ASSIGN creatures = pCreatures.
    END CONSTRUCTOR.

    METHOD PUBLIC VOID Save (INPUT pCreature AS Creature):
        LOG-MANAGER:WRITE-MESSAGE("Saving creature " + pCreature:Id:Id, "INFO").
        creatures:Save(pCreature).
    END METHOD.

    METHOD PUBLIC LOGICAL CanFight (INPUT pCreature AS Creature):
        RETURN TYPE-OF(pCreature, Fightable).
    END METHOD.

END CLASS.
