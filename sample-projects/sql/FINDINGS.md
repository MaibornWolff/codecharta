# SQL

Report of 2026-10-16 (third round), checked again after the sixth review round: a fresh run with the CLI built from
branch `fix/review-6-sql` (grammar 0.8.0) gives every number of the sample below unchanged; only the counts of the
public code moved (see the second round below).

## Project
- One project in five dialects, chosen per file as a real code base would mix them: ANSI SQL (`schema/creature.sql`,
  `views/`), T-SQL (`schema/armor_class.sql`, `application/`, the T-SQL edge cases, the test), PL/SQL
  (`schema/hit_points.sql`, `domain/service/creatures.pks`, `encounter_resolver.pks/.pkb`, `adapter/persistence/`),
  PL/pgSQL (`schema/centaur.sql`, `schema/dice.sql`, `schema/zentaurenhoehle.sql`, `dto/`, `triggers/`, the PL/pgSQL
  edge cases) and MySQL (`schema/speed.sql`, `domain/service/creature_service.sql`, the MySQL edge cases).
  23 files, none of them executed against a database.
- The domain model maps onto a database: the model types are tables (`creature`, `creature_type`, `hit_points`,
  `ArmorClass`, `speed`, `speed_type`, `centaur`, `dice`, `dice_roll`, `"Zentaurenhöhle"`), the service and the
  facade are procedures and functions, the port `Creatures` is a PL/SQL package specification, the persistence
  adapter a package body, the `CreatureEntity` a synonym, the re-export barrel a view (`creature_overview`).
- Stress constructs and what stands in for them in SQL:

  | # | construct | in SQL |
  | --- | --- | --- |
  | 1 | aliased import | `CREATE SYNONYM creature_entity FOR creature` in `adapter/persistence/creature_repository.pls`, used by `UPDATE creature_entity` |
  | 2 | wildcard import | none: SQL has no imports, every object is found by its name (`USE`, `search_path` and `ALTER SESSION SET CURRENT_SCHEMA` only choose a default schema) |
  | 3 | barrel and cycle | the view `creature_overview` reads the tables and calls `dbo.treasure_hoard` of `application/creature_util.sql`, which reads the view again: a cycle and an upward edge |
  | 4 | inheritance | PostgreSQL `INHERITS (creature)` in `schema/centaur.sql`; foreign keys (`REFERENCES`) everywhere |
  | 5 | generics | none in SQL |
  | 6 | type position only | `creature%ROWTYPE` in the package specification `creatures.pks` and in `persisted_creatures.pkb`; instantiation is `INSERT INTO`; no static members and no annotations in SQL |
  | 7 | one name in two packages | `dto.creature` in `dto/creature.sql` next to the unqualified `creature`, both written by `dbo.CreatureFacade_Create` |
  | 8 | fully qualified reference | `dbo.ArmorClass`, `[dbo].[creature]`, `public.touch` |
  | 9 | unused import | none in SQL |
  | 10 | standard library | `sys.objects`, `information_schema.tables`, `sp_executesql`, `COUNT`, `now()` |
  | 11 | test file | `tests/test_creature_service.sql`, a tSQLt test that runs `dbo.CreatureFacade_Create` |
  | 12 | several declarations per file, file name differing from the declaration | `schema/dice.sql` (two tables and `roll_d20`), `schema/speed.sql`, `schema/armor_class.sql` holding `ArmorClass`, `application/creature_util.sql` holding `treasure_hoard` and the view `creature_treasure` |

- `EncounterResolver` is the PL/SQL package body `domain/service/encounter_resolver.pkb` (with its specification in
  `.pks`), because PL/SQL has nested functions. The `switch` is a `CASE` statement, the conditional expression a
  `CASE WHEN … THEN … ELSE … END`, `&&` and `||` are `AND` and `OR`, the `try`/`catch` is `EXCEPTION WHEN`. SQL has
  no method chains and no lambdas: `describe` nests five and three function calls instead, `safe_roll` has no
  closure.
