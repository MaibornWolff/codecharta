-- ANSI SQL: one view over the creature tables, read by the persistence adapter
CREATE VIEW creature_overview AS
WITH strongest AS (
    SELECT creature_id, MAX(max_points) AS max_points FROM hit_points GROUP BY creature_id
)
SELECT c.creature_id, c.name, s.max_points, a.Value AS armor_class, dbo.treasure_hoard(c.creature_id) AS hoard
FROM creature c
JOIN strongest s ON s.creature_id = c.creature_id
LEFT JOIN dbo.ArmorClass a ON a.CreatureId = c.creature_id
WHERE c.creature_type IN (SELECT code FROM creature_type);
