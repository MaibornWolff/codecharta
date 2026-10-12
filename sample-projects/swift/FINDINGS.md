# Swift

> Correction (2026-10-08, cross-check with one identifier per file): the digit split is attributed the wrong way
> round wherever this report mentions it. `d20Roll` gives `20` + `roll` (the leading `d` is dropped), `rollD20` gives
> `roll` + `d20`, `roll_d20` gives `roll` + `20`. Both identifiers sit in the same file here, so the file's word list
> could not tell them apart.

Round 3, 2026-10-08. Every number below comes from the runs in `output/` made on this day; the expected
values were written into this file before the first run and are unchanged, except where a correction is
marked as such.

## Project
- Layout: SwiftPM package. `Package.swift`, `Sources/CellarsAndCentaurs/{Domain/Model, Domain/Service, Adapter/Persistence, Application, Application/DTO, Application/Extensions}`, a second target `Sources/CellarsAndCentaursPersistence/`, `Tests/CellarsAndCentaursTests/`. 37 `.swift` files (36 sources including the manifest, 1 test). One SwiftPM target is one module, so folders carry no namespace and the root namespace `de.sots.cellarsandcentaurs` exists only in logger labels.
- Added in round 3: `Domain/Service/EncounterResolver.swift`, `Domain/Service/EncounterEdgeCases.swift` (40 sections, one per construct, each introduced by `// MARK: - <name>`), `Domain/Model/Zentaurenhöhle.swift` (unicode file name, type `Zentaurenhöhle`, field `rüstungsklasse`, the German comment and string; the string sits in an extra `static let label`). None of the three is git-ignored (`git check-ignore -v` returns nothing).
- Extension variants: none. All three parsers know only `.swift` for this language.
- Stress constructs present: inheritance, protocol conformance, generic base class, static-member-only use, type-position-only use, instantiation-only use, attribute-only use (`@NonNegative`, `@Rolled(sides:)`), module-qualified reference (`CellarsAndCentaurs.Speed`), two `Creature` types (`DTO.Creature`), several declarations per file, extension in a differently named file, stdlib / third-party use, test target, cross-target `import`, `@_implementationOnly import`, `associatedtype`, `where` constraint, `as?` cast, `case let … as` pattern. New in `EncounterEdgeCases.swift` (section `dependencyForms`): `extension Centaur: Wanderer`, key path `\Creature.hitPoints`, existential `any Creatures`, opaque `some Fightable`, metatype `Creature.Type` / `Centaur.self`, `is Centaur`, protocol composition `Fightable & Wanderer`, nested type `DTO.Creature?`, static call `HitPoints.full`, `typealias Herd = [Centaur]`.
- Constructs Swift does not have: aliased import of a type (replaced by `typealias Entity`), per-type wildcard import, re-export inside one module (`@_exported import Logging` and a public typealias are the closest), sub-packages, `finally` (a `defer` block in `EncounterResolver.safeRoll`), `goto`, `unless` / `until`, `select`, comprehensions, generators, `do … while` under that name (`repeat … while`), preprocessor macros (`#if` conditions and `#warning` / `#function` expressions instead). The exception filter is `catch … where`, the local function is a nested `func`.

## Dependency parser
- Commands: both README commands and a `--verbose` run. Exit code 0 each time, no exception. The parser has no Swift support and says so only indirectly: `WARN No supported source files found under …/sample-projects/swift` and `WARN No analyzable declarations were found, so the dependency lens stays empty`. It still writes a map: `dependency.cc.json` and `dependency-with-tests.cc.json` (1309 bytes each) hold a single `root` folder, no file, `lenses.dependency.edges: []`, no `leaves`, no `leafEdges`, `lenses.metrics.attributes: {}`. `--include-tests` and `--verbose` change nothing. "Swift" is named in no message.
- Expected against found:

| construct | expected edge(s) | found | verdict |
| --- | --- | --- | --- |
| whole project without the test file | 74 file edges (50 round 1, 10 round 2, 14 round 3) | 0 | missing |
| with `--include-tests` | 80 | 0 | missing |
| `EncounterResolver.swift` | `-> Creature`, `-> Dice` (parameter types) | 0 | missing |
| `EncounterEdgeCases.swift` | `-> Creature`, `SpeedType`, `CreatureType`, `Dice`, `NoSuchCreatureException`, `Speed`, `HitPoints`, `Fightable`, `CreatureId`, `Creatures`, `Centaur`, `Application/DTO/Creature` | 0 | missing |
| `Zentaurenhöhle.swift` | none | 0 | ok (trivially) |
| cycles | `Creature -> CreatureFacade -> CreatureService -> Creature`; `ArmorClass -> CreatureUtil -> Creature -> ArmorClass` | none reported | missing |
| upward edges | `Creature -> CreatureFacade`, `ArmorClass -> CreatureUtil`, `CreatureMapper -> CreatureFacade` | none reported | missing |

