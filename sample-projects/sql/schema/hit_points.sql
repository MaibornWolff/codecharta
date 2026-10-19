-- Oracle
-- Hit points drop when the creature takes damage and recover when it rests in its lair.
CREATE TABLE hit_points (
    creature_id CHAR(36) NOT NULL REFERENCES creature (creature_id),
    current_points NUMBER(5) NOT NULL,
    max_points NUMBER(5) NOT NULL,
    CONSTRAINT hit_points_in_range CHECK (current_points BETWEEN 0 AND max_points)
);
/
