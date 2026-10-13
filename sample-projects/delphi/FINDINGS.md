# Delphi (Object Pascal)

Round 3, 2026-10-08. All expected values below were written into this file before the first parser run; the
"reported" columns were filled in afterwards. Where an expected value of mine was wrong or debatable, it is
marked as such and not adjusted.

## Project

- Layout: `CellarsAndCentaurs.dpr` (program) and `CellarsAndCentaurs.dpk` (package) at the root, units under
  `src/<layer>/` in dotted-unit-name files (`de.sots.cellarsandcentaurs.domain.model.Creature.pas`; in Delphi
  the file name must equal the unit name), the DUnitX test under `tests/`.
- 41 files: 34 `.pas` (33 + 1 test), 1 `.dpr`, 1 `.dpk`, 1 `.lpr`, 1 `.pp`, 2 `.inc`, 1 `.dfm`.
- Declarations follow Delphi casing: `TCreature`, `ICreatures`, `ENoSuchCreatureException`, enum values
  `ctMonstrosity` / `stWalking`. `TCreatureId`, `THitPoints`, `TSpeed`, `TDice`, `TDiceRoll`, `TTreasure` are records.
- Every unit can carry two `uses` clauses: the interface `uses` for types in declarations and the
  implementation `uses` for types only needed in bodies. Cycles between units are only legal through the
  implementation `uses`; the cycle `Creature -> Api -> CreatureFacade -> CreatureService -> Creature` is written
  that way.

Round 3 additions (8 new files, `.dpr` and `.dpk` extended by the four new units, nothing else changed):

| File | Purpose |
| --- | --- |
| `src/domain/service/…EncounterResolver.pas` | the shared unified-parser logic (`Resolve`, `Describe`, `SafeRoll`, `InitiativeOrder` with nested `CountAlive`, `IsEmpty`) |
| `src/domain/service/…EncounterEdgeCases.pas` | 42 routines, one construct each, plus declarations that are not routines |
| `src/domain/service/…EncounterModernSyntax.pas` | syntax newer than the classic language: inline `var` (10.3), `'''` multi-line string (12), `if` expression and `is not` / `not in` (13) |
| `src/domain/service/EncounterRules.inc` | include file with one function, pulled into `EncounterEdgeCases` with `{$I …}` |
| `src/domain/model/…Zentaurenhöhle.pas` | German words; Delphi allows Unicode identifiers, so unit, file, type `TZentaurenhöhle`, field `rüstungsklasse` and method `IstGeschützt` keep their umlauts |
| `src/application/encounterlog.pp` | Free Pascal unit (`{$mode objfpc}`) |
| `CellarsAndCentaursLazarus.lpr` | Lazarus program with one free function |
| `src/application/…CreatureForm.dfm` | form resource belonging to `CreatureForm.pas` |

No new file is git-ignored (`git check-ignore -v` is silent for all eight).

Stress constructs and how Delphi expresses them:

| # | Construct | Delphi | Where |
| --- | --- | --- | --- |
| 1 | Aliased import | none (`uses` has no `as`); nearest: type alias `TEntity = TCreatureEntity;` | `CreatureRepository` |
| 2 | Wildcard import | none; every `uses` entry imports a whole unit | `CreatureUtil` uses a unit-qualified type instead |
| 3 | Barrel / re-export | none; a unit re-publishes types through aliases | `application.Api` |
| 4 | Inheritance / interface | `class(TCreature)`, `class(TInterfacedObject, IFightable)` | yes |
| 5 | Generics | `TRepository<T: class>`, `class(TRepository<TEntity>)` | yes |
| 6 | Type position / new / static / attribute | parameter types; `TCreatureEntity.Create`; class const `TCreatureFacade.STANDARD_CREATURE_TYPE`; `[Table('creatures')]` | yes |
| 7 | Same simple name | `domain.model.Creature.TCreature` and `application.dto.Creature.TCreature`, both used from `CreatureFacade` | yes |
| 8 | Fully qualified reference without import | not legal; counterpart: short unit name `uses SpeedType;` resolved through unit scope names | `CreatureUtil` |
| 9 | Unused import | `Fightable` in `CreatureUtil` | yes |
| 10 | Standard / third-party | `System.SysUtils`, `System.Generics.Collections`, `System.Math`, `Spring.Logging`, `DUnitX.TestFramework` | yes |
| 11 | Test file | `tests/…CreatureServiceTest.pas`, method `should_save_creature_to_the_stable` | yes |
| 12 | Multiple declarations, name differs | `Dice` holds `TDice`, `TDiceRoll`, free function `RollD20` | yes |
| - | Conditional expression | none before Delphi 13; `EncounterResolver.Resolve` uses the idiom `IfThen(…)`, the Delphi 13 `if` expression is in `EncounterModernSyntax` | yes |
| - | `try … catch … finally` | two separate statements, nested: `try try … except on E: X do … end; finally … end;` | `SafeRoll` |
| - | Lambda | anonymous method `function(AValue: Integer): Boolean begin … end` | `SafeRoll` |
| - | Null-coalescing, optional chaining, pattern guards, comprehensions, generators, `async` / `await`, labelled break, fallthrough, exception filters, macros, variadic parameters | not in the language (`array of const` is the variadic idiom) | - |

## Unified parser

### Command and files

```
ccsh unifiedparser -nc sample-projects/delphi -e "output,FINDINGS.md" -o output/unified.cc.json
```

Exit 0. Warning on every run: `No .gitignore found at root level, excluding common build folders as fallback...`
(the parser looks for a `.gitignore` in the scanned folder, not in the repository root).

| Extension | Unified | Dependency | Domain |
| --- | --- | --- | --- |
| `.pas` | analysed (34) | analysed | not supported |
| `.dpr` | analysed (1) | scanned; dropped from the result because it declares no type | not supported |
| `.dpk` | skipped, listed | skipped silently | not supported |
| `.lpr` | skipped, listed | skipped silently | not supported |
| `.pp` | skipped, listed | skipped silently | not supported |
| `.inc` | skipped, listed | skipped silently | not supported |
| `.dfm` | skipped, listed | skipped silently | not supported |

