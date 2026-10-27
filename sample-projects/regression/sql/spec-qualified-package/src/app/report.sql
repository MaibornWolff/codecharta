CREATE OR REPLACE PROCEDURE report IS
    v NUMBER;
BEGIN
    v := app.pricing.total(1);
END;
/
