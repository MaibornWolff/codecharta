USING de.sots.cellarsandcentaurs.domain.service.CreatureService FROM PROPATH.
USING de.sots.cellarsandcentaurs.domain.model.Creature FROM PROPATH.
USING de.sots.cellarsandcentaurs.domain.model.CreatureId FROM PROPATH.
USING de.sots.cellarsandcentaurs.domain.model.CreatureType FROM PROPATH.
USING de.sots.cellarsandcentaurs.domain.model.HitPoints FROM PROPATH.
USING de.sots.cellarsandcentaurs.domain.model.Speed FROM PROPATH.
USING de.sots.cellarsandcentaurs.domain.model.SpeedType FROM PROPATH.
USING de.sots.cellarsandcentaurs.domain.model.ArmorClass FROM PROPATH.

BLOCK-LEVEL ON ERROR UNDO, THROW.

CLASS de.sots.cellarsandcentaurs.application.CreatureFacade:

    DEFINE PUBLIC STATIC PROPERTY STANDARD_CREATURE_TYPE AS CreatureType NO-UNDO
        GET.
        PRIVATE SET.

    DEFINE PRIVATE STATIC PROPERTY STABLE_NAME AS CHARACTER NO-UNDO INITIAL "centaur-stable"
        GET.
        PRIVATE SET.

    DEFINE PRIVATE VARIABLE creatureService AS CreatureService NO-UNDO.

    CONSTRUCTOR STATIC CreatureFacade ():
        ASSIGN STANDARD_CREATURE_TYPE = CreatureType:Monstrosity.
    END CONSTRUCTOR.

    CONSTRUCTOR PUBLIC CreatureFacade (INPUT pCreatureService AS CreatureService):
        SUPER().
        ASSIGN creatureService = pCreatureService.
    END CONSTRUCTOR.

    METHOD PUBLIC Creature Create (INPUT pType         AS CreatureType,
                                   INPUT walkingSpeed  AS Speed,
                                   INPUT flyingSpeed   AS Speed,
                                   INPUT swimmingSpeed AS Speed,
                                   INPUT burrowSpeed   AS Speed,
                                   INPUT climbSpeed    AS Speed,
                                   INPUT pArmorClass   AS ArmorClass,
                                   INPUT pHitPoints    AS INTEGER):
        DEFINE VARIABLE oCreature AS Creature NO-UNDO.
        DEFINE VARIABLE oDto      AS de.sots.cellarsandcentaurs.application.dto.Creature NO-UNDO.

        // Rolls initiative for every creature in the dungeon before the encounter starts.
        oCreature = NEW Creature(NEW CreatureId(GUID(GENERATE-UUID)), pType).
        oCreature:ArmorClass = pArmorClass.
        oCreature:HitPoints  = HitPoints:Init(pHitPoints).
        oCreature:SetSpeed(SpeedType:Walking,   walkingSpeed).
        oCreature:SetSpeed(SpeedType:Flying,    flyingSpeed).
        oCreature:SetSpeed(SpeedType:Swimming,  swimmingSpeed).
        oCreature:SetSpeed(SpeedType:Burrowing, burrowSpeed).
        oCreature:SetSpeed(SpeedType:Climbing,  climbSpeed).

        creatureService:Save(oCreature).
        oDto = NEW de.sots.cellarsandcentaurs.application.dto.Creature(oCreature:Id:Id, STABLE_NAME).
        LOG-MANAGER:WRITE-MESSAGE("Created " + oDto:Name + " in " + oDto:Stable, "INFO").
        RETURN oCreature.
    END METHOD.

    METHOD PUBLIC Creature CreateCentaur (INPUT pId AS CreatureId):
        RETURN CAST(Progress.Lang.Class:GetClass("de.sots.cellarsandcentaurs.domain.model.Centaur"):New(pId), Creature).
    END METHOD.

END CLASS.