- `EncounterEdgeCases` is one file per dialect: `encounter_edge_cases_tsql.sql`, `_mysql.sql`, `_plpgsql.sql`.
- German words: `schema/zentaurenhoehle.sql` with the quoted table `"Zentaurenhöhle"`, the column
  `"rüstungsklasse"`, the comment and the string of the README.
- Extension variants: `.pks`, `.pkb` and `.pls` (Oracle package specification, package body, PL/SQL source).

## Dependency parser
- `dependencyparser -nc … -e "output,FINDINGS.md"` with and without `--include-tests`: exit 0. Default run: 22 file
  nodes, 30 file edges, 61 leaves, 46 leaf edges; `--include-tests`: 23 nodes, 32 edges, 62 leaves, 48 leaf edges.
  One cycle.

| construct | expected edge(s) | found | verdict |
| --- | --- | --- | --- |
| foreign keys `REFERENCES creature` in `hit_points.sql`, `armor_class.sql` (`[dbo].[creature]`), `speed.sql` | -> schema/creature.sql each | all three | ok |
| foreign key inside one file (`creature` -> `creature_type`, `speed` -> `speed_type`, `dice_roll` -> `dice`) | leaf edges, no file edge | leaf edges only | ok |
| 4 `INHERITS (creature)` in `centaur.sql` | -> schema/creature.sql | found | ok |
| 1 synonym `creature_entity FOR creature`, `UPDATE creature_entity` in `creature_repository_touch` | creature_repository.pls -> schema/creature.sql | found, through the leaf `creature_entity` | ok |
| 3 view `creature_overview` reading `creature`, `creature_type`, `hit_points`, `dbo.ArmorClass`; CTE `strongest` | -> schema/creature.sql, hit_points.sql, armor_class.sql; no edge for the CTE | all three, x2 on creature.sql; the CTE is no used object | ok |
| 3 cycle `creature_overview` -> `dbo.treasure_hoard` -> `creature_overview` | views ↔ application, cyclic, one of them upward | both edges `isCyclic`, views -> application `isPointingUpwards` | ok |
| 6 `creature%ROWTYPE` in the specification `creatures.pks` (the only use there) | creatures.pks -> schema/creature.sql | found | ok |
| 7 `INSERT INTO dto.creature` next to the unqualified `creature` of every other file | -> dto/creature.sql only from the facade | dto/creature.sql 1 incoming edge, schema/creature.sql 21 | ok |
| 8 schema-qualified names (`dbo.ArmorClass`, `public.touch`, `[dbo].[creature]`) | resolved like unqualified ones | resolved | ok |
| procedure calls `EXEC create_creature` (T-SQL calling a MySQL procedure), `creature_repository_touch(…)` in a package body, `PERFORM dbo.treasure_hoard(…)` | -> creature_service.sql, -> creature_repository.pls, -> creature_util.sql | all three | ok |
| PostgreSQL trigger `creature_changed … ON creature … EXECUTE FUNCTION audit_creature()` | trigger -> creature.sql, leaf edge -> `audit_creature` | both | ok |
| package body routines `save_creature`, `find_creature` | leaves with the package as parent, edges from each routine | leaves with their own edges | ok |
| package specification and body of `encounter_resolver` | one leaf in each file | `encounter_resolver` in .pks and .pkb, the routines only in .pkb | ok |
| 10 `sys.objects`, `information_schema.tables`, `sp_executesql`, built-in functions | no edges | none | ok |
| 11 test file | skipped by default; with tests -> creature_facade.sql, -> creature.sql | as expected | ok |
| `migrations/V1__seed_types.sql`, only statements | one script leaf -> creature.sql, -> speed.sql | `V1__seed_types_script` with both edges | ok |
| `edge_without_begin` (T-SQL procedure without `BEGIN … END`, statements ended by `;`) | its `SELECT … FROM creature` in the procedure | `edge_without_begin` -> `creature`; the file has no script leaf any more | ok |
| `EXEC dbo.roll_initiative` (a procedure the project does not create) | no edge | none | ok |

