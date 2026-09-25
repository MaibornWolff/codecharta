# Objective-C

## Project
- Layout: Xcode-style target folder `CellarsAndCentaurs/` with `Domain/Model`, `Domain/Service`, `Adapter/Persistence`,
  `Application`, `Application/DTO`, plus the test target folder `CellarsAndCentaursTests/`. No namespaces exist in
  Objective-C, so the root namespace `de.sots.cellarsandcentaurs` is only reflected by the folder layout.
- 38 files: 19 `.h/.m` pairs minus header-only enums/protocols/umbrella (`CreatureType.h`, `SpeedType.h`, `Fightable.h`,
  `Creatures.h`, `CellarsAndCentaurs.h`) plus one test file. The pair convention roughly doubles the file count of the
  other languages; every file is small.
- All declarations of the shared model exist: `Creature <Fightable>`, `CreatureId`, `CreatureType` (NS_ENUM),
  `ArmorClass`, `HitPoints`, `Speed`, `SpeedType` (NS_ENUM), `Fightable` (@protocol), `NoSuchCreatureException`
  (NSException subclass in `CreatureErrors.h/.m`, the file whose name differs from its declaration), `Centaur : Creature`,
  `Dice.h/.m` with `Dice`, `DiceRoll` and the free C function `rollD20()`, `Creatures` (@protocol), `CreatureService`,
  `CreatureEntity`, `Repository<__covariant ObjectType>` (lightweight generics), `CreatureRepository : Repository<CreatureEntity *>`,
  `PersistedCreatures <Creatures>`, `CreatureFacade`, `CreatureUtil` (+ category `Creature (Treasure)` in the same file),
  umbrella header `CellarsAndCentaurs.h` as barrel, DTO `Creature` in `Application/DTO/Creature.h`.
- Stress constructs and what Objective-C offers:

| # | Construct | Objective-C | Where |
| --- | --- | --- | --- |
| 1 | Aliased import | no import alias; closest is `@compatibility_alias Entity CreatureEntity;` | `CreatureRepository.m` |
| 2 | Wildcard import | none; closest are the module import `@import Foundation;` and the umbrella header | `CreatureUtil.m`, `CellarsAndCentaurs.h` |
| 3 | Barrel / re-export | umbrella header `CellarsAndCentaurs.h`; imported upward by `Creature.m`, `ArmorClass.m`, `PersistedCreatures.m` | `Application/` |
| 4 | Inheritance / protocol | `Centaur : Creature`, `Creature : NSObject <Fightable>`, `PersistedCreatures : NSObject <Creatures>` | model, persistence |
| 5 | Generic base | `Repository<__covariant ObjectType>`, `Repository<CreatureEntity *>` | persistence |
| 6 | Type position only / new only / static only / annotation | `Speed *` params; `[[CreatureEntity alloc] init...]`; `CreatureFacade.standardCreatureType` (class property); **no annotations** in the language (`__attribute__`/`NS_SWIFT_NAME` carry no type reference) | facade, persistence |
| 7 | Same simple name in two packages | **not really possible**: two `@interface Creature` clash at link time (no namespaces, prefixes are the idiom). Written anyway as `Application/DTO/Creature.h` with `typedef Creature CreatureDTO;`, referenced via `#import "DTO/Creature.h"` | `CreatureFacade.m` |
| 8 | Fully qualified reference without import | **no such construct** | - |
| 9 | Unused import | `#import "Fightable.h"` | `CreatureUtil.m` |
| 10 | Stdlib / third party | `NSUUID`, `NSDictionary`, `NSMutableArray`, `NSLog`, `<CocoaLumberjack/CocoaLumberjack.h>` (`DDLogInfo`), `<XCTest/XCTest.h>`, `<OCMock/OCMock.h>` | service, facade, test |
| 11 | Test file | XCTest `CreatureServiceTests.m` in `CellarsAndCentaursTests/` with `test_should_save_creature_to_the_stable` | tests |
| 12 | Multiple declarations per file / different file name | `Dice.h/.m` (Dice, DiceRoll, rollD20), `CreatureUtil.h/.m` (class + category), `CreatureErrors.h/.m` holds `NoSuchCreatureException` | model, application |
| + | ObjC specific | `@class` forward declarations, class extensions `@interface X ()`, category, `@synthesize`, `#pragma mark`, `NS_ASSUME_NONNULL_BEGIN/END`, `@throw` | throughout |

