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
- Measure peak native memory on the largest corpus files. Done differently than planned: one scope per function
  was too coarse only for C#, whose extractor searched the whole tree per declaration; that search was fixed
  instead of scoping the per-declaration loops
- `QualifiedIdentifierPath` keeps a node: confirm it never leaves its scope, then drop its exemption from the
  architecture rule or justify it there

### 2. Children in linear time
- `children()` and `namedChildren()` call `getChild(i)`, which tree-sitter answers in O(i); the dependency
  extractors use them about 180 times and collect descendants recursively
- Iterate children with a cursor (`ts_tree_cursor_goto_first_child` / `goto_next_sibling`) behind `SyntaxNode`;
  `children()` and `namedChildren()` became members of `SyntaxNode` for that
- Nine early-exit loops over `getChild(i)` stay in the Objective-C, C++ field and string extractors
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
- `TsNodeSyntaxNode` and `LanguageRegistry.getJniLanguage` stay until plan 3; they serve tests only

## Steps

- [x] Complete Task 1: A node scope for extraction without a walk
- [x] Complete Task 2: Children in linear time
- [x] Complete Task 3: Switch the parse
- [x] Complete Task 4: Verify and benchmark
- [x] Complete Task 5: Clean-up

## Review Feedback Addressed

Eight reviewers (clean code, comments, simplicity, readability, bugs, full test suite, general, plan check).

1. **Deep nesting**: the recursive descents of `TreeTraversal` overflowed the stack at half the depth `main`
   reached and aborted the run; they are iterative now, a chain of 50,000 concatenations is extracted
2. **Children**: a cursor for all children instead of the first four by index; on the corpora the two were within
   noise, so the simpler one stays
3. **C# namespace lookup**: a lazy value instead of a map that could hold one key; tests for sibling declarations
   behind a file-scoped namespace and beside a block namespace
4. **Node lifetime wording**: `FfmNode`, `SyntaxNode`, the architecture rule and the dependencies README state when
   a node stops being valid outside a walk, and what an extractor author must not do
5. **Changelog**: the scanner removes every byte order mark, so for `dependencyparser` only U+FFFE and U+FFFF were a
   bug; entries are limited to the nine languages; a new entry for deeply nested code
6. **Verification gaps**: `.c` files analysed as C++ in the API dump and the memory report, postgres added; tests
   for vertical tab and U+001F
7. **Tests and comments**: one helper for "every node", exact assertions, escaped invisible characters, narrating
   KDoc removed, one release helper for `walk` and `readReleasingReachedNodes`
8. **Not done**: no cap on node memory per file (a behaviour change for huge files, left for a decision in plan 2);
   `DependenciesFacade` and `DependencyCollector` stay two classes, like the other two features; the commits of
   this plan were not reordered

## Notes

- Gate met: `ccsh dependencyparser` is byte-identical to `main` on 27 projects (18 samples and 12 large corpora,
  three of which are the same repository)
- API level: 1,154 of 46,768 files differ from JNI, all start with a byte order mark that JNI dropped; with the six
  characters neutralised 0 differ
- Speedup of `ccsh dependencyparser`: 3.5× (guava) to 111× (efcore, including the C# fix); the graph phases are
  what is left
- One scope per function is enough (at most 65 MiB per file) once the C# search was fixed (6.7 GiB before)
- `QualifiedIdentifierPath` keeps its exemption: it is read and dropped by the function that walked the path
- Timeout: the analysis of a file is one blocking call on one thread of the parse dispatcher; argued from the code
  and covered only by `should extract every file with a per-file timeout enabled`
- The script block of a Vue file goes through `TreeSitterDependencies` and therefore parses with FFM already; its
  template, Go, Python and PHP are plan 2
- Measured on aarch64 Linux only
- Results, benchmark and tools: `analysis/ideas/treesitter-binding/RESULTS-dependency-extraction.md` (git-ignored)
