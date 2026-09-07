# C#

## Project
- Layout: standard .NET solution. `CellarsAndCentaurs.sln`, `src/De.Sots.CellarsAndCentaurs/` (project folder = root
  namespace, one sub folder per namespace segment: `Domain/Model`, `Domain/Service`, `Adapter/Persistence`,
  `Application`, `Application/Dto`) and `tests/De.Sots.CellarsAndCentaurs.Tests/Domain/Service/`. Two small `.csproj`
  files (`Microsoft.Extensions.Logging.Abstractions`, `xunit`, `NSubstitute`), no ASP.NET / EF references so the
  framework-specific stop-word lists of the domain parser are not triggered.
- 24 `.cs` files: 23 under `src/` (22 with declarations + `GlobalUsings.cs`), 1 test file. 25 declarations.
- Namespaces `De.Sots.CellarsAndCentaurs.*`, PascalCase types and members, mostly file-scoped namespaces
  (`namespace X;`), one block-scoped namespace with a `using` alias inside it (`CreatureRepository.cs`). Interface
  names kept as `Fightable` / `Creatures` (README names) instead of the idiomatic `IFightable` / `ICreatures` so the
  leaf names stay comparable across languages.
- Stress constructs that exist in C# and are in the project:
  1. aliased import: `using Entity = De.Sots.CellarsAndCentaurs.Adapter.Persistence.CreatureEntity;` (`CreatureRepository.cs`),
     plus a namespace alias `using Dto = ...Application.Dto;` in `CreatureFacade.cs`
  2. wildcard import: every `using Namespace;` is a wildcard in C# (`CreatureUtil.cs`), plus `using static ...Dice;`
  3. upward dependency + cycle: `Creature -> CreatureFacade.STANDARD_CREATURE_TYPE`, `ArmorClass -> CreatureUtil`,
     `PersistedCreatures -> CreatureFacade`
  4. `Centaur : Creature`, `Creature : Fightable`, `PersistedCreatures : Creatures`
  5. generic base `Repository<T>` used by `CreatureRepository : Repository<Entity>`
  6. type position only (`Speed` params), `new` only (`CreatureId` in PersistedCreatures), static member only
     (`CreatureFacade.STANDARD_CREATURE_TYPE`), attribute only (`[Lair("centaur-stable")]` on `CreatureFacade`,
     declared as `LairAttribute`)
  7. `Domain.Model.Creature` and `Application.Dto.Creature` both used in `CreatureFacade` (`Dto.Creature`)
  8. fully qualified reference without alias: `De.Sots.CellarsAndCentaurs.Domain.Model.Speed walkingSpeed`
  9. unused import: `using Fightable = ...Domain.Model.Fightable;` in `CreatureUtil.cs` (C# cannot import a single
     type except through an alias)
  10. std/third party: `System`, `System.Collections.Generic`, `System.Linq`, `System.ComponentModel.DataAnnotations`
      (`[Table]`, `[Key]`), `Microsoft.Extensions.Logging` (`ILogger<T>`), `Xunit`, `NSubstitute`
  11. test file `CreatureServiceTests.cs` with `[Fact] should_save_creature_to_the_stable`
  12. `Dice.cs` holds `Dice` and `DiceRoll`; `Experience.cs` holds `XPValue`
  13. extra: `global using` in `src/.../GlobalUsings.cs` (`CreatureEntity.cs` relies on it for `CreatureType`),
      `is Centaur` type pattern in `CreatureUtil.IsCentaur`, `record` / `record struct` declarations
- Constructs the language does not have: free functions (`rollD20` is `Dice.RollD20()`, a static member),
  re-export / barrel module (no equivalent; `global using` is the closest thing and is included).

## Expected file-level edges (written before the first parser run)

Paths relative to `src/De.Sots.CellarsAndCentaurs/`; the test file relative to `tests/`.