## Dependency parser
- Not applicable: `dependencyparser` has no Objective-C support (README table: php, csharp, typescript, javascript, java, go,
  python, c/cpp, kotlin, vue, delphi, rust). Not run. It would need the extensions `.h` (shared with C, so the parser
  would have to sniff `@interface`/`@import` to choose the ObjC grammar) and `.m` (`.mm` for Objective-C++).
- What it would have to resolve itself: Objective-C has no module or namespace system. `#import "X.h"` is resolved by
  header search paths, not by relative paths, so `#import "Creature.h"` from `CreatureFacade.m` can name the domain
  `Creature.h` or the `DTO/Creature.h`. `@class X;` forward declarations and protocol conformance `<Fightable>` create
  declaration-level dependencies without an import in the same file (the import lives in the `.m`). The `.h/.m` split
  means every class produces two files with an `.m -> .h` self edge.
- Expected file-level edge list (written before any run, from `#import "..."`; `@class` forward references in brackets),
  kept here so a future ObjC-capable dependency parser can be judged against it:
  - Domain/Model/CreatureId.m -> CreatureId.h
  - Domain/Model/ArmorClass.m -> ArmorClass.h, Application/CellarsAndCentaurs.h (upward)
  - Domain/Model/HitPoints.m -> HitPoints.h
  - Domain/Model/Speed.m -> Speed.h
  - Domain/Model/Creature.h -> Fightable.h, CreatureType.h, SpeedType.h [CreatureId, ArmorClass, HitPoints, Speed]
  - Domain/Model/Creature.m -> Creature.h, CreatureId.h, ArmorClass.h, HitPoints.h, Speed.h, Dice.h, Application/CellarsAndCentaurs.h (upward, cycle)
  - Domain/Model/Centaur.h -> Creature.h
  - Domain/Model/Centaur.m -> Centaur.h, CreatureId.h, Speed.h
  - Domain/Model/Dice.m -> Dice.h
  - Domain/Model/CreatureErrors.h -> [CreatureId]
  - Domain/Model/CreatureErrors.m -> CreatureErrors.h, CreatureId.h
  - Domain/Service/Creatures.h -> [Creature, CreatureId]
  - Domain/Service/CreatureService.h -> Creatures.h [Creature]
  - Domain/Service/CreatureService.m -> CreatureService.h, Domain/Model/Creature.h
  - Adapter/Persistence/CreatureEntity.m -> CreatureEntity.h
  - Adapter/Persistence/Repository.m -> Repository.h
  - Adapter/Persistence/CreatureRepository.h -> Repository.h, CreatureEntity.h
  - Adapter/Persistence/CreatureRepository.m -> CreatureRepository.h (alias Entity = CreatureEntity)
  - Adapter/Persistence/PersistedCreatures.h -> Domain/Service/Creatures.h [CreatureRepository]
  - Adapter/Persistence/PersistedCreatures.m -> PersistedCreatures.h, CreatureRepository.h, CreatureEntity.h, Creature.h, CreatureId.h, CreatureErrors.h, Application/CellarsAndCentaurs.h (upward)
  - Application/CellarsAndCentaurs.h -> CreatureFacade.h, CreatureUtil.h
  - Application/CreatureFacade.h -> Domain/Model/CreatureType.h [CreatureService, Creature, Speed, ArmorClass]
  - Application/CreatureFacade.m -> CreatureFacade.h, CreatureService.h, Creature.h, CreatureId.h, HitPoints.h, Speed.h, SpeedType.h, ArmorClass.h, DTO/Creature.h
  - Application/CreatureUtil.h -> Domain/Model/Creature.h
  - Application/CreatureUtil.m -> CreatureUtil.h, Fightable.h (unused)
  - Application/DTO/Creature.m -> DTO/Creature.h
  - CellarsAndCentaursTests/CreatureServiceTests.m -> CreatureService.h, Creature.h, CreatureId.h, Speed.h
  - Cycles: Creature.m -> CellarsAndCentaurs.h -> CreatureFacade.h -> Creature.h (via CreatureFacade.m) and -> CreatureUtil.h -> Creature.h
  - Must not be internal edges: Foundation, XCTest, OCMock, CocoaLumberjack, NSUUID, NSDictionary, NSMutableArray, NSLog
  - Round 2 additions (one row per added form, written before the run; the `.pch` makes every model header visible in
    every `.m` of the target, so the two "only via" rows below carry no `#import` for their target at all):
    - Domain/Model/ArmorClass.m -> Domain/Model/CreatureLimits.h (`#include "CreatureLimits.h"`, the only `#include` of an own header)
    - Domain/Service/CreatureCensus.h -> none for `@import Foundation;` (module import of a system framework, must not be an internal edge)
    - Adapter/Persistence/EntityAlias.h -> CreatureEntity.h (`#import` + `@compatibility_alias Entity CreatureEntity;`)
    - Adapter/Persistence/EntityArchive.h -> EntityAlias.h (`#import`) and [CreatureEntity] only through the alias `Entity *`
    - Adapter/Persistence/EntityArchive.m -> EntityArchive.h, [CreatureEntity] only through `Entity *`
    - Application/CreatureClassifier.h -> [Creature] (`@class Creature;`)
    - Application/CreatureClassifier.m -> CreatureClassifier.h, Domain/Model/Centaur.h only via `[Centaur class]` / `isKindOfClass:` (no import, visible through the `.pch`)
    - Adapter/Persistence/CreatureEntity+Fightable.h -> CreatureEntity.h (`#import`), Domain/Model/Fightable.h only via the category conformance `<Fightable>` (no import, visible through the `.pch`)
    - Adapter/Persistence/CreatureEntity+Fightable.m -> CreatureEntity+Fightable.h
    - Domain/Service/CreatureCensus.h -> [Creatures.h] only via the forward `@protocol Creatures;`
    - Domain/Service/CreatureCensus.m -> CreatureCensus.h, Creatures.h
    - CellarsAndCentaurs-Prefix.pch -> Fightable.h, CreatureType.h, SpeedType.h, CreatureId.h, ArmorClass.h, HitPoints.h, Speed.h, Creature.h, Centaur.h, Dice.h, CreatureErrors.h
      (and implicitly every `.m` of the target -> the `.pch`; that edge is a build setting, not visible in any source file)

