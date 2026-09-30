---
name: Run the DependencyParser in simplecc.sh
issue: -
state: complete
version: -
---

## Goal

Run the dependency parser as a regular step of `simplecc.sh`, merged with the other parsers' output in the one
merge and reported in the summary, instead of a second merge that `simplecc-local.sh` ran after the summary.

## Tasks

### 1. Dependency step in simplecc.sh
- `run_dependency_analysis` after the domain language step, skipped when ccsh has no `dependencyparser`
- Listed in `--help` and in the summary's recommended defaults as experimental

### 2. simplecc-local.sh back to a thin wrapper
- Only puts the locally built ccsh on PATH and hands over to `simplecc.sh`

## Steps

- [x] Complete Task 1: Dependency step in simplecc.sh
- [x] Complete Task 2: simplecc-local.sh back to a thin wrapper

## Notes

- Replaces the approach of `plans/2026-09-29-dependency-parser-in-simplecc-local.md`; runs for everyone (decided
  2026-09-30)
- Verified on a copy of `sample-projects/java`: one merge of 4 files, 43 levels and 45 edges (12 cyclic, 2 upward),
  every id resolves; with a ccsh lacking the parser the step shows under "Skipped steps"