| from | to |
| --- | --- |
| Domain/Model/ArmorClass.cs | Application/CreatureUtil.cs (upward, static member) |
| Domain/Model/Creature.cs | Domain/Model/Fightable.cs, CreatureId.cs, CreatureType.cs, ArmorClass.cs, HitPoints.cs, SpeedType.cs, Speed.cs, Dice.cs, Application/CreatureFacade.cs (upward, cycle) |
| Domain/Model/Centaur.cs | Domain/Model/Creature.cs, CreatureId.cs, CreatureType.cs, SpeedType.cs, Speed.cs |
| Domain/Model/Experience.cs | Domain/Model/Creature.cs |
| Domain/Model/NoSuchCreatureException.cs | Domain/Model/CreatureId.cs |
| Domain/Service/Creatures.cs | Domain/Model/Creature.cs, CreatureId.cs |
| Domain/Service/CreatureService.cs | Domain/Service/Creatures.cs, Domain/Model/Creature.cs, CreatureId.cs |
| Adapter/Persistence/CreatureEntity.cs | Domain/Model/CreatureType.cs (only via `global using` in GlobalUsings.cs) |
| Adapter/Persistence/CreatureRepository.cs | Adapter/Persistence/Repository.cs, CreatureEntity.cs (alias `Entity`) |
| Adapter/Persistence/PersistedCreatures.cs | Domain/Service/Creatures.cs, Adapter/Persistence/CreatureRepository.cs, CreatureEntity.cs, Domain/Model/Creature.cs, CreatureId.cs, NoSuchCreatureException.cs, HitPoints.cs, Application/CreatureFacade.cs (upward) |
| Application/CreatureFacade.cs | Domain/Model/LairAttribute.cs, CreatureType.cs, Speed.cs, ArmorClass.cs, Creature.cs, CreatureId.cs, HitPoints.cs, SpeedType.cs, Domain/Service/CreatureService.cs, Application/Dto/Creature.cs |
| Application/CreatureUtil.cs | Domain/Model/Creature.cs, Dice.cs (`using static`), Experience.cs (`XPValue`), Centaur.cs; NOT Fightable.cs |
| (with --include-tests) CreatureServiceTests.cs | Domain/Service/Creatures.cs, CreatureService.cs, Domain/Model/Speed.cs, Experience.cs, Creature.cs, CreatureId.cs, CreatureType.cs, SpeedType.cs |

No edges expected from: HitPoints, Speed, SpeedType, CreatureType, CreatureId, Fightable, LairAttribute, Dice (DiceRoll is in the same file), Repository, Dto/Creature, GlobalUsings.

Round 2 additions (written before the round-2 parser run; each row is the only way the `from` file depends on the
`to` file):

