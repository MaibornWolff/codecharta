# C#

Round 3, 2026-10-08. All numbers are from runs with `LC_ALL=C.utf8`; see "Locale" under Unified parser.
The expected values below were composed before the first parser run but could not be saved to this file
before it (the write was refused by tooling); they are unchanged except for the one correction marked
"own count wrong".

## Project
- Standard .NET layout: `CellarsAndCentaurs.sln`, `src/De.Sots.CellarsAndCentaurs/` (`Domain/Model`,
  `Domain/Service`, `Adapter/Persistence`, `Application`, `Application/Dto`), `tests/De.Sots.CellarsAndCentaurs.Tests/`,
  `scripts/`. 38 `.cs` files (37 under `src/`, 1 test), 1 `.csx`, 2 `.csproj`, 1 `.sln`.
- Round 1 and 2 constructs are unchanged (aliases, `using static`, `global using`, partial class, attribute,
  same-named `Creature` in two namespaces, `typeof` / `nameof`, `extern alias`, ...).
- Round 3 files: `Domain/Service/EncounterResolver.cs`, `Domain/Service/EncounterEdgeCases.cs` (41 construct
  members plus `EncounterLog` with a primary constructor and the record struct `Ambush` with two operators),
  `Domain/Service/CreatureExtensions.cs` (extension method), `Domain/Model/Zentaurenhöhle.cs` (non-ASCII file,
  type and field name), `Program.cs` (top-level statements), `scripts/RollInitiative.csx`.
- Not in the language: free functions (`Dice.RollD20()` is a static member; a local function and top-level
  statements are the nearest things), barrel modules (`global using` is the nearest), `unless` / `until`,
  `guard` / `defer`, comprehensions (LINQ instead), nested comments, heredocs (raw strings instead).
  `dice` in `SafeRoll(dice)` is a `Func<int, DiceRoll>` because `Dice` is a static class.
- No parser lists `.csx`; one file was added to see how it is skipped.

## Expected values (composed before the run)

Conventions on top of the README rule:
- A named function is a method, constructor, finalizer, operator, conversion operator, local function and
  every property / indexer accessor with a body (`get { }`, `set { }`, `=> expr`). Auto-accessors, primary
  constructors and record parameter lists are not functions. Lambdas and anonymous `delegate` blocks are not
  named functions but add +1 to `complexity`.
- A nested lambda or local function belongs to the enclosing function (its branches and its +1 count there);
  a local function is additionally a function of its own.
- A switch-expression arm other than `_` counts like a `case`; `and` / `or` patterns count like `&&` / `||`.
  Expected 0, because not in the README rule: `??`, `??=`, `?.`, `when`, LINQ `where`, `#if`, `is`.
- rloc of a function = code lines between its braces; an expression-bodied member is 1.
- Preprocessor directive lines and lines inside a raw string are code lines.

### `EncounterResolver.cs`
loc 112, rloc 88, comment_lines 13 (6 doc + 3 line + 2 block + 1 trailing + 1 commented-out code),
number_of_functions 6 (`Resolve`, `Describe`, `SafeRoll`, `InitiativeOrder`, local `Compare`, `IsEmpty`),
logic_complexity 15 (`Resolve` 12, `SafeRoll` 2, `InitiativeOrder` 1), complexity 22 (15 + 6 + 1 lambda),
parameters 5, 1, 1, 1, 2, 0, complexity per function 13, 1, 4, 3, 1, 1, rloc per function 47, 3, 7, 6, 1, 1,
long_method 1, long_parameter_list 1, message_chains 1, excessive_comments 1.

### `EncounterEdgeCases.cs`
loc 314, rloc 257, comment_lines 11 (lines 10-12, 150, 287-289, 295-297, 300), number_of_functions 44,
logic_complexity 26, complexity 74 (26 + 44 + 3 lambdas + 1 anonymous delegate), long_method 1
(`ExceptionFilter`, 12 body lines), long_parameter_list 0, message_chains 1 (`LinqChain`), excessive_comments 1.
Per function: see the table in "Unified parser".

### Other new files
| file | loc | rloc | comment_lines | functions | logic | complexity |
| --- | --- | --- | --- | --- | --- | --- |
| `CreatureExtensions.cs` | 11 | 9 | 0 | 1 (2 parameters) | 1 | 2 |
| `Zentaurenhöhle.cs` | 14 | 10 | 1 | 2 | 0 | 2 |
| `Program.cs` | 9 | 7 | 0 | 1 (local `Announce`) | 2 | 3 |
| `scripts/RollInitiative.csx` | skipped by all three parsers |

