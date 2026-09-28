/*------------------------------------------------------------------------
    File        : dice.p
    Purpose     : Dice and dice rolls of the cellar
  ----------------------------------------------------------------------*/
{include/constants.i}

BLOCK-LEVEL ON ERROR UNDO, THROW.

DEFINE TEMP-TABLE Dice NO-UNDO
    FIELD sides AS INTEGER
    FIELD label AS CHARACTER
    INDEX idxSides IS PRIMARY UNIQUE sides.

DEFINE TEMP-TABLE DiceRoll NO-UNDO
    FIELD sides  AS INTEGER
    FIELD result AS INTEGER
    FIELD rolledAt AS DATETIME.

FUNCTION rollD20 RETURNS INTEGER ():
    DEFINE VARIABLE d20Roll AS INTEGER NO-UNDO.
    ASSIGN d20Roll = RANDOM(1, 20).
    CREATE DiceRoll.
    ASSIGN
        DiceRoll.sides    = 20
        DiceRoll.result   = d20Roll
        DiceRoll.rolledAt = NOW.
    RETURN d20Roll.
END FUNCTION.

FUNCTION maxRoll RETURNS INTEGER ():
    RETURN {&D20-SIDES}.
END FUNCTION.

PROCEDURE rollInitiative:
    DEFINE OUTPUT PARAMETER pInitiative AS INTEGER NO-UNDO.
    ASSIGN pInitiative = rollD20().
END PROCEDURE.