- False positives: none, there is no edge at all. Leaf kinds: no leaf exists.
- The 60 edges of rounds 1 and 2 are the list of the 2026-09-06 report, carried over without being derived again:

```
Domain/Model/Creature -> Fightable, CreatureId, CreatureType, ArmorClass, HitPoints, SpeedType, Speed, Application/CreatureFacade (upward)
Domain/Model/Centaur -> Creature, CreatureId, Speed, SpeedType
Domain/Model/ArmorClass -> Application/CreatureUtil (upward)
Domain/Model/HitPoints -> NonNegative (attribute only)
Domain/Model/NoSuchCreatureException -> CreatureId
Domain/Service/Creatures -> Creature, CreatureId
Domain/Service/CreatureService -> Creatures, Creature, CreatureId
Adapter/Persistence/CreatureRepository -> Repository, CreatureEntity (via typealias Entity)
Adapter/Persistence/PersistedCreatures -> Creatures, CreatureRepository, Creature, CreatureId, NoSuchCreatureException, CreatureMapper
Adapter/Persistence/CreatureMapper -> Creature, CreatureEntity, CreatureType, CreatureId, HitPoints, Application/CreatureFacade (upward)
Application/CreatureFacade -> CreatureType, CreatureService, DTO/Creature, Creature, CreatureId, ArmorClass, HitPoints, SpeedType, Speed
Application/DTO/Creature -> CreatureType
Application/CreatureUtil -> Creature
Application/Exports -> CreatureFacade, CreatureUtil
Application/Extensions/Creature+Description -> Creature, Centaur, CreatureFacade
Tests/CreatureServiceTests -> CreatureService, Creatures, Speed, Creature, CreatureId, NoSuchCreatureException (only with --include-tests)
CellarsAndCentaursPersistence/CreatureArchive -> Domain/Service/Creatures (cross-target import)
CellarsAndCentaursPersistence/ArchiveKey -> Domain/Model/CreatureId (@_implementationOnly import)
Domain/Model/Lair -> Creature (associatedtype constraint only)
Domain/Model/Encounter -> Fightable (where clause only)
Application/CentaurStable -> Centaur (as? cast only), Creature
Domain/Service/InitiativeOrder -> Centaur (case let … as only), Creature
Domain/Model/Initiative -> Rolled (property wrapper with arguments only)
Domain/Model/Rolled -> Dice
Round 3:
Domain/Service/EncounterResolver -> Creature, Dice
Domain/Service/EncounterEdgeCases -> Creature, SpeedType, CreatureType, Dice, NoSuchCreatureException, Speed, HitPoints,
    Fightable, CreatureId, Creatures, Centaur, Application/DTO/Creature
```

- What the language offers natively: a module per SwiftPM target, whole-module visibility without any import, `import` only across modules. Inside a target there is no import line to hang an edge on, so CodeCharta would have to resolve every edge from bare type names across the whole target, read `Package.swift` to learn which folders form a module, attach an extension (`Creature+Description.swift`, `extension Speed` and `extension Centaur: Wanderer` in `EncounterEdgeCases.swift`) to the extended type instead of creating a leaf, and tell protocol conformance from inheritance although both are written `: Name`. Member access with an inferred type (`.flying`, `.dragon`) names no type at all.

## Unified parser
- Command: the README command, exit code 0, `unified.cc.json` with 37 files, all `.swift`. Nothing else is in the folder besides `FINDINGS.md` and `output/`, both excluded. `WARN No .gitignore found at root level, excluding common build folders as fallback...` appears although the repository has a root `.gitignore`: the parser looks for it only in the folder it is given.
- Locale: the shell of this run has `LC_ALL` unset (POSIX). With that the parser analyses 36 files and drops `Domain/Model/Zentaurenhöhle.swift` without any message (`output/unified-posix-locale.cc.json`). With `LC_ALL=C.UTF-8` the file is analysed (loc 6, rloc 4, comment_lines 1, no function, complexity 0: all as expected). All files named in "How to run" were produced with `LC_ALL=C.UTF-8`. Not verified on macOS.
- Variant runs used to attribute deviations: `output/unified-edge-sections.cc.json` (each of the 40 sections of `EncounterEdgeCases.swift` as a file of its own) and `output/unified-resolver-functions.cc.json` (each top-level method of `EncounterResolver` as a file of its own), plus single-construct snippets that are not kept.

