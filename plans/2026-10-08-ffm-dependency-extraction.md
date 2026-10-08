---
name: FFM binding for dependency extraction in the excavation site (1 of 3)
issue: -
state: progress
version: -
---

## Goal

`TreeSitterDependencies` parses with the FFM binding instead of JNI, for the languages it serves today (Java, Kotlin,
C#, C/C++, JavaScript, TypeScript, TSX, Delphi, Rust). `ccsh dependencyparser` output stays identical or every
difference is explained, and the speedup is measured. Continues on `tech/-/ffm-text-extraction`.

## Tasks

### 1. A node scope for extraction without a walk
- Dependency extraction hands the root to three functions (package, imports, declarations) that traverse on their
  own, so nothing releases nodes as `walk` does
- Give `FfmSyntaxTree` a scope that releases every node reached inside it; `DependencyCollector` runs each of the
  three functions in one, since they return plain data
- Measure peak native memory on the largest corpus files; if one scope per function is too coarse, scope the
  per-declaration loops as well
- `QualifiedIdentifierPath` keeps a node: confirm it never leaves its scope, then drop its exemption from the
  architecture rule or justify it there

### 2. Children in linear time
- `children()` and `namedChildren()` call `getChild(i)`, which tree-sitter answers in O(i); the dependency
  extractors use them about 180 times and collect descendants recursively
- Iterate children with a cursor (`ts_tree_cursor_goto_first_child` / `goto_next_sibling`) behind `SyntaxNode`
- Benefits text extraction too; check its output and speed again

### 3. Switch the parse
- `DependencyCollector` takes the `FfmGrammar` from `LanguageRegistry.getGrammarLibrary`, as text extraction does
- `DependenciesFacade` and `TreeSitterDependencies` stop passing a `TSLanguage`
- The per-file timeout of the `DependencyParser` runs the analysis on another dispatcher: confirm a tree is parsed,
  read and closed on one thread

### 4. Verify and benchmark
- Module suites: excavation site, `DependencyParser` (649 tests)
- `ccsh dependencyparser` from `main` and from the branch on the 18 sample projects and the large corpora of the
  text extraction results; compare the whole `dependency` lens, not only counts
- API level: `TreeSitterDependencies.analyze` per file in both builds, as `ExtractionDump` does for text
- Known JNI differences to check on purpose: U+FEFF, U+FFFE, U+FFFF (dropped), form feed, vertical tab, U+001F
  (replaced), lone surrogates (JNI throws)
- Wall time per large corpus, before and after

### 5. Clean-up
- Changelog: faster `dependencyparser`, plus a Fixed entry per explained difference
- `TsNodeSyntaxNode` and `LanguageRegistry.getJniLanguage` stay until plan 3; they still serve tests and the four
  query-based analyzers' grammars

## Steps

- [ ] Complete Task 1: A node scope for extraction without a walk
- [ ] Complete Task 2: Children in linear time
- [ ] Complete Task 3: Switch the parse
- [ ] Complete Task 4: Verify and benchmark
- [ ] Complete Task 5: Clean-up

## Review Feedback Addressed

## Notes

- Gate: 0 differing outputs, or each difference explained and fixed, as for text extraction
- The 41 dependency extractors already take `SyntaxNode`, so this is a change of the parse and of node lifetime,
  not of extractor code
- A remembered parent exists only for nodes reached through `getChild`/`getNamedChild`; ten extractors climb
  ancestors from collected descendants, which keeps that path fast
- Go, Python, PHP and Vue are not touched here: plan 2 of 3
