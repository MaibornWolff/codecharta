# Java

## Project
- Layout: `src/main/java/de/sots/cellarsandcentaurs/{domain/model,domain/service,adapter/persistence,application,application/dto}` and
  `src/test/java/de/sots/cellarsandcentaurs/domain/service/CreatureServiceTest.java`. 23 `.java` files (22 main + 1 test), 24 declarations.
- Stress constructs present: wildcard import (`CreatureUtil`: `import ...domain.model.*`), static import
  (`CreatureFacade`: `import static ...domain.model.Dice.rollD20`), fully qualified references without import
  (`CreatureFacade`: `de.sots.cellarsandcentaurs.domain.model.Speed` as parameter types and
  `de.sots.cellarsandcentaurs.application.dto.Creature` as return type + `new`), inheritance (`Centaur extends Creature`),
  interfaces (`Creature implements Fightable`, `PersistedCreatures implements Creatures`), generic base
  (`abstract class Repository<T>`, `CreatureRepository extends Repository<CreatureEntity>`), annotation-only usage
  (`@Persisted(table = "creatures")` on `CreatureEntity`, annotation declared in `adapter/persistence/Persisted.java`),
  type-position only (`ArmorClass` parameter in `CreatureFacade.create`), `new` only (`Centaur` in `CreatureFacade.createCentaur`,
  `CreatureEntity` in `PersistedCreatures.save`), static-member only (`SpeedType.WALKING` etc. and
  `CreatureFacade.STANDARD_CREATURE_TYPE` from `Creature` and `PersistedCreatures`), same simple name in two packages
  (`domain.model.Creature` and `application.dto.Creature`, both used from `CreatureFacade`), unused import
  (`Fightable` in `CreatureUtil`, redundant next to the wildcard), stdlib/third-party (`UUID`, `Map`, `Optional`, `Random`,
  slf4j `Logger`, `jakarta.persistence.Entity`, JUnit 5, Mockito), two declarations in one file (`Dice.java`: `Dice` +
  package-private `record DiceRoll`), file name different from declaration (`Experience.java` holds `record XPValue`),
  records (`CreatureId`, `DiceRoll`, `XPValue`, `dto.Creature`), enums (`CreatureType`, `SpeedType`), test file.
- Round 2 (see "Round 2: additional dependency forms" below) adds `module-info.java`, `adapter/cli/EncounterCommand.java`,
  `domain/service/InitiativeOrder.java`, `application/{CreatureFactories,CreatureInspector,LairGuide,Trap,Herd}.java` and a nested
  class `CreatureFacade.Builder`: 31 `.java` files (30 main + 1 test), 33 declarations. No round-1 file was changed except the
  appended nested class.
- Not applicable in Java: import alias (no syntax), barrel / re-export module (no syntax; the upward dependencies
  `ArmorClass -> CreatureUtil`, `Creature -> CreatureFacade`, `PersistedCreatures -> CreatureFacade` are therefore direct
  imports of the application classes), free function (`rollD20` is a static method of `Dice`).

## Dependency parser
- Commands (all exit 0, no crash, no warnings apart from the JDK native-access notice):
  - `ccsh dependencyparser -nc $LANG_DIR -e "output,FINDINGS.md" -o output/dependency.cc.json` -> 22 leaves, 42 file edges
  - `... --include-tests -o output/dependency-with-tests.cc.json` -> 23 leaves, 47 file edges
  - `... --verbose -o output/dependency-verbose.cc.json` -> same result; the log adds only timings and "Found 1 strongly connected components / 6 cycles"

Expected file edges, written down before the first run (44 edges; the scratch note mis-added the total as 45, the list itself
had 44 entries). Found 42 of 44, 0 extra.

Expected file-level edges added in round 2, written down before the second run (10 new edges expected, 44 + 10 = 54 in total;
`LairGuide -> Creature` and `module-info.java` are expected to yield **no** edge):