### Dependency edges of the new files (21)
| from | to | only construct that references it |
| --- | --- | --- |
| EncounterResolver.cs | Creature.cs | parameter types |
| EncounterResolver.cs | Speed.cs | local variable type |
| EncounterResolver.cs | HitPoints.cs | constant `HitPoints.MAX_HIT_POINTS` |
| EncounterResolver.cs | Dice.cs | `DiceRoll` as generic argument of `Func<int, DiceRoll>` |
| EncounterEdgeCases.cs | Creature.cs | parameter types, `List<Creature>` field |
| EncounterEdgeCases.cs | Centaur.cs | switch-expression arms `Centaur when …` and `Centaur stallion =>` |
| EncounterEdgeCases.cs | CreatureType.cs | property pattern `{ Type: CreatureType.Dragon }` |
| EncounterEdgeCases.cs | CreatureId.cs | generic argument of the return type `IEnumerable<CreatureId>` |
| EncounterEdgeCases.cs | ArmorClass.cs | `params ArmorClass[]` |
| EncounterEdgeCases.cs | Fightable.cs | generic constraint `where TQuarry : Fightable` |
| EncounterEdgeCases.cs | Speed.cs | tuple element type `(Speed gallop, int feet)` |
| EncounterEdgeCases.cs | Experience.cs | `default(XPValue)` |
| EncounterEdgeCases.cs | SpeedType.cs | nullable local `SpeedType? fastest` |
| EncounterEdgeCases.cs | Tameable.cs | `is not Tameable` |
| EncounterEdgeCases.cs | LairAttribute.cs | attribute on a method `[Lair("ambush")]` |
| EncounterEdgeCases.cs | Zentaurenhöhle.cs | parameter type with a non-ASCII name |
| EncounterEdgeCases.cs | CreatureExtensions.cs | extension method call `creature.IsBloodied()` |
| CreatureExtensions.cs | Creature.cs | `this Creature creature` |
| Program.cs | Creature.cs, Centaur.cs, CreatureId.cs | top-level statements |

Must not exist: `EncounterEdgeCases.cs -> NoSuchCreatureException.cs` (only in `<see cref>`),
`-> Dice.cs` (only inside a raw string), anything touching the `.csx`. Either answer accepted:
`-> HitPoints.cs` from `EncounterEdgeCases.cs` / `CreatureExtensions.cs` (property access only).
New leaves: `EncounterResolver`, `EncounterEdgeCases`, `EncounterLog`, `Ambush`, `CreatureExtensions`, `Zentaurenhöhle`.

### Domain words of the new files
Weights assumed 3 / 2 / 1 (identifier / comment / string).
- `EncounterResolver.cs`: `encounter`, `attacker`, `defender`, `terrain`, `bonus`, `reach`, `damage`, `roll`,
  `initiative`, `dice`, `creature`, `speed`; comments `armor`, `natural`, `twenty`, `fastest`; strings `swamp`,
  `plain`, `cellar`, `loaded`.
- `EncounterEdgeCases.cs`, one word per extraction position: see the table in "Domain language parser".
  XML markup that must not become words: `summary`, `param`, `returns`, `see`, `cref`, `name`, `c`.
- `Zentaurenhöhle.cs`: the seven German words whole; `die`, `unter`, `dem`, `und`, `jeder`, `zu`, `der` filtered.
- `Program.cs`: `wanderer`, `announce`, `enters`. `.csx`: `scriptorium` must not appear.

## Unified parser
- `unifiedparser -nc <dir> -e "output,FINDINGS.md" -o output/unified.cc.json`: exit 0, 38 files, message
  `4 Files with the following extensions were ignored as they are currently not supported: [.csproj, .sln, .csx]`.
- Locale: with `LC_CTYPE=POSIX` (the sandbox default) the run reports 37 files and `Zentaurenhöhle.cs` is absent
  from the map without any message; the dependency and domain parser drop it the same way. With `LC_ALL=C.utf8`
  it is analysed and all its values match. The POSIX outputs are in `output/posix-locale/`. Not checked on macOS.
- Per-construct numbers come from running each member of `EncounterEdgeCases` alone in a scratch file, because
  the map only has file-level values.

`EncounterResolver.cs`:

| metric | expected | reported | verdict |
| --- | --- | --- | --- |
| loc | 112 | 112 | ok |
| rloc | 88 | 88 | ok |
| comment_lines | 13 | 13 | ok |
| number_of_functions | 6 | 7 | deviates: the lambda assigned to `check` in `SafeRoll` is counted as a function |
| logic_complexity | 15 | 16 | wrong: `default:` in `Resolve` counts like a `case` |
| complexity | 22 | 23 | follows from `default:` |
| max / min parameters | 5 / 0 | 5 / 0 | ok |
| mean / median parameters | 1.67 / 1 | 1.6 / 1 | wrong: statistics hold 5 entries; local `Compare(left, right)` has none and its 2 parameters are dropped |
| max complexity per function | 13 | 13 | equal by accident: 12 + `default:`, without the function's own +1 |
| min complexity per function | 1 | 0 | wrong: the function's own +1 is not in the per-function value |
| mean / median complexity per function | 3.83 / 2 | 3.6 / 2 | values are 13, 0, 3, 2, 0 |
| max / min rloc per function | 47 / 1 | 47 / 1 | ok (body lines, as the README defines it) |
| mean / median rloc per function | 10.83 / 4.5 | 12.8 / 6 | 5 entries, `Compare` missing |
| long_method | 1 | 1 | ok |
| long_parameter_list | 1 | 1 | ok |
| message_chains | 1 | 1 | ok |
| excessive_comments | 1 | 1 | ok |

`EncounterEdgeCases.cs`, file level: loc 314 / 314, rloc 257 / 257, comment_lines 11 / 11, long_method 1 / 1,
message_chains 1 / 1, excessive_comments 1 / 1, number_of_functions 44 / 40, logic_complexity 26 / 29,
complexity 74 / 72, min complexity per function 1 / 0.

| construct | expected (parameters, logic, complexity) | reported | verdict |
| --- | --- | --- | --- |
| constructor | 1, 0, 1 | 1, 0, 1 | ok |
| finalizer `~EncounterEdgeCases()` | 0, 0, 1 | no function, complexity 0 | missing |
| `Morale` `get { }` / `set { }` with logic | 2 functions, logic 2 | 2 functions, logic 2 | ok |
| `IsRouted => morale == 0` | 1 function | 0 functions | missing |
| indexer `get` | 1 function | 1 function, 0 parameters | ok |
| `foreach` | 1, 1, 2 | 1, 1, 2 | ok |
| `do … while` | 1, 1, 2 | 1, 1, 2 | ok |
| switch expression, 3 arms + `_`, `when` | 2, 3, 4 | 2, 4, 5 | wrong: the `_` arm counts |
| switch statement, `case 1:` `case 2:`, `case int omen when`, `default` | 1, 3, 4 | 1, 4, 5 | wrong: `default:` counts; stacked labels count one each (ok) |
| `is > 1 and < 20 or 42` | 1, 2, 3 | 1, 2, 3 | ok |
| `??` | 1, 0, 1 | 1, 1, 2 | deviates from the README rule, by design |
| `??=` | 1, 0, 1 | 1, 0, 1 | ok, but inconsistent with `??` |
| `?.` twice | 1, 0, 1 | 1, 0, 1 | ok, but inconsistent with `??` |
| nested ternary | 1, 2, 3 | 1, 2, 3 | ok |
| `catch … when`, second `catch` | 2, 2, 3 | 2, 2, 3, long_method 1 | ok |
| LINQ query with `&&` | 1, 1, 2 | 1, 1, 2 | ok |
| LINQ chain, 6 calls, 3 lambdas | 1, 0, 4, chain 1 | 1, 0, 4, chain 1 | ok |
| local function `Parry` | 2 functions, complexity 2 | 2 functions, complexity 2 | ok at file level; no entry in the per-function statistics |
| `ExpressionBodied(int roll) => roll > 10 ? roll : 10` | 1, 1, 2, rloc 1 | 1, 1, 2 at file level; per function complexity 0, rloc 0 | wrong |
| anonymous `delegate (int strike) { }` | complexity 2 | complexity 1 | missing |
| `async` / `await` | 1, 0, 1 | 1, 0, 1 | ok |
| `await foreach` | 1, 1, 2 | 1, 1, 2 | ok |
| `yield` in `for` + `if` | 1, 2, 3 | 1, 2, 3 | ok |
| `params ArmorClass[] classes` | 1 parameter | 0 parameters | wrong |
| optional parameters | 3 | 3 | ok |
| `out`, `ref`, `out var` | 3 | 3 | ok |
| generic method with constraint | 1, 0, 1 | 1, 0, 1 | ok |
| tuple return, deconstruction | 1, 0, 1 | 1, 0, 1 | ok |
| `default(XPValue)` | 0, 0, 1 | 0, 0, 1 | ok |
| `is not Tameable &&` | 1, 1, 2 | 1, 1, 2 | ok |
| attribute on method, extension call | 1, 0, 1 | 1, 0, 1 | ok |
| non-ASCII parameter type | 1, 0, 1 | 1, 0, 1 | ok |
| label + `goto` | 1, 1, 2 | 1, 1, 2 | ok |
| `#if` / `#else`, one `if` each | 1, 2, 3 | 1, 2, 3 | ok as expected; both branches are counted, the inactive one too |
| verbatim string with `//` and `/* */` | 0 comment lines | 0 | ok |
| raw string with `//`, `/* */`, `if`, `&&` | 0 comment lines, logic 0, 5 body lines | same | ok |
| interpolated string with a ternary and `//` | 1, 1, 2, 0 comment lines | same | ok |
| `/** */` doc comment | 3 comment lines | 3 | ok |
| `///` with tags, two trailing comments on one line | 4 comment lines | 4 | ok |
| `EncounterLog(string chronicle, int capacity)` + `Headline() =>` | 1 function | 1 function | ok, primary constructor is not a function |
| `Ambush.operator +`, `implicit operator int` | 2 functions | 0 functions | missing |

