# Review progress of the parser findings

Status on 2026-10-13: the review is finished. Nothing of it is committed yet.

## What this review is

Every language folder holds a `FINDINGS.md`: a report of what the three `ccsh` parsers (`unifiedparser`,
`dependencyparser`, `domainlanguageparser`) got right and wrong on that sample project. Each report ends in a
`## Verdict` section with the items sorted per parser into Missing, Wrong, Bad and Good.

Christian goes through the Missing, Wrong and Bad items language by language and decides each one:

- **accept**: the finding stands and is to be fixed in the parser
- **ignore**: no action
- **free form**: his own note, recorded word for word

The decision is appended to the last line of the item:

```
... has `max_parameters_per_function` 0. **Decision: accept.**
... **Decision: ignore (derived from Java).**
... **Decisions derived from Java: accept — labels.**          <- a bullet that bundles several findings names the clause
```

Only the reports change. No parser code is touched in this review. `SUMMARY.md` carries the decisions since
2026-10-13.

## How one language is reviewed

1. List the verdict items of the report that carry no `**Decision` yet.
2. Check the documentation for each item before calling it a finding. Several items of the first round turned
   out to be documented behaviour.
   - `gh-pages/src/content/docs/docs/parser/unified.md`, `dependency.md`, `domain-language.md`
   - `analysis/analysers/parsers/UnifiedParser/README.md`, `DependencyParser/README.md`,
     `DomainLanguageParser/README.md`
3. Find the cause in the code where possible.
   - `analysis/treeSitterExcavationSite/src/main/kotlin/de/maibornwolff/treesitter/excavationsite/languages/<lang>/`:
     `*MetricMapping.kt`, `*ExtractionMapping.kt`, `*DependencyMapping.kt`, `extractors/`
   - Word splitting of the domain parser: `SplitStage.kt` (the pattern `[a-zA-Z]{3,}` is what cuts umlauts)
4. Explain each item to Christian in the chat, with the code in a fenced code block and the reported and expected
   values as trailing comments (prose-only explanations were declined): the code, what the parser reported, what the docs say, the cause,
   why it is or is not a finding, and how sure that is. A one-line summary was rejected as too thin.
5. Ask with `AskUserQuestion`, four items per round, options Accept and Ignore with the recommended one first.
   The free-form answer is always available. Items with one cause are asked once.
6. Append the decision to the item.
7. Carry the decision over to the same finding in the other reports and mark it `(derived from <Language>)`.
   Do this only where it is the same behaviour with the same cause; leave an item open when in doubt and say so.

## Status

| Language | State | Open verdict items |
| --- | --- | --- |
| Java | done | 0 |
| Kotlin | done | 0 |
| TypeScript | done | 0 |
| JavaScript | done | 0 |
| Vue | done | 0 |
| PHP | done | 0 |
| Objective-C | done | 0 |
| C++ | done | 0 |
| Ruby | done | 0 |
| Delphi | done | 0 |
| Bash | done | 0 |
| Go | done | 0 |
| Python | done | 0 |
| Swift | done | 0 |
| C | done | 0 |
| C# | done | 0 |
| Rust | done | 0 |
| ABL | dropped | none; ABL support is removed completely, see the note at the top of its report |

The counts of the untouched languages were taken on 2026-10-08 and lowered on 2026-10-09 for the items closed
by Objective-C and on 2026-10-12 for the one closed by C++ (escape sequences in C) and the two closed by Ruby and the one closed by Delphi
in Bash; Go closed one clause of a bundled bullet in Rust (`--verbose`); the other decisions derived to C and C# name clauses of bundled bullets; Python closed one clause in C# (`.csx`); Swift closed two clauses in C# (expression-bodied properties, `TODO`) and one in Rust (bindings outside `let`). C# and Rust bundle several findings in one bullet, so their numbers
understate the work.

## Decisions that already apply to every language

Taken from Java, Kotlin and TypeScript and already marked in the other reports.

Accept:
- A file with a non-ASCII name is skipped without a message when the JVM has no UTF-8 locale
- Umlauts cut words apart in comments and strings of the domain parser
- Nested functions have no entry in the per-function statistics
- What counts as a function differs by the form it is written in
- An aliased import beside an import of the same name loses its edge or points at the wrong file
- A file without a top-level declaration gets no leaf and no edge
- A weight of 0 ends in an error
- A parser README that omits an extension the parser reads
- A snake_case token in a string or comment yields no word (marked in Go and Ruby)
- TypeScript family: optional parameters, `??=` / `||=` / `&&=`, side-effect imports, `import = require`,
  default re-exports, leaf kinds, the synthetic default-export leaf, JSX text and tag names
