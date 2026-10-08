---
name: Port the query-based dependency analyzers into the excavation site (2 of 3)
issue: -
state: todo
version: -
---

## Goal

The Go, Python, PHP and Vue analyzers of the `DependencyParser` stop using tree-sitter queries and the JNI binding
directly. Their logic moves into `treeSitterExcavationSite` as `DependencyMapping` extractors on `SyntaxNode`, in the
style of the other languages. After plan 1 they then parse with FFM without further work.

## Tasks

### 1. Pin today's behaviour
- Per language, dump `ccsh dependencyparser` output of `main` for its sample project and one large repository
  (Go stdlib, django, laravel, element-plus); these are the reference for every later step
- List what each query file extracts: 7 Go, 5 Python, 15 PHP and 3 Vue files, about 1,900 lines, 21 of them with a
  `TSQuery`

### 2. Port one language at a time: Go, Python, PHP
- New `languages/<lang>/<Lang>DependencyMapping.kt` with `extractPackagePath`, `extractImports` and
  `extractDeclarations`, extractors under `languages/<lang>/extractors/`
- Replace each query by traversal (`children`, `findAllDescendantsOfType`, field lookups); no query support is added
  to the FFM layer
- The analyzer in the `DependencyParser` shrinks to what `BaseLanguageAnalyzer` does for the other languages; what
  stays is resolution that needs more than one file
- Move the analyzer tests' cases to excavation-site tests where they test extraction; keep the end-to-end ones
- Compare with the reference of task 1 after each language, commit per language

### 3. Port Vue
- Today a Vue file is parsed with the Vue grammar for the template and the script block, then the script goes
  through `TreeSitterDependencies`
- Decide after reading `VueAnalyzer`: keep the Vue grammar through FFM (add its `GrammarLibrary`, check the library
  is bundled for all five platforms), or reuse the `VueScriptExtractor` preprocessor of metrics and text extraction
  and find component usages in the template another way
- Template component usage must keep producing the same edges

### 4. Verify and benchmark
- Suites: excavation site, `DependencyParser`
- Sample projects and large corpora against the reference, whole `dependency` lens
- Wall time per language, before and after

### 5. Clean-up
- Delete the query utilities (`TreeSitterUtils.kt`) and the direct tree-sitter dependencies of the
  `DependencyParser` module
- Changelog only for a difference a user can see

## Steps

- [ ] Complete Task 1: Pin today's behaviour
- [ ] Complete Task 2: Port Go, Python, PHP
- [ ] Complete Task 3: Port Vue
- [ ] Complete Task 4: Verify and benchmark
- [ ] Complete Task 5: Clean-up

## Review Feedback Addressed

## Notes

- Gate: 0 differing outputs, or each difference explained and fixed
- This is a rewrite, not a switch: queries and traversal can disagree on aliased and error nodes, so the corpus
  comparison per language is the main safeguard
- Depends on plan 1 only for the speedup; the port itself works on the JNI adapter too, so the order can be
  swapped if plan 1 is delayed
- Largest uncertainty: PHP (15 files) and the Vue template
