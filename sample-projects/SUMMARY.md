# Summary across languages

Round 3, 2026-10-08. Built from the 18 `FINDINGS.md` reports and cross-checked against the raw results in
`<language>/output/`. Every language got an `EncounterResolver` with hand-counted expected values, an
`EncounterEdgeCases` file with constructs a parser is likely to miss, a German-words file and the rarer file
extensions; then `unifiedparser`, `dependencyparser` and `domainlanguageparser` ran on it. The round-1 and
round-2 summary of 2026-09-06 is in the git history of this file; what changed since is at the end.

All runs used `LC_ALL=C.UTF-8`. JavaScript keeps the UTF-8 runs as `output/*-utf8.cc.json` beside the POSIX ones.

## Overview

`EncounterResolver` columns are logic complexity / complexity / functions, expected -> reported. Dependency
edges are file edges without tests, expected / found.

| Language | Unified: `EncounterResolver` | Dependency edges | Domain: words of 17 / German of 7 | Biggest issue |
| --- | --- | --- | --- | --- |
| abl | not supported | not supported (67 / 0) | 17 / 4 | unified has no ABL although the grammar library ships a metric mapping |
| bash | 14/20/6 -> 15/21/6 | not supported (78 / 0) | 17 / 3 | parameters and message chains are always 0; `::` glues words (`creatureset`) |
| c | 14/20/6 -> 15/23/6 | 110 / 24, 3 of them wrong | 17 / 3 | every prototype adds complexity; only struct fields give edges, 22 of 51 files absent |
| cpp | 14/21/5 -> 15/22/7 | new files 28 / 16 (62 in total) | 17 / 5 | prototypes and pointer return types add complexity; `domain::model::Creature` resolves to the dto |
| csharp | 15/22/6 -> 16/23/7 | new files 21 / 13 (61 in total) | 17 / 5 | auto-accessors are functions, real expression-bodied properties are not; partial class hides the cycle |
| delphi | 13/20/6 -> 16/23/6 | 82 / 50 | not supported (exit 1, stack trace) | parameters counted per group (5 -> 3); alias-only unit and `.dpr` dropped with both cycles |
| go | 14/22/5 -> 15/23/8 | new files 17 / 13 (58 in total) | 17 / 5 | receiver and results count as parameters; method names resolved as type names (false edges) |
| java | 14/21/6 -> 15/22/6 | 70 / 53 | 17 / 7 (4 only as identifiers) | constructor bodies are no function bodies; patterns, casts, method references give no edge |
| javascript | 14/21/6 -> 15/22/7 | 67 / 43, 1 wrong | 17 / 5 | JSDoc-only dependencies invisible; every string inside an `export` dropped |
| kotlin | 14/21/6 -> 15/22/7 | 79 / 57 | 17 / 6 | functions with a receiver and return type, `where` or modifiers are not counted as functions |
| objectivec | 14/21/5 -> 14/16/5 | not supported (77 / 0) | 17 / 3 | methods add no complexity, message chains never found, headers parsed as C |
| php | 14/21/6 -> 15/22/7 | new files 16 / 9 (49 in total) | 17 / 5 | promoted constructor parameters count nowhere (parameters and edges); `desotscellars` is word #2 |
| python | 14/21/6 -> 19/25/7 | 77 / 70 | 17 / 5 | type hints and `self` count as parameters (5 -> 12); every list literal adds complexity |
| ruby | 14/21/6 -> 15/22/7 | not supported (78 / 0) | 17 / 5 | `do … end` adds complexity and `{ }` does not; `unless` and `case … in` are not counted |
| rust | 15/22/6 -> 16/23/6 | 71 / 50 | 17 / 5 | nothing inside a macro is seen; types used in function bodies give no edge, so no cycle is found |
| swift | 14/21/6 -> 15/23/6 | not supported (74 / 0) | 17 / 5 | computed properties are no functions; `"/* … */"` in a string is a comment line; `mark` is word #2 |
| typescript | 14/21/6 -> 15/22/7 | 79 / 71, 1 wrong | 17 / 6 | conditional types count as branches; second import of the same name dropped |
| vue | 14/21/6 -> 15/22/6 (`.ts` and `.vue`) | 93 / 81, 1 wrong | 17 / 5 | only the first `<script>` is read, the template never; `X.vue` and `X.ts` collapse into one node |

