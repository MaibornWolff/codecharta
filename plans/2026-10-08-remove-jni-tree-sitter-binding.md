---
name: Remove the JNI tree-sitter binding (3 of 3)
issue: -
state: todo
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

- [ ] Complete Task 1: Close what plans 1 and 2 left on JNI
- [ ] Complete Task 2: Remove the JNI code
- [ ] Complete Task 3: Decide what happens to the bonede jars
- [ ] Complete Task 4: Verify
- [ ] Complete Task 5: Clean-up

## Review Feedback Addressed

## Notes

- If plan 1 is done before plan 2, the ported languages already run on FFM and this plan is mostly removal
- Task 3 is a decision for the team, not a technical necessity; the plan is complete with the jars kept
