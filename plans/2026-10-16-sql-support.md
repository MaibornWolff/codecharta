---
name: SQL support with an own coarse tree-sitter grammar
state: complete
version: 1
---

## Goal

Parse SQL of all common dialects (ANSI, T-SQL, PL/SQL, PL/pgSQL, MySQL) without choosing one, and feed
the metrics, dependency and domain lenses. No existing grammar covers procedural logic across dialects,
so we write our own coarse grammar: exact for what CodeCharta counts, opaque for everything else.

## Tasks

### 1. Grammar
- Source in `analysis/treeSitterExcavationSite/grammars/sql/` (grammar.js, generated src/, test/corpus)
- Exact: procedures, functions, triggers, packages, views, tables; IF/ELSIF/ELSE, WHILE, LOOP, FOR,
  CASE WHEN, TRY/CATCH, EXCEPTION WHEN; AND/OR; joins, subqueries, CTEs; object references in
  FROM/JOIN/INTO/UPDATE/EXEC/CALL; comments
- Everything else parses as an opaque statement instead of ERROR nodes
- Tune against public open-source SQL (MIT/Apache) for every dialect, count ERROR nodes

### 2. Grammar jar
- Build with a scratch clone of bonede/tree-sitter-ng (`gen`), commit to `treeSitterExcavationSite/libs/`

### 3. Language in treeSitterExcavationSite
- `Language` entry, registry, `languages/sql/` definition with metric and extraction mappings
- Dependencies: references to tables, views and procedures → the file that creates them

### 4. Wiring, samples, docs
- `FileExtension` (`.sql`, plus Oracle `.pks .pkb .pls`), UnifiedParser, DependencyParser,
  DomainLanguageParser registration
- `sample-projects/sql/` (Cellars and Centaurs) with `FINDINGS.md`
- READMEs, docs, `analysis/CHANGELOG.md`

## Steps

- [x] Complete Task 1: Grammar
- [x] Complete Task 2: Grammar jar
- [x] Complete Task 3: Language in treeSitterExcavationSite
- [x] Complete Task 4: Wiring, samples, docs

## Notes

- Branch `feature/sql-support`, own worktree, committed but not pushed
- Visual Basic is out of scope for now
