-- PostgreSQL: the same simple name as the domain table, in another schema
CREATE TABLE dto.creature (
    creature_id CHAR(36) PRIMARY KEY,
    display_name TEXT NOT NULL
);
