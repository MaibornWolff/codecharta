---
name: The resources/ fallback exclusion silently drops source files from the dependency graph
issue: <#issueid>
state: todo
version: 1
---

## Goal

`CodeChartaConstants.BUILD_FOLDERS` includes `/resources/`, applied to every analyser when the analysis
root has no `.gitignore`. For a dependency graph a dropped source file is not a dropped metric: its
declarations, its edges, and the levels and cycles that follow all change. Decide whether the
dependency parser should inherit that default, and make the drop visible either way.

## Tasks

### 1. Establish the scope of the problem
- `ccsh dependencyparser visualization/app` drops
  `codeCharta/resources/fixed-folders/fixed-folders-example.ts`, a real source file with real imports,
  because `app/` has no `.gitignore` of its own
- The same run keeps it when started from the repository root, so the graph depends on where the
  analysis starts — that is the part worth fixing

### 2. Choose the behaviour
- Either drop `/resources/` from the fallback list for analysers that read source (it is aimed at
  `src/main/resources`, which holds no source), or keep it and let `--include-build-folders` opt back in
- Whichever way: report the count of files the fallback excluded, so a shrunken graph is never silent

## Steps

- [ ] Complete Task 1: confirm the scope across the analysers that share `SourceFileScanner`
- [ ] Complete Task 2: decide, implement, report the exclusions

## Notes

- Low priority: it only bites when the analysis root has no `.gitignore`, and `-ibf` is a workaround.
- Not a DependaCharta difference — DependaCharta has no such exclusion, which is why its output has the
  file and ours does not.
- `BUILD_FOLDERS` is shared by every analyser, so a change here is not local to the dependency parser.