The unified parser prints `6 Files with the following extensions were ignored as they are currently not
supported: [.dpk, .pp, .dfm, .inc, .lpr]`. Copied to a supported extension in a scratch folder, the `.lpr`
program (as `.dpr`), the `.pp` unit and the header-less `.inc` fragment (as `.pas`) are all measured exactly as
expected (1 function, logic 1, complexity 2 each), so only the extension list keeps them out.

Locale: the run above was made with `LC_ALL=C.UTF-8`. With the POSIX locale (no `LANG`, the default of the
machine these runs were made on) the JVM cannot decode the file name `…Zentaurenhöhle.pas`, and the file
disappears without any message from the unified parser (34 instead of 35 files, not in the "ignored" list)
and from the dependency parser (33 instead of 34 files). These runs are kept as
`output/unified-posix-locale.cc.json` and `output/dependency-posix-locale.cc.json`.

### Counting conventions for Delphi (written before the run)

- README rule, with these Delphi decisions: `and` / `or` between Booleans count like `&&` / `||`; `xor`, `not`
  and the bitwise `and` / `or` on integers do not count. One `case` arm counts once, however many labels or
  ranges it lists; the `else` of a `case` does not count. In `try … except` every `on X do` handler counts,
  and so does a bare `except` block and the `else` handler (both are catch-alls); `finally` does not count.
  `repeat … until`, `for … to/downto`, `for … in`, `while` are loops. `goto`, `with`, `Exit`, `raise` do not count.
- Classic Delphi has no conditional expression. `IfThen(…)` is a function call and counts 0.
- A function is a routine with a body: method implementations, free routines, nested named routines,
  constructors, destructors, class methods, class operators. Declarations without a body (class and interface
  method headers in the `interface` section, `forward`, `external`, procedural types) are not functions.
  Anonymous methods are lambdas: not in `number_of_functions`, +1 in `complexity`, and their content belongs
  to the routine that holds them. A nested named routine is a function of its own; its lines and complexity
  are not counted again in the enclosing routine.
- rloc of a function = code lines after the heading (local `var` / `label` section and `begin … end`).
- `{$…}` compiler directives are code lines, not comments, although they are lexically comments.
- Both branches of an `{$IFDEF}` count, because both are in the source.

### `EncounterResolver`

Expected per function (before the run):

| Function | Parameters | logic | complexity | rloc |
| --- | --- | --- | --- | --- |
| `Resolve(AAttacker, ADefender: TCreature; ARoll, ABonus: Integer; ATerrain: TSpeedType)` | 5 | 10 (`if`, `else if`, `for … in`, `if`, `and`, `while`, 3 `case` arms, `or`; `IfThen` 0) | 11 | 30 |
| `Describe(ACreature)` | 1 | 0 | 1 | 7 |
| `SafeRoll(const ADice)` | 1 | 2 (`on E: … do`, `if` in the anonymous method) | 4 (itself + the anonymous method) | 22 |
| `InitiativeOrder(ACreatures)` | 1 | 0 | 1 | 4 |
| nested `CountAlive(AIndex)` | 1 | 1 (`if`) | 2 | 5 |
| `IsEmpty` | 0 | 0 | 1 | 3 |

| Metric | Expected | Reported | Verdict |
| --- | --- | --- | --- |
| `logic_complexity` | 13 | 16 | wrong by rule: +1 for the `case` statement itself (on top of its 3 arms), +2 for the two `try` keywords of `try … except` / `try … finally` in `SafeRoll` |
| `complexity` | 20 | 23 | follows from the 3 above; functions (6) and the anonymous method (1) are added correctly |
| `number_of_functions` | 6 | 6 | ok; the nested `CountAlive` counts, the anonymous method and the 5 method headers in the class declaration do not |
| `loc` | 133 | 133 | ok |
| `rloc` | 107 | 107 | ok |
| `comment_lines` | 13 | 13 | ok (6 `///`, 3 `//`, 2-line `{ }`, 1 trailing, 1 commented-out) |
| parameters max / min / mean / median | 5 / 0 / 1.5 / 1 | 3 / 0 / 1.4 / 1 | wrong: a parameter group counts once, `(AAttacker, ADefender: TCreature; ARoll, ABonus: Integer; ATerrain: TSpeedType)` is 3; the statistics hold 5 entries, `CountAlive` is merged into `InitiativeOrder` (2 parameters) |
| complexity per function max / min / mean / median | 11 / 1 / 3.33 / 1.5 | 11 / 0 / 3.4 / 1 | different base: the per-function value leaves out the +1 of the function itself (`Resolve` = 11 logic, `SafeRoll` = 5, `InitiativeOrder` + `CountAlive` = 1, others 0); 5 entries instead of 6 |
| rloc per function max / min / mean / median | 30 / 3 / 11.83 / 6 | 25 / 2 / 10.2 / 3 | different base and wrong: the parser counts only the lines strictly between `begin` and `end` (no `var` section; `Resolve` 25, `SafeRoll` 18, `Describe` 3). With a nested routine the bodies shift: `InitiativeOrder` gets the body of `CountAlive` (3), `IsEmpty` gets the outer body of `InitiativeOrder` (2), the real body of `IsEmpty` (1) is lost |
| `long_method` | 2 | 2 | ok (`Resolve`, `SafeRoll`) |
| `long_parameter_list` | 1 | 0 | wrong: `Resolve` has 5 parameters, 3 are seen |
| `message_chains` | 1 | 1 | ok; the chain of 3 is not counted |
| `excessive_comments` | 1 | 1 | ok |

Scratch checks behind the verdicts (single-routine units, not part of the project): `Resolve` alone reports 3
parameters and logic 11; the same heading written as five separate parameters reports 5 parameters and
`long_parameter_list` 1; `InitiativeOrder` + `IsEmpty` alone report two statistics entries with parameters
2 / 0 and rloc 3 / 2.

### `EncounterEdgeCases`

Expected values were written before the run. The file-level output cannot show single routines, so the
"reported" column comes from a scratch run in which every routine sits alone in its own unit; the sums of
that run equal the file-level numbers (logic 25 + 1 for the `initialization` section = 26).
P = parameters, L = logic complexity, C = complexity.

