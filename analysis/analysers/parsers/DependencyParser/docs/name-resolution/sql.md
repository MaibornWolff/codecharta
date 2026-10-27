# Name resolution: SQL

SQL has no imports and no compiler that sees a whole project: the database resolves a name when a statement runs, or
when a view, routine or trigger is created, against the objects that exist at that moment. The parser therefore
treats all SQL files of a run as one database and follows what the dialects agree on: PostgreSQL (checked with
PostgreSQL 18.6, which ran every PostgreSQL probe and printed what each name meant through `pg_depend`), and, from
their manuals, Oracle ("Managing Object Name Resolution", "How PL/SQL Resolves Identifier Names"), SQL Server
(name resolution of procedures and batches) and MySQL ("Identifier Qualifiers", stored routines). Where the dialects
differ, the parser follows the majority and says so. The rules shared by every language are in
[README.md](README.md).

## Objects and schemas

- A schema is SQL's namespace: `sales.orders` and `hr.orders` are two tables. A created object has the schema it is
  written with plus its own name as logical path, `sales.orders`. A database or server in front of the schema
  (`warehouse.dbo.orders`) is left out.
- An object created without a schema lies in the default schema, whose name the parser cannot know (`public` in
  PostgreSQL, `dbo` in SQL Server, the user in Oracle, the database in MySQL); its path is its name alone, `orders`.
- `SET search_path TO sales, public;` (PostgreSQL, also `SET search_path = …` and `SET SCHEMA 'sales'`) and `ALTER
  SESSION SET CURRENT_SCHEMA = sales;` (Oracle) make the first schema they name the default schema for the rest of the
  file: an unqualified `CREATE TABLE orders` after them creates `sales.orders` (decision 4). `USE x` is not read: in
  SQL Server it switches the database, in MySQL the schema, and the parser cannot tell the dialect.
- The folder of a file plays no part; neither does its name, except for the order of migrations (see "Which file").

## Declarations

- Every object a `CREATE` makes and a statement can name is a declaration (decision 5): a table (also a global
  temporary one in Oracle), a view (also a materialized one), a synonym (also a public one), a sequence, a type, a
  domain, a routine (procedure or function), a trigger (decision 7) and a package. A schema, an index and a
  constraint are no declarations: no statement uses them by name.
- An Oracle package is a namespace like a schema below it: the package specification (`CREATE PACKAGE pricing`, a
  `.pks` file) declares what others can name, the package body (`CREATE PACKAGE BODY pricing`, a `.pkb` file) what
  only the package itself can name. Each routine, constant, variable, type, cursor and exception of the specification
  is a declaration below the package, `pricing.total`, `pricing.c_max`, or `app.pricing.total` in schema `app`
  (decision 5). A routine of the specification that the body implements is an implementation part in the body: a
  leaf of the same path in the body's file, whose uses are those of the routine's body, and which uses the
  specification's routine (decision 1). The package body as a whole is an implementation part of the package. What
  only the body declares is a declaration only the package can name. A body whose specification no file of the run
  holds stands for the package: its routines are declarations others can name (decision 13).
- An Oracle object type works the same way: `CREATE TYPE point_t AS OBJECT (…)` is the declaration, `CREATE TYPE
  BODY point_t` its implementation part. Its methods and attributes belong to the type (decision 5).
- Routines of one name and different parameter types (PostgreSQL overloads) are one declaration: a call is not
  matched to its overload.
- A statement that changes an object created elsewhere is an implementation part of that object in its file
  (decision 2): `ALTER TABLE orders …`, `ALTER VIEW`, `ALTER SEQUENCE`, `ALTER TYPE`, `CREATE INDEX … ON orders`,
  `COMMENT ON TABLE orders` (also `COMMENT ON COLUMN orders.total`). Its uses, such as `REFERENCES customers` in an
  added foreign key, are uses of that part, and the part uses the object it changes. In the file that creates the
  object, such a statement is part of the object's own leaf.
