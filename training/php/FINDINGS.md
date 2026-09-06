# PHP

## Expected file-level edges (written before the first parser run)

Paths relative to `training/php`. Namespace `De\Sots\CellarsAndCentaurs\...` maps to `src/...` (PSR-4).

```
src/Domain/Model/Creature.php            -> CreatureId, CreatureType, ArmorClass, HitPoints, Fightable (implements), HasSpeeds (trait), Dice (rollD20 free function), src/Application/CreatureFacade.php (STANDARD_CREATURE_TYPE, upward, cyclic)
src/Domain/Model/Centaur.php             -> Creature (extends), CreatureId, CreatureType, Speed (new), SpeedType
src/Domain/Model/HasSpeeds.php           -> Speed, SpeedType
src/Domain/Model/ArmorClass.php          -> src/Application/CreatureUtil.php (STANDARD_ARMOR_CLASS_DESCRIPTION, upward, cyclic)
src/Domain/Model/NoSuchCreatureException.php -> CreatureId
src/Domain/Model/Dice.php                -> (none internal)
src/Domain/Model/HitPoints.php, Speed.php, SpeedType.php, CreatureType.php, CreatureId.php, Fightable.php -> (none)
src/Domain/Service/Creatures.php         -> Creature, CreatureId, NoSuchCreatureException (docblock @throws only)
src/Domain/Service/CreatureService.php   -> Creatures, Creature, CreatureId   (Psr\Log\LoggerInterface must NOT appear)
src/Adapter/Persistence/Repository.php   -> (none; Countable is stdlib)
src/Adapter/Persistence/CreatureEntity.php -> (none)
src/Adapter/Persistence/CreatureRepository.php -> CreatureEntity (via alias Entity), Repository (extends)
src/Adapter/Persistence/PersistedCreatures.php -> CreatureRepository, CreatureEntity (new only), Creatures, Creature, CreatureId, CreatureType, NoSuchCreatureException, src/Application/bootstrap.php (require_once, upward), src/Application/CreatureFacade.php (static const, upward)
src/Application/bootstrap.php            -> CreatureFacade, CreatureUtil (require_once)
src/Application/CreatureFacade.php       -> CreatureService, Creature, CreatureId, CreatureType, HitPoints (static), SpeedType, ArmorClass, Speed (FQN without use), Dto/Creature (alias CreatureDto), Annotation/Transactional (attribute only), Dice (use function rollD20)   (Ramsey\Uuid\Uuid must NOT appear)
src/Application/CreatureUtil.php         -> Creature, HitPoints (via namespace import `use ...\Domain\Model;` + `Model\X`)   (Fightable imported but unused: no edge expected)
src/Application/Dto/Creature.php         -> (none)
src/Application/Annotation/Transactional.php -> (none; Attribute is stdlib)
tests/Domain/Service/CreatureServiceTest.php -> CreatureService, Creatures, Creature, CreatureId, Speed, SpeedType (only with --include-tests)

Round 2 additions (written before the round-2 parser run; each form is the only link between the two files):
src/Domain/Service/HitPointCap.php       -> src/Domain/Model/HitPoints.php (`use const ...\MAX_HIT_POINTS`, namespace-level const added to HitPoints.php)
src/Domain/Service/CentaurSpotter.php    -> Centaur (`instanceof Centaur` only)
src/Application/helpers.php              -> src/Application/Dto/Creature.php (`include "Dto/Creature.php"`), src/Application/Annotation/Transactional.php (`require "Annotation/Transactional.php"`)
src/Application/CreatureFactory.php      -> Centaur (`$className = Centaur::class; new $className(...)`), CreatureId (parameter type)
src/Application/CreatureLookup.php       -> NoSuchCreatureException (`catch (NoSuchCreatureException $e)` only), CreatureService (property + ctor param), CreatureId (param), Creature (return type)
src/Domain/Model/SpeedRecord.php         -> Speed (docblock `@var Speed` only, same namespace, no `use`)
src/Application/HitPointTally.php        -> HitPoints (closure parameter `function (HitPoints $hitPoints)` only)
src/Domain/Model/Alignment.php           -> Describable (`enum Alignment: string implements Describable`)
src/Domain/Model/Boss.php                -> Fightable, Describable (`interface Boss extends Fightable, Describable`)
src/Domain/Model/Describable.php         -> (none)
```

