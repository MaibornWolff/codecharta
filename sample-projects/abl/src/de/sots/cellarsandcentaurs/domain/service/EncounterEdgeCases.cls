/*------------------------------------------------------------------------
    File        : EncounterEdgeCases.cls
    Purpose     : One method per ABL construct a parser is likely to miscount.
  ----------------------------------------------------------------------*/
USING de.sots.cellarsandcentaurs.domain.model.Creature FROM PROPATH.
USING de.sots.cellarsandcentaurs.domain.model.HitPoints FROM PROPATH.
USING OpenEdge.Core.Collections.List FROM PROPATH.

BLOCK-LEVEL ON ERROR UNDO, THROW.

&SCOPED-DEFINE MAX-ROUNDS 5

CLASS de.sots.cellarsandcentaurs.domain.service.EncounterEdgeCases:

    {include/ttencounter.i}

    DEFINE PRIVATE BUFFER bEncounter FOR ttEncounter.
    DEFINE PRIVATE QUERY qEncounter FOR ttEncounter.
    DEFINE PRIVATE VARIABLE roundCount AS INTEGER NO-UNDO.

    DEFINE PUBLIC EVENT AmbushSprung SIGNATURE VOID (INPUT pAmbusher AS CHARACTER).

    DEFINE PUBLIC PROPERTY Morale AS INTEGER NO-UNDO
        GET():
            IF Morale < 0 THEN
                RETURN 0.
            RETURN Morale.
        END GET.
        SET(INPUT pMorale AS INTEGER):
            ASSIGN Morale = pMorale.
        END SET.

    CONSTRUCTOR STATIC EncounterEdgeCases ():
    END CONSTRUCTOR.

    CONSTRUCTOR PUBLIC EncounterEdgeCases ():
        THIS-OBJECT(1).
    END CONSTRUCTOR.

    CONSTRUCTOR PUBLIC EncounterEdgeCases (INPUT pRoundCount AS INTEGER):
        SUPER().
        ASSIGN roundCount = pRoundCount.
        AmbushSprung:Subscribe(OnAmbushSprung).
    END CONSTRUCTOR.

    DESTRUCTOR PUBLIC EncounterEdgeCases ():
        IF roundCount > 0 THEN
            AmbushSprung:Unsubscribe(OnAmbushSprung).
    END DESTRUCTOR.

    METHOD PRIVATE VOID OnAmbushSprung (INPUT pAmbusher AS CHARACTER):
        IF pAmbusher = "" THEN
            RETURN.
        ASSIGN roundCount = roundCount + 1.
    END METHOD.

    METHOD PUBLIC INTEGER RepeatLoop ():
        DEFINE VARIABLE iTorch AS INTEGER NO-UNDO.
        REPEAT:
            ASSIGN iTorch = iTorch + 1.
            IF iTorch > 3 THEN
                LEAVE.
        END.
        RETURN iTorch.
    END METHOD.

    METHOD PUBLIC INTEGER IfThenDoElseDo (INPUT pWounded AS LOGICAL):
        DEFINE VARIABLE iPotion AS INTEGER NO-UNDO.
        IF pWounded THEN
        DO:
            ASSIGN iPotion = 2.
        END.
        ELSE
        DO:
            ASSIGN iPotion = 0.
        END.
        RETURN iPotion.
    END METHOD.

    METHOD PUBLIC INTEGER TransactionBlock ():
        DO TRANSACTION ON ERROR UNDO, LEAVE:
            CREATE ttEncounter.
            ASSIGN ttEncounter.round = roundCount.
        END.
        RETURN roundCount.
    END METHOD.

    METHOD PUBLIC INTEGER DoToByWhile (INPUT pAlive AS LOGICAL):
        DEFINE VARIABLE iArrow AS INTEGER NO-UNDO.
        DEFINE VARIABLE iQuiver AS INTEGER NO-UNDO.
        DO iArrow = 10 TO 1 BY -1 WHILE pAlive:
            ASSIGN iQuiver = iQuiver + iArrow.
        END.
        RETURN iQuiver.
    END METHOD.

    METHOD PUBLIC INTEGER ForEachWhere ():
        DEFINE VARIABLE iWound AS INTEGER NO-UNDO.
        FOR EACH ttEncounter WHERE ttEncounter.round > 1 AND ttEncounter.damage > 0 BY ttEncounter.round:
            ASSIGN iWound = iWound + ttEncounter.damage.
        END.
        RETURN iWound.
    END METHOD.

    METHOD PUBLIC CHARACTER ForFirst ():
        FOR FIRST bEncounter WHERE bEncounter.damage > 0:
            RETURN bEncounter.ambusher.
        END.
        RETURN "".
    END METHOD.

    METHOD PUBLIC INTEGER QueryLoop ():
        DEFINE VARIABLE iGoblin AS INTEGER NO-UNDO.
        OPEN QUERY qEncounter FOR EACH ttEncounter.
        GET FIRST qEncounter.
        DO WHILE NOT QUERY-OFF-END("qEncounter"):
            ASSIGN iGoblin = iGoblin + 1.
            GET NEXT qEncounter.
        END.
        CLOSE QUERY qEncounter.
        RETURN iGoblin.
    END METHOD.

    METHOD PUBLIC INTEGER LabelledLeave ():
        DEFINE VARIABLE iRow AS INTEGER NO-UNDO.
        DEFINE VARIABLE iColumn AS INTEGER NO-UNDO.
        outerBlock:
        DO iRow = 1 TO 3:
            DO iColumn = 1 TO 3:
                IF iColumn = 2 THEN
                    NEXT outerBlock.
                IF iRow = 3 THEN
                    LEAVE outerBlock.
            END.
        END.
        RETURN iRow.
    END METHOD.

    METHOD PUBLIC INTEGER CaseOrWhen (INPUT pWeapon AS CHARACTER):
        CASE pWeapon:
            WHEN "bow" OR WHEN "sling" THEN
                RETURN 6.
            WHEN "lance" THEN
                RETURN 10.
            OTHERWISE
                RETURN 1.
        END CASE.
    END METHOD.

    METHOD PUBLIC INTEGER NestedIfExpression (INPUT pLevel AS INTEGER):
        RETURN (IF pLevel > 10 THEN 3 ELSE IF pLevel > 5 THEN 2 ELSE 1).
    END METHOD.

    METHOD PUBLIC LOGICAL AndOrNot (INPUT pArmed AS LOGICAL, INPUT pHidden AS LOGICAL, INPUT pAsleep AS LOGICAL):
        RETURN pArmed AND (pHidden OR pAsleep) AND NOT roundCount = 0.
    END METHOD.

    method public logical LowerCaseKeywords (input pArmed as logical, input pHidden as logical):
        if pArmed and pHidden then
            return true.
        return false.
    end method.

    Method Public Logical MixedCaseKeywords (Input pArmed As Logical, Input pHidden As Logical):
        If pArmed And pHidden Or roundCount = 0 Then
            Return True.
        Return False.
    End Method.

    METHOD PUBLIC INTEGER AssignWhen (INPUT pCritical AS LOGICAL):
        DEFINE VARIABLE iSmite AS INTEGER NO-UNDO.
        ASSIGN iSmite = 5 WHEN pCritical.
        RETURN iSmite.
    END METHOD.

    METHOD PUBLIC INTEGER CatchTwice ():
        RETURN INTEGER("trap").

        CATCH eApplication AS Progress.Lang.AppError:
            RETURN 1.
        END CATCH.
        CATCH eSystem AS Progress.Lang.SysError:
            RETURN 2.
        END CATCH.
        FINALLY:
            ASSIGN roundCount = 0.
        END FINALLY.
    END METHOD.

    METHOD PUBLIC INTEGER NoErrorCheck (INPUT pRune AS CHARACTER):
        DEFINE VARIABLE iRune AS INTEGER NO-UNDO.
        ASSIGN iRune = INTEGER(pRune) NO-ERROR.
        IF ERROR-STATUS:ERROR THEN
            UNDO, THROW NEW Progress.Lang.AppError("Unreadable rune", 1).
        RETURN iRune.
    END METHOD.

    METHOD PUBLIC INTEGER PreprocessorBranch ():
        &IF DEFINED(DEBUG-ENCOUNTER) > 0 &THEN
        RETURN 0.
        &ELSEIF {&MAX-ROUNDS} > 3 &THEN
        RETURN {&MAX-ROUNDS}.
        &ELSE
        RETURN 3.
        &ENDIF
    END METHOD.

    METHOD PUBLIC VOID ParameterModes (INPUT pGold AS INTEGER, OUTPUT pSilver AS INTEGER, INPUT-OUTPUT pCopper AS INTEGER, INPUT TABLE ttEncounter, BUFFER pEncounter FOR ttEncounter):
        ASSIGN pSilver = pGold * 10.
    END METHOD.

    METHOD PUBLIC INTEGER ImplicitInput (pScroll AS INTEGER):
        RETURN pScroll.
    END METHOD.

    METHOD PUBLIC INTEGER Heal ():
        RETURN Heal(1).
    END METHOD.

    METHOD PUBLIC INTEGER Heal (INPUT pAmount AS INTEGER):
        RETURN pAmount.
    END METHOD.

    METHOD PUBLIC STATIC FINAL INTEGER StaticFinal ():
        RETURN {&MAX-ROUNDS}.
    END METHOD.

    METHOD PUBLIC CHARACTER CommentMarkersInStrings ():
        DEFINE VARIABLE cSign AS CHARACTER NO-UNDO.
        ASSIGN cSign = "/* not a comment */ // neither is this".
        ASSIGN cSign = cSign + 'He said "IF you AND I" /* still a string */'.
        ASSIGN cSign = cSign + "tilde ~" escapes the quote // IF x OR y":U.
        RETURN cSign.
    END METHOD.

    METHOD PUBLIC CHARACTER MultiLineString ():
        RETURN "The gargoyle whispers:
            IF you pass AND you pay THEN
            // the portcullis opens".
    END METHOD.

    /* outer comment /* nested comment */
       still inside the outer comment: IF a AND b THEN
       END METHOD. */
    METHOD PUBLIC INTEGER NestedComment ():
        RETURN 1. /* trailing /* nested */ block */
    END METHOD.

    /**
     * ABLDoc comment for the basilisk lookup.
     * @param pName the name to look up
     * @return always zero
     */
    METHOD PUBLIC INTEGER AblDocComment (INPUT pName AS CHARACTER):
        RETURN 0.
    END METHOD.

    METHOD PUBLIC CHARACTER PropertyChain (INPUT pCreature AS Creature):
        RETURN pCreature:HitPoints:Owner:ArmorClass:Wearer:Name.
    END METHOD.

    METHOD PUBLIC CHARACTER CallChainFour (INPUT pCreature AS Creature):
        RETURN pCreature:GetHitPoints():Clone():Clamp():ToString().
    END METHOD.

    METHOD PUBLIC CHARACTER HandleChain ():
        RETURN SESSION:FIRST-PROCEDURE:NEXT-SIBLING:PRIVATE-DATA.
    END METHOD.

    METHOD PUBLIC INTEGER VarStatement ():
        VAR INTEGER iMimic = 2, iWraith.
        iWraith = iMimic.
        iWraith += 1.
        RETURN iWraith.
    END METHOD.

    METHOD PUBLIC INTEGER AbbreviatedKeywords ():
        DEF VAR iLantern AS INT NO-UNDO.
        DEF VAR cPassword AS CHAR NO-UNDO INIT "mellon".
        RETURN iLantern.
    END METHOD.

    METHOD PUBLIC INTEGER GenericCollection ():
        DEFINE VARIABLE oPatrol AS CLASS List<Creature> NO-UNDO.
        ASSIGN oPatrol = NEW List<Creature>().
        RETURN oPatrol:Count.
    END METHOD.

    METHOD PUBLIC Progress.Lang.Object DynamicTypes (INPUT pClassName AS CHARACTER):
        DEFINE VARIABLE oSummoned AS Progress.Lang.Object NO-UNDO.
        ASSIGN oSummoned = DYNAMIC-NEW pClassName ().
        DYNAMIC-INVOKE(oSummoned, "Awaken").
        RETURN NEW de.sots.cellarsandcentaurs.domain.model.HitPoints(1, 1, 0).
    END METHOD.

END CLASS.
