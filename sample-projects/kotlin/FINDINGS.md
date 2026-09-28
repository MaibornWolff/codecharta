# Kotlin

## Project
- Layout: `build.gradle.kts`, `settings.gradle.kts`, `src/main/kotlin/de/sots/cellarsandcentaurs/{domain/model,domain/service,adapter/persistence,application,application/dto}`, `src/test/kotlin/.../domain/service/CreatureServiceTest.kt`. 22 `.kt` files (21 main + 1 test) plus 2 `.kts` build scripts.
- Stress constructs present: aliased import (`CreatureRepository.kt`: `import ...CreatureEntity as Entity`), wildcard import (`CreatureUtil.kt`: `import ...domain.model.*`), inheritance (`Centaur : Creature`), interface implementation (`Creature : Fightable` with `sealed interface Fightable`, `PersistedCreatures : Creatures`), generic base `Repository<T>` (`CreatureRepository : Repository<Entity>`), type only in type position (`Speed`, `ArmorClass` parameters in `CreatureFacade.create`), type only instantiated (`CreatureId` in `CreatureFacade`), type only through a companion member (`CreatureFacade.STANDARD_CREATURE_TYPE` in `Creature.kt` and `PersistedCreatures.kt`, `CreatureUtil.STANDARD_ARMOR_CLASS_DESCRIPTION` in `ArmorClass.kt`), type only in an annotation (`@Roams` on `Centaur`, `annotation class Roams` in `Roams.kt`), same simple name in two packages (`domain.model.Creature` and `application.dto.Creature`, both used in `CreatureFacade.kt`), fully qualified references without import (`de.sots.cellarsandcentaurs.domain.model.Speed` in `CreatureService.kt`, `de.sots.cellarsandcentaurs.application.dto.Creature` in `CreatureFacade.kt`), unused import (`Fightable` in `CreatureUtil.kt`, next to the wildcard), stdlib and third-party usage (`java.util.UUID`, `kotlin.random.Random`, `Map`, `List`, `org.slf4j`, `io.mockk`, `kotlin.test`), test file `CreatureServiceTest.kt`, two classes plus a top-level function and a top-level constant in one file (`Dice.kt`: `Dice`, `DiceRoll`, `rollD20()`, `DEFAULT_DIE_SIDES`), file name differing from the declaration (`Ports.kt` holds `interface Creatures`).
- Kotlin-only additions: `data class`, `@JvmInline value class` (`CreatureId`, `Speed`), `object CreatureUtil`, `sealed interface`, a top-level function called from `Creature.attack` and a top-level constant used in `CreatureUtil`.
- Not available in Kotlin: a barrel / re-export module (no `export ... from`; a `typealias` would be the closest thing but is not a re-export). The upward dependencies are therefore direct imports: `Creature.kt -> CreatureFacade.kt`, `ArmorClass.kt -> CreatureUtil.kt`, `PersistedCreatures.kt -> CreatureFacade.kt`. Kotlin has no `static`; the "static member" cases use `companion object` / `object`.

## Dependency parser

Commands (all exited 0, no crash, `--verbose` adds nothing beyond timings):

```
ccsh dependencyparser -nc $LANG_DIR -e "output,FINDINGS.md" -o output/dependency.cc.json
ccsh dependencyparser -nc $LANG_DIR -e "output,FINDINGS.md" --include-tests -o output/dependency-with-tests.cc.json
ccsh dependencyparser -nc $LANG_DIR -e "output,FINDINGS.md" --verbose -o output/dependency-verbose.cc.json
```

Default run: 23 files scanned (21 `.kt` + 2 `.kts`, test excluded), 21 file leaves, 22 declaration leaves, 39 file edges, 40 leaf edges, 5 cycles. The `.kts` scripts are parsed as Kotlin and yield no declarations and no edges (fine).

### Expected edges (written before the run)

Paths relative to `src/main/kotlin/de/sots/cellarsandcentaurs/`, `M` = `domain/model`, `S` = `domain/service`,
`P` = `adapter/persistence`, `A` = `application`.

