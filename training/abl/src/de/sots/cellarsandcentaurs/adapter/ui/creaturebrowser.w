&ANALYZE-SUSPEND _VERSION-NUMBER AB_v10r12 GUI
&ANALYZE-RESUME
/* Connected Databases
*/
&Scoped-define WINDOW-NAME wCreatureBrowser
&Scoped-define FRAME-NAME fMain

USING de.sots.cellarsandcentaurs.domain.model.Creature FROM PROPATH.
USING de.sots.cellarsandcentaurs.domain.model.SpeedType FROM PROPATH.

DEFINE INPUT PARAMETER pCreature AS Creature NO-UNDO.

DEFINE VARIABLE oCentaur AS CLASS Centaur NO-UNDO.

DEFINE VARIABLE wCreatureBrowser AS WIDGET-HANDLE NO-UNDO.
DEFINE VARIABLE fiCreatureId AS CHARACTER FORMAT "X(40)":U LABEL "Creature" NO-UNDO.
DEFINE VARIABLE fiWalkingSpeed AS INTEGER FORMAT ">>9":U LABEL "Walking speed" NO-UNDO.
DEFINE BUTTON btnRoll LABEL "Roll initiative" SIZE 20 BY 1.14.

DEFINE FRAME fMain
    fiCreatureId   AT ROW 1.5 COL 4
    fiWalkingSpeed AT ROW 2.7 COL 4
    btnRoll        AT ROW 4   COL 4
    WITH 1 DOWN NO-BOX KEEP-TAB-ORDER OVERLAY SIDE-LABELS NO-UNDERLINE THREE-D
         AT COL 1 ROW 1 SIZE 60 BY 6.

CREATE WINDOW wCreatureBrowser ASSIGN
    TITLE  = "Cellar creature browser"
    HEIGHT = 6
    WIDTH  = 60.

ON CHOOSE OF btnRoll IN FRAME fMain
DO:
    RUN de/sots/cellarsandcentaurs/domain/model/dice.p.
END.

ASSIGN
    fiCreatureId   = pCreature:Id:Id
    fiWalkingSpeed = pCreature:GetSpeed(SpeedType:Walking):Value.

DISPLAY fiCreatureId fiWalkingSpeed WITH FRAME fMain.
ENABLE btnRoll WITH FRAME fMain.
WAIT-FOR CLOSE OF THIS-PROCEDURE.
