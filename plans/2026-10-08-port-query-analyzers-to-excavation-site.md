---
name: Port the query-based dependency analyzers into the excavation site (2 of 3)
issue: -
state: complete
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
  through `TreeSitterDependencies`, which parses with FFM since plan 1
- Decide after reading `VueAnalyzer`: keep the Vue grammar through FFM (add its `GrammarLibrary`, check the library
  is bundled for all five platforms), or reuse the `VueScriptExtractor` preprocessor of metrics and text extraction
  and find component usages in the template another way
- Template component usage must keep producing the same edges

### 4. Verify and benchmark
- Suites: excavation site, `DependencyParser`
- Sample projects and large corpora against the reference, whole `dependency` lens
- Wall time per language, before and after

### 5. Port the bundler config reading
- `BundlerConfigParser` parses vite/webpack configs with the JNI JavaScript grammar; move that behind the
  excavation site too, so the module has no direct tree-sitter dependency left

### 6. Clean-up
- Delete the query utilities (`TreeSitterUtils.kt`) and the direct tree-sitter dependencies of the
  `DependencyParser` module
- Changelog only for a difference a user can see

## Steps

- [x] Complete Task 1: Pin today's behaviour
- [x] Complete Task 2: Port Go, Python, PHP
- [x] Complete Task 3: Port Vue
- [x] Complete Task 4: Verify and benchmark
- [x] Complete Task 5: Port the bundler config reading
- [x] Complete Task 6: Clean-up

## Review Feedback Addressed

## Notes

### Result

- Gate met: `ccsh dependencyparser -nc --include-tests` is byte-identical to the build before the port on seven
  corpora: the four planned (Go 1.23.1 standard library, django 5.1.1, laravel 11.23.5, element-plus 2.8.2) and
  three added for what those do not exercise (CPython 3.12.6 `Lib` and `Tools` for broken and old Python, WordPress
  6.6.2 for PHP without namespaces, vuetify 3.7.1 with vue-element-admin for Vue 2 and kebab-case tags)
- Analyzer level: the `FileReport` of every file, in the order the analyzer produced it, is identical for all
  20,740 Go, Python, PHP and Vue files of these corpora; no file failed before or after
- Time inside the analyzers, summed over 18 threads: Go 276 → 55 s, django 165 → 14 s, CPython 163 → 23 s,
  laravel 657 → 16 s, WordPress 703 → 19 s, element-plus 12.8 → 9.2 s, vuetify 13.2 → 6.5 s
- `ccsh` wall time: WordPress 51.4 → 1.7 s, laravel 42.7 → 2.3 s, django 12.2 → 3.5 s, CPython 13.4 → 5.1 s,
  Go 53.4 → 36.4 s (30 s of them graph phases), element-plus 8.3 → 8.3 s (TypeScript and graph)
- Node memory per file (`DepMemory`): at most 19 MiB (a generated Go file of 831 kB), PHP 11 MiB, Python 4 MiB,
  Vue 1 MiB. No cap was added
- Explained differences, on files made for the purpose: behind U+FFFE or U+FFFF the old analyzers returned shifted
  names for Go, PHP and Vue and skipped the Python file; all four are right now, and the changelog entry no longer
  lists languages. Form feed, vertical tab, U+001F, a byte order mark and multi-byte characters: no difference
- Deep nesting: 50,000 concatenations in Go, Python and PHP work before and after. A Vue template nested 50,000
  deep overflowed the stack of the old analyzer and works now, but the Vue grammar itself needs time quadratic in
  the depth (20,000 levels: 21 s), so no test and no changelog entry for it
- Results and tools: `analysis/ideas/treesitter-binding/RESULTS-query-analyzers.md`, `bench/AnalyzerDump.java`
  (git-ignored)

### What changed in the model of the excavation site

- `UsedType.usage` (`TypeUsage`): PHP tells inheritance, implementation, argument and so on apart
- `DeclarationType.SCRIPT`: a PHP file without declarations
- `ImportKind.MEMBER`: Python `from module import name`; relative modules start with one `.` segment per dot
- `LanguageDependencyMapping.extractEmbeddedSources` and `grammarOfWholeFile`: the script blocks of a Vue file are
  analysed in their own language, and the file is parsed with the Vue grammar instead of the preprocessed script
- `TreeSitterDependencies.bundlerAliases` for the alias section of a bundler configuration
- Match order of a query is the order in which its last node is reached, not the order of the outer nodes: for Go
  call chains the method names are therefore sorted by position. Every other query was in document order

### Quirks reproduced on purpose, for a later decision

- Go: `type A = B` is a declaration named `unknown`; of `type ( A …; B … )` only `A` exists; a type declared
  inside a function is a declaration; called functions and methods are used types; the methods of a generic
  receiver are ignored; a method is added to the first declaration of that name, even a function; an import path
  in backquotes is ignored
- Python: every identifier of a class or function is a used type; an attribute access is split at every dot of
  its text, calls included; only top-level definitions exist, decorated ones after the others; a relative import
  that leaves the analysed tree is dropped; the old analyzer parsed every definition a second time from its text,
  which made no difference on 4,740 files and is gone
- PHP: the namespace is the first namespace name of the file, also one of a `use` clause; `use Foo;` is no
  import; an aliased clause keeps ` as Alias` in its last segment; a qualified member of a group is also imported
  without the prefix of the group; an import with `const` in any segment counts as a constant, and a constant is
  used when its name occurs anywhere in the text of a declaration; includes in double quotes, in parentheses or
  computed are ignored; `const A = B` declares `B` too; traits and constants use nothing; a base class,
  interface or instantiated class written as a qualified name is ignored, as is a nullable parameter type and the
  nullable return type of a function
- Vue: only the first template; any tag outside a list of 48 HTML elements is a component (`slot`, `tbody`,
  `transition`, `component` among them); an unquoted `lang=ts` is read as JavaScript
- Bundler configuration: `export default defineConfig({…})` is not read; `module.exports = variable` hides a
  default export

### For plan 3

- Nothing in the `DependencyParser` module parses with JNI any more; its build no longer names a grammar
- `TsNodeSyntaxNode` and `LanguageRegistry.getJniLanguage` serve tests only

### Before the port

From plan 1:
- A node must not outlive the `extract` call that received the root, and every node reached in that call stays in
  memory until it returns: no whole-tree search per declaration (C# needed 6.7 GiB for one file that way). Run
  `bench/DepMemory.java` on the large repositories of each ported language
- Open decision: a cap on node memory per file that skips the file instead of exhausting memory
- Descend with `TreeTraversal`, which is iterative; a recursive descent of one's own overflows on deeply nested code
- The changelog entries on U+FFFE/U+FFFF and on deeply nested code name nine languages; extend them when Go, Python
  and PHP move
- Nine early-exit loops over `getChild(i)` remain in the Objective-C, C++ field and string extractors

Decided on 2026-10-08:
- Vue keeps its grammar, parsed through FFM; the jar bundles the library for all five platforms
- Quirks of the old analyzers are reproduced exactly and listed here, not fixed
- No cap on node memory per file; `DepMemory` only measures
- `BundlerConfigParser` moves in this plan (task 5)
- Reference build is this branch before the port: plan 1 left the four analyzers untouched and was byte-identical
  to `main`

- Gate: 0 differing outputs, or each difference explained and fixed
- This is a rewrite, not a switch: queries and traversal can disagree on aliased and error nodes, so the corpus
  comparison per language is the main safeguard
- Depends on plan 1 only for the speedup; the port itself works on the JNI adapter too, so the order can be
  swapped if plan 1 is delayed
- Largest uncertainty: PHP (15 files) and the Vue template
