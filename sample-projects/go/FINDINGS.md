# Go

Report of 2026-10-08 (round 3). It replaces the report of 2026-09-06; every claim below was re-read from fresh
output. All expected values were written into this file before the first parser run and are unchanged; where my own
expectation was wrong, the table says so.

## Project
- Module `de.sots/cellarsandcentaurs` (`go.mod`), one package per folder: `domain/model` (13 files), `domain/service`
  (7 + 2 tests), `adapter/persistence` (5), `application` (7), `application/dto` (1), `internal/stable` (1),
  `libs/dicebag` (1, own `go.mod`). 37 `.go` files, 35 without the tests, plus two `go.mod` and one `.txt`.
  `gofmt -l` is clean. The project does not compile on purpose (import cycle, offline `uuid`, `import "C"`).
- Added in round 3: `domain/service/encounter_resolver.go`, `encounter_edge_cases.go`, `encounter_cgo.go`, `doc.go`,
  `encounter_resolver_test.go`, `domain/model/zentaurenhöhle.go`. `git check-ignore -v` reports none of them.
- Stress constructs present (rounds 1 and 2): aliased import, dot import, upward dependency + cycle through a package
  constant, embedding, `var _ I = (*T)(nil)` assertions, generic `Repository[T Keyed]`, type-position-only,
  instantiate-only, two `Creature` structs, blank import, stdlib / third party, `dice.go` with two types and a free
  function, `_test.go`, `internal/` package, `//go:build` file, `//go:embed`, `replace` to a local module, type only as
  generic argument, type only in a type switch, method value.
- Go idioms standing in for constructs the README asks for in `EncounterResolver`: `for cond` for `while`, an `if`
  statement for the ternary (Go has no conditional expression), a deferred closure with `recover()` for `catch`, a
  plain `defer` for `finally`, a func literal bound to a local variable for the nested named function.
- Constructs Go does not have: barrel / re-export (nearest: type alias), annotations, fully qualified reference
  without import, per-type import, `implements`, enums, static members, `do … while`, `unless` / `until`, exception
  filters, preprocessor, property accessors, operator overloads, default parameters, generators, `async` / `await`,
  nested comments, null-coalescing, optional chaining, comprehensions.
- Extension variants: Go has only `.go`. The variants that exist are name- and content-based and are all in the
  project: `_test.go` (2), `//go:build` (`application/lair_unix.go`), cgo (`encounter_cgo.go`), package-doc-only
  (`doc.go`).

| variant | unified | dependency | domain |
| --- | --- | --- | --- |
| `*.go` | analysed | analysed | analysed |
| `*_test.go` | analysed | skipped by default, analysed with `--include-tests` | analysed by default, skipped with `--exclude-tests` |
| `//go:build unix` file | analysed | analysed | analysed |
| cgo file (`import "C"`) | analysed | analysed | analysed |
| `doc.go` (comments + package clause only) | analysed | no node (file has no declaration) | analysed |
| `zentaurenhöhle.go` (non-ASCII file name), UTF-8 locale | analysed | analysed | analysed |
| `zentaurenhöhle.go`, POSIX locale (`LC_ALL` unset in this sandbox) | **silently skipped** | **silently skipped** | **silently skipped** |
| `go.mod`, `.txt` | "3 files … not supported: [.mod, .txt]" | not listed | not listed |

## Dependency parser
- `ccsh dependencyparser -nc <dir> -e "output,FINDINGS.md" -o output/dependency.cc.json` and the same with
  `--include-tests -o output/dependency-with-tests.cc.json`: both ran without error. Default run: 34 file nodes (35
  non-test files minus `doc.go`), 58 file edges, 112 declaration leaves, 111 leaf edges. With tests: 36 nodes, 67 file
  edges, 117 leaves, 123 leaf edges. Log: "Found a total of 1 cycles" in both.
- The runs were made with `LC_ALL=C.UTF-8`. Without it (POSIX locale) the same commands succeed but leave out
  `zentaurenhöhle.go` and its edge without any message (57 edges, 33 nodes).

### Constructs of rounds 1 and 2, re-verified

