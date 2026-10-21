# Sample projects

One small "Cellars and Centaurs" project per language, used to check what the `unifiedparser`, the
`dependencyparser` and the `domainlanguageparser` of CodeCharta find in each language. The projects do not need to compile. They are
modelled on `Ideas/DC/DependaCharta/exampleProjects/*` and share one domain model so that results are
comparable across languages.

This folder is excluded from Biome and Sonar.

## Layout

```
sample-projects/
  README.md                 this spec
  tools/dump_lenses.py      prints the dependency and domain lens of a cc.json as plain text
  tools/compare_dependency_builds.py  diffs the edges of two ccsh builds, or of one build against regression/
  regression/<language>/<probe>/  small projects that pin down one rule of how the dependency parser resolves a
                            name: src/ and expected.txt (the correct edges); ProbeRegressionTest runs them
  regression/<language>/known-gaps.md  how the probes of that language deviate from their expectation today
  <language>/
    FINDINGS.md             report for that language (template below)
    output/                   parser runs from "How to run" (generated, gitignored)
    <project files in the language's conventional layout>
```

`regression/` is no showcase project: it repeats names on purpose, so a run over all of `sample-projects/` excludes
it (`-e regression`). Every folder `regression/<language>/<probe>/` must hold `src/` and `expected.txt`, or the test
fails. `expected.txt` holds the correct edges, one line each, such as `leaf a/B.cs#B -> c/D.cs#D usage=inheritance
cyclic upward`; `#` starts a comment. A language's `known-gaps.md` has one `## <probe>` section per deviating probe:
why, then a fenced block where `missing <line>` names an expected line the parser does not draw yet and
`extra <line>` a wrong line it draws. Every other expected line stays checked, and the test fails once a gap closes
or a section names no probe. The test analyses `src/` like
`ccsh dependencyparser --include-tests --bypass-gitignore`, so build folders are excluded unless `src/` has a
`.gitignore`; `UPDATE_REGRESSION_PROBES=true ./gradlew :analysers:parsers:DependencyParser:test` rewrites the
expectations after a deliberate change.

`compare_dependency_builds.py <new-ccsh> [<old-ccsh>] [--samples]` compares a build against the expectations, or,
also on the showcase projects, against a second build such as the last release. It exits with 0 when no edge
differs, 1 when edges differ, 2 on wrong arguments or a probe folder without `expected.txt`, and 3 when a ccsh run
fails, writes no map or cannot analyse a file.

Language folders: `abl`, `angular`, `bash`, `c`, `cpp`, `csharp`, `delphi`, `go`, `java`, `javascript`, `kotlin`,
`objectivec`, `php`, `python`, `ruby`, `rust`, `sql`, `swift`, `typescript`, `vue`.

| Parser | Languages |
| --- | --- |
| `unifiedparser` | every language except abl (extensions: `.js .cjs .mjs`, `.ts .cts .mts`, `.tsx`, `.java`, `.kt`, `.cs`, `.cpp .cc .cxx .c++ .hh .hpp .hxx`, `.c .h`, `.m`, `.py`, `.go`, `.php`, `.rb`, `.swift`, `.sh`, `.vue`, `.pas .dpr`, `.rs`, `.html`, `.sql .pks .pkb .pls`) |
| `dependencyparser` | php, csharp, typescript (+tsx), javascript, java, go, python, c and cpp (one C++ grammar), kotlin, vue, delphi, rust, angular (templates), sql |
| `domainlanguageparser` | kotlin, typescript, javascript, java, python, csharp, go, c, cpp, php, ruby, swift, bash, objectivec, vue, abl, rust, angular (templates), sql |

## The shared domain model

Root namespace `de.sots.cellarsandcentaurs` (where the language has namespaces or packages), four layers
as sub-packages / folders. Use the language's conventional file and identifier casing.

| Layer | Declarations |
| --- | --- |
| `domain/model` | `Creature` (implements `Fightable`), `CreatureId`, `CreatureType` (enum: monstrosity, beast, aberration, celestial, dragon, fiend, humanoid, undead), `ArmorClass`, `HitPoints`, `Speed`, `SpeedType` (enum: walking, flying, swimming, burrowing, climbing), `Fightable` (interface), `NoSuchCreatureException` |
| `domain/model` (stress) | `Centaur` extends `Creature`; `Dice` file holding two declarations `Dice` and `DiceRoll` plus a free function `rollD20` (where the language allows it) |
| `domain/service` | `Creatures` (interface / port), `CreatureService` |
| `adapter/persistence` | `CreatureEntity`, `CreatureRepository` (generic `Repository<T>` base where the language has generics), `PersistedCreatures` implements `Creatures` |
| `application` | `CreatureFacade`, `CreatureUtil`, a barrel / re-export module where the language has one (`index.ts`, `__init__.py`, `mod.rs`, ...) |
| `application/dto` (stress) | `Creature` DTO: same simple name as the domain `Creature`, different package |

