---
name: Script to compare DependaCharta and ccsh dependencyparser output
issue: <#issueid>
state: complete
version: 1
---

## Goal

A script that runs DependaCharta and `ccsh dependencyparser` on the same project (or takes two
existing output files) and reports where their dependency graphs differ, so regressions in the port
are visible without reading two JSON files side by side.

## Tasks

### 1. Normalise both outputs into one model
- DependaCharta `.cg.json`: leaves from `leaves`, leaf edges and levels from `projectTreeRoots`
  (the tree carries the real `isPointingUpwards`; the `leaves[].dependencies` copy always says false),
  namespace levels from the non-leaf tree nodes, file edges by collapsing leaf edges on `physicalPath`
- cc.json 2.0: `lenses.dependency` (`leaves`, `leafEdges`, `namespaces`, `edges`), node ids resolved
  to paths through the `files` tree

### 2. Diff and report
- Sections: leaves, leaf edges, namespaces, file edges — each with only-in-DependaCharta,
  only-in-CodeCharta and field-level differences
- Summary table, capped detail lists, `--json` dump, non-zero exit when the outputs differ

### 3. Run mode
- `analysis/script/compare_dependency_parsers.py <project>` runs both tools into a work dir with
  matching defaults (tests excluded, DependaCharta's file size and timeout limits), then compares
- `--dependacharta-json` / `--codecharta-json` compare files that already exist

## Steps

- [x] Complete Task 1: normalisation
- [x] Complete Task 2: diff and report
- [x] Complete Task 3: run mode, README pointer

## Notes

- Python 3, standard library only, next to the other helper scripts under `analysis/script/`.
- The DependaCharta jar is not part of this repo; the script looks for `DEPENDACHARTA_JAR`, then the
  local checkout under `Ideas/DC`, otherwise `--dependacharta-jar` is required.
- Folder levels are not compared: DependaCharta has none, CodeCharta levelizes the physical tree too.
- The checkout's `bin/dependacharta.jar` is from June and predates DependaCharta's Kotlin support (it
  found 1 of 57 files in `analysis/model`); `build/libs/dependacharta.jar` from a fresh `fatJar` is
  preferred. Self-edges and the container node DependaCharta adds for a class with nested declarations
  are filtered out, since ccsh drops both by design.
- Verified 2026-09-05: outputs agree on the Java contract sample, the Go example, `analysis/model`
  (Kotlin) and `visualization/app/codeCharta/stores` (TypeScript).
