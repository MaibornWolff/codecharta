CREATE FUNCTION defined(store text, key text) RETURNS boolean AS 'MODULE_PATHNAME', 'hstore_defined' LANGUAGE C STRICT;
CREATE FUNCTION sort(numbers int[]) RETURNS int[] AS 'MODULE_PATHNAME', 'sort' LANGUAGE C STRICT;