| Routine | Construct | Expected P / L / C | Reported P / L / C | Verdict |
| --- | --- | --- | --- | --- |
| `Announce` | free procedure, header in `interface` | 1 / 0 / 1 | 1 / 0 / 1 | ok |
| `ForwardDeclared` | `forward` declaration plus definition | 1 / 0 / 1 | 1 / 0 / 1 | ok, counted once |
| `GetTickCount` | `external 'kernel32.dll'`, no body | not a function | not counted | ok |
| `TModifier.Add` | `class operator`, `(const ALeft, ARight: TModifier)` | 2 / 0 / 1 | 1 / 0 / 1 | wrong P (group) |
| `TModifier.Implicit` | `class operator` | 1 / 0 / 1 | 1 / 0 / 1 | ok |
| `TRollHelper.IsCritical` | `record helper for Integer` | 0 / 0 / 1 | 0 / 0 / 1 | ok |
| `TEncounterQueue<T>.Pick` | method of a generic class | 2 / 0 / 1 | 2 / 0 / 1 | ok |
| `class constructor Create` | class constructor | 0 / 0 / 1 | 0 / 0 / 1 | ok |
| `constructor Create` | constructor | 1 / 0 / 1 | 1 / 0 / 1 | ok |
| `destructor Destroy` | destructor | 0 / 0 / 1 | 0 / 0 / 1 | ok |
| `Instances` | `class function … static` | 0 / 0 / 1 | 0 / 0 / 1 | ok |
| `Reset` | `class procedure` | 0 / 0 / 1 | 0 / 0 / 1 | ok |
| `GetDifficulty` | property getter | 0 / 0 / 1 | 0 / 0 / 1 | ok |
| `SetDifficulty` | property setter with an `if` | 1 / 1 / 2 | 1 / 1 / 2 | ok |
| `RepeatUntil` | `repeat … until` | 1 / 1 / 2 | 1 / 1 / 2 | ok |
| `ForIn` | `for … in` | 1 / 1 / 2 | 1 / 1 / 2 | ok |
| `ForDownto` | `for … downto`, `(AFrom, ATo: Integer)` | 2 / 1 / 2 | 1 / 1 / 2 | wrong P (group) |
| `CaseRanges` | arms `1`, `2..5`, `6, 7, 8`, `9..12, 15`, `else` | 1 / 4 / 5 | 1 / 5 / 6 | wrong L: the 4 arms count once each (right), the `case` statement adds 1 |
| `ExceptHandlers` | `on E: EConvertError do`, `on EOverflow do`, `else` handler | 1 / 3 / 4 | 1 / 3 / 4 | number matches by accident: `try` 1 + two `on` handlers; the `else` handler is not counted |
| `BareExcept` | `try … except … end` without `on` | 1 / 1 / 2 | 1 / 1 / 2 | number matches by accident: the 1 is the `try`, the bare `except` is not a counted node |
| `TryFinally` | `try … finally` | 1 / 0 / 1 | 1 / 1 / 2 | wrong L: `try` counts although nothing is caught |
| `BooleanOperators` | `and`, `or`, `and not`, `xor`, `(AFirst, ASecond, AThird: Boolean)` | 3 / 3 / 4 | 1 / 4 / 5 | wrong P (group); `xor` counts (deviation from the README rule, which names only `&&` and `\|\|`) |
| `BitwiseOperators` | `(AMask and AFlags) or (AMask shl 2)` on integers | 2 / 0 / 1 | 1 / 2 / 3 | wrong L: bitwise `and` / `or` count as logic; wrong P (group) |
| `NestedRoutines` + `Bump` + `Twice` | routine nested two levels deep | 1 / 0 / 1, 0 / 0 / 1, 1 / 0 / 1 | 3 functions, L 0, C 3; one statistics entry with 2 parameters | function count ok; the per-function statistics merge the three into one entry |
| `AnonymousMethods` | anonymous function with `if`, anonymous procedure with `while` | 1 / 2 / 5 | 1 / 2 / 5 | ok |
| `Hit(ARoll)` | overload 1 | 1 / 0 / 1 | 1 / 0 / 1 | ok |
| `Hit(ARoll; AWeapon)` | overload 2 | 2 / 0 / 1 | 2 / 0 / 1 | ok |
| `WithDefaults` | default parameters | 3 / 0 / 1 | 3 / 0 / 1 | ok |
| `ParameterGroups` | `(AFirst, ASecond: Integer; var AThird, AFourth: string; out AFifth: Boolean; const ASixth: Double)` | 6 / 0 / 1 | 4 / 0 / 1 | wrong P (4 groups) |
| `OpenArrays` | `array of Integer`, `array of const` | 2 / 0 / 1 | 2 / 0 / 1 | ok |
| `UntypedParameters` | `(var ABuffer; ASize: Integer)` | 2 / 0 / 1 | 2 / 0 / 1 | ok |
| `IfdefBranches` | `{$IFDEF DEBUG}` `if` `{$ELSE}` `while` `{$ENDIF}` | 1 / 2 / 3 | 1 / 2 / 3 | ok, both branches are counted |
| `DirectiveExpression` | `{$IF Defined(MSWINDOWS) and Defined(CPUX64)}` | 0 / 0 / 1 | 0 / 0 / 1 | ok, the `and` in the directive is not counted |
| `WithStatement` | `with … do` | 1 / 0 / 1 | 1 / 0 / 1 | ok |
| `GotoLabel` | `label`, `goto`, one `if` | 1 / 1 / 2 | 1 / 1 / 2 | ok |
| `CommentSyntaxes` | `//`, `{ }`, `(* *)`, markers inside strings, `''` | 0 / 0 / 1 | 0 / 0 / 1 | ok |
| `KeywordsInStrings` | `'if roll > 10 and armor < 5 or while case of repeat until'` | 0 / 0 / 1 | 0 / 0 / 1 | ok |
| `ParenlessChain` | `ACreature.ClassName.Trim.ToLower.ToUpper.Trim` | 1 / 0 / 1, 1 chain | 1 / 0 / 1, 1 chain | ok |
| `TypeCheck`, `SafeCast`, `HardCast` | `is`, `as`, `TLair(AObject)` | 1 / 0 / 1 each | 1 / 0 / 1 each | ok |
| `initialization` section | one `if` outside every routine | L 1 | L 1 | ok, counted in the file total |
| `TRollRecord` | variant record `case Kind: Byte of` | L 0 | L 0 | ok |
| `TRollCallback`, `TRollProc` | procedural types | not functions | not counted | ok |
| method headers | 38 method headers in class / record declarations, 2 in `IEncounterLog`, the `interface` header of `Announce` | not functions | not counted | ok |