Expected cycles: Creature -> CreatureFacade -> CreatureService -> Creature; ArmorClass -> CreatureUtil -> Creature -> ArmorClass.
Expected upward edges (domain -> application, adapter -> application): Creature -> CreatureFacade, ArmorClass -> CreatureUtil, PersistedCreatures -> bootstrap, PersistedCreatures -> CreatureFacade.

## Project

- Layout: `composer.json` (PSR-4 `De\Sots\CellarsAndCentaurs\` -> `src/`, `...\Tests\` -> `tests/`), 23 source files under
  `src/{Domain/Model,Domain/Service,Adapter/Persistence,Application,Application/Dto,Application/Annotation}` plus one PHPUnit test
  `tests/Domain/Service/CreatureServiceTest.php` (24 `.php` files). PHP 8.1 style: enums, readonly, constructor property promotion,
  attributes, `declare(strict_types=1)`.
- Stress constructs the language has and the project uses:
  1. aliased import `use ...\CreatureEntity as Entity;` (CreatureRepository), and `use ...\Dto\Creature as CreatureDto;` (CreatureFacade)
  2. namespace import `use De\Sots\CellarsAndCentaurs\Domain\Model;` + `Model\Creature`, `Model\HitPoints` (CreatureUtil) - PHP has no `*` wildcard, this is the closest form
  3. barrel: PHP has no re-export. Approximated by `src/Application/bootstrap.php` (`require_once 'CreatureFacade.php'; require_once 'CreatureUtil.php';`) which PersistedCreatures pulls in with `require_once '../../Application/bootstrap.php';`. The upward `use` of `CreatureFacade` from Creature and PersistedCreatures and of `CreatureUtil` from ArmorClass gives the cycles of the TypeScript example.
  4. `Centaur extends Creature`, `Creature implements Fightable`, `PersistedCreatures implements Creatures`, `CreatureRepository extends Repository`, plus the PHP-only trait `HasSpeeds` used by Creature
  5. generics: PHP has none. `abstract class Repository` carries `@template T` and CreatureRepository `@extends Repository<Entity>` in docblocks
  6. type-only: `Creatures` (promoted ctor param in CreatureService); new-only: `CreatureEntity`, `NoSuchCreatureException` in PersistedCreatures; static-only: `CreatureFacade::STANDARD_CREATURE_TYPE` (Creature, PersistedCreatures), `HitPoints::init` (CreatureFacade); annotation-only: `#[Transactional]` on `CreatureFacade::create`
  7. `Domain\Model\Creature` and `Application\Dto\Creature` both used from CreatureFacade (the DTO aliased as `CreatureDto`, the only way PHP can use both)
  8. FQN without `use`: `\De\Sots\CellarsAndCentaurs\Domain\Model\Speed` as parameter type of `CreatureFacade::create`
  9. unused `use ...\Fightable;` in CreatureUtil
  10. stdlib / third party: `RuntimeException`, `Countable`, `Attribute`, `Psr\Log\LoggerInterface`, `Ramsey\Uuid\Uuid`, `PHPUnit\Framework\TestCase`, `Psr\Log\NullLogger`
  11. `tests/Domain/Service/CreatureServiceTest.php` with `test_should_save_creature_to_the_stable`
  12. `Dice.php` holds `Dice`, `DiceRoll` and the free function `rollD20` (file name differs from `DiceRoll`); `use function ...\rollD20;` in CreatureFacade and an unqualified `rollD20()` call in Creature (same namespace)
- Not available in PHP: wildcard import, re-export/barrel, native generics. Extra PHP-only constructs added: trait, `use function`, `require_once`, attribute class.
- No `php` binary on this machine, so the files were not syntax-checked by PHP; tree-sitter parsed all 24 without a complaint.

## Dependency parser

Commands (both ran without error, exit 0, stderr in `output/*.stderr.txt`):

```
ccsh dependencyparser -nc training/php -e "output,FINDINGS.md" -o output/dependency.cc.json                  -> 23 leaves, 33 file edges
ccsh dependencyparser -nc training/php -e "output,FINDINGS.md" --include-tests -o output/dependency-with-tests.cc.json -> 24 leaves, 39 file edges
```

To isolate causes I ran the parser on a 10-file throw-away project in the scratchpad (not kept). Its result is quoted as "isolated test" below.

| # | Construct (file) | Expected edge(s) | Found | Verdict |
| --- | --- | --- | --- | --- |
| 1 | `use CreatureEntity as Entity` (CreatureRepository, return type `?Entity`) | -> CreatureEntity | yes, usage `return_value` | ok |
| 1 | `use Dto\Creature as CreatureDto` (CreatureFacade, return type `CreatureDto`) | -> Application/Dto/Creature.php | no; the alias is resolved to the simple name `Creature` and lands on Domain/Model/Creature.php (leaf edge `CreatureFacade -> Domain.Model.Creature usage=return_value`) | wrong target |
| 2 | `use ...\Domain\Model;` + `Model\Creature`, `Model\HitPoints` (CreatureUtil) | -> Creature, HitPoints | none (outgoing_dependencies = 0). Isolated test `use X\B; B\Third $t` also gives nothing | missing |
| 3 | `require_once '../../Application/bootstrap.php'` (PersistedCreatures) | -> bootstrap.php | none | missing |
| 3 | `require_once 'CreatureFacade.php'` / `'CreatureUtil.php'` (bootstrap.php) | -> CreatureFacade, CreatureUtil | none. Isolated test: `'Plain.php'`, `'./Promoted.php'`, `'../B/Target.php'` all give nothing. A SCRIPT leaf has no used types, and require paths alone never become an edge | missing |
| 4 | `Centaur extends Creature` | -> Creature | yes, `inheritance` | ok |
| 4 | `Creature implements Fightable` | -> Fightable | yes, `implementation` | ok |
| 4 | `PersistedCreatures implements Creatures` | -> Creatures | yes, `implementation` | ok |
| 4 | `use HasSpeeds;` trait in Creature | -> HasSpeeds | yes, `usage` | ok |
| 5 | `CreatureRepository extends Repository` (`@template`/`@extends` docblocks) | -> Repository | yes, `inheritance`; docblock generics ignored (correct) | ok |
| 6 | type-only: promoted ctor param `private Creatures $creatures` (CreatureService) | -> Creatures | none. Isolated test: `__construct(private Target $t)` gives nothing, the classic `__construct(Target $t)` gives `argument`. Same miss for `CreatureService $creatureService` in CreatureFacade and `CreatureRepository $repository` in PersistedCreatures | missing |
| 6 | new-only: `new CreatureEntity(...)`, `new NoSuchCreatureException($id)` (PersistedCreatures) | -> CreatureEntity, NoSuchCreatureException | yes, `instantiation` | ok |
| 6 | static-only: `CreatureFacade::STANDARD_CREATURE_TYPE` (Creature, PersistedCreatures) | -> CreatureFacade | yes, `constant_access`, flagged upward | ok |
| 6 | static-only: `HitPoints::init(...)` (CreatureFacade) | -> HitPoints | yes, `usage` | ok |
| 6 | annotation-only: `#[Transactional]` (CreatureFacade) | -> Annotation/Transactional.php | none (Transactional has incoming 0) | missing |
| 7 | both `Creature`s from CreatureFacade | -> Domain/Model/Creature and -> Application/Dto/Creature | only Domain/Model/Creature; the DTO edge is folded into it (see #1) | wrong |
| 8 | FQN `\De\Sots\CellarsAndCentaurs\Domain\Model\Speed` parameter type, no `use` (CreatureFacade) | -> Speed | none. Isolated test confirms: a `\X\B\Other` parameter/return type gives nothing | missing |
| 9 | unused `use Fightable` (CreatureUtil) | no edge | no edge | ok |
| 10 | `RuntimeException`, `Countable`, `Attribute`, `LoggerInterface`, `Uuid`, `TestCase`, `NullLogger` | no internal edge | none appear as leaves or edges | ok |
| 11 | test file, default run | not analysed | not in the tree (23 leaves) | ok |
| 11 | test file, `--include-tests` | -> CreatureService, Creatures, Creature, CreatureId, Speed, SpeedType | all 6 found (`Creatures::class` shows as `constant_access`) | ok |
| 12 | `Dice`, `DiceRoll`, `rollD20` in Dice.php | three leaves, intra-file leaf edges | `Dice` CLASS, `DiceRoll` CLASS, `rollD20` FUNCTION; leaf edges Dice->DiceRoll, rollD20->Dice, rollD20->DiceRoll | ok |
| 12 | `use function ...\rollD20;` + call (CreatureFacade), unqualified `rollD20()` call (Creature) | -> Dice.php | none. Isolated test: `use function X\B\freeFn; freeFn();` gives nothing. Function calls are not a usage kind in the PHP analyzer | missing |
| - | `@throws NoSuchCreatureException` docblock only (Creatures) | no edge (or debatable) | no edge | ok |

False positives: none. Every one of the 33 reported edges is in the expected list; no stdlib or vendor type produced a leaf or an edge.

Cycles and upward edges:
- Expected cycle `Creature -> CreatureFacade -> CreatureService -> Creature`: reported as `Creature -> CreatureFacade [isCyclic, isPointingUpwards]` and `CreatureFacade -> Creature [isCyclic]`. The reported cycle is the 2-cycle Creature <-> CreatureFacade; the 3-cycle through CreatureService cannot be seen because `CreatureFacade -> CreatureService` is missing (promoted constructor parameter).
- Expected cycle `ArmorClass -> CreatureUtil -> Creature -> ArmorClass`: only `ArmorClass -> CreatureUtil [isPointingUpwards]` exists; `CreatureUtil -> Creature` is missing (namespace import), so no cycle flag. Consistent with the edges it has.
- Upward edges expected: 4 (Creature->CreatureFacade, ArmorClass->CreatureUtil, PersistedCreatures->bootstrap, PersistedCreatures->CreatureFacade). Reported: 2 (the first two). `PersistedCreatures -> CreatureFacade` exists but is NOT flagged upward, although `src/Adapter` is level 2 and `src/Application` level 1 - the flag seems to be computed only for domain-style (lower-level -> higher-level) direction, or the adapter->application direction is considered "downward" because Adapter sits above Application in the level order. Worth a look.
- Levels: `src/Domain` 0, `src/Application` 1, `src/Adapter` 2 - sensible. Leaf levels: Creature 1, Centaur 2, rollD20 2, Dice 1, DiceRoll 0, NoSuchCreatureException 1.

Metrics: `incoming_dependencies` / `outgoing_dependencies` match the reported edge counts exactly (e.g. CreatureId 7 incoming, PersistedCreatures 7 outgoing, CreatureFacade 6 outgoing / 2 incoming). They inherit every missing edge above: CreatureUtil, bootstrap.php, Transactional and Dto/Creature all show 0 incoming, Dice.php 0 incoming although three files use `rollD20`.

Leaf kinds: `CLASS`, `INTERFACE` (Fightable, Creatures), `ENUM` (CreatureType, SpeedType), `FUNCTION` (rollD20), `SCRIPT` (bootstrap, named `bootstrap_script`) - all right. Wrong: the trait `HasSpeeds` is reported as `CLASS` (no TRAIT kind), and as a leaf it has zero outgoing edges although its methods take `SpeedType` and `Speed` parameters - the trait node handed to the type extractor is only its name node, so nothing inside the trait body is scanned (`HasSpeeds -> Speed, SpeedType` missing). Abstract class Repository and the attribute class Transactional are plain `CLASS`, which is fine.

Language vs. CodeCharta: PHP has namespaces and `use` imports, but no module system; the file<->class mapping is a convention (PSR-4) enforced by Composer, not by the language. The analyzer works purely on namespace names (leaf ids are `De.Sots.CellarsAndCentaurs.Domain.Model.Creature`) and never looks at `composer.json`; the physical tree (`src/Domain/Model`) and the namespace tree differ in casing and root, and the mapping still worked because leaves are matched by namespace, not by path. Everything else - resolving a `use` clause to a file, aliases, group uses, the implicit same-namespace import - is done by CodeCharta itself. Group use `use ...\Model\{ArmorClass, Creature, ...}` in CreatureFacade resolved correctly.

## Domain language parser

Commands (all ran without error unless noted, outputs kept in `output/`):

```
domainlanguageparser -nc training/php -e "output,FINDINGS.md" -o output/domain.cc.json                 (default: MODERATE, tests included)
... --stop-word-level MINIMAL     -> output/domain-minimal.cc.json
... --stop-word-level AGGRESSIVE  -> output/domain-aggressive.cc.json
... --exclude-tests               -> output/domain-no-tests.cc.json
... --comment-weight 0            -> FAILS: IllegalArgumentException "--comment-weight must be positive, got 0" (same for --string-weight 0)
... --comment-weight 1            -> output/domain-comment-weight-1.cc.json (default is 2)
... --string-weight 5             -> output/domain-string-weight-5.cc.json (default is 1)
```

The README suggests `--comment-weight 0` / `--string-weight 0` to isolate a source; the parser rejects 0. Retried with `--verbose`, same error. Weights had to be judged by changing them to 1 and 5 instead.

Expected words at the root node (default run, 105 words at root): all 17 present.

| word | freq | word | freq | word | freq |
| --- | --- | --- | --- | --- | --- |
| creature | 145 | damage | 17 | treasure | 5 |
| speed | 54 | initiative | 14 | hoard | 5 |
| hit | 40 | stable | 10 | centaur | 5 |
| points | 40 | lair | 8 | dungeon | 5 |
| armor | 30 | dice | 6 | cellar | 3 |
| roll | 21 | | | encounter | 2 |

Weights observed: identifiers 3, comments 2, strings 1 (each namespace line counts 3, each comment word 2 -> 1 with `--comment-weight 1`, each string word 1 -> 5 with `--string-weight 5`). No singularisation: `centaurs(2)`, `beasts(2)`, `dragons(2)`, `speeds(19)`, `creatures(23)`, `rolls(2)` are counted apart from their singulars.

Keyword leakage: none of the PHP keywords (`class`, `public`, `private`, `function`, `static`, `final`, `abstract`, `interface`, `enum`, `trait`, `namespace`, `use`, `new`, `return`, `void`, `int`, `string`, `bool`, `array`, `self`, `null`, `readonly`, `const`, `case`, `extends`, `implements`, `declare`) appears. Right.

Technical / noise leakage at MODERATE (all present at the root):
- `desotscellars(72)`, `centaursdomainmodel(36)`, `centaursadapterpersistence(12)`, `centaursapplication(9)`, `centaursdomainservice(6)`, `centaurstestsdomainservice(3)`, `centaursapplicationannotation(3)`, `centaursapplicationdto(3)`: the namespace `De\Sots\CellarsAndCentaurs\Domain\Model` is not split at the `\` separator. The camelCase splitter only splits at `CellarsAndCentaurs` (lower->upper boundary), the `\` are then stripped, and the English stop word `and` is removed. The second most frequent "word" of the project is garbage. Wrong - `\` (and `::`) must be a token boundary for PHP.
- `construct(45)`: from `__construct`, the fourth most frequent word. Not in `php-keywords.txt`. Wrong for PHP; it should be a keyword (or magic methods `__construct`, `__toString`, ... generally).
- docblock tags: `param(8)`, `template(2)`, `throws(2)` come from `@param`, `@template`, `@throws`. `param`/`template` are only filtered at AGGRESSIVE, `throws` only in the Java/Swift lists. Wrong for PHP where docblocks carry the type information PHP lacks.
- architecture words: `entity(14)`, `repository(11)`, `facade(9)`, `dto(6)`, `model(5)`, `logger(9)`, `transactional(9)`, `attribute(6)`, `runtime(3)` (from `RuntimeException`), `countable(3)`, `uuid(3)`, `init(3)`. By design these are AGGRESSIVE-only; at MODERATE they leak, which is defensible for `entity`/`repository` (some teams consider them domain) but `attribute`, `runtime`, `countable`, `uuid`, `logger` are pure PHP/library noise.
- English function words not in `english-stopwords.txt` (99 entries): `such(12)` (from `NoSuchCreatureException`), `per(12)` (`feetPerRound`), `all(5)`, `only(3)` (`readOnly` -> read filtered, only kept), `one(3)` (`findOne`), `every(2)`, `before(2)`. Wrong: the English list is too short.
- generic identifiers: `id(66)`, `type(54)`, `value(12)` (`->value` of enums and `XPValue`), `item(13)`, `total(21)`, `max(15)`, `standard(6)`, `description(9)`. Acceptable, that is the code's own vocabulary.
- `20(3)`: the integer literal `20` in `new Dice(20)` is counted as an identifier-weighted word. Numbers should be dropped.
- Correctly filtered at MODERATE: `util`, `exception`, `test`, `get`, `set`, `save`, `find`, `create`, `base`, `abstract`, `default`, `name`, `service`. `mock` does not appear because method-call names (`createMock`, `expects`, `once`, `info`) are not extracted at all - only declarations, parameters, properties and variables are.

Identifier splitting:

| form | identifier (file) | words found |
| --- | --- | --- |
| camelCase | `walkingSpeed` (CreatureFacade) | walking(3), speed - ok |
| snake_case | `$walking_speed` (CreatureServiceTest) | walking(3), speed - ok |
| SCREAMING_SNAKE | `MAX_HIT_POINTS` (HitPoints, CreatureUtil) | max, hit, points - ok |
| PascalCase | `ArmorClass` | armor(3); `class` filtered as keyword - ok |
| Acronym | `XPValue` (Centaur) | xp(12), value(9) - ok |
| Digit | `$d20Roll` / `rollD20` (Dice) | d20(6), roll - ok (`20(3)` is the separate numeric literal) |
| Kebab in string | `'centaur-stable'` (CreatureFacade) | centaur(1), stable(1 of 7) - ok, split at the hyphen |
| Namespace | `De\Sots\CellarsAndCentaurs\Domain\Model` | desotscellars, centaursdomainmodel - WRONG, not split at `\` |
| Magic method | `__construct` | construct - leading underscores stripped, word kept - wrong |

Comments and strings:
- Doc comment on Creature: roams(2), cellar(2), centaurs(2), beasts(2), dragons(2), share(2), all(2) in Creature.php - counted, weight 2.
- Doc comment on HitPoints: drop(2), recover(2), rests(2), takes(2), lair(2), creature(2) - counted.
- Line comment in CreatureFacade::create: rolls(2), dungeon(2), encounter(2), starts(2), every(2), before(2) - counted.
- Block comment in CreatureUtil: counts(2), treasure(2), hoard(2), guards(2) - counted.
- String in NoSuchCreatureException: such(1), creature(1), dungeon(1) - counted, weight 1.
- String `'centaur-stable'`: centaur(1), stable(1) - counted.
- Enum backing strings (`'walking'`, `'monstrosity'`, ...) and `'Natural Armor'`, `'ididid'` counted with weight 1; `--string-weight 5` raises exactly those. Docblock `@param`/`@return`/`@var` lines are counted as comments (weight 2) including the tag names.

Test file handling: included by default (`tests/Domain/Service/CreatureServiceTest.php` node present; `centaurstestsdomainservice(3)`, `stable(3)`, `walking(3)`, `logger(3)` come from it). `--exclude-tests` drops the `tests` subtree and root frequencies fall accordingly (creature 145 -> 127, stable 10 -> 7). `test_should_save_creature_to_the_stable` splits into save (filtered), creature, stable; `test`/`should`/`to`/`the` are filtered. Good.

Stop-word levels in one line: MINIMAL adds back `get(54)`, `set(21)`, `find(18)`, `service(18)`, `save(16)`, `exception(14)`, `base(12)`, `create`, `read`, `update`; AGGRESSIVE additionally removes `type(54)`, `entity`, `value`, `repository`, `facade`, `logger`, `param`, `dto`, `model`, `init`, `template` - `type` is a loss (SpeedType/CreatureType), `construct`, the namespace fragments and `such`/`per` survive all three levels.

## Round 2: additional dependency forms

Ten files were added (`src` now holds 33 `.php` files, 34 with the test) and one namespace-level `const MAX_HIT_POINTS = 999;` was
added to `HitPoints.php`. Every form is the only link between its file and its target. The three README commands were rerun
(all exit 0, stderr in `output/*.stderr.txt`): default -> 36 leaves, 40 file edges (round 1: 33); `--include-tests` -> 46 file edges
(round 1: 39); domain -> 47 nodes. Isolated checks below were run on a 10-file throw-away project in the scratchpad (not kept).

| form | file(s) | expected edge | found | note |
| --- | --- | --- | --- | --- |
| `use const ...\Domain\Model\MAX_HIT_POINTS;` + `MAX_HIT_POINTS` in an expression | `src/Domain/Service/HitPointCap.php` -> `src/Domain/Model/HitPoints.php` | HitPointCap -> HitPoints.php | yes | the namespace constant becomes its own leaf `Domain.Model.MAX_HIT_POINTS kind=VARIABLE` (there is no CONSTANT kind) and the leaf edge is `HitPointCap -> MAX_HIT_POINTS usage=constant_access`; `HitPoints.php` now carries two leaves |
| `$candidate instanceof Centaur` as the only usage | `src/Domain/Service/CentaurSpotter.php` | CentaurSpotter -> Centaur | no | outgoing 0; isolated test `$x instanceof Thing` with `use X\A\Thing;` also gives nothing |
| `include "Dto/Creature.php";` | `src/Application/helpers.php` | helpers.php -> Dto/Creature.php | no | `helpers_script` SCRIPT leaf, outgoing 0 - same as `require_once` in round 1 |
| `require "Annotation/Transactional.php";` | `src/Application/helpers.php` | helpers.php -> Annotation/Transactional.php | no | as above; Transactional still has 0 incoming |
| `$className = Centaur::class; new $className($id)` | `src/Application/CreatureFactory.php` | CreatureFactory -> Centaur | yes | via `Centaur::class` (`usage=constant_access`), not via the `new $className` itself; `new $className` alone would be invisible. The extra `CreatureId $id` parameter gives the expected `argument` edge |
| class used only in `catch (NoSuchCreatureException $e)` | `src/Application/CreatureLookup.php` | CreatureLookup -> NoSuchCreatureException | no | the file's other three edges (CreatureService `argument`, CreatureId `argument`, Creature `return_value`) are found; isolated `catch (Thing $e)` with `use` gives nothing |
| docblock `/** @var Speed */` only, same namespace, no `use` | `src/Domain/Model/SpeedRecord.php` | SpeedRecord -> Speed | no | outgoing 0, Speed still 1 incoming (Centaur); isolated `/** @var Thing */` with `use` gives nothing either. Docblocks are never read, consistent with `@throws` in round 1 - debatable rather than wrong |
| closure parameter `function (HitPoints $hitPoints): int { ... }` | `src/Application/HitPointTally.php` | HitPointTally -> HitPoints | yes | `usage=argument`; isolated arrow fn `fn (Thing $thing): string => ...` is found the same way |
| `enum Alignment: string implements Describable` | `src/Domain/Model/Alignment.php` | Alignment -> Describable | no | Alignment is an ENUM leaf with 0 outgoing, Describable 0 incoming; isolated `enum Colour: string implements Marker` with `use X\A\Marker;` also gives nothing, while `class Impl implements Marker, Other` in the same run gives both `implementation` edges |
| `interface Boss extends Fightable, Describable` | `src/Domain/Model/Boss.php` | Boss -> Fightable, Boss -> Describable | no | Boss is an INTERFACE leaf with 0 outgoing; isolated `interface Single extends Marker` (one parent) and `interface Double extends Marker, Other` give nothing, so it is interface `extends` in general, not the two-parent list |

Round-1 edges: unchanged. All 33 round-1 file edges are still present with the same flags (`Creature -> CreatureFacade [isCyclic, isPointingUpwards]`,
`CreatureFacade -> Creature [isCyclic]`, `ArmorClass -> CreatureUtil [isPointingUpwards]`, `PersistedCreatures -> CreatureFacade` still without the
upward flag); the 7 new edges (CreatureFactory -> Centaur, CreatureId; CreatureLookup -> Creature, CreatureId, CreatureService; HitPointTally -> HitPoints;
HitPointCap -> HitPoints) account exactly for 33 -> 40. The `--include-tests` run adds the same 6 test edges as in round 1 (39 -> 46). The round-1 leaf
levels are unchanged (Centaur 2, Creature 1, rollD20 2, ...); all new leaves sit at level 0. Metrics follow the edges (CreatureId 7 -> 9 incoming,
HitPoints 2 -> 4 incoming, Centaur 0 -> 1 incoming).

New false positives: none. Every one of the 7 new file edges is in the round-2 expected list; the new namespace-constant leaf `MAX_HIT_POINTS` is
correct in substance (its kind `VARIABLE` is the closest kind available). No stdlib call (`min`, `array_map`) produced an edge.

Round 2 in numbers: 4 of the 9 forms are found (`use const`, `::class`-backed string instantiation, closure parameter - and `include`/`require`
counted as one form, so 4 of 10 rows), 6 rows are missing. Nothing was resolved to a wrong target.

## Verdict

- Good:
  - Both parsers run cleanly on PHP 8.1 syntax (enums, readonly, promotion, attributes, traits, `use function`, group use).
  - Zero false-positive edges; stdlib and vendor types (`RuntimeException`, `Countable`, `Attribute`, PSR log, ramsey/uuid, PHPUnit) never appear.
  - Alias import, group use, inheritance, interface implementation, trait use, `new`, static constant access, static method call, enum case access all produce correct edges with sensible usage kinds.
  - Test file is skipped by default and fully resolved with `--include-tests`; metrics are consistent with the edges.
  - Leaf kinds CLASS / INTERFACE / ENUM / FUNCTION / SCRIPT are right; multiple declarations in `Dice.php` become three leaves.
  - Round 2: `use const ...\MAX_HIT_POINTS` resolves to a constant leaf in `HitPoints.php`; closure and arrow-function parameter types and
    `Centaur::class` produce edges; the ten added files caused no false positive and no round-1 edge changed.
  - All 17 expected domain words reach the root; all planted comments and strings are counted with visible weights; camel/snake/screaming/acronym/digit/kebab splitting all work.
- Wrong:
  - Domain parser: the namespace declaration is not tokenised at `\`; `desotscellars(72)` and `centaursdomainmodel(36)` are the #2 and #9 words of the project (every file, `namespace De\Sots\CellarsAndCentaurs\...`).
  - Dependency parser: `use Application\Dto\Creature as CreatureDto` in CreatureFacade is resolved to `Domain\Model\Creature` (alias mapped back to the simple name, then matched to the wrong `Creature`); the DTO gets no incoming edge.
  - Dependency parser: trait `HasSpeeds` is a `CLASS` leaf with no outgoing edges although its methods use `Speed` and `SpeedType` (only the name node is scanned).
  - Dependency parser: `PersistedCreatures -> CreatureFacade` (adapter level 2 -> application level 1) carries no `isPointingUpwards` flag while `ArmorClass -> CreatureUtil` does.
  - Dependency parser (round 2): `enum Alignment implements Describable` and `interface Boss extends Fightable, Describable` give no edge although
    `class ... implements` and `class ... extends` do - the implementation/inheritance extraction only looks at class declarations, so every
    interface hierarchy and every enum contract in a PHP project is invisible.
  - Domain parser: `__construct` leaks as `construct(45)`; docblock tags `param`, `template`, `throws` leak; `such`, `per`, `only`, `all`, `one`, `every`, `before` are not in the English stop-word list; the numeric literal `20` is counted.
  - Domain parser: `--comment-weight 0` / `--string-weight 0` are rejected although the README recommends them.
- Missing:
  - Constructor property promotion `__construct(private Creatures $creatures)` gives no edge (CreatureService -> Creatures, CreatureFacade -> CreatureService, PersistedCreatures -> CreatureRepository). This is the idiomatic PHP 8 form, so the 3-cycle through CreatureService is invisible.
  - Fully qualified name without `use` (`\De\...\Model\Speed` in CreatureFacade::create).
  - Namespace import `use ...\Domain\Model;` + `Model\Creature` (CreatureUtil -> Creature, HitPoints), which hides the ArmorClass -> CreatureUtil -> Creature cycle.
  - `require_once` / `require` / `include` never produce an edge (bootstrap.php has 0 outgoing, PersistedCreatures -> bootstrap missing), so PHP's only "barrel" form is invisible.
  - Attribute-only usage `#[Transactional]`.
  - Free-function usage: `use function ...\rollD20;` and the calls `rollD20()` in CreatureFacade and Creature (Dice.php has 0 incoming).
  - Round 2: `instanceof Centaur` (CentaurSpotter), `catch (NoSuchCreatureException $e)` (CreatureLookup), plain `include "..."` / `require "..."`
    (helpers.php, like `require_once`), docblock-only `@var Speed` (SpeedRecord, debatable), and `new $className` on its own (only the
    `Centaur::class` assignment next to it is seen).
  - Domain parser: no TRAIT leaf kind, no singularisation (`centaurs` vs `centaur`), method-call names are not extracted at all.
