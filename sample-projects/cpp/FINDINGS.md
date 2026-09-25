# C++

## Project

- Layout: `CMakeLists.txt`, `src/de/sots/cellarsandcentaurs/{domain/model,domain/service,adapter/persistence,application,application/dto}`
  with `.hpp` headers and `.cpp` sources, `test/de/sots/cellarsandcentaurs/domain/service/CreatureServiceTest.cpp` (gtest).
  26 source files under `src/` (13 in `domain/model`, 3 in `domain/service`, 5 in `adapter/persistence`, 5 in `application`),
  1 test file, 28 files in total. Namespaces `de::sots::cellarsandcentaurs::...` mirror the folders. `#include "..."` uses
  relative paths inside `src/`; the test uses include-root paths (`de/sots/.../CreatureService.hpp`, the `-I src` convention).
- Stress constructs that exist in C++ and are in the project:
  1. alias `using Entity = CreatureEntity;` in `CreatureRepository.hpp`
  2. wildcard `using namespace de::sots::cellarsandcentaurs::domain::model;` in `CreatureUtil.hpp`
  3. barrel = umbrella header `application/Application.hpp` (only `#include`s), included by `Creature.cpp`, `ArmorClass.cpp`, `PersistedCreatures.cpp`
  4. `Centaur : public Creature`, `Creature : public Fightable`, `PersistedCreatures : public domain::service::Creatures` (pure virtual classes as interfaces)
  5. `template <typename T> class Repository`, `CreatureRepository : public Repository<Entity>`
  6. type-position only: `Speed` in `CreatureFacade`; instantiation only: `CreatureId` in `CreatureFacade.cpp`; static member only:
     `application::CreatureFacade::STANDARD_CREATURE_TYPE` in `Creature.cpp` (member initializer) and `PersistedCreatures.cpp` (function body),
     `application::CreatureUtil::STANDARD_ARMOR_CLASS_DESCRIPTION` in `ArmorClass.cpp` (member initializer), `HitPoints::init(...)` in `CreatureFacade.cpp`
  7. `domain::model::Creature` and `application::dto::Creature`, both used in `CreatureFacade.hpp/.cpp`
  8. fully qualified `de::sots::cellarsandcentaurs::domain::model::Speed` in `CreatureFacade.cpp` (without a direct `#include "Speed.hpp"` in that file)
  9. unused `#include "../domain/model/Fightable.hpp"` in `CreatureUtil.hpp`
  10. `std::map/optional/shared_ptr/string`, `boost::uuids`, `spdlog`, `gtest`
  11. `CreatureServiceTest.cpp` in `test/`, references `CreatureService`
  12. `Dice.hpp` holds `DiceRoll`, `Dice` and the free function `rollD20`; `Application.hpp` holds no declaration at all
- Round 2 adds 10 header-only files (one per additional dependency form, see "Round 2" below): 36 files under `src/`,
  37 in total. `CMakeLists.txt` is unchanged (it globs `.cpp` only).
- Not available in C++: annotations/decorators that reference a type (C++ attributes such as `[[nodiscard]]` carry no type),
  a module system with re-exports (an umbrella header is the closest thing), `interface` (pure virtual class instead).

## Dependency parser

- Commands (both exit 0, no warnings apart from the JVM native-access notice; `--verbose` adds nothing C++-specific):
  - `ccsh dependencyparser -nc $LANG_DIR -e "output,FINDINGS.md" -o output/dependency.cc.json` -> 25 leaves, 35 file edges
  - `ccsh dependencyparser ... --include-tests -o output/dependency-with-tests.cc.json` -> 26 leaves, 39 file edges
- Expected file-level edge list (written before the first run) is kept at the bottom of this file.
- General behaviour that shapes every result below: a declaration is one leaf keyed by its namespace path. `Creature.hpp` and
  `Creature.cpp` both yield the leaf `de.sots.cellarsandcentaurs.domain.model.Creature`, and the leaf is attached to the
  `.cpp` file. All file edges of the pair are therefore drawn from/to the `.cpp`: `Creature.hpp`, `ArmorClass.hpp`,
  `CreatureService.hpp`, `CreatureFacade.hpp`, `PersistedCreatures.hpp` have 0 incoming / 0 outgoing and no edge touches them,
  while e.g. `Creature.cpp -> Fightable.hpp` is reported although the inheritance is written in `Creature.hpp`. Types are
  resolved by simple name against the project-wide dictionary; `#include`s only disambiguate, so an include on its own never
  produces an edge and an include-less use still resolves.