| # | construct | expected edge(s) | found | verdict |
| --- | --- | --- | --- | --- |
| 1 | aliased import `dm "…/domain/model"` (creature_repository.go) | -> creature.go | x2 (`CreatureRepository -> Creature`, `toEntity -> Creature`) | ok |
| 1 | aliased import `entity "…/adapter/persistence"` (creature_service_test.go) | -> persisted_creatures.go, creature_repository.go | both, with `--include-tests` | ok |
| 2 | dot import `. "…/domain/model"` (creature_util.go) | -> creature.go, centaur.go | none, 0 outgoing; leaves `TreasureHoard`, `XPValueOf` have no edge | **missing** |
| 3 | type alias `type Fightable = model.Fightable` (aliases.go) | leaf `Fightable` -> fightable.go | edge found, leaf is called `unknown`, kind `class` | wrong (name) |
| 3 | upward `application.StandardCreatureType` (creature.go, persisted_creatures.go) | 2 edges to creature_facade.go, `isPointingUpwards` | none; creature_facade.go has 0 incoming | **missing** |
| 3 | cycle creature -> facade -> service -> creatures -> creature | 4 cyclic file edges | 0 edges carry `isCyclic`; the logged cycle is `Dice <-> DiceRoll` inside dice.go | **missing** |
| 4 | embedding `Centaur { Creature }` | centaur.go -> creature.go | x2 | ok |
| 4 | `var _ Fightable = (*Creature)(nil)` | creature.go -> fightable.go | none | **missing** |
| 4 | `var _ service.Creatures = (*PersistedCreatures)(nil)` | persisted_creatures.go -> creatures.go | none | **missing** |
| 5 | generic `Repository[T Keyed]`, `NewRepository[CreatureEntity]()` | creature_repository.go -> repository.go, creature_entity.go | x2 / x4 | ok |
| 6 | type position only (`service.CreatureService` field, `model.ArmorClass` parameter) | facade -> creature_service.go, armor_class.go | both | ok |
| 6 | instantiate only `dto.Creature{…}` | facade -> dto/creature.go | found | ok |
| 6 | constants `Monstrosity`, `Walking` (centaur.go) | centaur.go -> creature_type.go, speed_type.go | none | **missing** |
| 7 | `model.Creature` and `dto.Creature` in creature_facade.go | leaf edges to both `Creature` types | only `-> application/dto/creature.go#Creature`; in a scratch copy with the two imports swapped only `-> domain/model/creature.go#Creature` | **wrong** |
| 9 | blank import `_ "…/domain/service"` | no edge | no edge | ok |
| 10 | `uuid`, `log/slog`, `fmt`, `math/rand`, `errors`, `strings`, `testing`, `C` | no internal edge | none | ok |
| 11 | tests | skipped by default; 7 edges from creature_service_test.go | exactly that; test -> adapter x2 flagged `isPointingUpwards` | ok |
| 12 | dice.go: `Dice`, `DiceRoll`, `rollD20`; errors.go: `NoSuchCreatureException` | leaves named after the declarations | as expected | ok |
| r2 | `internal/` package (stable_registry.go) | -> internal/stable/ledger.go | x2 | ok |
| r2 | `//go:build unix` (lair_unix.go) | -> hit_points.go | x1 | ok |
| r2 | `//go:embed lair_manifest.txt` | -> lair_manifest.txt | none, no node for the resource | missing (defensible) |
| r2 | `replace de.sots/dicebag => ./libs/dicebag` (dice_bag.go) | -> libs/dicebag/bag.go | none, 0 outgoing, nothing in `--verbose` | **missing** |
| r2 | generic argument only (centaur_repository.go) | -> centaur.go | x2 | ok |
| r2 | type switch only (creature_kind.go) | -> centaur.go | x1 | ok |
| r2 | method value `reroll := dice.Roll` (initiative.go) | -> dice.go | none | missing |

### New files: expected (written before the run) vs. found

| from | to | through | found | verdict |
| --- | --- | --- | --- | --- |
| encounter_resolver.go | domain/model/creature.go | `*model.Creature` parameters | x1 | ok |
| | domain/model/dice.go | `model.Dice` parameter of `SafeRoll` | x1 | ok |
| | domain/model/speed_type.go | `model.Flying` (constant only) | none | **missing** |
| | hit_points.go, armor_class.go | I expected no edge ("only through call chains on inferred types") | **both found**: `EncounterResolver -> HitPoints`, `-> ArmorClass` | extra by mechanism, see below |
| encounter_edge_cases.go | domain/model/armor_class.go | `var fallbackArmor model.ArmorClass` (package variable type) | none | **missing** |
| | domain/service/encounter_resolver.go | methodExpression: `*EncounterResolver`, `(*EncounterResolver).IsEmpty` | x1 | ok |
| | domain/service/initiative.go | dependencySamePackageCall: `RerollInitiative(nil)` | x1 | ok |
| | domain/model/hit_points.go | dependencyConstOnly: `model.MAX_HIT_POINTS` | none | **missing** |
| | domain/model/speed_type.go | dependencyEnumConstOnly: `int(model.Flying)` | none | **missing** |
| | domain/model/fightable.go | dependencyGenericConstraint: `[F model.Fightable]` | x1 | ok |
| | domain/model/dice.go | dependencyChannelElement: `chan model.DiceRoll` | x1 | ok |
| | domain/model/creature_id.go | dependencyLocalVariableType: `var seen map[model.CreatureId]int` | x1 | ok |
| | domain/model/speed.go | dependencyLiteralInGoroutine: `model.Speed{…}` inside `go func()` | x1 | ok |
| | domain/model/errors.go | dependencyErrorsAs: `var missing *model.NoSuchCreatureException` | x1 | ok |
| | domain/model/creature_type.go | dependencyTypeAssertion: `value.(model.CreatureType)` | x1 | ok |
| | domain/model/creature.go | dependencyLocalEmbedding: `*model.Creature` in a function-local struct | x2 (`dependencyLocalEmbedding -> Creature` and `mount -> Creature`) | ok, see leaf `mount` |
| | domain/model/centaur.go | dependencyTypeSwitchPointer: `case *model.Centaur:` | x1 | ok |
| zentaurenhöhle.go | domain/model/armor_class.go | field type `ArmorClass` | x1 (UTF-8 locale only) | ok |
| encounter_cgo.go | none | `import "C"` | none, leaf `rollLoadedDice` | ok |
| doc.go | none | | no node at all | ok |
| encounter_resolver_test.go (`--include-tests`) | encounter_resolver.go, domain/model/dice.go | `&EncounterResolver{}`, `model.Dice{…}` | x3 / x1, also from inside the `t.Run` closure | ok |

