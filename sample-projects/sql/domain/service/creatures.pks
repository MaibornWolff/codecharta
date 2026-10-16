-- Oracle: the port the domain service talks to
CREATE OR REPLACE PACKAGE creatures AS
    PROCEDURE save_creature(p_creature_id IN CHAR, p_name IN VARCHAR2);
    FUNCTION find_creature(p_creature_id IN CHAR) RETURN creature%ROWTYPE;
END creatures;
/
