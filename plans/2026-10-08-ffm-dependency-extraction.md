---
name: FFM binding for dependency extraction in the excavation site (1 of 3)
issue: -
state: complete
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

- [x] Complete Task 1: A node scope for extraction without a walk
- [x] Complete Task 2: Children in linear time
- [x] Complete Task 3: Switch the parse
- [x] Complete Task 4: Verify and benchmark
- [x] Complete Task 5: Clean-up

## Review Feedback Addressed

## Notes

- Gate met: `ccsh dependencyparser` is byte-identical to `main` on the 18 sample projects and 12 large corpora
- API level: 1,154 of 46,768 files differ from JNI, all start with a byte order mark that JNI dropped; with the six
  characters neutralised 0 differ
- Speedup of `ccsh dependencyparser`: 3.5× (guava) to 111× (efcore); the graph phases are what is left
- One scope per function is enough (at most 65 MiB per file). The one exception was C#, 6.7 GiB for a generated file:
  its extractor searched the whole tree for the file-scoped namespace per declaration. That search was fixed instead
  of scoping the per-declaration loops, so this plan does change one extractor
- Children: the first 4 by index, the rest by cursor. A cursor for all children costs "first child of type X" the
  whole list; an index for all costs 20–25 % on vscode and godot. Text extraction is unchanged in output and speed
- `QualifiedIdentifierPath` keeps its exemption: it is read and dropped by the function that walked the path
- Timeout: the analysis of a file is one blocking call on one thread of the parse dispatcher; a tree on a second
  thread would fail `should extract every file with a per-file timeout enabled`
- Changelog: a leading byte order mark never reached `ccsh`, so the only Fixed entry is U+FEFF/U+FFFE/U+FFFF inside
  a file, added to the existing entry
- `getJniLanguage` and `TsNodeSyntaxNode` are used by tests only; the four query-based analyzers create their
  grammars themselves
- Results, benchmark and tools: `analysis/ideas/treesitter-binding/RESULTS-dependency-extraction.md` (git-ignored)
- Go, Python, PHP and Vue are not touched here: plan 2 of 3
