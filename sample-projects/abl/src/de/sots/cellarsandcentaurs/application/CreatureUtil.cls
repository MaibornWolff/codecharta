USING de.sots.cellarsandcentaurs.domain.model.* FROM PROPATH.
USING de.sots.cellarsandcentaurs.domain.model.Fightable FROM PROPATH.

BLOCK-LEVEL ON ERROR UNDO, THROW.

CLASS de.sots.cellarsandcentaurs.application.CreatureUtil:

    DEFINE PUBLIC STATIC PROPERTY STANDARD_ARMOR_CLASS_DESCRIPTION AS CHARACTER NO-UNDO INITIAL "Natural Armor"
        GET.
        PRIVATE SET.

    /* Counts the treasure hoard a creature guards. */
    METHOD PUBLIC STATIC INTEGER CountTreasure (INPUT pCreature AS Creature):
        RETURN pCreature:XPValue * 10.
    END METHOD.

    METHOD PUBLIC STATIC LOGICAL IsFast (INPUT pCreature AS Creature):
        DEFINE VARIABLE oSpeed AS Speed NO-UNDO.
        oSpeed = pCreature:GetSpeed(SpeedType:Walking).
        RETURN oSpeed:Value > 30.
    END METHOD.

    METHOD PUBLIC STATIC INTEGER BowRangeOf (INPUT pCreature AS Creature):
        RETURN CAST(pCreature, Centaur):BowRange.
    END METHOD.

END CLASS.