| From | To | Form (the only way the from-file uses the to-file) |
| --- | --- | --- |
| `adapter/cli/EncounterCommand` | `application/CreatureFacade` | import of a nested class `import ...CreatureFacade.Builder`, `new Builder().build()` |
| `domain/service/InitiativeOrder` | `domain/model/Dice` | static wildcard import `import static ...Dice.*` + call `rollD20()` |
| `application/CreatureFactories` | `domain/model/Dice` | method reference `Dice::rollD20` |
| `application/CreatureFactories` | `domain/model/Centaur` | constructor reference `Centaur::new` |
| `application/CreatureFactories` | `domain/model/CreatureId` | incidental: only inside the generic argument `Function<CreatureId, Object>` |
| `application/CreatureInspector` | `domain/model/Centaur` | `creature instanceof Centaur` |
| `application/CreatureInspector` | `domain/model/Speed` | array type `Speed[]` as parameter type |
| `application/Trap` | `domain/model/Fightable` | anonymous subclass `new Fightable() { ... }` |
| `application/Herd` | `domain/model/Centaur` | only inside the generic argument `List<Centaur>` (field type) |
| `application/LairGuide` | `domain/model/Creature` | import + Javadoc `{@link Creature}` only: **no edge expected** (comment); an edge would be a defensible extra |
| `module-info.java` | - | `requires org.slf4j`, `requires jakarta.persistence`, `exports ...application`, `exports ...application.dto`: **no edge expected**, must not break parsing |
| `application/CreatureFacade` (nested `Builder`) | - | new nested class inside an existing file; no new file edge expected (uses only `CreatureService`, already an edge) |

| Construct | Expected edge(s) | Found | Verdict |
| --- | --- | --- | --- |
| Aliased import | n/a in Java | - | n/a |
| Wildcard import `domain.model.*` in `CreatureUtil` | `CreatureUtil -> Creature`, `-> HitPoints`; nothing to the other 10 model files | exactly those two | ok |
| Static import `Dice.rollD20` in `CreatureFacade` | `CreatureFacade -> Dice` | none (`Dice` has 0 incoming) | missing |
| Barrel / re-export | n/a in Java | - | n/a |
| Upward deps via direct import | `ArmorClass -> CreatureUtil`, `Creature -> CreatureFacade`, `PersistedCreatures -> CreatureFacade` | all three | ok |
| Inheritance `Centaur extends Creature` | `Centaur -> Creature` | found | ok |
| `Creature implements Fightable` | `Creature -> Fightable` | found | ok |
| `PersistedCreatures implements Creatures` | `PersistedCreatures -> Creatures` | found | ok |
| Generic base `Repository<CreatureEntity>` | `CreatureRepository -> Repository`, `-> CreatureEntity` | both | ok |
| Type position only (`ArmorClass` param in facade) | `CreatureFacade -> ArmorClass` | found | ok |
| `new` only (`Centaur` in facade, `CreatureEntity` in `PersistedCreatures`) | `CreatureFacade -> Centaur`, `PersistedCreatures -> CreatureEntity` | both | ok |
| Static member only (`SpeedType.X` in facade; `CreatureFacade.STANDARD_CREATURE_TYPE` in `Creature`, `PersistedCreatures`) | `CreatureFacade -> SpeedType`, `Creature -> CreatureFacade`, `PersistedCreatures -> CreatureFacade` | all three | ok |
| Annotation only (`@Persisted` on `CreatureEntity`, same package) | `CreatureEntity -> Persisted` | found, leaf kind `ANNOTATION` | ok |
| Same simple name: `domain.model.Creature` (imported) and FQN `application.dto.Creature` in `CreatureFacade` | `CreatureFacade -> domain/model/Creature` and `-> application/dto/Creature` | only `-> domain/model/Creature`; `dto/Creature` has 0 incoming | missing (wrong target: the FQN collapsed onto the imported `Creature`) |
| Fully qualified without import (`...domain.model.Speed` in `CreatureFacade`) | `CreatureFacade -> Speed` | found | ok |
| Unused import (`Fightable` in `CreatureUtil`) | no edge | no edge | ok |
| Stdlib / third-party (`UUID`, `Map`, `Optional`, `Random`, slf4j, jakarta, JUnit, Mockito) | no internal edges | none | ok |
| Same-package reference without import (`CreatureId` in `NoSuchCreatureException`, `XPValue` in `Creature`, `Persisted`, `Repository`) | edges to the same-package files | all found | ok |
| Two declarations in one file (`Dice`, `DiceRoll`) | leaf edge `Dice -> DiceRoll`, no file edge | leaf edge found, no self file edge | ok |
| File name differs from declaration (`Experience.java` / `XPValue`) | `Creature -> Experience.java` | found (leaf `XPValue`, file `Experience.java`) | ok |
| Test file `CreatureServiceTest` | default: absent; `--include-tests`: `-> CreatureService`, `-> Creatures`, `-> Creature`, `-> CreatureId`, `-> Speed` | default: absent (22 leaves); with tests: all five | ok |

