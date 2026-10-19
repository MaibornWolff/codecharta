# MySQL edge cases, one routine per construct
DELIMITER $$

CREATE PROCEDURE edge_repeat(IN p_n INT)
BEGIN
    REPEAT SET p_n = p_n - 1; UNTIL p_n <= 0 END REPEAT;
END$$

CREATE PROCEDURE edge_labelled_loop(IN p_n INT)
BEGIN
    hunt: LOOP
        SET p_n = p_n - 1;
        IF p_n = 3 THEN ITERATE hunt; END IF;
        IF p_n <= 0 THEN LEAVE hunt; END IF;
    END LOOP hunt;
END$$

CREATE PROCEDURE edge_handler()
BEGIN
    DECLARE done INT DEFAULT FALSE;
    DECLARE CONTINUE HANDLER FOR NOT FOUND SET done = TRUE;
    SELECT 1;
END$$

CREATE FUNCTION edge_if_function(p_hp INT) RETURNS VARCHAR(5) DETERMINISTIC
BEGIN
    RETURN IF(p_hp > 0, 'alive', 'dead');
END$$

CREATE FUNCTION edge_single_statement(p_x INT) RETURNS INT DETERMINISTIC RETURN p_x * 2$$

CREATE PROCEDURE edge_case_statement(IN p_type VARCHAR(20))
BEGIN
    CASE p_type
        WHEN 'dragon' THEN SELECT 'fly';
        WHEN 'beast' THEN SELECT 'run';
        ELSE SELECT 'walk';
    END CASE;
END$$

CREATE PROCEDURE edge_backslash_string()
BEGIN
    SELECT 'the dragon\'s hoard', "a \"quoted\" word";
END$$

DELIMITER ;
