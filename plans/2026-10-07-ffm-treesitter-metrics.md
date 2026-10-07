---
name: FFM tree-sitter binding for metrics in all languages
issue: none yet
state: complete
version: 1
---

## Goal

Every language `TreeSitterMetrics` supports computes its metrics through our own FFM layer instead of the
bonede JNI binding, with identical output. Detailed background: `analysis/ideas/treesitter-binding/`.

## Decisions

- Minimum Java at runtime: **22** (built with JDK 25, class files target 22).
- End state: all 19 languages on FFM, **no fallback switch**, JNI metric walk and adapter removed.
- Verification: JNI vs. FFM comparison on large code bases **locally only**; CI gets the platform matrix.
- Low-level bindings: jextract if it can be obtained, otherwise hand-written layouts checked against `api.h`.

## Tasks

### 1. Foundation
- Apply the Go prototype, target Java 22, upgrade JaCoCo
- Grammar registry `Language → (library, symbol)`
- Native loader: versioned cache dir, safe for concurrent processes, clear errors
- `--enable-native-access=ALL-UNNAMED` in both start scripts
- Robustness: unparsable file, huge file, lone surrogates

### 2. Roll out all languages
- Route all 19 languages through FFM
- Compare `ccsh unifiedparser` output of the unmodified build against the FFM build per language; gate: 0 diffs
- Record timings

### 3. CI
- Test that loads and parses all 19 grammars, run on Linux, macOS and Windows runners
- CI and docs on the new Java version

### 4. Clean-up
- Remove the JNI metric walk and the `TsNodeSyntaxNode` adapter
- Changelog (breaking: Java 22), README, CLAUDE.md

## Steps

- [x] Complete Task 1: Foundation
- [x] Complete Task 2: Roll out all languages
- [x] Complete Task 3: CI
- [x] Complete Task 4: Clean-up

## Notes

- Verified: 0 differing metric values in 23 corpora covering all 19 languages (results in
  `analysis/ideas/treesitter-binding/RESULTS-metrics-all-languages.md`); `./gradlew build integrationTest` green.
- Open: the struct layouts in `TreeSitterApi.java` are hand-written, because jextract could not be downloaded in
  the sandbox. The CI platform matrix has not run yet.
- Text extraction and the DependencyParser keep the bonede JNI binding; the bonede jars stay as carriers of
  the grammar binaries.
