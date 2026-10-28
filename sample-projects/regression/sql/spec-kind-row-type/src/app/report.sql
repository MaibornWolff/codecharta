CREATE FUNCTION report(r orders) RETURNS money_amount AS $$ SELECT ROW(r.id)::money_amount $$ LANGUAGE sql;