`loc`, `rloc` and `comment_lines` of `EncounterResolver` are exact in every language that is analysed, and so
are `long_method`, `message_chains` (except bash, objectivec) and `excessive_comments`.

## All three parsers

1. **A file with a non-ASCII name is left out silently without a UTF-8 locale.** Under `LC_CTYPE=POSIX` the JVM
   cannot decode `Zentaurenhöhle.*`; the file is not analysed, not listed as ignored, exit code 0. Seen in every
   language with such a file name, in all three parsers. Not checked on macOS.
2. **The `.gitignore` is looked up in the scanned folder only.** Every run on a sub-folder warns `No .gitignore
   found at root level` and falls back to built-in exclusions; a probe file in a git-ignored folder was analysed
   by all three parsers (typescript).
3. **The three parsers disagree about file extensions.**

| Extension | Unified | Dependency | Domain |
| --- | --- | --- | --- |
| `.kts` | analysed (README says `.kt` only) | analysed | analysed |
| `.jsx` | analysed (README does not list it) | analysed | analysed |
| `.cts`, `.mts`, `.cjs`, `.mjs`, `.cc`, `.cxx`, `.hxx` | analysed | analysed | analysed |
| `.c++`, `.hh` | analysed | analysed | skipped silently |
| `.h++` | skipped, named | skipped silently | analysed |
| `.h` | as C | as C++ | as C |
| `.C`, `.H` (upper case) | skipped, named | analysed | analysed |
| `.mm` | skipped, named | skipped | analysed |
| `.pyw` | skipped, named | skipped silently | analysed |
| `.pyi` | skipped, named | skipped silently | skipped silently |
| `.phtml` | skipped, named | skipped silently | analysed |
| `.bash`, `.zsh` | skipped, named | - | analysed |
| `.rake`, `.gemspec` | skipped, named | - | analysed |
| `.dpr` | analysed | scanned, dropped (no type declared) | - |
| `.dpk`, `.pp`, `.lpr`, `.inc` | skipped, named | skipped silently | - |
| `.i` (ABL), `.pch`, `.csx`, `.ru` | skipped | skipped | skipped silently |
| no extension (`Rakefile`, `Gemfile`, shebang script) | skipped, shown as `.` | - | skipped silently |

4. **An unsupported language ends three different ways.** Unified: exit 0, empty map, the ignored extensions are
   named. Dependency: exit 0, empty map, two warnings that name neither the language nor the reason, `Created
   Project with 1 leaves`. Domain (delphi): exit 1 with an `IllegalArgumentException` stack trace.

## Unified parser

Never run on the samples before; everything here is new.

### Wrong in (nearly) every language
1. **The default branch of a switch counts as a decision.** `default:`, `else ->` (kotlin `when`), `_ =>`
   (rust, csharp switch expression), `case _` (python), `*)` (bash), `else` of a ruby `case`, `default =>`
   (php `match`). This is the +1 on logic complexity in 15 of the 16 analysed `EncounterResolver` files. In
   delphi the `case` statement itself counts on top of its arms.
2. **Per-function complexity leaves out the function itself; file complexity adds 1 per function.** A
   branch-free function reports 0, the per-function values never add up to `complexity`. Every language.
3. **Nested functions count in `number_of_functions` but get no per-function entry.** Their parameters vanish,
   their lines and branches go to the parent, mean and median run over fewer functions than the file reports.
   In delphi the body lines even shift to the next routine.
