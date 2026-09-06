BLOCK-LEVEL ON ERROR UNDO, THROW.

CLASS de.sots.cellarsandcentaurs.adapter.persistence.CreatureEntity SERIALIZABLE:

    DEFINE PUBLIC PROPERTY Id AS CHARACTER NO-UNDO
        GET.
        SET.

    CONSTRUCTOR PUBLIC CreatureEntity ():
        THIS-OBJECT("ididid").
    END CONSTRUCTOR.

    CONSTRUCTOR PUBLIC CreatureEntity (INPUT pId AS CHARACTER):
        SUPER().
        ASSIGN Id = pId.
    END CONSTRUCTOR.

END CLASS.
