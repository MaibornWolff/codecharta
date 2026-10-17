-- MySQL
DELIMITER //

CREATE PROCEDURE create_creature(IN p_creature_id CHAR(36), IN p_name VARCHAR(100), IN p_type VARCHAR(20))
BEGIN
    DECLARE type_count INT DEFAULT 0;
    SELECT COUNT(*) INTO type_count FROM creature_type WHERE code = p_type;
    IF type_count = 0 THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'No such creature in the dungeon: ';
    END IF;
    INSERT INTO creature (creature_id, name, creature_type) VALUES (p_creature_id, p_name, p_type);
END //

CREATE FUNCTION count_creatures() RETURNS INT READS SQL DATA
BEGIN
    DECLARE total INT;
    SELECT COUNT(*) INTO total FROM creature;
    RETURN total;
END //

DELIMITER ;