| Metric | Expected | Reported | Verdict |
| --- | --- | --- | --- |
| `number_of_functions` | 42 | 42 | ok |
| `logic_complexity` | 21 | 26 | +2 bitwise operators, +1 `xor`, +1 `case` statement, +1 `try` in `TryFinally` |
| `complexity` | 65 | 70 | follows |
| `loc` / `rloc` / `comment_lines` | 433 / 358 / 13 | 433 / 358 / 13 | ok; the 10 `{$…}` directive lines are code, as expected |
| parameters max / min / mean / median | 6 / 0 / 1.14 / 1 | 4 / 0 / 1.02 / 1 | wrong (groups; 40 entries instead of 42) |
| complexity per function max / min / mean / median | 5 / 1 / 1.52 / 1 | 5 / 0 / 0.68 / 0 | different base (no +1 for the function itself) |
| rloc per function max | not written down | 19 | no single routine has 19 lines between `begin` and `end`; `AnonymousMethods` has 14 and gets the bodies of `Bump` and `NestedRoutines` on top (scratch run with these routines alone: 19 / 1 / 1) |
| `long_method` | 3 (`AnonymousMethods` 20, `CaseRanges` 14, `ExceptHandlers` 12 by my rule) | 2 | definition: by the parser's own body (between `begin` and `end`) these are 14, 12 and 10, so `ExceptHandlers` is not long. My first draft of this cell said 0, I corrected it to 3 before the run |
| `long_parameter_list` | 1 (`ParameterGroups`) | 0 | wrong: 6 parameters, 4 seen |
| `message_chains` | 1 | 1 | ok |
| `excessive_comments` | 1 | 1 | ok |

### Other new files

| File | Expected functions / L / C | Reported | Expected loc / rloc / comments | Reported | Verdict |
| --- | --- | --- | --- | --- | --- |
| `EncounterModernSyntax.pas` | 4 / 3 / 7 | 4 / 2 / 6 | 45 / 36 / 0 | 45 / 36 / 0 | the Delphi 13 conditional expression `Result := if ARoll > 15 then 2 else 1;` is not counted; inline `for var`, `or` next to `is not` / `not in` are counted; the `//`, `{ }`, `(* *)` inside the `'''` string are not taken for comments |
| `Zentaurenhöhle.pas` | 2 / 1 / 3 | 2 / 1 / 3 | 31 / 23 / 1 | 31 / 23 / 1 | ok with a UTF-8 locale; missing without one (see above) |
| `encounterlog.pp` | 1 / 1 / 2 if analysed | not analysed | 25 / 18 / 0 | - | skipped by extension |
| `CellarsAndCentaursLazarus.lpr` | 1 / 1 / 2 if analysed | not analysed | 18 / 14 / 0 | - | skipped by extension |
| `EncounterRules.inc` | 1 / 1 / 2 if analysed | not analysed | 7 / 6 / 1 | - | skipped by extension |
| `CreatureForm.dfm` | - | not analysed | 8 / 8 / 0 | - | skipped by extension, as expected |

### Line counting

`loc`, `rloc` and `comment_lines` are exact in all three new `.pas` files. All three comment syntaxes are
recognised, including one syntax inside another (`{ … (* … *) … }`, `(* … { … } … *)`, `// … { … (*`), the
doc forms `///`, `{** … }`, `(** … *)`, and a trailing comment counts for both `rloc` and `comment_lines`.
Comment markers inside strings (`'// not a comment'`, `'{ not a comment }'`, `'(* neither *)'`,
`'it''s { still a string'`) are not counted as comments. Compiler directives (`{$IFDEF …}`, `{$I …}`) count
as code lines.

### Everything else

- Function counts are right in all 35 analysed files (checked against the routine headings of every file):
  constructors, destructors, class methods, class operators, helper methods, generic methods, free routines
  and nested routines count; headers without a body do not.
- Parameter groups are undercounted in the old files too: `CreatureFacade.CreateCreature(AType; const
  AWalkSpeed, AFlySpeed, ASwimSpeed, ABurrowSpeed, AClimbSpeed: TSpeed; AArmorClass; AHitPointsValue)` has 8
  parameters, reported maximum 4, `long_parameter_list` 0; `THitPoints.Create(ACurrent, AMax: Integer;
  ATemporary: Integer = 0)` and `TArmorClass.Create(ABase, ABonus: Integer; const ADescription: string)` have
  3, reported maximum 2.
- `CreatureFacade.pas` reports `message_chains` 1. The only candidate is the unit-qualified constructor call
  `de.sots.cellarsandcentaurs.application.dto.Creature.TCreature.Create` in `ToDto`: the dots of a unit name
  count as a chain (scratch unit with only this line: 1). A path of five property reads
  (`AForm.Owner.Owner.Owner.Owner.Tag`, scratch) also counts 1; without parentheses the parser cannot tell a
  property read from a call.
- `complexity` of a file adds 1 per function, `max/min/mean/median_complexity_per_function` do not, so a file
  of trivial routines shows `complexity` 5 and per-function complexity 0 (`Creature.pas`).
- `CellarsAndCentaurs.dpr`: analysed, 46 loc, 43 rloc, 0 functions. The main `begin … end.` block is not a
  function; its logic would count in the file total (scratch `.dpr` with `if` and `while` in the main block:
  logic 2, 0 functions).
- Keywords in other casing (`IF … AND … THEN`, `While … Do`, `Or`; scratch) are counted, `else if` chains count
  one per branch, `Continue` / `Break` / `raise` / `goto` / `with` do not count.
- No message is printed for a construct the grammar does not know (the conditional expression).

## Dependency parser

### Commands

```
ccsh dependencyparser -nc sample-projects/delphi -e "output,FINDINGS.md" -o output/dependency.cc.json
ccsh dependencyparser -nc sample-projects/delphi -e "output,FINDINGS.md" --include-tests -o output/dependency-with-tests.cc.json
```