- False positives: none found. Every unresolved name (built-in functions, types, variables) stays out of the edges.
- Leaf kinds: tables, views, synonyms and packages are `class`, procedures, functions and triggers `function`,
  statements outside any definition `script`. There is no kind for a table; `class` is the closest the schema offers.
- Leaf names are lower case (`armorclass`, `creaturefacade_create`): SQL compares unquoted names case-insensitively,
  so the parser does too. A name in double quotes in mixed case keeps it (`Zentaurenhöhle`) and only matches the
  same spelling, as in PostgreSQL; a quoted name all in one case (`"creature"`, `"CREATURE"`) is what an unquoted name
  folds to and matches it.
- What SQL offers natively: no imports and no module system. CodeCharta resolves every name on its own: a name with
  a schema finds the object of that schema, a name without one the object of the same schema, then one created
  without a schema, then one of any schema. Two objects of one name in two schemas stay apart (construct 7). An
  object created in several files (a `CREATE OR REPLACE VIEW` repeated by migrations, a package specification and
  its body) is one leaf per file, and a use points at the last of these files in path order, the latest migration.

## Unified parser
- `unifiedparser -nc … -e "output,FINDINGS.md"`: exit 0, all 23 files analysed including `.pks`, `.pkb`, `.pls`.
- `EncounterResolver` (`encounter_resolver.pkb`), expected values written before the run by the counting rule of the
  README; for SQL the `WHEN`s of a `CASE` count, the `ELSE` does not, and `AND`/`OR` are `&&`/`||`:

| metric | expected | reported | verdict |
| --- | --- | --- | --- |
| logic_complexity | 13 (resolve 11, safe_roll 1, initiative_order 1) | 13 | ok |
| complexity | 19 (13 + 6 functions incl. the nested `roll_for`) | 19 | ok |
| number_of_functions | 6 | 6 | ok |
| loc | 80 | 80 | ok |
| rloc | 62 | 62 | ok |
| comment_lines | 13 (doc 6, three line comments, block 2, trailing 1, commented-out code 1) | 13 | ok |
| max / min / mean / median parameters | 5 / 0 / 1.5 / 1 | 5 / 0 / 1.5 / 1 | ok |
| max / min / mean / median complexity per function | 11 / 0 / 2.17 / 0.5 | 11 / 0 / 2.17 / 0.5 | ok |
| max / min / mean / median rloc per function | 25 / 2 / 7.67 / 4.5 (body without the `END name;` line, like a closing brace; the first round wrote 7.5 for the mean, a slip: 46 lines over 6 functions) | 25 / 2 / 7.67 / 4.5 | ok |
| long_method | 1 (resolve) | 1 | ok |
| long_parameter_list | 1 (resolve, 5 parameters) | 1 | ok |
| message_chains | 0 (SQL has none) | 0 | ok |
| excessive_comments | 1 | 1 | ok |

- `EncounterEdgeCases`, expected per routine before the run:

