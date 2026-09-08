---
name: Name resolution must not guess between several same-named declarations
issue: <#issueid>
state: todo
version: 1
---

## Goal

When a used type cannot be resolved by import, package or alias, `Node.resolveTypeImport` falls back to
matching the bare name and returns the **first** candidate in scan order. With several same-named
declarations in the analysis root that fabricates edges between unrelated subsystems. It should decline
to resolve instead of guessing.

## Tasks

### 1. Stop the substring fallback from guessing
- The last resorts are a `contains` test on the dotted path under `fullPath.hasOnlyName()`, and
  `firstOrNull` / `foundInWithAlias.first()`
- When more than one candidate survives and nothing distinguishes them, resolve to nothing: a missing
  edge is safer than a wrong edge between two subsystems
- Tighten `contains` to a segment-boundary match so `analysis.node-wrapper.install.fs` stops matching
  the string `fs`

### 2. Prefer a candidate from the same project before one from anywhere else
- Same language first, then the nearest shared path prefix — most collisions are a second copy of the
  same code elsewhere in the root
- Two logical paths can also collide outright: PHP's `De\Sots\CellarsAndCentaurs\Domain\Model` and C#'s
  `De.Sots.CellarsAndCentaurs.Domain.Model` are the same key, so a C# class inherited a PHP interface

### 3. Report what was dropped
- Count unresolved used types per run and warn once with the count, the way skipped files are reported
- An edge silently invented is the failure mode this issue is about; an edge silently dropped must not
  replace it

## Steps

- [ ] Complete Task 1: decline to guess
- [ ] Complete Task 2: prefer same project
- [ ] Complete Task 3: report unresolved types
- [ ] Re-run the contract samples and `script/compare_dependency_parsers.py`, record the deviation in
      the parser README

## Notes

- Measured 2026-09-08 on a whole-repo run: after removing every difference caused by scope, barrels and
  `.mjs`/`.cjs` support, **75 of 7,609 leaf edges** are the genuine disagreement between ccsh and
  DependaCharta, and all 75 are this. 73 collide on the target name, 2 on the source.
- The two tools pick different candidates only because `SourceFileScanner` sorts by path while
  DependaCharta uses `File.walk()` order. Deterministic, but deterministically wrong.
- `training/` is the worst case: 12 language copies of one project, so `Creature` is declared 20 times,
  `CreatureId` 10, `Fightable` 11. Scoped to `training/rust` alone every type resolves correctly, so
  the shared root is the cause, not any one analyser.
- Expect this to *lose* edges that are right today by luck; the contract samples and the comparison
  script are the measure of whether the trade is worth it.
- Inherited from DependaCharta unchanged. Related: [the external-import half](2026-09-08-external-imports-resolve-to-project-declarations.md).