Expected 17 new file edges in the default run, 13 of them found, 4 missing (all four are constants or a package
variable), 2 found that I had not expected. With tests 15 of 19.

- False positives by mechanism: a method call through a selector is recorded as a used name
  (`UsedTypeExtractor.calledMethodNames`) and then resolved like a type. `creature.HitPoints()` and
  `defender.ArmorClass().Total()` in encounter_resolver.go therefore produce edges to `HitPoints` and `ArmorClass`
  because the methods happen to carry the type names. Here the targets are plausible; a scratch probe shows it is name
  matching: `func falsePositive(animals herd) string { return animals.Centaur() }` on a local interface `herd` produced
  `falsePositive -> domain/model/centaur.go#Centaur`. No false positive of this kind exists among the 43 edges of the
  round-1/2 files.
- Scratch probe, further forms (not part of the project): in a grouped declaration
  `type ( firstGrouped struct{ id model.CreatureId }; secondGrouped struct{ dice model.Dice } )` only `firstGrouped`
  becomes a leaf and it also receives the `Dice` edge of `secondGrouped`; a method on a generic receiver
  `func (s *stack[T]) push(speed model.Speed)` contributes no edge; `var _ = model.NewArmorClass(1, 2)` contributes no
  edge. The first two are documented as known limits in `DeclarationExtractor.kt`.
- Cycles: expected 1 cross-package cycle (4 files), reported 0 cyclic file edges. Upward edges: expected 2, reported 0
  (test run: the 2 test -> adapter edges). No new cycle or upward edge from the new files, as expected.
- Leaf kinds (`class`, `interface`, `function`, now lower case): struct -> class ok; interface -> interface ok,
  including the constraint interface `edgeCaseNumber`; function -> function ok; methods are folded into their receiver
  type ok. Wrong or debatable: `type CreatureType int`, `type SpeedType int` -> class; func type `damageRule` -> class;
  alias `Fightable` -> `unknown` / class; the function-local type `mount` is a file-level leaf next to its function;
  the two `init` functions of encounter_edge_cases.go share one leaf `init`; package variables and constants
  (`fallbackArmor`, `rollTwice`, `MAX_HIT_POINTS`, all `iota` members) are no leaves.
- Leaves no longer carry a namespace, only `kind`, `language` and `level`. Leaf levels are still computed inside one
  package (`CreatureFacade` level 1 while it depends on `CreatureService`, level 1).
- Metrics: `incoming_dependencies` / `outgoing_dependencies` are sums of edge weights (persisted_creatures.go 7
  outgoing over 4 file edges, creature.go 13 / 13).
- Native vs resolved: the import path is the directory under the module, so the parser maps the import string onto the
  directory tree by suffix. `go.mod` (module name, `replace`) is not read. Package aliases are ignored (harmless), the
  dot import is not resolved, the package qualifier of a type is not used to choose between two packages.

## Unified parser
- `ccsh unifiedparser -nc <dir> -e "output,FINDINGS.md" -o output/unified.cc.json`: ran without error, 37 `.go` files
  analysed (36 under the POSIX locale, `zentaurenhöhle.go` missing without a message; kept as
  `output/unified-posix-locale.cc.json`, all other files identical). Ignored: `[.mod, .txt]`. Warning "No .gitignore
  found at root level, excluding common build folders as fallback": the scan root is the sample folder, the
  repository's `.gitignore` above it is not consulted.
- What the parser counts, from `GoMetricMapping.kt` (read only to classify the deviations): `default_case` is a
  logic-complexity node; `func_literal` is a function for `number_of_functions`; every `parameter_declaration` before
  the body counts as one parameter (receiver, named results and parameters of func types included, a group `a, b int`
  once, `variadic_parameter_declaration` not at all); per-function complexity has no +1 for the function itself;
  per-function statistics run over top-level functions only (a closure is folded into its enclosing function, a
  package-level `var f = func…` is one).

### `domain/service/encounter_resolver.go`

| metric | expected (before the run) | reported | verdict |
| --- | --- | --- | --- |
| loc | 98 | 98 | ok |
| rloc | 78 | 78 | ok |
| comment_lines | 13 | 13 | ok |
| logic_complexity | 14 (Resolve 11, SafeRoll 2, InitiativeOrder 1) | 15 | wrong by the README rule: `default:` in Resolve counts |
| complexity | 22 (14 + 5 methods + 3 closures) | 23 | same `default:` |
| number_of_functions | 5 | 8 | wrong: the 3 func literals count as functions |
| parameters max / min / mean / median | 5 / 0 / 1.6 / 1 | 6 / 1 / 2.8 / 2 | wrong: receiver counts for all 5 methods, named result `(result int)` of SafeRoll counts too (6, 2, 3, 2, 1) |
| complexity per function max / min / mean / median | 12 / 1 / 4.4 / 3 | 12 / 0 / 3.6 / 2 | different base: no +1 per function, so 12 (11 + default), 0, 4, 2, 0; the max agrees by coincidence |
| rloc per function max / min / mean / median | 33 / 1 / 11.8 / 9 | 33 / 1 / 11.8 / 9 | ok |
| long_method | 2 (Resolve, SafeRoll) | 2 | ok |
| long_parameter_list | 1 (Resolve) | 1 | ok (6 > 4 as well as 5 > 4) |
| message_chains | 1 | 1 | ok |
| excessive_comments | 1 | 1 | ok |