4. **What is a function is inconsistent.** A lambda or arrow assigned to a variable is a function, the same
   lambda passed, returned or stored in a field / object property is not (java, csharp, kotlin, python, ruby,
   php, js, ts, cpp, go counts every func literal). Bodyless declarations count in java (abstract and interface
   methods), rust (trait signatures, `extern`), csharp, cpp (`= default`, `= delete`) but not in kotlin, ts.
5. **Parameter counts break on anything but plain names.**

| Language | What goes wrong |
| --- | --- |
| python | `self` / `cls`, every type hint, the return type and PEP 695 type parameters count (`resolve` 12 for 5) |
| go | receiver and results count, a group `(a, b, c int)` counts 1, variadic `...int` counts 0 |
| delphi | a group `(A, B: Integer)` counts 1; `long_parameter_list` is never raised |
| vue | `<script lang="ts">` is parsed as JavaScript: typed parameters count double (11 for 5) |
| javascript | arrow components, generators and default values with a call over-count; object patterns count 0 |
| typescript, vue | optional `bonus?: number` not counted, the `this` parameter is |
| java, csharp, php, cpp | varargs / `params` / variadic / parameter pack count 0; php promoted constructor parameters count 0 |
| cpp | parameters with a default value count 0; `(void)` is 1 (also c, objectivec); function-pointer parameters add their own |
| ruby | `def self.x(arg)` counts the method name; endless methods count body identifiers |
| rust | `self: Box<Self>` counts |
| bash | always 0 (positional parameters) |

6. **Null-coalescing is half counted.** `??` / `?:` (elvis) is a decision, `??=`, `||=`, `&&=`, `?.` are not
   (csharp, kotlin, swift, php, js, ts). Type tests likewise: `x is T` counts, `x is T t` does not (csharp).

### Wrong in one language family
- **C, C++, Objective-C headers:** every function prototype, function-pointer field and pointer-returning
  function adds 1 to complexity, so a header with 0 functions reports complexity 4 to 11. In C++ a local
  `T name(args);` is read as a declaration. Code under `#if 0` is counted; in objectivec the whole `#else`
  branch is ignored. A `.h` with C++ content is parsed as C.
- **Objective-C:** a method is a function but adds 0 to complexity (16 for 21); `for … in` is no loop; nested
  message sends and dot chains are never a message chain (0 in all 54 files).
- **Python:** every list literal adds 1 (`[]`, `__all__ = [...]`, `[int]` in a type hint); nested sub-patterns
  of `match` count as cases; `except*` is not counted.
- **Ruby:** `do … end` adds 1, `{ }` adds 0; from the second `elsif` on nothing is counted; `unless`, `case … in`,
  `lambda {}` / `proc {}` are not counted; `__END__` data is code.
- **Kotlin:** a function is only recognised when its body is the last of 4 to 7 syntax children, so extension
  functions with a return type, `inline fun <reified T>` and `where` clauses are not functions; getters, setters,
  secondary constructors and `val f = { }` are.
- **C#:** auto-accessors `{ get; set; }` are functions (`Creature.cs` 14), expression-bodied properties with logic
  are not; finalizers and operators are not; expression-bodied methods have rloc 0 and complexity 0.
- **Java:** constructor bodies are not function bodies (rloc 0, their `if` belongs to no function); a static
  initializer adds 1 like a function.
- **Swift:** `if let x = try await f() { }` is counted as a closure, not an `if`; `defer` adds 1 like a closure;
  computed properties with an implicit getter are no function; the string `"/* not a comment */"` is a comment line.
- **Rust:** nothing inside a macro is seen (`macro_rules!` bodies, `assert!(a && b)`, an `if` in `println!`);
  match guards, `let … else` and the `&&` of a let chain add nothing; a chain interrupted by `?` is no chain.