- False positives: none. No edge to any stdlib or third-party type, no edge for the unused `Fightable` import, no edge from the
  wildcard import to the unused model files.
- Cycles: 12 file edges flagged `isCyclic`, one strongly connected component (`Creature`, `CreatureFacade`, `CreatureService`,
  `Creatures`, `ArmorClass`, `CreatureUtil`, `Centaur`). Matches the expectation (`Creature -> CreatureFacade -> Creature`,
  `Creature -> CreatureFacade -> CreatureService -> Creatures -> Creature`, `ArmorClass -> CreatureUtil -> Creature -> ArmorClass`,
  `Creature -> CreatureFacade -> Centaur -> Creature`). `PersistedCreatures -> CreatureFacade` correctly not cyclic.
- Upward edges: only `ArmorClass -> CreatureUtil` and `Creature -> CreatureFacade` are `isPointingUpwards`.
  `PersistedCreatures -> CreatureFacade` is not flagged, because the leveling puts `application` at level 1 and `adapter` at
  level 2 (`adapter` depends on `application`, `application` depends on `domain`, `domain` is level 0). That is consistent with
  the level algorithm; it just means "upward" is relative to the computed levels, not to the intended layering
  (adapter -> application is the wrong direction in a ports-and-adapters sense but not detectable without configuration).
- Levels: `domain/model` leaves level 0 except `Creature` 1, `Centaur` 2, `NoSuchCreatureException` 1; `CreatureService` 1;
  `CreatureEntity` 1, `CreatureRepository` 2, `PersistedCreatures` 3. `Dice` level 1 (because of the intra-file `Dice -> DiceRoll`
  edge), `DiceRoll` 0. Plausible throughout.
- Metrics: `incoming_dependencies` / `outgoing_dependencies` equal the file-edge counts in every file (e.g. `CreatureId` in 7,
  `Creature` out 9 / in 6, `PersistedCreatures` out 7 / in 0). With `--include-tests` the five test edges raise `Creature`,
  `CreatureId`, `Speed`, `CreatureService`, `Creatures` by one each. Because the two missing edges are missing, `CreatureFacade`
  reports out 9 instead of 11 and `Dice` / `dto/Creature` report in 0 instead of 1.
- Leaf kinds: `CLASS` for classes, `INTERFACE` for `Fightable` and `Creatures`, `ENUM` for `CreatureType` and `SpeedType`,
  `ANNOTATION` for `Persisted`. Records (`CreatureId`, `DiceRoll`, `XPValue`, `dto.Creature`) are reported as `CLASS`; acceptable
  (no `RECORD` kind exists), but a record is closer to a value type than to a class. The package-private `DiceRoll` and `XPValue`
  are correctly listed as their own leaves.
- Native vs. resolved: Java has packages and explicit imports, so single-type imports and same-package references resolve
  cleanly and the parser gets them all. What CodeCharta has to resolve itself and where it fails: (a) `import static` of a
  member is not turned into a dependency on the enclosing type, (b) a fully qualified type reference whose simple name equals an
  imported type is resolved to the import instead of to the qualified package. Plain FQN references (`Speed`) and wildcard
  imports are resolved correctly.