| # | Construct | Expected edge(s) | Found | Verdict |
| --- | --- | --- | --- | --- |
| 1 | `using Entity = CreatureEntity;` (`CreatureRepository.hpp`) | CreatureRepository -> CreatureEntity | only CreatureRepository -> Repository | missing: the alias is neither a leaf nor resolved back to `CreatureEntity`; `Repository<Entity>` resolves `Repository` but drops `Entity` (scratch test: `using X = a::Beta; X field;` and `typedef` targets both give no edge) |
| 2 | `using namespace ...domain::model` (`CreatureUtil.hpp`) | CreatureUtil -> Creature, HitPoints | both found | ok |
| 3 | umbrella header `Application.hpp` | Creature.cpp / ArmorClass.cpp / PersistedCreatures.cpp -> CreatureFacade / CreatureUtil | Creature.cpp -> CreatureFacade.cpp and ArmorClass.cpp -> CreatureUtil.hpp found; `Application.hpp` itself has no leaf and is dropped from the file tree (not in metrics, no REEXPORT leaf) | ok for the resolved targets (by name, not through the barrel); the barrel is invisible |
| 4 | `Centaur : public Creature` | Centaur -> Creature | found, `usage=usage` | ok (no INHERITANCE usage kind is emitted, every leaf edge says `usage`) |
| 4 | `Creature : public Fightable`, `PersistedCreatures : public Creatures` | Creature -> Fightable, PersistedCreatures -> Creatures | both found | ok |
| 5 | `Repository<Entity>` | CreatureRepository -> Repository | found | ok (generic base resolved; the argument `Entity` lost, see 1) |
| 6a | type position only (`Speed` params in `CreatureFacade`) | CreatureFacade -> Speed | found | ok |
| 6b | instantiation only (`domain::model::CreatureId(generateUuid())`) | CreatureFacade -> CreatureId | found | ok |
| 6c | static member in member-initializer (`Creature.cpp`, `ArmorClass.cpp`) | Creature -> CreatureFacade, ArmorClass -> CreatureUtil | both found | ok |
| 6d | static member / static call in a function body (`PersistedCreatures.cpp`: `CreatureFacade::STANDARD_CREATURE_TYPE`; `CreatureFacade.cpp`: `HitPoints::init`) | PersistedCreatures -> CreatureFacade, CreatureFacade -> HitPoints | neither | missing (scratch test confirms: `a::Alpha::VALUE` and `a::Alpha::make()` inside a method body give no edge, the same in an initializer list does) |
| 6e | attribute referencing a type | - | - | language has no such construct |
| 7 | `domain::model::Creature` vs `application::dto::Creature` in `CreatureFacade` | CreatureFacade -> both | only -> domain.model.Creature; `dto.Creature` has 0 incoming | wrong: one target per simple name, the qualified `dto::` prefix does not lead to the second leaf |
| 8 | fully qualified `de::sots::...::model::Speed` without direct include | CreatureFacade -> Speed | found | ok (but `Speed` is also used unqualified there, so not a clean proof) |
| 9 | unused `#include "Fightable.hpp"` in `CreatureUtil.hpp` | no edge | no edge | ok |
| 10 | `std::`, `boost::uuids`, `spdlog`, `gtest` | no internal edge, no leaf | none | ok |
| 11 | `CreatureServiceTest.cpp` | skipped by default, present with `--include-tests` | skipped by default (detected by the `test/` directory); with `--include-tests`: `InMemoryCreatures` leaf plus edges to Creature, CreatureId, NoSuchCreatureException, Creatures | partly wrong: the edge to `CreatureService` (the point of the test) is missing, so are Speed, CreatureType, SpeedType - everything used only inside the `TEST(...)` bodies |
| 12 | `Dice.hpp`: `Dice`, `DiceRoll`, `rollD20` | leaves Dice, DiceRoll, rollD20; Creature.cpp -> Dice.hpp (calls `rollD20()`) | leaves `Dice` and `DiceRoll` (both CLASS) and `Dice -> DiceRoll`; no `rollD20` leaf; no Creature -> Dice edge | missing: free functions are not leaves and calls are not usages (scratch test: a free function `a::Delta buildDelta()` gives neither leaf nor edge) |
| 12 | file without declaration (`Application.hpp`) | file node with 0/0 | file absent from the tree | wrong-ish: the file disappears from the map |