| file | construct | expected | reported | verdict |
| --- | --- | --- | --- | --- |
| tsql | `BEGIN TRY … END TRY BEGIN CATCH … END CATCH` | 1 | 1 | ok |
| tsql | `IF … ELSE IF … ELSE IF … ELSE` | 3 | 3 | ok |
| tsql | `IIF(@hp > 0, …)` | 1 (conditional expression) | 1 | ok |
| tsql | `WHILE` with `IF … CONTINUE`, `IF … BREAK` | 3 | 3 | ok |
| tsql | `GOTO done` and its label | 0 | 0 | ok |
| tsql | nested block comment `/* outer /* inner */ still outer */` | 1 comment line, no error | 1, no error | ok (the comment ends at the first `*/`, `still outer */` is read as code on the same line) |
| tsql | `'-- not a comment'`, `'/* nor this */'` in strings | 0 comment lines | 0 | ok |
| tsql | default and `OUTPUT` parameters `@roll INT = 10, @result INT OUTPUT` | 2 parameters | 2 | ok |
| tsql | `EXEC sp_executesql N'IF 1 = 1 SELECT 1'` | 0 (dynamic SQL is a string) | 0 | ok |
| tsql | procedure without `BEGIN … END` | 1 inside the routine | 1 inside the routine, its body up to `GO` | ok |
| tsql | trigger `ON dbo.creature AFTER UPDATE AS BEGIN IF UPDATE(name) … END` | a function with 1 | function, 1 | ok |
| tsql | view with `CASE WHEN … WHEN … ELSE` in `WHERE` | 2, no function | 2, no function | ok |
| tsql | whole file | 11 functions, logic 12, complexity 23 | 11, 12, 23 | ok |
| mysql | `REPEAT … UNTIL … END REPEAT` | 1 | 1 | ok |
| mysql | labelled `LOOP` with `ITERATE` and `LEAVE` behind two `IF`s | 3 | 3 | ok |
| mysql | `DECLARE CONTINUE HANDLER FOR NOT FOUND` | 1 | 1 | ok |
| mysql | `IF(p_hp > 0, 'alive', 'dead')` | 1 | 1 | ok |
| mysql | `CASE … WHEN … WHEN … ELSE … END CASE` | 2 | 2 | ok |
| mysql | function with a single statement body (`RETURNS INT DETERMINISTIC RETURN p_x * 2`) | a function | a function, rloc 1 | ok |
| mysql | `'the dragon\'s hoard'`, `"a \"quoted\" word"` | no error, one string | no error | ok |
| mysql | `DELIMITER $$` … `END$$` | every routine ends at its `$$` | all routines found | ok |
| mysql | whole file | 7 functions, logic 8, complexity 15 | 7, 8, 15 | ok |
| plpgsql | `FOREACH … IN ARRAY … LOOP` | 1 | 1 | ok |
| plpgsql | `LOOP` with `CONTINUE WHEN`, `EXIT WHEN` | 3 (a conditional exit is a branch) | 3 | ok |
| plpgsql | `EXCEPTION WHEN a OR b THEN … WHEN OTHERS THEN …` | 3 | 3 | ok |
| plpgsql | body in `$body$` holding `$$a string$$`, with one `IF` | 1, the inner quote a string | 1 | ok |
| plpgsql | `LANGUAGE sql AS 'SELECT CASE WHEN … END'` | a function, 0 (the body is a string) | function, 0 | ok |
| plpgsql | `VARIADIC p_rolls INT[]` | 1 parameter | 1 | ok |
| plpgsql | anonymous `DO $$ … IF … $$` | 1, no function | 1, no function | ok |
| plpgsql | `COALESCE(NULLIF(…))`, `E'it\'s /* not */ a comment'` | 0, no comment line | 0, 0 | ok |
| plpgsql | whole file | 6 functions, logic 9, complexity 15 | 6, 9, 15 | ok |

- Line counting: loc, rloc and comment lines of every file match the file; comment markers inside strings are not
  counted.
- The other files: `persisted_creatures.pkb` 2 functions, `creature_service.sql` 2, `creature_audit.sql` 1 (the
  trigger without a body is no function), `dice.sql` 1 (`roll_d20`), the package specifications 0 (their routines
  have no body). No ERROR node in any of the 23 files.
- Database objects per file, expected from the `CREATE` statements before the run (procedures count where their body
  is, like `number_of_functions`; a PostgreSQL trigger that calls its function counts as a trigger):

