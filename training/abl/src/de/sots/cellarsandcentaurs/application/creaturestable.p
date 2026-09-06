/*------------------------------------------------------------------------
    File        : creaturestable.p
    Purpose     : Startup procedure that fills the stable with creatures
  ----------------------------------------------------------------------*/
USING de.sots.cellarsandcentaurs.application.CreatureFacade FROM PROPATH.
USING de.sots.cellarsandcentaurs.domain.service.CreatureService FROM PROPATH.
USING de.sots.cellarsandcentaurs.adapter.persistence.PersistedCreatures FROM PROPATH.
USING de.sots.cellarsandcentaurs.adapter.persistence.CreatureRepository FROM PROPATH.
USING de.sots.cellarsandcentaurs.domain.model.* FROM PROPATH.

BLOCK-LEVEL ON ERROR UNDO, THROW.

DEFINE VARIABLE oFacade     AS CreatureFacade NO-UNDO.
DEFINE VARIABLE oCreature   AS Creature       NO-UNDO.
DEFINE VARIABLE hDice       AS HANDLE         NO-UNDO.
DEFINE VARIABLE iInitiative AS INTEGER        NO-UNDO.

oFacade = NEW CreatureFacade(NEW CreatureService(NEW PersistedCreatures(NEW CreatureRepository()))).

oCreature = oFacade:Create(CreatureType:Dragon,
                           NEW Speed(40), NEW Speed(80), NEW Speed(40), NEW Speed(0), NEW Speed(40),
                           NEW ArmorClass(17, 2), 200).

RUN de/sots/cellarsandcentaurs/domain/model/dice.p PERSISTENT SET hDice.
RUN rollInitiative IN hDice (OUTPUT iInitiative).
RUN de/sots/cellarsandcentaurs/adapter/ui/creaturebrowser.w (INPUT oCreature).

MESSAGE "Initiative of the dragon:" iInitiative VIEW-AS ALERT-BOX INFORMATION.
DELETE PROCEDURE hDice.
