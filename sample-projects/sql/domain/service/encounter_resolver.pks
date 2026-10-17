CREATE OR REPLACE PACKAGE encounter_resolver AS
    FUNCTION resolve(p_attacker IN CHAR, p_defender IN CHAR, p_roll IN NUMBER, p_bonus IN NUMBER, p_terrain IN VARCHAR2)
        RETURN NUMBER;
    FUNCTION describe(p_creature_id IN CHAR) RETURN VARCHAR2;
    FUNCTION safe_roll(p_dice_id IN NUMBER) RETURN NUMBER;
    FUNCTION initiative_order(p_count IN NUMBER) RETURN NUMBER;
    FUNCTION is_empty RETURN BOOLEAN;
END encounter_resolver;
/