### `EncounterResolver.swift`
| metric | expected (before the run) | reported | verdict |
| --- | --- | --- | --- |
| loc | 89 | 89 | ok |
| rloc | 72 | 72 | ok |
| comment_lines | 13 | 13 | ok |
| logic_complexity | 14 | 15 | wrong, +1: `default:` of the `switch` in `resolve` is counted (`switch_entry`) |
| complexity | 21 | 23 | wrong, +2: the `default:` and the `defer { }` in `safeRoll`, which is counted like a closure |
| number_of_functions | 6 | 6 | ok |
| max_parameters_per_function | 5 | 5 | ok |
| min_parameters_per_function | 0 | 0 | ok |
| mean_parameters_per_function | 1.5 | 1.6 | wrong: 5 functions in the statistic, the nested `initiativeOf` is not an entry |
| median_parameters_per_function | 1 | 1 | ok |
| max_complexity_per_function | 12 | 12 | equal by accident: 11 branches + `default`, without the function's own 1 |
| min_complexity_per_function | 1 | 0 | wrong against the rule: the function itself is not counted, `isEmpty` and `describe` have 0 |
| mean_complexity_per_function | 3.67 | 3.6 | wrong (12, 0, 4, 2, 0 over 5 entries) |
| median_complexity_per_function | 2 | 2 | equal by accident |
| max_rloc_per_function | 31 | 31 | ok |
| min_rloc_per_function | 1 | 1 | ok |
| mean_rloc_per_function | 9.83 | 11.6 | wrong: 31, 3, 14, 9, 1 over 5 entries, `initiativeOf` missing |
| median_rloc_per_function | 6 | 9 | wrong, same cause |
| long_method | 2 | 2 | ok |
| long_parameter_list | 1 | 1 | ok |
| message_chains | 1 | 1 | ok |
| excessive_comments | 1 | 1 | ok |

The five per-function rloc values that exist match the hand count exactly (lines between the braces, comment-only lines left out).

### `EncounterEdgeCases.swift`
File totals: loc 513 / 513 ok; rloc 393 / 393 ok; comment_lines 54 expected, 55 reported; logic_complexity 54 expected, 63 reported; number_of_functions 62 expected, 58 reported; complexity 129 expected, 137 reported; message_chains 2 / 2 ok; long_parameter_list 1 / 1 ok. long_method is reported as 7; no expectation was written before the run, the section runs show the seven bodies (`switchPatterns` 12, `fallthroughCase` 14, `labelledBreak` 13, `patternLoops` 12, `typedCatches` 11, `summon` 12, `platformLair` 11) and each is longer than 10.

Columns are logic_complexity / number_of_functions / complexity, reported values from the section run.