## Domain language parser
- Commands (exit 0 unless noted):
  - `ccsh domainlanguageparser -nc $LANG_DIR -e "output,FINDINGS.md" -o output/domain.cc.json` -> 23 files, 89 distinct root words
  - `--identifier-weight 1` (`output/domain-ident1.cc.json`), `--string-weight 5` (`domain-string5`), `--stop-word-level MINIMAL`
    (`domain-minimal`), `--stop-word-level AGGRESSIVE` (`domain-aggressive`), `--exclude-tests` (`domain-notests`): all exit 0
  - `--string-weight 0` and `--comment-weight 0` exit 1 with `IllegalArgumentException: --string-weight must be positive, got 0`
    (same for comment weight). A weight of 0 is the natural way to switch a source off; the parser refuses it. Finding.
- Default weights, derived by comparing the runs: identifier declaration 3, comment word 2, string word 1. Only *declared*
  identifiers count (class, method, field, parameter, local names); type references and calls do not. Example `CreatureFacade`:
  `creature` = 7 declarations x 3 + 1 comment word x 2 = 23; `speed` = 5 speed parameters x 3 = 15 although `Speed` occurs 5 more
  times as a type.
- Expected words at the root node (all 17 present): creature 106, hit 37, points 34, armor 30, speed 27, centaur 16, damage 14,
  roll 13, dice 9, initiative 9, stable 8, hoard 5, treasure 5, dungeon 3, cellar 2, encounter 2, lair 2.
  `cellar`, `lair`, `encounter` come only from comments (weight 2); `dungeon` = 2 (comment) + 1 (string).
- Keyword leakage: none. `class`, `public`, `private`, `int`, `String`, `void`, `record`, `enum`, `static`, `final`, `var`,
  `throws`, `assert` are all absent. Correct.
- Technical stop-word leakage at MODERATE: filtered correctly: `util`, `exception`, `service`, `test`, `mock`/`mockito`, `get`,
  `save`, `find`, `create`. Leaking: `entity` 12, `repository` 12,
  `facade` 6, `persisted` 9, `dto` 3, `logger` 6, `random` 6, `standard` 6, `description` 12, `id` 57, `type` 39, `value` 18,
  `max` 15, `row` 9, `rows` 3, `table` 3, `all` 5, `init` 3, `such` 7, `per` 18, `feet` 15, `round` 15.
  - `entity`, `repository`, `facade`, `dto`, `logger`, `persisted`, `init` are technical for Java and should be filtered at
    MODERATE (the README lists `entity` and `repository` as expected stop words). `AGGRESSIVE` removes `entity`, `repository`,
    `facade`, `dto`, `logger`, `init`, `type`, `value` but keeps `persisted`, `id` 57 (the top-2 word!), `max`, `row`, `table`.
    `id` at 57 is the most visible wrong word: it is a Java idiom (`id`, `getId`, `CreatureId`) and drowns the domain words.
  - `such` 7 (from `NoSuchCreatureException` and the string) is an English function word missing from the english stop list.
  - `per`, `feet`, `round`, `description`, `max`, `bonus`, `current` are domain-adjacent and acceptable.
- MINIMAL vs AGGRESSIVE in one line: MINIMAL additionally shows `get` 42, `service` 18, `find` 15, `save` 15, `base` 9,
  `create` 6 (CRUD and pattern words); AGGRESSIVE removes `type`, `value`, `entity`, `repository`, `facade`, `logger`, `dto`,
  `init` on top of MODERATE, but neither level touches `id`.
- Identifier splitting:

| Form | Identifier | Words found | Verdict |
| --- | --- | --- | --- |
| camelCase | `walkingSpeed` | walking, speed | ok |
| snake_case | `walking_speed` (test) | walking, speed | ok |
| SCREAMING_SNAKE | `MAX_HIT_POINTS` | max, hit, points | ok |
| PascalCase | `ArmorClass` | armor (class filtered as keyword) | ok |
| Acronym | `XPValue` | xp, value | ok |
| Digit | `d20Roll` | 20, roll (the `d` is dropped as a one-letter token) | wrong |
| Digit, other position | `rollD20`, `D20_SIDES` | roll, d20 / d20, sides | inconsistent with the row above |
| Kebab in string | `"centaur-stable"` | centaur, stable | ok |
| Plural / singular | `Creature` vs `Creatures`, `Centaurs`, `dragons`, `rests`/`rest` | counted as separate words | no stemming; acceptable but halves some counts |
| Test method | `should_save_creature_to_the_stable` | creature, stable (`should`, `to`, `the` English stop words, `save` technical) | ok |

  The digit handling: a lowercase letter followed by a digit is split (`d20Roll` -> `d`, `20`, `roll`), an uppercase letter
  followed by a digit is not (`rollD20` -> `roll`, `d20`). Result: the pure number `20` appears as a domain word (root `20` 6).
  Number-only tokens should be dropped; a letter-digit run should be kept together consistently (`d20` in both cases).
