# Objective-C

Report of 2026-10-08 (round 3). All three parsers were run fresh; every number below is from `output/*.cc.json` of this
run or from a scratch probe that is named as such. Expected values were written into this file before the first run.

## Project
- Layout: Xcode-style target folder `CellarsAndCentaurs/` with `Domain/Model`, `Domain/Service`, `Adapter/Persistence`,
  `Application`, `Application/DTO`, plus the test target `CellarsAndCentaursTests/`. Objective-C has no namespaces, the root
  namespace `de.sots.cellarsandcentaurs` is only reflected by the folders.
- 56 files: 30 `.h`, 24 `.m`, 1 `.mm`, 1 `.pch`. Round 3 added 7: `Domain/Service/EncounterResolver.h/.m`,
  `Domain/Service/EncounterEdgeCases.h/.m`, `Domain/Service/EncounterBridge.mm` (Objective-C++, the `.mm` variant),
  `Domain/Model/Zentaurenhoehle.h/.m`. `git check-ignore -v` reports none of them as ignored. No old file was changed.
- Extension variants of the language: `.m`, `.mm`, `.h` (shared with C and C++), `.pch`.

| extension | unified parser | dependency parser | domain language parser |
| --- | --- | --- | --- |
| `.m` (24) | analysed, Objective-C grammar | not scanned, no message | analysed, Objective-C grammar |
| `.h` (30) | analysed with the C grammar | scanned with the C++ analyzer (progress bar `30 Files`), 0 declarations | analysed with the C grammar and C keyword list |
| `.mm` (1) | skipped, reported: `2 Files with the following extensions were ignored ... [.mm, .pch]` | not scanned, no message | analysed, Objective-C grammar |
| `.pch` (1) | skipped, reported (see above) | not scanned, no message | skipped, no message (55 of 56 files) |

- Round-3 idioms where Objective-C lacks the README construct: the 6-line type doc comment sits on `@implementation` in the
  `.m` (the header is C to the parsers); the "chain of 5 method calls" is five nested message sends
  `[[[[[creature description] lowercaseString] ...] uppercaseString]`; lambdas are blocks `^{}`; there is no nested named
  function, `initiativeOrder:` uses a named block variable `byInitiative` instead (counted as a lambda, not a function);
  `finally` is `@finally`. Not in the language: null-coalescing other than the GNU `?:`, optional chaining, pattern guards,
  comprehensions, `unless`/`guard`/`defer`, labelled breaks, exception filters, operator overloads (closest:
  `objectAtIndexedSubscript:`), generators, `async`/`await` (closest: `dispatch_async` with a block), default parameters,
  heredocs, nested comments. Identifiers: clang accepts UTF-8 identifiers, the type is still named `Zentaurenhoehle` /
  `ruestungsklasse` as the task asked; one umlaut identifier `höhlentiefe` is in `EncounterEdgeCases.m`.
- Stress constructs of rounds 1 and 2 (unchanged):

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
- Commands: `ccsh dependencyparser -nc $LANG_DIR -e "output,FINDINGS.md" -o output/dependency.cc.json`, the same with
  `--include-tests` (`dependency-with-tests.cc.json`) and with `--verbose` (`dependency-verbose.cc.json`). All three exit 0.
- Result: **unsupported language, empty map, exit 0.** The output holds one `root` folder and nothing else: no file nodes,
  `lenses.dependency.edges` is `[]`, no `leaves`, no `leafEdges`, `lenses.metrics.attributes` is `{}`. The three files are
  byte-identical in size (1309 bytes). The only message is
  `WARN No analyzable declarations were found, so the dependency lens stays empty. This usually means no supported source
  files were found, or every file was skipped; see the warnings above.` There are no warnings above it, also not with
  `--verbose`: nothing says that 24 `.m`, 1 `.mm` and 1 `.pch` were not looked at, nor that 30 `.h` files were parsed.
- What happens to the headers: `.h` belongs to `SupportedLanguage.CPP` (`FileExtension.C` has `.h`), so the 30 headers go
  through the C++ analyzer (the progress bar counts `30 Files`). It extracts no declaration from any of them: `@interface`,
  `@protocol`, `typedef NS_ENUM(...)`, `typedef NS_OPTIONS(...)`, C prototypes (`NSInteger rollD20(void);` in `Dice.h`),
  the `static inline halveRoll` in `EncounterEdgeCases.h` and the `#define`s of `CreatureLimits.h` all yield nothing.
  Scratch probe for classification: a plain header with `class Ledger {...};`, a `typedef struct`, a prototype and a
  `static inline` function yields exactly one leaf (`a.h#Ledger kind=class`) and no edge for its `#include "b.h"` - the
  analyzer only knows class-like C++ declarations, so even a pure C header gives nothing.
- Edges: expected 77 file edges from `#import "..."` / `#include "..."` / `#import <CellarsAndCentaurs/...>` without the test
  file, 81 with it (plus 11 from the `.pch`), 16 of the 77 starting in a `.h` file, and 19 declaration-level forward
  references (`@class X;`, `@protocol X;`). Found: 0 of 77, 0 of 81, 0 leaves. (The totals `68 / 72` I wrote into the
  pre-run block were a guess, not a count; 77 / 81 is the count of the list below, taken from the sources, not from any
  parser.)

