# Swift

## Project
- Layout: SwiftPM package. `Package.swift`, `Sources/CellarsAndCentaurs/{Domain/Model, Domain/Service, Adapter/Persistence, Application, Application/DTO, Application/Extensions}`, `Tests/CellarsAndCentaursTests/`. 26 `.swift` files (25 sources incl. the manifest, 1 test). Namespacing per layer is done by folders only: one SwiftPM target is one module, so all sources share the module `CellarsAndCentaurs` and the root namespace `de.sots.cellarsandcentaurs` exists only in logger labels.
- Shared model: all declarations from the README table exist: `Creature` (class, `: Fightable`), `Centaur` (`: Creature`), `CreatureId`, `CreatureType` / `SpeedType` (enums), `ArmorClass`, `HitPoints`, `Speed`, `Fightable` (protocol), `NoSuchCreatureException` (struct `: Error`), `Dice.swift` with `Dice`, `DiceRoll` and free function `rollD20`, `Creatures` (protocol), `CreatureService`, `CreatureEntity`, generic `Repository<T>`, `CreatureRepository: Repository<Entity>`, `PersistedCreatures: Creatures`, `CreatureFacade`, `CreatureUtil`, `Application/DTO/Creature.swift` (`DTO.Creature`), `Exports.swift` (barrel), `CreatureMapper` (extra, keeps `PersistedCreatures` small), `NonNegative` (extra property wrapper for the attribute-only construct), `Extensions/Creature+Description.swift` (file name differs from declaration).
- Stress constructs the language has: inheritance, protocol conformance, generic base class, static-member-only use (`CreatureFacade.STANDARD_CREATURE_TYPE`), type-position-only use, instantiation-only use, attribute-only use (`@NonNegative` property wrapper on `HitPoints.current`), module-qualified reference without import (`CellarsAndCentaurs.Speed` in `CreatureFacade`), two `Creature` types (namespaced through the caseless `enum DTO`), multiple declarations per file, extension in a differently named file, stdlib/third-party use (`Foundation.UUID`, `Dictionary`, `Array`, swift-log `Logger`), test target.
- Stress constructs Swift does not have: aliased import of a type (`import X as Y` does not exist; replaced by `typealias Entity = CreatureEntity` in `CreatureRepository.swift` plus a scoped `import struct Foundation.UUID` in `CreatureId.swift`), per-type wildcard import (every `import Foundation` is already a whole-module import), a type re-export inside one module (`Exports.swift` uses `@_exported import Logging` and `public typealias CreatureFacadeAPI = CreatureFacade`, which is the closest idiom), per-type unused import (`import Foundation` in `CreatureUtil.swift` is unused, nothing in it needs Foundation), sub-packages (folders carry no semantics, two identically named top-level types in one module are a compile error, hence `DTO.Creature`).
- Text and identifier plants: all placed verbatim; see the domain section for where each one landed.

## Dependency parser
- Not run: `dependencyparser` does not support Swift (README parser table). To support it the parser would need the `swift` extension registered with a tree-sitter Swift grammar, and a resolver for Swift's module system: no file-level imports inside a module (every top-level declaration of the target is visible in every file, so edges must be resolved purely by name across the whole target), `import Module` / `import struct Module.Type` / `@testable import` / `@_exported import` for cross-target edges, `typealias` as the alias mechanism, extensions in files other than the type's own file (`Creature+Description.swift` must produce edges to `Creature` and `Centaur`, not a new leaf), caseless-enum namespaces (`DTO.Creature`), property wrappers (`@NonNegative`) and result builders as attribute-only references, protocol conformance (`: Fightable`) vs. inheritance (`: Creature`) being syntactically identical (the resolver has to know that `Fightable` is a protocol to emit INTERFACE vs. CLASS), and `Package.swift` as the manifest that defines which folders form a module and a test target.
- Expected file-level edges, written down before any output was inspected (kept for the day the parser gains Swift support):

