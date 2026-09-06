USING de.sots.cellarsandcentaurs.application.CreatureUtil FROM PROPATH.

BLOCK-LEVEL ON ERROR UNDO, THROW.

CLASS de.sots.cellarsandcentaurs.domain.model.ArmorClass:

    DEFINE PUBLIC PROPERTY Description AS CHARACTER NO-UNDO
        GET.
        SET.

    DEFINE PUBLIC PROPERTY Base AS INTEGER NO-UNDO
        GET.
        SET.

    DEFINE PUBLIC PROPERTY Bonus AS INTEGER NO-UNDO
        GET.
        SET.

    DEFINE PUBLIC PROPERTY Total AS INTEGER NO-UNDO
        GET():
            RETURN Base + Bonus.
        END GET.

    CONSTRUCTOR PUBLIC ArmorClass (INPUT pBase AS INTEGER, INPUT pBonus AS INTEGER):
        THIS-OBJECT(pBase, pBonus, CreatureUtil:STANDARD_ARMOR_CLASS_DESCRIPTION).
    END CONSTRUCTOR.

    CONSTRUCTOR PUBLIC ArmorClass (INPUT pBase AS INTEGER, INPUT pBonus AS INTEGER, INPUT pDescription AS CHARACTER):
        SUPER().
        ASSIGN
            Base        = pBase
            Bonus       = pBonus
            Description = pDescription.
    END CONSTRUCTOR.

END CLASS.