- Line counting: loc, rloc and comment_lines match in all five new `.cs` files. Directive lines and `#region`
  lines are code lines. Comment markers inside verbatim, raw and interpolated strings are not counted.
- Other new files: `CreatureExtensions.cs` (2 parameters with `this`), `Zentaurenhöhle.cs` and `Program.cs`
  (1 function, logic 2, complexity 3) match completely.
- Old files:
  - `Creature.cs` reports 14 functions and complexity 15 with logic 1, `HitPoints.cs` 9, `CreatureEntity.cs` 8:
    every auto-accessor (`{ get; set; }`, `{ get; }`, `init`) is a function. Isolated: three auto-properties give
    5 functions.
  - `Dice.cs`: `IsCritical => Value == Sides` is not a function. Isolated: `public int A => 1 > 0 ? 1 : 2;`
    gives 0 functions, logic 1, complexity 1.
  - `Repository.cs`: logic 1 (ternary in `FindOne`), max complexity and max rloc per function 0, because all
    three methods are expression-bodied.
  - `CreatureChecks.cs`: 2 functions, one of them the lambda in the field `HAS_HIT_POINTS`.
  - `Creatures.cs`, `Fightable.cs`, `Repository.IdOf`: bodiless method declarations count as functions.
  - `Experience.cs`: logic 1 from `??`.
- Further isolated checks: `r is string` adds +1 logic, `r is string s` adds 0;
  `s?.Trim()?.Trim()?.Trim()?.Trim()` is not a message chain while `s.Trim().Trim().Trim().Trim()` is.

## Dependency parser
- `dependencyparser -nc …` and the same with `--include-tests`: both exit 0, no analyzer warning. Default run:
  35 files with 38 declarations, 61 file edges, 63 leaf edges. With tests: 36 files, 39 declarations, 69 file
  edges. `Found 1 strongly connected components`, `Found a total of 0 cycles`.
- Constructs that gave nothing were rerun alone in a scratch project ("isolated").

| construct | expected edge | found | verdict |
| --- | --- | --- | --- |
| `EncounterResolver.cs`: parameter type, local type, constant access, generic argument `Func<int, DiceRoll>` | Creature, Speed, HitPoints, Dice | 4 of 4 | ok |
| `EncounterEdgeCases.cs`: parameter types | Creature.cs | yes | ok |
| property pattern `{ Type: CreatureType.Dragon }` | CreatureType.cs | yes | ok |
| `IEnumerable<CreatureId>` return type | CreatureId.cs | yes | ok |
| `params ArmorClass[]` | ArmorClass.cs | yes | ok |
| `where TQuarry : Fightable` | Fightable.cs | yes | ok |
| `SpeedType? fastest` | SpeedType.cs | yes | ok |
| `[Lair("ambush")]` on a method | LairAttribute.cs | yes | ok |
| parameter type `Zentaurenhöhle` | Zentaurenhöhle.cs | yes | ok |
| switch-expression arms `Centaur when …`, `Centaur stallion =>` | Centaur.cs | no | missing; isolated: type pattern, type pattern with `when` and declaration pattern all give nothing |
| tuple element type `(Speed gallop, int feet)` | Speed.cs | no | missing, also isolated |
| `default(XPValue)` | Experience.cs | no | missing, also isolated |
| `is not Tameable` | Tameable.cs | no | missing, also isolated |
| extension call `creature.IsBloodied()` | CreatureExtensions.cs | no | missing (needs type resolution) |
| `CreatureExtensions.cs`: `this Creature creature` | Creature.cs | yes | ok |
| `Program.cs`: top-level statements | Creature, Centaur, CreatureId | no | missing; the file is not in the output at all, also isolated |
| `<see cref="NoSuchCreatureException"/>` | none | none | ok |
| `Dice.RollD20()` inside a raw string | none | none | ok |
| property access `creature.HitPoints` only | either | none | ok |
| `scripts/RollInitiative.csx` | none | none, no message | ok |
| test file, `--include-tests` | 8 edges | 8 | ok |