- An import through a barrel file should point at the real target, not at the barrel
- Every parameter counts as one, whatever its form (JavaScript; marked in PHP for promoted constructor parameters)
- The parameters of a function-pointer or block type are not parameters of the function (Objective-C; marked in C
  and C++)
- A quoted `#import` / `#include` path is no string text for the domain parser (Objective-C; marked in C and C++)
- The dependency parser says what it skipped when the result is empty (Objective-C; marked in Swift and Ruby)
- All three parsers read the same extensions of a language (C++ `.h++` / `.hh` / `.c++`; marked in C for `.C` / `.H`)
- A function whose declarator is not the direct child of its definition counts once: pointer or reference return
  type, conversion operator (C++; marked in C)
- A header named `.h` in a C++ project is read as C++ (C++)
- Test files are also recognised by the naming convention of C and C++ (C++; marked in C)
- An escape sequence in a string separates words (C++; marked in C; asked and accepted in Bash and Rust)
- `#define` macro names are words (C++)
- Ruby: `unless`, `case … in`, every `elsif`, `||=` / `&&=`, all lambda and proc spellings, `do … end` and `{ }`
  blocks counting alike, an `attr_*` symbol counting once
- The domain parser prints a plain message, no stack trace, for a path without analysable files (Delphi; marked in
  Bash)
- A named type that only points at another type is a leaf with an edge: alias, pointer, class reference (Delphi;
  the alias from Kotlin)
- Delphi: `.pp` / `.lpr` / `.inc` / `.dpk` read, exception handlers counted and not the `try`, `case` arms without
  the `case`, the body-less class as a leaf, enum values and the short attribute form as edges, umlaut leaf names,
  Delphi in the domain parser
- A script without an extension is recognised by its shebang line (Bash)
- `-a` / `-o` inside `[ ]` count like `&&` / `||` (Bash)
- Code inside a string is no string text: `"$( )"`, `"$var"` and the path of a `source` line (Bash; `${...}` from
  JavaScript, include paths from Objective-C)