## Domain language parser
- Commands (all exit 0, 38 files processed, 48 nodes, output in `output/`):
  - `ccsh domainlanguageparser -nc $LANG_DIR -e "output,FINDINGS.md" -o output/domain.cc.json` (default)
  - `--exclude-tests` -> `domain-exclude-tests.cc.json`; `--stop-word-level MINIMAL` / `AGGRESSIVE` -> `domain-minimal.cc.json` / `domain-aggressive.cc.json`
  - `--comment-weight 100` / `--string-weight 100` -> `domain-comments-x100.cc.json` / `domain-strings-x100.cc.json`
  - `--comment-weight 0` and `--string-weight 0` (as suggested in the README) are **rejected**:
    `IllegalArgumentException: --comment-weight must be positive, got 0` (exit 1). The inflated weights were used instead.
- Structural finding first, because it explains most of the rest: **`.h` files are parsed as C** (`Language.C` owns
  `c` and `h`, the tree-sitter C grammar and `c-keywords.txt`), only `.m`/`.mm` use the Objective-C grammar and
  `objc-keywords.txt`. In Objective-C the header carries the `@interface`, the properties, the method signatures and the
  doc comments, so half of the project goes through error recovery of the wrong grammar. Effects seen:
  - `@interface`, `@end`, `@protocol` are counted as identifiers in every header: `interface(45)`, `end(51)`,
    `protocol(6)` at the root. In `.m` files the same tokens are filtered by the ObjC keyword list.
  - `NS_ASSUME_NONNULL_END` is split into `ns(51)`, `assume(51)`, `nonnull(51)` (weight 3 each, once per header); it is a
    listed ObjC keyword but headers use the C list. (`NS_ASSUME_NONNULL_BEGIN` is swallowed by the error node, `begin` never appears.)
  - Method declarations in headers are lost: `Creature.h` yields no `init`, `speedOfType`, `Speed *`; `Fightable.h` does
    not even yield `fightable` (only `protocol`, `ns`, `assume`, `nonnull`, `end`); `Centaur.h` yields only `centaur`
    (no `XPValue`, no `canCharge`); `Dice.h` counts one of its two `@interface`s (`dice(3)`, `roll(3)`).
  - `NS_ENUM` bodies lose all but the first constant: `CreatureType.h` -> `creature, monstrosity, type`; beast, aberration,
    celestial, dragon, fiend, humanoid, undead never appear anywhere. `SpeedType.h` -> `walking` only.
  - What headers do yield: `@class X` forward declarations, typed `@property` names that happen to parse as C
    declarations (`ArmorClass *armorClass`), `#define MAX_HIT_POINTS` (preproc parsed correctly), free C functions
    (`NSInteger rollD20(void)` -> `ns`, `integer`, `roll`, `d20`) and doc comments (both planted ones were counted).
  - Inconsistent keyword handling of `id`: `CreatureId` gives `id(3)` in every header (C list has no `id`) but nothing
    in `CreatureId.m` (ObjC list drops the `id` half of the split identifier). Root shows `id(15)`, all from headers.