Found 13 of the 21 expected new edges.

Rounds 1 and 2, all rerun:

| construct (file) | expected | found | verdict |
| --- | --- | --- | --- |
| namespace `using`, fully qualified name, `new`, static member, base type, interface, attribute on class, generic argument `List<Centaur>`, interface default method, namespace `using` inside a block namespace | edge | yes | ok |
| `Dto.Creature` and domain `Creature` from `CreatureFacade.cs` | two edges | both | ok |
| `using Entity = …CreatureEntity;` (`CreatureRepository.cs`) | edge | no | missing |
| `using static …Dice;` + `RollD20()` (`CreatureUtil.cs`) | edge | no | missing |
| property types `ArmorClass?`, `HitPoints?` (`Creature.cs`) | 2 edges | no | missing |
| `global using` in `GlobalUsings.cs` (`CreatureEntity.cs -> CreatureType.cs`) | edge | no | missing |
| `creature is Centaur` (`CreatureUtil.cs`) | edge | no | missing; isolated: `o is T t` does resolve, `o is T` does not |
| `typeof(Centaur)`, `nameof(Creature)` (`CreatureKinds.cs`) | 2 edges | no | missing; `nameof(T.M)` resolves |
| `catch (NoSuchCreatureException)` (`CreatureLookup.cs`) | edge | no | missing |
| typed lambda parameter (`CreatureChecks.cs`) | edge | no | missing |
| `Bestiary::…SpeedType` (`BestiaryImport.cs`) | edge | no | missing; `global::` isolated also nothing |
| bare `HitPoints` without a using (`StableReport.cs`) | none (strict) | none | ok |
| partial class `CreatureFacade` in two files | incoming edges on `CreatureFacade.cs` | on `CreatureFacade.Stable.cs` | wrong |

- Further isolated results: `case T t:` nothing, `new T[2]` nothing; casts, `as`, `G<T>()`, `Dictionary<string, T[]>`,
  `event Action<T>`, base-class generic argument, record parameter and primary-constructor parameter all resolve.
- False positives: none. No edge to `System`, `Microsoft`, `Xunit`, `NSubstitute`.
- Cycles: expected `Creature <-> CreatureFacade`, `CreatureFacade -> CreatureService -> Creatures -> Creature`,
  `ArmorClass -> CreatureUtil -> Creature -> ArmorClass`; reported 0, no edge carries `isCyclic`. The leaf edges
  `Creature -> CreatureFacade` (Stable part) and `CreatureFacade` (main part) `-> Creature` exist, but belong to
  two different leaves.
- Upward edges: `ArmorClass.cs -> CreatureUtil.cs` and `Creature.cs -> CreatureFacade.Stable.cs` are flagged;
  `PersistedCreatures.cs -> CreatureFacade.Stable.cs` is not (levels come from the graph: Adapter 2, Application 1).
- Metrics follow the edge list: `EncounterEdgeCases.cs` 8 outgoing, `EncounterResolver.cs` 4,
  `CreatureFacade.cs` 10 outgoing / 0 incoming, `CreatureFacade.Stable.cs` 2 / 2.
- Leaf kinds: `class`, `interface`, `enum` are right. `record`, `record struct` (`Ambush`, `CreatureId`,
  `DiceRoll`, `XPValue`) and `static class` are all `class`. Every leaf edge has `usage: ["usage"]`.
- C# has namespaces and `using` only; files and folders mean nothing for resolution. The parser resolves simple
  names against the own and the imported namespaces, and fully qualified names. It does not resolve aliases,
  `using static`, usings from another file, alias-qualified names, extension methods, or types that appear in
  patterns, `typeof`, `default`, `catch`, tuples, array creation, property declarations and lambda parameters.
- Known gaps of the name rules (`analysis/analysers/parsers/DependencyParser/docs/name-resolution/csharp.md`): listed
  per probe in `regression/csharp/known-gaps.md`.

