---
name: fix the accepted kotlin parser findings
issue: none
state: complete
version: 1
---

## Goal

Fix the accepted items of `sample-projects/kotlin/FINDINGS.md` in the Kotlin parts of the three parsers, plus three
shared items Christian chose: per-function statistics, the domain parser word splitting and weights, and the silent
drop under a non-UTF-8 locale. Work stays uncommitted on `main`.

## Decisions

- In scope: every accepted Kotlin item of the unified and the dependency parser, the two round 4 items (recorded as
  accepted), nested functions and expression-body rloc per function, umlauts in comments and strings, weight 0, the
  non-UTF-8 locale.
- Out of scope: dependency counts per file and nested declarations keeping their enclosing class (shared, not chosen).
- Lambda rule: no lambda or anonymous function is a function, wherever it stands; they keep adding to complexity.
- Ignored items stay as they are (`else ->`, per-function complexity without the function, bodyless functions, `?:`,
  accessors and secondary constructors as functions).

## Tasks

### 1. Unified parser, Kotlin
- Count a `function_declaration` with a `function_body` at any child count (receiver + return type, modifiers, `where`,
  `reified`)
- Lambdas: `val f = { }` and `val f = fun() { }` no longer count as functions
- Secondary constructor: its body is measured (rloc, complexity per function)
- `when` guard (`is X if cond ->`) counts as a decision, if the grammar parses it
- Unified parser README lists `.kts`

### 2. Dependency parser, Kotlin
- Used types from secondary-constructor parameters, `catch`, `as` / `as?`, `is`, call type arguments of lower-case
  callees, lambda parameter types, `where` and `<T : X>` bounds, `::class`, function types, receiver types, delegated
  supertypes (`: X by y`), bare object / companion names used as values
- Aliased imports resolve through the alias; fully qualified names resolve to their package
- Top-level functions, properties and typealiases are leaves (`function`, `variable`, alias as `class`) and targets of
  function / constant imports; a file without any declaration keeps a node
- `fun interface` is a leaf of kind `interface`

### 3. Shared: per-function statistics
- Nested functions and object-expression methods get their own per-function entry (`MetricPerFunctionCalc`)
- An expression body that is a single token reports rloc 1 (`RealLinesOfCodeCalc`)

### 4. Shared: domain parser
- Comments and strings keep umlauts and `ß` inside words (`SplitStage`)
- `--comment-weight 0` / `--string-weight 0` are accepted and switch that source off

### 5. Shared: non-UTF-8 locale
- A file whose name cannot be decoded is reported instead of dropped silently, in all three parsers

### 6. Wrap up
- Re-run the three parsers on `sample-projects/kotlin`, compare with the report
- CHANGELOG entries (analysis), decisions of the round 4 items in `FINDINGS.md`, `REVIEW_PROGRESS.md` status
- `./gradlew ktlintCheck test`, `npm run format:check`

## Steps

- [x] Complete Task 1: Unified parser, Kotlin
- [x] Complete Task 2: Dependency parser, Kotlin
- [x] Complete Task 3: Shared per-function statistics
- [x] Complete Task 4: Shared domain parser
- [x] Complete Task 5: Shared non-UTF-8 locale
- [x] Complete Task 6: Wrap up

## Notes

- Kotlin grammar: `tree-sitter-kotlin` 0.3.8.1 (fwcd). It has no rule for `when` guards (ERROR, not counted, listed
  in `KNOWN_ISSUES.md`) nor for `fun interface` (two ERROR shapes, recognised by `FunInterfaceExtractor`).
- Shared changes Christian approved on 2026-10-14: a fully qualified name resolves before an import of the same simple
  name (`Node.resolveTypeImport`); `BaseLanguageAnalyzer.selectUsedTypes` receives the file's imports.
- Result on `sample-projects/kotlin`: dependency 79 of 79 expected file edges (was 57), 6 test edges with
  `--include-tests`, no false edge; 37 file nodes (was 33).
- Verified: `./gradlew ktlintCheck test` (5890 tests, 0 failures), `distTar` + `integrationTest` green.