| section | expected | reported | verdict |
| --- | --- | --- | --- |
| guardElse (`guard let … else`) | 1 / 1 / 2 | 1 / 1 / 2 | ok |
| ifLet (`if let a = …, b > 0`) | 1 / 1 / 2 | 1 / 1 / 2 | ok; the comma condition adds nothing |
| ifCase (`if case .flying = x`) | 1 / 1 / 2 | 1 / 1 / 2 | ok |
| switchPatterns (tuple, ranges, two patterns, `where`) | 4 / 1 / 5 | 5 / 1 / 6 | wrong: `default:` counted; `where` and the second pattern add nothing |
| fallthroughCase | 3 / 1 / 4 | 4 / 1 / 5 | wrong: `default:` counted |
| forWhere (`for … in … where`) | 1 / 1 / 2 | 1 / 1 / 2 | ok; the `where` filter adds nothing |
| repeatWhile | 1 / 1 / 2 | 1 / 1 / 2 | ok |
| labelledBreak (`outer:`, `continue outer`, `break outer`) | 4 / 1 / 5 | 4 / 1 / 5 | ok |
| patternLoops (`for case let x?`, `while let`, `stride … where`) | 3 / 1 / 4 | 3 / 1 / 4 | ok |
| deferBlock | 0 / 1 / 1 | 0 / 1 / 2 | wrong: `defer { }` adds 1 to complexity but not to logic_complexity, like a closure |
| enumCases (`case broken`, `case lost, stolen`) | 0 / 0 / 0 | 0 / 0 / 0 | ok |
| typedCatches (4 `catch`, one with two patterns) | 4 / 1 / 5 | 4 / 1 / 5 | ok |
| catchWhere (`catch let e as T where …`) | 2 / 1 / 3 | 2 / 1 / 3 | ok |
| tryOptional (`try?`, `try!`, one `??`) | 0 / 1 / 1 | 1 / 1 / 2 | deviation from the README rule: `??` is counted |
| nilCoalescing (two `??`, four `?.`) | 0 / 1 / 1 | 2 / 1 / 3 | same: each `??` +1, `?.` nothing |
| optionalChain (`a?.b?.c().d().e().f().g`) | 0 / 1 / 1, chains 1 | 0 / 1 / 1, chains 1 | ok |
| shorthandClosures (three `{ $0 … }`) | 1 / 1 / 5 | 1 / 1 / 5 | ok |
| functionalChain (`filter.map.filter.reduce`) | 1 / 1 / 6, chains 1 | 1 / 1 / 6, chains 1 | ok |
| trailingClosures (`@autoclosure`, two trailing closures) | 1 / 2 / 5, parameters 3 and 0 | 1 / 2 / 5, parameters 3 and 0 | ok |
| initDeinitSubscript | 3 / 4 / 7 | 3 / 5 / 9 | wrong: `subscript` with `get` and `set` is 2 functions and 3 complexity (declaration + getter + setter) |
| propertyAccessors | 4 / 5 / 10 | 6 / 2 / 9 | wrong: `willSet` and `didSet` are counted as branches, not as functions; `var area: Int { … }` is no function |
| operatorFunctions (`+`, prefix `-`, `<`, `<=>`) | 2 / 4 / 6, parameters 2, 1, 2, 2 | 2 / 4 / 6, parameters 2, 1, 2, 2 | ok |
| protocolDefault (requirement + default in an extension) | 1 / 1 / 2 | 1 / 1 / 2 | ok |
| argumentLabels (`_ a`, `from b`, `to c`, `by d = …`, `_: Bool`) | 0 / 1 / 1, 5 parameters | 0 / 1 / 1, 5 parameters, long_parameter_list 1 | ok |
| variadicInout (`inout`, `Int...`, default) | 1 / 1 / 2, 3 parameters | 1 / 1 / 2, 3 parameters | ok |
| genericWhere (`<T: P, C: Collection> … where`) | 0 / 1 / 1, 2 parameters | 1 / 1 / 2, 2 parameters | `??` counted, otherwise ok |
| asyncAwait | 3 / 1 / 4 | 2 / 1 / 4 | wrong: `if let c = try await f(x) { … }` is not an `if` but a closure; the totals agree by accident |
| actorMethods (`actor`, `nonisolated func`) | 0 / 2 / 2 | 0 / 2 / 2 | ok |
| compilationConditions (`#if … && …`, `#elseif … \|\| …`, `if #available`) | 1 / 1 / 2 | 1 / 1 / 2 | ok, compile-time conditions add nothing |
| macroExpressions (`#warning`, `#function`, `#line`) | 0 / 1 / 1 | 0 / 1 / 1 | ok |
| resultBuilder (`@resultBuilder`, builder body) | 1 / 4 / 6 | 1 / 4 / 6 | ok |
| ifSwitchExpressions (`let x = if …`, `let y = switch …`) | 4 / 1 / 5 | 5 / 1 / 6 | `default:` counted, otherwise ok |
| enumSwitchSelf (computed `var worth` with `switch self`) | 3 / 1 / 5 | 3 / 0 / 4 | wrong: the property body is no function |
| nestedFunctions (three nested `func`) | 1 / 4 / 5 | 2 / 4 / 6 | `??` counted, otherwise ok |
| expressionBodies (`func f() -> Bool { a && b }`, closure constant) | 1 / 1 / 3 | 1 / 1 / 3 | ok |
| backtickIdentifiers | 0 / 1 / 1 | 0 / 1 / 1 | ok |
| commentMarkersInStrings | 0 / 1 / 1, rloc 11, 2 comment lines | 0 / 1 / 1, rloc 11, 3 comment lines | wrong: `let block = "/* not a comment */"` is a comment line |
| nestedComment (`/* /* */ */`) | 0 / 1 / 1, rloc 3, 5 comment lines | same | ok, `if true { return }` inside the comment is not counted |
| docComments (`///`, `/** */`, `// TODO:`, `// swiftlint:`) | 0 / 1 / 1, rloc 3, 10 comment lines | same | ok |
| dependencyForms | 1 / 6 / 7 | 1 / 5 / 6 | wrong: `var steps: Int { XPValue }` is no function |

The differences add up to the file totals: logic +3 (`default:`), +5 (`??`), +2 (`willSet`, `didSet`), -1 (`if … try await`) = +9; functions +1 (`subscript` setter), -3 (`propertyAccessors`), -1 (`worth`), -1 (`steps`) = -4.

Isolated snippets (not kept) confirm: `if try await creatures.contains(1) { … }` gives logic 0, complexity 2; the same line with only `try` or only `await` gives logic 1. `for await` and `for try await` count as loops. `defer { … }` alone gives logic 0, complexity 2. A subscript with an implicit getter gives complexity 1, 0 functions. `var area: Int { 3 > 2 ? 1 : 0 }` gives logic 1, 0 functions.

Classification from `SwiftMetricMapping.kt`: `switch_entry` covers `default`; `nil_coalescing_expression`, `willset_clause` and `didset_clause` are listed as logic complexity on purpose; `defer_statement` is listed as logic complexity too but never fires, since the run shows +0 logic and +1 complexity; `subscript_declaration` has function complexity without being a function; only `computed_getter` / `computed_setter` (explicit `get` / `set`) are functions, an implicit getter has no entry.

### Line counting
- loc, rloc and comment_lines are right in all three new files except one line: a string literal that holds `/* … */` (`commentMarkersInStrings`). `"https://…"`, a `"""` string with `//`, `/* */` and `#` lines, and a raw string `#"… // …"#` are code, as expected. Nested block comments, `///`, `/** */`, `// MARK:`, a trailing comment and an inline `/* */` between code are all right.
- `Package.swift`: `// swift-tools-version:5.9` is 1 comment line, rloc 25, loc 27: right.

