USING Progress.Lang.AppError FROM PROPATH.
USING de.sots.cellarsandcentaurs.domain.model.CreatureId FROM PROPATH.

BLOCK-LEVEL ON ERROR UNDO, THROW.

CLASS de.sots.cellarsandcentaurs.domain.model.NoSuchCreatureException INHERITS AppError:

    CONSTRUCTOR PUBLIC NoSuchCreatureException (INPUT pId AS CreatureId):
        SUPER("No such creature in the dungeon: " + pId:Id, 0).
    END CONSTRUCTOR.

END CLASS.