| construct | expected edge(s) | found | verdict |
| --- | --- | --- | --- |
| `#import "X.h"` (`.m` -> own header, e.g. `EncounterResolver.m` -> `EncounterResolver.h`) | 1 per `.m` | none | missing |
| `#import "X.h"` header -> header (`Centaur.h` -> `Creature.h`, `EncounterEdgeCases.h` -> `EncounterResolver.h`) | 16 | none | missing, although `.h` is claimed |
| `#include "Dice.h"` (`EncounterEdgeCases.m`), `#include "CreatureLimits.h"` (`ArmorClass.m`) | 2 | none | missing |
| relative path `#import "../Model/Creature.h"` (`EncounterEdgeCases.m`) | -> `Domain/Model/Creature.h` | none | missing |
| framework-style `#import <CellarsAndCentaurs/Speed.h>` (`EncounterEdgeCases.m`) | -> `Domain/Model/Speed.h` | none | missing |
| `#import` inside `#if __has_include("CreatureLimits.h")` (`EncounterEdgeCases.m`) | -> `CreatureLimits.h` | none | missing |
| `@import Foundation;`, `<Foundation/Foundation.h>`, `<vector>`, `<XCTest/XCTest.h>`, `<OCMock/OCMock.h>`, CocoaLumberjack | no internal edge | none | ok (trivially) |
| `@class X;` / `@protocol X;` forward declarations (19) | declaration-level reference | none | missing |
| inheritance `Centaur : Creature`, `EncounterEdgeCases : EncounterResolver`, `EncounterBridge : EncounterResolver` (`.mm`) | header -> header | none | missing |
| protocol conformance `Creature <Fightable>`, `PersistedCreatures <Creatures>`, category `CreatureEntity (Fightable) <Fightable>` | -> `Fightable.h`, `Creatures.h` | none | missing |
| `@compatibility_alias Entity CreatureEntity;` (`EntityAlias.h`) | -> `CreatureEntity.h` | none | missing |
| class only via `[Centaur class]` (`CreatureClassifier.m`), only instantiated, only via class property `CreatureFacade.standardCreatureType` | 1 each | none | missing |
| same simple name `Creature` (`Domain/Model/Creature.h`, `Application/DTO/Creature.h`) | 2 distinct targets from `CreatureFacade.m` | none | missing |
| umbrella header `CellarsAndCentaurs.h` imported from `Creature.m`, `ArmorClass.m`, `PersistedCreatures.m` | 3 upward edges, 1 cycle | none | missing |
| test file `CreatureServiceTests.m` | 4 edges only with `--include-tests` | none in both runs | missing |
| `.pch` prefix header | 11 edges | none | missing |

- False positives: none (there are no edges). Cycles and upward edges: expected the cycle `Creature.m` ->
  `CellarsAndCentaurs.h` -> `CreatureFacade.h` / `CreatureUtil.h` -> `Creature.h` and 3 upward edges; reported none.
- Leaf kinds: no leaves. Expected kinds would be CLASS (`@interface`), INTERFACE (`@protocol`), ENUM (`NS_ENUM`,
  `NS_OPTIONS`), a category as an extension of its class, and free C functions (`rollD20`, `encounterCount`).
- What the language offers and what CodeCharta would have to resolve itself: no module or namespace system. `#import "X.h"`
  is resolved through header search paths, not relative to the importing file, so `#import "Creature.h"` in
  `CreatureFacade.m` can mean the domain header or `DTO/Creature.h`. `@class X;` and conformance lists `<Fightable>` create
  declaration-level dependencies without an import in the same file. The `.h/.m` split gives every class two files and
  an `.m -> .h` edge. A `.pch` makes headers visible to every `.m` without any import. `.h` would need content sniffing
  (`@interface`, `@import`, `#import`) to pick the Objective-C grammar instead of C++.
- Expected file-level edge list, kept so a future Objective-C analyzer can be judged against it (`@class` / `@protocol`
  forward references in brackets):
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
  - Round 3 additions:
    - Domain/Service/EncounterResolver.h -> [Creature, Dice]
    - Domain/Service/EncounterResolver.m -> EncounterResolver.h, Domain/Model/Creature.h, Speed.h, Dice.h
    - Domain/Service/EncounterEdgeCases.h -> EncounterResolver.h (`#import` and superclass) [Creature, Fightable]
    - Domain/Service/EncounterEdgeCases.m -> EncounterEdgeCases.h, Domain/Model/Creature.h (`"../Model/Creature.h"`), Speed.h
      (`<CellarsAndCentaurs/Speed.h>`), Dice.h (`#include`), CreatureErrors.h, CreatureLimits.h (inside `#if __has_include`)
    - Domain/Service/EncounterBridge.mm -> EncounterResolver.h (import and superclass), Domain/Model/Creature.h
    - Domain/Model/Zentaurenhoehle.m -> Zentaurenhoehle.h

## Unified parser
- Command: `ccsh unifiedparser -nc $LANG_DIR -e "output,FINDINGS.md" -o output/unified.cc.json`, exit 0, 54 of 56 files
  analysed. `EncounterBridge.mm` and `CellarsAndCentaurs-Prefix.pch` are skipped with the message
  `2 Files with the following extensions were ignored as they are currently not supported: [.mm, .pch]`. The library's
  own `Language.OBJECTIVE_C` lists `.mm` as an extension, `FileExtension.OBJECTIVE_C` in the model does not, so the file
  never reaches the grammar. All 30 `.h` files are analysed with the C grammar (`FileExtension.C` owns `.h`).
  Also printed: `WARN No .gitignore found at root level, excluding common build folders as fallback...` (the language
  folder has no `.gitignore` of its own; the repository one is not consulted when a sub-folder is the root).
- `Domain/Service/EncounterResolver.m` (expected column written before the run):

