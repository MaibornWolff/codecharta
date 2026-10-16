/*
 * Resolves an encounter between two creatures.
 * The attacker rolls, adds a bonus and the terrain decides the rest.
 * Speeds matter in the open, a natural twenty doubles the bonus.
 * The result is the damage in hit points, never negative.
 */
CREATE OR REPLACE PACKAGE BODY encounter_resolver AS

    FUNCTION resolve(p_attacker IN CHAR, p_defender IN CHAR, p_roll IN NUMBER, p_bonus IN NUMBER, p_terrain IN VARCHAR2)
        RETURN NUMBER
    IS
        v_damage NUMBER := 0;
        v_rounds NUMBER := 0;
    BEGIN
        -- A natural one always misses
        IF p_roll = 1 THEN
            RETURN 0;
        ELSIF p_roll = 20 THEN
            v_damage := 2 * p_bonus;
        ELSE
            v_damage := p_bonus;
        END IF;
        -- Speeds only count in the open
        FOR v_speed IN (SELECT feet_per_round FROM speed WHERE creature_id = p_attacker) LOOP
            IF v_speed.feet_per_round > 30 AND p_terrain = 'open' THEN
                v_damage := v_damage + 1;
            END IF;
        END LOOP;
        WHILE v_rounds < 3 OR v_damage = 0 LOOP
            v_rounds := v_rounds + 1;
        END LOOP;
        -- The terrain decides the bonus
        CASE p_terrain
            WHEN 'cellar' THEN v_damage := v_damage + 1;
            WHEN 'dungeon' THEN v_damage := v_damage + 2;
            WHEN 'lair' THEN v_damage := v_damage + 3;
            ELSE v_damage := v_damage - 1;
        END CASE;
        -- v_damage := v_damage * 2;
        RETURN CASE WHEN v_damage < 0 THEN 0 ELSE v_damage END; -- never negative
    END resolve;

    FUNCTION describe(p_creature_id IN CHAR) RETURN VARCHAR2 IS
        v_name VARCHAR2(100);
    BEGIN
        SELECT name INTO v_name FROM creature WHERE creature_id = p_creature_id;
        RETURN UPPER(TRIM(SUBSTR(REPLACE(LOWER(v_name), '-', ' '), 1, 50))) || INITCAP(TRIM(LOWER(v_name)));
    END describe;

    FUNCTION safe_roll(p_dice_id IN NUMBER) RETURN NUMBER IS
        v_result NUMBER;
    BEGIN
        SELECT result INTO v_result FROM dice_roll WHERE dice_id = p_dice_id;
        RETURN v_result;
    EXCEPTION
        WHEN NO_DATA_FOUND THEN
            RETURN 0;
    END safe_roll;

    FUNCTION initiative_order(p_count IN NUMBER) RETURN NUMBER IS
        FUNCTION roll_for(p_left IN NUMBER) RETURN NUMBER IS
        BEGIN
            /* every creature
               rolls once */
            RETURN p_left;
        END roll_for;
    BEGIN
        IF p_count = 0 THEN
            RETURN 0;
        END IF;
        RETURN roll_for(p_count) + initiative_order(p_count - 1);
    END initiative_order;

    FUNCTION is_empty RETURN BOOLEAN IS
    BEGIN
        RETURN TRUE;
    END is_empty;

END encounter_resolver;
/