Both exit 0 (34 and 35 files scanned). Result without tests: 32 file nodes, 39 leaves, 50 file edges, 52 leaf
edges, `Found a total of 0 cycles`, no upward edge. With tests: 55 file edges, 41 leaves, 60 leaf edges.
`--verbose` prints nothing more; neither the skipped extensions nor the files dropped for having no
declaration (`Api.pas`, `CellarsAndCentaurs.dpr`) are mentioned anywhere.

### Expected file-level edges (written before the runs)

Unit names are shortened to their last segment; `dto.Creature` is the DTO unit. `(impl)` marks a dependency
that only appears in the implementation `uses`.

Rounds 1 and 2 (unchanged from the earlier report):

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
| CreatureUtil | Creature, Speed, SpeedType (short unit name) |
| CellarsAndCentaurs.dpr | CreatureRepository, CreatureService, PersistedCreatures, CreatureFacade, Creature, CreatureType, Speed, ArmorClass |
| Lair | Constants.inc, Treasure |
| CreatureHelper | Creature |
| CreatureGateway | Creatures |
| CreatureForm | Creature, Treasure (impl) |
| Bootstrap | CreatureUtil (only in `initialization`) |
| Herd | Centaur |
| CellarsAndCentaurs.dpk | all 33 units under `contains` |
| CreatureServiceTest (only with `--include-tests`) | CreatureService, Creatures, Creature, CreatureId, Speed (impl), SpeedType (impl) |

Round 3:

| from | to | form |
| --- | --- | --- |
| EncounterResolver | Creature, SpeedType, Dice | parameter types (interface `uses`) |
| EncounterResolver | Speed | type of a local variable only (implementation `uses`) |
| EncounterResolver | NoSuchCreatureException | only in `on E: ENoSuchCreatureException do` |
| EncounterEdgeCases | Creature | parameter types, generic constraint `TEncounterQueue<T: TCreature>` |
| EncounterEdgeCases | Fightable | only as parameter of the interface method `IEncounterLog.Log` |
| EncounterEdgeCases | Treasure | only in the pointer type `PTreasure = ^TTreasure` |
| EncounterEdgeCases | ArmorClass | only in the free procedure `Announce(const AArmor: TArmorClass)` |
| EncounterEdgeCases | HitPoints | only in the unit-level `var LastHitPoints: THitPoints` |
| EncounterEdgeCases | EncounterResolver | field type and `TEncounterResolver.Create` |
| EncounterEdgeCases | application.CreatureForm | only in `TCreatureFormClass = class of TCreatureForm`; upward edge domain -> application |
| EncounterEdgeCases | Centaur | only `AFighter is TCentaur` |
| EncounterEdgeCases | Herd | only `AObject as THerd` |
| EncounterEdgeCases | Lair | only the hard cast `TLair(AObject)` |
| EncounterEdgeCases | CreatureId | only inside an anonymous method (`TCreatureId.NewId`) |
| EncounterEdgeCases | EncounterRules.inc | `{$I EncounterRules.inc}` |
| EncounterModernSyntax | Creature | only `ACreature is not TCreature` |
| Zentaurenhöhle | Lair | `TZentaurenhöhle = class(TLair)` |
| encounterlog.pp | Creature | parameter type, Free Pascal unit |
| CellarsAndCentaursLazarus.lpr | Dice | free function call `RollD20` in a Lazarus program |

Expected: 82 file edges without the test and the package file (61 from rounds 1 and 2, 21 from round 3), 115
with the 33 `.dpk` edges, 6 more with `--include-tests`. Expected cycles: 2, both through `Api`. Expected upward
edges: 4 (`Creature -> Api`, `ArmorClass -> Api`, `PersistedCreatures -> Api`, `EncounterEdgeCases -> CreatureForm`).

### Found

50 of the 82 expected edges (38 of 61 from rounds 1 and 2, 12 of 21 from round 3), 0 of the 33 package edges,
5 of 6 test edges. No false positive. Cycles: expected 2, reported 0. Upward edges: expected 4, reported 0.

