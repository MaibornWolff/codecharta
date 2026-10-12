/* Rounds of one encounter, shared by every ambush that includes this file. */
DEFINE TEMP-TABLE ttEncounter NO-UNDO
    FIELD round    AS INTEGER
    FIELD damage   AS INTEGER
    FIELD ambusher AS CHARACTER
    INDEX idxRound IS PRIMARY UNIQUE round.