The per-function values in the verdict column are derived from the reported aggregates (they are the only split that
fits max, min, mean and median at once); the parser does not output values per function.

### `domain/service/encounter_edge_cases.go`

File totals, expected -> reported: loc 380 -> 380, rloc 308 -> 308, comment_lines 7 -> 7, logic_complexity 32 -> 35
(three `default` clauses), complexity 94 -> 97, number_of_functions 54 -> 62 (8 func literals), long_method 2 -> 2,
long_parameter_list 1 -> **0**, message_chains 0 -> 0, excessive_comments 0 -> 0, parameters max 5 -> 4, mean 0.93 ->
0.93 (coincidence: 50 / 54 expected, 51 / 55 counted), median 1 -> 1, complexity per function max 5 -> 4 and min 1 ->
0 (no +1), rloc per function max 14 -> 14, min 0 -> 0.

The "reported" columns per construct come from a scratch run with every function in a file of its own (55 files);
their sums equal the totals of the real file. Format: parameters / logic / complexity.

| function | construct | expected | reported | verdict |
| --- | --- | --- | --- | --- |
| `rollTwice` | package-level `var … = func(sides int)` | no named function, – / 0 / 1 | 1 function, 1 / 0 / 1 | counted as a function |
| `damageRule`, `edgeCaseRoller`, `edgeCaseNumber` | func type, interface method specs, `~int \| ~float64` | no function | no function | ok |
| `init`, `init` | two functions of one name | 0 / 0 / 1 each | 0 / 0 / 1 each | ok |
| forClassic | three-clause `for` | 1 / 1 / 2 | 1 / 1 / 2 | ok |
| forCondition | `for cond` | 1 / 1 / 2 | 1 / 1 / 2 | ok |
| forInfinite | bare `for` + `if` + `break` | 1 / 2 / 3 | 1 / 2 / 3 | ok |
| forRange | `for … range slice` | 1 / 1 / 2 | 1 / 1 / 2 | ok |
| forRangeInteger | `for range 3` | 0 / 1 / 2 | 0 / 1 / 2 | ok |
| forRangeChannel | `for … range channel` | 1 / 1 / 2 | 1 / 1 / 2 | ok |
| switchWithoutTag | `switch {` 2 cases + default | 1 / 2 / 3 | 1 / 3 / 4 | default counted |
| typeSwitch | 3 type cases + default | 1 / 3 / 4 | 1 / 4 / 5 | default counted |
| switchFallthrough | 3 cases, `fallthrough`, `case 1, 0:` | 1 / 3 / 4 | 1 / 3 / 4 | ok |
| selectCases | `select` 2 comm cases + default | 2 / 2 / 3 | 2 / 3 / 4 | default counted |
| ifWithInit | `if _, err := …; err != nil` | 1 / 1 / 2 | 1 / 1 / 2 | ok |
| deferRecover | deferred closure with `if recover() != nil`, named result | 0 / 1 / 3 | 1 / 1 / 3, 2 functions | named result `(failed bool)` is a parameter |
| goroutine | `go func() {…}()`, `go call()` | 1 / 0 / 2 | 1 / 0 / 2, 2 functions | ok |
| closureCounter | returned func literal | 0 / 0 / 2 | 0 / 0 / 2, 2 functions | ok |
| nestedClosures | two nested func literals, one `&&` | 1 / 1 / 4 | 1 / 1 / 4, 3 functions | ok |
| immediatelyInvoked | `func(…){ if }(roll)` | 1 / 1 / 3 | 1 / 1 / 3, 2 functions | ok |
| pointerReceiver | `(t *edgeCaseTally)` + 1 parameter | 1 / 0 / 1 | 2 / 0 / 1 | receiver counted |
| valueReceiver | `(t edgeCaseTally)` | 0 / 0 / 1 | 1 / 0 / 1 | receiver counted |
| unnamedReceiver | `(edgeCaseTally)`, empty body | 0 / 0 / 1 | 1 / 0 / 1 | receiver counted |
| genericReceiver | `(p edgeCasePair[K, V])` | 0 / 0 / 1 | 1 / 0 / 1 | receiver counted |
| variadic | `bonuses ...int` + range | 1 / 1 / 2 | 0 / 1 / 2 | variadic parameter not counted |
| groupedParameters | `(strength, dexterity int, name, title string)` | 4 / 0 / 1 | 2 / 0 / 1 | a group counts once |
| groupedLongParameterList | `(strength, dexterity, constitution, wisdom, charisma int)` | 5 / 0 / 1, long_parameter_list 1 | 1 / 0 / 1, long_parameter_list 0 | a group counts once, smell missed |
| blankParameters | `(_ int, _ string)` | 2 / 0 / 1 | 2 / 0 / 1 | ok |
| callbackParameter | `apply func(int, string) error, fallback damageRule` | 2 / 0 / 1 | 4 / 0 / 1 | the func type's own two parameters are added |
| channelDirections | `<-chan`, `chan<-`, `out <- <-in` | 2 / 0 / 1 | 2 / 0 / 1 | ok |
| multipleReturns | `(roll int) (int, error)` + if | 1 / 1 / 2 | 3 / 1 / 2 | both results counted as parameters |
| namedReturns | `(damage, armor int) (remaining, absorbed int, err error)` | 2 / 0 / 1 | 3 / 0 / 1 | 1 group + 2 result declarations |
| genericMax | `[T edgeCaseNumber](left, right T)` + if | 2 / 1 / 2 | 1 / 1 / 2 | a group counts once |
| labelledBreak | 2 loops, 2 ifs, `continue outer`, `break outer` | 1 / 4 / 5 | 1 / 4 / 5, long_method 1 | ok |
| gotoRetry | label + `if` + `goto` | 1 / 1 / 2 | 1 / 1 / 2 | ok |
| rawStringWithCommentMarkers | raw string over 4 lines with `//`, `/* */`, `&&`, `\|\|`, `if`, `for case select` | 0 / 0 / 1, 0 comment lines | 0 / 0 / 1, 0 comment lines, body rloc 4 | ok |
| stringWithCommentMarkers | `"http://…"`, `"/* open */ a && b \|\| c"`, `'/'` | 0 / 0 / 1, 0 comment lines | 0 / 0 / 1, 0 comment lines | ok |
| logicalOperators | `(hit, critical, blocked bool)`, `hit && !blocked \|\| critical` | 3 / 2 / 3 | 1 / 2 / 3 | a group counts once |
| bitwiseAndChannelOperators | `&`, `\|`, `&^`, `<-` | 2 / 0 / 1 | 2 / 0 / 1 | ok |
| oneLiner | `func oneLiner() int { return 20 }` | 0 / 0 / 1 | 0 / 0 / 1, body rloc 1 | ok |
| directiveNoinline | `//go:noinline` | 0 / 0 / 1, 1 comment line | 0 / 0 / 1, 1 comment line | ok |
| docLineComment / docBlockComment / docJavadocComment | `//`, `/* */`, `/** */`, empty bodies | 0 / 0 / 1 each, 1 + 1 + 3 comment lines | as expected, body rloc 0 | ok |
| methodExpression | `(*EncounterResolver).IsEmpty` | 1 / 0 / 1 | 1 / 0 / 1 | ok |
| dependencySamePackageCall … dependencyLocalEmbedding | 10 functions | parameters 0,0,0,1,1,0,1,1,1,0; 0 / 1 each | as expected (dependencyLiteralInGoroutine: 2 functions) | ok |
| dependencyTypeSwitchPointer | type switch, 1 case, no default | 1 / 1 / 2 | 1 / 1 / 2 | ok |