| from | to | form |
| --- | --- | --- |
| Application/CreatureKinds.cs | Domain/Model/Centaur.cs | `typeof(Centaur)` as the only usage |
| Application/CreatureKinds.cs | Domain/Model/Creature.cs | `nameof(Creature)` as the only usage |
| Application/CreatureFacade.Stable.cs | Domain/Model/Dice.cs | second part of `partial class CreatureFacade` (`DiceRoll RollForStable() => Dice.Roll(..)`); the leaf `CreatureFacade` must stay one declaration and the round-1 incoming edges `Creature.cs -> CreatureFacade.cs`, `PersistedCreatures.cs -> CreatureFacade.cs` must stay on `CreatureFacade.cs` |
| Application/CentaurHerd.cs | Domain/Model/Centaur.cs | type used only as generic argument (`List<Centaur> members`) |
| Application/CreatureLookup.cs | Domain/Model/NoSuchCreatureException.cs | type used only in `catch (NoSuchCreatureException)`; the same file also has ordinary edges to Domain/Service/CreatureService.cs, Domain/Model/Creature.cs, CreatureId.cs |
| Application/CreatureChecks.cs | Domain/Model/Creature.cs | type used only as a lambda parameter (`(Creature creature) => ...` assigned to a `Delegate`) |
| Application/BestiaryImport.cs | Domain/Model/SpeedType.cs | `extern alias Bestiary;` + `Bestiary::De.Sots...Domain.Model.SpeedType.Flying` (only reference; will not compile without an aliased assembly reference, the file must still parse) |
| Domain/Model/Tameable.cs | Domain/Model/Dice.cs | interface with a default method whose body calls `Dice.RollD20()`; leaf kind INTERFACE |
| Application/StableLedger.cs | Domain/Model/HitPoints.cs | `using ...Domain.Model;` placed inside the block-scoped `namespace { }` of the same file |
| Application/StableReport.cs | Domain/Model/HitPoints.cs | bare `HitPoints` with no `using` of its own, "relying" on the namespace-block `using` in StableLedger.cs (not legal C#, a using inside a block is file-local; a strict resolver reports no edge, a lenient one the edge) |

No edges expected from: CentaurHerd, CreatureKinds, CreatureChecks, BestiaryImport, StableLedger, StableReport, Tameable other than the ones above. No new incoming edges to any round-2 file.

Expected cycles: Creature -> CreatureFacade -> CreatureService -> Creatures -> Creature; Creature <-> CreatureFacade; ArmorClass -> CreatureUtil -> Creature -> ArmorClass.
Expected upward edges: ArmorClass -> CreatureUtil, Creature -> CreatureFacade, PersistedCreatures -> CreatureFacade.

## Dependency parser
- Commands (from the README, `LANG_DIR=training/csharp`): `dependencyparser -nc ... -o output/dependency.cc.json`
  and the same with `--include-tests -o output/dependency-with-tests.cc.json`. Both exit 0, no analyzer warnings
  (only the JVM native-access warning and "No .gitignore found"). 22 leaves / 41 file edges without tests,
  23 leaves / 49 file edges with tests. Stderr is in `output/*.stderr.txt`.
- To separate "construct not supported" from "my file was odd", each construct was also run in isolation in a
  scratch project (one class per file, `using X.M;` at the top). Those results are quoted below as "isolated".

| # | construct (file) | expected edge(s) | found | verdict |
| --- | --- | --- | --- | --- |
| 1 | `using Entity = ...CreatureEntity;` inside block namespace (`CreatureRepository.cs`) | CreatureRepository -> CreatureEntity | no | missing. Isolated: a type alias is not resolved at all, neither at file top nor inside the namespace block; the alias name `Entity` is looked up as a type and finds nothing |
| 1b | namespace alias `using Dto = ...Application.Dto;` + `Dto.Creature` (`CreatureFacade.cs`) | CreatureFacade -> Dto/Creature | yes | ok (qualified name `Dto.Creature` resolves, probably by simple name) |
| 2 | `using De.Sots.CellarsAndCentaurs.Domain.Model;` (`CreatureUtil.cs`) | CreatureUtil -> Creature, Experience | yes | ok |
| 2b | `using static ...Domain.Model.Dice;` + bare `RollD20()` (`CreatureUtil.cs`) | CreatureUtil -> Dice | no | missing. Isolated: `using static` never creates an edge; the qualified form `Dice.RollD20()` does |
| 3 | upward dependency `Creature -> CreatureFacade` (static member) | edge, cyclic, upwards | yes, `[isCyclic, isPointingUpwards]` | ok |
| 3 | `ArmorClass -> CreatureUtil` (static member) | edge, cyclic, upwards | yes, `[isCyclic, isPointingUpwards]` | ok |
| 3 | `PersistedCreatures -> CreatureFacade` | edge, upwards | edge yes, flag no | ok as designed: levels come from the graph (Adapter=2, Application=1), not from the layer names, so adapter -> application is "downwards" |
| 4 | `Centaur : Creature` | Centaur -> Creature | yes | ok, but usage kind is the generic `usage`, inheritance is not distinguished |
| 4 | `Creature : Fightable` | Creature -> Fightable | yes | ok |
| 4 | `PersistedCreatures : Creatures` | PersistedCreatures -> Creatures | yes | ok |
| 5 | `CreatureRepository : Repository<Entity>` | CreatureRepository -> Repository | yes | ok (the generic argument is the alias of #1 and is lost) |
| 6 | type position only: `Speed` params in `CreatureFacade.Create` | CreatureFacade -> Speed | yes | ok |
| 6 | `new` only: `new CreatureId(entity.Id)` (`PersistedCreatures.cs`) | PersistedCreatures -> CreatureId | yes | ok |
| 6 | static member only: `HitPoints.Init(...)` (`PersistedCreatures.cs`) | PersistedCreatures -> HitPoints | yes | ok |
| 6 | attribute only: `[Lair("centaur-stable")]` (`CreatureFacade.cs`) | CreatureFacade -> LairAttribute | yes | ok, the `Attribute` suffix convention is applied |
| 6b | property type only: `public ArmorClass? ArmorClass`, `public HitPoints? HitPoints` (`Creature.cs`) | Creature -> ArmorClass, Creature -> HitPoints | no | missing. Isolated: the type of a property declaration is never collected (`public T01 Value { get; set; }` gives nothing; fields, parameters, return types, locals do). Not caused by nullable `?` or by the property having the same name as its type |
| 7 | `Creature` (domain) and `Dto.Creature` both from `CreatureFacade` | two edges | both | ok, both leaves are kept apart (`Domain.Model.Creature`, `Application.Dto.Creature`) |
| 8 | fully qualified `De.Sots.CellarsAndCentaurs.Domain.Model.Speed` without a matching using | CreatureFacade -> Speed | yes | ok (isolated: a fully qualified reference in a file with no `using` at all resolves) |
| 9 | unused `using Fightable = ...;` (`CreatureUtil.cs`) | none | none | ok, but see #1: aliases are ignored altogether, so this is a side effect rather than "unused import detected" |
| 10 | `System.*`, `ILogger<T>`, `[Table]`, `[Key]`, `Xunit`, `NSubstitute` | no internal edges | none | ok |
| 11 | `CreatureServiceTests.cs` (`tests/` dir and `Tests` suffix) | skipped by default, 8 edges with `--include-tests` | exactly that | ok |
| 12 | `Dice` + `DiceRoll` in `Dice.cs` | two leaves, one leaf edge Dice -> DiceRoll, no file edge | exactly that | ok |
| 12 | `XPValue` in `Experience.cs` | CreatureUtil -> Experience.cs | yes | ok, resolution goes by declaration, not file name |
| 13 | `global using De.Sots.CellarsAndCentaurs.Domain.Model;` in `GlobalUsings.cs`, `CreatureType` ctor param in `CreatureEntity.cs` | CreatureEntity -> CreatureType | no | missing. `global using` is only seen inside its own file (the analyzer takes `result.imports` per file), so a project that keeps its usings in `GlobalUsings.cs` / `<Using Include>` loses every cross-namespace edge |
| 13 | `creature is Centaur` (`CreatureUtil.cs`) | CreatureUtil -> Centaur | no | missing. Isolated: `is T` (expression and `if` body) and `typeof(T)` give nothing; `as T` and `(T) o` do |

- False positives: none. No edge points at a `System`, `Microsoft`, `Xunit` or `NSubstitute` name, `GlobalUsings.cs`
  produces no leaf and no edge, the same-named `Dto.Creature` is never confused with the domain `Creature`.
- Cycles: `Creature <-> CreatureFacade`, `CreatureFacade -> CreatureService -> Creatures -> Creature`,
  `ArmorClass -> CreatureUtil -> Creature -> CreatureFacade -> ArmorClass` and `CreatureUtil -> Experience ->
  Creature -> ...` are all flagged `isCyclic` on every participating edge (14 of 41 edges). Correct for the graph the
  parser found; the true `Creature -> ArmorClass` cycle edge is missing because of the property-type gap above.
- Upward edges: `ArmorClass -> CreatureUtil` and `Creature -> CreatureFacade` are flagged. `PersistedCreatures ->
  CreatureFacade` is not; folder levels are `Adapter=2`, `Application=1`, `Domain=0`, which is the graph order,
  not the architectural one, so this is consistent.
- Levels: files inside `Domain/Model` get 0..2 (`Creature.cs`=1, `Centaur.cs`=2, `Experience.cs`=2), leaves
  0..3 (`Creature`=2, `Centaur`=3, `XPValue`=3). The test file has level 0 in the `--include-tests` run although it
  depends on level-1/2 files; levels look like they are computed per sibling group, so a lone file in `tests/` is
  always 0. Not wrong, but a reader comparing `src` and `tests` levels will misread it.
- Metrics: `incoming_dependencies` / `outgoing_dependencies` match the edge list exactly (e.g. `Creature.cs` 7/7,
  `CreatureId.cs` 0/7, `CreatureFacade.cs` 10/2, test file 8/0). They inherit the missing edges above
  (`Creature.cs` should be 9 outgoing, `ArmorClass.cs` and `HitPoints.cs` one more incoming each).
- Leaf kinds: `CLASS`, `INTERFACE`, `ENUM` are right for classes, `Fightable`/`Creatures` and the two enums.
  `record CreatureId`, `record struct DiceRoll`, `record struct XPValue`, `record Dto.Creature` and `static class Dice`
  are all `CLASS`; there is no `RECORD`/`STRUCT` kind. `LairAttribute` is `CLASS` (fine). Every leaf edge has
  `usage=usage`; inheritance, implementation and attribute usage are not distinguished. No `REEXPORT` kind is needed
  because C# has no barrel.
- What C# offers natively and what CodeCharta resolves itself: C# has no module system, only namespaces plus
  `using` (namespace = wildcard), `using static`, `using X = ...` aliases and `global using`. Files and folders carry no
  meaning for resolution, so the parser must resolve every simple name against (own namespace + imported
  namespaces), which it does for namespace usings and fully qualified names. It does not resolve the alias forms,
  `using static`, or usings that live in another file (`global using`), and it does not collect property types,
  `is` patterns or `typeof`.

## Domain language parser
- Commands: `domainlanguageparser -nc ... -o output/domain.cc.json` (exit 0, 24 files, 38 nodes). Extra runs kept
  in `output/`: `domain-MINIMAL`, `domain-AGGRESSIVE`, `domain-notests` (`--exclude-tests`), `domain-flat-weights`
  (`--identifier-weight 1 --comment-weight 1 --string-weight 1`). `--string-weight 0` / `--comment-weight 0` are
  rejected with `IllegalArgumentException: --string-weight must be positive, got 0` (stack trace on stderr, exit 1),
  so the weights were inferred from the flat-weights run instead: identifier 3, comment 2, string 1.
- Only declared names are counted (class, method, property, field, parameter and local names), not type references
  or member accesses: `CreatureFacade.cs` has 7 declarations containing "creature" and dozens of references, and the
  flat-weights run gives `creature(8)` = 7 declarations + 1 comment word. Root has 83 words after filtering.

| expected word | root frequency | note |
| --- | --- | --- |
| creature | 118 | |
| centaur | 11 | plus `centaurs(2)` from the doc comment, no stemming |
| cellar | 2 | doc comment on `Creature` only |
| dungeon | 3 | line comment (2) + exception string (1) |
| armor | 21 | |
| hit | 28 | |
| points | 31 | |
| speed | 36 | plus `speeds(5)` |
| damage | 17 | |
| lair | 8 | `LairAttribute` (6) + doc comment (2) |
| initiative | 11 | |
| encounter | 2 | line comment |
| treasure | 5 | block comment (2) + `TreasureHoard` (3) |
| hoard | 5 | same |
| stable | 11 | `DEFAULT_STABLE` (6) + `centaur-stable` strings (2) + `should_save_creature_to_the_stable` (3) |
| dice | 6 | |
| roll | 12 | plus `rolls(2)` |

All 17 appear at the root.

- Keyword leakage: none of the 242 C# keywords / .NET type names leaks (`class`, `public`, `string`, `int`,
  `override`, `record`, `struct`, `Guid`, `Dictionary`, `Exception`, `Attribute` are all absent). `value` (from
  `xp_value`, `XPValue`) is filtered because `value` is a C# contextual keyword; arguably a loss since it is a real
  word, but consistent with the list.
- Technical stop-word leakage at `MODERATE`: none of the MODERATE list leaks (`util`, `service`, `save`, `find`,
  `create`, `exception`, `test` are absent). Words that are only on the AGGRESSIVE list and therefore show up:
  `entity(15)`, `repository(12)`, `facade(6)`, `logger(6)`. That is right for MODERATE by definition; whether
  `entity`/`repository` should be domain words is the usual DDD ambiguity. `id(51)` is the second most frequent word
  and is on no list; for C# code (`Id` properties everywhere) it is pure noise and should probably be a MODERATE
  stop word. Also leaking: `summary(8)` from the `<summary>` tags of XML doc comments (wrong, this is markup),
  `persisted(6)`, `standard(6)`, `item(9)`, `store(3)`, `one(3)` (from `FindOne`), `per(10)` (from
  `FeetPerRound`), `such(7)` (from `NoSuchCreatureException`), `all(5)` (`FindAll` + comment), `assert(2)` (the
  `// Assert` comment in the test, not the `Assert.Equal` call), `take(6)` (`TakeDamage`). `such`, `per`, `all`,
  `one`, `every`, `before` are English function words that the English stop list does not catch when they come from
  identifier splitting.
- `--stop-word-level MINIMAL` adds `find(18)`, `service(18)`, `save(12)`, `create(3)` (the CRUD / pattern words);
  `AGGRESSIVE` removes exactly `entity`, `repository`, `facade`, `logger` and nothing else. No other word changes.

| form | identifier | words found | verdict |
| --- | --- | --- | --- |
| camelCase | `walkingSpeed` (CreatureFacade param) | walking, speed | ok |
| snake_case | `walking_speed` (test local) | walking, speed | ok |
| SCREAMING_SNAKE | `MAX_HIT_POINTS` | max, hit, points | ok |
| PascalCase | `ArmorClass` | armor (class filtered as keyword) | ok |
| Acronym | `XPValue`, `xp_value`, `xpValue` | xp (value filtered as keyword) | ok, acronym kept intact, 3 occurrences x 3 = `xp(9)` |
| Digit | `d20Roll` (CreatureUtil local) | d20, roll | ok |
| Digit, other side | `RollD20` (Dice method) | roll, 20 (`d` dropped as single letter) | inconsistent with `d20Roll`: a trailing `D20` is split into `D` + `20`, so `20(3)` appears as a word at the root |
| Kebab in string | `"centaur-stable"` | centaur, stable | ok, weight 1 each per occurrence |

- Comments and strings: all five planted texts are counted. `Creature.cs` doc comment: `cellar(2)`, `roams(2)`,
  `centaurs(2)`, `beasts(2)`, `dragons(2)`, `share(2)`, `all(2)`; `HitPoints.cs` doc comment: `drop(2)`,
  `recover(2)`, `rests(2)`, `lair(2)`, `takes(2)`; line comment in `CreatureFacade.Create`: `rolls(2)`,
  `initiative(2)`, `dungeon(2)`, `encounter(2)`, `starts(2)`, `every(2)`, `before(2)`; block comment in
  `CreatureUtil`: `counts(2)`, `treasure(2 of 5)`, `hoard(2 of 5)`, `guards(2)`; string in
  `NoSuchCreatureException`: `dungeon(1)`, `such(1 of 7)`, `creature(1 of 10)`. The weights 3/2/1 are visible in the
  frequencies and confirmed by the flat-weights run. No stemming (`centaur`/`centaurs`, `roll`/`rolls`,
  `damage`/`damaged`, `rest`/`rests`/`rested` are separate words). The XML doc tag name `summary` is counted as a
  comment word (`summary(8)` at root, 4 per doc comment), which is wrong.
- Test file handling: included by default (`tests/.../CreatureServiceTests.cs` node with `creature(9)`,
  `creatures(3)`, `speed(3)`, `stable(3)`, `walking(3)`, `xp(3)`, `assert(2)`); the method name
  `should_save_creature_to_the_stable` contributes `creature`, `stable` (`should`, `to`, `the` are English stop
  words, `save` a MODERATE stop word). `--exclude-tests` removes the whole `tests` subtree and only `assert` disappears
  from the root; the other test words also exist in `src`. `test`/`tests` never appear, neither from the folder
  names nor from the class name `CreatureServiceTests` (`tests` is on the MODERATE list).
- `GlobalUsings.cs` is a node with an empty word list (correct, it declares nothing).

## Round 2: additional dependency forms

- Added 9 files (8 new declarations + the second part of `CreatureFacade`), 33 `.cs` files now. The only edit to a
  round-1 file is the `partial` modifier on `CreatureFacade` (`Application/CreatureFacade.cs`), required by the form.
  New files: `Application/CreatureKinds.cs`, `CreatureFacade.Stable.cs`, `CentaurHerd.cs`, `CreatureLookup.cs`,
  `CreatureChecks.cs`, `BestiaryImport.cs`, `StableLedger.cs`, `StableReport.cs`, `Domain/Model/Tameable.cs`.
- All three README commands exit 0 again (stderr in `output/*.stderr.txt`). Default run: 31 leaves / 48 file edges
  (41 + 7), `--include-tests`: 32 leaves / 56 file edges (49 + 7). Both dependency runs print a new warning:
  `1 declaration(s) share a logical path with an earlier one, e.g. 'De.Sots.CellarsAndCentaurs.Application.CreatureFacade';
  keeping the first of each.` Domain run: 33 files, 47 nodes, no error.
- Where a form gave nothing, the variant was rerun in a scratch project ("isolated") to separate the form from the
  file it sits in.

| form | file(s) | expected edge | found | note |
| --- | --- | --- | --- | --- |
| `typeof(Centaur)` as the only usage | `Application/CreatureKinds.cs` | CreatureKinds -> Centaur.cs | no | `CreatureKinds.cs` has 0 outgoing edges. Isolated: `typeof(T)` gives nothing, neither as a field initializer nor inside an expression (`o.GetType() == typeof(T)`) |
| `nameof(Creature)` as the only usage | `Application/CreatureKinds.cs` | CreatureKinds -> Creature.cs | no | Isolated: bare `nameof(T)` gives nothing, but `nameof(T.Member)` does resolve `T` (the member-access form is collected, the identifier form is not) |
| `partial class CreatureFacade` in two files | `Application/CreatureFacade.cs` + `CreatureFacade.Stable.cs` | CreatureFacade.Stable.cs -> Dice.cs; leaf `CreatureFacade` once; incoming edges stay on `CreatureFacade.cs` | wrong target | The second part's own edge is there (`CreatureFacade.Stable.cs -> Dice.cs x2`, leaf edges `CreatureFacade -> Dice`, `-> DiceRoll` merged into the one leaf). But the leaf is mapped to `CreatureFacade.Stable.cs` (the alphabetically first file, `.S` < `.c`), so both round-1 incoming edges `Creature.cs -> CreatureFacade.cs` and `PersistedCreatures.cs -> CreatureFacade.cs` now point at `CreatureFacade.Stable.cs`; `CreatureFacade.cs` keeps its 10 outgoing edges and drops to 0 incoming. Outgoing file edges are attributed per file, incoming ones per leaf, which is inconsistent for a split declaration |
| type used only as a generic argument (`List<Centaur>`) | `Application/CentaurHerd.cs` | CentaurHerd -> Centaur.cs | yes | generic arguments of a field type are collected (the round-1 loss on `Repository<Entity>` was the alias, not the generic argument) |
| type used only in `catch (NoSuchCreatureException)` | `Application/CreatureLookup.cs` | CreatureLookup -> NoSuchCreatureException.cs | no | the ordinary edges of the same file (`-> CreatureService.cs`, `Creature.cs`, `CreatureId.cs`) are all there, the catch type is not. Isolated: `catch (T name)` with a variable gives nothing either |
| type used only as a lambda parameter | `Application/CreatureChecks.cs` | CreatureChecks -> Creature.cs | no | 0 outgoing edges. Isolated: an explicitly typed lambda parameter (`(Creature creature) => ...`) gives nothing, whether the lambda is assigned to a `Delegate` field or a `var` local |
| `extern alias Bestiary;` + `Bestiary::De.Sots...SpeedType` | `Application/BestiaryImport.cs` | BestiaryImport -> SpeedType.cs (or at least: file still parses) | no | the file parses (leaf `BestiaryImport` exists, `extern alias` does not break a file that also has normal usings: isolated B). The alias-qualified name is the problem: the same file without `Bestiary::` resolves (isolated A), and `using Bestiary::Iso.Model;` is not treated as an import either (isolated C). Alias-qualified names (`X::Y`, also `global::Y`) are never resolved |
| interface with a default method | `Domain/Model/Tameable.cs` | Tameable -> Dice.cs, kind INTERFACE | yes | `Tameable.cs -> Dice.cs`, leaf `Tameable kind=INTERFACE`; the default method body is scanned like a class method |
| `using` inside the namespace block, same file | `Application/StableLedger.cs` | StableLedger -> HitPoints.cs | yes | a namespace `using` inside a block-scoped `namespace { }` is applied to the file (round 1 only showed that a `using X = ...` alias in that position fails) |
| bare `HitPoints` relying on the other file's namespace-block `using` | `Application/StableReport.cs` | StableReport -> HitPoints.cs (lenient) or nothing (strict) | no | 0 outgoing edges; usings never leak across files, consistent with C# and with the `global using` behaviour of round 1 (#13). Strict is the right call here, but it means the parser has no fallback by unique simple name at all |

- Round-1 edges that changed: `Creature.cs -> CreatureFacade.cs` and `PersistedCreatures.cs -> CreatureFacade.cs`
  now point at `CreatureFacade.Stable.cs` (see the `partial` row). As a consequence every `isCyclic` flag is gone: round
  1 had 14 cyclic file edges, round 2 has 0 (stderr: `Found 1 strongly connected components`, `Found a total of 0
  cycles`), because the file-level path `Creature.cs -> CreatureFacade.Stable.cs -> Dice.cs` no longer leads back to
  `Creature.cs`. The leaf-level cycle `Creature -> CreatureFacade -> Creature` still exists in `leafEdges`, so the
  file cycle flags and the leaf graph now contradict each other. `isPointingUpwards` on `ArmorClass.cs -> CreatureUtil.cs`
  and `Creature.cs -> CreatureFacade.Stable.cs` is kept. All other 39 round-1 edges are unchanged, the
  `--include-tests` edges of `CreatureServiceTests.cs` too.
- New false positives: none. `CreatureLookup.cs` gets exactly the three ordinary edges it should have,
  `CreatureKinds.cs`, `CreatureChecks.cs`, `BestiaryImport.cs`, `StableReport.cs` get none (which is the missing kind of
  wrong, not the extra kind), no edge points at a `System` name (`Type`, `Delegate`, `List`).
- Domain parser after round 2: all 17 expected words still at the root (`creature(145)`, `stable(23)`, `centaur(17)`,
  `roll(15)`, ...), the planted sentences are unchanged. New identifier fragments that leak as ordinary words:
  `kind(6)`, `lookup(6)`, `import(3)`, `report(3)`, `ledger(3)`, `herd(3)`, `members(3)`, `candidate(3)`, `bestiary(3)`,
  `flight(3)`, `die(3)`; none of them is a keyword or on the MODERATE list, so nothing changes in the round-1 domain verdict.

## Verdict
- Good: namespace `using`, fully qualified names, generics, `new`, static access, base types, interfaces, attributes
  (with the `Attribute` suffix rule), casts, `as`, locals, nullable types, same-simple-name classes in two
  namespaces, multi-declaration files and file-name/declaration mismatch all resolve; no false positives from
  `System`/`Microsoft`/`Xunit`/`NSubstitute`; cycles and graph-based upward edges are flagged consistently; test
  detection works by folder and by `Tests` suffix; the domain parser finds all 17 words, lets no keyword and no
  MODERATE stop word through, splits every identifier form correctly and weights identifier/comment/string 3/2/1.
  Round 2 adds: generic arguments (`List<Centaur>`), interface default method bodies (with kind `INTERFACE`), a
  namespace `using` inside a block-scoped namespace, and no cross-file leakage of usings (strict like the compiler).
- Wrong:
  1. `Creature.cs`: the property types `ArmorClass? ArmorClass` and `HitPoints? HitPoints` produce no edge; property
     declaration types are never collected in C#, where properties are the main way to hold a reference. This drops
     two edges and the true `Creature -> ArmorClass` cycle edge.
  2. `CreatureRepository.cs`: `using Entity = ...CreatureEntity;` is not resolved, `CreatureRepository -> CreatureEntity`
     is missing (alias at file top fails just the same in isolation).
  3. `CreatureUtil.cs`: `creature is Centaur` gives no edge (`is` patterns and `typeof` are skipped while `as` and
     casts are collected).
  4. `CreatureUtil.cs`: `using static ...Dice;` + `RollD20()` gives no `CreatureUtil -> Dice` edge.
  5. `CreatureEntity.cs` / `GlobalUsings.cs`: the `global using` in another file is not applied, so
     `CreatureEntity -> CreatureType` is missing; in real .NET 6+ projects most usings live there.
  6. Domain: `summary(8)` at the root comes from `<summary>` XML doc tags; XML doc markup should be stripped.
  7. Domain: `RollD20` splits into `roll` + `20` (the `d` is dropped), `d20Roll` keeps `d20`; a bare `20` at the root
     is noise.
  8. Domain: `id(51)` is the second most frequent root word; identifier fragments `such`, `per`, `all`, `one` leak
     as English function words.
  9. Round 2, `CreatureFacade.cs` + `CreatureFacade.Stable.cs`: a `partial class` is mapped to one file only (the
     alphabetically first part, with the warning `declaration(s) share a logical path ... keeping the first`), so
     every incoming edge to `CreatureFacade` moved from `CreatureFacade.cs` to `CreatureFacade.Stable.cs` and all 14
     round-1 `isCyclic` flags disappeared although the leaf graph still contains the cycle. Partial classes are the
     norm in generated .NET code (designer files, source generators, EF), so this affects real projects.
  10. Round 2, `CreatureKinds.cs`: `typeof(Centaur)` and bare `nameof(Creature)` give no edge (`nameof(T.Member)` does).
  11. Round 2, `CreatureLookup.cs`: the type in `catch (NoSuchCreatureException)` gives no edge (with or without a
      variable name).
  12. Round 2, `CreatureChecks.cs`: an explicitly typed lambda parameter `(Creature creature) => ...` gives no edge.
  13. Round 2, `BestiaryImport.cs`: alias-qualified names (`Bestiary::De.Sots...SpeedType`, also `using X::...`) are
      never resolved; the `extern alias` directive itself is harmless.
- Missing (language has no such construct): free functions (used `Dice.RollD20` static member), a barrel / re-export
  module (used `global using` as the nearest thing, see Wrong 5). Not provided by the parser: a `RECORD`/`STRUCT` leaf
  kind (records and record structs are `CLASS`), usage kinds other than `usage` (inheritance vs. implementation vs.
  attribute are not told apart), `--string-weight 0` / `--comment-weight 0` (rejected as non-positive, so
  "comments only" or "identifiers only" comparisons need the weight 1 workaround), stemming in the domain parser.
  Round 2: every requested form exists in C#, none had to be skipped; `extern alias` is declared without an aliased
  assembly reference in the `.csproj`, so that one file will not compile but parses.
