---
name: Reduce file complexity below 100
issue: -
state: complete
version: -
---

## Goal

The sample maps of CodeCharta itself show 18 files with a complexity over 100. Bring every one of them (except the
developer script `analysis/script/compare_dependency_parsers.py`, left as is) well below 100 by removing duplication,
splitting files along their existing responsibilities, and turning repetitive tests into parameterized tests.

## Tasks

### 1. Visualization production code
- `indexedDBWriter.ts`: move the cc state migrations out, collapse the copy-pasted V4–V9 key moves into one helper
- `loadInitialFile.store.ts`: replace the `mapXToAction` switches with typed lookup tables
- `threeSceneService.ts`: extract floor labels, highlighting and selection painting into helpers
- `fileValidator.ts`: split into entry point, fixed-folder checks, uniqueness checks, cc.json 2.0 warnings

### 2. Visualization specs
- `indexedDBWriter.spec.ts`: mirror the source split
- `codeMap.mouseEvent.service.spec.ts`: shared setup helper, split into hover / click / lifecycle specs

### 3. Analysis production code
- `javascript/extractors/DeclarationExtractor.kt`: move `DeclarationPrepass` and export-statement handling out

### 4. Analysis tests
- `DialogProviderTest`: one file per prompt type
- `GoAnalyzerTest`: split by topic, drop the leftover debug test
- Tree-sitter dependency tests (TypeScript, Delphi, C++) and extraction tests (C, JavaScript, Objective-C, C++, C#):
  parameterize tests of the same shape, split by topic where still needed

## Steps

- [x] Complete Task 1: Visualization production code
- [x] Complete Task 2: Visualization specs
- [x] Complete Task 3: Analysis production code
- [x] Complete Task 4: Analysis tests
- [x] Re-measure all touched files, run the full checks

## Notes

- Target: every resulting file at complexity 60 or below, measured with the installed `ccsh unifiedparser`
- Structural only: no behaviour change, no changelog entry
