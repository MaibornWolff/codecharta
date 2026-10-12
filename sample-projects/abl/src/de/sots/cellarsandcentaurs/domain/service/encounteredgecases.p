/*------------------------------------------------------------------------
    File        : encounteredgecases.p
    Purpose     : Procedural ABL constructs a parser is likely to miscount.
  ----------------------------------------------------------------------*/
{include/ttencounter.i &ACCESS-MODE=PRIVATE}

&GLOBAL-DEFINE TRAP-DAMAGE 4
&IF DEFINED(TRAP-DAMAGE) > 0 &THEN
DEFINE VARIABLE trap-damage-total AS INTEGER NO-UNDO.
&ENDIF

DEFINE VARIABLE hit-point-pool AS INTEGER NO-UNDO INITIAL 30.
DEFINE VARIABLE hDice AS HANDLE NO-UNDO.
DEFINE VARIABLE cRitualProgram AS CHARACTER NO-UNDO INITIAL "startup.p".
DEFINE VARIABLE iRound AS INTEGER NO-UNDO.
DEFINE BUTTON btnAmbush LABEL "Spring the ambush".
DEFINE FRAME fAmbush btnAmbush.

FUNCTION criticalDamage RETURNS INTEGER (INPUT pRoll AS INTEGER) FORWARD.
FUNCTION remoteRoll RETURNS INTEGER () IN hDice.

ON CHOOSE OF btnAmbush IN FRAME fAmbush
DO:
    IF hit-point-pool > 0 THEN
        ASSIGN hit-point-pool = hit-point-pool - {&TRAP-DAMAGE}.
END.

SUBSCRIBE TO "AmbushSprung" ANYWHERE RUN-PROCEDURE "onAmbushSprung".

REPEAT iRound = 1 TO 3:
    IF criticalDamage(iRound) > 1 OR hit-point-pool = 0 THEN
        LEAVE.
    RUN startAmbush (INPUT iRound, INPUT "cellar", OUTPUT hit-point-pool).
END.

RUN VALUE(cRitualProgram).
RUN de/sots/cellarsandcentaurs/domain/model/dice.p PERSISTENT SET hDice.
PUBLISH "AmbushSprung" (INPUT "goblin").
MESSAGE "The ambush ends in the crypt" VIEW-AS ALERT-BOX.

FUNCTION criticalDamage RETURNS INTEGER (INPUT pRoll AS INTEGER):
    RETURN (IF pRoll = 20 THEN 2 ELSE 1).
END FUNCTION.

PROCEDURE startAmbush:
    DEFINE INPUT  PARAMETER pRound     AS INTEGER   NO-UNDO.
    DEFINE INPUT  PARAMETER pLocation  AS CHARACTER NO-UNDO.
    DEFINE OUTPUT PARAMETER pRemaining AS INTEGER   NO-UNDO.

    IF pLocation = "cellar" THEN
        ASSIGN pRemaining = hit-point-pool - pRound.
    ELSE
        ASSIGN pRemaining = hit-point-pool.
END PROCEDURE.

PROCEDURE onAmbushSprung PRIVATE:
    DEFINE INPUT PARAMETER pAmbusher AS CHARACTER NO-UNDO.
    ASSIGN trap-damage-total = trap-damage-total + {&TRAP-DAMAGE}.
END PROCEDURE.

PROCEDURE GetTickCount EXTERNAL "kernel32.dll":
    DEFINE RETURN PARAMETER pTicks AS LONG.
END PROCEDURE.