```
Domain/Model/Creature -> Fightable, CreatureId, CreatureType, ArmorClass, HitPoints, SpeedType, Speed, Application/CreatureFacade (upward)
Domain/Model/Centaur -> Creature, CreatureId, Speed, SpeedType
Domain/Model/ArmorClass -> Application/CreatureUtil (upward)
Domain/Model/HitPoints -> NonNegative (attribute only)
Domain/Model/NoSuchCreatureException -> CreatureId
Domain/Model/Dice -> (none)
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
Cycles: Creature -> CreatureFacade -> CreatureService -> Creature; ArmorClass -> CreatureUtil -> Creature -> ArmorClass
Round 2 (added 2026-09-06, written down before the parser ran):
Sources/CellarsAndCentaursPersistence/CreatureArchive -> Domain/Service/Creatures (cross-target `import CellarsAndCentaurs`, type position)
Sources/CellarsAndCentaursPersistence/ArchiveKey -> Domain/Model/CreatureId (`@_implementationOnly import CellarsAndCentaurs`, init parameter)
Domain/Model/Lair -> Creature (`associatedtype Occupant: Creature` only)
Domain/Model/Encounter -> Fightable (`where T: Fightable` generic constraint only)
Application/CentaurStable -> Centaur (`as? Centaur` cast only), Creature (parameter type)
Domain/Service/InitiativeOrder -> Centaur (`case let centaur as Centaur` only), Creature (parameter type)
Domain/Model/Initiative -> Rolled (`@Rolled(sides: 20)` property wrapper with arguments only)
Domain/Model/Rolled -> Dice (field type `Dice`, projected value type `DiceRoll`, `Dice(sides:)` instantiation)
Package.swift -> (manifest: target CellarsAndCentaursPersistence depends on target CellarsAndCentaurs)
```

- What the language offers natively: a module per SwiftPM target, whole-module visibility without imports, `import` only for other modules. Everything inside the training project (all edges above) has to be resolved by CodeCharta from bare type names, exactly like a C# project with `global using` for every namespace; there is no import line to hang an edge on.

## Domain language parser
- Commands (all from the README, `LANG_DIR=training/swift`, stderr redirected to `output/*.stderr.log`):
  - `domainlanguageparser -nc $LANG_DIR -e "output,FINDINGS.md" -o output/domain.cc.json` : ok, 26 files, 39 nodes.
  - `--exclude-tests` -> `output/domain-exclude-tests.cc.json` : ok, 25 files.
  - `--stop-word-level MINIMAL` / `AGGRESSIVE` -> `output/domain-minimal.cc.json` / `output/domain-aggressive.cc.json` : ok.
  - `--verbose` -> `output/domain-verbose.cc.json` : ok, identical word lists; verbose adds nothing beyond the progress bar and INFO lines.
  - `--comment-weight 0` and `--string-weight 0` (suggested by the README to isolate contexts) **fail**: `java.lang.IllegalArgumentException: --comment-weight must be positive, got 0` (`DomainLanguageParser.validateOptions`, line 141/142), exit code 1, stack trace on stderr, same with `--verbose`. Worked around with `--comment-weight 100` / `--string-weight 100` (`output/domain-comment100.cc.json`, `output/domain-string100.cc.json`) and a flat `--identifier-weight 1 --comment-weight 1 --string-weight 1` run (`output/domain-flat.cc.json`). Either the README should say "set the weight to 1 / 100" or the CLI should accept 0 as "ignore this context".
- Output shape: `meta.apiVersion` 2.0, `lenses.domain.nodes` per file and folder; `lenses.metrics.attributes` and `lenses.dependency.edges` are present but empty, as expected for this parser.

### Expected words at the root node (default run, weights identifier 3 / comment 2 / string 1)
| word | frequency | where it comes from |
| --- | --- | --- |
| creature | 105 | declarations everywhere, `Creature` doc comment, the two strings |
| centaur | 8 | `Centaur` class, `centaur-stable` string, `centaur-1` string in the test, `stableName` extension; plus `centaurs(8)` from the doc comment and `CellarsAndCentaursTests` |
| cellar | 2 | doc comment on `Creature` only; the module name yields `cellars(6)` (no stemming, plural stays separate) |
| dungeon | 3 | line comment in `CreatureFacade.create` (2) + string in `NoSuchCreatureException` (1) |
| armor | 22 | `ArmorClass`, `armorClass...` members, comment, `"Natural Armor"` |
| hit | 35 | `HitPoints`, `hitPoints`, `MAX_HIT_POINTS`, `isCriticalHit`, comments |
| points | 32 | same as hit |
| speed | 30 | `Speed`, `SpeedType`, `walkingSpeed`, DTO fields |
| damage | 12 | `takeDamage`, `Fightable`, `damaged(by:)`, doc comment, log string |
| lair | 2 | doc comment on `HitPoints` |
| initiative | 2 | line comment in `CreatureFacade.create` |
| encounter | 2 | line comment in `CreatureFacade.create` |
| treasure | 5 | `treasureHoard` (3) + block comment (2) |
| hoard | 8 | `treasureHoard`, `let hoard`, block comment |
| stable | 10 | `STABLE_NAME`, `stableName`, `centaur-stable`, `test_should_save_creature_to_the_stable` |
| dice | 9 | `Dice`, `DiceRoll`, `let dice` |
| roll | 12 | `roll()`, `DiceRoll`, `rollD20`, `d20Roll` |