| from | to | why |
| --- | --- | --- |
| M/Creature.kt | A/CreatureFacade.kt | companion member `STANDARD_CREATURE_TYPE` as default argument (upward, cycle) |
| M/Creature.kt | M/CreatureId.kt, M/CreatureType.kt, M/ArmorClass.kt, M/SpeedType.kt, M/Speed.kt, M/HitPoints.kt | same-package types in type position |
| M/Creature.kt | M/Fightable.kt | `: Fightable` implementation |
| M/Creature.kt | M/Dice.kt | call of top-level function `rollD20()` |
| M/Centaur.kt | M/Creature.kt | `: Creature(...)` inheritance |
| M/Centaur.kt | M/CreatureId.kt, M/CreatureType.kt, M/Speed.kt, M/SpeedType.kt | same-package types |
| M/Centaur.kt | M/Roams.kt | `@Roams` annotation only |
| M/ArmorClass.kt | A/CreatureUtil.kt | `CreatureUtil.STANDARD_ARMOR_CLASS_DESCRIPTION` (upward, cycle via Creature) |
| M/NoSuchCreatureException.kt | M/CreatureId.kt | constructor parameter type |
| S/Ports.kt | M/Creature.kt, M/CreatureId.kt | imports, type positions |
| S/CreatureService.kt | S/Ports.kt | `Creatures` field type (same package, no import) |
| S/CreatureService.kt | M/Creature.kt, M/CreatureId.kt | imports |
| S/CreatureService.kt | M/Speed.kt | fully qualified reference without import |
| P/CreatureRepository.kt | P/CreatureEntity.kt | aliased import `as Entity` |
| P/CreatureRepository.kt | P/Repository.kt | generic base `Repository<Entity>` (same package) |
| P/PersistedCreatures.kt | A/CreatureFacade.kt | companion member (upward) |
| P/PersistedCreatures.kt | M/Creature.kt, M/CreatureId.kt, M/NoSuchCreatureException.kt, S/Ports.kt | imports |
| P/PersistedCreatures.kt | P/CreatureRepository.kt, P/CreatureEntity.kt | same-package: field type and `new` |
| A/CreatureFacade.kt | M/ArmorClass.kt, M/Creature.kt, M/CreatureId.kt, M/CreatureType.kt, M/HitPoints.kt, M/Speed.kt, M/SpeedType.kt, S/CreatureService.kt | imports |
| A/CreatureFacade.kt | A/dto/Creature.kt | fully qualified reference to the DTO with the same simple name |
| A/CreatureUtil.kt | M/Creature.kt, M/HitPoints.kt | via wildcard import `domain.model.*` |
| A/CreatureUtil.kt | M/Dice.kt | top-level property `DEFAULT_DIE_SIDES` via wildcard import |
| A/CreatureUtil.kt | (none) M/Fightable.kt | unused explicit import: must NOT produce an edge |
| test S/CreatureServiceTest.kt | S/CreatureService.kt, S/Ports.kt, M/Creature.kt, M/CreatureId.kt, M/Speed.kt, M/SpeedType.kt | only with `--include-tests` |

No edges expected from: M/HitPoints.kt, M/Speed.kt, M/SpeedType.kt, M/CreatureType.kt, M/CreatureId.kt,
M/Fightable.kt, M/Roams.kt, M/Dice.kt, P/CreatureEntity.kt (only `java.util.UUID`), P/Repository.kt, A/dto/Creature.kt.

Expected cycles: `Creature -> CreatureFacade -> CreatureService -> Creature`, `Creature <-> CreatureFacade`,
`ArmorClass -> CreatureUtil -> Creature -> ArmorClass`. Expected upward edges: `Creature -> CreatureFacade`,
`ArmorClass -> CreatureUtil`, `PersistedCreatures -> CreatureFacade` (depending on how levels come out).

#### Round 2 additions (written before the run)

`W` = `adapter/web`, `PA` = `adapter/persistence/archive`. Each row is the only way the `from` file refers to the `to` file.