| file | procedures | triggers | views | tables | verdict |
| --- | --- | --- | --- | --- | --- |
| `schema/creature.sql` | 0 | 0 | 0 | 2 (`creature_type`, `creature`) | ok |
| `schema/speed.sql`, `schema/dice.sql` | 0 | 0 | 0 | 2 each | ok |
| `schema/armor_class.sql`, `hit_points.sql`, `centaur.sql`, `zentaurenhoehle.sql`, `dto/creature.sql` | 0 | 0 | 0 | 1 each | ok |
| `views/creature_overview.sql` | 0 | 0 | 1 | 0 | ok |
| `application/creature_util.sql` (`treasure_hoard` is a function) | 0 | 0 | 1 | 0 | ok |
| `application/creature_facade.sql`, `domain/service/creature_service.sql` | 1 each | 0 | 0 | 0 | ok |
| `adapter/persistence/creature_repository.pls`, `persisted_creatures.pkb` | 1 each | 0 | 0 | 0 | ok |
| `domain/service/creatures.pks`, `encounter_resolver.pks` (specifications) | 0 | 0 | 0 | 0 | ok |
| `domain/service/encounter_resolver.pkb` (six functions) | 0 | 0 | 0 | 0 | ok |
| `triggers/creature_audit.sql` (audit table, function, trigger) | 0 | 1 | 0 | 1 | ok |
| `encounter_edge_cases_tsql.sql` | 9 | 1 | 1 | 0 | ok |
| `encounter_edge_cases_mysql.sql` | 5 | 0 | 0 | 0 | ok |
| `encounter_edge_cases_plpgsql.sql` (functions only) | 0 | 0 | 0 | 0 | ok |
| `tests/test_creature_service.sql` (a tSQLt test procedure) | 1 | 0 | 0 | 0 | ok |

- The same counts on public code: utPLSQL (262 PL/SQL files) 1,567 procedures in 87 files (the test package bodies
  lead with 158), 16 tables (4 of them global temporary tables), no view and no trigger; the SQL Server First
  Responder Kit (33 `.sql` files) 38 procedures in 21 files (`Install-All-Scripts.sql` 11), 13 tables, 3 views.

## Domain language parser
- `domainlanguageparser -nc … -e "output,FINDINGS.md"`: exit 0, 23 files.
- Expected words, summed over the files: creature 209, centaur 6, cellar 4, dungeon 5, armor 11, hit 19, points 24,
  speed 30, damage 4, lair 3, initiative 11, encounter 10, treasure 11, hoard 12, stable 4, dice 30, roll 45. All 17
  appear.
- Stop words: types, built-in functions, system schemas, dialect names and `id` (`varchar`, `count`, `dbo`,
  `postgres`). `max` (from `MAX_HIT_POINTS`) is gone, as `MAX` is a SQL function; `class` (from `ArmorClass`) stays,
  right for SQL. SQL keywords are no stop words any more: they never come out as words, and one that is also an
  English word names the domain (`order`, `statement`, `transaction`, `catalog`, `group` of a shop all count now).
- Leaks of the sample itself: `edge` 81 from the names of the edge case routines; `tables` 9 and `objects` 3 from the
  system views `information_schema.tables` and `sys.objects`, which are read like any table; `table` 7, `begin` 3,
  `procedure` 2 and `select` 2 from comments that talk about SQL. `id` and the dialect names of the comments
  (`postgre`, `oracle`, `ansi`) stay gone.
- Identifier splitting: `walkingSpeed` and `walking_speed` -> walking, speed; `MAX_HIT_POINTS` -> hit, points;
  `ArmorClass` -> armor, class; `XPValue` -> xp, value; `d20Roll` -> 20, roll; `'centaur-stable'` -> centaur, stable.
- What counts as an identifier for SQL: the names a script gives (tables, columns, views, synonyms, packages,
  routines, parameters, `DECLARE`d variables, common table expressions) and the objects it uses, each without schema
  and quotes. Plain column names inside queries do not count, as the grammar can not tell them from keywords.
- Comments and strings: the planted sentences are counted; dynamic SQL in strings is counted as words, its keywords
  filtered.
- Test file: included; `[test should_save_creature_to_the_stable]` is split into its words.
- German words: zentaurenhöhle 5, rüstungsklasse 5, höhle 4, kreatur 2, trefferpunkte 2, verlies 2, größe 1 all
  appear, umlauts intact. German stop words leak: die 2, unter 2, dem 2, und 2, jeder 2.

## Changed since 2026-10-16 (third round)
- Grammar 0.4.0 to 0.8.0: `PROMPT`, `REMARK` and `DELIMITER` inside a statement stay names, `SHOW` statements stay
  whole, the table of a trigger is named; `CREATE GLOBAL TEMPORARY TABLE` counts as a table (Oracle's table of the
  schema, only its rows belong to a session), while PostgreSQL's `CREATE GLOBAL TEMP TABLE` stays a table of the
  session and a temporary view (`CREATE TEMP VIEW`) is no view; `ON COMMIT DELETE ROWS` is no use of a table named
  `rows`. No ERROR node in the public code or fixtures.