| metric | expected | reported | verdict |
| --- | --- | --- | --- |
| loc | 97 | 97 | ok |
| rloc | 78 | 78 | ok |
| comment_lines | 13 | 13 | ok |
| number_of_functions | 5 | 5 | ok |
| logic_complexity | 14 | 14 | ok only by cancellation: the `for (Speed *speed in ...)` loop is not counted (-1) and `default:` is counted as a case (+1); see the edge cases |
| complexity | 21 (14 + 5 methods + 2 blocks) | 16 | wrong: the 5 methods add nothing, only the 2 blocks do |
| max / min / mean / median parameters | 5 / 0 / 1.6 / 1 | 5 / 0 / 1.6 / 1 | ok |
| max / min / mean / median complexity per function | 12 / 1 / 4.2 / 3 | 11 / 0 / 3.2 / 2 | wrong, every method is 1 too low (resolve 11, describe 0, safeRoll 3, initiativeOrder 2, isEmpty 0) |
| max / min / mean / median rloc per function | 33 / 1 / 11.6 / 8 | 33 / 1 / 11.6 / 8 | ok (body lines, signature and closing brace excluded, also for the 5-line selector of `resolve:`) |
| long_method | 2 | 2 | ok |
| long_parameter_list | 1 | 1 | ok |
| message_chains | 1 | 0 | missing: five nested message sends are not a chain |
| excessive_comments | 1 | 1 | ok |

- Other new files: `EncounterResolver.h` loc 22 / rloc 16 / 0 functions / complexity 0 as expected. `Zentaurenhoehle.m`
  loc 9 / rloc 6 / 1 function as expected, complexity 0 instead of 1. `Zentaurenhoehle.h` loc 16 / rloc 7 /
  comment_lines 3 as expected, but complexity 1 with 0 functions. `EncounterEdgeCases.h` loc 62 / rloc 46 /
  comment_lines 1 / 1 function (`static inline halveRoll`) / logic 1 as expected, complexity 7 instead of 2.
  `EncounterBridge.mm`: not analysed (expected loc 61, rloc 48, 4 functions, 1 C++ lambda, logic 6, complexity 11).
  Scratch probe only: the same file renamed to `.m` gives 5 functions, logic 2, complexity 6, rloc 49.
- `Domain/Service/EncounterEdgeCases.m`, file totals:

| metric | expected | reported | verdict |
| --- | --- | --- | --- |
| loc / comment_lines | 411 / 4 | 411 / 4 | ok |
| rloc | 345 | 339 | wrong, see line counting |
| number_of_functions | 44 | 43 | the function in the `#else` branch is not seen |
| logic_complexity | 40 (36 without the three macro bodies) | 36 | matches 36 only by cancellation: -4 macro bodies, -1 `for ... in`, -1 `#else` branch, +2 `default:` |
| complexity | 87 (40 + 44 + 3 blocks) | 44 | wrong: 36 + 5 C functions + 3 blocks, the 38 methods add nothing |
| message_chains | 3 | 0 | missing |
| long_parameter_list / long_method / max parameters | 1 / 2 / 6 | 1 / 2 / 6 | ok |

- `EncounterEdgeCases.m` per construct. The file reports only totals, so each `#pragma mark` section was additionally
  parsed as a file of its own (scratch probes, methods wrapped in `@implementation ... @end`); "reported" is from those.
  L = logic_complexity, C = complexity, P = max parameters.

| construct | expected | reported | verdict |
| --- | --- | --- | --- |
| `for (Creature *creature in creatures)` (fastEnumeration) | L 1 | L 0 | missing: `for_in_statement` is not a metric node |
| `switch` with fallthrough, 3 `case` + `default` (switchFallthrough) | L 3 | L 4 | wrong: `default:` counts as a case |
| `case 1 ... 5:`, `case 20:`, `default:` (switchCaseRange) | L 2 | L 3 | wrong, same cause |
| `[[[[creature description] lowercaseString] capitalizedString] uppercaseString]` (nestedMessageSends) | message_chains 1 | 0 | missing |
| `creature.creatureId.description.lowercaseString.capitalizedString.length` (dotSyntaxChain) | message_chains 1 | 0 | missing |
| dot syntax mixed with brackets, 5 sends (mixedChain) | message_chains 1 | 0 | missing |
| every `-` / `+` method (classMethod, classPropertyGetter, initializer, dealloc, customGetter, customSetter, ...) | C = L + 1 | C = L | wrong: a method counts as a function but not for complexity |
| C function (cFunctionWithLogic `clampRoll`) | F 1, L 2, C 3, P 3 | F 1, L 2, C 3, P 3 | ok |
| `NSInteger encounterCount(void)` (cFunctionVoid) | P 0 | P 1 | wrong: `void` is a parameter |
| `NSInteger (*modifier)(NSInteger)` parameter (cFunctionPointerParameter) | P 2 | P 3 | wrong: the pointer's own parameter is added |
| `(void (^)(Creature *creature, NSUInteger index))visitor` (blockTypedParameter) | P 1 | P 3 | wrong: the block type's parameters are added |
| `(void (^)(NSInteger roll))completion` (dispatchAsync) | P 1 | P 2 | wrong, same cause |
| `sumOfRolls(NSInteger count, ...)`, `totalOfRolls:(NSInteger)first, ...` (variadic) | P 1, L 1 | P 1, L 1 | ok |
| 6-part selector (multiPartSelector) | P 6, long_parameter_list 1, L 1 | P 6, 1, L 1 | ok |
| `#if DEBUG ... #else ... #endif` with one function per branch (preprocessorBranches) | F 2, L 2, rloc 15 | F 1, L 1, rloc 6 | wrong: the `#else` branch is dropped completely, also from rloc |
| `#define CLAMP_ROLL(roll) ((roll) > 20 ? 20 : (roll))`, `#define IS_DECISIVE(roll) (... \|\| ...)`, multi-line `LOG_ENCOUNTER` | L 1, 1, 2 | L 0, 0, 0 | missing: macro bodies are opaque |
| block with `if` and `&&` (blockWithLogic) | L 2, C 4 | L 2, C 3 | L ok, block +1 ok, method +1 missing |
| block as argument / in `dispatch_async` with `if` | L 1, C 3 | L 1, C 2 | same |
| `@try` with 3 `@catch` + `@finally` (tryWithSeveralCatches) | L 3, body rloc 11 | L 3, 11 | ok |
| `do { } while`, classic `for`, `while` in the variadic method | L 1 each | L 1 each | ok |
| `name ?: @"nameless"` (elvisOperator), nested ternary, `&&` / `\|\|` without `if` | L 1, 2, 2 | L 1, 2, 2 | ok |
| `goto failed;` with label and `if`, `if (@available(iOS 13.0, *))`, `respondsToSelector:@selector(...) && ...` | L 1, 1, 2 | L 1, 1, 2 | ok |
| `@synchronized`, `@autoreleasepool`, literals `@[] @{} @()`, `objectAtIndexedSubscript:`, `@synthesize`, `@dynamic`, class extension with ivar block, `typedef struct` | L 0 | L 0 | ok |
| category `@implementation NSString (Dungeon)` with `\|\|`, category `(Ambush)` | F 1 each, L 1 / 0 | F 1 each, L 1 / 0 | ok |
| `@"http://cellar.example/dungeon"`, `@"/* not a comment */"`, `'/'`, adjacent literals with `//` and `/*` (commentMarkersInStrings) | comment_lines 0, body rloc 6 | 0, 6 | ok |
| `///`, `/** */`, `/*! */`, `//!` (docCommentSyntaxes) | comment_lines 4 | 4 | ok |
| `NSInteger höhlentiefe` (unicodeIdentifier) | F 1, rloc counted | F 1, rloc 6 of 6 | ok |

