-- Oracle: a standalone procedure in a .pls file, writing through a synonym
CREATE SYNONYM creature_entity FOR creature;

CREATE OR REPLACE PROCEDURE creature_repository_touch(p_creature_id IN CHAR) AS
BEGIN
    UPDATE creature_entity SET name = TRIM(name) WHERE creature_id = p_creature_id;
END creature_repository_touch;
/
