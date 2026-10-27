CREATE FUNCTION play() RETURNS INT AS $$
BEGIN
    CALL reset_dice();
    PERFORM warm_up();
    RETURN roll();
END $$ LANGUAGE plpgsql;