### Other files
- Per-function statistics leave out the bodies of accessors. `NonNegative.swift` (`get { storedValue }`, `set { … }`, `init`): 3 functions, `min_rloc_per_function` 0, mean 0.33. `Rolled.swift` (`mutating get` with two statements, `init`): `min_rloc_per_function` 0. In `EncounterEdgeCases.swift` the getter and setter of the subscript have rloc 0, complexity 0 and 0 parameters, although the getter holds a ternary and the setter an `if`; the subscript parameter `index` is counted nowhere.
- Logic in a property body belongs to no function: `Creature+Description.swift` has complexity 2 (two `??`) and `number_of_functions` 0; `Dice.swift` reports 2 functions, `isCriticalHit` is none; `Creature.swift` 2 functions, `walkingSpeed` is none.
- Nested functions count in `number_of_functions` but are no entry in the per-function statistics (section `nestedFunctions`: 4 functions, one entry with rloc 10 and complexity 5).
- `max_complexity_per_function` is 0 for every file whose functions have no branch (`CreatureService.swift`, `Repository.swift`, `HitPoints.swift`, …), while `complexity` of the same file counts 1 per function.
- Checked and right: `CreatureServiceTests.swift` (6 functions, 5 comment lines, 1 `guard`), `CreatureUtil.swift` (3 comment lines for the block comment, 2 functions, 2 closures), `PersistedCreatures.swift` (4 functions, 1 `guard`), `CreatureEntity.swift` (init with 4 parameters).

## Domain language parser
- Commands, all with `LC_ALL=C.UTF-8`: the README command (exit 0, `Analysis complete: 37 files processed`); `--exclude-tests` (36 files); `--stop-word-level MINIMAL` / `AGGRESSIVE`; `--no-technical-stopwords`; `--ngrams 2`; `--comment-weight 100`; `--string-weight 100`: all exit 0. `--comment-weight 0` and `--string-weight 0` exit 1 with `java.lang.IllegalArgumentException: --comment-weight must be positive, got 0` and a 15-frame stack trace, no output file. Under the POSIX locale the parser processes 36 files and drops `Zentaurenhöhle.swift` silently (`output/domain-posix-locale.cc.json`).
- Output shape: `meta.apiVersion` 2.1; `lenses.domain.nodes` has 37 entries, one per file, each word with `text`, `frequency` and `tfidf`. There is no node for a folder and none for `root`. The README asks for the root node's word list; the figures below are the sum over the 37 file nodes.

### Expected words (sum over all files, weights identifier 3 / comment 2 / string 1)
| word | frequency | word | frequency |
| --- | --- | --- | --- |
| creature | 143 | lair | 25 |
| centaur | 23 | initiative | 22 |
| cellar | 5 | encounter | 18 |
| dungeon | 5 | treasure | 12 |
| armor | 27 | hoard | 11 |
| hit | 44 | stable | 15 |
| points | 39 | dice | 33 |
| speed | 42 | roll | 35 |
| damage | 17 | | |

All 17 appear. Plurals stay separate words: `creatures(47)`, `centaurs(15)`, `cellars(10)`, `speeds(10)`, `rolls(11)`.

Words expected from the new files before the run: from `EncounterResolver.swift` all appear (`encounter`, `resolver`, `attacker`, `defender`, `terrain`, `bonus`, `rounds`, `critical`, `damage`, `roll`, `dice`, `initiative`, `creature`, `armor`, `natural`, `shrugs`, `worst`, `halves`, `cellar`, `dungeon`, `lair`, `hit`, `points`) except `speed`, which I expected from the loop binding `for (speedType, speed) in attacker.speeds`; loop bindings are not extracted. From `EncounterEdgeCases.swift` all appear except `unguarded` (the string of `#warning("the hoard is unguarded")`).

### Keyword and technical-word leakage
- Swift keywords: none leaks. The backtick identifiers `` `default` ``, `` `in` `` and `` `class` `` are dropped as keywords, and so is `class` in the string `"armor class"` and in the comment "armor class of the defender".
- Technical words present at MODERATE: `value(51)`, `type(46)`, `id(43)`, `entity(16)`, `description(15)`, `repository(13)`, `stored(9)`, `wrapped(9)`, `order(9)`, `item(7)`, `facade(6)`, `logger(6)`, `api(6)`, `request(6)`, `key(6)`, `count(5)`, `domain(4)`, `persistence(4)`, `assert(4)`, `dto(3)`, `mapper(3)`, `projected(3)`, `storage(3)`, `memory(3)`, `up(3)`, `random(3)`, `target(3)`. `entity`, `repository`, `facade`, `logger`, `dto` are in `technical-aggressive.txt` only; `mapper` and `wrapped` are in no list.
- Filtered at MODERATE (they come back with `--stop-word-level MINIMAL`): `find(30)`, `save(21)`, `service(15)`, `base(9)`, `builder(5)`, `create(3)`, `exception(3)`, `error(3)`, `index(3)`. `--no-technical-stopwords` adds `name(15)`, `util(6)`, `temporary(6)`, `tests(4)` on top. AGGRESSIVE removes `value`, `type`, `entity`, `repository`, `request`, `facade`, `logger`, `start`, `dto`, `call`, `iterator`, `argument`, `parameter`, `result`, `logging`, `adapter`, `model`, `function`.
- Comment markers: `mark(80)` is the second most frequent word of the project, from the 40 `// MARK: - …` lines of `EncounterEdgeCases.swift`; `todo(2)` and `swiftlint(2)` come from `// TODO:` and `// swiftlint:disable:next`. The section names behind `MARK: -` are split and counted as comment prose (`labelled`, `coalescing`, `shorthand`, …).
- `Package.swift` is analysed as source: `cellars(10)`, `centaurs(10)`, `swift(4)`, `package(3)`, `persistence(3)`, `tools(2)`, `version(2)`, `apple`, `com`, `git`, `github`, `https`, `logging`.

