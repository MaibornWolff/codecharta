BLOCK-LEVEL ON ERROR UNDO, THROW.

CLASS de.sots.cellarsandcentaurs.application.dto.Creature SERIALIZABLE:

    DEFINE PUBLIC PROPERTY Name AS CHARACTER NO-UNDO
        GET.
        SET.

    DEFINE PUBLIC PROPERTY Stable AS CHARACTER NO-UNDO
        GET.
        SET.

    CONSTRUCTOR PUBLIC Creature (INPUT pName AS CHARACTER, INPUT pStable AS CHARACTER):
        SUPER().
        ASSIGN
            Name   = pName
            Stable = pStable.
    END CONSTRUCTOR.

END CLASS.