- Comments and strings: all planted sentences are counted. Doc comment on `Creature`: roams 2, cellar 2, centaurs 2, beasts 2,
  dragons 2, share 2 (hit/points/armor/speeds merge with identifier counts). Doc comment on `HitPoints`: drop 2, lair 2,
  recover 2, rests 2, takes 2. Line comment in `CreatureFacade.create`: rolls 2, initiative (+2), dungeon 2, before 2,
  encounter 2, starts 2. Block comment in `CreatureUtil`: counts 2, treasure (+2), hoard (+2), guards 2. Strings:
  `"No such creature in the dungeon: "` -> dungeon 1, such/creature +1; `"centaur-stable"` -> centaur +1, stable +1;
  `"Natural Armor"` -> natural 1, armor +1. Weights are visible: with `--string-weight 5` `dungeon` in
  `NoSuchCreatureException` goes 1 -> 5 and `stable` in `CreatureFacade` 5 -> 13; with `--identifier-weight 1` root
  `creature` goes 106 -> 42. The `// Arrange` / `// Act` / `// Assert` comments yield nothing because `arrange`, `act`,
  `should` are in the English stop list and `assert` is a Java keyword; good.
- Test file handling: included by default (root `creature` 106 vs 97 with `--exclude-tests`; `stable` 8 vs 5, `walking` 9 vs 6).
  `--exclude-tests` drops `src/test` completely. The test's `CreatureServiceTest` contributes only `creature` (`service`,
  `test` filtered), `@Mock`/`MockitoExtension`/`ExtendWith` produce nothing (imports and annotations are not counted as
  declarations).

## Round 2: additional dependency forms
- Commands rerun unchanged (all exit 0, only the JDK native-access notice and the `.gitignore` fallback warning):
  - default -> 31 leaves (incl. the nested `Builder`), 45 file edges (round 1: 23 leaves, 42 edges)
  - `--include-tests` -> 32 leaves, 50 file edges (the same five test edges as in round 1)
  - domain -> 31 files (incl. `module-info.java`), 135 `creature` at the root (round 1: 106)
  - Only `dependency.cc.json`, `dependency-with-tests.cc.json` and `domain.cc.json` (plus their `.log`) were regenerated; the other
    files in `output/` (`*-verbose`, `domain-*`) are still the round-1 runs.
- Expected: 10 new file edges (44 + 10 = 54). Found 3 of 10, 45 of 54 in total, 0 extra.