### Other new files

| file | expected loc / rloc / comment / functions / logic / complexity | reported | verdict |
| --- | --- | --- | --- |
| encounter_cgo.go (cgo preamble with C `if`, `&&`, `?:`) | 17 / 5 / 10 / 1 / 0 / 1 | 17 / 5 / 10 / 1 / 0 / 1 | ok, the C code in the comment is not counted |
| doc.go (package doc only) | 4 / 1 / 3 / 0 / 0 / 0 | 4 / 1 / 3 / 0 / 0 / 0 | ok |
| encounter_resolver_test.go | 40 / 33 / 1 / 4 / 4 / 10 | 40 / 33 / 1 / **6** / 4 / 10 | functions: the `t.Run` and `f.Fuzz` closures count |
| zentaurenhöhle.go | 10 / 7 / 1 / 1 / 0 / 1 | 10 / 7 / 1 / 1 / 0 / 1 (parameters 1 instead of 0: receiver) | ok when the file is found |

- Line counting: loc, rloc and comment_lines agree with the hand count in all six new files. Comment markers inside
  interpreted strings, raw strings and a rune are not counted as comments; a trailing comment counts for both rloc and
  comment_lines; `//go:generate`, `//go:noinline`, `//go:build` and `//go:embed` directives count as comment lines
  (lair_unix.go 1, lair_manifest.go 1), which follows the syntax but is not prose.
- Other files: every method has its receiver in the parameter statistics (creature.go: `Id()` has 1, min 1, mean
  1.46 = 19 / 13); creature_kind.go reports logic 2 for one `case` plus `default`; interface method specs
  (fightable.go, creatures.go) are not functions (0), which is right although `GoMetricMapping` lists the node type
  `method_spec` for it. hit_points.go (logic 2, complexity 5), creature_facade.go (long_method 1, `Create` 15 rloc) and
  creature_service_test.go (logic 2, long_method 1) are correct.

## Domain language parser
- `ccsh domainlanguageparser -nc <dir> -e "output,FINDINGS.md" -o output/domain.cc.json`: ran without error, 37 file
  nodes (36 under the POSIX locale). Variants in `output/`: `domain-minimal`, `domain-aggressive`, `domain-no-tech`,
  `domain-exclude-tests`, `domain-ngrams2`. `--comment-weight 0` still ends with
  `IllegalArgumentException: --comment-weight must be positive, got 0` and a stack trace, exit code 1.
- **There is no root node and no folder node in `lenses.domain.nodes`**: the lens holds the 37 files only (12 folders
  in the tree have no entry). The README's "must appear in the root node's word list" cannot be checked as written;
  the numbers below are the sums over all files.