| from | to | form |
| --- | --- | --- |
| PA/Entity.kt | P/CreatureEntity.kt | `typealias Entity = CreatureEntity` (import + alias declaration) |
| PA/CreatureArchive.kt | PA/Entity.kt | the alias `Entity` used as field and parameter type instead of the class (same package, no import); a resolver that follows the alias could also report `-> P/CreatureEntity.kt` |
| S/CentaurDetector.kt | M/Centaur.kt | `candidate is Centaur` as the only usage (import present) |
| P/AuditedCreatures.kt | S/Ports.kt | interface delegation `: Creatures by PersistedCreatures(CreatureRepository())` |
| P/AuditedCreatures.kt | P/PersistedCreatures.kt, P/CreatureRepository.kt | instantiation of the delegate (same package) - ordinary `new` case, expected to work |
| A/CreatureDtoMapper.kt | M/Creature.kt | receiver type of the extension `fun Creature.toDto()` (import) |
| A/CreatureDtoMapper.kt | A/dto/Creature.kt | fully qualified return type (known round-1 miss, #8) |
| A/CreatureDtoMapper.kt | A/CreatureFacade.kt | companion member `CreatureFacade.STABLE_NAME` (same package) - ordinary case |
| W/CreaturePresenter.kt | A/CreatureDtoMapper.kt | `import ...application.toDto` + call `creature.toDto()` (extension function import) |
| W/CreaturePresenter.kt | M/Creature.kt | ordinary import, parameter type |
| S/Initiative.kt | M/Dice.kt | `import ...domain.model.rollD20` + call `rollD20()` (top-level function import) |
| S/DiceInspector.kt | M/Dice.kt | `Dice::class` as the only usage (import present) |
| W/CreatureController.kt | A/CreatureFacade.kt | `import ...CreatureFacade.Builder` + `Builder()` (nested class import; `CreatureFacade` itself never named) |
| W/CreatureController.kt | S/CreatureService.kt, M/Creature.kt | ordinary imports, parameter types |
| S/SpeedVisitor.kt | M/Speed.kt | constructor parameter of function type `(Speed) -> Unit` as the only usage (import present) |
| S/SpeedVisitor.kt | M/Creature.kt | ordinary import, parameter type |

No edges expected from PA/Entity.kt other than the one above, none from any round-1 file to a round-2 file except
`A/CreatureFacade.kt` (unchanged targets: the nested `Builder` only names `CreatureService` and `CreatureFacade`, both already
referenced). Round-1 edges must stay as they are.


### Construct table

| # | construct | expected edge(s) | found | verdict |
| --- | --- | --- | --- | --- |
| 1 | aliased import `import ...CreatureEntity as Entity` (`CreatureRepository.kt`) | `CreatureRepository.kt -> CreatureEntity.kt` | not found; only `-> Repository.kt` | **missing** |
| 2 | wildcard import `domain.model.*` (`CreatureUtil.kt`) | `-> Creature.kt`, `-> HitPoints.kt` | both found | ok |
| 2b | top-level constant `DEFAULT_DIE_SIDES` via wildcard (`CreatureUtil.kt`) | `-> Dice.kt` | not found | missing (non-type symbol) |
| 3 | barrel / re-export | n/a | n/a | language has no such construct |
| 3b | upward edges + cycle `Creature -> CreatureFacade -> CreatureService -> Creature` | 3 edges, cyclic | all found, `isCyclic` on all three, `isPointingUpwards` on `Creature -> CreatureFacade` | ok |
| 4 | inheritance `Centaur : Creature` | `Centaur.kt -> Creature.kt` | found | ok |
| 4b | implementation `Creature : Fightable`, `PersistedCreatures : Creatures` | `Creature.kt -> Fightable.kt`, `PersistedCreatures.kt -> Ports.kt` | both found | ok |
| 5 | generic base `Repository<Entity>` | `CreatureRepository.kt -> Repository.kt` | found (the generic argument `Entity` is the alias, see #1) | ok |
| 6a | type only in type position (`Speed`, `ArmorClass` in `CreatureFacade.create`) | `CreatureFacade.kt -> Speed.kt`, `-> ArmorClass.kt` | found | ok |
| 6b | type only instantiated (`CreatureId(...)` in `CreatureFacade`, `CreatureEntity(...)` in `PersistedCreatures`) | `-> CreatureId.kt`, `-> CreatureEntity.kt` | found | ok |
| 6c | type only through companion member (`CreatureFacade.STANDARD_CREATURE_TYPE`, `CreatureUtil.STANDARD_ARMOR_CLASS_DESCRIPTION`) | `Creature.kt -> CreatureFacade.kt`, `PersistedCreatures.kt -> CreatureFacade.kt`, `ArmorClass.kt -> CreatureUtil.kt` | all found | ok |
| 6d | type only in annotation (`@Roams` on `Centaur`) | `Centaur.kt -> Roams.kt` | found, leaf kind ANNOTATION | ok |
| 7 | same simple name: `domain.model.Creature` (import) and `application.dto.Creature` (fully qualified) in `CreatureFacade.kt` | `-> domain/model/Creature.kt` and `-> application/dto/Creature.kt` | only `-> domain/model/Creature.kt`; the DTO has 0 incoming edges | **missing** (dto edge), no wrong target |
| 8 | fully qualified reference without import (`de.sots.cellarsandcentaurs.domain.model.Speed` in `CreatureService.kt`) | `CreatureService.kt -> Speed.kt` | not found | **missing** |
| 9 | unused import `Fightable` in `CreatureUtil.kt` | no edge | no edge | ok (usage-based, not import-based) |
| 10 | `java.util.UUID`, `kotlin.random.Random`, `org.slf4j.Logger/LoggerFactory`, `Map`, `List`, `io.mockk`, `kotlin.test` | no internal edges | none reported, no dangling leaves | ok |
| 11 | test file `CreatureServiceTest.kt` | skipped by default, 5 edges with `--include-tests` | default: absent from the tree; `--include-tests`: `-> CreatureService.kt, Creature.kt, CreatureId.kt, Speed.kt, SpeedType.kt` | ok |
| 11b | `mockk<Creatures>(relaxed = true)` in the test (same package, generic argument of a call) | `CreatureServiceTest.kt -> Ports.kt` | not found | missing (type argument of a call expression is not a used type) |
| 12 | two declarations in `Dice.kt` | leaves `Dice`, `DiceRoll` | both present, leaf edge `Dice -> DiceRoll` | ok |
| 12b | top-level function `rollD20()` called from `Creature.attack` | `Creature.kt -> Dice.kt`, leaf for `rollD20` | no edge, no leaf (top-level functions / properties are not declarations) | missing (non-type symbol) |
| 12c | `Ports.kt` holding `interface Creatures` | edges resolve to `Ports.kt` | `CreatureService.kt -> Ports.kt`, `PersistedCreatures.kt -> Ports.kt` | ok |
| 13 | `value class`, `data class`, `object`, `sealed interface` | leaves | all present; `object CreatureUtil` is kind CLASS | ok |

Confirmed with a minimal scratch project (two packages `a`/`b`): a plain `import a.Target` produces the edge, while `import a.Target as Alias` (alias used both as a type and as a constructor call), `a.Target()` fully qualified without import, `build<Target>()` with an imported `Target` used only as a call type argument, and `import a.freeFunction` / `import a.FREE_CONSTANT` all produce no edge at all. So the alias and the fully qualified miss are parser behaviour, not an artefact of this project's same-package layout.

### False positives, cycles, upward edges
- False positives: none. Every reported file edge is in the expected list; the unused import did not produce one.
- Cycles: 5 reported, 1 strongly connected component `{Creature, CreatureFacade, CreatureService, Creatures(Ports), ArmorClass, CreatureUtil}`. `isCyclic` is set on exactly the 10 edges inside that component (`Creature <-> CreatureFacade`, `Creature -> ArmorClass -> CreatureUtil -> Creature`, `CreatureFacade -> CreatureService -> Ports -> Creature`, `CreatureFacade -> ArmorClass`, `CreatureService -> Creature`). Matches the expectation.
- Upward edges: `Creature.kt -> CreatureFacade.kt` and `ArmorClass.kt -> CreatureUtil.kt` are flagged `isPointingUpwards`, as expected. `PersistedCreatures.kt -> CreatureFacade.kt` is not flagged: the folder levelling put `adapter` on level 2 and `application` on level 1, so adapter -> application is downward by the parser's own level model. Defensible (an adapter calling the application layer is not a layering violation in a hexagonal layout), but note that the `PersistedCreatures` package is above `application` only because of that single edge.
- Levels: `domain` 0, `application` 1, `adapter` 2; inside `domain/model`, `Creature.kt` 1, `Centaur.kt` 2, `NoSuchCreatureException.kt` 1, everything else 0. Plausible.
- Metrics: `incoming_dependencies` / `outgoing_dependencies` per file are consistent with the edge list (e.g. `Creature.kt` 8 out / 6 in, `CreatureId.kt` 0 out / 7 in, `dto/Creature.kt` 0 / 0 because of #7, `Dice.kt` 0 / 0 because of #2b and #12b).

### Leaf kinds
`CreatureType`, `SpeedType` ENUM; `Fightable`, `Creatures` INTERFACE; `Roams` ANNOTATION; everything else CLASS (data classes, value classes and `object CreatureUtil` all CLASS). Right, apart from the granularity loss that `object` and `value class` are not distinguishable. Top-level functions and properties (`rollD20`, `DEFAULT_DIE_SIDES`) get no leaf.

### What Kotlin offers vs. what CodeCharta resolves
Kotlin has packages and explicit imports (single, wildcard, aliased) and allows fully qualified names without an import; the package need not match the directory. The parser resolves by matching used simple type names against the imported paths plus a wildcard on the own package (`BaseLanguageAnalyzer.analyze`), which handles same-package references without import correctly (`CreatureService -> Ports`, `PersistedCreatures -> CreatureRepository`). It has no alias table (the used type `Entity` is never mapped back to `CreatureEntity`), does not treat a dotted qualified type as a path, and only knows declarations of kind class / interface / enum / annotation, so free functions and constants are invisible.

## Domain language parser

Commands (default, MINIMAL, AGGRESSIVE and `--exclude-tests` exited 0):

```
ccsh domainlanguageparser -nc $LANG_DIR -e "output,FINDINGS.md" -o output/domain.cc.json
ccsh domainlanguageparser ... --stop-word-level MINIMAL   -o output/domain-minimal.cc.json
ccsh domainlanguageparser ... --stop-word-level AGGRESSIVE -o output/domain-aggressive.cc.json
ccsh domainlanguageparser ... --exclude-tests              -o output/domain-notests.cc.json
ccsh domainlanguageparser ... --comment-weight 0           -> exit 1: "IllegalArgumentException: --comment-weight must be positive, got 0"
ccsh domainlanguageparser ... --string-weight 0            -> exit 1: "IllegalArgumentException: --string-weight must be positive, got 0"
```

24 files processed (22 `.kt` + 2 `.kts`), 45 nodes in the domain lens, 95 distinct words at the root. The `.kts` files are analysed too and contribute `mockk`, `api`, `jvm`, `org`, `sots`, `cellars`, `centaurs` (from `"cellars-and-centaurs"`), which is noise at the root but small.

### Expected words at the root
All 17 present: creature(79), speed(39), hit(22), points(22), armor(15), roll(12), stable(10), damage(8), hoard(6), dice(6), centaur(5), treasure(5), cellar(3), dungeon(3), lair(2), initiative(2), encounter(2). The three words that only occur in comments (`lair`, `initiative`, `encounter`) sit at the bottom of the list at frequency 2.

### Keyword and technical-word leakage
- Kotlin keywords: none leak. `class`, `val`, `var`, `fun`, `data`, `object`, `override`, `companion`, `const`, `open`, `sealed`, `annotation`, `value`, `it`, `get`, `set` are all absent. Correct. Side effect: `value` is removed from `XPValue` (the soft keyword list swallows a legitimate English word).
- Type names `String`, `Int`, `Boolean`, `Map`, `List`, `RuntimeException`, `UUID`, `Random` do not appear (they are usages, not declarations, and apparently filtered as technical). Correct.
- Technical words filtered at MODERATE: `util` (CreatureUtil), `exception` (NoSuchCreatureException), `service` (CreatureService), `test` (CreatureServiceTest), `save`/`find`/`create`/`default`/`base`. Correct for this project.
- Leaking at MODERATE: `repository`(9), `entity`(6), `logger`(6), `standard`(6), `facade`(3), `dto`(3), `type`(24), `id`(33), `key`(9), `item`(9), `store`(3), `mockk`(2), `assert`(2). `repository`, `entity`, `dto`, `logger`, `facade` are architectural / library vocabulary and arguably wrong at MODERATE (AGGRESSIVE removes `repository`, `entity`, `logger`, `dto`, `facade` and `type`). `id`, `key`, `item`, `store`, `type` are generic but harmless.
- English function words leaking: `all`(5), `such`(4), `one`(3), `other`(3), `per`(3), `before`(2), `every`(2), `plus`(3). These are stop-word candidates; `such` and `per` come straight from the planted sentence / `feetPerRound`.
- Numbers: `20`(3) appears as a word (see splitting).
- Stop-word levels in one line: MINIMAL adds back `find`(15), `save`(15), `service`(12), `default`(6), `base`(3), `create`(3), `exception`(3); AGGRESSIVE additionally removes `type`, `repository`, `entity`, `logger`, `dto`, `facade` (95 -> 102 -> 89 root words).

### Identifier splitting

| form | identifier | words found | verdict |
| --- | --- | --- | --- |
| camelCase | `walkingSpeed` | walking, speed | ok |
| snake_case | `walking_speed` (test) | walking, speed | ok |
| SCREAMING_SNAKE | `MAX_HIT_POINTS` | max, hit, points | ok |
| PascalCase | `ArmorClass` | armor (`class` dropped as keyword) | ok, keyword removal intended |
| Acronym | `XPValue` | xp (`value` dropped as Kotlin soft keyword) | acronym split ok, `value` lost |
| Acronym (probe) | `HTTPServer` | http, server | ok |
| Digit | `d20Roll` | d20, roll | ok |
| Digit | `rollD20` | roll, 20 (probe: `d` dropped as a single letter, `20` kept) | **wrong**: same token splits differently depending on position |
| Kebab in string | `"centaur-stable"` | centaur(1), stable(+1) | ok |
| Test idiom | `should_save_creature_to_the_stable` | creature, stable (`should`, `save`, `to`, `the` removed) | ok |

### Comments and strings
Weights are visible in the counts: a declaration identifier counts 3, an identifier usage 1, a comment word 2, a string word 1.
- Doc comment on `Creature` -> `Creature.kt`: cellar(2), centaurs(2), beasts(2), dragons(2), share(2), all(2), roams(2). Counted.
- Doc comment on `HitPoints` -> `HitPoints.kt`: damage(8 = 3+3+2), drop(2), lair(2), recover(2), rests(2), takes(2). Counted.
- Line comment in `CreatureFacade.create` -> rolls(2), initiative(2), dungeon(2), encounter(2), before(2), every(2), starts(2). Counted.
- Block comment in `CreatureUtil` -> counts(2), guards(2), treasure(5 = 3+2), hoard(6 = 3+2+1). Counted.
- String `"No such creature in the dungeon: "` -> `NoSuchCreatureException.kt`: dungeon(1), such(4 = 3+1), creature(4 = 3+1). Counted at weight 1.
- String `"centaur-stable"` -> `CreatureFacade.kt`: centaur(1), stable(4 = 3+1). Counted, hyphen split.
- `--comment-weight 0` and `--string-weight 0` are rejected ("must be positive"), so comments and strings cannot be switched off; a weight of 1 is the minimum.
- Plural forms stay separate (`centaur`/`centaurs`, `beast`/`beasts`, `dragon`/`dragons`, `rest`/`rests`, `take`/`takes`, `creature`/`creatures`): no stemming.

### Test file handling
`CreatureServiceTest.kt` is included by default (contributes creature(12), creatures(3), speed(3), stable(3), walking(3), xp(3), assert(2), centaur(1)); `test` and `service` are filtered out of the class name. `--exclude-tests` removes it (root loses `xp` and `assert`, 95 -> 93 words), recognised through the `src/test` directory and the `Test` suffix.

## Round 2: additional dependency forms

Ten new `.kt` files and one nested class (`CreatureFacade.Builder`) were added, no round-1 construct was touched.
31 main `.kt` files + 1 test + 2 `.kts`. The three README commands were rerun on 2026-09-06, all exited 0.
Default run: 33 files scanned, **29 file leaves** (2 of the 31 main files are dropped, see below), 31 declaration leaves,
46 file edges (+7), 50 leaf edges (+10), 8 cycles reported in the log (was 5), still 1 strongly connected component.

| form | file(s) | expected edge | found | note |
| --- | --- | --- | --- | --- |
| `typealias Entity = CreatureEntity` | `PA/Entity.kt` | `Entity.kt -> P/CreatureEntity.kt` | **no** | `Entity.kt` has no file node at all: a file whose only declaration is a typealias is dropped from the dependency tree (no leaf, no metrics), exactly like the `.kts` scripts |
| typealias used instead of the class | `PA/CreatureArchive.kt` | `CreatureArchive.kt -> PA/Entity.kt` (or `-> P/CreatureEntity.kt`) | **no** | `CreatureArchive.kt` gets a leaf but 0 outgoing edges; the used type `Entity` matches no declaration because the alias is not a declaration |
| `is Centaur` as the only usage | `S/CentaurDetector.kt` | `CentaurDetector.kt -> M/Centaur.kt` | **no** | import present, 0 outgoing edges: the type in an `is` check is not collected as a used type |
| interface delegation `: Creatures by PersistedCreatures(CreatureRepository())` | `P/AuditedCreatures.kt` | `AuditedCreatures.kt -> S/Ports.kt` | **no** | the two instantiations in the delegate expression are found (`-> PersistedCreatures.kt`, `-> CreatureRepository.kt`), the delegated supertype `Creatures` is not; a plain `: Creatures` (round 1, `PersistedCreatures`) works, so the `by` form breaks supertype extraction |
| extension function `fun Creature.toDto()` declared in another package | `A/CreatureDtoMapper.kt` | `CreatureDtoMapper.kt -> M/Creature.kt`, `-> A/CreatureFacade.kt`, `-> A/dto/Creature.kt` | **no** (all three) | `CreatureDtoMapper.kt` has no file node: a file holding only a top-level function is dropped, so its own dependencies vanish too (the receiver type, the companion member and the fully qualified DTO) |
| `import ...application.toDto` + call | `W/CreaturePresenter.kt` | `CreaturePresenter.kt -> A/CreatureDtoMapper.kt` | **no** | only `-> M/Creature.kt` (ordinary import); a function import has no declaration to resolve to, and it was not mis-resolved to `CreatureFacade.toDto` either |
| `import ...domain.model.rollD20` + call | `S/Initiative.kt` | `Initiative.kt -> M/Dice.kt` | **no** | 0 outgoing edges; same cause as round-1 #12b, now confirmed for the cross-package import form |
| `Dice::class` as the only usage | `S/DiceInspector.kt` | `DiceInspector.kt -> M/Dice.kt` | **no** | import present, 0 outgoing edges: a class literal is not a used type |
| nested class import `import ...CreatureFacade.Builder` + `Builder()` | `W/CreatureController.kt`, `A/CreatureFacade.kt` | `CreatureController.kt -> A/CreatureFacade.kt` | **yes** | leaf `application.CreatureFacade.Builder` (kind CLASS, parent path kept), leaf edge `CreatureController -> CreatureFacade.Builder`, file edge correct; `CreatureFacade` itself is never named in the controller |
| lambda parameter typed with a domain type `(Speed) -> Unit` | `S/SpeedVisitor.kt` | `SpeedVisitor.kt -> M/Speed.kt` | **no** | only `-> M/Creature.kt` (ordinary parameter); a type inside a function type is not collected |

Ordinary edges from the new files that were expected and found: `AuditedCreatures.kt -> PersistedCreatures.kt, CreatureRepository.kt`
(instantiation), `CreatureController.kt -> Creature.kt, CreatureService.kt`, `CreaturePresenter.kt -> Creature.kt`, `SpeedVisitor.kt -> Creature.kt`.

Score: 1 of 8 forms found. Six of the seven misses are files that now show `outgoing_dependencies: 0` although they import and
use exactly one project type (`CentaurDetector`, `DiceInspector`, `Initiative`, `CreatureArchive`) or miss their one interesting
edge (`AuditedCreatures`, `SpeedVisitor`, `CreaturePresenter`). Root cause, from `BaseLanguageAnalyzer.analyze`: a file
contributes nodes only for the declarations the excavationsite library returns (class / interface / enum / annotation / object),
and edges only for `declaration.usedTypes`, which in Kotlin are collected from supertype lists, parameter / property / return
types, constructor calls and annotations. `is`, `::class`, function types, delegated supertypes, typealiases, top-level functions
and function imports are outside that set. The parser then matches used simple names against the imports plus a wildcard on the
own package, so an import alone (`Centaur`, `Dice`, `Speed`, `rollD20`, `toDto`) never becomes an edge.

### Round-1 edges: changed?
- All 39 round-1 file edges are present with the same targets and the same `isCyclic` / `isPointingUpwards` flags; the diff of the
  file-edge list against the round-1 dump shows only additions plus one weight change: `CreatureFacade.kt -> CreatureService.kt`
  went from `x1` to `x2`, because the new nested `Builder` names `CreatureService` a second time (leaf edge
  `CreatureFacade.Builder -> CreatureService`). Expected, not a regression.
- The nested class also produced the leaf edges `CreatureFacade <-> CreatureFacade.Builder` inside one file; the log's cycle
  count rose from 5 to 8 while the file-level cyclic edges are unchanged, so the counter works on the declaration graph and now
  counts the `Builder` loops. Cosmetic.
- Levels: `AuditedCreatures.kt` gets level 3 (above `PersistedCreatures` 2); the new folders `adapter/persistence/archive` and
  `adapter/web` are level 0 because their files have no resolved edges into `adapter` (the found edges go to `application` /
  `domain`). `--include-tests` shows the identical delta (44 -> 51 file edges, test edges unchanged).
- The domain parser still processes all 34 files, including `Entity.kt` (`entity(3)`) and `CreatureDtoMapper.kt` (`dto(3)`, the
  file name is not counted and `Creature` as receiver / FQN is not counted as usage). Root words 95 -> 111; all 17 expected words are
  still present (`creature` 79 -> 107, `centaur` 5 -> 11, `dice` 6 -> 12, `initiative` 2 -> 5, `stable` 10 -> 11, the rest
  unchanged); the 16 new root words are all from the new identifiers (`archive`, `archived`, `audit`, `audited`, `auditing`,
  `build`, `candidate`, `detector`, `ids`, `inspector`, `kind`, `present`, `presenter`, `visit`, `visitor`, `missing`);
  `controller` and `mapper` are filtered as technical words while `presenter`, `detector`, `inspector`, `visitor` are not
  (same inconsistency as `util` vs `repository` in round 1). No word disappeared, no keyword (`typealias`, `by`, `is`, `apply`) leaks.

### New false positives
None. Every one of the 7 new file edges is in the round-2 expected list, and no edge was mis-resolved (the `toDto` import was not
attached to `CreatureFacade`, the typealias `Entity` was not attached to the import alias `Entity` of `CreatureRepository.kt`).

## Verdict
- Good: all imports, same-package references, inheritance, interface implementation, generic base class, annotation-only usage, companion-member-only usage and instantiation-only usage resolve; no false positives; the unused import produces no edge; cycles and both real upward edges are flagged correctly; stdlib / slf4j / mockk never appear; the test file is skipped by default and found with `--include-tests`; `Dice.kt` yields both leaves; all 17 domain words are at the root, no keyword leaks, comments and strings are counted with visible weights, camel / snake / screaming / acronym / kebab splitting works.
- Wrong: `rollD20` splits into `roll` + `20` while `d20Roll` splits into `d20` + `roll` (`Dice.kt`, domain parser): the digit-suffixed token is handled position-dependently and produces a bare number word. `XPValue` loses `value` to the Kotlin soft-keyword list (`CreatureServiceTest.kt`). `repository`, `entity`, `dto`, `logger`, `facade` pass the MODERATE technical filter although `util`, `service`, `exception` do not (inconsistent for one architecture vocabulary).
- Missing (dependency parser, round 2): seven of the eight added forms give no edge. Two files disappear from the dependency lens completely because they hold no class-like declaration (`adapter/persistence/archive/Entity.kt` with `typealias Entity = CreatureEntity`, `application/CreatureDtoMapper.kt` with `fun Creature.toDto()`), which also hides the dependencies those files have themselves. The other misses are usages that are not collected as used types: `candidate is Centaur` (`CentaurDetector.kt`), `Dice::class` (`DiceInspector.kt`), the function type `(Speed) -> Unit` (`SpeedVisitor.kt`), the delegated supertype `: Creatures by ...` (`AuditedCreatures.kt`, while the delegate's constructor calls are found), the alias used as a type (`CreatureArchive.kt`), and the function imports `import ...domain.model.rollD20` (`Initiative.kt`) / `import ...application.toDto` (`CreaturePresenter.kt`). Only the nested class import `import ...CreatureFacade.Builder` (`CreatureController.kt`) resolves, with a correct `CreatureFacade.Builder` leaf. No new false positives, no round-1 edge changed apart from the expected weight `x1 -> x2` on `CreatureFacade.kt -> CreatureService.kt`.
- Missing (dependency parser): the aliased import `import ...CreatureEntity as Entity` in `CreatureRepository.kt` gives no edge to `CreatureEntity.kt` (alias never mapped back); the fully qualified references without import (`de.sots.cellarsandcentaurs.domain.model.Speed` in `CreatureService.kt`, `de.sots.cellarsandcentaurs.application.dto.Creature` in `CreatureFacade.kt`) give no edge, so the DTO with the clashing simple name ends with zero incoming edges; the type argument of a call (`mockk<Creatures>()` in `CreatureServiceTest.kt`) gives no edge to `Ports.kt`; top-level functions and properties (`rollD20()` used in `Creature.kt`, `DEFAULT_DIE_SIDES` used in `CreatureUtil.kt`) are neither leaves nor edge targets, so `Dice.kt` shows 0 incoming dependencies. Missing (domain parser): `--comment-weight 0` / `--string-weight 0` are rejected, so there is no way to exclude comments or strings; English function words (`all`, `such`, `other`, `per`, `one`, `before`, `every`) are not stop-worded. Language gaps (not parser faults): Kotlin has no barrel / re-export module and no `static`.
