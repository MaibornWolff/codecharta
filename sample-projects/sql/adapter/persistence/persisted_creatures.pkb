-- Oracle: the persistence adapter implements the port of the domain service
CREATE OR REPLACE PACKAGE BODY persisted_creatures AS

    PROCEDURE save_creature(p_creature_id IN CHAR, p_name IN VARCHAR2) IS
    BEGIN
        INSERT INTO creature (creature_id, name, creature_type) VALUES (p_creature_id, p_name, 'beast');
        creature_repository_touch(p_creature_id);
    END save_creature;

    FUNCTION find_creature(p_creature_id IN CHAR) RETURN creature%ROWTYPE IS
        v_creature creature%ROWTYPE;
    BEGIN
        SELECT * INTO v_creature FROM creature_overview WHERE creature_id = p_creature_id;
        RETURN v_creature;
    EXCEPTION
        WHEN NO_DATA_FOUND THEN
            RAISE_APPLICATION_ERROR(-20001, 'No such creature in the dungeon: ' || p_creature_id);
    END find_creature;

END persisted_creatures;
/
