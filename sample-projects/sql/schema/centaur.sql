-- PostgreSQL: a centaur is a creature with a hoof size, by table inheritance
CREATE TABLE centaur (
    hoof_size INT NOT NULL DEFAULT 4
) INHERITS (creature);