- Expected words at the root node (default run, 96 words at the root): all 17 present.

| word | frequency | main sources |
| --- | --- | --- |
| creature | 192 | identifiers everywhere, plus 28 string hits from `#import "Creature*.h"` (see strings) |
| speed | 57 | identifiers, 6 import strings |
| armor | 39 | `ArmorClass`, `armorClass`, comment, `@"Natural Armor"` |
| hit | 34 | `HitPoints`, `hitPoints`, `MAX_HIT_POINTS`, comments |
| points | 34 | same |
| roll | 18 | `rollD20`, `roll`, `DiceRoll`, `rollInitiative` |
| centaur | 12 | `Centaur`, `CentaurChargeThreshold`, `@"centaur-stable"`, `@"centaur-1"` |
| damage | 11 | `takeDamage:damage`, `loseHitPoints:damage`, comment |
| dice | 11 | `Dice`, `DiceRoll`, import string |
| initiative | 11 | `initiative` property, `rollInitiative`, comment |
| treasure | 11 | `treasureHoardOf`, `treasureHoardValue`, category `Treasure`, comment |
| hoard | 8 | same |
| stable | 7 | test method name (3), `CreatureFacadeStableName` (3), `@"centaur-stable"` (1) |
| dungeon | 3 | facade line comment (2) + exception string (1) |
| cellar | 2 | `Creature.h` doc comment only |
| lair | 2 | `HitPoints.h` doc comment only |
| encounter | 2 | facade line comment only |

- Keyword leakage at the root (default run): `interface(45)`, `end(51)`, `protocol(6)`, `ns(54)`, `assume(51)`,
  `nonnull(51)`, `id(15)`, `integer(3)` - all from headers parsed as C, **wrong** for the language. No leakage of
  `property`, `nonatomic`, `strong`, `copy` (the 3 hits are `copyWithZone`), `readonly`, `assign`, `self`, `super`,
  `nil`, `instancetype`, `void`, `bool`, `string`, `static`, `const`, `return`, `import`, `typedef`, `enum` - right.
  `class(20)` is entirely `ArmorClass`/`armorClass`, `@class` itself is not counted - right.
- Technical-word leakage at MODERATE: filtered correctly: `util`, `exception`, `service`, `test`, `mock` (english
  stop list), `save`, `find`, `create`, `base`, `set`. Leaking: `repository(27)`, `entity(17)`, `facade(10)`, `dto(7)`,
  `init(45)`, `persisted(10)`, `identifier(21)`, `value(21)`, `description(18)`, `type(28)`, `result(9)`, `standard(9)`,
  `object(6)`, `zone(6)`, `hash(3)`, `equal(3)`, `storage(3)`, `all(8)` (`findAll`), `one(3)` (`findOne`), `up(3)`
  (`setUp`), `such(14)`, `dd(3)`/`level(3)` (CocoaLumberjack `DDLogLevel`), `ididid(1)`, `errors(2)`, `cellars(3)`/`centaurs(5)`
  (from the import path `CellarsAndCentaurs.h`, see strings). Of these `repository`, `entity`, `facade`, `dto`, `init`,
  `result`, `type`, `value` are on the AGGRESSIVE list, so their presence at MODERATE is the configured behaviour, not
  a bug; `init`, `zone`, `hash`, `equal`, `object`, `description` are NSObject vocabulary that every ObjC project
  emits and would deserve a place on the ObjC keyword list.