## Domain language parser
- `domainlanguageparser -nc …`: exit 0, 38 files. Variants in `output/`: `domain-MINIMAL`, `-AGGRESSIVE`,
  `-notests`, `-flat-weights`, `-no-technical`, `-ngrams2`. `--string-weight 0` exits 1 with
  `IllegalArgumentException: --string-weight must be positive, got 0`.
- `lenses.domain.nodes` has 38 entries, one per file, each word with `frequency` and `tfidf`. There is no root or
  folder entry, so the frequencies below are sums over the files.

| expected word | summed frequency |
| --- | --- |
| creature | 182 |
| centaur | 17 |
| cellar | 7 |
| dungeon | 4 |
| armor | 23 |
| hit | 44 |
| points | 43 |
| speed | 43 |
| damage | 26 |
| lair | 8 |
| initiative | 14 |
| encounter | 16 |
| treasure | 5 |
| hoard | 5 |
| stable | 23 |
| dice | 11 |
| roll | 72 |

All 17 appear. 275 distinct words.

- Keywords: none leaks (`class`, `string`, `int`, `value`, `exception` absent).
- Technical words at MODERATE: `util`, `service`, `save`, `find`, `create`, `test`, `tests`, `index`, `name`,
  `temporary` are filtered (`temporary` is a domain word here). Leaking: `entity(15)`, `repository(12)`,
  `facade(9)`, `logger(6)` (AGGRESSIVE list only), `id(54)` (third most frequent word, on no list),
  `summary(22)`, `param(4)`, `returns(4)`, `see(4)`, `cref(2)` from XML doc tags, `todo(2)` from `// TODO:`,
  `such(12)`, `one(11)`, `per(10)`, `all(5)` from identifier parts.
- `MINIMAL` adds `service`, `find`, `save`, `index`, `create`. `AGGRESSIVE` removes `entity`, `repository`,
  `facade`, `logger`, `param`, `call`, `function`, `parameter`, `parameters`. `--no-technical-stopwords` adds
  `service`, `find`, `save`, `name`, `temporary`, `index`, `create`, `util`, `tests`. `--ngrams 2` adds bigrams
  such as `hit points(36)`, `walking speed(9)`.

| form | identifier | words found | verdict |
| --- | --- | --- | --- |
| camelCase | `walkingSpeed` | walking, speed | ok |
| snake_case | `walking_speed` (test) | walking, speed | ok |
| SCREAMING_SNAKE | `MAX_HIT_POINTS` | max, hit, points | ok |
| PascalCase | `ArmorClass` | armor | ok |
| Acronym | `XPValue`, `xp_value` | xp | ok |
| Digit, leading | `d20Roll` (`CreatureUtil.cs`) | 20, roll | wrong: `d` is dropped, a bare `20` remains |
| Digit, trailing | `RollD20` (`Dice.cs`) | roll, d20 | ok, but inconsistent with the row above |
| Generic parameter | `TQuarry` | quarry | ok |
| Kebab in string | `"centaur-stable"` | centaur, stable | ok |

Extraction positions in `EncounterEdgeCases.cs`:

| position | word | found |
| --- | --- | --- |
| `foreach` variable | minotaur | yes (3) |
| declaration pattern `Centaur stallion` | stallion | yes (3) |
| `case int omen when` | omen | yes (3) |
| `catch` variable | mishap | yes (3) |
| LINQ range variable | goblin | no |
| lambda parameter | wyvern | yes (6) |
| local function / its parameter | parry / blow | yes (3 / 3) |
| anonymous delegate parameter | strike | yes (3) |
| `await foreach` variable | pip | yes (3) |
| `out var` | plunder | no |
| tuple element names | gallop, feet | no. Own count wrong: `gallop` is not unique, it also comes from `GALLOP_BONUS` in `Centaur.cs`; the edge-case file itself lists neither word |
| deconstruction variables | trot, canter | yes (3 / 3) |
| label | retry | no |
| local in the inactive `#else` branch | moat | yes (3) |
| `#region` name | catacombs | no (either answer accepted) |
| verbatim string | crypt | yes (1) |
| raw string | portcullis | yes (1) |
| interpolated string text | ambushed | yes (1) |
| `/** */` doc comment | sarcophagus | yes (2) |
| primary constructor parameter | chronicle | yes (3) |
| record positional parameter | skirmishers | yes (3) |