- **Delphi:** `try` counts as a decision, bitwise `and` / `or` count as logic, catch-all handlers do not count.
- **TypeScript:** the conditional type `T extends U ? A : B` counts as a branch.
- **PHP:** rloc is one too high after `?>` (rloc can exceed loc); `xor` counts.
- **Vue:** only the first `<script>` block is measured (`EncounterEdgeCases.vue`: 3 functions for 16); template,
  style and tag lines are in no line count (a script-less component has loc 0); `v-if`, `v-for` and expressions
  in the template add nothing.
- **Bash:** parameters and message chains always 0; functions with a `( )` or `[[ ]]` body have rloc 0.

### Missing
- ABL as a whole (the mapping exists in `treeSitterExcavationSite`, `AvailableCollectors` has no entry).
- The extensions in the table above; most hurt in real projects: `.mm`, `.pyw`, `.phtml`, `.bash`, `.rake`,
  `.pp` / `.lpr` / `.inc`, extension-less scripts.

### Good
- `loc`, `rloc` and `comment_lines` are exact in every language and nearly every probe: doc, block, line, nested
  and trailing comments, comment markers in strings, raw strings, heredocs, templates and regex literals.
  Exceptions: swift block-comment marker in a string, php inline HTML, ruby `__END__`, objectivec directive lines.
- Loops, `if` / `else if`, ternaries, `&&` / `||`, `catch` are counted as expected in every language outside
  the exceptions above; `long_method` and `excessive_comments` are right everywhere.

## Dependency parser

### Unchanged since 2026-09-06
Every language reports the edges of rounds 1 and 2 again, with the same flags and the same misses. The port of
php, go, python and vue into `treeSitterExcavationSite` changed no result. The ranking of the earlier summary
still stands: same simple name in two packages collapses, usages in function bodies missing in rust / go / cpp,
aliases not followed, free functions and constants neither leaves nor edges, files without a class-like
declaration vanish, C is effectively unsupported, barrels inconsistent, test detection by directory only.

### New in round 3
1. **New sources of false edges.**
   - go: a called method name is resolved as a type name (`creature.HitPoints()` -> `hit_points.go`; a probe
     `animals.Centaur()` on an unrelated interface -> `centaur.go`).
   - rust: one qualified usage (`model::Speed`) makes every bare type name of the file resolve by substring; a
     probe file without imports got four edges. The round-2 edge `creature_report.rs -> lair.rs` only exists
     because of it.
   - vue: `X.vue` and `X.ts` in one folder become one node (extension stripped), the `.vue` gets 0 incoming.
   - typescript: `declare module "winston"` in a `.d.ts` still gives `CreatureService.ts` a false edge (the
     typings exist again, under `src/.../types/`).
   - c, cpp: `Creature` still resolves to the dto (3 wrong edges each).
2. **Expression-level and declaration-level references that give no edge**, by language:

| Language | No edge for |
| --- | --- |
| java | enhanced-`for` variable type, switch type pattern, record pattern, generic bound, method reference, cast, class literal, wildcard bound, `catch` type, typed lambda parameter |
| kotlin | secondary-constructor parameter, `catch`, `as?`, `is`, lambda parameter type, `where T : X`, `<T : X>`, `emptyList<T>()` (only upper-case callees are read) |
| csharp | type patterns in `switch`, `is T`, `is not T`, tuple element type, `default(T)`, `new T[n]`, extension method call; a file with top-level statements is absent entirely |
| cpp | `Type::member` in a body, `typeid`, `using enum`, lambda parameter, pointer to member, concept-constrained parameter, template specialization |
| rust | everything in a function body, associated-type binding `Iterator<Item = T>`, re-exports in a nested `mod.rs` (only `lib.rs` is folded) |
| go | package `var` declarations, `var _ I = (*T)(nil)`, dot import, method values |
| php | promoted constructor parameters, interface `extends`, enum `implements`, anonymous class, nullable / variadic / intersection types, trait bodies |
| python | `TypeVar(bound=T)`, `type` alias, string hints, `importlib` |
| typescript | type predicate `x is T`, `import x = require()`, inline `import("…").T` |
| delphi | `on E: X do`, pointer types, `class of`, free routines, unit-level `var`, bodyless class `E = class(Exception);` |
| javascript | all 13 JSDoc-only dependencies, `export *`, side-effect import, directory `require` |
| vue | static default import of a `.vue` by path, `import x = require()`, the spec file |