- False positives: none. No edge exists that the source does not justify.
- Cycles: reported `Creature.cpp -> CreatureFacade.cpp -> CreatureService.cpp -> Creature.cpp` (isCyclic on all three) and
  `ArmorClass.cpp -> CreatureUtil.hpp -> Creature.cpp -> ArmorClass.cpp`, also `Creatures.hpp <-> CreatureService.cpp <-> Creature.cpp`.
  These are the expected declaration-level cycles; at file level they only close because the hpp/cpp pair is collapsed onto the `.cpp`.
- Upward edges: `ArmorClass.cpp -> CreatureUtil.hpp` and `Creature.cpp -> CreatureFacade.cpp` flagged isPointingUpwards - correct.
  `PersistedCreatures.cpp -> application/*` should be a third upward edge but is missing (6d).
- Levels: domain/model files 0, `Creature` 1, `Centaur` 2, `NoSuchCreatureException` 1, `CreatureRepository` 1, `PersistedCreatures` 2,
  `application` folder 1 - plausible. Metrics: `Creature.cpp` 8 out / 6 in, `CreatureId.hpp` 7 in; all `.hpp` halves of a pair 0/0.
- Leaf kinds: `CreatureType`, `SpeedType` = ENUM (right). `Fightable`, `Creatures` = CLASS - C++ has no interface keyword, so CLASS
  is defensible, but a class with only pure virtual members could be reported as INTERFACE. `DiceRoll` (struct), `Repository`
  (template) = CLASS (fine). No FUNCTION, VARIABLE or REEXPORT leaves at all for C++ (`rollD20`, `Entity`, `Application.hpp`).
- Test detection: only the directory names (`test`, `tests`, ...) count for C++; a `FooTest.cpp` outside such a folder is
  analysed in the default run (scratch test). The `_test.cpp` / `Test.cpp` naming conventions are not recognised.
- What the language offers: C++ has no module system in this project style; `#include` is textual, namespaces are independent
  of folders, and `using` aliases/`using namespace` change name lookup. CodeCharta resolves everything itself by simple type
  name, using the namespace path as leaf key and includes / `using namespace` / qualified prefixes as tie-breakers. That works
  well for class-to-class references in signatures, fields and initializers, and breaks for aliases, free functions,
  same-name types in different namespaces and anything referenced only inside a function body via `::`.

## Domain language parser

- Commands (all exit 0): default -> `output/domain.cc.json` (27 files, 45 nodes); `--stop-word-level MINIMAL` -> `domain-minimal.cc.json`;
  `--stop-word-level AGGRESSIVE` -> `domain-aggressive.cc.json`; `--exclude-tests` -> `domain-exclude-tests.cc.json`;
  `--comment-weight 1 --string-weight 1` -> `domain-weights-1-1-1.cc.json`.
- `--comment-weight 0` and `--string-weight 0` (the README suggestion) are rejected: exit 1 with a raw Java stack trace
  `IllegalArgumentException: --comment-weight must be positive, got 0` (`DomainLanguageParser.kt:141/142`), captured in
  `output/domain-comment-weight-0.error.txt` and `output/domain-string-weight-0.error.txt`. `--identifier-weight 0` fails the same way.
  Weights cannot be switched off, only lowered to 1.
- `CMakeLists.txt` is ignored (not in the tree), the test file is included by default.

Expected words at the root node (all 17 present):

| word | freq | word | freq | word | freq |
| --- | --- | --- | --- | --- | --- |
| creature | 144 | armor | 45 | treasure | 5 |
| speed | 57 | hit | 43 | hoard | 5 |
| centaur | 13 | points | 43 | stable | 4 |
| roll | 12 | damage | 8 | dungeon | 3 |
| dice | 10 | cellar | 2 | lair | 2 |
| initiative | 2 | encounter | 2 | | |

- Keyword leakage: none of `class public private def var string int override const explicit noexcept virtual namespace
  using struct enum void bool auto std map optional vector shared_ptr` appears - the C++ keyword list covers the STL names.
  Only `memory(3)` leaks, from `#include <memory>` (see below) - a system header name is not on the keyword list. Right.