- Comments and strings: the planted sentences are counted with weight 2, strings with 1, declared identifiers
  with 3; the flat-weights run confirms it (`crypt` 1, `sarcophagus` 1, `minotaur` 1). Only declarations count,
  not references. Exception: `catch (InvalidOperationException)` without a variable puts `invalid(3)`,
  `operation(3)` into `EncounterResolver.cs` and `such(3)` into `CreatureLookup.cs`. Commented-out code is read
  as comment text (`// defender.TakeDamage(total * 2);` adds to `defender`, `take`, `damage`, `total`). No
  stemming (`roll` / `rolls`, `creature` / `creatures`).
- `EncounterResolver.cs`: all expected words present. `describe` is missing in every variant run, including
  `--no-technical-stopwords`, so it is not removed by the technical list; `index` is on the technical list.
- `Program.cs`: `wanderer(3)`, `announce(3)`, `enters(1)` present. `.csx`: skipped, `scriptorium` absent.
- Test file: included by default (`creature(9)`, `stable(3)`, `walking(3)`, `xp(3)`, `assert(2)`);
  `--exclude-tests` removes the file and only `assert` disappears from the totals.

- German words (`Zentaurenhöhle.cs`): `zentaurenhöhle(6)` and `rüstungsklasse(6)` whole, from identifiers only;
  `verlies(2)`, `trefferpunkte(2)`, `kreatur(2)` whole; `größe` and `höhle` not found. In the comment and the
  string, words are cut at the umlaut: `zentaurenh(2)`, `hle(3)`, `stungsklasse(2)`, `geh(2)`, `ren(2)`; `Größe`
  leaves nothing. Cause: comment and string text is matched with `\b[a-zA-Z]{3,}\b`, identifiers with a
  Unicode-aware split. German stop words leak: `die(2)`, `dem(2)`, `und(2)`, `unter(2)`, `jeder(2)`, `der(1)`;
  only an English stop list exists. `zu` is absent because it is shorter than three letters.

## Changed since 2026-09-06
- Partial class `CreatureFacade`: then one leaf and the warning `declaration(s) share a logical path …`; now two
  leaves named `CreatureFacade`, one per file, and no warning. Unchanged: every incoming edge lands on
  `CreatureFacade.Stable.cs`, `CreatureFacade.cs` has 0 incoming, no cycle is flagged.
- Domain lens: then a root node with a word list (and folder nodes); now file nodes only. Words carry `tfidf`.
- D20 splitting is the reverse of what was reported: then `d20Roll` gave `d20` and `RollD20` gave `20`.
- Stderr: the JVM native-access warning is gone.
- Leaf kinds are lowercase in the JSON (`class`, `interface`, `enum`); the earlier report wrote `CLASS`. Whether
  the output or only the earlier dump changed is not verified.
- New on old files: `is T t` resolves while `is T` does not; `catch (T)` without a variable leaks the type name
  into the domain words.
- Everything else was rerun and holds: the 48 file edges of round 2 are all still there, all missing forms are
  still missing, no keyword or MODERATE word leaks, the weights are 3 / 2 / 1, `--string-weight 0` is rejected.
- The unified parser was not part of the earlier report.

## Verdict

### Unified parser
- Missing: finalizer (`~EncounterEdgeCases`), `operator +` and `implicit operator` (`Ambush`), expression-bodied
  properties (`IsRouted`, `Dice.IsCritical`) are not functions; an anonymous `delegate` block adds no complexity;
  a `?.` call chain is not a message chain. **Decision derived from Java: accept — expression-bodied properties are no functions (function by form, as the implicit getter in Swift).** **Decisions: accept — finalizer, `operator +` and `implicit operator` are functions; accept — the anonymous `delegate` block counts like a lambda.** **Decision derived from PHP: accept — a `?.` call chain is a message chain (as `?->`).**
- Wrong: expression-bodied methods have rloc 0 and complexity 0 per function (`ExpressionBodied`,
  `Repository.FindOne`); auto-accessors count as functions (`Creature.cs` 14, `HitPoints.cs` 9); `params`
  parameters are not counted (`ParamsParameter`); `default:` and the `_` arm count as branches (`Resolve`,
  `SwitchStatement`, `SwitchExpression`); per-function complexity lacks the function's own +1; a local function
  (`Compare`) is in `number_of_functions` but not in the per-function statistics, its parameters are dropped. **Decisions derived from Java: accept — expression-bodied methods measured as empty (as constructor bodies), `params` not counted, local function without per-function entry; ignore — `default:` and `_` arm, per-function complexity without the own +1.** **Decision: ignore — auto-accessors count as functions, documented.**