| Construct | Expected edge(s) | Found | Verdict |
| --- | --- | --- | --- |
| Interface `uses` + type in a declaration | Creature -> CreatureId, CreatureType, ArmorClass, SpeedType, Speed, HitPoints, Fightable | all 7 | ok |
| Implementation `uses` + type in a method body | PersistedCreatures -> CreatureEntity, NoSuchCreatureException; CreatureFacade -> CreatureId, HitPoints; CreatureForm -> Treasure | all 5 | ok |
| Inheritance, interface implementation | Centaur -> Creature, Fightable; Creature -> Fightable; PersistedCreatures -> Creatures; Zentaurenhöhle -> Lair | all | ok |
| Generic base `TRepository<TEntity>` | CreatureRepository -> Repository | yes | ok |
| Generic argument in a field type `TList<TCentaur>` | Herd -> Centaur | yes | ok |
| Generic constraint `TEncounterQueue<T: TCreature>` | EncounterEdgeCases -> Creature (leaf `TEncounterQueue`) | yes | ok |
| Type alias `TEntity = TCreatureEntity` | CreatureRepository -> CreatureEntity | no | missing: an alias gets no leaf and is not followed |
| Parameter / field / return / property type | Creatures -> Creature, CreatureId; CreatureService -> Creatures, Creature; Lair -> Treasure; EncounterResolver -> Creature, SpeedType, Dice | all | ok |
| Parameter of an interface method | EncounterEdgeCases -> Fightable (leaf `IEncounterLog`) | yes | ok |
| Local variable type | EncounterResolver -> Speed | yes | ok |
| Constructor call only | PersistedCreatures -> CreatureEntity; EncounterEdgeCases -> EncounterResolver | yes | ok |
| Class method on a class reference | CreatureForm -> Creature (`TCreature.ClassName`) | yes | ok |
| Type used only inside an anonymous method | EncounterEdgeCases -> CreatureId | yes | ok |
| `is`, `as` | EncounterEdgeCases -> Centaur, Herd | yes | ok |
| Hard cast `TLair(AObject).IsFull` | EncounterEdgeCases -> Lair | yes | ok, but only because a member access follows: `TPlain(AObject) = nil` and `var Plain := TPlain(AObject)` give no edge (scratch) |
| `class helper for TCreature` | CreatureHelper -> Creature | yes | ok |
| Interface delegation `implements ICreatures` | CreatureGateway -> Creatures | yes | ok (not isolable from the class header) |
| `on E: ENoSuchCreatureException do` | EncounterResolver -> NoSuchCreatureException | no | missing: the type in an exception handler is not extracted, with or without the variable (scratch) |
| `ACreature is not TCreature` (Delphi 13) | EncounterModernSyntax -> Creature | no | missing; the file stays in the tree with 0 / 0 |
| Pointer type `PTreasure = ^TTreasure` | EncounterEdgeCases -> Treasure | no | missing: the declaration gets no leaf; a field `FPointer: ^TTarget` inside a class does give an edge (scratch) |
| Class reference type `class of TCreatureForm` | EncounterEdgeCases -> CreatureForm | no | missing, also as the type of a field (scratch); the expected upward edge is lost with it |
| Free routine `Announce(const AArmor: TArmorClass)` | EncounterEdgeCases -> ArmorClass | no | missing: free routines get no leaf, their signature and body are attributed to nothing |
| Unit-level `var LastHitPoints: THitPoints` | EncounterEdgeCases -> HitPoints | no | missing |
| `{$I EncounterRules.inc}`, `{$I Constants.inc}` | EncounterEdgeCases -> EncounterRules.inc, Lair -> Constants.inc | no | missing: `.inc` is not scanned |
| Class const through the alias unit | Creature -> Api, ArmorClass -> Api, PersistedCreatures -> Api | no | missing with `Api.pas` (next row); class-const access on a directly used unit works (scratch) |
| Alias-only unit (barrel substitute) | Api -> CreatureFacade, CreatureUtil; `Api.pas` in the tree | no, `Api.pas` is not in the tree | missing: a unit without a class / record / interface / enum declaration is dropped |
| Same simple name `TCreature` from `CreatureFacade` | -> Creature and -> dto.Creature | only -> dto.Creature | wrong: the first `uses` entry that owns the name wins, Delphi takes the last; the unit-qualified `de.sots…dto.Creature.TCreature` is ignored (scratch: `lib.First.TSame` and `lib.Second.TSame` both resolve to `lib.First`) |
| Short unit name `uses SpeedType;` | CreatureUtil -> SpeedType | no | missing: unit scope names live in the `.dproj` |
| Unused `uses` (`Fightable` in `CreatureUtil`) | none | none | ok for a type-usage graph |
| Attribute `[Table('creatures')]` | CreatureEntity -> Mapping | no | missing for the short form; the full name `[TableAttribute('x')]` gives the edge (scratch), so only the `Attribute` suffix rule is absent |
| Enum value only (`ctMonstrosity`, `stWalking`) | Centaur -> CreatureType, CreatureFacade -> SpeedType, test -> SpeedType | no | missing |
| Free function call only (`RollD20`) | Centaur -> Dice | no | missing |
| Unit used only in `initialization` | Bootstrap -> CreatureUtil | no | missing |
| Standard / third-party units | no internal edge | none | ok |
| Program `.dpr` | dpr -> 8 units | no, file not in the tree | missing: dropped for having no type declaration; a `.dpr` that declares a class is kept and its `uses X in '…'` resolves (scratch) |
| `.dpk`, `.pp`, `.lpr` | 33 + 1 + 1 edges | no | missing: extensions not scanned |
| Test file, default run | skipped | skipped | ok (directory rule `tests/`) |
| Test file with `--include-tests` | 6 edges | 5 (no SpeedType, enum value) | ok; weight x2 to Creature and CreatureId, the file holds two classes |
| Test file by name (`…Test.pas`, `…Tests.pas`, `Test….pas` next to the source) | skipped by default | analysed (scratch) | missing: the name rule covers `kt kts java cs php` only |

Metrics: `incoming_dependencies` / `outgoing_dependencies` count leaf edges, not file edges
(`EncounterEdgeCases.pas` outgoing 8 for 7 file edges, `Creature.pas` incoming 10 for 9 file edges).

Levels follow the found edges: `domain/model` 0, `domain/service` 1, `application` 1, `adapter` 1;
`Herd.pas` 3, `Centaur.pas` / `CreatureHelper.pas` / `Zentaurenhöhle.pas` / `PersistedCreatures.pas` 2.

### Leaf kinds

| Declaration | Reported | Right? |
| --- | --- | --- |
| classes | `class` | yes |
| `IFightable`, `ICreatures`, `IEncounterLog` | `interface` | yes |
| `TCreatureType`, `TSpeedType` | `enum` | yes |
| records `TCreatureId`, `THitPoints`, `TSpeed`, `TDice`, `TDiceRoll`, `TTreasure`, `TModifier`, variant record `TRollRecord` | `class` | wrong, a record is a value type |
| `TRollHelper = record helper for Integer`, `TCreatureHelper = class helper for TCreature` | `class` | arguable; no kind says "extension" |
| `TableAttribute`, `ColumnAttribute` | `class` | arguable |
| `TZentaurenhöhle` | leaf name `TZentaurenh` | wrong: the name is cut at the umlaut. Scratch: `THöhle` becomes `hle`, `TÜber` becomes `ber`. The edge onto the file still resolves |
| `EShort = class(Exception);` (declaration without a body, scratch) | no leaf | missing: the usual one-line exception class disappears, and with it every edge onto it |
| free routines `RollD20`, `Announce` | no leaf | missing |
| type aliases `TEntity`, `Api.TCreatureFacade`, `Api.TCreatureUtil` | no leaf | missing |
| `PTreasure`, `TCreatureFormClass`, `TRollCallback`, `TRollProc`, `TCreatureTypes = set of …` | no leaf | missing |
| unit-level `var LastHitPoints`, constants | no leaf | missing |
| programs `CellarsAndCentaurs.dpr`, `…Lazarus.lpr` | no leaf, file dropped | missing |

### What Delphi offers and what CodeCharta resolves itself

Delphi has no package system, only units; the dotted unit name is the only namespace and the analyzer uses it
as the package path, independent of the folder layout. Everything else is name matching against the `uses`
list: the parser does not see unit scope names (`.dproj`), the last-unit-wins rule, unit-qualified
identifiers, or include files. A `uses` entry becomes an edge only when a type of that unit is referenced
inside a class, record or interface declaration or inside one of their method bodies; unused `uses`,
enum-value-, function-, constant-only usages and everything at unit level leave no trace.

## Domain language parser