### Identifier splitting
| form | identifier | file | words found |
| --- | --- | --- | --- |
| camelCase | `walkingSpeed` | `Creature.swift`, DTO | `walking`, `speed`: ok |
| snake_case | `walking_speed` | `CreatureServiceTests.swift` | `walking(3)`, `speed(3)`: ok |
| SCREAMING_SNAKE | `MAX_HIT_POINTS` | `HitPoints.swift` | `max(3)`, `hit`, `points`: ok |
| PascalCase | `ArmorClass` | `ArmorClass.swift` | `armor(3)`, `class` dropped as keyword |
| Acronym | `XPValue` | `Centaur.swift` | `xp(6)`, `value(6)`: ok |
| Digit | `d20Roll` | `Dice.swift` | `d20(3)`, `roll`: ok |
| Digit, reversed | `rollD20` | `Dice.swift` | `roll`, `20(3)`: wrong, the `D` is lost and a bare number is a word |
| Kebab in string | `"centaur-stable"` | `CreatureFacade.swift` | `centaur(1)`, `stable(1)`: ok |
| Unicode | `Zentaurenhöhle`, `rüstungsklasse` | `Zentaurenhöhle.swift` | `zentaurenhöhle(3)`, `rüstungsklasse(3)`: ok, not cut |
| Test idiom | `test_should_save_creature_to_the_stable` | test | `creature`, `stable`: ok |

Which declarations are extracted, judged by words that occur nowhere else in `EncounterEdgeCases.swift`:
- Extracted: types, functions, properties, parameters (internal name), `let` / `var`, `if let` and `guard let` bindings, `async let scout`, closure parameters (`reason`), `typealias Herd`, the first case of an enum line.
- Not extracted: the second case in `case lost, stolen` (`lost(3)` is there, `stolen` is not); bindings in switch patterns (`.coins(let amount)`, `case let .chest(contents)`, and still `case let centaur as Centaur` in `InitiativeOrder.swift`); loop variables (`row`, `cell`, `tick`, the tuple `(speedType, speed)`); external argument labels (`init?(single coin: Int)` gives `coin(3)` and no `single`).
- References never count: `Fightable` and `DTO` are used in `EncounterEdgeCases.swift` and absent from its word list.

### Comments and strings
- The planted sentences are counted with weight 2 (`cellar(2)`, `roams(2)` in `Creature.swift`; `counts(2)`, `guards(2)` in `CreatureUtil.swift`) and the planted strings with weight 1 (`dungeon(1)`, `such(4)` = 3 + 1 in `NoSuchCreatureException.swift`). `--comment-weight 100` and `--string-weight 100` confirm the sources: `dungeon` 103 with the comment weight, 302 with the string weight.
- `///`, `/** */`, `/* */`, nested block comments and trailing comments are all read. Commented-out code is read as prose: `// total = total * 2` gives `total(7)` = 3 + 2 x 2 in `EncounterResolver.swift`. The code sample inside the `/** */` comment gives `tired(2)`, `rest(2)`.
- Strings: plain and `"""` strings are read (`map(1)`, `neither(1)`, `nor(1)` from the multi-line string; `ambush(1)`, `parley(1)` from the result-builder body). Not read: the raw string `#"A "quoted" hoard \(untouched) // still text"#` (no `quoted`, no `untouched`; `hoard` stays 3, `still` stays 2) and the `#warning("…")` text (no `unguarded`).
- String interpolation is read as string text: `"\(wounded.current) of \(rested.maximum) hit points"` gives `current(1)`, `maximum(1)`, `wounded(4)` = 3 + 1.

