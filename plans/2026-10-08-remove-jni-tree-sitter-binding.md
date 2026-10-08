---
name: Remove the JNI tree-sitter binding (3 of 3)
issue: -
state: complete
version: -
---

## Goal

Nothing in the analysis parses with the bonede JNI binding any more: metrics, text extraction and dependency
extraction of all languages run on the FFM layer, and the JNI code paths are gone.

## Tasks

### 1. Close what plans 1 and 2 left on JNI
- Check with a search for `org.treesitter` in main code; expected leftovers are `TsNodeSyntaxNode`,
  `LanguageRegistry.getJniLanguage` and tests that parse through them
- If a language ported in plan 2 still parses with JNI, switch it as in plan 1 and compare its output again

### 2. Remove the JNI code
- Delete `TsNodeSyntaxNode`, `getJniLanguage` and the JNI language table; tests parse with `FfmSyntaxTree`
- `SyntaxNode` then has one implementation: decide whether the interface stays as the seam for extractors
  (recommended, it keeps `FfmNode` internal) and simplify the architecture rule on node lifetime
- Plan 1 kept the exemption for `QualifiedIdentifierPath` on purpose; removing it means the class stops holding
  a node
- The default `children()` and `namedChildren()` of `SyntaxNode` serve only `TsNodeSyntaxNode`: make them abstract

### 3. Decide what happens to the bonede jars
- The native grammar libraries are unpacked from the bonede jars, so the jars stay on the class path even without
  their Java classes
- Options: keep the jars as carriers of the native libraries, or bundle the libraries ourselves as the Windows core
  already is; the second removes a dependency but adds a build and a license duty per grammar
- Whichever is chosen, the platform job `native_tree_sitter_libraries` must keep loading all grammars on all five
  platforms

### 4. Verify
- All analysis suites and the integration tests
- The three parsers on the 18 sample projects and the large corpora against the outputs of plan 2
- Start `ccsh` on Java 22, the minimum

### 5. Clean-up
- Update the module README and `ideas/treesitter-binding/README.md` to the finished state
- No changelog entry unless the jar decision changes the distribution

## Steps

- [x] Complete Task 1: Close what plans 1 and 2 left on JNI
- [x] Complete Task 2: Remove the JNI code
- [x] Complete Task 3: Decide what happens to the bonede jars
- [x] Complete Task 4: Verify
- [x] Complete Task 5: Clean-up

## Decisions

- Bonede jars: kept as carriers of the native libraries, on the runtime class path only, so `org.treesitter` can
  no longer be compiled against. The distribution is unchanged apart from the removed classes; no changelog entry
- `SyntaxNode` stays as the seam for extractors; `children()` and `namedChildren()` are abstract
- `QualifiedIdentifierPath` hands the leaf to a reader instead of holding it; the node lifetime rule has no exemption

## Results

- Task 1: main code used `org.treesitter` only in `TsNodeSyntaxNode` and `getJniLanguage`; no language parsed with
  JNI. Three tests did and now parse with `FfmSyntaxTree`; the cases of `TsNodeSyntaxNodeTest` were already covered
  by `FfmSyntaxTreeTest`
- Unit tests (6,323), `ktlintCheck` and the integration tests pass
- `unifiedparser`, `domainlanguageparser` and `dependencyparser`, build before this plan against the build after,
  on 24 projects (17 corpora of plan 1, Go standard library, cpython, wordpress, vue2 and the edge cases of plan 2,
  `analysis` and `visualization/app` of this repository): all 72 outputs byte-identical
- The fat jar differs from the one before only by the removed classes

## Not done

- The 18 sample projects of plan 1 are not on this machine; only their outputs are
- `ccsh` on Java 22 was not started locally: no JDK 22 here and the download is blocked. The CI job
  `native_tree_sitter_libraries` runs `ccsh` on Java 22 on all five platforms
- One `unifiedparser` run on vue2 failed in `ProgressTracker.getClearingSpaces` (`repeat` with a negative count,
  `lastLineLength` is written by several threads without synchronisation); six reruns were identical to the
  reference. The class is untouched by this plan; fixed in `2026-10-08-progress-bar-thread-safety.md`

## Review Feedback Addressed

## Notes

- If plan 1 is done before plan 2, the ported languages already run on FFM and this plan is mostly removal
- Task 3 is a decision for the team, not a technical necessity; the plan is complete with the jars kept
