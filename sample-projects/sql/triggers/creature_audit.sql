-- PostgreSQL: a trigger function and the trigger that calls it
CREATE TABLE creature_audit (
    creature_id CHAR(36),
    changed_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

CREATE OR REPLACE FUNCTION audit_creature() RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN
    IF TG_OP = 'DELETE' OR TG_OP = 'UPDATE' THEN
        INSERT INTO creature_audit (creature_id) VALUES (OLD.creature_id);
    END IF;
    PERFORM dbo.treasure_hoard(NEW.creature_id);
    RETURN NEW;
END;
$$;

CREATE TRIGGER creature_changed AFTER UPDATE OR DELETE ON creature
FOR EACH ROW EXECUTE FUNCTION audit_creature();
