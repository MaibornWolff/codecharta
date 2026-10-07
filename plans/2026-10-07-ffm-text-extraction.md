---
name: FFM binding for text extraction (DomainLanguageParser)
issue: -
state: complete
version: -
---

## Goal

`ccsh domainlanguageparser` gets identifiers, comments and strings through the FFM tree-sitter layer instead of the
JNI binding, with identical output and a measured speedup. Detailed plan:
`analysis/ideas/treesitter-binding/PLAN-text-extraction-domain.md`; the decisions follow its recommendations.

## Tasks

### 1. Extend the FFM layer
- Downcalls and `SyntaxNode` members for `startByte`, `endByte`, `namedChildCount`, `getNamedChild`, `prevSibling`, `text`
- Node equality, which the extractors rely on
- Export check of the Windows core workflow

### 2. Move the extractors to `SyntaxNode` (structural)
- All extractor files, `TreeTraversal`, `Extract`, the common extractors take `SyntaxNode`
- Text and dependency extraction still parse with JNI through a `TsNodeSyntaxNode` adapter

### 3. Parse and walk text extraction with FFM (behavioural)
- `DirectTextExtractor` uses `FfmSyntaxTree`; `getNodeText` returns `node.text`
- Architecture rule against a node kept in a field of an extractor

### 4. Verify and benchmark
- Module and `DomainLanguageParser` test suites, ktlint
- API-level comparison of `(text, context)` lists and comparison of the parser output, JNI build against FFM build
- Benchmark on large corpora, recorded in a results file next to the metrics results

### 5. Clean-up
- Remove the source code parameter of the extractors and the unused JNI tree walker
- Changelog

## Steps

- [x] Complete Task 1: Extend the FFM layer
- [x] Complete Task 2: Move the extractors to `SyntaxNode`
- [x] Complete Task 3: Parse and walk with FFM
- [x] Complete Task 4: Verify and benchmark
- [x] Complete Task 5: Clean-up

## Review Feedback Addressed

1. **Remembered parent**: a child fetched by field name and a previous sibling got the wrong parent; both ask tree-sitter again
2. **Null-node checks**: the rewritten checks reach fallbacks that used to throw; an Objective-C method without a selector name no longer reports its parameter as the name
3. **Walk**: one stack of open ancestors, allocator marks named as marks
4. **Node contract**: lifetime and null nodes are stated on `SyntaxNode` and `FfmNode`
5. **Clean-up**: `orNull()` and `ancestors()`, dead code and suppressed warnings removed, tree helpers moved next to `SyntaxNode`, JNI adapter in its own package
6. **Tests**: JNI adapter covered, architecture rule states what it checks, invisible characters escaped
7. **Changelog**: entries for U+FEFF/U+FFFE/U+FFFF inside a file and for the Objective-C case

## Notes

- Scope is text extraction; dependency extraction keeps the JNI parse and reaches the extractors through `TsNodeSyntaxNode`
- Beyond the detailed plan: nodes remember their parent, which gave most of the speedup
- Output differs from `main` only for files with U+FEFF, U+FFFE, U+FFFF, form feed, vertical tab or U+001F, and for files `main` skipped
- Open: `TreeSitterDependencies` returns shifted text behind U+FEFF, U+FFFE and U+FFFF; ten ancestor loops in the dependency extractors could use `ancestors()`
- Results and benchmark are in `analysis/ideas/treesitter-binding/RESULTS-text-extraction-domain.md`, a git-ignored folder