- `--stop-word-level MINIMAL` adds back `service(33)`, `exception(16)`, `save(15)`, `find(12)`, `base(12)`, `create(3)`,
  `set(3)`; `AGGRESSIVE` additionally removes `init`, `repository`, `type`, `entity`, `facade`, `value`, `result`, `dto`;
  neither level touches the header keyword leakage above.
- Identifier splitting:

| form | identifier | where | words found |
| --- | --- | --- | --- |
| camelCase | `walkingSpeed` | `CreatureFacade.m` selector/param | `walking(3)`, `speed` - ok (counted once, not for both the selector label and the parameter name) |
| camelCase | `walkingSpeed` | `Centaur.m` local variable | **not counted**: local variables inside method bodies are not extracted from `.m` files |
| snake_case | `should_save_creature_to_the_stable` | test method | `creature`, `stable(3)` - ok (`should`, `to`, `the` english, `save`, `test` technical) |
| snake_case | `walking_speed` | test local variable | **not counted** (local variable, same as above) |
| SCREAMING_SNAKE | `MAX_HIT_POINTS` | `HitPoints.h` `#define` | `max`, `hit`, `points` - ok |
| PascalCase | `ArmorClass` | everywhere | `armor`, `class` - ok |
| Acronym | `XPValue` | `Centaur.m` method | `xp(3)`, `value(3)` - ok; the property in `Centaur.h` is lost (header) |
| Digit | `d20Roll` / `rollD20` | `Dice.m` | `d20(3)` from the function name `rollD20`; the local `d20Roll` not counted |
| Kebab in string | `@"centaur-stable"` | `CreatureFacade.m` | `centaur(1)`, `stable(1)` - ok |

  General pattern in `.m` files: names of classes, categories, class extensions, properties, method selectors and
  parameters, static constants and free functions are counted; references in expressions, enum constants used in
  literals (`SpeedTypeWalking`) and local variable declarations are not.
- Comments: all four planted sentences are counted with weight 2 (`cellar`, `beasts`, `dragons`, `roams`, `share` from
  `Creature.h`; `lair`, `rests`, `recover`, `drop` from `HitPoints.h`; `dungeon`, `encounter`, `initiative`, `rolls`,
  `starts`, `before`, `every` from `CreatureFacade.m`; `counts`, `guards`, `treasure`, `hoard` from `CreatureUtil.m`).
  `--comment-weight 100` moves exactly these to +98 each, so the weight is visible. Also `// Assert` in the test counts
  as `assert(2)` (`arrange`/`act` are english stop words). Doc comments survive even in headers parsed as C.
- Strings: planted strings are counted with weight 1 (`such`, `creature`, `dungeon` from the exception string;
  `centaur`, `stable` from `@"centaur-stable"`; `natural`, `armor`; `ididid`; `stabled`, `saving` from log formats).
  **Wrong**: in `.m` files every `#import "X.h"` path is counted as a string literal too, weight 1 per import. With
  `--string-weight 100` `creature` rises from 192 to 2964 (28 string hits, 24 of them import paths), `speed` 57 -> 651,
  `armor` 39 -> 435, `repository` 27 -> 324, `cellars`/`centaurs` 3/5 -> 300/302 - the umbrella header name becomes a
  top-10 word. Headers do not show this (the C grammar does not know `#import`), so the effect is `.m`-only.
- Test file: `CellarsAndCentaursTests/CreatureServiceTests.m` is included by default (right) and **still included with
  `--exclude-tests`** (wrong): `TestFileDetector` knows the `Test`/`Tests` suffix only for kt/java/cs/php and matches
  directories only when they are literally `test`/`tests`/`spec`; the Xcode convention `<Target>Tests/*Tests.m`
  matches neither. Its words (`creature(15)`, `stable(3)`, `up(3)`, `assert(2)`) stay in the root in both runs.

## Round 2: additional dependency forms
- Added 11 files and one additive edit (`ArmorClass.h/.m` gained `isWithinLimits`); no round-1 construct, comment, string
  or identifier was changed. `CellarsAndCentaurs/CellarsAndCentaurs-Prefix.pch` imports the eleven model headers, so
  in a real Xcode build every `.m` of the target sees `Creature`, `Centaur`, `Fightable`, ... without an import; two of
  the forms below rely on that to be the only route to their target.
