USING Progress.Lang.Object FROM PROPATH.
USING Progress.Json.ObjectModel.JsonObject FROM PROPATH.
USING de.sots.cellarsandcentaurs.adapter.persistence.CreatureEntity FROM PROPATH.

BLOCK-LEVEL ON ERROR UNDO, THROW.

CLASS de.sots.cellarsandcentaurs.adapter.persistence.CreatureRepository:

    DEFINE PRIVATE TEMP-TABLE ttCreature NO-UNDO
        FIELD creatureId AS CHARACTER
        FIELD entity     AS Object
        INDEX idxCreatureId IS PRIMARY UNIQUE creatureId.

    METHOD PUBLIC VOID Save (INPUT pEntity AS CreatureEntity):
        FIND ttCreature WHERE ttCreature.creatureId = pEntity:Id NO-ERROR.
        IF NOT AVAILABLE ttCreature THEN
        DO:
            CREATE ttCreature.
            ASSIGN ttCreature.creatureId = pEntity:Id.
        END.
        ASSIGN ttCreature.entity = pEntity.
    END METHOD.

    METHOD PUBLIC CreatureEntity FindOne (INPUT pId AS CHARACTER):
        FIND ttCreature WHERE ttCreature.creatureId = pId NO-ERROR.
        IF NOT AVAILABLE ttCreature THEN
            RETURN ?.
        RETURN CAST(ttCreature.entity, CreatureEntity).
    END METHOD.

    METHOD PUBLIC JsonObject ToJson ():
        DEFINE VARIABLE oJson AS JsonObject NO-UNDO.
        oJson = NEW JsonObject().
        oJson:Add("count", 0).
        RETURN oJson.
    END METHOD.

END CLASS.
