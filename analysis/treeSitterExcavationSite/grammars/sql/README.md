# SQL island grammar

A tree-sitter grammar for SQL of all common dialects at once: ANSI, T-SQL, PL/SQL, PL/pgSQL and MySQL. It does
not tell the dialects apart. It is an *island grammar*: exact for what CodeCharta measures, opaque for everything
else. An unknown statement parses as a sequence of plain tokens instead of an `ERROR` node, so a construct the
grammar does not know never hides the control flow around it.

The published SQL grammars either stop at queries (procedural code turns into `ERROR` nodes and lowers the
complexity) or cover one dialect each, which is why CodeCharta has its own.

## What is exact

| Construct                         | Node types                                                                                 |
|-----------------------------------|--------------------------------------------------------------------------------------------|
| Routines                          | `routine_definition` (with `routine_body`), `routine_declaration` (no body), `parameter_list`, `parameter` |
| Routine bodies                    | `AS`/`IS` up to the block that ends the body, or up to `GO`, the next `CREATE` or the end of the file when there is no block; `$$ … $$`, ending before its closing quote; a string (`AS 'select 1'`); the single statement of a MySQL routine after the parameters of a procedure, the `RETURNS` of a function or the `FOR EACH ROW` of a trigger |
| Packages, type bodies, views, tables | `package_definition` (an Oracle `TYPE BODY` too), `view_definition`, `table_definition`, `column_definition`, `table_constraint` |
| Blocks                            | `block` (`BEGIN … END`, `BEGIN ATOMIC`, `$$ … $$` bodies), `do_block`                       |
| Branches and loops                | `if_statement`, `elsif_clause`, `else_clause`, `case_expression`, `when_clause`, `iif_expression`, `while_statement`, `loop_statement`, `for_statement` (with Oracle 21c iteration controls), `repeat_statement`, `exit_statement` (`EXIT` and `CONTINUE`, with their `WHEN` condition) |
| Exception handling                | `try_block`, `catch_block`, `exception_section`, `exception_handler`, `handler_declaration` |
| Conditions                        | `condition`, `logical_operator` (`AND`, `OR`; the `AND` of `BETWEEN` is none)              |
| What a statement reads or calls   | `object_reference` after `FROM` (with its comma list), `JOIN`, `INTO`, `UPDATE`, `DELETE`, `MERGE`, `USING`, `INSERT`, `TRUNCATE`, `REFERENCES`, `APPLY`, `EXEC`, `EXECUTE`, `CALL`, `PERFORM` and the `ON` of a trigger; `invocation` for `name(...)` |
| Names                             | `object_name`, `identifier`, `quoted_identifier`, `variable`, `bind_variable`, `common_table_expression` |
| Script structure                  | `batch_separator` (`GO`), `slash_terminator` (`/`), `delimiter_directive` and `custom_delimiter` (MySQL `DELIMITER`), `label` (MySQL `hunt: LOOP`, also glued to its colon), `client_command` (SQL*Plus `PROMPT`, `REM`, `SPOOL`, `@file`, `SET SERVEROUTPUT ON` and most of its other commands, but not `SHOW`, which MySQL and PostgreSQL share; SQLCMD `:r`, psql `\connect`, `\copy` over the lines its parentheses span). A client command and `DELIMITER` stand at the start of a script or after a terminator (`;`, `/`, `GO`, the custom delimiter) or another such command, so that a line starting with `prompt`, `remark` or `delimiter` inside a statement stays part of it |
| Skipped like comments             | `comment` (`--`, `/* */`, `#` before a space or one of `!=*-`), `conditional_compilation` and `inquiry_directive` (PL/SQL `$if`, `$$plsql_unit`), `template_tag` (`{% %}`) |

Keywords are case-insensitive. A word is a keyword only where the grammar expects that keyword, so `type`, `iif`
or `comment` stay plain names elsewhere. Where a statement may start, `LOOP` is both: the parser follows the loop
and the plain name side by side and keeps the loop when it closes, so `SELECT loop FROM t` is no loop.