- Rerun: `ccsh domainlanguageparser -nc $LANG_DIR -e "output,FINDINGS.md" -o output/domain.cc.json` exit 0,
  **48 files processed, 58 nodes** (round 1: 38 / 48). The 49th file, the `.pch`, is not picked up at all (extension unknown
  to the language mapping), so there is no node for it. Nothing found by a dependency parser: none exists for Objective-C,
  the table records the expected edges for a future one.

| form | file(s) | expected edge | found | note |
| --- | --- | --- | --- | --- |
| `#include` of an own header | `Domain/Model/CreatureLimits.h` (new, plain C `#define`s with include guard), `ArmorClass.m` | ArmorClass.m -> CreatureLimits.h | n/a (no ObjC dependency parser) | domain parser: the `#include "CreatureLimits.h"` path is counted as a string like `#import` (`creature(1)`, `limits` +1 in `ArmorClass.m`); the header itself yields `armor, class, creature, limits, max, min` from the macros and the guard |
| `@import Foundation;` module import | `Domain/Service/CreatureCensus.h` (new; the only Foundation import of that file) | none (system module, must not be an internal edge) | n/a | domain parser: in the header (C grammar) `Foundation` leaks as `foundation(3)`; the same statement in `CreatureUtil.m` (ObjC grammar) yields nothing, confirmed with a probe file that also tried `@import CellarsAndCentaurs;` - an own-module import would be invisible in `.m` files |
| `@compatibility_alias Entity CreatureEntity;` | `Adapter/Persistence/EntityAlias.h` (new, alias next to its `#import`), consumer `EntityArchive.h/.m` (new, uses only `Entity *`) | EntityAlias.h -> CreatureEntity.h; EntityArchive.h -> EntityAlias.h; EntityArchive.h/.m -> CreatureEntity only via the alias | n/a | domain parser: `EntityAlias.h` yields `creature(3), entity(3)` (one of the two names, header parsed as C); `EntityArchive.h` yields only the `NS_ASSUME_NONNULL` fragments plus `interface` - the class name and the `NSArray<Entity *>` property are lost; a probe `.m` shows the alias statement itself and an `Entity *` parameter type count nothing |
| class used only via `[Centaur class]` / `isKindOfClass:` | `Application/CreatureClassifier.h/.m` (new; no `#import "Centaur.h"`, `Centaur` visible through the `.pch`) | CreatureClassifier.m -> Centaur.h (only via the class reference) | n/a | domain parser: `centaur(3)` in `CreatureClassifier.m` comes from the selector `isCentaur:`, not from `[Centaur class]` - a probe file with only `[thing isKindOfClass:[Centaur class]]` yields no `centaur` and no `class`; class references in expressions are invisible, as in round 1 |
| class used only in a protocol conformance `<Fightable>` in a category | `Adapter/Persistence/CreatureEntity+Fightable.h/.m` (new; `@interface CreatureEntity (Fightable) <Fightable>`, no `#import "Fightable.h"`, visible through the `.pch`) | CreatureEntity+Fightable.h -> Fightable.h (only via `<Fightable>`); CreatureEntity+Fightable.h -> CreatureEntity.h (`#import`) | n/a | domain parser: the header yields only `assume, end, nonnull, ns` - category name, conformance and the `storedHitPoints` property are all lost; the `.m` yields `fightable(4)` (category name 3 + the import path `CreatureEntity+Fightable.h` as string 1), `damage, hit, points, initiative, roll, stored, take` |
| forward `@protocol Creatures;` | `Domain/Service/CreatureCensus.h/.m` (new; the header only forward-declares, the `.m` imports `Creatures.h`) | CreatureCensus.h -> [Creatures.h] (declaration-level, like the `@class` brackets); CreatureCensus.m -> Creatures.h | n/a | domain parser: the header yields `creatures(3)` from the forward declaration plus `census, creature` from the interface name - same behaviour as `@class` in round 1 |
| `.pch` prefix header importing the model headers | `CellarsAndCentaurs/CellarsAndCentaurs-Prefix.pch` (new; `#ifdef __OBJC__` + 11 `#import "..."`) | pch -> Fightable.h, CreatureType.h, SpeedType.h, CreatureId.h, ArmorClass.h, HitPoints.h, Speed.h, Creature.h, Centaur.h, Dice.h, CreatureErrors.h; implicitly every `.m` -> pch | n/a | domain parser: **file skipped entirely** (48 of 49 files processed, no node); a dependency parser would have to map `.pch` to the C/ObjC grammar and know from the build settings which targets it applies to |