All 17 appear. The `--string-weight 100` run confirms which come from strings (`centaur`, `stable`, `dungeon`, `armor`, `creature`, `damage`, `such`, `natural`), the `--comment-weight 100` run confirms the comment ones (`cellar`, `lair`, `initiative`, `encounter`, `treasure`, `hoard`, `dungeon`, `roams`, `share`, `recover`, `rests`, `drop`, `guards`, `counts`, `assert`).

### Keyword and technical-word leakage
- Swift keywords: none leaked. `class`, `struct`, `enum`, `protocol`, `extension`, `func`, `let`, `var`, `init`, `self`, `super`, `override`, `static`, `guard`, `throws`, `String`, `Int`, `Bool`, `Codable`, `Identifiable`, `CustomStringConvertible`, `Hashable`, `Equatable` are all absent. `class` in the doc comment ("armor class") is also dropped because the keyword filter applies to comment words too; that is a small loss for a domain word that happens to be a keyword.
- Technical words at MODERATE that leak: `entity(16)`, `repository(13)`, `facade(6)`, `logger(6)`, `dto(3)`, `mapper(3)`, `api(6)`, `domain(4)`, `model(1)`, `adapter(1)`, `persistence(1)`, `request(6)`, `item(7)`, `storage(3)`, `stored(6)`, `wrapped(6)` (from `wrappedValue` of the property wrapper), `value(27)`, `type(34)`, `id(39)`, `description(15)`, `assert(4)` (from the `// Assert` and `// Act & Assert` comments in the test), `memory(3)` (`InMemoryCreatures`), `up(3)` (`setUp`, 2 letters passes the length filter), `random(3)`. `entity`, `repository`, `facade` are exactly the words the README names as must-not-appear; at MODERATE they are not in the list (only AGGRESSIVE removes them), so this is the configured behaviour, not a parser bug, but MODERATE is the default and these three add nothing domain-specific.
- Technical words correctly filtered at MODERATE: `util` (`CreatureUtil` counts as `creature` only), `exception` (`NoSuchCreatureException` -> `creature`, `such`), `service`, `save`, `find`, `create`, `base`, `error`, `test`/`tests`, `mock`.
- `--stop-word-level MINIMAL` adds back `find(30)`, `save(21)`, `service(15)`, `base(9)`, `create(3)`, `exception(3)`; `AGGRESSIVE` additionally removes `type(34)`, `value(27)`, `entity(16)`, `repository(13)`, `facade(6)`, `logger(6)`, `request(6)`, `dto(3)`, `adapter`, `model`, `logging` but keeps `api`, `mapper`, `domain`, `item`, `storage`, `id`, `description`.
- Tooling noise: `Package.swift` is analysed as a normal source file and contributes `swift(4)`, `package(3)`, `tools(2)`, `version(2)`, `apple`, `com`, `git`, `github`, `https`, `logging` (URL fragments of the swift-log dependency) and `cellars(6)`/`centaurs(6)` from the target-name strings. The manifest should probably be excluded like a build file. The swift-log label strings (`"de.sots.cellarsandcentaurs.domain.model.Creature"`) add `sots(2)`, `cellarsandcentaurs(2)`, `domain`, `model`, `adapter`, `persistence`.

