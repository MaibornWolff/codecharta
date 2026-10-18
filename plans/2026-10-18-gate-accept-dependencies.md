---
name: gate-accept-dependencies
issue: none
state: complete
version: 1.0.0
---

## Goal

Let `.codecharta.yml` accept one known cycle or upward dependency by the exact files it runs between, with a
reason, and have `ccsh gate` warn when an accepted one no longer exists so the entry gets removed. Triggered by the
recursive `explorerTreeLevel` component, whose template file cycle the Angular support now reports.

## Tasks

### 1. Read `accept` in the dependency rules
- `cyclesBetweenFiles` and `cyclesInsideFiles`: entries of `files` (exact paths, relative to `input`, no globs) and
  `reason`; `upward`: entries of `from`, `to` and `reason`
- Report a malformed entry like any other config error (missing files, glob characters, a single file for
  `cyclesBetweenFiles`, more than one for `cyclesInsideFiles`)
- `ignore` stays as it is

### 2. Skip what an entry accepts
- A cycle is accepted when its set of files equals an entry's files, in any order
- An upward dependency is accepted when its files equal `from` and `to`
- Keep the rule evaluator small: matching goes into its own class

### 3. Warn about stale entries
- An entry that accepted nothing in this run becomes a warning: the cycle or dependency between the files no longer
  exists, remove the entry
- Reported like an unmatched pattern, with the setting path and the files

### 4. Docs and changelog
- `gh-pages/.../analysis/quality-gate.md`: `accept` beside `ignore`, when to use which
- `analysis/CHANGELOG.md`: the gate is unreleased, so its Added entry is rewritten instead of adding one

## Steps

- [x] Complete Task 1: Read `accept` in the dependency rules (TDD)
- [x] Complete Task 2: Skip what an entry accepts (TDD)
- [x] Complete Task 3: Warn about stale entries (TDD)
- [x] Complete Task 4: Docs and changelog
- [x] `./gradlew ktlintCheck test`, `npm run format:check`, gate on `analysis` and `visualization`
- [x] Accept the `explorerTreeLevel` cycle in `visualization/.codecharta.yml`

## Notes

- Built on `feature/angular-and-sql-support`, which needs it: the Angular support is what reports the
  `explorerTreeLevel` cycle
- An entry counts as used when it matches a cycle the rule sees, ignored or not, so stale means the cycle is gone
- The visualization's dependency view does not read `.codecharta.yml`, so `cycleChains.ts` needs no change