- Line counting: loc and comment_lines agree with my count in all 54 files. rloc agrees in 51; the three deviations:
  - `EncounterEdgeCases.m` 339 instead of 345: preprocessor conditionals are not counted, neither the `#if` / `#else` /
    `#endif` lines nor anything in the `#else` branch (`#if __has_include` block -2, `preprocessorBranches` -9, scratch
    probe: `#if DEBUG / int a; / #else / int b; / #endif` gives rloc 1 of 5); and a directive that carries an argument
    (`#define X ...`, `#pragma mark - ...`, `#include "..."`) makes the line after it count even when that line is blank
    or a comment (+3 blank lines after the three `#define`s, +1 the `///` line after `#pragma mark - docCommentSyntaxes`,
    +1 the `#if DEBUG` line after a `#pragma mark`). Scratch probe: `#define A 1` + blank + `int x;` gives rloc 3.
  - `Domain/Model/Creature.m` 37 instead of 36: blank line after `#pragma mark - Fightable`.
  - `Domain/Model/ArmorClass.m` 24 instead of 23: blank line after `#include "CreatureLimits.h"`. A `#import` followed by
    a blank line does not show this (`EncounterResolver.m` is exact).
  - Comment markers inside strings and character literals are handled correctly.
- Other files:
  - Method `complexity` is 0-based everywhere: `CreatureEntity+Fightable.m` 2 functions, complexity 0;
    `CreatureUtil.m` 3 functions, complexity 0; `Centaur.m` 4 functions, complexity 0. `Dice.m` has complexity 3 with
    logic 2 because its one C function `rollD20` does add 1.
  - Headers get a `complexity` although they hold no function: `Dice.h` 4, `CreatureFacade.h` 2, `CreatureUtil.h` 2,
    `Speed.h` 2, `CreatureEntity+Fightable.h` 2, `ArmorClass.h`, `Centaur.h`, `CreatureEntity.h`, `EntityArchive.h`,
    `HitPoints.h`, `CreatureErrors.h`, `DTO/Creature.h`, `Zentaurenhoehle.h` 1 each, `EncounterEdgeCases.h` 7. The C
    mapping counts every `function_declarator` (scratch probes: `int count(void);` alone gives complexity 1, an
    `@interface` with two `@property` lines gives 1), and Objective-C declarations misread as C produce some.
    Other headers with the same kind of content report 0 (`Creature.h`, `EncounterResolver.h`), so the value is noise.
  - `number_of_functions` is 0 for every header except `EncounterEdgeCases.h`: method declarations are not functions,
    which is right; nothing else in the headers is measured.
  - `CreatureFacade.m`: 8 parameters, long_parameter_list 1, long_method 1 (15 body lines) - right. `Dice.m`
    `rollD20(void)` counts 1 parameter (not visible in the file maximum of 2).
  - `message_chains` is 0 in all 54 files.

## Domain language parser
- Commands (`-nc $LANG_DIR -e "output,FINDINGS.md"` each): default -> `domain.cc.json`; `--exclude-tests`,
  `--stop-word-level MINIMAL` / `AGGRESSIVE`, `--no-technical-stopwords`, `--ngrams 2`, `--comment-weight 100`,
  `--string-weight 100` -> `domain-<variant>.cc.json`. All exit 0 with `Analysis complete: 55 files processed` (all but
  the `.pch`, which is skipped without a message; `EncounterBridge.mm` is analysed). `--comment-weight 0` and
  `--string-weight 0` fail with `IllegalArgumentException: --comment-weight must be positive, got 0` (exit 1).