### Identifier splitting
| form | identifier | file | words found |
| --- | --- | --- | --- |
| camelCase | `walkingSpeed` | `Creature.swift`, DTO, facade | `walking`, `speed` : ok |
| snake_case | `walking_speed` | `CreatureServiceTests.swift` | `walking(3)`, `speed(3)` : ok |
| SCREAMING_SNAKE | `MAX_HIT_POINTS` | `HitPoints.swift` | `max(3)`, `hit`, `points` : ok |
| PascalCase | `ArmorClass` | `ArmorClass.swift` | `armor(3)` (+ `class` removed as keyword) : ok |
| Acronym | `XPValue` | `Centaur.swift` | `xp(6)`, `value(6)` : ok (two declarations, property and init parameter) |
| Digit | `d20Roll` | `Dice.swift` | `d20(3)`, `roll` : ok |
| Digit, reversed | `rollD20` | `Dice.swift` | `roll`, `20(3)` : wrong, the `D` is dropped as a one-letter fragment and a bare number `20` becomes a "word"; `d20Roll` and `rollD20` should split the same way |
| Kebab in string | `"centaur-stable"` | `CreatureFacade.swift` | `centaur(1)`, `stable(1)` : ok |
| camelCase with unit | `feetPerRound` | `Speed.swift` | `feet(6)`, `per(6)`, `round(6)` : ok |
| Lowercase run | `cellarsandcentaurs` (string) | logger labels | not split, single token : expected, nothing to split on |
| Test idiom | `test_should_save_creature_to_the_stable` | test | `creature`, `stable` (`test`, `save` technical, `should`, `the`, `to` English stop words) : ok |

Observation on what is counted: only declarations are extracted as identifiers (type names, function names, properties, parameters, local `let`/`var`). Type references, call sites and enum-case references contribute nothing: `Creature` is used as a type in 12 files but `DTO/Creature.swift` and `CreatureService.swift` show `creature(3)`/`creature(6)` from their own declarations only, and `.walking`, `.monstrosity`, `SpeedType`, `Speed` usages in `CreatureFacade.speeds(of:)` are invisible. So frequencies reflect "how often is this word declared", not "how often does it occur". That is consistent and keeps the count deterministic, but it means a heavily used type name does not outweigh a once-declared one.

### Comments and strings
- `///` doc comment on `Creature`: counted (`cellar(2)`, `roams(2)`, `share(2)`, `beasts(2)`, `dragons(2)`, `centaurs(2)`, `all(2)`). `///` on `HitPoints`: counted (`lair(2)`, `recover(2)`, `rests(2)`, `drop(2)`, `takes(2)`). `//` line comment inside `CreatureFacade.create`: counted (`initiative(2)`, `encounter(2)`, `before(2)`, `every(2)`, `starts(2)`, `rolls(2)`, `dungeon(2)`). `/* */` block comment in `CreatureUtil`: counted (`counts(2)`, `guards(2)`, `treasure`, `hoard`). The `// swift-tools-version:5.9` header of the manifest is also a comment (`swift`, `tools`, `version`).
- Strings: `"No such creature in the dungeon: "` -> `such(1)`, `creature(1)`, `dungeon(1)`; `"centaur-stable"` -> `centaur(1)`, `stable(1)`; `"Natural Armor"` -> `natural(1)`, `armor(1)`; `"centaur-1"` and `"nobody"` in the test -> `centaur(1)`, `nobody(1)`.
- Weights are visible directly in the per-file numbers: identifier 3, comment 2, string 1 (e.g. `NoSuchCreatureException.swift`: `such(4)` = declaration 3 + string 1; `Creature.swift`: `cellar(2)` from the comment only).
- String interpolation: the expression text inside `\( )` is counted as string content, e.g. `"\(type.rawValue) ..."` in `Creature+Description.swift` yields `raw(1)`, `value(1)`, and `"creature \(id.value) takes \(amount) damage"` yields `amount(1)`, `value(1)`. Harmless here, but identifiers inside interpolations are weighted like prose (1) instead of like identifiers (3).

### Test file handling
- Default run includes `Tests/CellarsAndCentaursTests/CreatureServiceTests.swift` (26 files); `--exclude-tests` drops it (25 files). Its contribution at the root: `creature +21`, `creatures +6`, `id +6`, `unknown +6`, `assert +4`, `stable +3`, `walking +3`, `speed +3`, `memory +3`, `stored +3`, `up +3`, `centaur +1`, `nobody +1`.
- Detection works through the directory name only: `Tests` matches the lowercase `tests` entry of `TestFileDetector.TEST_DIRECTORIES`. The file-name convention `*Tests.swift` / `*Test.swift` is **not** recognised for Swift (`swift` is missing from `TYPE_NAME_SUFFIX_EXTENSIONS`, which lists kt, kts, java, cs, php). Verified: a copy of `CreatureServiceTests.swift` placed in a `Sources/` folder is still analysed with `--exclude-tests`. A Swift project with tests next to the sources (`Sources/Foo/FooTests.swift`, common in Xcode projects that do not use SwiftPM) would keep all its tests.