- Bad: `??` counts and `??=` / `?.` do not; `x is T` counts and `x is T t` / `is not T` do not; a lambda assigned
  to a variable or field counts as a function (`check`, `HAS_HIT_POINTS`); both `#if` branches are counted; under
  a POSIX locale `Zentaurenhöhle.cs` is dropped without a message. **Decisions derived from Java: accept — lambda counted as a function only when assigned, file dropped under a POSIX locale.** **Decision derived from TypeScript: accept — `??=` counts like `??`.** **Decision derived from Kotlin: ignore — `??` counts, documented.** **Decision: accept — `x is T`, `x is T t` and `is not T` count alike.** **Decision derived from C++: ignore — both `#if` branches are counted.**
- Good: loc, rloc and comment lines in every file, including `///`, `/** */`, trailing comments and comment
  markers in verbatim, raw and interpolated strings; `foreach`, `do … while`, `await foreach`, `catch … when`,
  `and` / `or` patterns, LINQ, ternaries, `goto`; optional, `out`, `ref` and `this` parameters; primary
  constructors; top-level statements; long_method, long_parameter_list, message_chains; `.csx` is named as ignored.

### Dependency parser
- Missing: files with top-level statements (`Program.cs`); type patterns in switch expressions and `case`
  (`SwitchExpression`), `is T`, `is not T` (`NegatedTypePattern`, `CreatureUtil.cs`); tuple element types
  (`TupleReturn`); `default(T)` (`DefaultLiteral`); `new T[n]`; extension method calls (`ExtensionCall`); property
  declaration types (`Creature.cs`); `using X = …` (`CreatureRepository.cs`); `using static` (`CreatureUtil.cs`);
  `global using` (`CreatureEntity.cs`); `typeof` / `nameof(T)` (`CreatureKinds.cs`); `catch (T)`
  (`CreatureLookup.cs`); typed lambda parameters (`CreatureChecks.cs`); `Alias::` and `global::` names
  (`BestiaryImport.cs`). **Decisions derived from Java: accept — every usage form that names a project type should give an edge; a file without a type declaration should stay in the tree.**
- Wrong: partial class `CreatureFacade`: incoming edges go to `CreatureFacade.Stable.cs` only, so the cycle
  `Creature <-> CreatureFacade` is not reported. **Decision: ignore — documented.**
- Bad: every usage kind is `usage`; records and structs are `class`; `.csx` is skipped without a message. **Decisions derived from Java: accept — records reported as `class`.** **Decision derived from Kotlin: ignore — every usage kind is `usage`, documented.** **Decision derived from Objective-C: accept — `.csx` skipped without a message, skipped extensions are listed.** **Decision derived from Go: ignore — structs reported as `class`.**
- Good: namespace usings, fully qualified names, generic arguments and constraints, array parameter types,
  nullable types, attributes on classes and methods, property-pattern constants, non-ASCII type names, no false
  positive from doc comments, strings or library types, test detection.

### Domain language parser
- Missing: German stop words; root and folder word lists; LINQ range variables (`goblin`), `out var`
  (`plunder`), tuple element names (`gallop`, `feet`), labels (`retry`), `#region` names. **Decisions derived from Java: accept — labels; ignore — German stop words, root and folder word lists.** **Decision derived from Swift: accept — LINQ range variables, `out var`, tuple element names (every declared name is a word).** **Decision: ignore — `#region` names.**
- Wrong: comment and string words are cut at umlauts and `ß` (`Zentaurenhöhle.cs`); XML doc tags become words
  (`summary(22)`, `param`, `returns`, `see`, `cref`); `catch (InvalidOperationException)` yields `invalid`,
  `operation`; `d20Roll` yields a bare `20`. **Decisions derived from Java: accept — words cut at umlauts; ignore — doc tags as words, bare `20`.** **Decision: accept — `catch (InvalidOperationException)` yields `invalid`, `operation`.**
- Bad: `id(54)`; commented-out code and `TODO` feed words; identifier fragments `such`, `one`, `per`, `all`;
  `temporary` is filtered as technical; `--string-weight 0` ends in a stack trace. **Decisions derived from Java: accept — a weight of 0 is rejected; ignore — `id`, commented-out code.** **Decision derived from Kotlin: ignore — identifier fragments `such`, `one`, `per`, `all`.** **Decision derived from Swift: ignore — `TODO`.** **Decision derived from Java: ignore — `temporary` filtered as technical.**
- Good: all 17 expected words; no keyword and no MODERATE word leaks; identifier splitting for camel, snake,
  screaming, Pascal, acronym and kebab forms; umlauts in identifiers; verbatim, raw and interpolated strings;
  pattern, `catch`, `foreach`, lambda, delegate and primary-constructor names; weights 3 / 2 / 1; test files
  included by default and removable.
