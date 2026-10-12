# Review progress of the parser findings

Status on 2026-10-12. Nothing of this review is committed yet.

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

Only the reports change. No parser code is touched in this review, and `SUMMARY.md` does not reflect the
decisions yet.

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
| Ruby | derived decisions only | about 21 |
| Delphi | derived decisions only | about 21 |
| Bash | derived decisions only | about 16 |
| Go | derived decisions only | about 17 |
| Python | derived decisions only | about 15 |
| Swift | derived decisions only | about 12 |
| C | derived decisions only | about 10 |
| C# | derived decisions only | about 2 |
| Rust | derived decisions only | about 1 |
| ABL | dropped | none; ABL support is removed completely, see the note at the top of its report |

The counts of the untouched languages were taken on 2026-10-08 and lowered on 2026-10-09 for the items closed
by Objective-C and on 2026-10-12 for the one closed by C++ (escape sequences in C); the other decisions derived
to C and C# name clauses of bundled bullets. C#, Rust and C bundle several findings in one bullet, so their numbers
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
- An escape sequence in a string separates words (C++; marked in C; open in Rust and Bash, see the C++ section)
- `#define` macro names are words (C++)

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

## How to continue

1. Go on with the remaining languages in the order Christian names, otherwise in the order of the status table,
   with the skill `triage-findings`. After each one, derive to the others.
2. When all are done, bring `SUMMARY.md` in line with the decisions (it still lists ABL as a gap).

Helpers: a decision is one appended sentence, so `Edit` on the last line of the item is enough. For many items
at once, `.claude/skills/triage-findings/scripts/append_decisions.py` appends a note to the last line of each item
that starts with a given text.

Plans of the finished parts: `plans/2026-10-08-java-findings-triage.md`,
`plans/2026-10-08-derive-java-decisions-for-other-languages.md`, `plans/2026-10-08-kotlin-findings-triage.md`,
`plans/2026-10-08-typescript-findings-triage.md`, `plans/2026-10-09-javascript-vue-findings-triage.md`,
`plans/2026-10-09-php-findings-triage.md`,
`plans/2026-10-09-objectivec-findings-triage.md`, `plans/2026-10-12-cpp-findings-triage.md`.
