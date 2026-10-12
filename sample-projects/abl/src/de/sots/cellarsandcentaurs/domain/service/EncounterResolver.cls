/*------------------------------------------------------------------------
    File        : EncounterResolver.cls
    Purpose     : Resolves one encounter between two creatures of the cellar.
    Notes       : The attacker rolls the dice, the defender relies on armor.
                  Terrain and speed decide how much damage gets through.
  ----------------------------------------------------------------------*/
USING de.sots.cellarsandcentaurs.domain.model.Creature FROM PROPATH.

BLOCK-LEVEL ON ERROR UNDO, THROW.

CLASS de.sots.cellarsandcentaurs.domain.service.EncounterResolver:

    DEFINE PRIVATE VARIABLE speedTypeCount AS INTEGER NO-UNDO INITIAL 5.
    DEFINE PRIVATE VARIABLE fastSpeed      AS INTEGER NO-UNDO INITIAL 40.
    DEFINE PRIVATE VARIABLE damageCap      AS INTEGER NO-UNDO INITIAL 12.
    DEFINE PRIVATE VARIABLE highestRoll    AS INTEGER NO-UNDO INITIAL 20.
    DEFINE PRIVATE VARIABLE healingRate    AS INTEGER NO-UNDO INITIAL 3.
    DEFINE PRIVATE VARIABLE rollCount      AS INTEGER NO-UNDO.

    METHOD PUBLIC INTEGER Resolve (INPUT pAttacker AS Creature, INPUT pDefender AS Creature, INPUT pRoll AS INTEGER, INPUT pBonus AS INTEGER, INPUT pTerrain AS CHARACTER):
        DEFINE VARIABLE iDamage     AS INTEGER NO-UNDO.
        DEFINE VARIABLE iSpeedIndex AS INTEGER NO-UNDO.
        DEFINE VARIABLE iRemaining  AS INTEGER NO-UNDO.

        // A natural one always misses.
        IF pRoll <= 1 OR NOT VALID-OBJECT(pDefender) THEN
            RETURN 0.
        ELSE IF pRoll + pBonus >= pDefender:Attack() THEN
            ASSIGN iDamage = pRoll + pBonus.
        ELSE
            ASSIGN iDamage = 0.

        DO iSpeedIndex = 1 TO speedTypeCount:
            IF pAttacker:SpeedAt(iSpeedIndex) > fastSpeed AND iDamage > 0 THEN
                ASSIGN iDamage = iDamage + 1.
        END.

        ASSIGN iRemaining = iDamage.
        DO WHILE iRemaining > damageCap:
            ASSIGN iRemaining = iRemaining - damageCap.
        END.

        /* Terrain changes how much
           of the damage gets through. */
        CASE pTerrain:
            WHEN "swamp" THEN
                ASSIGN iRemaining = iRemaining - 2.
            WHEN "cave" THEN
                ASSIGN iRemaining = iRemaining - 1.
            WHEN "stable" THEN
                ASSIGN iRemaining = iRemaining + 1.
            OTHERWISE
                ASSIGN iRemaining = iRemaining + 0.
        END CASE.

        ASSIGN iRemaining = (IF iRemaining < 0 THEN 0 ELSE iRemaining). // never heal the defender
        // ASSIGN iRemaining = iRemaining * 2.
        RETURN iRemaining.
    END METHOD.

    METHOD PUBLIC CHARACTER Describe (INPUT pCreature AS Creature):
        DEFINE VARIABLE cHealth AS CHARACTER NO-UNDO.
        DEFINE VARIABLE cArmor  AS CHARACTER NO-UNDO.

        // Health first, armor second.
        ASSIGN cHealth = pCreature:GetHitPoints():Clone():Heal(healingRate):Clamp():ToString().
        ASSIGN cArmor = pCreature:GetArmorClass():Clone():ToString().
        RETURN cHealth + " / " + cArmor.
    END METHOD.

    METHOD PUBLIC INTEGER SafeRoll (INPUT pDice AS HANDLE):
        DEFINE VARIABLE iRoll AS INTEGER NO-UNDO.

        ASSIGN iRoll = DYNAMIC-FUNCTION("rollD20" IN pDice).
        IF iRoll > highestRoll THEN ASSIGN iRoll = highestRoll.
        RETURN iRoll.

        CATCH eRollError AS Progress.Lang.Error:
            RETURN 1.
        END CATCH.
        FINALLY:
            ASSIGN rollCount = rollCount + 1.
        END FINALLY.
    END METHOD.

    METHOD PUBLIC INTEGER InitiativeOrder (INPUT pCreatures AS Creature EXTENT):
        DEFINE VARIABLE iRank AS INTEGER NO-UNDO.

        // ABL has no nested functions: the ranking is inlined.
        ASSIGN iRank = pCreatures[1]:XPValue + rollCount.
        RETURN iRank + InitiativeOrder(pCreatures).
    END METHOD.

    METHOD PUBLIC LOGICAL IsEmpty ():
        RETURN rollCount = 0.
    END METHOD.

END CLASS.