3. **Unicode identifiers:** delphi cuts leaf names at umlauts (`TZentaurenhöhle` -> `TZentaurenh`); every other
   language resolves the unicode type and file.
4. **Leaves and metrics:** `incoming_dependencies` / `outgoing_dependencies` count declaration pairs, not
   files (ts, kotlin, delphi, java); nested and local types become top-level leaves (java `Ranking`, kotlin
   `Builder`, go function-local `mount`); every leaf edge still has usage `usage`; records and structs are `class`.
5. **Cycles that stay invisible:** rust (0 of 2 file cycles, the log's "1 cycle" is `Dice <-> DiceRoll` in one
   file), go (0 of 4 cyclic edges), delphi (0 of 2), csharp (0, partial class), c (0 of 1).

### Not supported
abl, bash, objectivec, ruby, swift: 0 of 67 to 78 expected edges each. Each report lists the edges a parser
would have to find.

## Domain language parser

### Wrong
1. **Umlauts and `ß` cut words in comments and strings, not in identifiers.** `Zentaurenhöhle` -> `zentaurenh`
   + `hle`, `Rüstungsklasse` -> `stungsklasse`, `gehören` -> `geh` + `ren`, `Größe` -> nothing. The prose
   pattern is `[a-zA-Z]{3,}` (`SplitStage`). One word shows up in two or three spellings. Every language;
   `größe` and `höhle` are found nowhere as prose.
2. **Strings below an `export` statement are dropped** (js, ts, vue): `StringLiteralExtractor` treats them as
   module paths. Nearly every string of a module is gone.
3. **`d20Roll` gives `20` + `roll`, `rollD20` gives `roll` + `d20`, `roll_d20` gives `roll` + `20`.** A leading
   lower-case `d` before digits is dropped and the bare number becomes a word. Confirmed with one identifier per
   file; six reports attributed it the other way round and carry a correction note.
4. **String escapes are not decoded:** `"ooze\ngolem"` gives `ngolem` (c, cpp, rust, bash).
5. **Underscore-joined and digit-carrying words in strings and comments yield nothing** (ruby, go, vue).
6. **Documentation tags and directives are words:** `summary` 22 (csharp), `param` 32 (js), `mark` 80 (swift),
   `shellcheck` 86 (bash), `nodoc`, `brief`, `todo`, go directives and the cgo preamble.
7. **Structure noise:** include paths and guards (c: `sots` 239, cpp: `hpp` 91), namespaces not split
   (php `desotscellars` 111), module lines (ruby `centaurs` 96), `::` deleted (bash), `construct` 54 (php),
   objectivec headers read as C (`ns`, `assume`, `nonnull`, `end`, `interface` on top).
8. **`describe` is an English stop word**, so the shared function name leaves no trace (abl, csharp, ruby).
9. **`--comment-weight 0` / `--string-weight 0` still abort with a stack trace.**

### Missing
1. **No root or folder word list.** The lens holds file nodes only (it had folder and root nodes on
   2026-09-06). The 17 expected words can only be confirmed by summing over files; all 17 are there in all 17
   languages.
2. **No German stop words:** `die`, `unter`, `dem`, `und`, `jeder`, `der`, `liegt` are counted everywhere
   (php filters `die` only because it is a PHP keyword).