- Technical-word leakage at MODERATE: `entity(20)`, `repository(20)`, `facade(11)`, `dto(7)`, `persisted(10)`, `model(24)`,
  `domain(21)`, `application(6)`, `assert(4)`, `such(9)`. `entity/repository/facade/dto/model` are on the AGGRESSIVE list
  only, so leaking at MODERATE is by design (AGGRESSIVE removes `type, model, value, entity, repository, facade, dto, init, result`;
  MINIMAL adds back `get(42), service(31), base(30), find(27), save(24), create(6)`). `util`, `exception`, `test`, `service`
  are correctly removed. `such(9)` comes from `NoSuchCreatureException` (`no` is a stop word, `such` is not) - harmless.
  `hpp(52)`, `domain(21)`, `model(24)`, `sots(6)`, `cellarsandcentaurs(6)`, `memory(3)` are wrong: they come from `#include`
  paths, which the parser counts as string literals (weight 1: `CreatureFacade.hpp` has 4 includes of `../domain/model/*.hpp`
  and shows `domain(5) model(4) hpp(6)`). Include paths should not be text. Namespace declarations themselves are not counted
  (`sots` only appears via the test file's include-root paths), which is right.

Identifier splitting:

| form | identifier | where | words found |
| --- | --- | --- | --- |
| camelCase | `walkingSpeed` | `Centaur.hpp`, `CreatureFacade` | walking, speed (Centaur.hpp: walking(9), speed(10)) |
| snake_case | `walking_speed` | test file | walking(3), speed |
| SCREAMING_SNAKE | `MAX_HIT_POINTS` | `HitPoints.hpp` | max, hit, points (max(15)) |
| PascalCase | `ArmorClass` | `ArmorClass.hpp` | armor(9); `class` removed as keyword - right |
| acronym | `XPValue` | `Centaur.hpp` | xp(3), value(3) |
| digit | `d20Roll` | `Dice.hpp` | d20(3), roll |
| digit | `rollD20` | `Dice.hpp` | roll, 20(3) (`d` dropped as a 1-letter word) - inconsistent with `d20Roll` |
| kebab in string | `"centaur-stable"` | `CreatureFacade.hpp` | centaur(1), stable(1) (plus stable(3) from `STABLE_NAME`) |

- Comments and strings: all planted texts are counted and the weights are visible in the frequencies.
  Doc comment on `Creature` -> `roams(2) share(2) cellar(2) beasts(2) dragons(2)` (weight 2); doc comment on `HitPoints` ->
  `damage(8)=3+3+2`, `lair(2) recover(2) rests(2)`; line comment in `CreatureFacade::create` -> `rolls(2) initiative(2)
  dungeon(2) encounter(2) starts(2)`; block comment in `CreatureUtil` -> `treasure(5)=3+2, hoard(5), guards(2), counts(2)`;
  string in `NoSuchCreatureException` -> `dungeon(1) such(7)=3+3+1`; `"centaur-stable"` -> `centaur(1) stable(1)`.
  Words that only occur in comments (`roams`, `lair`, `initiative`) sit at the bottom of the list with frequency 2.
- Test file handling: included by default (`test` node with creature(10), centaur(6), walking(3), ...); `--exclude-tests`
  removes it cleanly (root loses `sots`, `cellarsandcentaurs`, `assert`, `memory`, `saved`, `unknown`; `centaur` 13 -> 7).
  The test name `should_save_creature_to_the_stable` is NOT extracted: it is an argument of the gtest `TEST(...)` macro, not a
  declaration, so the test node has no `stable` at all (`should` and `save` would be filtered anyway). `ASSERT_EQ`/`EXPECT_EQ`
  are not counted either; `assert(4)` comes from the `// Assert` comments.
- Stop-word levels in one line: MINIMAL lets the CRUD/architecture words back in (`get 42, service 31, base 30, find 27, save 24`),
  AGGRESSIVE additionally removes `type, model, value, entity, repository, facade, dto, init, result` - the 17 domain words are
  unchanged at every level.

## Round 2: additional dependency forms

- Ten new header-only files, each holding one form as the only path from that file to its target (the expected edges were
  added to the appendix before the run). Commands as in round 1, all exit 0, `output/dependency.cc.json`,
  `output/dependency-with-tests.cc.json` and `output/domain.cc.json` overwritten. Default run: 46 file edges (35 + 11),
  30 leaves; with tests: 50 file edges, 31 leaves. Scratch probes (copies of the project with extra `Probe*.hpp` files, not
  kept) are quoted where they sharpen a finding.

| form | file(s) | expected edge | found | note |
| --- | --- | --- | --- | --- |
| forward declaration `class Creature;` + `Creature*` member, no include | `domain/model/Lair.hpp` | Lair.hpp -> Creature.cpp | yes | resolved by simple name; the forward declaration neither creates a second `Creature` leaf nor moves the leaf off `Creature.cpp` |
| using-declaration `using domain::model::Creature;` then `Creature` | `application/CreatureDescriber.hpp` | -> domain/model/Creature.cpp | wrong target: -> application/dto/Creature.hpp | the relative using-declaration is dropped (an import whose path `domain.model.Creature` is no leaf path); `Creature` then resolves like a bare name and the self-namespace wildcard `…application` captures `application.dto.Creature` (substring match). Probe: the rooted `using de::sots::cellarsandcentaurs::domain::model::Creature;` resolves right; `using application::dto::Creature;` in `domain/service` gives no edge at all |
| namespace alias `namespace model = de::…::domain::model;` then `model::Speed` | `adapter/persistence/SpeedMapper.hpp` | -> Speed.hpp | yes (by accident) | the alias is not understood; `Speed` resolves because the prefix `model` is a substring of `…domain.model.Speed`. Probe: `namespace fullmodel = …; fullmodel::Creature` gives no edge |
| `typedef CreatureEntity Entity;` then `Entity` in a signature | `adapter/persistence/EntityMapper.hpp` | -> CreatureEntity.hpp | no | the file is 0/0: a typedef is as invisible as `using X = Y` (round 1 #1); probe: a typedef without any further use gives no edge either |
| `friend class CreatureUtil;` and nothing else | `application/TreasureLedger.hpp` | -> CreatureUtil.hpp | yes | the friend declaration alone is a usage |
| `dynamic_cast<const Centaur*>` / `static_cast<Centaur*>` only | `application/CentaurInspector.hpp` | -> Centaur.hpp | yes | probe: each cast on its own gives the edge, inside a function body. The same file's `domain::model::Creature` parameters land on `dto/Creature.hpp` (see false positives) |
| type only as template argument `std::vector<model::Centaur>` | `domain/service/CentaurHerd.hpp` | -> Centaur.hpp | yes | as in round 1 for `std::map<SpeedType, Speed>` |
| type only in `catch (const NoSuchCreatureException&)` | `application/SafeCreatureLookup.hpp` | -> NoSuchCreatureException.hpp | no | the catch parameter type is not collected (probe: also not with a named parameter); a `throw domain::model::NoSuchCreatureException(id)` in a body is (probe, and round-1 `PersistedCreatures.cpp`). The signature types resolve (-> CreatureId.hpp, -> CreatureService.cpp), `domain::model::Creature` again -> dto |
| `#include` and a `Dice` member both under `#ifdef CELLARS_TRACE_ROLLS` | `application/CreatureTrace.hpp` | -> Dice.hpp | yes | the member inside the `#ifdef` block is parsed like any other; the parser has no notion of the macro being undefined |
| `template <> class Repository<domain::model::Centaur>` | `adapter/persistence/CentaurRepository.hpp` | -> Repository.hpp, -> Centaur.hpp | no, file absent | the specialization is no declaration: the file disappears from the dependency tree like `Application.hpp` (it is present in the domain tree). Primary `Repository` leaf and `CreatureRepository -> Repository` unchanged. Probe: with a second ordinary class in the file the file appears with that class only, still no edge to `Repository` or `Centaur` |

- Round-1 edges: none changed. All 35 default and 39 with-tests edges of round 1 are present with the same `isCyclic` /
  `isPointingUpwards` flags; the diff of the two dumps contains only additions. Only incoming counts grew:
  `Creature.cpp` 6 -> 7, `Centaur.hpp` 0 -> 2, `CreatureId.hpp` 7 -> 8, `Speed.hpp` 3 -> 4, `Dice.hpp` 0 -> 1,
  `CreatureUtil.hpp` 1 -> 2, `CreatureService.cpp` 1 -> 2, `dto/Creature.hpp` 0 -> 3 (all three wrong, see below). The four
  test-file edges of the `--include-tests` run are identical. No new cycle, no new upward edge (none expected).
- New false-positive edges (three, all the same defect): `CentaurInspector.hpp -> dto/Creature.hpp`,
  `CreatureDescriber.hpp -> dto/Creature.hpp`, `SafeCreatureLookup.hpp -> dto/Creature.hpp`. Each stands in for the correct
  edge to `Creature.cpp`, so they are three wrong targets = three false positives plus three missing edges. Root cause
  (`analysis/model/Node.kt`, `resolveTypeImport`; `TseMappings.toType`): a used type carries only its simple name, the
  `domain::model::` qualifier becomes a wildcard candidate; for an ambiguous simple name without a rooted wildcard the
  wildcards are tried in the order file imports, own namespace, qualifier prefixes, and matched by substring (`contains`).
  In namespace `application` the own-namespace wildcard `de.sots.cellarsandcentaurs.application` is a substring of
  `…application.dto.Creature` and wins; in `adapter::persistence` it is not, so `PersistedCreatures.cpp` gets the right
  target. Round-1 `CreatureFacade` only resolved to `domain.model` because the same declaration also references
  `de::sots::cellarsandcentaurs::domain::model::Speed` fully qualified, which registers a rooted wildcard
  `…domain.model.*` that passes the exact-package check first. Probe: a plain `application` class with both
  `domain::model::Creature` and `dto::Creature` gets `dto.Creature` only, a class with a fully qualified
  `de::sots::cellarsandcentaurs::domain::model::Creature` gets `domain.model.Creature`. So the round-1 verdict item 1 is
  not "dto is never resolved" but "the relative qualifier is ignored and one of the two same-named types wins by a
  substring accident".
- Score for the new forms: 11 new file edges reported, 8 right, 3 wrong target; 7 expected edges missing (typedef, catch,
  specialization x2, and the 3 displaced `Creature` targets). Found: forward declaration, friend, casts, template
  argument, `#ifdef`; found by accident: namespace alias; wrong: using-declaration; missing: typedef, catch, template
  specialization (file vanishes).
- Domain parser rerun (37 files, 55 nodes): all 17 expected words still at the root (creature 178, speed 67, centaur 25,
  roll 15, dice 14, hoard 11, lair 8, treasure 8, damage 8, stable 4, dungeon 3, cellar 2, initiative 2, encounter 2, armor
  45, hit 43, points 43). New identifiers add `occupant(9)`, `trace(9)`, `mapper(6)` and the class-name words `ledger,
  herd, inspector, describer, lookup, safe` (3 each) - `herd`/`ledger` are domain-ish, `mapper/inspector/describer/lookup`
  are technical and not on the stop list. `hpp` grows 52 -> 65 with the new include paths (round-1 wrong #4 unchanged).
  No round-1 domain finding changes.

## Verdict

- Good: no false positive edge in round 1; std/boost/spdlog/gtest never leak; inheritance, generic base, `using namespace`,
  template arguments (`std::map<SpeedType, Speed>`, `std::vector<Centaur>`), instantiation, type positions and
  member-initializer static access all resolve; cycles and upward edges are flagged as expected; test directory skipped by
  default. Round 2 adds: a forward declaration is harmless (no duplicate leaf) and the pointer member resolves; `friend
  class X;` alone is an edge; `static_cast`/`dynamic_cast` inside a body are edges; a member under `#ifdef` is seen.
  Domain parser: all 17 words at the root (also after round 2), no keyword leakage, every planted comment/string counted
  with visible weights, all identifier forms split (except the `rollD20` digit case), `--exclude-tests` works.
- Wrong (most important first):
  1. Relative namespace qualifiers are ignored and same-named types are picked by substring accident (round 2 sharpens
     round 1): in namespace `application` every `domain::model::Creature` resolves to `application.dto.Creature`
     (`CentaurInspector.hpp`, `CreatureDescriber.hpp`, `SafeCreatureLookup.hpp` -> `dto/Creature.hpp`, three false
     positives), while `CreatureFacade` gets `domain.model.Creature` only because a fully qualified
     `de::sots::cellarsandcentaurs::domain::model::Speed` in the same declaration registers a rooted wildcard; its own
     `dto::Creature` uses stay unresolved (`dto.Creature` had 0 incoming in round 1). Only rooted names (`using
     de::sots::…::Creature;`, a fully qualified reference, `using namespace de::sots::…`) resolve reliably.
  2. hpp/cpp collapse: `Creature.hpp`, `ArmorClass.hpp`, `CreatureService.hpp`, `CreatureFacade.hpp`, `PersistedCreatures.hpp`
     are 0/0 nodes; all their edges are credited to the `.cpp` (e.g. `Creature.cpp -> Fightable.hpp` for an inheritance written
     in the header). Defensible as "one declaration = one unit", but the header files are dead weight on the map.
  3. Files without an own declaration vanish from the file tree entirely: `Application.hpp` (umbrella header, round 1) and
     `CentaurRepository.hpp` (holds only `template <> class Repository<Centaur>`, round 2).
  4. `SpeedMapper.hpp`: `namespace model = …; model::Speed` resolves only because `model` is a substring of the target
     path; the namespace alias itself is not understood (`namespace fullmodel = …` gives nothing).
  5. Domain parser: `#include` paths are counted as strings -> `hpp(65)` is the 4th most frequent word, `model/domain/sots/
     cellarsandcentaurs/memory` leak.
  6. `--comment-weight 0` / `--string-weight 0` (as suggested in the README) abort with a stack trace instead of disabling the source.
  7. `rollD20` splits to `roll, 20` while `d20Roll` splits to `d20, roll`.
- Missing:
  1. `PersistedCreatures.cpp`: `application::CreatureFacade::STANDARD_CREATURE_TYPE` inside `find()` and `CreatureFacade.cpp`:
     `domain::model::HitPoints::init(...)` inside `create()` - static member access / static call in a function body gives no edge
     (the identical access in a member-initializer list does).
  2. Aliases: `CreatureRepository.hpp`: `using Entity = CreatureEntity;` and `EntityMapper.hpp`: `typedef CreatureEntity Entity;`
     - alias declarations are invisible and `Entity` is not resolved, so `CreatureRepository -> CreatureEntity` and
     `EntityMapper -> CreatureEntity` are missing.
  3. `Dice.hpp` / `Creature.cpp`: the free function `rollD20` is no leaf and its call produces no `Creature -> Dice` edge;
     free functions in general yield nothing (and therefore the gtest `TEST` bodies contribute nothing, so with
     `--include-tests` the edge `CreatureServiceTest -> CreatureService` is missing).
  4. `SafeCreatureLookup.hpp`: a type used only as `catch (const NoSuchCreatureException&)` parameter gives no edge
     (a `throw` of the same type in a body does).
  5. `CentaurRepository.hpp`: an explicit template specialization `template <> class Repository<Centaur>` is neither a leaf
     nor a usage: no edge to `Repository.hpp` or `Centaur.hpp` (and the file is dropped, see wrong #3).
  6. Name-based test detection for C++ (`*Test.cpp`, `*_test.cpp`); only the `test/` directory is recognised.
  7. Domain parser: the gtest test name `should_save_creature_to_the_stable` (macro argument) is not extracted.
  8. Language limitation, not a parser bug: no type-carrying attribute, no module re-export, no interface keyword.

## Appendix: expected file-level edges (written before the first run)

Paths relative to `src/de/sots/cellarsandcentaurs/` unless prefixed with `test/`.

- domain/model/Creature.hpp -> Fightable.hpp, CreatureId.hpp, CreatureType.hpp, ArmorClass.hpp, SpeedType.hpp, Speed.hpp, HitPoints.hpp
- domain/model/Creature.cpp -> Creature.hpp, Dice.hpp, application/Application.hpp, application/CreatureFacade.hpp (static member), CreatureId.hpp, CreatureType.hpp
- domain/model/Centaur.hpp -> Creature.hpp, Speed.hpp, CreatureId.hpp, CreatureType.hpp
- domain/model/ArmorClass.cpp -> ArmorClass.hpp, application/Application.hpp, application/CreatureUtil.hpp (static member)
- domain/model/NoSuchCreatureException.hpp -> CreatureId.hpp
- domain/model/Dice.hpp -> (none)
- domain/service/Creatures.hpp -> Creature.hpp, CreatureId.hpp
- domain/service/CreatureService.hpp -> Creatures.hpp, Creature.hpp, CreatureId.hpp
- domain/service/CreatureService.cpp -> CreatureService.hpp, Creatures.hpp, Creature.hpp, CreatureId.hpp
- adapter/persistence/CreatureRepository.hpp -> CreatureEntity.hpp (alias `Entity`), Repository.hpp (generic base)
- adapter/persistence/PersistedCreatures.hpp -> Creatures.hpp (implements), Creature.hpp, CreatureId.hpp, CreatureRepository.hpp
- adapter/persistence/PersistedCreatures.cpp -> PersistedCreatures.hpp, CreatureRepository.hpp, CreatureEntity.hpp, Creature.hpp, CreatureId.hpp, NoSuchCreatureException.hpp, application/Application.hpp, application/CreatureFacade.hpp (static member)
- application/CreatureUtil.hpp -> Creature.hpp, HitPoints.hpp (Fightable.hpp is included but unused: ideally no edge)
- application/CreatureFacade.hpp -> ArmorClass.hpp, Creature.hpp, CreatureType.hpp, Speed.hpp, CreatureService.hpp, dto/Creature.hpp
- application/CreatureFacade.cpp -> CreatureFacade.hpp, Creature.hpp, CreatureId.hpp, CreatureType.hpp, Speed.hpp, SpeedType.hpp, ArmorClass.hpp, HitPoints.hpp, CreatureService.hpp, dto/Creature.hpp
- application/Application.hpp -> CreatureFacade.hpp, CreatureUtil.hpp (umbrella header = barrel)
- test/.../CreatureServiceTest.cpp -> CreatureService.hpp, Creatures.hpp, Creature.hpp, CreatureId.hpp, CreatureType.hpp, Speed.hpp, SpeedType.hpp, NoSuchCreatureException.hpp (only with --include-tests)

Expected upward edges: Creature.cpp, ArmorClass.cpp and PersistedCreatures.cpp -> application/*.
Expected cycle (declaration level): Creature -> CreatureFacade -> CreatureService -> Creature; at file level it only closes if the
parser treats Creature.hpp and Creature.cpp as one unit.
No internal edge expected for: std::*, boost::uuids::*, spdlog::*, gtest.

Counting the expectation against the result (checked by script): 64 distinct (from, to) pairs were expected on the
header/source level; after folding each hpp/cpp pair onto its `.cpp` (the parser's model) and dropping the 5 edges of the
declaration-less `Application.hpp`, 40 pairs remain. 35 file edges were reported, all 35 are in the expected set (0 extra),
5 are missing: `CreatureRepository.hpp -> CreatureEntity.hpp` (alias), `PersistedCreatures.cpp -> CreatureFacade.cpp` and
`CreatureFacade.cpp -> HitPoints.hpp` (static access in a function body), `CreatureFacade.cpp -> dto/Creature.hpp` (same
simple name) and `Creature.cpp -> Dice.hpp` (free-function call).

### Round 2 additions to the expected file-level edges (written before the round-2 run)

Every form lives in a new header-only file so that the form is the only path from that file to its target (`#include`s
are neutral, see #9: an include alone never yields an edge). Paths as above.

- domain/model/Lair.hpp -> Creature.hpp (forward declaration `class Creature;`, `Creature*` member, no include)
- application/CreatureDescriber.hpp -> domain/model/Creature.hpp (using-declaration `using domain::model::Creature;`, then unqualified `Creature`)
- adapter/persistence/SpeedMapper.hpp -> domain/model/Speed.hpp (namespace alias `namespace model = de::sots::cellarsandcentaurs::domain::model;`, then `model::Speed`)
- adapter/persistence/EntityMapper.hpp -> CreatureEntity.hpp (`typedef CreatureEntity Entity;`, then `Entity` in a signature)
- application/TreasureLedger.hpp -> application/CreatureUtil.hpp (`friend class CreatureUtil;`, nothing else)
- application/CentaurInspector.hpp -> domain/model/Centaur.hpp (`dynamic_cast<const Centaur*>` / `static_cast<Centaur*>` only); also -> Creature.hpp (parameter type, not a new form)
- domain/service/CentaurHerd.hpp -> domain/model/Centaur.hpp (`std::vector<model::Centaur>` member only)
- application/SafeCreatureLookup.hpp -> domain/model/NoSuchCreatureException.hpp (`catch (const NoSuchCreatureException&)` only); also -> Creature.hpp, CreatureId.hpp, domain/service/CreatureService.hpp (signature types, not new forms)
- application/CreatureTrace.hpp -> domain/model/Dice.hpp (`#include` and a `Dice` member both under `#ifdef CELLARS_TRACE_ROLLS`)
- adapter/persistence/CentaurRepository.hpp -> Repository.hpp and -> domain/model/Centaur.hpp (`template <> class Repository<domain::model::Centaur>`; the file name differs from the declaration, and the leaf key collides with the primary template's)

No new cycle and no new upward edge is expected. No round-1 edge should change; the one open risk is the duplicate leaf key
`adapter.persistence.Repository` (primary template plus specialization), which could move the `Repository` leaf or the
`CreatureRepository -> Repository` edge, and the forward declaration in `Lair.hpp`, which could be taken for a second
`domain.model.Creature` declaration.