- No declarations: what a routine or trigger declares inside itself (variables, cursors, local types, nested
  routines, temporary tables, table variables), common table expressions (`WITH totals AS (…)`), table aliases.
- The statements outside every definition and implementation part (inserts, grants, `DO` blocks, calls) are a script
  leaf `<file>_script` below the file: `migrations/V2__seed.sql` has the leaf `V2__seed_script`. A file without such
  statements has none. No name can mean a script leaf.
- The uses of a declaration are the names the database resolves in it: the objects of `FROM`, `JOIN`, `INTO`,
  `UPDATE`, `DELETE FROM`, `MERGE … USING`, `REFERENCES`, `INHERITS`, a trigger's `ON` and its `EXECUTE FUNCTION`, a
  synonym's `FOR`; calls of routines (`f(x)`, `EXEC p`, `CALL p()`, `PERFORM p()`); types of columns, variables,
  parameters and return values; `orders%ROWTYPE` and `orders.total%TYPE` (the table `orders`); a sequence through
  `order_seq.NEXTVAL`, `order_seq.CURRVAL`, `NEXT VALUE FOR order_seq` and PostgreSQL's `nextval('order_seq')`, whose
  string PostgreSQL resolves when the statement is created; a package member `pricing.c_max`.

## Kinds

PostgreSQL and MySQL keep relations and routines apart, so a table `audit` and a function `audit()` can both exist; in
Oracle and SQL Server one schema cannot hold both. The place a name stands in tells which kind it means (decision 6):

| Position | Means |
| --- | --- |
| `FROM`, `JOIN`, `INTO`, `UPDATE`, `DELETE FROM`, `MERGE`, `REFERENCES`, `INHERITS`, trigger `ON`, `%ROWTYPE`, `%TYPE` | a table, a view or a synonym |
| a call, `EXEC`, `CALL`, `PERFORM`, `EXECUTE FUNCTION` (also a call in `FROM`, a table function) | a routine; an Oracle object type (its constructor) |
| a column, variable, parameter or return type | a type or a domain; a table or a view (its row type) |
| `NEXTVAL`, `CURRVAL`, `NEXT VALUE FOR`, `nextval('…')` | a sequence |
| after a package `P.` | any member of the package |

A synonym can stand for an object of any kind, so it fits every position.

## A simple name `N`

`N` at a position of kind `K`, written in a declaration of schema `S` (or of none), means the first of:

1. A local name: a variable, parameter, cursor, record, local type or nested routine of the enclosing routine, a
   common table expression, a table alias, a temporary table (`#t`, a table a routine creates when it runs), a
   table variable (`@t`), a bind or substitution variable (`:x`, `&x`), the rows of a trigger (`NEW`, `OLD`,
   `:new`, `:old`, SQL Server's `inserted` and `deleted`, PostgreSQL's `excluded`). No edge.
2. Inside a package body or specification: a member of the package, what the body declares first, then what the
   specification declares, as PL/SQL looks outwards from the package. Inside an object type body: a method or
   attribute of the type, which is no edge.
3. An object `S.N` of kind `K` in the declaration's own schema. SQL Server looks in the procedure's own schema
   first, Oracle in the owner's schema, MySQL in the routine's database; PostgreSQL follows `search_path` instead,
   which a migration usually leaves at its default.
