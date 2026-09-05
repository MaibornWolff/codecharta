---
name: Fix the pre-push review findings of the dependency parser
issue: <#issueid>
state: complete
version: 1
---

## Goal

Close the defects the pre-push review of `feature/dependency-parser` found: the input layer ignores
the common exclusion options and single-file inputs, the two projections disagree on duplicate
declarations, `.mts`/`.cts`/`.mjs`/`.cjs` never resolve, results depend on directory listing order, and
a handful of smaller model, reader and documentation gaps.

## Tasks

### 1. Input layer honours the common options and a single file
- Extract the identical `determineExclusionPatterns` of `UnifiedParser` and `RawTextParser` into
  `CommonAnalyserParameters` (tidy first), then use it in `DependencyParser`.
- `FileScanner` takes exclude patterns, applies them like `ProjectScanner` does, and returns a sorted list.
- A single-file input scans only that file; the parent directory is the analysis root.
- `-bf` and `--local-changes` cannot mean anything for a whole-graph analysis: reject them with a message.
- Drop `spec`/`specs` from the test-directory set (DependaCharta parity).

### 2. Extension handling
- TS/JS analyzers derive the extension from the file name, case-insensitively, and know
  `.mts/.cts/.mjs/.cjs`; `stripSourceFileExtension` does the same.

### 3. Duplicate declaration ids
- `FileLevelAggregator` takes the source file from the node itself and the target file from the first
  declaration of an id, matching `declarationsById`; the dropped duplicate's edges are dropped with it.

### 4. Model and reader
- `LeafEdge` and `Edge` DTOs tolerate a missing `attributes`.
- `LeafEdge` merge keeps the first weight, like `Edge`; `rekeyed` prunes namespaces without leaves.
- `mergeLeaves` names the conflicting leaf; `pointsUpwards` only swallows `IllegalStateException`.
- `TsConfigParser` drops nulls from trailing-comma arrays and its KDoc stops claiming otherwise.
- `ccsh check` validates `leafEdges` endpoints and `nodes` keys.

### 5. Visualization
- IndexedDB migration to v20 seeding `dependencyLevels`.

### 6. Tests and docs
- Re-add the ported tests that were lost: `wrapInVirtualRootIfNeeded`, C++ header/source merge,
  extraction timeout, scanner exclusions.
- README, gh-pages page (parameters, test dirs), importer deprecation note.

## Steps

- [x] Complete Task 1: input layer
- [x] Complete Task 2: extension handling
- [x] Complete Task 3: duplicate declaration ids
- [x] Complete Task 4: model and reader
- [x] Complete Task 5: visualization
- [x] Complete Task 6: tests and docs

## Notes

- Merge semantics of `edges` (first weight wins) predate this branch; `leafEdges` follow them rather
  than the other way round, so merging a project with itself does not double-count.
- The build-folder fallback follows the rule `UnifiedParser` and `RawTextParser` already apply (no root
  `.gitignore` and no `-ibf`), now shared in `CommonAnalyserParameters`, so the three parsers agree.
- Not done, by decision: `-bf`/`--local-changes` are rejected rather than implemented, since a
  dependency graph over a subset of files is meaningless; the branch name keeps its form.