Legacy code gets the benefit of the doubt: a semicolon inside parentheses (`OPENROWSET('…'; 'admin'; …)`), a
bracketed name over several lines and the empty qualifier of MySQL's `(.a BIGINT)` parse without an `ERROR` node. The
temporary table of a session is no `table_definition`, as it is no object of the database: T-SQL's `CREATE TABLE #t`,
MySQL's and PostgreSQL's `CREATE TEMP[ORARY] TABLE`, PostgreSQL's `CREATE GLOBAL TEMP TABLE` and Oracle's
`CREATE PRIVATE TEMPORARY TABLE`. Oracle's `CREATE GLOBAL TEMPORARY TABLE` is one, as the table belongs to the schema
and only its rows to a session. That spelling is the one both dialects share: PostgreSQL ignores the deprecated
`GLOBAL` and creates a table of the session, which the grammar can not tell apart. `ON COMMIT DELETE ROWS` deletes from
no table, so it is one token, as `ON` alone may start T-SQL's `ON [PRIMARY]`.

The external scanner (`src/scanner.c`) handles what a regular expression can not: PostgreSQL dollar quotes (a body
or string closes only on its own tag, compared with its case, `$Q$` by `$Q$` and not by `$q$`; a tag longer than 32
letters or with a letter beyond ASCII opens no quote), the custom MySQL delimiter, `GO` and `/` alone on their line, client commands, PL/SQL
conditional compilation, MySQL labels glued to their colon, and single-quoted strings, where a backslash escapes
in MySQL but may end a T-SQL string (`'C:\Backup\'`). `'\''` is MySQL's quote when it is the whole string, and a
backslash and a quote inside a longer T-SQL string (`'… CHARINDEX(''\'', name) …'`). In double quotes a backslash
always escapes (`"Spec\"s"`).

The `END` of a routine body is one token with its label and semicolon (`END total;`), so that its line counts for
the routine no more than a closing brace does in other languages. A body in dollar quotes ends before its closing
quote, so that the line `$$ LANGUAGE plpgsql;` does not count for the routine either.

## Known limits

- A body without a block ends at `GO`, at the end of the file or at a `CREATE` other than `CREATE TABLE #t`; a body
  with a block ends after it. A T-SQL body that starts without `BEGIN` and has a bare `BEGIN … END` in its middle
  ends there.
- A MySQL procedure whose single statement is a `SET` stays a `routine_declaration`: PostgreSQL writes options
  such as `SET search_path = …` at the same place.
- In MySQL, `'abc\''` (a longer string that ends in an escaped quote) is read the T-SQL way and runs on; a T-SQL
  name in double quotes that ends in a backslash (`"C:\"`) runs on as well.
- A MySQL comment needs a space after `#` (`# note`); `#note` reads as a name, because T-SQL names its temporary
  tables that way (`#orders`).
- A client command is only recognised at the start of a script or after a terminator or another client command, so a
  `PROMPT` inside a T-SQL body that runs up to `GO`, or after a PL/SQL block ended by `END;` without `/`, reads as
  plain words; a comment at the end of a client command line belongs to the command.
- A name may hold letters beyond ASCII, but not the punctuation, currency signs and symbols from U+2000 to U+2BFF,
  so that a MySQL delimiter such as `€` closes `END€`. The scanner compares the delimiter by code points and reads
  words such as `GO` in ASCII only, so `gů` is no `GO`.

## Error rate on public code

Measured with `tree-sitter parse` on public MIT and Apache-2.0 licensed SQL. *Code* is application code, *fixtures*
are the test files of other SQL parsers (sqlfluff, antlr grammars-v4), which collect unusual syntax on purpose.

