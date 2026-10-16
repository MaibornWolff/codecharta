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
| Packages, views, tables           | `package_definition`, `view_definition`, `table_definition`, `column_definition`, `table_constraint` |
| Blocks                            | `block` (`BEGIN … END`, `BEGIN ATOMIC`, `$$ … $$` bodies), `do_block`                       |
| Branches and loops                | `if_statement`, `elsif_clause`, `else_clause`, `case_expression`, `when_clause`, `while_statement`, `loop_statement`, `for_statement`, `repeat_statement` |
| Exception handling                | `try_block`, `catch_block`, `exception_section`, `exception_handler`, `handler_declaration` |
| Conditions                        | `condition`, `logical_operator` (`AND`, `OR`; the `AND` of `BETWEEN` is none)              |
| What a statement reads or calls   | `object_reference` after `FROM` (with its comma list), `JOIN`, `INTO`, `UPDATE`, `DELETE`, `MERGE`, `USING`, `INSERT`, `TRUNCATE`, `REFERENCES`, `APPLY`, `EXEC`, `EXECUTE`, `CALL`, `PERFORM` and the `ON` of a trigger; `invocation` for `name(...)` |
| Names                             | `object_name`, `identifier`, `quoted_identifier`, `variable`, `bind_variable`, `common_table_expression` |
| Script structure                  | `batch_separator` (`GO`), `slash_terminator` (`/`), `delimiter_directive` and `custom_delimiter` (MySQL `DELIMITER`) |
| Skipped like comments             | `comment` (`--`, `/* */`, `#`), `client_command` (SQL*Plus `PROMPT`, SQLCMD `:r`, psql `\connect`), `conditional_compilation` and `inquiry_directive` (PL/SQL `$if`, `$$plsql_unit`), `template_tag` (`{% %}`) |

Keywords are case-insensitive. A word is a keyword only where the grammar expects that keyword, so `loop`,
`type` or `comment` stay plain names elsewhere.

The external scanner (`src/scanner.c`) handles what a regular expression can not: PostgreSQL dollar quotes (a body
closes only on its own tag), the custom MySQL delimiter, `GO` and `/` alone on their line, client commands, PL/SQL
conditional compilation, and single-quoted strings, where a backslash escapes in MySQL but may end a T-SQL string
(`'C:\Backup\'`).

## Known limits

- A T-SQL routine without `BEGIN … END` ends at the first semicolon that is followed by a statement keyword; its
  statements after that count for the file, not for the routine.
- A routine body without `AS`, `IS`, `BEGIN` or `DECLARE` in front (a MySQL `RETURNS INT RETURN x * 2`, a trigger
  `FOR EACH ROW SET …`) makes a `routine_declaration`, which is not counted as a function.
- `'\''` is read the T-SQL way, as an unterminated string; MySQL means a quote.
- A MySQL label glued to its colon (`lbl:LOOP`) reads as a bind variable.
- Oracle 21c iteration controls (`FOR i IN 1, REPEAT i * 2 WHILE i < 64 LOOP`) and psql `\copy` across several lines
  produce `ERROR` nodes.

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
| Fixtures | sqlfluff `ansi`, `tsql`, `oracle`, `postgres`, `mysql`; grammars-v4 `tsql`, `plsql`, `mysql`             | 1,237 | 41,060  | 11 (0.9 %)         | 1.8 %                    |

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
cp -r sql /tmp/sql-island/tree-sitter-sql-island-0.1.0
(cd /tmp/sql-island && zip -qr tree-sitter-sql-island-0.1.0.zip tree-sitter-sql-island-0.1.0)

# 2. A subproject for the grammar, then the native libraries, then the jar (two runs: the jar task does not
#    depend on buildNative)
git clone https://github.com/bonede/tree-sitter-ng.git && cd tree-sitter-ng
./gradlew gen --parser-name=sql-island --parser-version=0.1.0 \
    --parser-zip=file:///tmp/sql-island/tree-sitter-sql-island-0.1.0.zip
./gradlew :tree-sitter-sql-island:buildNative \
    -PtreeSitterTargets=x86_64-windows,x86_64-macos,x86_64-linux-gnu,aarch64-linux-gnu,aarch64-macos
./gradlew :tree-sitter-sql-island:jar

# 3. Into CodeCharta; raise the version in the file name and in treeSitterExcavationSite/build.gradle.kts together
cp tree-sitter-sql-island/build/libs/tree-sitter-sql-island-0.1.0.jar <codecharta>/analysis/treeSitterExcavationSite/libs/
```

Where tree-sitter-ng can not reach the Zig mirrors, download `zig-<os>-<arch>-0.11.0` from ziglang.org into
`tree-sitter-ng/build/zig/`, check it with the `.minisig` and add `-x downloadZig` to the `buildNative` run.
`GrammarLoadingTest` loads the bundled library and fails when its ABI does not fit the tree-sitter core.