- **There is no root node.** `lenses.domain.nodes` has 55 entries, one per file, and none for a folder or the root, so
  "the root node's word list" does not exist in the output. The frequencies below are my sum over the 55 file nodes
  (274 distinct words).
- Expected words: all 17 are present.

| word | sum | main sources |
| --- | --- | --- |
| creature | 272 | identifiers everywhere, import paths counted as strings |
| roll | 100 | `roll:` parameters, `rollD20`, `clampRoll`, `EncounterBridge.mm` (14) |
| speed | 63 | identifiers, import paths |
| armor | 49 | `ArmorClass`, comments |
| encounter | 41 | new files |
| points / hit | 40 / 38 | `HitPoints`, `MAX_HIT_POINTS`, comments |
| initiative | 22 | `rollInitiative`, `initiativeOrder:`, `byInitiative`, comments |
| dice | 22 | `Dice`, `DiceRoll`, `(Dice *)dice` |
| dungeon | 19 | 14 from `EncounterEdgeCases.m` (`isDungeonName`, strings), facade comment, exception string |
| damage | 17 | `takeDamage:`, `loseHitPoints:damage`, comment |
| centaur | 15 | `Centaur`, `isCentaur:`, strings |
| treasure / hoard | 11 / 8 | `CreatureUtil.m` only |
| stable | 7 | test method name 3, `CreatureFacadeStableName` 3, `@"centaur-stable"` 1 |
| lair | 6 | `HitPoints.h` comment 2, `EncounterLairName` 3, `@"minotaur-lair"` 1 |
| cellar | 4 | `Creature.h` comment 2, two strings in `EncounterEdgeCases.m` |

- Expected words of the new files: `EncounterResolver.m` has all of them (encounter, resolver, attacker, defender, roll,
  bonus, terrain, dice, initiative, order, speed, reach, armor, dungeon, `fumble(1)`, `hit(1)`, `miss(1)`), except that
  `verdict(4)` comes from the commented-out line only, not from `NSString *verdict`. `EncounterEdgeCases.m`:
  `minotaur(2)` comes from the two strings only (`NSString *minotaurBanner` contributes nothing, `banner` is absent),
  `portcullis(3)`, `tile(3)`, `grid(6)`, `ambush(9)`, `ambushers(6)`, `rage(3)`, `wandering(1)` are there,
  `höhlentiefe` arrives as `hlentiefe(3)`. `EncounterBridge.mm`: `bridge, ledger, best, larger, highest, cellars, roll`
  all present.
- Keyword leakage (sum over files), all from headers read as C, all wrong for the language: `ns(72)`, `assume(69)`,
  `nonnull(69)`, `end(69)`, `interface(63)`, `id(15)`, `protocol(6)`, `integer(3)`, `foundation(3)` (`@import Foundation;`
  in `CreatureCensus.h`). Positions 3 to 6 and 8 of the word ranking are macro and directive fragments. From `.m` /
  `.mm` files none of `interface`, `end`, `property`, `nonatomic`, `self`, `nil`, `void`, `return`, `import`, `static`
  leak. From the C++ part of `EncounterBridge.mm`: `namespace(2)` and `objective(2)` come from its two comments, not
  from keywords. `class(26)` is `ArmorClass` / `armorClass` plus `CreatureLimits.h` macros.
- Technical words at MODERATE. Filtered (they come back with `--no-technical-stopwords`): `service(33)`,
  `exception(24)`, `save(15)`, `name(15)`, `index(15)`, `find(12)`, `base(12)`, `util(7)`, `tests(6)`, `set(6)`,
  `temporary(6)`, `create(3)`. Leaking: `init(54)`, `entity(34)`, `type(28)`, `value(27)`, `repository(27)`,
  `identifier(24)`, `description(18)`, `facade(10)`, `persisted(10)`, `result(9)`, `object(9)`, `dto(7)`, `zone(6)`,
  `copy(3)`, `hash(3)`, `equal(3)`, `dd(3)` / `level(3)` (`DDLogLevel`), `cellars(8)` / `centaurs(5)` / `errors(3)` /
  `limits` / `model(1)` (import paths, see strings). `AGGRESSIVE` removes `init`, `entity`, `type`, `value`,
  `repository`, `result`, `facade`, `dto` (plus `method`, `argument`, `stop`, `visitor`, `model`); `MINIMAL` adds back
  `service`, `exception`, `save`, `index`, `find`, `base`, `set`, `create`. No level touches the header leakage.
- Identifier splitting:

| form | identifier | where | words found |
| --- | --- | --- | --- |
| camelCase | `walkingSpeed` | `CreatureFacade.m` selector part and parameter | `walking(3)`, `speed` - ok |
| camelCase | `walkingSpeed` | `Centaur.m`, local `Speed *walkingSpeed` | nothing (pointer-declared local) |
| snake_case | `test_should_save_creature_to_the_stable` | test method | `creature`, `stable(3)` - ok |
| snake_case | `walking_speed` | test, local `Speed *walking_speed` | nothing (pointer-declared local) |
| SCREAMING_SNAKE | `MAX_HIT_POINTS` | `HitPoints.h` `#define` | `max`, `hit`, `points` - ok |
| SCREAMING_SNAKE | `CLAMP_ROLL`, `IS_DECISIVE`, `LOG_ENCOUNTER` | `EncounterEdgeCases.m` `#define` | `clamp`, `roll`, `decisive`, `encounter` - ok |
| PascalCase | `ArmorClass` | everywhere | `armor`, `class` - ok |
| Acronym | `XPValue` | `Centaur.m` method | `xp(3)`, `value(3)` - ok; the property in `Centaur.h` is lost |
| Digit | `rollD20` / `d20Roll` | `Dice.m`, `Dice.h` | `d20(3)` each from the function name; the local `DiceRoll *d20Roll` nothing |
| Kebab in string | `@"centaur-stable"`, `@"minotaur-lair"` | `CreatureFacade.m`, `EncounterEdgeCases.m` | `centaur(1)`, `stable(1)`, `minotaur(1)`, `lair(1)` - ok |
| Umlaut | `höhlentiefe` | `EncounterEdgeCases.m` local `NSInteger` | `hlentiefe(3)` - cut at the umlaut, the leading `h` is dropped |

  What is extracted from `.m` files: class, category, class-extension, protocol and property names, method selectors
  and their parameters, C function names and parameters, `#define` names, static constants, struct fields
  (`gridColumn`, `gridRow`), block parameters and locals declared without a pointer (`NSInteger reach`, `BOOL
  outOfReach`, `NSComparator byInitiative`, `DungeonTile portcullisTile`). Not extracted (scratch probes confirm each):
  locals declared with a pointer (`NSString *minotaurBanner`), the name of a `typedef struct { } DungeonTile`, every
  `NS_ENUM` / `NS_OPTIONS` constant in a `.m`, references in expressions (`[hydra bite]`, `hydra.fang.venom`,
  `[Griffin class]`), the text of `#pragma mark - ...`, `@import X;` and `#import <A/B.h>`.
- Comments: the four planted sentences are counted with weight 2 (`cellar`, `beasts`, `dragons`, `roams`, `share` in
  `Creature.h`; `lair`, `rests`, `recover`, `drop` in `HitPoints.h`; `dungeon`, `encounter`, `initiative`, `rolls`,
  `starts`, `before`, `every` in `CreatureFacade.m`; `counts`, `guards`, `treasure`, `hoard` in `CreatureUtil.m`).
  `--comment-weight 100` lifts exactly these by 98 per occurrence, so the weight is visible. All four doc comment
  syntaxes in `EncounterEdgeCases.m` are read (`triple(2)`, `javadoc(2)`, `header(2)`, `bang(2)`). The commented-out
  code line in `EncounterResolver.m` is read as prose: `verdict(4)`, `uppercase(2)`, `string(2)`.
- Strings: weight 1 (`such`, `dungeon` from the exception string; `fumble`, `miss`, `none`, `rolled`, `nameless`,
  `wandering`). Comment markers inside strings do no harm (`part(1)`, `http(1)`). Every quoted `#import "X.h"` /
  `#include "X.h"` path in a `.m` file is counted as a string literal: with `--string-weight 100` `creature` goes from
  272 to 3935, `cellars` 8 -> 305, `centaurs` 5 -> 302, `errors` 3 -> 300, `repository` 27 -> 324; `model(1)` in
  `EncounterEdgeCases.m` is the folder of `"../Model/Creature.h"`.
- Headers (C grammar): what survives depends on error recovery and differs from header to header.
  `EncounterResolver.h` yields `bonus, creature, defender, dice, encounter, resolver, roll, terrain` but not `resolve`,
  `attacker`, `describe`, `safe`, `initiative`, `order`, `empty`. `EncounterEdgeCases.h` yields `halve`, `count`,
  `notification`, `did`, `fightable` but none of the three `NS_OPTIONS` constants (`trait`, `magical` absent) and none
  of the six properties (`raging`, `observer`, `challenger`, `depth` absent). `Zentaurenhoehle.h` loses the property
  `ruestungsklasse` and the method `beschreibung`; a scratch header with the same two lines but without
  `#import` / `NS_ASSUME_NONNULL_BEGIN` keeps `ruestungsklasse`. `CreatureType.h` still yields only `monstrosity`,
  `SpeedType.h` only `walking`; beast, aberration, celestial, dragon, fiend, humanoid, undead appear nowhere.
  `Fightable.h` yields only `assume, end, nonnull, ns, protocol`.
- Test file: `CellarsAndCentaursTests/CreatureServiceTests.m` is included by default (right) and still included with
  `--exclude-tests` - the variant output is identical to the default, word for word (wrong).
- `--ngrams 2`: the three most frequent bigrams are `ns assume(69)`, `assume nonnull(69)`, `nonnull end(69)`, then
  `hit points(30)`, `armor class(24)`, `creature id(12)`, `such creature(12)`, `feet per(12)`, `per round(12)`,
  `treasure hoard(6)`, `roll initiative(9)`.
- `tfidf`: every word carries the same `tfidf` in every file regardless of its frequency there (`speed` 46.643 in
  files with frequency 1, 3, 6, 7, 15 and 17; `creature` 43.678 everywhere), so it is a per-word value, not a
  per-file one.

- German words (`Zentaurenhoehle.h` comment, `Zentaurenhoehle.m` string): 3 of the 7 arrive intact - `verlies(2)`,
  `trefferpunkte(2)`, `kreatur(2)`. The four with an umlaut or `ß` are cut at that character and fragments shorter
  than three letters vanish: `Zentaurenhöhle` -> `zentaurenh(2)` + `hle(2)`, `Rüstungsklasse` -> `stungsklasse(2)`,
  `Höhle` -> `hle(1)`, `Größe` -> nothing; also `gehören` -> `geh(2)` + `ren(2)`. The word pattern is
  `[a-zA-Z]{n,}`. German stop words all leak: `die(2)`, `unter(2)`, `dem(2)`, `und(2)`, `jeder(2)`, plus `der(1)` and
  `liegt(2)`; only the English list exists. ASCII identifiers: `zentaurenhoehle(7)` and `beschreibung(3)` from the
  `.m` and the `@interface` line, `ruestungsklasse` nowhere (the header property is lost, `self.ruestungsklasse` is an
  expression). The other two parsers: the unified parser measures both files (see above), the dependency parser
  produces nothing.

