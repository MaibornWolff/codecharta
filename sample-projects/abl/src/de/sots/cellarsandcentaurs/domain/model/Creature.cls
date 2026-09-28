/*------------------------------------------------------------------------
    File        : Creature.cls
    Purpose     : A creature that roams the cellar. Centaurs, beasts and dragons all share hit points, armor class and speeds.
  ----------------------------------------------------------------------*/
USING de.sots.cellarsandcentaurs.domain.model.CreatureId FROM PROPATH.
USING de.sots.cellarsandcentaurs.domain.model.CreatureType FROM PROPATH.
USING de.sots.cellarsandcentaurs.domain.model.ArmorClass FROM PROPATH.
USING de.sots.cellarsandcentaurs.domain.model.HitPoints FROM PROPATH.
USING de.sots.cellarsandcentaurs.domain.model.Speed FROM PROPATH.
USING de.sots.cellarsandcentaurs.domain.model.SpeedType FROM PROPATH.
USING de.sots.cellarsandcentaurs.domain.model.Fightable FROM PROPATH.
USING de.sots.cellarsandcentaurs.application.CreatureFacade FROM PROPATH.

BLOCK-LEVEL ON ERROR UNDO, THROW.

CLASS de.sots.cellarsandcentaurs.domain.model.Creature IMPLEMENTS Fightable:

    DEFINE PRIVATE TEMP-TABLE ttSpeed NO-UNDO
        FIELD speedType  AS CHARACTER
        FIELD speedValue AS INTEGER
        INDEX idxSpeedType IS PRIMARY UNIQUE speedType.

    DEFINE PUBLIC PROPERTY Id AS CreatureId NO-UNDO
        GET.
        SET.

    DEFINE PUBLIC PROPERTY Type AS CreatureType NO-UNDO
        GET.
        SET.

    DEFINE PUBLIC PROPERTY ArmorClass AS ArmorClass NO-UNDO
        GET.
        SET.

    DEFINE PUBLIC PROPERTY HitPoints AS HitPoints NO-UNDO
        GET.
        SET.

    DEFINE PUBLIC PROPERTY XPValue AS INTEGER NO-UNDO INITIAL 0
        GET.
        SET.

    CONSTRUCTOR PUBLIC Creature (INPUT pId AS CreatureId):
        THIS-OBJECT(pId, CreatureFacade:STANDARD_CREATURE_TYPE).
    END CONSTRUCTOR.

    CONSTRUCTOR PUBLIC Creature (INPUT pId AS CreatureId, INPUT pType AS CreatureType):
        SUPER().
        ASSIGN
            Id   = pId
            Type = pType.
    END CONSTRUCTOR.

    METHOD PUBLIC VOID SetSpeed (INPUT pSpeedType AS SpeedType, INPUT pSpeed AS Speed):
        FIND ttSpeed WHERE ttSpeed.speedType = STRING(pSpeedType) NO-ERROR.
        IF NOT AVAILABLE ttSpeed THEN
        DO:
            CREATE ttSpeed.
            ASSIGN ttSpeed.speedType = STRING(pSpeedType).
        END.
        ASSIGN ttSpeed.speedValue = pSpeed:Value.
    END METHOD.

    METHOD PUBLIC Speed GetSpeed (INPUT pSpeedType AS SpeedType):
        FIND ttSpeed WHERE ttSpeed.speedType = STRING(pSpeedType) NO-ERROR.
        IF NOT AVAILABLE ttSpeed THEN
            RETURN NEW Speed(0).
        RETURN NEW Speed(ttSpeed.speedValue).
    END METHOD.

    METHOD PUBLIC INTEGER Attack ():
        RETURN ArmorClass:Total.
    END METHOD.

END CLASS.
