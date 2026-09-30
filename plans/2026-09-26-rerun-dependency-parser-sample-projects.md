---
name: Rerun the dependency parser on the sample projects
issue: -
state: progress
version: -
---

## Goal

Check whether the parser changes since the 2026-09-06 sample-project runs (Sonar refactor, leaf file list)
changed any dependency parser result, and update the language findings where they did.

## Tasks

### 1. Rerun
- Run `dependencyparser` (plain and `--include-tests`) for the 13 supported languages into `output-rerun/`

### 2. Diff
- Compare file edges, flags, leaves and leaf edges against the old `output/`, ignoring the leaf file list

### 3. Analyse
- One subagent per language with real differences: re-check its `FINDINGS.md`

## Steps

- [x] Complete Task 1: Rerun
- [x] Complete Task 2: Diff
- [x] Complete Task 3: Analyse (not needed, no behaviour change)

## Notes

- Domain language parser not rerun: nothing in it changed
- Result: 11 of 13 languages identical. C#: the partial-class leaf now lists both files (intended, from the
  leaf file list); edges and cycle flags unchanged. TypeScript: `typings/*.d.ts` are missing from the sample
  project because the root `.gitignore` ignores `typings/`, so they were never committed; not a parser change