3. **Declarations that are not extracted:** rust bindings outside `let` (`for x in`, `if let`, match arms);
   swift pattern bindings and loop variables; python typed parameters with a default and `self.x = …`; js plain
   parameters and all parameters in `.vue` scripts; objectivec pointer-declared locals and most header
   declarations; abl qualified class headers, temp-table fields, `.i` files; csharp LINQ range variables, `out var`,
   tuple element names; JSX text and Vue templates; inline HTML (php); raw strings (swift).
4. **Usages are not counted**, only declarations (the earlier kotlin report claimed weight 1 for usages).
5. **Test detection by file name** outside `kt kts java cs php` (swift, objectivec, c, bash, abl); rust inline
   test modules cannot be excluded; objectivec `--exclude-tests` leaves the test file in.
6. **Delphi** as a whole, although `DelphiExtractionMapping` exists in the tree-sitter layer.

### Bad
- `id`, `type`, `value`, `new` rank in the top five in most languages; `entity`, `repository`, `facade`, `dto`,
  `logger` pass MODERATE while `util`, `service`, `exception` do not; `temporary` and `name` are removed although
  they are domain words here.
- Standard-library names count as domain words: python `dataclass` 21, `abstractmethod` 12; rust `fmt`, `deref`;
  objectivec `init` 54; kotlin English number words (`one` 75).
- Commented-out code is read as prose in every language; build files are read as source (`Package.swift`, `.kts`).
- The Vue keyword list removes `store`, `state`, `model`, `key`, `name`, `data` from every `.vue`.
- `tfidf` is the same value for a word in every file (objectivec, vue).

### Good
- All 17 expected words in all 17 languages; no language keyword leaks anywhere.
- camelCase, snake_case, SCREAMING_SNAKE, PascalCase, acronyms, kebab strings and unicode identifiers split
  correctly; weights 3 / 2 / 1 are visible and adjustable; tests are included by default.

## Changed since 2026-09-06

- The domain lens lost its folder and root nodes; words carry `tfidf`.
- Dependency leaf kinds are lower case; leaves carry no namespace (go, rust).
- csharp: the partial class is now two leaves and the "share a logical path" warning is gone; the wrong edge
  target and the missing cycle remain.
- rust: "barrels resolve through `pub use`" and "0 false positives" no longer hold as stated (see above).
- delphi: `[TableAttribute('x')]` does give an edge, only the short `[Table(...)]` form is missed.
- objectivec: non-pointer locals are extracted, pointer-declared ones are not.
- typescript, vue: JSX tag names (`article`, `li`, `strong`) now appear as words.
- The dependency parser now runs on unsupported languages and writes an empty map instead of not running.
- Corrected counts of the earlier reports: c 84 expected edges (not 80), typescript 11 round-2 edges (not 12),
  abl `hit` / `points` 19 (not 18), cpp `memory` comes from `InMemoryCreatures`, not from `#include <memory>`.

## How far to trust this

- Expected values were hand-counted by one agent per language and checked against the parser by the same agent.
  Each report marks its own miscounts (kotlin, c, cpp, python, ruby, javascript, typescript, vue, delphi); the
  counting rule left room for a per-language reading where it names no construct (`??=`, `let … else`, guards),
  and each report states its reading.
- In java, csharp and typescript the expected values reached the file in the same step as the first run; in all
  other languages before it.
- Per-construct values come from scratch runs with one construct per file, because the parser reports file totals
  only; the sums were reconciled with the file totals where a report says so.
- The numbers in the overview table were re-read from `output/` after the agents finished and match the reports.
- Nothing was compiled; the projects only have to parse. Not checked on macOS.

## Where to look

`sample-projects/<language>/FINDINGS.md`: Project, Unified parser, Dependency parser, Domain language parser,
Changed since 2026-09-06, Verdict (Missing / Wrong / Bad / Good per parser, each item with file and construct).
`sample-projects/<language>/output/`: the `.cc.json` results; print them with `tools/dump_lenses.py`.