## Changed since 2026-09-06
- No longer holds: "Dependency parser: not run". It runs, exits 0 and writes an empty map; `.h` is now claimed through
  the C++ analyzer and yields nothing (new finding).
- No longer holds: "all 17 words reach the root" as a statement about a root node - the output has no root or folder
  node any more, only the 55 file nodes. Summed over the files all 17 are still there.
- Refined: "local variables are not extracted from `.m` files" was drawn from three pointer-declared locals. Locals
  declared without a pointer are extracted; pointer-declared ones still are not.
- Still holds, re-verified on fresh output: `.h` read as C with `interface` / `end` / `protocol` / `ns` / `assume` /
  `nonnull` / `id` / `integer` / `foundation` leaking (frequencies grew with the 4 new headers: `interface` 45 -> 63,
  `end` 51 -> 69, `ns` 54 -> 72); header method declarations and `NS_ENUM` constants after the first lost; `#import`
  and `#include` paths counted as strings in `.m`; `--exclude-tests` does not recognise
  `CellarsAndCentaursTests/CreatureServiceTests.m`; `--comment-weight 0` / `--string-weight 0` rejected; `.pch`
  skipped silently; `id` dropped from `CreatureId` in `.m` but kept from `.h`; `@import Foundation;` leaks from a header
  and is silent in a `.m`; `[Centaur class]`, `@compatibility_alias`, category declarations in headers contribute
  nothing; NSObject vocabulary (`init`, `copy`, `zone`, `hash`, `equal`, `description`, `object`) leaks at MODERATE.
- Small shifts on old files: `Dice.h` now also yields `sides(6)` and `result(3)`, `Creature.h` yields
  `armor/class/hit/points(8)` and `speed(3)`; `HitPoints.h` `max(6)`.
- New on old files (unified parser, not covered on 2026-09-06): method complexity is 0-based, headers carry a
  complexity without functions, `Creature.m` and `ArmorClass.m` are 1 rloc too high, message_chains is 0 everywhere.

## Verdict

### Unified parser
- Missing:
  - `EncounterBridge.mm`: `.mm` is not analysed at all (reported as unsupported extension), although the grammar
    library lists `.mm` for Objective-C. **Decision: accept.**
  - `EncounterResolver.m` `describe:`, `EncounterEdgeCases.m` `nestedMessageSends:` / `dotSyntaxChain:` / `mixedChain:`:
    no message chain is ever found, neither for nested `[[[a b] c] d]` sends nor for dot-syntax chains;
    `message_chains` is 0 in all 54 files. **Decisions: accept — nested bracket sends; ignore — the dot-syntax-only chain, it matches the documented node lists (as in TypeScript).**
  - `EncounterResolver.m` `resolve:`, `EncounterEdgeCases.m` `fastEnumeration:`: `for (x in y)` adds no complexity. **Decision: accept.**
  - `EncounterEdgeCases.m` `#define CLAMP_ROLL`, `IS_DECISIVE`, `LOG_ENCOUNTER`: logic inside macro bodies is not counted. **Decision: ignore.**
  - `CellarsAndCentaurs-Prefix.pch` is not analysed (reported). **Decision: ignore.**
- Wrong:
  - Every `.m` file: an Objective-C method adds 1 to `number_of_functions` but 0 to `complexity` and to its own
    complexity per function, while a C function and a block each add 1. `EncounterResolver.m` complexity 16 instead of
    21, `EncounterEdgeCases.m` 44 instead of 87, per-function values 1 too low. **Decisions: accept — a method adds nothing to the file's `complexity`; ignore — per-function values start at 0 (derived from Java).**
  - `EncounterResolver.m` `resolve:`, `EncounterEdgeCases.m` `switchFallthrough:` / `switchCaseRange:`: `default:` is
    counted as a `case`. **Decision: ignore (derived from Java).**
  - `EncounterEdgeCases.m` `preprocessorBranches`: the whole `#else` branch (a function with an `if`) is ignored, for
    functions, complexity and rloc; `#if` / `#else` / `#endif` lines are never rloc. **Decision: accept.**
  - `EncounterEdgeCases.m`, `Creature.m`, `ArmorClass.m`: the line after `#define X ...`, `#pragma mark - ...` or
    `#include "..."` is counted as rloc even when blank or a comment. **Decision: accept.**
  - Parameters: `encounterCount(void)` and `rollD20(void)` have 1 instead of 0; `applyModifier(NSInteger roll,
    NSInteger (*modifier)(NSInteger))` 3 instead of 2; `eachAmbusher:(void (^)(Creature *, NSUInteger))visitor` 3
    instead of 1; `dispatchAsync:(void (^)(NSInteger))completion` 2 instead of 1. **Decisions: ignore — `(void)`, a documented known issue; accept — parameters of a function-pointer or block type are added.**
  - Headers: `complexity` without any function (`Dice.h` 4, `EncounterEdgeCases.h` 7 instead of 2, 12 more headers 1
    or 2) because prototypes and misread `@property` / method declarations count as function complexity in the C mapping. **Decision: ignore.**
- Bad:
  - `logic_complexity` of `EncounterResolver.m` (14) and `EncounterEdgeCases.m` (36) equals the expected number only
    because the errors cancel. **Decision: no action of its own — it follows from `for ... in` (accepted) and `default:` (ignored).**
  - Headers are measured with the C grammar; apart from loc, rloc and comment_lines their numbers say nothing about
    the declared interface. **Decision: ignore.**
