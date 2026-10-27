CREATE FUNCTION perl_check(value text) RETURNS boolean AS $$
  return defined($_[0]) ? 1 : 0;
$$ LANGUAGE plperl;

CREATE FUNCTION python_sort(numbers int[]) RETURNS int[] LANGUAGE plpython3u AS $$
  ordered = list(numbers)
  ordered.sort()
  return ordered
$$;

CREATE FUNCTION sql_check(value text) RETURNS boolean AS $$
  SELECT defined(value, 'a');
$$ LANGUAGE sql;

CREATE FUNCTION plpgsql_sort(numbers int[]) RETURNS int[] AS $$
BEGIN
  RETURN sort(numbers);
END;
$$ LANGUAGE plpgsql;
