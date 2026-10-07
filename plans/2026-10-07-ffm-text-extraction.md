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
- Test that no helper keeps a node beyond its visit

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

## Notes

- Scope is text extraction; dependency extraction keeps the JNI parse (follow-up in the detailed plan)
- All extractor files take `SyntaxNode`, the dependency ones too, because they share `TreeTraversal`; the
  dependency path reaches them through the `TsNodeSyntaxNode` adapter
- Beyond the detailed plan: nodes remember the parent they were reached from. tree-sitter finds a parent by
  searching from the root, which was most of the extraction time and independent of the binding
- The JNI binding drops U+FEFF, U+FFFE and U+FFFF and replaces form feed, vertical tab and U+001F before parsing;
  the old `TreeSitterExtraction` returned shifted text for such files. These are the only differences at the API.
  The parsers strip a leading byte order mark in the shared file scanner, so in `ccsh domainlanguageparser` only
  the form feed case is visible
- Results and benchmark: `analysis/ideas/treesitter-binding/RESULTS-text-extraction-domain.md` (local, the folder
  is git-ignored)
- Open: `TreeSitterDependencies` still returns shifted text for the three dropped characters, since it parses with JNI
