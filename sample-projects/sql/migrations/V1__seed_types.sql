-- Seeds the lookup tables; a script without definitions of its own
INSERT INTO creature_type (code) VALUES
    ('monstrosity'), ('beast'), ('aberration'), ('celestial'), ('dragon'), ('fiend'), ('humanoid'), ('undead');

INSERT INTO speed_type (code) VALUES ('walking'), ('flying'), ('swimming'), ('burrowing'), ('climbing');

SELECT name FROM sys.objects WHERE type = 'U';
SELECT table_name FROM information_schema.tables;
