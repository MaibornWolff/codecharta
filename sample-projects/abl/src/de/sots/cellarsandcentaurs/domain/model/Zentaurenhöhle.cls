/* Die Zentaurenhöhle liegt unter dem Verlies. Rüstungsklasse und Trefferpunkte gehören zu jeder Kreatur. */
BLOCK-LEVEL ON ERROR UNDO, THROW.

CLASS de.sots.cellarsandcentaurs.domain.model.Zentaurenhöhle:

    DEFINE PUBLIC PROPERTY rüstungsklasse AS INTEGER NO-UNDO
        GET.
        SET.

    METHOD PUBLIC CHARACTER Beschreibung ():
        RETURN "Größe der Höhle".
    END METHOD.

END CLASS.