4. An object `N` of kind `K` created without a schema: one in the default schema.
5. The one object `N` of kind `K` in any other schema (SQL Server's `dbo`, say); if several schemas have one, no edge
   (decision 3).
6. A built-in or library object (`COUNT`, `now()`, `sys.objects`, `information_schema.tables`, `sp_executesql`): no
   edge, as no project file creates it.

## A qualified name

- `P.N`, where `P` is a package rule 2 to 5 finds, means the member `N` of the package. `S.P.N` means the member `N`
  of the package `P` in schema `S`; if there is no such package, `S` is a database and `P.N` is read as below.
- `S.N` otherwise means the object `N` of kind `K` in schema `S`, else an object `N` created without a schema (the
  default schema may be called `S`). It never means an object of another schema.
- `order_seq.NEXTVAL` and `order_seq.CURRVAL` mean the sequence `order_seq`; `orders.total%TYPE` means the table
  `orders`.

## Case

Unquoted names fold to one case: `Orders`, `ORDERS` and `orders` are one name (PostgreSQL folds to lower case,
Oracle to upper case, SQL Server and MySQL compare without case by default). A name in double quotes keeps its case
(`"Zentaurenhöhle"`) and only matches the same spelling, unless it is written all in one case: then it is what an
unquoted name folds to. Names in brackets (`[Orders]`) and backticks compare without case.

## Which file

An object that several files create, as migrations do with `CREATE OR REPLACE VIEW`, means the copy of the latest
migration: the last file in the natural order of the paths (`V10__` after `V9__`, versioned migrations before
Flyway's repeatable `R__` ones), which holds the object's current definition (shared rule 2). A declaration comes
before an implementation part (decisions 1 and 2), and only a copy of the kind the position asks for counts.

## Probes

Each rule is tested by a probe under `sample-projects/regression/sql/`; every PostgreSQL probe runs in PostgreSQL 18.6,
the probes of other dialects follow their manuals. "Gap" means the parser does not follow the rule yet;
`sample-projects/regression/sql/known-gaps.md` says how it deviates.

| Rule | Probe | Today |
| --- | --- | --- |
| Objects: schema plus name, not the folder | `spec-schema-path` | ok |
| Objects: an object without a schema | `spec-default-schema` | ok |
| Objects: the database part is left out | `spec-database-part` | ok |
| Objects, decision 4: `SET search_path` | `spec-search-path` | ok |
| Objects, decision 4: `ALTER SESSION SET CURRENT_SCHEMA` | `spec-current-schema` | ok |
| Objects, decision 4: `USE` is not read | `spec-use-ignored` | ok |
| Declarations, decision 5: tables, views, sequences, types, domains, routines | `spec-object-kinds` | ok |
| Declarations: synonyms | `spec-synonym` | ok |
| Declarations, decision 5: `NEXTVAL`, `CURRVAL` | `spec-sequence-oracle` | ok |
| Declarations, decision 5: `NEXT VALUE FOR` | `spec-sequence-tsql` | ok |
| Declarations, decisions 5 and 8: an object type and its body | `spec-object-type` | ok |
| Declarations: calls, `CALL`, `PERFORM` | `spec-routine-calls` | ok |
| Declarations: `EXEC` | `spec-exec` | ok |
| Declarations, decision 7: a trigger | `spec-trigger` | ok |
| Declarations, decision 1: package specification and body | `spec-package-spec-body` | ok |
| Declarations, decision 5: the members of a package specification | `spec-package-members` | ok |
| Declarations: what only the package body declares | `spec-package-private` | ok |
| Declarations, decision 2: `ALTER TABLE`, `CREATE INDEX` in another file | `spec-alter-part` | gap |
| Declarations, decision 2: `ALTER TABLE` in the creating file | `spec-alter-same-file` | gap |
| Declarations, decision 2: `COMMENT ON` | `spec-comment-on` | gap |
| Declarations: the script leaf | `spec-script-leaf` | ok |
| Declarations, decision 9: what a routine declares inside itself | `spec-local-declarations` | ok |
| Declarations, decision 10: overloads | `spec-overloads` | ok |
| Declarations: `%ROWTYPE`, `%TYPE` | `spec-anchored-types` | ok |
| Kinds, decision 6: a table and a function of one name | `spec-kind-relation-routine` | ok |
| Kinds, decision 6: a type, else a row type | `spec-kind-row-type` | ok |
| Kinds, decision 6: a table function | `spec-kind-table-function` | ok |
| Kinds: a synonym fits every position | `spec-kind-synonym` | ok |
| Simple name 1: the rows of a trigger | `spec-trigger-rows` | ok |
| Simple name 1: a common table expression | `spec-cte` | ok |
| Simple name 1: temporary tables, table variables, variables | `spec-temp-variables` | ok |
| Simple name 2: the package's own members first | `spec-package-member-first` | ok |
| Simple name 3, decision 11: the own schema first | `spec-own-schema-first` | ok |
| Simple name 4: the default schema before another | `spec-default-before-other` | ok |
| Simple name 5: the one object in another schema | `spec-other-schema-unique` | ok |
| Simple name 5, decision 3: several other schemas | `spec-other-schema-ambiguous` | ok |
| Simple name 6: built-in objects | `spec-builtin` | ok |
| Qualified, decision 12: `S.N` | `spec-qualified-schema` | ok |
| Qualified: `S.P.N` through a package | `spec-qualified-package` | ok |
| Case: folded and quoted names | `spec-case` | ok |
| Case: a mixed-case quoted name | `spec-case-mixed-quoted` | ok |
| Case: brackets | `spec-case-brackets` | ok |
| Which file: the latest migration | `spec-latest-migration` | ok |
| Which file: a declaration before an implementation part | `spec-declaration-before-part` | gap |
| Shared rule 1, name scope | `spec-name-scope` | ok |
| Shared rule 4, self | `spec-self` | ok |

## Not supported

- Dynamic SQL: a statement in a string (`EXECUTE 'SELECT … FROM orders'`, `sp_executesql`) and names in strings other
  than `nextval('…')`.
- `DROP`: a dropped object still counts as created; `ALTER … RENAME TO` does not rename it.
- A project object named like a built-in one: PostgreSQL searches `pg_catalog` first and SQL Server `sys`, so a
  project function `now()` is not what `now()` means there, but the parser takes it.
- Matching a call to an overload by its argument types.
- A table and a routine of one name in one file and schema share one leaf.
- `USE x`, and every other way a session chooses its default schema (the login user, the connection string).
- Database links (`orders@remote`) and linked servers: their objects are of another database.
- Members of a value: `v.total` of a record variable, a method `p.len()` of an object instance.

## Decisions

1. An Oracle package specification declares what others call; a routine the body implements is an implementation
   part in the body that uses the specification's routine, as Oracle records the dependencies and as C++ decision 3
   and Rust decision 3 (decided 2026-10-27).
2. A statement that changes an object created in another file (`ALTER TABLE`, `CREATE INDEX … ON`, `COMMENT ON`) is
   an implementation part of that object, as the database adds a constraint or index to the table (decided
   2026-10-27).
3. An unqualified name that neither the own schema nor the default schema holds means the one object of that name
   and kind in another schema; several draw no edge, as an ambiguous name in TypeScript (decided 2026-10-27).
4. `SET search_path` and `ALTER SESSION SET CURRENT_SCHEMA` set the schema of the rest of the file; `USE` is not read
   (decided 2026-10-27).
5. Sequences, types, domains and the members of a package specification are declarations, and every place the
   database resolves them is a use, as Delphi decision 1 (decided 2026-10-27).
6. The position of a name tells the kind of object it means, as PostgreSQL and MySQL keep relations and routines
   apart (decided 2026-10-27).
7. A trigger is a declaration of its own that uses its table, not part of the table (decided 2026-10-27).
8. A member of an object type belongs to its type, as Delphi decision 6 (derived 2026-10-27).
9. What a routine declares inside itself is no target, as Delphi decision 7 and Rust decision 8 (derived
   2026-10-27).
10. Overloads are one declaration, as the parser has no types of values to match them with (derived 2026-10-27).
11. The own schema comes before the default schema, as SQL Server, Oracle and MySQL do, although PostgreSQL follows
    `search_path` (derived 2026-10-27).
12. A qualified `S.N` falls back to an object created without a schema, as the default schema may be called `S`
    (kept from before, derived 2026-10-27).
13. A package body whose specification is not in the run is the package's declaration, as Oracle cannot compile a body
    without one, so the specification lies outside the analysed files; as a C++ class body without a header (derived
    2026-10-27).
