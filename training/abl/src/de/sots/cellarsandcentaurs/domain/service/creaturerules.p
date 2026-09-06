/*------------------------------------------------------------------------
    File        : creaturerules.p
    Purpose     : Super procedure holding the combat rules of the cellar
  ----------------------------------------------------------------------*/
&SCOPED-DEFINE SPEED-CLASS de.sots.cellarsandcentaurs.domain.model.Speed

BLOCK-LEVEL ON ERROR UNDO, THROW.

PROCEDURE applyDamage:
    DEFINE INPUT  PARAMETER pDamage    AS INTEGER NO-UNDO.
    DEFINE OUTPUT PARAMETER pRemaining AS INTEGER NO-UNDO.
    ASSIGN pRemaining = MAXIMUM(0, 100 - pDamage).
END PROCEDURE.

PROCEDURE halveSpeed:
    DEFINE INPUT PARAMETER pSpeed AS {&SPEED-CLASS} NO-UNDO.
    ASSIGN pSpeed:Value = INTEGER(pSpeed:Value / 2).
END PROCEDURE.