| Dialect  | Sources                                                                                                   | Files | Lines   | Files with `ERROR` | Lines touched by `ERROR` |
|----------|-----------------------------------------------------------------------------------------------------------|------:|--------:|-------------------:|-------------------------:|
| T-SQL    | SQL-Server-First-Responder-Kit, sql-server-maintenance-solution, sql-server-samples (Wide World Importers) | 372   | 238,261 | 0                  | 0 %                      |
| PL/SQL   | utPLSQL, OraOpenSource Logger                                                                             | 519   | 70,478  | 0                  | 0 %                      |
| PL/pgSQL | GitLab `db/structure.sql`, supabase auth, graphile starter, pgjwt                                         | 87    | 70,667  | 0                  | 0 %                      |
| MySQL    | seven small MIT repositories of stored procedures and triggers                                            | 39    | 4,577   | 0                  | 0 %                      |
| ANSI     | TPC-H and TPC-DS queries (DuckDB)                                                                         | 121   | 6,261   | 0                  | 0 %                      |
| Fixtures | sqlfluff `ansi`, `tsql`, `oracle`, `postgres`, `mysql`; grammars-v4 `tsql`, `plsql`, `mysql`             | 1,237 | 41,060  | 0                  | 0 %                      |

Grammar 0.1.0 left an `ERROR` node in 11 of the fixtures (1.8 % of their lines); `test/corpus/legacy.txt` keeps
each of those constructs.

## Develop

Requires the tree-sitter CLI 0.26.3 (the version of the tree-sitter core CodeCharta loads, ABI 15) and a C compiler.

```bash
cd analysis/treeSitterExcavationSite/grammars/sql
tree-sitter generate          # writes src/parser.c, src/grammar.json, src/node-types.json
tree-sitter test              # runs test/corpus
tree-sitter parse some.sql    # prints the tree
```

`src/` is generated except `src/scanner.c`; commit it together with `grammar.js`.

## Rebuild the jar

`treeSitterExcavationSite/libs/tree-sitter-sql-island-<version>.jar` carries the native library for Linux and macOS
on x86_64 and aarch64 and for Windows on x86_64, built with the `gen` and `buildNative` tasks of
[tree-sitter-ng](https://github.com/bonede/tree-sitter-ng), which cross-compile with Zig. The name `sql-island` keeps
it apart from tree-sitter-ng's own `tree-sitter-sql`; the library exports `tree_sitter_sql_island`. tree-sitter-ng's
Gradle 8.7 needs a JDK 17 or 21. The last build used tree-sitter-ng at commit `52f2d14` with Zig 0.11.0.

```bash
# 1. The grammar as the source archive tree-sitter-ng downloads, with one top folder and an entry per folder
cd analysis/treeSitterExcavationSite/grammars
rm -rf /tmp/sql-island && mkdir -p /tmp/sql-island
cp -r sql /tmp/sql-island/tree-sitter-sql-island-0.7.0
(cd /tmp/sql-island && zip -qr tree-sitter-sql-island-0.7.0.zip tree-sitter-sql-island-0.7.0)

# 2. A subproject for the grammar, then the native libraries, then the jar (two runs: the jar task does not
#    depend on buildNative)
git clone https://github.com/bonede/tree-sitter-ng.git && cd tree-sitter-ng
./gradlew gen --parser-name=sql-island --parser-version=0.7.0 \
    --parser-zip=file:///tmp/sql-island/tree-sitter-sql-island-0.7.0.zip
./gradlew :tree-sitter-sql-island:buildNative \
    -PtreeSitterTargets=x86_64-windows,x86_64-macos,x86_64-linux-gnu,aarch64-linux-gnu,aarch64-macos
./gradlew :tree-sitter-sql-island:jar

# 3. Into CodeCharta; raise the version in the file name and in treeSitterExcavationSite/build.gradle.kts together
cp tree-sitter-sql-island/build/libs/tree-sitter-sql-island-0.7.0.jar <codecharta>/analysis/treeSitterExcavationSite/libs/
```

Where tree-sitter-ng can not reach the Zig mirrors, download `zig-<os>-<arch>-0.11.0` from ziglang.org into
`tree-sitter-ng/build/zig/`, check it with the `.minisig` and add `-x downloadZig` to the `buildNative` run.
`GrammarLoadingTest` loads the bundled library and fails when its ABI does not fit the tree-sitter core.

The build is reproducible up to the build folder and the clock: two builds from the same commit give byte-identical
Linux libraries wherever they run, and identical macOS libraries when they run in the same folder, as the folder's
path is written into the library and its UUID and signature are derived from it. The Windows library differs in
its four-byte link time stamp (written twice) and in the folder path of its debug record. The jar differs in the
time stamps of its entries.