| Form | File(s) | Expected edge | Found | Note |
| --- | --- | --- | --- | --- |
| Import of a nested class `import ...CreatureFacade.Builder` + `new Builder().build()` | `adapter/cli/EncounterCommand.java` | `EncounterCommand -> application/CreatureFacade` | no | `EncounterCommand` has 0 outgoing. The nested class is registered as a top-level leaf `de.sots.cellarsandcentaurs.application.Builder` (the `CreatureFacade.` qualifier is dropped), so the import path `...application.CreatureFacade.Builder` matches nothing. Experiment (scratch copy): the same file placed in package `application` gets the edge via the same-package simple name `Builder`; `new CreatureFacade.Builder()` with a plain `import ...CreatureFacade` gets **no** edge at all. |
| Static wildcard import `import static ...Dice.*` + `rollD20()` | `domain/service/InitiativeOrder.java` | `InitiativeOrder -> domain/model/Dice` | no | Same failure as the single static import of round 1; `Dice` still has 0 incoming. |
| Method reference `Dice::rollD20` | `application/CreatureFactories.java` | `CreatureFactories -> domain/model/Dice` | no | `Dice` is imported and named in the reference; not counted as a usage. |
| Constructor reference `Centaur::new` | `application/CreatureFactories.java` | `CreatureFactories -> domain/model/Centaur` | no | Same: the identifier before `::` is not resolved. |
| Type only inside the generic argument `Function<CreatureId, Object>` (incidental) | `application/CreatureFactories.java` | `CreatureFactories -> domain/model/CreatureId` | yes | Generic arguments of a field type resolve. |
| `creature instanceof Centaur` | `application/CreatureInspector.java` | `CreatureInspector -> domain/model/Centaur` | no | Experiment: the pattern form `instanceof Centaur centaur` and a cast `(Centaur) creature` are missed as well. |
| Array type `Speed[]` as parameter type | `application/CreatureInspector.java` | `CreatureInspector -> domain/model/Speed` | no | `CreatureInspector` has 0 outgoing. Experiment: a field `Speed[] speeds = new Speed[5]` is missed too, so array types are not unwrapped anywhere (a plain `Speed` parameter resolves, see round 1). |
| Anonymous subclass `new Fightable() { ... }` | `application/Trap.java` | `Trap -> domain/model/Fightable` | yes | Leaf kind of `Fightable` stays `INTERFACE`; no extra leaf for the anonymous class. |
| Type only inside the generic argument `List<Centaur>` (field) | `application/Herd.java` | `Herd -> domain/model/Centaur` | yes | |
| Javadoc `{@link Creature}` with an import used only there | `application/LairGuide.java` | none (comment) | none | Correct for the dependency parser. The domain parser counts the tag name: `link` 2 in `LairGuide.java` (Javadoc tags should be stop words). |
| `module-info.java` (`requires org.slf4j`, `requires jakarta.persistence`, `exports ...application`, `exports ...application.dto`) | `src/main/java/module-info.java` | none | none, no crash | The dependency parser drops the file from the tree altogether (29 file nodes for 30 main files); the domain parser keeps it with an empty word list. Acceptable; a `MODULE` leaf with `requires` edges to external modules would be the informative alternative. |
| Nested class declaration `CreatureFacade.Builder` | `application/CreatureFacade.java` | no new file edge | ok | Leaf `application.Builder` (kind `CLASS`, level 1) with leaf edges `Builder -> CreatureFacade`, `Builder -> CreatureService`, `CreatureFacade -> Builder`; the file edge `CreatureFacade -> CreatureService` goes from `x1` to `x2`. The leaf name loses the enclosing class; two nested `Builder` classes in one package would collide. |

- Round-1 edges: all 42 round-1 file edges are still present with the same `isCyclic` / `isPointingUpwards` flags, and all
  round-1 leaf levels and folder levels are unchanged (`adapter` 2, `application` 1, `domain` 0, new `adapter/cli` 0). The two
  round-1 misses (`CreatureFacade -> Dice`, `CreatureFacade -> dto/Creature`) are still missing. Changes caused by the nested
  class: `CreatureFacade -> CreatureService` is counted `x2`, `CreatureFacade.outgoing_dependencies` rises 9 -> 10 although it
  still has 9 file edges (the metric sums the per-edge `dependencies` count, it is not the number of edges as stated in round 1),
  and the log reports 9 cycles instead of 6 (leaf-level cycles through `Builder`, e.g. `CreatureFacade -> Builder -> CreatureFacade`;
  the strongly connected component and the file-level flags are unchanged). Incoming counts rise as expected: `Centaur` 1 -> 2,
  `Fightable` 1 -> 2, `CreatureId` 7 -> 8.
- New false positives: none. `EncounterCommand`, `CreatureInspector`, `InitiativeOrder`, `LairGuide` report 0 outgoing rather
  than a wrong target; nothing points to `java.util.function`, `List`, `ArrayList` or the module names.