- Unified parser: objects are told apart by schema and name as the dependency parser does, triggers by their table
  and overloaded routines by their parameter types; a PostgreSQL `DO` block's tables count like a T-SQL block's; the
  member and static procedures of an Oracle type body count like those of a package body. Neither the sample nor the
  totals of the public code change: the overloads and the global temporary tables these changes count again were in
  the totals before.
- Dependency parser: Flyway's repeatable migrations (`R__`) come after the versioned ones (`V__`); unchanged here.

## Changed since 2026-10-16 (second round)
- Unified parser: the line with the closing `$$` of a PostgreSQL routine counts for its rloc no more than its `END`
  line; the object counts appear for SQL files only, count each object of a file once (a view created and altered is
  one view) and leave out the temporary tables of a session and what a routine creates when it runs. The object
  counts of this sample stay as they were; its PostgreSQL routines lose their closing line (max rloc per function of
  `encounter_edge_cases_plpgsql.sql` 9 -> 8). On the public code, utPLSQL loses the 10 local procedures inside its
  PL/SQL routines (1,577 -> 1,567 procedures: five in `mystats_pkg.sql`, one each in `ut_event_manager.pkb`,
  `ut_utils.pkb`, `ut_compound_data_helper.pkb`, `test_ut_utils.pkb` and `test_ut_runner.pkb`), and the First
  Responder Kit the two `msdb` tables `sp_AllNightLog_Setup` creates in its body (15 -> 13 tables).
- Dependency parser: migrations are ordered by the numbers in their names (`V10__` after `V9__`); unchanged here.
- Domain language parser: SQL keywords are no stop words any more (see above): `tables`, `objects` and the SQL words
  of comments count again, `order` or `transaction` of a domain count now.
- Grammar 0.3.0: dollar quotes close only on their exact tag (`$Q$`, `$BODY$`), and a column named `prompt` or
  `remark` inside parentheses or a body stays a column; no ERROR node in the public code or fixtures.

## Changed since 2026-10-16 (first round)
- Unified parser: `IIF`, `EXIT WHEN` and `CONTINUE WHEN` count; MySQL's single statement routines are functions; a
  T-SQL body without `BEGIN` goes on up to `GO`; the `END` line of a routine no longer counts for its rloc; new
  counts of stored procedures, triggers, views and tables per file (0 in other languages).
- Dependency parser: `edge_without_begin` keeps its statements, so the T-SQL edge cases have no script leaf (61
  leaves instead of 62); an object created in several files resolves to the last file; quoted mixed-case names keep
  their case (`Zentaurenhöhle`).
- Domain language parser: dialect names, catalog words and `id` are stop words.
- Grammar 0.2.0: no ERROR node left in the public fixtures (11 files before).

## Verdict
Unified parser:
- Good: every routine of every dialect is found with its body, nested PL/SQL functions and MySQL single statement
  routines included; branches, loops, `CASE` arms, `IIF`, conditional exits, exception handlers and `AND`/`OR` count
  as in the other languages; rloc per function leaves out the `END` line and a closing `$$` like a closing brace;
  procedures,
  triggers, views and tables are counted per file; no ERROR node in 23 files.

Dependency parser:
- Good: foreign keys, inheritance, synonyms, `%ROWTYPE`, calls, triggers and views resolve across files and
  dialects; schema-qualified and unqualified names meet; `dto.creature` and `creature` stay apart; a T-SQL body
  without `BEGIN` keeps all its statements.
- Bad: an object created in several files is still one leaf per file; uses point at the last of them.

Domain language parser:
- Good: all 17 domain words, German words with umlauts; types, functions, dialect names and `id` filtered, while
  English words that SQL uses as keywords stay domain words.
- Bad: the words of the system views (`tables`, `objects`) and SQL words in comments count; German stop words
  (`die`, `und`, `unter`) count as domain words, as in every language.