- A separator inside an identifier splits it instead of gluing the parts: `::` (Bash; `\` from PHP)
- A return value is no parameter (Go)
- A word with a digit in a comment or string yields its letters instead of vanishing (Go; the pattern of the
  snake_case finding)
- A call on a value is no use of a type that happens to carry the method's name (Go)
- Go: dot imports, package-level `var` lines including `var _ I = (*T)(nil)`, every type of a `type ( … )` group,
  methods on a generic receiver, the alias name as a leaf name and as a word
- A type annotation, a return type and a type parameter are no parameters (Python; the return value from Go)
- A literal is no branch (Python list literal, although the docs list the node)
- One `case` counts once, whatever its pattern holds (Python nested sub-patterns)
- Every spelling of an exception handler counts (Python `except*`; the handlers from Delphi)
- Absolute imports resolve when the package root is a subfolder of the analysed folder (Python `src/` layout)
- A type written as a string gives an edge when its name is imported (Python forward references)
- Two imports that bind one name both give an edge (Python `try` / `except ImportError`; the aliased import from Java)
- A module-level statement carries its usages (Python `TypeVar(..., bound=…)`, `type` alias; `var` lines from Go)
- A re-export leaf has the kind `reexport` (Python `__init__.py`)
- A skipped extension is named by the dependency parser (Objective-C; marked in Delphi, Python `.pyi`, C# `.csx`)
- An accessor is a function with a measured body, whatever its spelling: implicit getter, `get` / `set`, `willSet` /
  `didSet`, subscript (Swift; marked in C# for expression-bodied properties)
- A construct the docs list as a branch but the grammar has no node for is brought in line (Swift `defer`)
- Every string form is string text: raw strings, `#warning` text (Swift)
- Every declared name is a word: loop variables, pattern bindings, each case of an enum line, external argument
  labels (Swift; marked in Rust for bindings outside `let`)
- Swift: `if let … = try await …` counted as an `if`, `\( … )` interpolations not as string text
- Python: typed parameters with a default, `self.` attribute assignments, type parameters and `type` aliases as
  words; decorator names are no words
- A function that a macro invocation generates is a function (C `EDGE_DEFINE_GETTER(depth)`)
- A reference to a type by its tag gives an edge: `struct X *`, `enum X` (C)
- The fields of an unnamed nested type count for the enclosing type (C anonymous struct)
- The text of a preprocessor line is string text: strings in `#define`, `#error`, `#pragma message`, macro replacement
  text (C; `#warning` from Swift)
- A member with a body is a function, whatever its kind: finalizer, operator, conversion operator (C#; `deinit` and
  operators count in Swift and C++)
- Every spelling of an anonymous function counts alike (C# `delegate (…) { }`; the lambda spellings from Ruby)
- A null-safe call chain is a message chain (PHP `?->`; marked in C# for `?.`)
- The forms of a type test count alike (C# `x is T` against `x is T t` and `is not T`)
- A type named without a declared variable is no word (C# `catch (InvalidOperationException)`)
- Every operand of a condition counts, whatever the form of the condition (Rust `&&` in a let chain)
- A binding with an `else` branch is a branch (Rust `let … else`; the forms counting alike from C#)
- An error-propagation operator does not interrupt a message chain (Rust `?`; the null-safe chain from PHP)
- A re-export resolves at every module level (Rust `pub use` in a nested `mod.rs`; the barrel from TypeScript)
- An aliased import resolves through its alias (Rust `use … as`; the aliased import from Java)
- The name of a package comes from its manifest, not from its folder (Rust `Cargo.toml`)
- A type in an associated-type binding is a used type (Rust `impl Iterator<Item = T>`)
- A bare type name gives no edge by a substring match on a qualified usage of the same file (Rust; the branch is
  in the shared `Node.resolveTypeImport`)
- Test code inside a production file is test code for `--include-tests` and `--exclude-tests` (Rust
  `#[cfg(test)] mod tests`)

Ignore:
- `default:` of a switch counts as a decision
- Per-function complexity starts at 0 while the file adds 1 per function
- No word list for folders or the root
- Only an English stop word list
- Plural and singular are separate words; digits split off an identifier (`rollD20`)
- Doc-comment tags count as words
- Keyword and stop lists remove words that are also domain words
- `.gitignore` is looked up from the analysed folder; usages are not counted in the domain parser
- Strings inside an exported declaration are dropped (TypeScript family)
- `tfidf` is one number per word for the whole project (marked in Objective-C)
- `--verbose` says nothing about unresolved imports (the same remark in the Go and Rust reports is not marked yet)
- `xor` counts as a decision where the docs list it (PHP; marked in Delphi)
- One usage kind per leaf edge of the dependency parser (documented; Kotlin, PHP)
- An edge from a higher to a lower level has no upward flag; levels come from the graph, not from the intended
  layering (PHP)
- Imported names count as words of the importing file (PHP `use`)
- Code-like text inside a string, heredoc or nowdoc counts as string text (PHP); code inside an interpolation
  `${...}` is the accepted JavaScript finding and a different case
- `f(void)` counts one parameter, a documented known issue (Objective-C; marked in C and C++)
- Logic inside a `#define` body is not counted (Objective-C; marked in C)
- A language the dependency parser does not list as supported yields an empty map with exit code 0 (Objective-C;
  marked in Swift, Ruby and Bash)
- A prototype adds 1 to complexity without being a function, as does a local variable built with parentheses
  (C++; marked in C for prototypes)
- Code under `#if 0` is measured like live code (C++; marked in C for the unified parser)
- `= default` and `= delete` members count as functions (C++)
- Header and source of a class share one leaf on the `.cpp`, documented (C++)
- Every usage kind is `usage` outside PHP, a documented known issue (Kotlin; marked in C++ and C#)
- An extension-less file shows up as ignored extension `.` (Ruby; marked in Bash)
- `Created Project with 1 leaves` for an empty map (Ruby; marked in Bash)
- A file recognised only by its name (`Rakefile`, `Gemfile`, `config.ru`) is read by no parser (Ruby)
- A call with a block is no function: `define_method`, RSpec `it … do` (Ruby)
- Namespace or module path words of every file rank high in a sum over files (Ruby)
- A construct the grammar has no node for is not counted (Delphi 13 conditional expression)
- Bitwise `and` / `or` count as logical operators where the language has one token for both (Delphi)
- A dotted path without a call counts as a message chain, documented (Delphi: unit-qualified name, property reads)
- rloc per function is the inside of `begin … end`, without the local `var` section (Delphi)
- Short unit names resolved through the unit scope names of the `.dproj` give no edge (Delphi)
- Parameters and message chains are not counted where the docs say so (Bash: positional parameters, pipelines)
- The shebang line follows the grammar: a comment line in Bash, code in JavaScript
- A no-op heredoc used as a block comment is code and string text (Bash)
- Tool directives in comments count as words (Bash `# shellcheck`; like doc-comment tags)
- The file or namespace prefix repeated in every function name counts each time (Bash; like the namespace words in Ruby)
- The receiver of a method counts as a parameter (Go)
- Compiler directives written as comments are comment lines and words (Go `//go:`; like `# shellcheck` in Bash)
- A dependency that only a build file states gives no edge (Go `replace` in `go.mod`; like the `.dproj` in Delphi)
- A type that is no class and has no kind of its own is `class` (Go named `int` and func types)
- Two functions of one name in one file are one leaf (Go `init`)
- Leaf levels count within the parent, documented (Go)
- Code in a comment counts as comment words (Go cgo preamble; like commented-out code)
- `self` / `cls` count as parameters (Python; like the Go receiver)
- An import made by a library call with a string gives no edge (Python `importlib.import_module`; like `autoload` in Ruby)
- A module-level assignment is a `variable` leaf, and a class is `class` whatever it inherits from (Python `logger`,
  `__all__`, `Enum` subclasses, ABCs)
- Conventional helper names pass the default stop list (Python `logger`, `args`, `kwargs`, `wrapper`; like `value`, `key`)
- An unsupported extension is skipped by the domain parser without a message (Objective-C `.pch`; marked in Python
  for `.pyi`)
- A property access inside a call chain does not interrupt `message_chains`, documented node lists (TypeScript;
  marked in Python)
- Null coalescing counts as a decision where the docs list it (Kotlin `?:`; marked in Swift for `??`)
- A comment marker inside a one-line string counts as a comment line (Swift `"/* … */"`)
- Comment markers count as words (Swift `// MARK:`, `// TODO:`; marked in C# for `TODO`; like doc-comment tags)
- A package manifest written in the language is read as source (Swift `Package.swift`)
- Every function declarator outside a definition adds 1 to complexity, documented node list (C function pointer
  fields, variables, parameters, function typedefs; prototypes from C++)
- Old-style (K&R) parameters are not counted (C)
- `&&` / `||` of a preprocessor condition count as logic (C)
- `.inc` is not read as C (C; Delphi reads it)
- A forward declaration gives no leaf and no link to its completion (C opaque typedef; like the header / source fold
  in C++)
- Include guards count as words (C; macro names are words)
- Code under `#if 0` yields words (C; the unified parser from C++)
- An accessor without a body counts as a function, documented node list (C# auto-accessors; like `= default` in C++)
- Every branch of a preprocessor condition is measured (C# `#if` / `#else`; `#if 0` from C++)
- A declaration split across files is one leaf per file and takes its incoming edges on the first file, documented
  (C# partial class)
- A section marker of the preprocessor is no word (Objective-C `#pragma mark`; C# `#region`)
- Code inside a macro is not read: the arguments of an invocation, the body of a definition (Rust; `#define` bodies
  from Objective-C)
- An error-propagation operator adds no complexity (Rust `?`)
- A receiver written with a type counts as a parameter (Rust `self: Box<Self>`; the receiver from Go)
- The unified parser measures test code like any other code (Rust inline test modules and `tests/`)
- A chain of iterator adapters is no loop; its closures count (Rust)
- A module file named by an attribute is not followed (Rust `#[path]`)
- A declaration without a kind of its own takes the nearest one (Rust macro as `function`, alias as `class`; the
  named types from Go)
- A foreign declaration is a function and a leaf (Rust `extern "C"`; bodiless signatures from Java)
- Documentation written as an attribute is string text (Rust `#[doc = "…"]`)

## JavaScript and Vue

Both were reviewed on 2026-10-09; every verdict item carries a decision.

JavaScript, accepted: parameter counts (one per parameter, whatever its form), `.jsx` in the parser README,
`require` of a directory, plain parameters as words, object literal keys as words, code inside `${...}` not as
string text. Ignored: the shebang line as code, the jumping progress line, dependencies named only in JSDoc,
`const x = require(...)` and module constants as leaves.

Vue, accepted: line metrics for the whole file, every `<script>` block read, the `lang` attribute selects the
grammar, `X.vue` and `X.ts` as separate nodes, static `.vue` imports resolved by path, template text as words,
snake_case strings split. Ignored: template directives as complexity, the `{` line of a multi-line signature in
rloc, `tfidf` as one number per project.

Two items were closed without a question and are worth a second look by Christian: JavaScript dependency
Missing 6 (the report itself calls it acceptable) and the missing upward flag in Vue (the edge goes away with
the barrel decision).

## PHP

Reviewed on 2026-10-09 with the skill `triage-findings` (`.claude/skills/triage-findings/SKILL.md`); every verdict
item carries a decision.

Accepted: `.phtml` read by the unified and the dependency parser, `?->` chains as message chains, rloc after `?>`
never above loc, `extends` / `implements` on interfaces, enums and anonymous classes, attributes as edges,
`require` / `include` with a literal path as edges, inline HTML text as words, namespace segments not glued
together. Ignored: `xor` as a decision, a multi-condition `match` arm counting 1, traits as `class` leaves without
body edges, the missing upward flag on `PersistedCreatures -> CreatureFacade`, `construct` as a word, `use` lines
as words, code-like text in heredoc and nowdoc.

Closed without a question: promoted constructor parameters in the unified parser (JavaScript) and in the
dependency parser (Java), `??` against `??=` (TypeScript), one usage kind per leaf edge (Kotlin). Derived to
others: `xor` in Delphi.

Two answers went against the recommendation: traits and `construct` were recommended as accept and are ignored.

## Objective-C

Reviewed on 2026-10-09; every verdict item carries a decision.

Accepted: `.mm` read by the unified parser, nested bracket sends as message chains, `for ... in` as complexity, a
method adding 1 to the file's complexity, the `#else` branch and the `#if` lines measured, no rloc for the blank or
comment line after `#define` / `#pragma mark` / `#include`, parameters of a block or function-pointer type not
added, the dependency warning that points at warnings that do not exist, a map with only `root` for 30 scanned
files, a list of skipped extensions, pointer-declared locals, `typedef struct` names and enum constants as words,
`#import` paths not as strings, `--exclude-tests` recognising `<Target>Tests/<Class>Tests.m`. Ignored: logic in
macro bodies, `.pch`, `(void)` as one parameter, `.h` files with Objective-C content read as C (five bullets in
the unified and the domain parser), no Objective-C support in the dependency parser, exit code 0 for an empty
result, `#pragma mark` text, the dot-syntax-only chain.

Closed without a question: per-function complexity starting at 0 (Java), `logic_complexity` matching only by
cancellation (follows from `for ... in` and `default:`), `.h` claimed by the C++ analyzer without a result (follows
from the two ignores; the plain C header is left to the C report), `--include-tests` without effect.

One answer went against the recommendation: `.h` read as C was recommended as accept and is ignored.

Derived to others: `(void)` and function-pointer parameters to C and C++, macro bodies to C, include paths to C
and C++, the unsupported language to Swift, Ruby and Bash, exit code 0 to Swift and Bash, the warning that does
not name what was skipped to Swift and Ruby. Left open on purpose: `OwlbearNest.h` read as C in the C++ report
(a C++ header, not the same case), name-based test detection in C (another naming rule), "a Bash analyzer would
need" and `Created Project with 1 leaves` in Ruby and Bash.

`append_decisions.py` now also matches items that start at the left margin (C, Swift, Bash).

## C++

Reviewed on 2026-10-12; every verdict item carries a decision.

Accepted: one extension list for all three parsers (`.h++`, `.hh`, `.c++`), pointer and reference return types and
the conversion operator counting once, a C++ header named `.h` read as C++ (unified and domain parser), the explicit
template specialization as a leaf, test detection by file name, `Pool<Combatant>` merged into `Pool`, macro names as
words, escape sequences in strings. Ignored: prototypes and parenthesised local variables adding complexity,
`= default` / `= delete` as functions, code under `#if 0`, the header / source fold, the gtest test name.

Closed without a question: default-value parameters (JavaScript), the jumping progress counter (JavaScript),
everything outside a class and aliases in the dependency parser (Kotlin), `usage` as the only usage kind (Kotlin).

Two answers went against the recommendation: prototypes with parenthesised locals, and `= default` / `= delete`,
were recommended as accept and are ignored.

Derived to others: prototypes, pointer-returning functions, `#if 0`, `.C` / `.H`, escape sequences and name-based
test detection to C; the single usage kind to C#. Left open on purpose: function pointer fields, variables and
typedefs and preprocessor conditions as logic in C (not asked here), `.inc` in C, `#if 0` in the C domain parser
(another parser), string escapes in Rust (its own string extractor) and `'goblin\nkobold'` in Bash (single quotes,
no escape in the language).

## Ruby

Reviewed on 2026-10-12; every verdict item carries a decision.

Accepted: `case … in` clauses, `unless` in both forms, `lambda { }` / `proc { }` / `Proc.new { }` as lambdas, `||=` and
`&&=`, `do … end` blocks counting like brace blocks, every `elsif` of a ladder, `attr_*` symbols counted once. Ignored:
`.ru` / `Rakefile` / `Gemfile` in the unified and the domain parser, `define_method`, the data section after `__END__`,
the skip message showing `.`, RSpec examples as functions, `Created Project with 1 leaves`, the heredoc end tag as a
word, the `autoload` symbol, namespace words on top of the summed list.

Closed without a question: parameter counts (JavaScript), endless methods (the Java decision on the bullet covers both
clauses), the progress output (JavaScript), `.rake` / `.gemspec` in the unified parser (C++), `# :nodoc:` (Java).

Three answers went against the recommendation: `__END__`, `Created Project with 1 leaves` and the heredoc end tag were
recommended as accept and are ignored.

The report misread one cause: the `autoload` path is skipped like `require` paths; `centaur` 1 in `domain/model.rb`
comes from the symbol `:Centaur`. The decision on the item says so.

Derived to others: the extension `.` and `Created Project with 1 leaves` to Bash. Left open on purpose: the
extension-less `bin/cellars` with a shebang in Bash (shebang detection, not a file name), `elif` and block comments in
heredocs in Bash, the `lambda` known issue stays in the docs until the parser is fixed.

## Delphi

Reviewed on 2026-10-12; every verdict item carries a decision.

Accepted: `.pp` / `.lpr` / `.inc` / `.dpk` in the unified and the dependency parser, the exception handlers including
bare `except` and `else` counted instead of the `try`, the `case` statement not counted on top of its arms, pointer,
class-reference and procedural types as leaves with edges, the class declared without a body, enum values used alone,
the short attribute form `[Table(...)]`, the leaf name cut at an umlaut, Delphi support in the domain parser, a plain
message instead of the stack trace. Ignored: the Delphi 13 conditional expression, bitwise `and` / `or`, the
unit-qualified name and the path of property reads as message chains, rloc per function without the `var` section,
short unit names through unit scope names.

Closed without a question: parameters counted per group (JavaScript), references outside a class, the alias
`TEntity` and free function calls (Kotlin), the test-file name rule (C++), silent drops and skips (Objective-C).

No answer went against the recommendation.

The cause of the cut leaf name is not confirmed: most likely the identifier pattern of tree-sitter-pascal is
ASCII-only; the tree was not dumped.

Derived to others: the stack trace for a path without analysable files to Bash. Left open on purpose: `.inc` in C
(another extension list, another language), package-level constants `Monstrosity` / `Walking` in Go (constants of a
package, not enum values of a unit).

## Bash

Reviewed on 2026-10-12; every verdict item carries a decision.

Accepted: the extension-less script with a shebang in the unified and the domain parser, `-a` / `-o` inside `[ ]`,
the escape sequence in `'goblin\nkobold'`, `source` paths and code inside `"$( )"` / `"$var"` not as string words.
Ignored: positional parameters and pipelines as message chains (both documented), the shebang as a comment line, the
no-op heredoc as code and with string weight, the list of what a Bash dependency analyzer would need,
`shellcheck(86)`, `script` / `dir`, the file prefix of every function name.

Closed without a question: `.bash` / `.zsh` in the unified parser (C++), the file-name rule for shell tests (C++),
`::` glued (PHP).

No answer went against the recommendation.

The cause of `-a` / `-o` is not confirmed: `BashMetricMapping` allows only `&&` and `||` as the operator of a
`binary_expression`; whether `-a` arrives in that field was not checked, the tree was not dumped.

Derived to others: nothing. Left open on purpose: string escapes in Rust (its own string extractor, as before),
interpolated expressions as string text in Swift (its own string mapping; the JavaScript decision was not carried
there either), `//go:` directives in Go (bundled with the C preamble of a cgo file).

## Go

Reviewed on 2026-10-12; every verdict item carries a decision.

Accepted: results counted as parameters, dot imports, package-level `var` lines, only the first type of a `type ( … )`
group and methods on a generic receiver, method names resolved as type names, digit-carrying words in comments and
strings, the alias name as a word. Ignored: the receiver as a parameter, `//go:` directives as comment lines, `replace`
in `go.mod`, named `int` and func types as `class`, two `init` functions as one leaf, leaf levels per package, the C
preamble of a cgo file.

Closed without a question: grouped parameters (JavaScript), parameters of a func type (Objective-C), package-level
constants and the alias leaf `unknown` (Kotlin), the declaration-level cycle count (Kotlin), `--verbose` (TypeScript),
`//go:` directives as words (Bash).

One answer went against the recommendation: the receiver was recommended as accept and is ignored.

The cause of the dot import is not confirmed: `Node.resolveTypeImport` compares the import path with the module
prefix against the directory path; no debug run was made. Grouped types, generic receivers and `owlbear2` come from
scratch probes of the report, not from the sample project.

Derived to others: `--verbose` to Rust. Left open on purpose: `self` / `cls` and return types as parameters in Python
(every identifier of a signature counts, another cause), the typed `self` in Rust (the docs exclude the receiver
there), module-level statements without usages in Python (its own extractor), the invisible file cycles and the leaf
kinds in the same Rust bullet.

## Python

Reviewed on 2026-10-12; every verdict item carries a decision.

Accepted: type hints, return types and PEP 695 type parameters counted as parameters, the list literal as a branch,
nested sub-patterns of a `case`, `except*`, the `src/` layout, string type hints whose name is imported, the
`except ImportError` fallback import, module-level statements without usages (`TypeVar` bound, `type` alias),
`__init__.py` re-exports as `unknown`, typed parameters with a default, `self.` attributes, type parameters and `type`
aliases as words, stdlib decorator names as words. Ignored: `self` / `cls` as parameters,
`importlib.import_module`, `variable` leaves and `Enum` subclasses / ABCs as `class`, `logger` / `args` / `kwargs` /
`wrapper`.

Closed without a question: the attribute access inside a message chain (TypeScript), `.pyw` in the unified and the
dependency parser (C++), the file edge `domain/model/__init__.py -> armor_class.py` without `isCyclic` (Kotlin), the
single usage kind (Kotlin), `.pyi` skipped silently in the dependency parser (Objective-C: accept) and in the domain
parser (Objective-C `.pch`: ignore).

No answer went against the recommendation.

The cycle item was checked in `output/dependency.cc.json`: the file edge comes only from the re-export leaf
`ArmorClass`, which no declaration uses, so no declaration-level cycle runs through it. Not confirmed: the node
names `except_group_clause` and `typed_default_parameter` and the nesting of `case_pattern` are taken from the
grammar, no tree was dumped; that the fallback import loses its edge because the first import of a name wins was not
debugged.

Derived to others: `.csx` skipped without a message in the C# dependency parser (from Objective-C, noticed here). Left
open on purpose: `self: Box<Self>` in Rust (the docs exclude the receiver there), `// MARK:` and `Package.swift`
words in Swift, the invisible file cycles in Rust.

## Swift

Reviewed on 2026-10-12; every verdict item carries a decision.

Accepted: accessor bodies measured as empty, `if let … = try await …` counted as a closure, `defer { }` counted like a
closure, the subscript as 2 functions and 3 complexity or 0 and 1, `willSet` / `didSet` as functions instead of
branches, raw strings and `#warning` text as string words, switch-pattern bindings, loop variables, the second enum
case and external argument labels as words, interpolated expressions not as string text. Ignored: the string
`"/* not a comment */"` as a comment line, `mark` / `todo`, `Package.swift` read as source.

Closed without a question: the computed property with an implicit getter (Java), `??` as a branch (Kotlin), the test
file recognised only by its folder (C++), `swiftlint` (Bash).

One answer went against the recommendation in one clause: external argument labels were recommended as ignore and
are accepted.

Confirmed in the bundled grammar (tree-sitter-swift 0.5.0, node names read from the library): there is no
`defer_statement`, and `raw_string_literal` and `diagnostic` exist and are not in `SwiftExtractionMapping`. Not
confirmed, no tree was dumped: which node holds an accessor body, the misparse of `try await` before a brace, the
comment node inside the one-line string.

Derived to others: expression-bodied properties (from Java) and `TODO` in C#, bindings outside `let` in Rust. Left
open on purpose: auto-accessors counting as functions and `??` against `??=` in C# (not asked here), declarations
inside a macro invocation and string escapes in Rust.

## C

Reviewed on 2026-10-12; every verdict item carries a decision.

Accepted: the function generated by a macro invocation, tag references (`struct Creature *`, `enum SpeedType`), the
field of a nested anonymous struct, strings in `#define` / `#error` / `#pragma message` and macro replacement text as
words. Ignored: function pointer fields, variables, parameters and function typedefs adding complexity, the K&R
definition with 0 parameters, `&&` / `||` of preprocessor conditions as logic, `.inc` in all three parsers, the opaque
typedef and its completion, include guards as words, words under `#if 0`.

Closed without a question: the parameters of a returned function pointer (Objective-C), everything outside a struct
and `typedef` aliases in the dependency parser (Kotlin), files without a declaration (Java), function pointer typedefs
(Delphi), `--include-tests` without effect and the `.c` file with 0 outgoing edges (both follow from Kotlin), `union`
as `class` (Go), the silent skip of `.inc` in the dependency parser (Objective-C: accept) and in the domain parser
(Objective-C `.pch`: ignore), the `--ngrams 2` ranking.

Three answers went against the recommendation: preprocessor conditions and include guards were recommended as accept
and are ignored, the macro-generated function was recommended as ignore and is accepted.

The dependency parser has no C mapping: `.c` and `.h` run through the C++ analyzer (`SupportedLanguage.CPP`).
Confirmed in the code: `CppTypeHelper.TYPE_NODE_TYPES` holds no `struct_specifier` / `enum_specifier`,
`UsedTypeExtractor` stops at nested declarations and `InClassDeclarationFinder` drops an unnamed or body-less one. Not
confirmed, no tree was dumped: that a `#if` condition is a `binary_expression`, that K&R parameters are plain
identifiers, that the rest of a `#define` / `#error` line is one `preproc_arg` token.

Derived to others: nothing. Left open on purpose: everything inside a macro invocation and declarations inside one in
Rust (the invocation holds the code there, in C the definition does), `#region` names in C#.

## C#

Reviewed on 2026-10-12; every verdict item carries a decision.

Accepted: finalizer, `operator +` and `implicit operator` as functions, the anonymous `delegate` block counting like a
lambda, `x is T` / `x is T t` / `is not T` counting alike, `catch (InvalidOperationException)` without a variable not
yielding words. Ignored: auto-accessors as functions, the partial class with its incoming edges on one file and the
cycle it hides, `#region` names.

Closed without a question: the `?.` call chain (PHP), `??=` against `??` (TypeScript, Kotlin), both `#if` branches
counted (C++), structs as `class` (Go), LINQ range variables, `out var` and tuple element names (Swift), `temporary`
(Java).

No answer went against the recommendation.

Confirmed in the code: `CSharpMetricMapping` lists `is_expression` and `accessor_declaration` without a condition and
has no entry for a finalizer, an operator or an anonymous method; `findLastIdentifier` takes the type of a
`catch_declaration` that has no variable. The partial class rule is in `dependency.md` word for word. Not confirmed,
no tree was dumped: the node names `destructor_declaration`, `operator_declaration`,
`conversion_operator_declaration`, `anonymous_method_expression` and `is_pattern_expression`. Not checked: whether
`findLastIdentifier` leaks a type the same way for a `parameter` or a `declaration_pattern` without a name.

Derived to others: nothing. Rust is the last language; its count of "about 1" understates the open clauses (macros,
let chains, `let … else`, `?`, the typed `self`, tests in the metrics, most of the dependency bullets).

## Rust

Reviewed on 2026-10-12; every verdict item carries a decision. Rust was the last language.

Accepted: the `&&` of a let chain, `let … else`, a call chain interrupted by `?`, re-exports in a nested `mod.rs`,
`use … as`, the crate name from `Cargo.toml`, associated-type bindings (`Item = Creature`), the name-only fallback,
inline `#[cfg(test)]` modules in the dependency graph and under `--exclude-tests`, string escapes. Ignored: code
inside a macro invocation (unified and domain parser), `?` adding no complexity, `self: Box<Self>` as a parameter,
test code in the unified metrics, iterator chains, `#[path]`, macros and aliases as `function` / `class`,
`extern "C"` declarations as leaves, `#[doc = "…"]` weighted as a string.

Closed without a question: the body of the `macro_rules!` definition (Objective-C), `extern "C"` declarations as
functions (Java), the progress bar (JavaScript), function calls and macro invocations in a body (Kotlin, Java), the
declaration-level cycle count (Kotlin), doc-test code as comment prose (Go).

One answer went against the recommendation: `self: Box<Self>` was recommended as accept and is ignored, although
`unified.md` says the receiver is excluded; the sentence in the docs now needs the exception.

Confirmed in the code: `RustAnalyzer.reexportTarget` roots a bare re-export path at the crate instead of at the
file's module; `RustAnalyzer` drops the `bindingName` of an aliased import; `deriveCrateRoot` takes the folder
before `src` as the crate name; `RustTypeHelper.extractGenericType` has no case for `type_binding`;
`Node.resolveTypeImport` matches by `contains` in its `hasOnlyName` branch; `TestFileDetector` has no rule for
`.rs` and nothing reads `#[cfg(test)]`; `extractRustStringLiteralContent` keeps the text of an `escape_sequence`.
The node names `let_chain`, `try_expression`, `token_tree` and `type_binding` exist in tree-sitter-rust 0.24.0. Not
confirmed, no tree was dumped: that a let chain is no `binary_expression`, that `self: Box<Self>` is a `parameter`,
that `?` sits as `try_expression` between the calls. Not checked: whether the substring fallback gives wrong edges
in other languages.

Derived to others: nothing, every other report was closed.

## How to continue

Nothing is left. Every language carries a decision on every verdict item, and `SUMMARY.md` states the decision
behind each of its items and no longer lists ABL. The accepted items are the backlog for the parser work.

Helpers: a decision is one appended sentence, so `Edit` on the last line of the item is enough. For many items
at once, `.claude/skills/triage-findings/scripts/append_decisions.py` appends a note to the last line of each item
that starts with a given text.

Plans of the finished parts: `plans/2026-10-08-java-findings-triage.md`,
`plans/2026-10-08-derive-java-decisions-for-other-languages.md`, `plans/2026-10-08-kotlin-findings-triage.md`,
`plans/2026-10-08-typescript-findings-triage.md`, `plans/2026-10-09-javascript-vue-findings-triage.md`,
`plans/2026-10-09-php-findings-triage.md`,
`plans/2026-10-09-objectivec-findings-triage.md`, `plans/2026-10-12-cpp-findings-triage.md`,
`plans/2026-10-12-ruby-findings-triage.md`, `plans/2026-10-12-delphi-findings-triage.md`,
`plans/2026-10-12-bash-findings-triage.md`,
`plans/2026-10-12-go-findings-triage.md`,
`plans/2026-10-12-python-findings-triage.md`,
`plans/2026-10-12-swift-findings-triage.md`,
`plans/2026-10-12-c-findings-triage.md`,
`plans/2026-10-12-csharp-findings-triage.md`,
`plans/2026-10-12-rust-findings-triage.md`,
`plans/2026-10-13-summary-with-decisions.md`.