Keep the semantics of the DependaCharta examples: the facade creates a creature with speeds for all speed
types, hit points and armor class and saves it through the service; `PersistedCreatures` maps entities to
domain objects and throws `NoSuchCreatureException` when an id is unknown.

SQL has neither packages nor classes: `sql/` keeps the layers as folders and turns the model types into tables,
the services into procedures and functions, the port into a PL/SQL package specification and the barrel into a
view, mixing ANSI SQL, T-SQL, PL/SQL, PL/pgSQL and MySQL across its files. Its FINDINGS.md says what stands in for
each stress construct.

## Stress constructs for the dependency parser

Add every construct the language supports and note in FINDINGS.md which ones it does not have.

1. Aliased import (`import { CreatureEntity as Entity }`, `use ... as`, `import x as y`, ...), in `CreatureRepository`.
2. Wildcard / namespace import (`import ...model.*`, `import * as model`, `use model::*`, `using namespace`), in `CreatureUtil`.
3. Re-export / barrel module in `application` that the persistence adapter imports from (the deliberate upward dependency and the cycle `Creature -> CreatureFacade -> CreatureService -> Creature` from the TypeScript example).
4. Inheritance (`Centaur extends Creature`) and interface implementation (`Creature implements Fightable`, `PersistedCreatures implements Creatures`).
5. Generic base class or generic function (`Repository<T>`), used by `CreatureRepository`.
6. A type used only in a type position (parameter / return / field type), a type only instantiated (`new`), a type only used through a static member (`CreatureFacade.STANDARD_CREATURE_TYPE`), and a type only referenced in an annotation / attribute / decorator where the language has them.
7. Two declarations with the same simple name in different packages (`domain.model.Creature` and `application.dto.Creature`) both used from `CreatureFacade`.
8. A fully qualified reference without an import, where the language allows it (`de.sots.cellarsandcentaurs.domain.model.Speed` in Java).
9. An unused import (`Fightable` imported in `CreatureUtil` and never used).
10. Standard library and third-party usage (`UUID`, `Map`, `List`, a logging library) that must not appear as internal edges.
11. A test file (`CreatureServiceTest` or the language's naming convention) that references `CreatureService`. The dependency parser skips tests by default and the domain parser includes them by default.
12. Multiple declarations in one file (`Dice` and `DiceRoll`) and a file whose name differs from the declaration it holds.

## Stress content for the domain language parser

Place these texts verbatim (in the language's comment / string syntax) so word counts are comparable:

| Where | Text |
| --- | --- |
| Doc comment on `Creature` | `A creature that roams the cellar. Centaurs, beasts and dragons all share hit points, armor class and speeds.` |
| Doc comment on `HitPoints` | `Hit points drop when the creature takes damage and recover when it rests in its lair.` |
| Line comment in `CreatureFacade.create` | `Rolls initiative for every creature in the dungeon before the encounter starts.` |
| Block comment in `CreatureUtil` | `Counts the treasure hoard a creature guards.` |
| String literal in `NoSuchCreatureException` | `No such creature in the dungeon: ` |
| String literal in `CreatureFacade` | `centaur-stable` (a hyphenated identifier inside a string) |
| Test file | method name `should_save_creature_to_the_stable` (or the language's idiom) |

Identifier forms to use somewhere in the project, so identifier splitting can be judged:

| Form | Identifier |
| --- | --- |
| camelCase | `walkingSpeed` |
| snake_case | `walking_speed` (in a language that uses camelCase, put it in the test file) |
| SCREAMING_SNAKE | `MAX_HIT_POINTS` |
| PascalCase | `ArmorClass` |
| Acronym | `XPValue` / `xp_value` |
| Digit | `d20Roll` |
| Kebab in string | `centaur-stable` |

Expected domain words (the domain lens holds file nodes only, so sum the frequencies over all files): creature, centaur, cellar, dungeon, armor,
hit, points, speed, damage, lair, initiative, encounter, treasure, hoard, stable, dice, roll.

Words that must not appear: language keywords (`class`, `public`, `def`, `func`, `fn`, `let`, `var`,
`string`, `int`, `override`, ...) and the technical stop words at the default level `MODERATE` (`util`,
`facade`?, `entity`, `repository`, `exception`, `test`, `mock`, ...). Report which of these leak through and
say whether that is right or wrong for the language.

## Stress content for the unified parser

`domain/service` holds one `EncounterResolver` (file and identifier casing as the language wants it) with the
same logic in every language, so the numbers are comparable. The expected values are written into
FINDINGS.md **before** the parser runs, counted by hand with the rule below, not taken from the parser.

| Function | Parameters | Body |
| --- | --- | --- |
| `resolve(attacker, defender, roll, bonus, terrain)` | 5 | `if` with early return, `else if`, `else`; a `for` loop over the attacker's speeds holding an `if` with one `&&`; a `while` loop; a `switch` / `when` / `match` with 3 cases and a default; one ternary (or the language's conditional expression); one `||`. More than 10 real lines. |
| `describe(creature)` | 1 | one chain of exactly 5 consecutive method calls on one expression and one chain of exactly 3 |
| `safeRoll(dice)` | 1 | `try` with one `catch` (and `finally` where it exists); a lambda / closure / anonymous function holding one `if` |
| `initiativeOrder(creatures)` | 1 | a nested named function where the language has them, and one recursive call |
| `isEmpty()` | 0 | a single `return` |

Comments in the file: a 6-line doc comment on the type, three line comments, one 2-line block comment, one
trailing comment after code, one line of commented-out code. Where the language lacks a construct, use the
closest idiom and say so.

Counting rule for the expected values:

| Metric | Expected by |
| --- | --- |
| `logic_complexity` | +1 per `if`, `else if`, loop, `case` (not `default`), `catch`, conditional expression, `&&`, `\|\|` |
| `complexity` | `logic_complexity` + 1 per function, method, lambda |
| `number_of_functions` | named functions and methods, lambdas excluded |
| `loc` / `rloc` / `comment_lines` | all lines / lines with code / lines with a comment (a trailing comment line counts for both) |
| `max` / `min` / `mean` / `median` of parameters, complexity and rloc per function | from the table above; rloc of a function is its body |
| `long_method` | functions with more than 10 rloc |
| `long_parameter_list` | functions with more than 4 parameters |
| `message_chains` | chains of 4 or more consecutive calls |
| `excessive_comments` | 1 when the file has more than 10 comment lines |

A second file `EncounterEdgeCases` in the same folder holds what the language has beyond that and what a
parser is likely to miss: null-coalescing and optional chaining, pattern guards, comprehensions, `unless` /
`until`, `guard` / `defer`, `select`, `do … while`, `goto`, labelled breaks, fallthrough, exception filters,
preprocessor branches and macros, local functions, constructors, initialisers, property accessors, operator
overloads, extension functions, generators, `async` / `await`, default and variadic parameters, expression
bodies, comment markers inside strings, multi-line strings and heredocs, nested comments, doc comments in
every syntax the language has. One function per construct, each with its expected value. The same file may
carry constructs the dependency and the domain parser are likely to miss that rounds 1 and 2 did not cover.

## Round 3 additions (2026-10-08)

| Addition | Where | What to judge |
| --- | --- | --- |
| German words | `domain/model`, a type `Zentaurenhöhle` (file `Zentaurenhoehle` if the file system or language objects) with a field `rüstungsklasse`, the comment `Die Zentaurenhöhle liegt unter dem Verlies. Rüstungsklasse und Trefferpunkte gehören zu jeder Kreatur.` and the string `Größe der Höhle`. Where identifiers must be ASCII, use `Zentaurenhoehle` / `ruestungsklasse` and keep comment and string. | Domain parser: do `zentaurenhöhle`, `verlies`, `rüstungsklasse`, `trefferpunkte`, `kreatur`, `größe`, `höhle` appear, are umlaut words cut apart, do German stop words (`die`, `unter`, `dem`, `und`, `jeder`) leak. The other two parsers: is the file handled at all. |
| JSX / TSX | javascript: `CreatureCard.jsx`, typescript: `CreatureCard.tsx`, importing the domain `Creature`, rendering a `<SpeedBadge />` from a second component file that is used only as a tag, with `&&`, a ternary and `.map()` inside the markup and the text `Wandering centaur` | all three parsers |
| TypeScript typings | the `declare module` files from round 2 again, in a folder the root `.gitignore` does not ignore (`typings/` is ignored) | dependency parser |
| Extension variants | one small file for every rarer extension any parser lists for the language (`.cc .cxx .hh .hxx .h++`, `.mm`, `.kts`, `.pyw`, `.phtml`, `.bash .zsh`, `.cts .mts`, `.cjs .mjs`, `.rake .gemspec`, `.p .w`, `.dpr`) | table extension x parser: analysed or skipped |

Run every command with `LC_ALL=C.UTF-8` (or another UTF-8 locale). Under a POSIX locale the JVM cannot decode
`Zentaurenhöhle.*` and all three parsers leave the file out without a message.

The parsers look for a `.gitignore` in the scanned folder only, so the repository's root `.gitignore` does not
apply to a run on `sample-projects/<language>`; `-e "output,FINDINGS.md"` is what keeps the results out.

## How to run

The built CLI is `analysis/build/install/codecharta-analysis/bin/ccsh`. The parsers need absolute paths,
so the commands below derive them from the repository root and work from any directory. Do not rebuild the
CLI and do not change anything under `analysis/` or `visualization/`.

```bash
REPO=$(git rev-parse --show-toplevel)
CCSH="$REPO/analysis/build/install/codecharta-analysis/bin/ccsh"
LANG_DIR="$REPO/sample-projects/<language>"
mkdir -p "$LANG_DIR/output"
"$CCSH" unifiedparser -nc "$LANG_DIR" -e "output,FINDINGS.md" -o "$LANG_DIR/output/unified.cc.json"
"$CCSH" dependencyparser -nc "$LANG_DIR" -e "output,FINDINGS.md" -o "$LANG_DIR/output/dependency.cc.json"
"$CCSH" dependencyparser -nc "$LANG_DIR" -e "output,FINDINGS.md" --include-tests -o "$LANG_DIR/output/dependency-with-tests.cc.json"
"$CCSH" domainlanguageparser -nc "$LANG_DIR" -e "output,FINDINGS.md" -o "$LANG_DIR/output/domain.cc.json"
python3 "$REPO/sample-projects/tools/dump_lenses.py" "$LANG_DIR/output/unified.cc.json"
python3 "$REPO/sample-projects/tools/dump_lenses.py" "$LANG_DIR/output/dependency.cc.json"
python3 "$REPO/sample-projects/tools/dump_lenses.py" "$LANG_DIR/output/domain.cc.json" --words 40
```

Options worth a second run when judging a finding: `--verbose` on both parsers, `--stop-word-level MINIMAL`
/ `AGGRESSIVE`, `--no-technical-stopwords`, `--ngrams 2`, `--exclude-tests` on the domain parser.

The `.cc.json` uses API version 2.1: `files` holds the tree, `lenses.dependency.edges` the file-level edges
(with `isCyclic` and `isPointingUpwards` flags), `lenses.dependency.leaves` / `leafEdges` the
declaration-level graph, `lenses.metrics.attributes` the per-file `incoming_dependencies` /
`outgoing_dependencies` and, from the unified parser, the code metrics, and `lenses.domain.nodes` the word
list per file (no folder or root entry). A parser run on a language it does not support is still part of the report: say
whether it fails, writes an empty map or skips the files silently.

## FINDINGS.md template

```markdown
# <Language>

## Project
- layout, file count, which stress constructs exist in the language and which do not

## Dependency parser
- command(s) and whether they ran without error
- table: construct | expected edge(s) | found | verdict (ok / missing / wrong / extra)
- false positives (edges that should not exist), cycles and upward edges: expected vs. reported
- leaf kinds (CLASS, INTERFACE, ENUM, REEXPORT, ...): right or wrong
- what the language offers natively (module system, namespaces) and what CodeCharta has to resolve itself

## Unified parser
- command(s) and whether they ran without error, which files and extensions were analysed or skipped
- `EncounterResolver`: table metric | expected (written before the run) | reported | verdict
- `EncounterEdgeCases`: table construct | expected | reported | verdict
- line counting: loc, rloc, comment lines, comment markers in strings
- everything else that looks off in the other files (functions not counted, wrong parameter counts)

## Domain language parser
- command(s) and whether they ran without error
- expected words: which of the 17 appear, with the frequency summed over the files
- keyword and technical-word leakage: which appear, and whether that is right
- identifier splitting: table form | identifier | words found
- comments and strings: are the planted sentences counted, are weights visible
- test file handling

- German words: which of the seven appear, how umlauts are split

## Changed since 2026-09-06
- findings of the earlier report that no longer hold, and new ones on the old files

## Verdict
One block per parser (unified, dependency, domain), most important first, each item with the file and the
exact construct:
- Missing: not supported or not extracted at all
- Wrong: a result that is incorrect
- Bad: works, but noisy, misleading or awkward to use
- Good: what can be relied on
```
