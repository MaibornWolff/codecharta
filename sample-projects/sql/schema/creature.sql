-- ANSI SQL
/*
 * A creature that roams the cellar. Centaurs, beasts and dragons all share hit points, armor class and speeds.
 */
CREATE TABLE creature_type (
    code VARCHAR(20) PRIMARY KEY
);

CREATE TABLE creature (
    creature_id CHAR(36) PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    creature_type VARCHAR(20) NOT NULL REFERENCES creature_type (code),
    walkingSpeed INT,
    walking_speed INT,
    MAX_HIT_POINTS INT DEFAULT 300,
    XPValue INT,
    d20Roll INT,
    CONSTRAINT creature_name_unique UNIQUE (name)
);
