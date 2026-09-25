{include/constants.i}

BLOCK-LEVEL ON ERROR UNDO, THROW.

CLASS de.sots.cellarsandcentaurs.domain.model.Speed:

    DEFINE PUBLIC STATIC PROPERTY SpeedLimit AS INTEGER NO-UNDO INITIAL {&SPEED-LIMIT}
        GET.
        PRIVATE SET.

    DEFINE PUBLIC PROPERTY Value AS INTEGER NO-UNDO
        GET.
        SET.

    CONSTRUCTOR PUBLIC Speed (INPUT pValue AS INTEGER):
        SUPER().
        ASSIGN Value = pValue.
    END CONSTRUCTOR.

END CLASS.
