# Delphi (Object Pascal)

## Project

- Layout: `CellarsAndCentaurs.dpr` (program) at the root, units under `src/<layer>/` in dotted-unit-name
  files (`de.sots.cellarsandcentaurs.domain.model.Creature.pas`, the file name must equal the unit name in
  Delphi), the DUnitX test under `tests/`. 23 `.pas` + 1 `.dpr` = 24 source files.
- Declarations follow Delphi casing: `TCreature`, `ICreatures`, `ENoSuchCreatureException`, enum values
  `ctMonstrosity` / `stWalking`. `TCreatureId`, `THitPoints`, `TSpeed`, `TDice`, `TDiceRoll` are records.
- Every unit uses the two `uses` clauses Delphi has: the interface `uses` for types in the declaration and
  the implementation `uses` for types only needed in method bodies. Cycles between units are only legal
  through the implementation `uses`, which is exactly how the `Creature -> Api -> CreatureFacade ->
  CreatureService -> Creature` cycle is written here (`Creature`, `ArmorClass`, `PersistedCreatures`).

Stress constructs and how Delphi expresses them:

| # | Construct | Delphi | Where |
| --- | --- | --- | --- |
| 1 | Aliased import | none (`uses` has no `as`); the nearest thing is a type alias `TEntity = TCreatureEntity;` | `CreatureRepository` |
| 2 | Wildcard import | none; every `uses` entry imports a whole unit, there is no package wildcard | `CreatureUtil` uses the fully qualified type `de.sots...Speed.TSpeed` instead |
| 3 | Barrel / re-export | none; a unit can only re-publish types via type aliases `TCreatureFacade = ...CreatureFacade.TCreatureFacade;` | `application.Api` |
| 4 | Inheritance / interface | `TCentaur = class(TCreature)`, `TCreature = class(TInterfacedObject, IFightable)`, `TPersistedCreatures = class(TInterfacedObject, ICreatures)` | yes |
| 5 | Generics | `TRepository<T: class>` in `Repository`, `TCreatureRepository = class(TRepository<TEntity>)` | yes |
| 6 | Type position / new / static / attribute | parameter types everywhere; `TCreatureEntity.Create` only instantiated; `TCreatureFacade.STANDARD_CREATURE_TYPE` class const; `[Table('creatures')]` attribute (class `TableAttribute` in `Mapping`) | yes |
| 7 | Same simple name | `domain.model.Creature.TCreature` and `application.dto.Creature.TCreature`, both used from `CreatureFacade` (the DTO fully qualified, the domain class last in `uses`, as Delphi's last-unit-wins rule requires) | yes |
| 8 | Fully qualified reference without import | not legal in Delphi (the unit must be in `uses`); the Delphi counterpart is a short unit name `uses SpeedType;` resolved by the project's unit scope names | `CreatureUtil` |
| 9 | Unused import | `Fightable` in `CreatureUtil` | yes |
| 10 | Standard / third-party | `System.SysUtils`, `System.Generics.Collections`, `System.Math`, `Spring.Logging` (`ILogger`), `DUnitX.TestFramework` | yes |
| 11 | Test file | `tests/...CreatureServiceTest.pas`, DUnitX fixture, method `should_save_creature_to_the_stable` | yes |
| 12 | Multiple declarations, name differs | `Dice` holds `TDice`, `TDiceRoll` and the free function `RollD20`; every Delphi file name differs from its declaration by the `T`/`I`/`E` prefix | yes |
| extra | Program file | `CellarsAndCentaurs.dpr` with `uses Unit in 'path'` entries, no type declaration | yes |
| extra | Enum value only | `ctMonstrosity` in `Centaur`, `stWalking` etc. in `CreatureFacade` (implementation `uses` of `CreatureType` / `SpeedType`) | yes |
| extra | Free function only | `RollD20` from `Dice` called in `Centaur.Attack` | yes |

## Expected file-level edges (written before the first parser run)

Unit names are shortened to their last segment; `dto.Creature` is `de.sots.cellarsandcentaurs.application.dto.Creature`.
`(impl)` marks a dependency that only appears in the `uses` clause of the implementation section.

| from | to |
| --- | --- |
| Creature | CreatureId, CreatureType, ArmorClass, SpeedType, Speed, HitPoints, Fightable, Api (impl) |
| ArmorClass | Api (impl) |
| NoSuchCreatureException | CreatureId |
| Centaur | Creature, CreatureId, Speed, Fightable, CreatureType (impl, enum value only), Dice (impl, free function only) |
| Creatures | Creature, CreatureId |
| CreatureService | Creatures, Creature |
| CreatureEntity | Mapping (attribute only) |
| CreatureRepository | Repository, CreatureEntity |
| PersistedCreatures | CreatureRepository, Creatures, Creature, CreatureId, CreatureEntity (impl), NoSuchCreatureException (impl), Api (impl) |
| Api | CreatureFacade, CreatureUtil |
| CreatureFacade | dto.Creature, CreatureService, CreatureType, Speed, ArmorClass, Creature, CreatureId (impl), HitPoints (impl), SpeedType (impl) |
| CreatureUtil | Creature, Speed, SpeedType (short unit name via unit scope); Fightable is imported but unused |
| CellarsAndCentaurs.dpr | CreatureRepository, CreatureService, PersistedCreatures, CreatureFacade, Creature, CreatureType, Speed, ArmorClass (program, no declaration) |
| CreatureServiceTest (only with `--include-tests`) | CreatureService, Creatures, Creature, CreatureId, Speed (impl), SpeedType (impl) |

Round 2 additions (written before the second parser run; new files only, round-1 files untouched):

| from | to | form |
| --- | --- | --- |
| Lair | Constants.inc | `{$I Constants.inc}` include file declaring `MAX_LAIR_TREASURE`, used in `TLair.IsFull` |
| CreatureHelper | Creature | `TCreatureHelper = class helper for TCreature` |
| CreatureGateway | Creatures | `property Creatures: ICreatures read FCreatures implements ICreatures` (delegation; the class header and the field type also name `ICreatures`, so the edge cannot be isolated to the `implements` clause) |
| CellarsAndCentaurs.dpk | all 29 units under `contains` | `.dpk` package file with `contains ... in '...'` entries, no declaration |
| CreatureForm | Creature | `.dfm`-less `TForm` unit, `TCreature.ClassName` is the only reference (static class-method access) |
| Bootstrap | CreatureUtil | unit used only in the `initialization` section (`TCreatureUtil.STANDARD_ARMOR_CLASS_DESCRIPTION`) |
| Lair | Treasure | same unit `Treasure` in the interface `uses` of `Lair` ... |
| CreatureForm | Treasure | ... and in the implementation `uses` of `CreatureForm` (`TTreasure.Create` in a method body) |
| Herd | Centaur | `TCentaur` used only as a generic argument (`TList<TCentaur>` field and constructor call) |

9 new expected edges from `.pas` files plus the 29 package edges. No edges expected from `Treasure`. Not
expressible: none of the requested forms is missing from Delphi.

52 edges without the test file. No edges expected from: Fightable, CreatureId, CreatureType, SpeedType, Speed,
HitPoints, Dice, Mapping, Repository, dto.Creature.
Expected cycle: Creature -> Api -> CreatureFacade -> CreatureService -> Creature (and ArmorClass -> Api ->
CreatureFacade -> Creature -> ArmorClass). Expected upward edges: Creature -> Api, ArmorClass -> Api,
PersistedCreatures -> Api.

## Dependency parser

Commands (both ran without error, exit 0, stderr in `output/*.stderr.log`; `--verbose` adds nothing for Delphi):

```
ccsh dependencyparser -nc training/delphi -e "output,FINDINGS.md" -o output/dependency.cc.json
ccsh dependencyparser -nc training/delphi -e "output,FINDINGS.md" --include-tests -o output/dependency-with-tests.cc.json
```

Result: 21 file nodes, 23 leaves, 32 file edges, 33 leaf edges, no cycle, no upward edge. All 32 reported
edges are correct (no false positive); 20 of the 52 expected edges are missing.

| Construct | Expected edge(s) | Found | Verdict |
| --- | --- | --- | --- |
| Interface `uses` + type in declaration | Creature -> CreatureId, CreatureType, ArmorClass, SpeedType, Speed, HitPoints, Fightable | all 7 | ok |
| Implementation `uses` + type in a method body | PersistedCreatures -> CreatureEntity, NoSuchCreatureException; CreatureFacade -> CreatureId, HitPoints | all 4 | ok, both `uses` clauses are read |
| Inheritance | Centaur -> Creature | yes | ok |
| Interface implementation | Creature -> Fightable, Centaur -> Fightable, PersistedCreatures -> Creatures | yes | ok |
| Generic base `TRepository<TEntity>` | CreatureRepository -> Repository | yes | ok |
| Generic argument through alias `TEntity = TCreatureEntity` (construct 1 substitute) | CreatureRepository -> CreatureEntity | no | missing: the type alias produces no leaf and is not followed |
| Type only in a parameter / field | Creatures -> Creature, CreatureId; CreatureService -> Creatures | yes | ok |
| Type only instantiated | PersistedCreatures -> CreatureEntity | yes | ok |
| Type only via class const | Creature -> Api, ArmorClass -> Api, PersistedCreatures -> Api | no | missing, see below (static access itself works when the unit is used directly, verified in a scratch experiment) |
| Alias-only unit (barrel substitute) | Api -> CreatureFacade, Api -> CreatureUtil; Api present as a file | no; `Api.pas` is not in the file tree at all | missing: a unit with only type aliases has no declaration, so the file is dropped and every edge into it is lost |
| Cycle through the barrel | Creature -> Api -> CreatureFacade -> CreatureService -> Creature | no cycle, no upward edge reported | missing (consequence of the previous row) |
| Same simple name `TCreature` (domain vs. dto) from CreatureFacade | CreatureFacade -> Creature and -> dto.Creature | only -> dto.Creature | wrong: the first `uses` entry that owns a `TCreature` wins for every reference; Delphi takes the last one, and the unit-qualified `de.sots...dto.Creature.TCreature` is ignored (verified: with both references fully qualified, still only one edge) |
| Fully qualified type with unit in `uses` | CreatureUtil -> Speed | yes (also via unqualified `TSpeed.Create`) | ok |
| Short unit name `uses SpeedType;` (unit scope names) | CreatureUtil -> SpeedType | no | missing: the parser cannot know the project's unit scope names; a `.dproj` setting would be needed |
| Unused `uses` (Fightable in CreatureUtil) | none by type usage; a compile dependency in Delphi | none | ok for a type-usage graph; note that in Delphi an unused `uses` still links the unit into the build |
| Attribute `[Table('creatures')]` | CreatureEntity -> Mapping | no | missing: attribute usage is not extracted, and the `Table` -> `TableAttribute` suffix rule would be needed to resolve it |
| Enum value only (`ctMonstrosity`, `stWalking`) | Centaur -> CreatureType, CreatureFacade -> SpeedType, test -> SpeedType | no | missing: enum values are not types; the units are in `uses` but no edge results |
| Free function only (`RollD20`) | Centaur -> Dice | no | missing: function calls are not extracted (verified in a scratch experiment with a direct `uses`); `RollD20` also gets no FUNCTION leaf |
| Standard / third-party (`TDictionary`, `TGUID`, `ILogger`, `Exception`) | no internal edge | none | ok, although Delphi has an `EmptyStandardLibrary` and relies purely on name matching |
| Program `.dpr` with `uses X in 'path'` | dpr -> 8 units | no; the file is not in the tree | missing: a program without a type declaration is dropped like `Api.pas`; a scratch `.dpr` with a class inside is analysed and its `uses ... in '...'` entries resolve, so the grammar handles the syntax |
| Multiple declarations in `Dice` | leaves TDice, TDiceRoll, RollD20 | TDice, TDiceRoll (RollD20 missing) | partly ok |
| Test file in `tests/` (default) | skipped | skipped, `tests/` absent from the tree | ok |
| Test file with `--include-tests` | CreatureServiceTest -> CreatureService, Creatures, Creature, CreatureId, Speed, SpeedType | 5 of 6 (SpeedType enum value) | ok; edge weight x2 to Creature and CreatureId because the file holds two classes |
| Test file next to the source (`...CreatureServiceTests.pas`, `...TestCreatureService.pas`) | skipped by default | not skipped (scratch experiment) | missing: `TestFileDetector` has no name rule for `.pas`, only the `test`/`tests` directory rule |

False positives: none. Cycles: expected 2, reported 0. Upward edges: expected 3, reported 0. Both are lost
with the alias-only `Api` unit; the rest of the layering (`levels`) is consistent with the found edges:
`domain/model` 0, `domain/service` 1, `application` 1, `adapter` 1, `Creature.pas` 1, `Centaur.pas` 2,
`PersistedCreatures.pas` 2.

Metrics: `incoming_dependencies` / `outgoing_dependencies` match the edge list exactly (Creature 5 in / 7
out, CreatureId 6 in, CreatureFacade 7 out). Because the test file holds two classes its outgoing count is 7
for 5 file edges, i.e. the metric counts leaf edges.

Leaf kinds:

| Declaration | Reported | Right? |
| --- | --- | --- |
| classes (`TCreature`, `TCreatureFacade`, ...) | CLASS | yes |
| `IFightable`, `ICreatures` | INTERFACE | yes |
| `TCreatureType`, `TSpeedType` | ENUM | yes |
| records `TCreatureId`, `THitPoints`, `TSpeed`, `TDice`, `TDiceRoll` | CLASS | wrong, VALUECLASS exists and a record is a value type |
| `TableAttribute`, `ColumnAttribute` (`TCustomAttribute` descendants) | CLASS | arguable; ANNOTATION would tell the reader more |
| `ENoSuchCreatureException` | CLASS | yes |
| free function `RollD20` | no leaf | missing, FUNCTION exists |
| type aliases `TEntity`, `Api.TCreatureFacade`, `Api.TCreatureUtil` | no leaf | missing, REEXPORT would be the fitting kind for the `Api` aliases |
| `TCreatureTypes = set of TCreatureType` | no leaf | acceptable |
| program `CellarsAndCentaurs` | no leaf | SCRIPT would be a fitting kind so the file stays on the map |

What Delphi offers and what CodeCharta resolves itself: Delphi has no package system, only units; the dotted
unit name is the only namespace and the analyzer uses it as the package path (`unit a.b.C` -> `a.b.C.TType`).
This makes resolution independent of the folder layout (good), but the parser has to resolve every
identifier by name against the `uses` list: it cannot see unit scope names (`.dproj`), the last-unit-wins rule,
unit-qualified identifiers, or `uses X in 'file'` beyond the syntax. A `uses` entry is only turned into an
edge when a type from that unit is referenced, so unused `uses` and enum-/function-/const-only usages leave no
trace.

## Domain language parser

Not applicable: the domain language parser has no Delphi / Object Pascal grammar, so it was not run
(`applicable=false`). To support the language it would need a tree-sitter Pascal grammar in the source
analyzer factory, a keyword list (`unit`, `interface`, `implementation`, `uses`, `type`, `class`, `record`,
`procedure`, `function`, `begin`, `end`, `var`, `const`, `property`, `read`, `write`, `override`, `virtual`,
`inherited`, `nil`, `Integer`, `string`, `Boolean`, ...), the three comment syntaxes (`//`, `{ }`, `(* *)` and
the `///` XML doc comment), single-quoted string literals with `''` escapes, and ideally stripping of the
`T`/`I`/`E`/`F`/`A` prefixes (`TCreature`, `IFightable`, `ENoSuchCreatureException`, `FHitPoints`, `AId`) and
the enum value prefixes (`ctMonstrosity`, `stWalking`), which would otherwise leak as `t`, `ct`, `st` tokens.

The planted texts and identifiers are in place for a later run: doc comments on `TCreature` and
`THitPoints`, the line comment in `CreatureFacade.CreateCreature`, the block comment in `CreatureUtil`, the
strings `'No such creature in the dungeon: '` and `'centaur-stable'`, the identifiers `walkingSpeed`,
`walking_speed` (test), `MAX_HIT_POINTS`, `ArmorClass`, `XPValue`, `d20Roll` and the test method
`should_save_creature_to_the_stable`.

## Round 2: additional dependency forms

Nine files were added (8 `.pas`, `Constants.inc`, `CellarsAndCentaurs.dpk`), no round-1 file was changed:
`Treasure`, `Lair`, `CreatureHelper`, `Herd` under `domain/model`, `CreatureGateway` under
`adapter/persistence`, `CreatureForm` and `Bootstrap` under `application`. The three README commands were
rerun (`output/*.stderr.log`): both dependency runs exit 0 and scanned 30 files (29 `.pas` + `.dpr`; the
`.dpk` and `.inc` are not scanned, `FileExtension.DELPHI` is `.pas` + `.dpr`); the domain parser still exits 1
with "No analysable source files found" (no Delphi grammar), so `output/domain.cc.json` does not exist.

Result: 28 file nodes, 30 leaves, 38 file edges, 39 leaf edges, still no cycle and no upward edge. The 32
round-1 edges are all present and unchanged (same targets, same weights x1); the 6 new edges are all correct.

| form | file(s) | expected edge | found | note |
| --- | --- | --- | --- | --- |
| `{$I Constants.inc}` include with a constant | `Lair.pas`, `Constants.inc` | Lair -> Constants.inc | no | `.inc` is not a scanned extension, the file is not in the tree; the `{$I}` directive is skipped silently and `MAX_LAIR_TREASURE` in `TLair.IsFull` stays unresolved without breaking the unit (`TLair` leaf and `Lair -> Treasure` are intact) |
| `class helper for TCreature` | `CreatureHelper.pas` | CreatureHelper -> Creature | yes | leaf `TCreatureHelper` reported as CLASS; the helper target is treated like a base class, which is the right edge |
| interface delegation `implements ICreatures` | `CreatureGateway.pas` | CreatureGateway -> Creatures | yes (not isolable) | the `implements` clause parses without damage (leaf and edge present), but the class header and the field type name `ICreatures` too, so this row only proves that delegation does not break the class |
| `.dpk` package with `contains` | `CellarsAndCentaurs.dpk` | dpk -> 29 units | no | `.dpk` is not a scanned extension; like the `.dpr` it holds no declaration, so even a scanned package file would be dropped from the tree (round 1) |
| `.dfm`-less form unit, `TCreature.ClassName` only | `CreatureForm.pas` | CreatureForm -> Creature | yes | static class-method access on a class reference gives the edge; `TForm` from `Vcl.Forms` produces no edge, correct |
| unit used only in `initialization` | `Bootstrap.pas` | Bootstrap -> CreatureUtil | no | `TCreatureUtil.STANDARD_ARMOR_CLASS_DESCRIPTION` in the `initialization` section leaves no edge; a scratch run with an implementation-level `var DefaultUtil: TCreatureUtil;` and `TCreatureUtil.Create` in `initialization` also gives none: only references inside a declaration body are extracted, unit-level statements and variables are invisible |
| same unit in interface `uses` of one unit ... | `Lair.pas` | Lair -> Treasure | yes | interface `uses` + field/property type |
| ... and in implementation `uses` of another | `CreatureForm.pas` | CreatureForm -> Treasure | yes | implementation `uses` + `TTreasure.Create` in a method body; both edges x1, no double counting |
| type only as a generic argument `TList<TCentaur>` | `Herd.pas` | Herd -> Centaur | yes | the argument is resolved, `TList` from `System.Generics.Collections` produces no edge |

Found 6 of 9 expected `.pas` edges (plus 0 of 29 package edges). Round-1 edges changed: none. New false
positives: none (`Treasure` has no outgoing edge, `Bootstrap` and `Mapping` stay at 0/0). New leaf kinds:
`TCreatureHelper` and `TCreatureForm` are CLASS, `TTreasure` is CLASS (a record, same VALUECLASS remark as
round 1). Levels follow the new edges (`Herd.pas` 3 above `Centaur.pas` 2, `CreatureHelper.pas` 2, `Lair.pas` 1).
With `--include-tests` the test edges are unchanged from round 1 (5 file edges, x2 to Creature and
CreatureId).

## Verdict

- Good: dotted unit names map cleanly to the package path regardless of folders; both interface and
  implementation `uses` clauses are read; inheritance, interface implementation, generic base classes,
  parameter/field/return types, constructor calls and class-const access all produce correct edges; not a
  single false positive; standard library and third-party units never turn into internal edges; the
  `tests/` directory is skipped by default and analysed with `--include-tests`; enum and interface kinds are
  right. Round 2: class helpers (`class helper for TCreature`), interface delegation (`implements`), class
  references through `TCreature.ClassName`, types used only as generic arguments (`TList<TCentaur>`) and a unit
  listed in the interface `uses` of one unit and the implementation `uses` of another all give correct edges,
  again without a false positive.
- Wrong:
  - `application/CreatureFacade.pas`: with `domain.model.TCreature` and `application.dto.TCreature` both in
    `uses`, every `TCreature` reference resolves to the first `uses` entry (the DTO), the unit-qualified
    `de.sots.cellarsandcentaurs.application.dto.Creature.TCreature` is ignored, and the edge to the domain
    `Creature` is lost. Delphi's rule is last-unit-wins, and qualification is the official way to disambiguate.
  - Records (`CreatureId`, `HitPoints`, `Speed`, `Dice`) are reported as CLASS instead of VALUECLASS.
- Missing:
  - `application/Api.pas` (type-alias-only unit, the Delphi stand-in for a barrel) and
    `CellarsAndCentaurs.dpr` are dropped from the file tree because they declare no type; with them the
    edges `Creature -> Api`, `ArmorClass -> Api`, `PersistedCreatures -> Api`, `Api -> CreatureFacade`,
    `Api -> CreatureUtil`, both cycles and all three upward edges disappear.
  - Type aliases (`TEntity = TCreatureEntity` in `CreatureRepository`) are not followed:
    `CreatureRepository -> CreatureEntity` is missing.
  - Free function calls (`RollD20` in `Centaur`), enum values (`ctMonstrosity`, `stWalking`) and attributes
    (`[Table(...)]` in `CreatureEntity`) leave no edge, and `RollD20` gets no FUNCTION leaf.
  - `uses SpeedType;` (short unit name through unit scope names) in `CreatureUtil` cannot be resolved.
  - No Delphi test-file naming rule: `...Tests.pas` / `Test....pas` next to the source are analysed by default.
  - Round 2: `.inc` include files (`{$I Constants.inc}` in `Lair`) and `.dpk` package files
    (`CellarsAndCentaurs.dpk`, `contains`) are not scanned at all, so `Lair -> Constants.inc` and the 29
    package edges are missing; references outside a declaration body (the `initialization` section and
    unit-level variables in `Bootstrap`) are invisible, so `Bootstrap -> CreatureUtil` is missing.
  - Domain language parser: no Delphi support at all.
