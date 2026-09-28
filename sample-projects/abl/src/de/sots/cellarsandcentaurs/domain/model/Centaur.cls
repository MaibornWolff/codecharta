USING de.sots.cellarsandcentaurs.domain.model.Creature FROM PROPATH.
USING de.sots.cellarsandcentaurs.domain.model.CreatureId FROM PROPATH.
USING de.sots.cellarsandcentaurs.domain.model.CreatureType FROM PROPATH.

BLOCK-LEVEL ON ERROR UNDO, THROW.

CLASS de.sots.cellarsandcentaurs.domain.model.Centaur INHERITS Creature:

    DEFINE PUBLIC PROPERTY BowRange AS INTEGER NO-UNDO INITIAL 150
        GET.
        SET.

    CONSTRUCTOR PUBLIC Centaur (INPUT pId AS CreatureId):
        SUPER(pId, CreatureType:Monstrosity).
    END CONSTRUCTOR.

    METHOD PUBLIC OVERRIDE INTEGER Attack ():
        RETURN SUPER:Attack() + BowRange.
    END METHOD.

END CLASS.
