/*------------------------------------------------------------------------
    File        : HitPoints.cls
    Purpose     : Hit points drop when the creature takes damage and recover when it rests in its lair.
  ----------------------------------------------------------------------*/
BLOCK-LEVEL ON ERROR UNDO, THROW.

CLASS de.sots.cellarsandcentaurs.domain.model.HitPoints:

    DEFINE PUBLIC STATIC PROPERTY MAX_HIT_POINTS AS INTEGER NO-UNDO INITIAL 999
        GET.
        PRIVATE SET.

    DEFINE PUBLIC PROPERTY Current AS INTEGER NO-UNDO
        GET.
        SET.

    DEFINE PUBLIC PROPERTY Maximum AS INTEGER NO-UNDO
        GET.
        SET.

    DEFINE PUBLIC PROPERTY Temporary AS INTEGER NO-UNDO
        GET.
        SET.

    CONSTRUCTOR PUBLIC HitPoints (INPUT pCurrent AS INTEGER, INPUT pMaximum AS INTEGER, INPUT pTemporary AS INTEGER):
        SUPER().
        ASSIGN
            Current   = MINIMUM(pCurrent, MAX_HIT_POINTS)
            Maximum   = MINIMUM(pMaximum, MAX_HIT_POINTS)
            Temporary = pTemporary.
    END CONSTRUCTOR.

    METHOD PUBLIC STATIC HitPoints Init (INPUT pMaximum AS INTEGER):
        RETURN NEW HitPoints(pMaximum, pMaximum, 0).
    END METHOD.

    METHOD PUBLIC VOID TakeDamage (INPUT pDamage AS INTEGER):
        ASSIGN Current = MAXIMUM(0, Current - pDamage).
    END METHOD.

END CLASS.