### Test file handling
- Default: `Tests/CellarsAndCentaursTests/CreatureServiceTests.swift` is included. `--exclude-tests`: 36 files; the words that disappear are `unknown(6)`, `assert(4)`, `memory(3)`, `up(3)`, `nobody(1)`.
- Detection is by folder only. Checked with copies outside the project: `Sources/Foo/CreatureServiceTests.swift` and `Sources/Foo/CreatureServiceTest.swift` are still analysed with `--exclude-tests`, `Tests/Bar/Helper.swift` is excluded. `TestFileDetector.TYPE_NAME_SUFFIX_EXTENSIONS` lists `kt`, `kts`, `java`, `cs`, `php`, not `swift`.

### German words
`Zentaurenhöhle.swift` reports `hle(3)`, `label(3)`, `rüstungsklasse(3)`, `zentaurenhöhle(3)`, `dem(2)`, `die(2)`, `geh(2)`, `jeder(2)`, `kreatur(2)`, `liegt(2)`, `ren(2)`, `stungsklasse(2)`, `trefferpunkte(2)`, `und(2)`, `unter(2)`, `verlies(2)`, `zentaurenh(2)`, `der(1)`.

| word | found | note |
| --- | --- | --- |
| zentaurenhöhle | yes, 3 | from the identifier only; the comment occurrence is cut into `zentaurenh` + `hle` |
| verlies | yes, 2 | |
| rüstungsklasse | yes, 3 | from the identifier only; the comment occurrence becomes `stungsklasse` |
| trefferpunkte | yes, 2 | |
| kreatur | yes, 2 | |
| größe | no | cut at `ö` and `ß`, nothing of it survives |
| höhle | no | becomes `hle` |

5 of 7. Identifiers keep their umlauts, comments and strings are split at every non-ASCII letter (`gehören` gives `geh` + `ren`). German stop words leak: `die`, `unter`, `dem`, `und`, `jeder`, `der`; `zu` is absent (cause not verified).

## Changed since 2026-09-06
- No longer true: the domain lens has no folder and no root node any more (then 48 nodes for 34 files, now 37 nodes for 37 files), so "words at the root node" can only be computed by summing files. `apiVersion` is 2.1 instead of 2.0 and each word carries a `tfidf` value.
- No longer true: "dependency parser not run". It runs, exits 0 and writes an empty map with two warnings.
- New on the old files: the unified parser was not part of the earlier report; its findings on `NonNegative.swift`, `Rolled.swift`, `Creature+Description.swift`, `Dice.swift` and `Creature.swift` are listed above.
- Still true, checked again: `rollD20` gives `roll` + `20`; `--comment-weight 0` / `--string-weight 0` fail with a stack trace; test detection works by folder only; `Package.swift` is read as source; `entity`, `repository`, `facade`, `logger`, `dto`, `mapper` leak at MODERATE; `wrapped(9)` and `projected(3)` leak; `case let centaur as Centaur` is not extracted; only declarations count, never references; no stemming; `class` is dropped from comments; interpolation is read as string text; the weights 3 / 2 / 1; all 17 expected words; no Swift keyword leaks.
- Not checked again: that `--verbose` yields identical word lists, and the flat-weight run.

## Verdict

### Unified parser
- Missing:
  - `EncounterEdgeCases.swift`, `var area: Int { … }`, `var worth: Int { switch self … }`, `var steps: Int { … }`; `Creature+Description.swift`, `Dice.swift` `isCriticalHit`, `Creature.swift` `walkingSpeed`: a computed property with an implicit getter is no function, its branches belong to no function.
  - `EncounterEdgeCases.swift` `willSet` / `didSet`, and `get` / `set` of the property and the subscript; `NonNegative.swift`, `Rolled.swift`: accessor bodies have no rloc, no complexity and no parameters in the per-function statistics.
  - `EncounterResolver.swift` `initiativeOf`, `EncounterEdgeCases.swift` `double` / `clamp` / `limit`: nested functions count in `number_of_functions` but have no entry in the per-function statistics, so mean and median are computed over fewer functions than reported. **Decision: accept (derived from Java).**
  - `Zentaurenhöhle.swift`: dropped without a message when the JVM runs under a POSIX locale. **Decision: accept (derived from Java).**
- Wrong:
  - `EncounterEdgeCases.swift` `summon`: `if let creature = try await creatures.find(id) { … }` is counted as a closure instead of an `if`.
  - `EncounterResolver.swift` `safeRoll`, `EncounterEdgeCases.swift` `deferBlock`: `defer { }` adds 1 to complexity like a closure and nothing to logic_complexity, although the mapping lists it as a branch.
  - `EncounterResolver.swift` `resolve`, `EncounterEdgeCases.swift` `switchPatterns`, `fallthroughCase`, `ifSwitchExpressions`, `InitiativeOrder.swift`: `default:` counts as a branch. **Decision: ignore (derived from Java).**
  - `EncounterEdgeCases.swift` `commentMarkersInStrings`: the string `"/* not a comment */"` is a comment line.
  - `EncounterEdgeCases.swift` `TreasureHoard.subscript`: one subscript is 2 functions and 3 complexity; the same subscript with an implicit getter is 0 functions and 1 complexity.
