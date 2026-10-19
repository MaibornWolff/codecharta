-- PostgreSQL: two tables and a function in one file
CREATE TABLE dice (
    dice_id SERIAL PRIMARY KEY,
    sides INT NOT NULL
);

CREATE TABLE dice_roll (
    roll_id SERIAL PRIMARY KEY,
    dice_id INT NOT NULL REFERENCES dice (dice_id),
    result INT NOT NULL
);

CREATE OR REPLACE FUNCTION roll_d20() RETURNS INT LANGUAGE plpgsql AS $$
DECLARE
    rolled INT;
BEGIN
    rolled := floor(random() * 20) + 1;
    INSERT INTO dice_roll (dice_id, result) SELECT dice_id, rolled FROM dice WHERE sides = 20;
    RETURN rolled;
END;
$$;
