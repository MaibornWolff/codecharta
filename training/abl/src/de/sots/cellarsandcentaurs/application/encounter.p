/*------------------------------------------------------------------------
    File        : encounter.p
    Purpose     : Runs one encounter in the dungeon
  ----------------------------------------------------------------------*/
BLOCK-LEVEL ON ERROR UNDO, THROW.

DEFINE VARIABLE hDice       AS HANDLE  NO-UNDO.
DEFINE VARIABLE iInitiative AS INTEGER NO-UNDO.
DEFINE VARIABLE iRemaining  AS INTEGER NO-UNDO.

RUN dice.p PERSISTENT SET hDice.
RUN rollInitiative IN hDice (OUTPUT iInitiative).

RUN applyDamage (INPUT iInitiative, OUTPUT iRemaining).

MESSAGE "Initiative" iInitiative "hit points left" iRemaining VIEW-AS ALERT-BOX INFORMATION.
DELETE PROCEDURE hDice.