- Good: loc and comment_lines in all 54 files, rloc in 51; `number_of_functions` for methods, class methods, categories
  and C functions; parameter counts of multi-part selectors and variadics; rloc per function (body only, multi-line
  selectors handled); `long_method`, `long_parameter_list`, `excessive_comments`; `if`, `else if`, `while`, `do`,
  classic `for`, `case`, `@catch` (several), ternary, `?:`, `&&`, `||`, `@available`; blocks count as lambdas; comment
  markers in strings; all four doc comment syntaxes; the skipped extensions are named in the log.

### Dependency parser
- Missing:
  - Objective-C as a whole: 0 of 77 expected file edges (0 of 81 with tests), 0 leaves, no cycle, no upward edge; `.m`
    and `.mm` are never scanned. **Decision: ignore.**
  - `.h` files are claimed (C++ analyzer, 30 files scanned) but nothing is extracted from them: no `#import` /
    `#include` edge (16 expected between headers), no `@interface` / `@protocol` / `NS_ENUM` declaration, no C
    prototype or `static inline` function (`Dice.h`, `EncounterEdgeCases.h`). **Decision: ignore — follows from Objective-C not being supported and `.h` being read as C; a plain C header that yields nothing is decided in the C report.**
- Wrong:
  - The warning refers to "the warnings above" and there are none, also with `--verbose`. **Decision: accept.**
  - The written map has no file nodes at all, only `root`, so merged with another map it contributes nothing and looks
    like an empty project. **Decision: accept.**
- Bad:
  - Exit code 0 and a valid `.cc.json` for a project the parser cannot read; skipped extensions are not listed (the
    unified parser does list them). **Decisions: accept — skipped extensions are listed; ignore — exit code 0.**
  - `--include-tests` changes nothing and says nothing. **Decision: ignore.**
- Good: no false edges; the empty-lens warning itself is clear.

### Domain language parser
- Missing:
  - No root or folder node in `lenses.domain.nodes`; a project-level word list has to be summed from the file nodes. **Decision: ignore (derived from Java).**
  - `Zentaurenhoehle.h`, `EncounterEdgeCases.m`: no German stop words (`die`, `unter`, `dem`, `und`, `jeder`, `der` leak). **Decision: ignore (derived from Java).**
  - `EncounterEdgeCases.m`, `Centaur.m`, `Dice.m`, test file: pointer-declared locals (`NSString *minotaurBanner`,
    `Speed *walkingSpeed`, `DiceRoll *d20Roll`, `Speed *walking_speed`), `typedef struct` names, enum constants in `.m`,
    identifiers in expressions, `#pragma mark` text. **Decision derived from Kotlin: ignore — identifiers in expressions.** **Decisions: accept — pointer-declared locals, `typedef struct` names, enum constants in `.m`; ignore — `#pragma mark` text.**
  - `CellarsAndCentaurs-Prefix.pch` skipped without a message. **Decision: ignore.**
- Wrong:
  - All 30 headers are read as C: `ns(72)`, `assume(69)`, `nonnull(69)`, `end(69)`, `interface(63)`, `id(15)`,
    `protocol(6)` are among the most frequent words of the project. **Decision: ignore.**
  - Header declarations are lost unpredictably: `EncounterResolver.h` loses 4 of its 5 selectors,
    `EncounterEdgeCases.h` all 6 properties and all `NS_OPTIONS` constants, `Zentaurenhoehle.h` its property and method,
    `CreatureType.h` 7 of 8 constants, `SpeedType.h` 4 of 5, `Fightable.h` its protocol name. **Decision: ignore.**
  - Umlauts and `ß` cut words apart in comments, strings and identifiers: `zentaurenh` + `hle`, `stungsklasse`,
    `hle`, `geh` + `ren`, `hlentiefe`; `Größe` disappears. 3 of the 7 German words arrive intact. **Decision: accept (derived from Java).**
  - `#import "X.h"` / `#include "X.h"` paths in `.m` files are counted as string literals (`cellars`, `centaurs`,
    `errors`, `model`). **Decision: accept.**
  - `--exclude-tests` leaves `CellarsAndCentaursTests/CreatureServiceTests.m` in; the output is identical to the default. **Decision: accept.**
- Bad:
  - `--comment-weight 0` / `--string-weight 0` are rejected, a source cannot be switched off. **Decision: accept (derived from Java).**
  - `--ngrams 2` is led by `ns assume`, `assume nonnull`, `nonnull end`. **Decision: ignore.**
  - `tfidf` is the same number for a word in every file. **Decision: ignore (derived from Vue).**
  - NSObject vocabulary (`init(54)`, `description`, `object`, `zone`, `copy`, `hash`, `equal`) and `identifier`,
    `value`, `type` leak at MODERATE; the commented-out code line in `EncounterResolver.m` is read as prose. **Decisions derived from Java: ignore — technical words, commented-out code.**
- Good: all 17 expected words are found; `.mm` is analysed; camelCase, snake_case, SCREAMING_SNAKE, PascalCase,
  acronym, digit and kebab-in-string splitting work on declarations; comment (2), string (1) and identifier (3)
  weights are visible; all doc comment syntaxes are read; comment markers in strings do no harm; no Objective-C
  keyword leaks from `.m` / `.mm`; `util`, `exception`, `service`, `tests`, `save`, `find`, `name`, `index`
  are filtered at MODERATE (`mock` never occurs in a counted position, so its filtering could not be verified).