- Domain parser after round 2: the planted words still lead (`creature` 135, `hit` 37, `points` 34, `armor` 30, `speed` 30,
  `centaur` 22, `initiative` 21, `roll` 19, `lair` 14, `encounter` 10); the new class-name suffixes leak like `facade` does:
  `factories` 6, `inspector` 6, `guide` 6, `trap` 6 (the last one is domain), plus `command` 3, `run` 3, `build` 3, `size` 3,
  `total` 6, `link` 2 (Javadoc tag). `module-info.java` yields nothing, which is right.

## Verdict
- Good: 42 of 44 expected file edges in round 1 and 45 of 54 after round 2, with zero false positives in both rounds; wildcard import, plain FQN reference, same-package
  references, annotation-only usage, `new`-only, static-member-only, generic base, records and package-private types in
  oddly named files all resolve; cycle detection and the test-file default are right; all 17 expected domain words appear;
  no Java keyword leaks; all planted comments and strings are counted with visible, adjustable weights; camelCase,
  snake_case, SCREAMING_SNAKE, acronym and kebab-in-string splitting are correct. Round 2 adds: anonymous subclasses, types inside
  generic arguments (`List<Centaur>`, `Function<CreatureId, Object>`) and a Javadoc-only reference (correctly no edge) are handled;
  `module-info.java` does not break the run.
- Wrong:
  1. `application/CreatureFacade.java`: the fully qualified `de.sots.cellarsandcentaurs.application.dto.Creature` (return type
     and `new`) is resolved to the imported `domain.model.Creature`; `application/dto/Creature.java` gets 0 incoming instead of 1.
  2. `application/CreatureFacade.java`: `import static de.sots.cellarsandcentaurs.domain.model.Dice.rollD20` plus the call
     `rollD20()` produce no edge to `domain/model/Dice.java`.
  3. Domain parser, `Dice.java` / `CreatureFacade.java`: `d20Roll` is split into `20` + `roll` while `rollD20` and `D20_SIDES`
     yield `d20`; the bare number `20` becomes a root word (6).
  4. Domain parser: `id` (57, the second most frequent root word), `entity` 12, `repository` 12, `persisted` 9, `facade` 6,
     `logger` 6, `dto` 3, `init` 3 pass the MODERATE technical filter; AGGRESSIVE still keeps `id` and `persisted`. `such` 7
     passes the English stop list.
  5. `--string-weight 0` and `--comment-weight 0` are rejected (`must be positive`), so a source cannot be switched off.
  6. Round 2, usages that name a type but produce no edge (each file has 0 outgoing): `application/CreatureInspector.java`
     `creature instanceof Centaur` and the array parameter `Speed[] speeds`; `application/CreatureFactories.java` the method
     reference `Dice::rollD20` and the constructor reference `Centaur::new`; `domain/service/InitiativeOrder.java`
     `import static ...Dice.*` + `rollD20()`; `adapter/cli/EncounterCommand.java` `import ...CreatureFacade.Builder` +
     `new Builder()`. Casts (`(Centaur) creature`) and `new CreatureFacade.Builder()` are missed as well (scratch experiment).
  7. Round 2, `application/CreatureFacade.java`: the nested class is exported as the top-level leaf
     `de.sots.cellarsandcentaurs.application.Builder`, which is why the qualified import from another package cannot resolve it
     and which makes same-named nested classes in one package collide.
- Missing:
  - No `RECORD` leaf kind: `CreatureId`, `DiceRoll`, `XPValue`, `dto.Creature` are reported as `CLASS` (minor).
  - `PersistedCreatures -> CreatureFacade` is not marked upward because levels are computed from the actual graph; a
    layering-aware "upward" would need configured layer order (not a parser bug, noted for completeness).
  - No stemming: `creature`/`creatures`, `centaur`/`centaurs`, `rest`/`rests` count separately.
  - Not applicable in Java, therefore not testable here: import alias, barrel / re-export, free function.
  - Round 2: no `MODULE` leaf or `requires` edges for `module-info.java` (the file is silently dropped from the dependency
    tree); `outgoing_dependencies` is documented nowhere as "sum of dependency counts" versus "number of edges".
  - Round 2, domain parser: Javadoc tag names (`link`) and pattern suffixes (`factories`, `inspector`, `guide`) are counted as words.