- Expected words, all 17 present (sum over files): creature 130, roll 55, speed 46, hit 40, armor 39, damage 38,
  points 36, dice 25, centaur 20, lair 15, stable 15, initiative 14, encounter 12, cellar 8, dungeon 6, treasure 5,
  hoard 5. Plurals are separate words: creatures 25, speeds 19, rolls 20, centaurs 2.
- Keyword leakage: no Go keyword or built-in appears. `class` (31) comes from `ArmorClass` and is right. The keyword
  list is also applied to prose: `map` from the string "the lair map" (encounter_edge_cases.go) is dropped, as are
  `if`, `for`, `case`, `select` planted in the raw string (wanted) and `return`, `int` from the C preamble.
- Technical-word leakage at MODERATE: repository 24, entity 15, facade 6, logger 3, request 3, value 33, init 12,
  result 6 (all only on the AGGRESSIVE list, so by design); id 51, key 12; `json` 9 from the struct tags in
  application/dto/creature.go; `http` 1 from a URL string; `benchmark` 3 and `fuzz` 3 from the test-function prefixes
  (`test` and `example` are filtered); `output` 2 from `// Output: true`. Filtered correctly: `util`, `exception`,
  `test`, `service`, `save`, `find`, `set`, `create`. MINIMAL adds save 18, service 17, find 15, set 12, index 9,
  base 6, exception 6, create 3; AGGRESSIVE removes value, repository, entity, init, facade, result, parameter,
  parameters, request, types, logger, call, method.
- Compiler directives and cgo are read as prose: `generate` 2, `stringer` 2, `speed` 2 (from `-type=SpeedType`) out of
  `//go:generate stringer -type=SpeedType`; `noinline` 2 of its 5; `build` 2, `unix` 2 (lair_unix.go); `embed` 2,
  `txt` 2 (lair_manifest.go); `include` 2, `stdlib` 2, `static` 2, `sides` 10 of its 13 from the C preamble of
  encounter_cgo.go. The commented-out line `// total = total * 2` (encounter_resolver.go) adds 4 to `total`.
- Identifier splitting:

| form | identifier | words found |
| --- | --- | --- |
| camelCase | `walkingSpeed` | walking 3, speed 3 (creature_facade.go) |
| snake_case | `walking_speed` | walking 3, speed 3 (creature_service_test.go) |
| SCREAMING_SNAKE | `MAX_HIT_POINTS` | max, hit, points (hit_points.go) |
| PascalCase | `ArmorClass` | armor, class |
| Acronym | `XPValue` | xp 3, value 3 (centaur.go) |
| Digit | `d20Roll` / `rollD20` | dice.go: `20` 3 and `d20` 3; `d20Roll` loses the `d`, `rollD20` keeps `d20` |
| Kebab in string | `"centaur-stable"` | centaur 1, stable 1 (creature_facade.go) |
| snake_case inside a comment | `roll_loaded_dice` (encounter_cgo.go preamble) | **nothing**: roll, loaded, dice stay at 3 (the Go identifier only). Scratch probe: `// the gelatinous_cube oozes past the owlbear2 and the mind-flayer` yields oozes, past, mind, flayer; `gelatinous_cube` and `owlbear2` vanish |
| type alias | `type Fightable = model.Fightable` (aliases.go) | nothing, the file has an empty word list |

- Comments and strings: all planted sentences are counted with identifier 3, comment 2, string 1 (creature.go:
  cellar 2, roams 2; hit_points.go: lair 2, drop 2; creature_facade.go: initiative 2, dungeon 2, encounter 2, stable
  3 + 1; creature_util.go: treasure 3 + 2; errors.go: dungeon 1). All three doc-comment syntaxes are read
  (encounter_edge_cases.go: vault 2, portcullis 2, gargoyle 2). Identifiers count once per declaration, not per use.
  Every word also carries a `tfidf` score.
- Test files: included by default. `Test_should_save_creature_to_the_stable` yields creature and stable;
  `TestResolve_should_miss_on_a_natural_one` yields resolve, miss, natural, one. `--exclude-tests` drops both test
  files (35 nodes; creature 130 -> 119, stable 15 -> 11, roll 55 -> 49).
- New files against the expectation written before the run: encounter_resolver.go has all its expected words;
  encounter_edge_cases.go has vault, portcullis, gargoyle, lair, cellar, but not `map` (my expectation; it is a Go
  keyword) and does have `generate`, `stringer`, `noinline`; encounter_cgo.go has roll, loaded, dice, sides and also
  `include`, `stdlib`, `static`; encounter_resolver_test.go has natural, miss, cellar, dungeon, lair, safe, roll and
  also `benchmark`, `fuzz`, `output`.

- German words (`domain/model/zentaurenhöhle.go`, UTF-8 locale; under POSIX the file is not read at all):