- Domain parser output for the added files: no word was lost in any of the 38 round-1 files (37 unchanged, `ArmorClass.m`
  gained `limits(4)`, `within(3)`, `creature(1)`; `ArmorClass.h` is unchanged although it gained a method declaration -
  header method declarations are still lost). New leaks at the root: `foundation(3)` (from the header `@import`), `min(3)`,
  `within(3)`, `kind(3)`, `stored(3)`, `archived(3)`, and the new names `archive(10)`, `census(10)`, `limits(10)`,
  `classifier(7)`, `headcount(3)`, `entities(6)`; `entity` 17 -> 34, `creatures` 22 -> 35, `fightable` 1 -> 5, `centaur` 12 -> 15.

## Verdict
- Good: parser ran without error on all 38 files; all 17 expected words reach the root; planted comments and strings
  are counted with the documented weights; camelCase, snake_case, SCREAMING_SNAKE, PascalCase, acronym, digit and
  kebab-in-string splitting all work on declarations; ObjC keywords and Foundation types (`NSString`, `self`,
  `instancetype`, `nonatomic`, ...) do not leak from `.m` files; `util`, `exception`, `service`, `test`, `mock`, `save`,
  `find` are filtered at MODERATE.
- Wrong:
  1. `.h` is mapped to `Language.C`, so every Objective-C header is parsed with the C grammar and C keyword list:
     `interface(45)`, `end(51)`, `protocol(6)`, `ns(54)`, `assume(51)`, `nonnull(51)`, `id(15)`, `integer(3)` at the root
     (`Fightable.h`, `Creature.h`, every header); the 2 top-10 words after `creature`/`speed` are macro fragments.
  2. Because of 1, header declarations are mostly lost: method signatures in all headers, the protocol name in
     `Fightable.h`, `XPValue`/`canCharge` in `Centaur.h`, one of two interfaces in `Dice.h`, and every `NS_ENUM` constant
     after the first (`CreatureType.h` keeps only `monstrosity`, `SpeedType.h` only `walking`).
  3. `#import "X.h"` paths in `.m` files are counted as string literals (`CellarsAndCentaurs.h` -> `cellars(3)`,
     `centaurs(5)`; 24 of the 28 string hits of `creature` are imports).
  4. `--exclude-tests` does not recognise `CellarsAndCentaursTests/CreatureServiceTests.m` (XCTest naming convention).
  5. `--comment-weight 0` / `--string-weight 0` are refused although the README proposes them; there is no way to switch
     a source off, only to make it cheap.
  6. `id` is dropped from `CreatureId` in `.m` files but kept in `.h` files - the same identifier counts differently
     per file kind.
  7. (round 2) `CellarsAndCentaurs-Prefix.pch` is skipped entirely - the `.pch` extension is not mapped to any language,
     so a prefix header that imports eleven model headers produces no node and no words.
  8. (round 2) `@import Foundation;` leaks `foundation(3)` from `CreatureCensus.h` (C grammar) while the same statement in
     `CreatureUtil.m` (ObjC grammar) is filtered - another header/implementation inconsistency; `#include "..."` paths are
     counted as strings in `.m` files just like `#import "..."` (`ArmorClass.m`).
- Missing:
  - Local variables and expression-level identifiers in `.m` bodies (`walkingSpeed` in `Centaur.m`, `d20Roll` in `Dice.m`,
    `walking_speed` in the test) are not extracted, so the snake_case local variable form could only be judged on the
    method name.
  - NSObject vocabulary (`init`, `copy`, `zone`, `hash`, `equal`, `description`, `object`) is not on the ObjC keyword
    list and leaks at MODERATE; `dd`/`level` from CocoaLumberjack likewise.
  - Language-level: no annotations, no fully qualified references, no import alias (only `@compatibility_alias`), no
    wildcard import (only `@import Foundation;` / umbrella header), and no real way to have two `Creature` classes.
  - (round 2) Category declarations in headers (`CreatureEntity (Fightable) <Fightable>`, `storedHitPoints`) and the class
    name of `EntityArchive.h` (interface with an `NSArray<Entity *>` property) are lost completely; `[Centaur class]`,
    `@compatibility_alias` and `@import` statements contribute no words in `.m` files. All round-2 forms are recorded as
    expected edges only - there is no dependency parser for Objective-C to judge them against.