```
ccsh domainlanguageparser -nc sample-projects/delphi -e "output,FINDINGS.md" -o output/domain.cc.json
```

Exit 1, no `output/domain.cc.json` is written. The parser throws, with a full Java stack trace:

```
java.lang.IllegalArgumentException: No analysable source files found in '…/sample-projects/delphi'.
Supported extensions: .bash, .c, .cc, .cjs, .cls, .cpp, .cs, .cts, .cxx, .gemspec, .go, .h, .h++, .hpp, .hxx,
.java, .js, .jsx, .kt, .kts, .m, .mjs, .mm, .mts, .p, .php, .phtml, .py, .pyw, .rake, .rb, .rs, .sh, .swift,
.ts, .tsx, .vue, .w, .zsh. Check the path, and whether .gitignore (--bypass-gitignore) or --exclude-tests
excluded everything.
```

`--bypass-gitignore` gives the same result. There is no Delphi entry in the parser's language list and no
`delphi-keywords.txt`; none of the seven file extensions of this project is accepted.

- Expected words: 0 of 17 found (no output). They are in the sources: creature / centaur / cellar / armor /
  hit / points / speed (doc comment on `TCreature`, identifiers), dungeon (`NoSuchCreatureException` string,
  `CreatureFacade` comment, `TEncounterResolver` doc comment), damage / lair (doc comment on `THitPoints`,
  `TLair`), initiative / encounter (`CreatureFacade` comment, `TEncounterResolver.InitiativeOrder`), treasure /
  hoard (`CreatureUtil` block comment, `TTreasure`, `CreatureForm.dfm`), stable (`'centaur-stable'`,
  `should_save_creature_to_the_stable`), dice / roll (`TDice`, `TDiceRoll`, `RollD20`, `d20Roll`).
- Keyword and technical-word leakage: not observable.
- Identifier splitting (`walkingSpeed`, `walking_speed`, `MAX_HIT_POINTS`, `ArmorClass`, `XPValue`, `d20Roll`,
  `centaur-stable`): not observable. Delphi-specific noise a generic tokenizer would produce: the prefixes
  `T`, `I`, `E`, `F`, `A` and the enum prefixes `ct` / `st`.
- Comments and strings: not observable.
- Test file handling: not observable.
- German words: 0 of 7 found (no output). `Zentaurenhöhle.pas` holds zentaurenhöhle (unit, type, comment),
  verlies, rüstungsklasse (field, comment), trefferpunkte, kreatur (comment), größe, höhle (string).

What exists already: the tree-sitter layer has a Delphi extraction mapping (`DelphiExtractionMapping`:
identifiers of types, routines, variables, fields, parameters, constants, properties, enum values, all three
comment syntaxes, single-quoted strings). The domain parser does not use it; what is absent is the language
entry with its extensions and a keyword list (`unit`, `interface`, `implementation`, `uses`, `type`, `begin`,
`end`, `procedure`, `function`, `constructor`, `destructor`, `property`, `inherited`, `nil`, `string`,
`Integer`, `Boolean`, …).

## Changed since 2026-09-06

- No finding of the earlier report on the old files changed. The fresh output holds exactly the 38 file
  edges, 30 leaves and 39 leaf edges of round 2 for the old files; cycles and upward edges are still 0; the test
  run still gives 5 file edges with weight x2 to `Creature` and `CreatureId`. The scratch experiments quoted
  there were repeated and came out the same: class-const access works on a directly used unit, free function
  calls give no edge, a `.dpr` with a class is kept, two fully qualified references still resolve to the
  first unit, there is no test-file name rule for `.pas`, unit-level code is invisible.
- One statement of the earlier report is too broad: "attribute usage is not extracted". With the full class
  name (`[TableAttribute('x')]`) the edge is found; only the short form `[Table('creatures')]` used in
  `CreatureEntity.pas` is missed. Whether that is new behaviour could not be verified, the earlier report did
  not test the full name.
- Leaf kinds are written in lower case (`class`, `interface`, `enum`); the earlier report quotes them in upper
  case. The earlier output files were replaced by this run, so this could not be compared.
- The domain language parser still exits 1; the message now lists the supported extensions.
- New in this round: the whole unified parser section, the round-3 dependency constructs, the extension
  table, the locale finding.

## Verdict

### Unified parser

- Missing:
  - `.pp`, `.lpr`, `.inc` (`encounterlog.pp`, `CellarsAndCentaursLazarus.lpr`, `EncounterRules.inc`,
    `Constants.inc`) and `.dpk` are not analysed, although the grammar measures all of them correctly under a
    supported extension. **Decision: accept.**
  - `EncounterModernSyntax.ConditionalExpression`: the Delphi 13 expression `if ARoll > 15 then 2 else 1` adds
    nothing to the logic complexity. **Decision: ignore.**
  - `Zentaurenhöhle.pas`: without a UTF-8 locale the file is left out and nothing says so. **Decision: accept (derived from Java).**
- Wrong:
  - Parameters are counted per group, not per name: `EncounterResolver.Resolve(AAttacker, ADefender: TCreature;
    ARoll, ABonus: Integer; ATerrain: TSpeedType)` is 3 instead of 5, `EncounterEdgeCases.ParameterGroups` 4
    instead of 6, `CreatureFacade.CreateCreature` 4 instead of 8. `long_parameter_list` is 0 in all three files
    where it should be 1. **Decision: accept (derived from JavaScript).**
  - `try` counts as a decision: `EncounterEdgeCases.TryFinally` (`try … finally`) has logic 1 instead of 0,
    `EncounterResolver.SafeRoll` gets +2 for its two `try` keywords. **Decision: accept.**
  - The `case` statement counts in addition to its arms: `EncounterEdgeCases.CaseRanges` 5 instead of 4,
    `EncounterResolver.Resolve` +1. **Decision: accept.**
  - Bitwise `and` / `or` count as logical operators: `EncounterEdgeCases.BitwiseOperators`
    (`(AMask and AFlags) or (AMask shl 2)`) has logic 2 instead of 0. **Decision: ignore.**
  - Catch-all handlers are not counted: the `else` handler in `EncounterEdgeCases.ExceptHandlers` and the bare
    `except` in `BareExcept`. The totals look right only because the `try` is counted instead. **Decision: accept.**
  - Nested routines break the per-function statistics: `EncounterResolver.InitiativeOrder` and its nested
    `CountAlive`, and `EncounterEdgeCases.NestedRoutines` with `Bump` and `Twice`, each become one entry
    (parameters and complexity added up); the body lines shift to the next routine, so `IsEmpty` is reported
    with 2 lines and `AnonymousMethods` with 19 instead of 14. **Decision: accept (derived from Java).**
  - `message_chains` 1 in `CreatureFacade.pas` for the unit-qualified name
    `de.sots.cellarsandcentaurs.application.dto.Creature.TCreature.Create`. **Decision: ignore.**