| word | expected | reported |
| --- | --- | --- |
| zentaurenhöhle | 5 (type 3 + comment 2) | 3: identifier whole; the comment occurrence is cut into `zentaurenh` 2 + `hle` |
| rüstungsklasse | 5 (field 3 + comment 2) | 3: identifier whole; comment gives `stungsklasse` 2 (`r` dropped) |
| verlies | 2 | 2 |
| trefferpunkte | 2 | 2 |
| kreatur | 2 | 2 |
| größe | 1 (string) | **missing** (`gr` and `e` are too short) |
| höhle | 1 (string) | **missing**; `hle` 3 = 2 from the comment + 1 from the string |

  Five of seven appear, two of them only thanks to the identifier. Identifiers are split Unicode-aware; comments and
  strings go through `\b[a-zA-Z]{3,}\b` (`SplitStage.kt`), which cuts at every umlaut and `ß`: `gehören` -> `geh` 2 +
  `ren` 2. German stop words leak: die 2, unter 2, dem 2, und 2, jeder 2, der 1 (`zu` is below the minimum length);
  there is only `english-stopwords.txt`.

## Changed since 2026-09-06
- Domain lens: the root and folder nodes are gone (then 30 nodes = root + 7 folders + 22 files, now files only), so
  "90 words at the root" and every root frequency of the old report have no counterpart. Words now carry `tfidf`.
- Dependency lens: leaf kinds are lower case (`class`, not `CLASS`); leaves carry no namespace any more, so the old
  statements "the test's leaf lands in namespace `domain.service`" and "leaf named `application.unknown`" can only be
  confirmed as "leaf `unknown` in aliases.go". The old source references (`GoTypeQuery.extractName`,
  `GoDeclarationsQuery`, `GoVariableQuery`, `resolveComplexModuleImport`) no longer describe the Go extraction; it
  lives in `treeSitterExcavationSite/…/languages/go/extractors/`.
- Unchanged, re-verified on the old files: 43 / 50 file edges, 54 / 55 leaves, 92 / 100 leaf edges; every "missing"
  and "wrong" item of the old verdict still holds (dot import, constants, `var _` assertions, `replace`, method
  value, `//go:embed`, same simple name, alias leaf `unknown`, named int types as class); no false positive on the
  old files; `d20Roll` / `rollD20` split, `json` leak, directive words and the weight-0 stack trace are as before.
- New on old files: the unified parser was not part of the old report; its findings on the old files are the receiver
  counted as a parameter everywhere, `default` counted in creature_kind.go, and directive comment lines in
  lair_unix.go and lair_manifest.go. aliases.go has an empty domain word list.

## Verdict

### Unified parser
- Missing:
  1. `domain/model/zentaurenhöhle.go` is dropped without a warning when the JVM runs under a POSIX locale (file name
     with `ö`); with `LC_ALL=C.UTF-8` it is analysed correctly. Same for the other two parsers. **Decision: accept for all three parsers (derived from Java).**
  2. encounter_edge_cases.go `variadic(bonuses ...int)`: the variadic parameter is not counted (0 instead of 1). **Decision: accept (derived from Java).**
- Wrong:
  1. Grouped parameters count once per group: `groupedLongParameterList(strength, dexterity, constitution, wisdom,
     charisma int)` has 1 parameter, so `long_parameter_list` is 0 instead of 1; `groupedParameters` 2 instead of 4,
     `logicalOperators` 1 instead of 3, `genericMax` 1 instead of 2.
  2. Receivers count as parameters: every method is one too high (`IsEmpty()` 1, `Resolve` 6; creature.go min 1).
  3. Results count as parameters: `multipleReturns(roll int) (int, error)` 3, `namedReturns` 3, `SafeRoll(dice) (result
     int)` 3, `deferRecover() (failed bool)` 1.
  4. `callbackParameter(apply func(int, string) error, fallback damageRule)`: 4, the parameters of the func type are
     added to those of the function.
  5. `number_of_functions` includes func literals (encounter_resolver.go 8 instead of 5, edge cases 62 instead of 54,
     test file 6 instead of 4, package-level `var rollTwice = func…`), while the per-function statistics leave nested
     closures out; the two numbers of one file do not describe the same set. **Decision: accept (derived from Java).**
  6. `default:` counts as a decision in `switch`, type switch and `select` (encounter_resolver.go logic 15 instead of
     14; `switchWithoutTag`, `typeSwitch`, `selectCases` +1 each; creature_kind.go). Against the README rule; a
     deliberate entry in `GoMetricMapping`. **Decision: ignore (derived from Java).**
- Bad:
  1. `max/min/mean/median_complexity_per_function` is the logic complexity of the function without the +1 that
     `complexity` adds per function, so a branch-free function has 0 and the file-level and function-level numbers
     cannot be added up. **Decision: ignore (derived from Java).**
  2. `//go:` directives count as comment lines.
  3. "No .gitignore found at root level" when a sub-folder of a repository is scanned. **Decision: ignore (derived from Kotlin).**
- Good: loc, rloc and comment_lines are exact in all new files, including raw strings with comment markers, the cgo
  preamble and a doc-only file; all three `for` forms, `range` over slice, integer and channel, `if` with init,
  tagless switch, type switch, `fallthrough`, multi-value `case`, `select`, labelled `break` / `continue`, `goto`,
  `&&` / `||` versus bitwise and channel operators, closures, goroutines, `defer` / `recover`, generics and two `init`
  functions are counted as expected; `long_method`, `message_chains` (5-call chain yes, 3-call chain no) and
  `excessive_comments` are right; rloc per function matches the hand count; interface method specs and func types are
  not functions.

