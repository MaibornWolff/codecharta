/*------------------------------------------------------------------------
    File        : startup.p
    Purpose     : Installs the combat rules as a session super procedure and starts the encounter
  ----------------------------------------------------------------------*/
BLOCK-LEVEL ON ERROR UNDO, THROW.

DEFINE VARIABLE hRules AS HANDLE NO-UNDO.

RUN de/sots/cellarsandcentaurs/domain/service/creaturerules.p PERSISTENT SET hRules.
SESSION:ADD-SUPER-PROCEDURE(hRules).

RUN de/sots/cellarsandcentaurs/application/encounter.p.

SESSION:REMOVE-SUPER-PROCEDURE(hRules).
DELETE PROCEDURE hRules.
