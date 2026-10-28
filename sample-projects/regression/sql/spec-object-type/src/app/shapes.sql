CREATE TABLE shapes (origin point_t);

CREATE OR REPLACE PROCEDURE add_shape IS
BEGIN
    INSERT INTO shapes VALUES (point_t(1));
END;
/