- Bad:
  - `xor` counts as a decision (`EncounterEdgeCases.BooleanOperators` 4 instead of 3 by the README rule). **Decision: ignore — the docs list `kXor` (derived from PHP).**
  - `complexity` includes +1 per function, the `*_complexity_per_function` values do not; simple routines
    show 0. **Decision: ignore (derived from Java).**
  - rloc per function is the inside of `begin … end` only; the local `var` section is not part of it. **Decision: ignore.**
  - A path of property reads counts as a message chain, because a call without parentheses looks the same. **Decision: ignore.**
  - The `.gitignore` warning appears on every run of a sub-folder of a repository. **Decision: ignore (derived from Kotlin).**
- Good: `loc`, `rloc`, `comment_lines` exact in every checked file; all comment syntaxes including nesting and
  markers in strings; `number_of_functions` right in all 35 files (constructors, destructors, class methods,
  class operators, helpers, generics, nested routines counted; interface headers, `forward`, `external`,
  procedural types not); `if` / `else if` / `for … to` / `for … downto` / `for … in` / `while` /
  `repeat … until` / `on … do` / `and` / `or` counted, in any letter case; both `{$IFDEF}` branches counted,
  the directive expression not; variant-record `case` not counted; anonymous methods add to complexity and not
  to the function count; `message_chains` right for chains with and without parentheses; inline `var`
  and `'''` strings do not disturb the counts; `.dpr` analysed.

### Dependency parser

- Missing:
  - `application/Api.pas` (alias-only unit) and `CellarsAndCentaurs.dpr` are dropped because they declare no
    type; 13 edges, both cycles and three upward edges go with them. Nothing is printed about it. **Decision: accept (derived from Java).**
  - References outside a class / record / interface and its methods: the free routine
    `EncounterEdgeCases.Announce(const AArmor: TArmorClass)`, the unit-level `var LastHitPoints: THitPoints`,
    the `initialization` section of `Bootstrap`. **Decision: accept (derived from Kotlin).**
  - Type declarations other than class / record / interface / enum get no leaf and no edge:
    `PTreasure = ^TTreasure`, `TCreatureFormClass = class of TCreatureForm` (the fourth upward edge),
    `TEntity = TCreatureEntity` in `CreatureRepository`, procedural types. **Decision derived from Kotlin: accept — the alias `TEntity`.** **Decision: accept — pointer, class-reference and procedural types.**
  - `on E: ENoSuchCreatureException do` in `EncounterResolver.SafeRoll`: the handler type gives no edge. **Decision: accept (derived from Java).**
  - `ACreature is not TCreature` in `EncounterModernSyntax.NegatedOperators`; a hard cast without a member
    access; an inline typed variable (`var Plain: TPlain := nil`, scratch). **Decision: accept (derived from Java).**
  - A class declared without a body (`EShort = class(Exception);`, scratch) gets no leaf. **Decision: accept.**
  - Free function calls (`RollD20` in `Centaur`), enum values (`ctMonstrosity`, `stWalking`), the short
    attribute form `[Table('creatures')]` in `CreatureEntity`. **Decision derived from Kotlin: accept — free function calls.** **Decisions: accept — enum values; accept — the short attribute form.**
  - `.dpk`, `.pp`, `.lpr`, `.inc` are not scanned (`CellarsAndCentaurs.dpk` 33 edges, `encounterlog.pp`,
    `CellarsAndCentaursLazarus.lpr`, `{$I EncounterRules.inc}`, `{$I Constants.inc}`). **Decision: accept.**
  - `uses SpeedType;` in `CreatureUtil` (unit scope names). **Decision: ignore.**
  - No test-file name rule for `.pas`. **Decision: accept (derived from C++).**
- Wrong:
  - `application/CreatureFacade.pas`: with two units that declare `TCreature`, every reference resolves to
    the first `uses` entry, the unit-qualified name is ignored, the edge to the domain `Creature` is lost. **Decision: accept (derived from Java).**
  - `Zentaurenhöhle.pas`: the leaf is named `TZentaurenh`; identifiers are cut at non-ASCII letters. **Decision: accept.**
  - Records are reported as `class` (`TCreatureId`, `THitPoints`, `TSpeed`, `TDice`, `TDiceRoll`, `TTreasure`,
    `TModifier`, `TRollRecord`). **Decision: accept (derived from Java).**
- Bad:
  - `incoming_dependencies` / `outgoing_dependencies` count leaf edges, so a file with two declarations that
    use the same type counts it twice (`EncounterEdgeCases.pas` 8 for 7 files). **Decision: accept (derived from Java).**
  - Dropped files and skipped extensions are silent, also with `--verbose`. **Decision: accept (derived from Objective-C).**
  - Without a UTF-8 locale `Zentaurenhöhle.pas` is left out silently. **Decision: accept (derived from Java).**
- Good: no false positive in 50 file edges; both `uses` clauses are read; inheritance, interface
  implementation, class helpers, interface delegation, generic bases, generic arguments and constraints,
  parameter / field / return / local-variable types, constructor calls, class-method and class-const access,
  `is`, `as`, types used only inside an anonymous method or a nested routine all give the right edge;
  standard and third-party units never become internal edges; `tests/` is skipped by default.

### Domain language parser

- Missing: Delphi is not supported at all. Exit 1 with a stack trace, no output file, 0 of 17 expected words,
  0 of 7 German words. **Decision: accept.**
- Wrong: nothing to judge.
- Bad: an unsupported language ends in an `IllegalArgumentException` with a Java stack trace instead of a
  plain message; the extraction mapping for Delphi exists in the tree-sitter layer and is not wired in. **Decision: accept.**
- Good: the message names the supported extensions.