- Bad:
  - Complexity per function leaves out the function itself while file complexity counts it: every branch-free function has complexity 0 (`isEmpty`, `describe`). **Decision: ignore (derived from Java).**
  - `??` (`tryOptional`, `nilCoalescing`, `genericWhere`, `nestedFunctions`, `CreatureMapper.swift`, `Encounter.swift`) and `willSet` / `didSet` count as branches, `?.` does not; the README rule counts none of them.
  - The root `.gitignore` of the repository is not found when a sub-folder is analysed; the parser falls back to its own exclusion list with a warning. **Decision: ignore (derived from Kotlin).**
- Good: loc, rloc and comment_lines (nested comments, `///`, `/** */`, `"""` strings with comment markers, raw strings, trailing and inline comments); parameter counts for labels, `_`, defaults, variadics, `inout`, generics and function-typed parameters; `guard`, `if let`, `if case`, `for … where`, `for case let`, `for await`, `repeat … while`, labelled loops, typed `catch` and `catch … where`, `switch` with tuples, ranges and several patterns, `if` / `switch` expressions, closures with `$0`, operator functions, `init` / `deinit`, actors, result builders, `#if` conditions; message chains through optional chaining and trailing closures; `long_method`, `long_parameter_list`, `excessive_comments`.

### Dependency parser
- Missing: Swift as a whole. 0 of 74 expected file edges (80 with tests), no leaf, no cycle, no upward edge, for every file including `EncounterResolver.swift` and `EncounterEdgeCases.swift`. **Decision: ignore (derived from Objective-C).**
- Wrong: nothing; no edge is reported.
- Bad: exit code 0 and a written map with only the root folder for a project of 37 source files; the warning says "No supported source files found" without naming the language or the supported ones. **Decisions derived from Objective-C: ignore — exit code 0; accept — the warning does not name what was skipped.**
- Good: no crash, the empty result is announced by two warnings.

### Domain language parser
- Missing:
  - `Zentaurenhöhle.swift`: `größe` and `höhle` from the string `"Größe der Höhle"`; no German stop-word list (`die`, `unter`, `dem`, `und`, `jeder`, `der` appear). **Decisions derived from Java: accept — words lost at umlauts; ignore — German stop words.**
  - `EncounterEdgeCases.swift`: the raw string `#"… hoard … still text"#` and the text of `#warning("the hoard is unguarded")` are not read.
  - `EncounterEdgeCases.swift` and `InitiativeOrder.swift`: switch-pattern bindings (`let amount`, `contents`, `centaur`), loop variables (`row`, `cell`, `tick`, `speed` in `EncounterResolver.swift`), the second enum case in `case lost, stolen`, external argument labels (`single`).
  - No folder or root node in the lens; no stemming (`creature` 143 and `creatures` 47 are two words). **Decision: ignore (derived from Java).**
  - Under a POSIX locale `Zentaurenhöhle.swift` is dropped without a message. **Decision: accept (derived from Java).**
- Wrong:
  - `Zentaurenhöhle.swift`: words in comments and strings are cut at umlauts and `ß` (`zentaurenh`, `hle`, `stungsklasse`, `geh`, `ren`), while identifiers keep them. **Decision: accept (derived from Java).**
  - `Dice.swift` `rollD20`: `roll` + `20`, against `d20` + `roll` for `d20Roll`. **Decision: ignore (derived from Java).**
  - `--comment-weight 0` / `--string-weight 0`: exception with stack trace. **Decision: accept (derived from Java).**
  - `CreatureServiceTests.swift`: recognised as a test only through the `Tests/` folder, not through its name.
- Bad:
  - `EncounterEdgeCases.swift`: `mark(80)` from `// MARK:` outranks every domain word except `creature`; `todo`, `swiftlint` leak as well.
  - `entity(16)`, `repository(13)`, `facade(6)`, `logger(6)`, `dto(3)`, `mapper(3)`, `wrapped(9)`, `projected(3)` at the default level. **Decision: ignore (derived from Java).**
  - `Package.swift` adds `swift`, `package`, `tools`, `version`, `github`, `https`, `apple`, `com`, `git`.
  - `EncounterResolver.swift`: commented-out code (`// total = total * 2`) counts as prose; interpolated expressions count as string text; `class` in "armor class" is dropped from comments and strings. **Decisions derived from Java: ignore — commented-out code.** **Decision derived from Kotlin: ignore — `class` dropped from comments and strings.**
- Good: all 17 expected words; no Swift keyword leaks, backtick identifiers included; unicode identifiers stay whole; camelCase, snake_case, SCREAMING_SNAKE, PascalCase, acronym and `d20Roll` split correctly; `///`, `/** */`, nested `/* */`, `"""` strings and result-builder strings are read with weights 3 / 2 / 1; `--exclude-tests`, the three stop-word levels and `--ngrams 2` (`hit points(33)`, `walking speed(12)`, `treasure hoard(6)`) work.