### Dependency parser
- Missing:
  1. Package-level constants and variables are neither leaves nor usages: `model.Flying` (encounter_resolver.go,
     `dependencyEnumConstOnly`), `model.MAX_HIT_POINTS` (`dependencyConstOnly`), `Monstrosity` / `Walking`
     (centaur.go), `application.StandardCreatureType` (creature.go, persisted_creatures.go). With the last one the
     planted upward dependency and the cycle creature -> facade -> service -> creatures -> creature are invisible.
  2. Dot import (`application/creature_util.go`): no outgoing edge at all.
  3. Package-level `var` declarations are not scanned: `var fallbackArmor model.ArmorClass` (encounter_edge_cases.go),
     `var _ Fightable = (*Creature)(nil)`, `var _ service.Creatures = (*PersistedCreatures)(nil)`, so Go's way of
     stating "implements" yields no edge.
  4. `replace de.sots/dicebag => ./libs/dicebag`: `domain/model/dice_bag.go -> libs/dicebag/bag.go` is absent, `go.mod`
     is not read, nothing is logged.
  5. Method value `reroll := dice.Roll` (initiative.go) and `//go:embed lair_manifest.txt`: no edge. **Decision: accept (derived from Java).**
  6. Scratch probe only: types after the first in a `type ( … )` group and methods on a generic receiver.
- Wrong:
  1. `application/creature_facade.go`: `model.Creature` and `dto.Creature` collapse onto the package imported first
     (dto as written, model after swapping the two import lines in a scratch copy). **Decision: accept (derived from Java).**
  2. Called method names are resolved as type names: `creature.HitPoints()` / `defender.ArmorClass()` in
     encounter_resolver.go create `EncounterResolver -> HitPoints` / `-> ArmorClass`; the probe `animals.Centaur()` on
     an unrelated local interface creates an edge to `domain/model/centaur.go`.
  3. `application/aliases.go`: the alias `Fightable` is a leaf named `unknown`.
  4. Kinds: `CreatureType`, `SpeedType` (named int) and `damageRule` (func type) are `class`.
- Bad:
  1. The log reports "1 cycle" while no file edge is cyclic (it is `Dice <-> DiceRoll` inside dice.go).
  2. encounter_edge_cases.go: the function-local type `mount` is a file-level leaf; two `init` functions are one leaf. **Decisions derived from Java: accept — function-local type exported as a file-level leaf.**
  3. `doc.go` is not a node, so the file count differs from the other two parsers (34 vs 35 non-test files). **Decision: accept (derived from Java).**
  4. Leaf levels are per package; unresolved imports leave no trace even with `--verbose`.
- Good: 13 of the 17 expected new edges and all 43 old ones are present; a type is found as parameter, result,
  field, embedded field (also in a local struct), composite literal inside a goroutine, generic argument, generic
  constraint, channel element, map key of a local variable, pointer target of a local variable, type assertion,
  type-switch case and method expression; same-package calls resolve; aliased imports, `internal/`, `//go:build`
  files and cgo files work; no edge to stdlib, third party or `C`; tests are skipped by default and attached
  correctly with `--include-tests`, including usages inside `t.Run` closures.

### Domain language parser
- Missing:
  1. No root and no folder word lists: the lens contains file nodes only. **Decision: ignore (derived from Java).**
  2. German words in comments and strings: `Größe` and `Höhle` (string in zentaurenhöhle.go) are lost, every
     umlaut word in the comment is cut (`zentaurenh` / `hle`, `stungsklasse`, `geh` / `ren`). **Decision: accept (derived from Java).**
  3. snake_case and digit-carrying words in comments and strings vanish (`roll_loaded_dice` in encounter_cgo.go;
     probe `gelatinous_cube`, `owlbear2`). **Decision derived from Vue: accept — snake_case words in comments and strings.**
  4. No German stop words: die, unter, dem, und, jeder, der stay. **Decision: ignore (derived from Java).**
  5. `application/aliases.go`: the alias name `Fightable` is not extracted.
- Wrong:
  1. `d20Roll` -> `20` + `roll`, `rollD20` -> `roll` + `d20` (dice.go). **Decision: ignore (derived from Java).**
  2. `--comment-weight 0`: stack trace instead of a message. **Decision: accept (derived from Java).**
- Bad:
  1. Directives and embedded code are read as prose: `//go:generate`, `//go:noinline`, `//go:build`, `//go:embed`,
     the C preamble of encounter_cgo.go (`include`, `stdlib`, `static`), commented-out code. **Decisions derived from Java: ignore — commented-out code.**
  2. Go-specific technical words pass MODERATE: `json` (struct tags), `benchmark`, `fuzz`, `output`, `http`, `id`,
     `key`. **Decision: ignore (derived from Java).**
  3. Plural and singular are separate words (creature 130 / creatures 25, roll 55 / rolls 20). **Decision: ignore (derived from Java).**
  4. The Go keyword filter also removes prose words (`map` in "the lair map"). **Decision: ignore (derived from Kotlin).**
- Good: all 17 expected words are found; no Go keyword leaks, also not from a raw string full of keywords;
  identifiers split correctly for camelCase, snake_case, SCREAMING_SNAKE, PascalCase, acronym and Unicode
  (`Zentaurenhöhle`, `rüstungsklasse` stay whole); kebab words in strings split; `//`, `/* */` and `/** */` comments
  are all read; weights 3 / 2 / 1 are consistent; test files are included by default and `--exclude-tests` removes
  exactly them.