## Round 2: additional dependency forms
- Added 2026-09-06 without touching any round-1 construct: a second SwiftPM target `Sources/CellarsAndCentaursPersistence/` (registered in `Package.swift` as a `.target` and `.library`, depends on `CellarsAndCentaurs`) with two files, plus six new files in the main target. Project is now 34 `.swift` files (33 sources incl. the manifest, 1 test), 48 domain nodes.
- `dependencyparser` still does not support Swift, so "found" records the state for a future parser; the expected edges are also listed in the block above.

| form | file(s) | expected edge | found (yes / no / wrong target) | note |
| --- | --- | --- | --- | --- |
| second target `import`s the main target | `Sources/CellarsAndCentaursPersistence/CreatureArchive.swift` | `CreatureArchive -> Domain/Service/Creatures` (module edge `CellarsAndCentaursPersistence -> CellarsAndCentaurs`) | no parser | the only import line in the whole project that points at internal code; the type still has to be resolved by name inside the imported target. Main-target types are `internal`, so a real build would need `public` on `Creatures`; the training project does not need to compile |
| `@_implementationOnly import` | `Sources/CellarsAndCentaursPersistence/ArchiveKey.swift` | `ArchiveKey -> Domain/Model/CreatureId` | no parser | same edge semantics as a plain import for a dependency graph (the attribute only hides the module from the target's public interface). The compiler rejects mixing a plain and an implementation-only import of one module inside one target ("inconsistently imported as implementation-only"); Swift 6 replaces the attribute with `internal import` (SE-0409). A parser must accept both spellings |
| `protocol` with `associatedtype` | `Domain/Model/Lair.swift` | `Lair -> Creature` (via `associatedtype Occupant: Creature`) | no parser | the constraint is the only reference; `Occupant` itself must not become a leaf or an edge target |
| generic constraint `where T: Fightable` | `Domain/Model/Encounter.swift` | `Encounter -> Fightable` | no parser | `T` appears as a field, parameter and return type; none of those may produce an edge, only the `where` clause does |
| type used only in `as? Centaur` cast | `Application/CentaurStable.swift` | `CentaurStable -> Centaur` (plus `-> Creature` from the parameter type) | no parser | the cast is inside a closure (`compactMap { $0 as? Centaur }`) |
| type used only in `switch case let centaur as Centaur` | `Domain/Service/InitiativeOrder.swift` | `InitiativeOrder -> Centaur` (plus `-> Creature` from the parameter type) | no parser | the bound name `centaur` shadows nothing but is a lowercase copy of the type name |
| property wrapper with arguments and projected value | `Domain/Model/Initiative.swift`, `Domain/Model/Rolled.swift` | `Initiative -> Rolled` (`@Rolled(sides: 20)` only); `Rolled -> Dice` (field `Dice`, projected value `DiceRoll`, `Dice(sides:)`) | no parser | round 1 already has the bare-attribute form (`HitPoints -> NonNegative`); this one adds an argument list and a projected value, so `$roll` on `Initiative` would be typed `DiceRoll` without `Initiative.swift` ever naming `Dice` |
| manifest target dependency | `Package.swift` | `CellarsAndCentaursPersistence -> CellarsAndCentaurs` (target level) | no parser | the manifest is the only place where the module graph is declared; a parser needs it to map `import CellarsAndCentaurs` to `Sources/CellarsAndCentaurs/` |

- Domain parser on the added files (default run, `output/domain.cc.json` overwritten, stderr in `output/domain.stderr.log`): ran without error, 34 files. Root word list went from 116 to 130 words; **no word was lost**, 14 new: `archive(6)`, `occupant(6)`, `archived(3)`, `combatants(3)`, `count(3)`, `key(3)`, `occupants(3)`, `order(3)`, `projected(3)`, `rolled(3)`, `shelter(3)`, `strike(3)`, `target(3)`, `weakest(3)`. Expected words that grew: `creature` 105->111, `centaur` 8->11, `lair` 2->5, `initiative` 2->8, `encounter` 2->5, `stable` 10->13, `dice` 9->12, `roll` 12->15; the other nine are unchanged.
- No new keyword leaked: `associatedtype`, `where`, `mutating`, `switch`, `case`, `default`, `import`, `propertyWrapper`, `Hashable`, `compactMap` are all absent. `@_implementationOnly import` and `import CellarsAndCentaurs` contribute nothing (correct); the new target-name strings in `Package.swift` do (`cellars`/`centaurs` 6->10, `persistence` 1->4), which strengthens the round-1 point that the manifest should be excluded.
- New technical leaks at MODERATE: `projected(3)` and `wrapped` (6->9) come from the property-wrapper protocol requirements `projectedValue`/`wrappedValue`, `key(3)` from `ArchiveKey`, `count(3)` from `archivedCount`, `order(3)` from `InitiativeOrder`, `target(3)` from a parameter name. `archive`/`archived` are persistence vocabulary but arguably domain words for this project.
- The added files confirm the round-1 observation that only declarations count: `Creature` in the associatedtype constraint, `Fightable` in the `where` clause, `Centaur` in the cast and in the switch pattern, `Rolled` in the attribute, `Dice`/`DiceRoll` in `Rolled.swift` and `Creatures`/`CreatureId` in the persistence target all contribute nothing to the file they are used in. New detail: the pattern binding `case let centaur as Centaur` is **not** extracted as an identifier (`InitiativeOrder.swift` has no `centaur`), while a plain local `let hoard` in `CreatureUtil.swift` is; switch-case bindings are skipped. The generic parameter `T` is dropped by the length filter and the literal `20` in `@Rolled(sides: 20)` is not counted, both fine.

## Verdict
- Good: parser ran cleanly on all 26 files (34 after round 2, no word lost, no new keyword leaked from `associatedtype`, `where`, `switch`/`case`, `@_implementationOnly import`, `@propertyWrapper`); all 17 expected domain words reach the root; no Swift keyword leaks; camelCase, snake_case, SCREAMING_SNAKE, PascalCase, acronym (`XPValue`) and `d20Roll` split correctly; `///`, `//` and `/* */` comments and all planted strings are counted with the expected 3/2/1 weights; the `Tests/` target is included by default and excluded with `--exclude-tests`; `util`, `exception`, `service`, `test` are filtered at MODERATE.
- Wrong:
  1. `Dice.swift`, `rollD20`: split into `roll` + `20`, the `D` is lost and a bare number survives as a word, while `d20Roll` gives `d20` + `roll`. Splitting should treat a letter+digit run the same regardless of position (or drop pure digits).
  2. `--comment-weight 0` / `--string-weight 0` are rejected with an exception and a stack trace although the README recommends them for isolating a context; the CLI should either accept 0 or fail with a one-line message and the README should name a working value.
  3. `Tests/CellarsAndCentaursTests/CreatureServiceTests.swift`: recognised as a test only because of the `Tests/` folder; the `*Tests.swift` naming convention is not known to `TestFileDetector` (Swift missing from the type-name-suffix extension set).
  4. `Package.swift` is treated as source and pollutes the root with `swift`, `package`, `tools`, `version`, `github`, `https`, `apple`, `com`, `git`; the manifest should be excluded like other build files.
  5. `entity(16)`, `repository(13)`, `facade(6)`, `logger(6)`, `dto(3)`, `mapper(3)` leak at the default MODERATE level; only AGGRESSIVE removes most of them. For a domain lens these are pure architecture words.
  6. `Domain/Model/Rolled.swift`, `NonNegative.swift`: `wrapped(9)` and `projected(3)` leak from the property-wrapper protocol names `wrappedValue` / `projectedValue`; these are Swift-mandated member names and belong on the technical stop-word list like `value`. Round 2 also adds `key(3)`, `count(3)`, `order(3)`, `target(3)` at MODERATE.
  7. `Domain/Service/InitiativeOrder.swift`: the switch pattern binding `case let centaur as Centaur` is not extracted as an identifier although a plain local `let` is, so `centaur` is missing from that file's word list.
- Missing (parser side): frequencies count declarations only, never type references, call sites or enum cases (`Creature` used in 12 files counts once per declaration), so word frequency does not reflect how central a concept is; no stemming (`cellar` 2 vs `cellars` 6, `centaur` vs `centaurs`, `beast` vs `beasts`, `dragon` vs `dragons` are separate words); `class` from "armor class" in the doc comment is dropped because the keyword filter also applies inside comments; string-interpolation expressions are counted as prose. Missing (language side, not a parser fault): Swift has no aliased/wildcard/per-type imports and no intra-module re-export, so those constructs are approximated with `typealias`, `import struct Foundation.UUID` and `@_exported import`; the dependency parser has no Swift support at all (see above; round 2 adds cross-target `import`, `@_implementationOnly import`, `associatedtype`, `where T:` constraint, `as?` cast, `case let ... as` pattern and a property wrapper with arguments to the list of forms it would have to resolve).
