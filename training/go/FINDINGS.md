# Go

## Project
- Module `de.sots/cellarsandcentaurs` (`go.mod`), one package per folder: `domain/model` (11 files), `domain/service`
  (2 + 1 test), `adapter/persistence` (4), `application` (3), `application/dto` (1). 22 `.go` files, 21 without the
  test. Everything parses (`gofmt -l` clean); `go build` fails only on the deliberate import cycle
  (`model -> application -> model`) and the offline `uuid` download.
- Stress constructs present: aliased import (`dm "…/domain/model"` in `creature_repository.go`, `entity "…/adapter/persistence"`
  in the test), dot import (`. "…/domain/model"` in `creature_util.go`), upward dependency + cycle
  (`creature.go` and `persisted_creatures.go` reference `application.StandardCreatureType`), embedding (`Centaur` embeds
  `Creature`), implicit interface satisfaction with the `var _ Fightable = (*Creature)(nil)` / `var _ service.Creatures =
  (*PersistedCreatures)(nil)` assertions, generic `Repository[T Keyed]` embedded by `CreatureRepository`, type-position-only
  (`service.CreatureService` field, `model.ArmorClass` parameter), instantiate-only (`dto.Creature{…}` literal), package-level
  constant as the "static member", two `Creature` structs (`domain/model`, `application/dto`) both used in `CreatureFacade`,
  blank import `_ "…/domain/service"` as the unused import, stdlib/third-party (`uuid`, `log/slog`, `fmt`, `math/rand`),
  `dice.go` with `Dice`, `DiceRoll`, free `rollD20`, `errors.go` holding `NoSuchCreatureException`, `creature_service_test.go`.
- Constructs Go does not have: barrel/re-export module (the nearest thing is a type alias, `type Fightable = model.Fightable`
  in `aliases.go`), annotations/decorators (struct tags are strings), fully qualified reference without import, per-type
  import (imports are always whole packages), `implements` keyword, enums (`type X int` + `const … iota`), static members
  (package-level `const`). Go forbids import cycles and unused imports at compile time, so the cycle and the unused-import
  constructs can only exist in a non-compiling project or as a blank import.

## Dependency parser
- `ccsh dependencyparser -nc <dir> -e "output,FINDINGS.md" -o output/dependency.cc.json` and the same with
  `--include-tests -o output/dependency-with-tests.cc.json`: both ran without error (21 / 22 leaves = files, 36 / 43 file
  edges, 42 / 43 declaration leaves, 79 / 87 leaf edges, "1 cycle").

### Expected file-level edges (written before the first run)

Derived from actual type / function usages in the source, not from import lines. Paths relative to `training/go`.

| from | to |
| --- | --- |
| domain/model/creature.go | domain/model/creature_id.go, creature_type.go, armor_class.go, speed.go, speed_type.go, hit_points.go, fightable.go (`var _ Fightable`), dice.go (`rollD20`, `DiceRoll`), application/creature_facade.go (`application.StandardCreatureType`, upward, cyclic) |
| domain/model/centaur.go | domain/model/creature.go (embedding + `NewCreatureOfType`), creature_id.go, creature_type.go (`Monstrosity`), armor_class.go, speed.go, speed_type.go (`Walking`) |
| domain/model/fightable.go | domain/model/armor_class.go, hit_points.go |
| domain/model/errors.go | domain/model/creature_id.go |
| domain/model/dice.go, creature_id.go, creature_type.go, armor_class.go, hit_points.go, speed.go, speed_type.go | none (stdlib / uuid only) |
| domain/service/creatures.go | domain/model/creature.go, creature_id.go |
| domain/service/creature_service.go | domain/service/creatures.go, domain/model/creature.go, creature_id.go (cyclic: creature -> facade -> service -> creature) |
| adapter/persistence/creature_entity.go, repository.go | none |
| adapter/persistence/creature_repository.go | adapter/persistence/repository.go (generic embedding), creature_entity.go, domain/model/creature.go (alias `dm`) |
| adapter/persistence/persisted_creatures.go | adapter/persistence/creature_repository.go, domain/service/creatures.go (`var _ service.Creatures`), domain/model/creature.go, creature_id.go, errors.go, application/creature_facade.go (upward) |
| application/creature_facade.go | domain/service/creature_service.go, domain/model/creature.go, creature_id.go, creature_type.go, hit_points.go, speed.go, speed_type.go, armor_class.go, application/dto/creature.go |
| application/creature_util.go | domain/model/creature.go, centaur.go (dot import); **no** edge to domain/service (blank import) |
| application/aliases.go | domain/model/fightable.go |
| application/dto/creature.go | none |
| domain/service/creature_service_test.go (only with `--include-tests`) | domain/service/creature_service.go, adapter/persistence/persisted_creatures.go, creature_repository.go, domain/model/creature.go, creature_id.go, speed.go, speed_type.go |
| application/stable_registry.go (round 2) | internal/stable/ledger.go (`internal/` package, `stable.NewLedger`, `*stable.Ledger`) |
| application/lair_unix.go (round 2) | domain/model/hit_points.go (`//go:build unix` file, `model.HitPoints` parameter and return type) |
| application/lair_manifest.go (round 2) | application/lair_manifest.txt (`//go:embed lair_manifest.txt`; the target is a resource, not a Go file) |
| domain/model/dice_bag.go (round 2) | libs/dicebag/bag.go (`replace de.sots/dicebag => ./libs/dicebag` in go.mod, `dicebag.Fill`, `dicebag.Bag`) |
| adapter/persistence/centaur_repository.go (round 2) | domain/model/centaur.go (only as generic argument `Repository[model.Centaur]`, `NewRepository[model.Centaur]()`); control edge to adapter/persistence/repository.go |
| application/creature_kind.go (round 2) | domain/model/centaur.go (only in the type switch `case *model.Centaur:`); control edge to domain/model/fightable.go (parameter type) |
| domain/service/initiative.go (round 2) | domain/model/dice.go (only through the method value `dice.Roll`, no type name); control edge to domain/model/creature.go (parameter type) |
| internal/stable/ledger.go, libs/dicebag/bag.go (round 2) | none |

Expected cycles: `creature.go -> creature_facade.go -> creature_service.go -> creatures.go -> creature.go` (and the shorter
`creature.go -> creature_facade.go -> creature.go`). Expected upward edges: creature.go -> application,
persisted_creatures.go -> application.

### Construct table

| # | construct | expected edge(s) | found | verdict |
| --- | --- | --- | --- | --- |
| 1 | aliased import `dm "…/domain/model"` (creature_repository.go) | creature_repository.go -> creature.go | found x2 (`CreatureRepository -> Creature`, `toEntity -> Creature`) | ok (alias is ignored, resolution goes by package path suffix) |
| 1 | aliased import `entity "…/adapter/persistence"` (test) | test -> persisted_creatures.go, creature_repository.go | found (with `--include-tests`) | ok |
| 2 | dot import `. "…/domain/model"` (creature_util.go) | creature_util.go -> creature.go, centaur.go | **nothing**: `creature_util.go` has 0 outgoing; `TreasureHoard` and `XPValueOf` have no leaf edges | **missing** |
| 3 | re-export / barrel | Go has none; type alias `type Fightable = model.Fightable` in aliases.go | edge aliases.go -> fightable.go found, but the leaf is named `application.unknown`, kind CLASS | wrong (name and kind) |
| 3 | upward dependency `application.StandardCreatureType` from creature.go and persisted_creatures.go | creature.go -> creature_facade.go, persisted_creatures.go -> creature_facade.go, both `isPointingUpwards` | **no edge at all**; no upward edge in the default run | **missing** |
| 3 | cycle creature -> facade -> service -> creatures -> creature | 4 cyclic file edges | none; the "1 cycle" in the log is `Dice <-> DiceRoll` inside dice.go (same file, so not a file edge) | **missing** (consequence of the const reference above) |
| 4 | embedding `Centaur { Creature }` | centaur.go -> creature.go | found x2 (`Centaur -> Creature` field + `NewCentaur -> NewCreatureOfType`) | ok |
| 4 | interface satisfaction `var _ Fightable = (*Creature)(nil)` | creature.go -> fightable.go, leaf `Creature -> Fightable` | none; fightable.go's only incoming edge is aliases.go | **missing** (`var` declarations are not scanned) |
| 4 | `var _ service.Creatures = (*PersistedCreatures)(nil)` | persisted_creatures.go -> creatures.go | none | **missing** |
| 5 | generic `Repository[T Keyed]` embedded, `NewRepository[CreatureEntity]()` | creature_repository.go -> repository.go, creature_entity.go | found x2 / x4; `Repository -> Keyed` found; type parameter `T` produces no leaf or edge | ok |
| 6 | type position only: `service.CreatureService` field, `model.ArmorClass` parameter | facade -> creature_service.go, armor_class.go | found (`CreatureFacade -> CreatureService`, `-> ArmorClass`) | ok |
| 6 | instantiate only: `dto.Creature{…}` composite literal | facade -> dto/creature.go | found | ok |
| 6 | static member: package const `application.StandardCreatureType` | creature.go -> creature_facade.go | none: selector expressions that are not calls are never captured, and constants are not leaves | **missing** |
| 6 | annotation | Go has none (struct tags `db:"id"` are strings) | no edge, no leaf | ok (n/a) |
| 7 | same simple name: `model.Creature` and `dto.Creature` both in CreatureFacade | leaf edges `CreatureFacade -> domain.model.Creature` and `-> application.dto.Creature` | only `-> application.dto.Creature`; with the import order swapped (scratch copy) only `-> domain.model.Creature` remains and the dto edge is lost | **wrong**: the package qualifier is ignored, the first import that contains a `Creature` wins |
| 8 | fully qualified reference without import | Go has none | – | n/a |
| 9 | unused import `_ "…/domain/service"` (creature_util.go) | no edge | no edge (blank import), no `unknown` leaf | ok |
| 10 | `uuid`, `log/slog`, `fmt`, `math/rand` | no internal edges | none, no leaves | ok |
| 11 | test file `creature_service_test.go` (package `service_test`) | skipped by default; with `--include-tests` 7 file edges | exactly as expected; the test's leaf lands in namespace `domain.service` (directory, not the `_test` package name); test -> adapter/persistence is flagged `isPointingUpwards` | ok |
| 12 | `dice.go` with `Dice`, `DiceRoll`, `rollD20`; `errors.go` with `NoSuchCreatureException` | three leaves in one file, leaf named after the declaration | `Dice` CLASS, `DiceRoll` CLASS, `rollD20` FUNCTION, `NoSuchCreatureException` CLASS in errors.go | ok |

- Further missing edges of the same kind: centaur.go -> creature_type.go (`Monstrosity`) and centaur.go -> speed_type.go
  (`Walking`) are absent because enum-like constants are neither leaves nor captured as usages. `MAX_HIT_POINTS`,
  `StandardCreatureType`, `stableName`, `StandardArmorClassDescription` and all `iota` members do not exist in the lens.
- False positives: none. Every one of the 36 file edges corresponds to a real usage; no edge to stdlib or `uuid`.
- Cycles: expected 1 cross-package cycle (4 files), reported 0 cyclic file edges (only the same-file `Dice <-> DiceRoll`
  leaf cycle). Upward edges: expected 2, reported 0 (test run: 2 test -> adapter edges flagged, which is correct).
- Weights (`dependencies` attribute) = number of distinct resolved leaf edges between the two files, e.g.
  `creature.go -> creature_id.go x3` (`Creature`, `NewCreature`, `NewCreatureOfType`). Consistent.
- Metrics: `incoming_dependencies` / `outgoing_dependencies` match the edge list (e.g. creature_id.go 11 incoming,
  creature_util.go 0/0, persisted_creatures.go 7 outgoing). Because the upward edges are missing, creature_facade.go and
  persisted_creatures.go have 0 incoming and the layering looks clean (folder levels domain 0, adapter 1, application 1).
- Leaf levels are computed inside the package: `application.CreatureFacade` is level 1 although it depends on
  `domain.service.CreatureService` (level 1) and `application.unknown` is level 0 while depending on `Fightable` (level 1).
  Cross-package edges only influence the folder levels.
- Leaf kinds: struct -> CLASS (ok), interface -> INTERFACE (ok), function/method receiver -> FUNCTION (ok, methods are
  folded into their receiver type, which is right for Go). `type CreatureType int` / `type SpeedType int` -> CLASS
  (wrong; there is no ENUM or TYPE kind for Go's named types). `type Fightable = model.Fightable` -> leaf `unknown`, kind
  CLASS (wrong; `GoTypeQuery.extractName` only reads `type_spec`, a `type_alias` node has no name for it). Constants and
  variables have no leaf kind at all (`GoDeclarationsQuery` only queries type, function and method declarations, so
  `GoVariableQuery` is dead code in practice).
- Native vs resolved: Go's import path is the directory path under the module, so CodeCharta only has to map the import
  string onto the directory tree. It does this with a suffix match of the import path against the package directory
  (`de.sots/cellarsandcentaurs/domain/model` ~ `domain/model`), which works for every multi-segment package. `go.mod` is
  not read; a single-segment package (`application`) is excluded from the suffix match on purpose, so
  `application.NewCreatureFacade(...)` from another package would not resolve either (only `application.CreatureFacade`
  as a qualified type does, via the `withDots == fullName` fallback). Package aliases and dot imports are Go's own
  mechanisms; the parser ignores the alias name (harmless) and mishandles the dot import (see above).

## Domain language parser
- `ccsh domainlanguageparser -nc <dir> -e "output,FINDINGS.md" -o output/domain.cc.json`: ran without error, 30 nodes
  (root, 7 folders, 22 files incl. the test), 90 words at the root. Variants run: `--comment-weight 1`,
  `--string-weight 10`, `--stop-word-level MINIMAL` / `AGGRESSIVE`, `--no-technical-stopwords`, `--exclude-tests`.
  `--comment-weight 0`, `--string-weight 0` and `--identifier-weight 0` are refused with
  `IllegalArgumentException: --comment-weight must be positive, got 0` (full stack trace on stderr, exit code 1), so a
  "switch a source off" run as suggested in the README is not possible; weights 1 vs 10 were used instead.
- Expected words at the root, all 17 present: creature(117), speed(38), hit(32), points(32), armor(31), damage(20),
  roll(15), centaur(13), stable(12), dice(9), initiative(5), treasure(5), hoard(5), dungeon(3), cellar(2), lair(2),
  encounter(2).
- Keyword leakage: none of the Go keywords or built-in types appears (`func`, `string`, `int`, `map`, `struct`, `error`,
  `type`, `range`, `nil` are all absent). `class`(29) is present, which is right for Go: it is not a keyword, it comes
  from `ArmorClass`.
- Technical-word leakage at MODERATE: `repository`(18), `entity`(15), `facade`(6), `logger`(3), `request`(3), `value`(12),
  `key`(9), `id`(51), `json`(9). `repository`, `entity`, `facade`, `logger` are only on the AGGRESSIVE list, so at
  MODERATE this is by design; `json`(9) leaks from the struct tags `json:"…"` (raw strings inside the type), which is
  technical noise specific to Go and should be filtered. Filtered correctly: `util` (the file name is not counted),
  `exception` (`NoSuchCreatureException` -> only `such`, `creature`), `test`, `service`, `save`, `find`, `set`, `create`.
  Stop-word levels in one line: MINIMAL adds `save(18) find(15) service(15) set(12) base(6) exception(6) create(3)`;
  AGGRESSIVE removes `repository entity value facade init logger request result types` from the MODERATE list.
- Identifier splitting:

| form | identifier | words found |
| --- | --- | --- |
| camelCase | `walkingSpeed` | walking, speed (creature_facade.go walking 3 / speed 3) |
| snake_case | `walking_speed` | walking, speed (test file walking 3 / speed 3) |
| SCREAMING_SNAKE | `MAX_HIT_POINTS` | max, hit, points (hit_points.go max 9) |
| PascalCase | `ArmorClass` | armor, class |
| Acronym | `XPValue` | xp, value (centaur.go xp 3 / value 3) |
| Digit | `d20Roll` / `rollD20` | `rollD20` -> roll, d20; `d20Roll` -> 20, roll (the `d` is dropped, the digits become the word `20`). Verified on isolated files; inconsistent |
| Kebab in string | `"centaur-stable"` | centaur(1), stable(1) in creature_facade.go |

- Comments and strings: all planted sentences are counted. Default weights are identifier 3, comment 2, string 1:
  `cellar`(2), `lair`(2), `roams`(2) come from the doc comments, `dungeon` = 2 (line comment) + 1 (string in errors.go),
  `stable` in the facade = 3 (`stableName`) + 1 (string). `--comment-weight 1` halves every comment word
  (cellar 2 -> 1, initiative 5 -> 4), `--string-weight 10` multiplies string words (json 9 -> 90, natural 2 -> 20,
  stable 12 -> 39). Go doc comments (`//` before the declaration) and `/* */` block comments are both picked up.
- Test file: included by default (`creature_service_test.go` is a node with creature 11, stable 4, walking 3, speed 3,
  found 3, got 1, saved 1); the test name `Test_should_save_creature_to_the_stable` yields only `creature` and `stable`
  (`test`, `save` are stop words, `should`, `to`, `the` English stop words). `--exclude-tests` removes the node and
  lowers creature 117 -> 106, stable 12 -> 8, walking 13 -> 10.

## Round 2: additional dependency forms

- Added (all new files, nothing of round 1 touched): `internal/stable/ledger.go` + `application/stable_registry.go`,
  `application/lair_unix.go` (`//go:build unix`), `application/lair_manifest.go` + `lair_manifest.txt` (`//go:embed`),
  `libs/dicebag/{go.mod,bag.go}` + `domain/model/dice_bag.go` with `require de.sots/dicebag v0.0.0` and
  `replace de.sots/dicebag => ./libs/dicebag` in `go.mod`, `adapter/persistence/centaur_repository.go`
  (`Repository[model.Centaur]`), `application/creature_kind.go` (`case *model.Centaur:`), `domain/service/initiative.go`
  (`reroll := dice.Roll`). Now 31 `.go` files (30 without the test), `gofmt -l` clean, `go vet` fails only on the
  round-1 cycle and the offline `uuid` download. Every form is the only reference from its file to its target file;
  where a file would otherwise have no edge at all, a second "control" reference to a different file was added so that
  "file not parsed" and "form not found" can be told apart.
- All three commands ran without error: 30 / 31 leaves, 43 / 50 file edges (36 / 43 in round 1), 54 / 55 declaration
  leaves, 92 / 100 leaf edges, still "1 cycle" (`Dice <-> DiceRoll` inside dice.go).

| form | file(s) | expected edge | found | note |
| --- | --- | --- | --- | --- |
| `internal/` package imported from `application` | application/stable_registry.go, internal/stable/ledger.go | stable_registry.go -> ledger.go | yes (x2: `RegisterStable -> Ledger`, `-> NewLedger`) | `internal` is an ordinary path segment for the suffix match; leaves live in namespace `internal.stable`; no special treatment of Go's visibility rule is needed |
| `//go:build unix` file importing a domain package | application/lair_unix.go | lair_unix.go -> domain/model/hit_points.go | yes (x1: `RestInLair -> HitPoints`) | a build-constrained file is parsed like any other; build tags are not modelled, which is right for a static view |
| `//go:embed lair_manifest.txt` | application/lair_manifest.go, application/lair_manifest.txt | lair_manifest.go -> lair_manifest.txt | no | the `.txt` is not a node of either lens and lair_manifest.go has 0 outgoing (leaf `LairManifest` exists, the blank `embed` import yields nothing); the directive is treated as a comment. Defensible: a resource is not a source file, but the embed relation is lost |
| `replace` directive to a local module | go.mod, libs/dicebag/go.mod, libs/dicebag/bag.go, domain/model/dice_bag.go | dice_bag.go -> libs/dicebag/bag.go | no | `go.mod` is not read, `de.sots/dicebag` does not suffix-match the directory `libs/dicebag`, so the import is dropped silently (0 outgoing, no `unknown` leaf, nothing in `--verbose`); bag.go itself is parsed (leaves `libs.dicebag.Bag`, `Fill`) but stays disconnected |
| type used only as generic argument | adapter/persistence/centaur_repository.go | centaur_repository.go -> domain/model/centaur.go | yes (x2: `CentaurRepository -> Centaur`, `NewCentaurRepository -> Centaur`) | both the embedded `Repository[model.Centaur]` and the instantiation `NewRepository[model.Centaur]()` are captured; control edge to repository.go x2 present |
| type used only in a type switch | application/creature_kind.go | creature_kind.go -> domain/model/centaur.go | yes (x1: `KindOf -> Centaur`) | `case *model.Centaur:` counts as a qualified type usage; control edge to fightable.go x1 present |
| method value `dice.Roll` as only reference | domain/service/initiative.go | initiative.go -> domain/model/dice.go | no | `reroll := dice.Roll` (selector on a local variable, not called) leaves no trace; only the control edge `RerollInitiative -> Creature` exists. Consistent with round 1: non-call selectors are not captured, and the receiver is a variable whose type would need inference |

- Round-1 edges: all 36 default and all 43 `--include-tests` file edges of round 1 are present with unchanged weights;
  the round-1 leaf edges are a subset of the new set. The 7 new file edges are exactly the four found forms plus the
  three control edges (centaur_repository.go -> repository.go, creature_kind.go -> fightable.go, initiative.go ->
  creature.go). No cycle or upward flag appeared or disappeared (default run still 0 cyclic / 0 upward, test run still
  the two test -> adapter upward flags). Incoming counts moved accordingly: centaur.go 0 -> 3, repository.go 2 -> 4,
  hit_points.go 3 -> 4, fightable.go 1 -> 2, creature.go 9 -> 10. The new folders `internal`, `internal/stable`,
  `libs`, `libs/dicebag` sit at level 0.
- New false positives: none. Every new file edge corresponds to a real usage; no edge from lair_manifest.go, none to
  stdlib, none between the two modules.
- Side effect on the domain parser: the compiler directives are counted as comment words, `build`(2), `unix`(2),
  `embed`(2), `txt`(2) appear in the `application` folder. Technical noise that a Go-aware comment filter should drop.

## Verdict
- Good: import-path resolution by directory suffix works for every multi-segment package, including the aliased
  import; embedding, generics, type-position, composite-literal and constructor-function usages all produce the right
  edges; no false positives, no stdlib/third-party edges; methods are folded into their receiver type; the test file is
  skipped by default and correctly attached with `--include-tests`; the domain parser finds all 17 words, no Go keyword
  leaks, and every identifier form except the digit form splits correctly. Round 2 adds: an `internal/` package,
  a `//go:build`-constrained file, a type used only as a generic argument and a type used only in a type-switch
  case all produce the right edge, and none of the 36 round-1 edges changed.
- Wrong:
  1. `application/creature_facade.go`: `model.Creature` and `dto.Creature` collapse onto whichever package is imported
     first (`resolveComplexModuleImport` ignores the qualifier). Leaf edge `CreatureFacade -> domain.model.Creature` is
     missing in the default order; swapping the two imports loses the dto edge instead.
  2. `application/aliases.go`: `type Fightable = model.Fightable` becomes a leaf named `unknown` of kind CLASS.
  3. `domain/model/creature_type.go`, `speed_type.go`: named int types are kind CLASS, there is no ENUM/TYPE kind.
  4. Domain parser: `d20Roll` splits into `20` + `roll` while `rollD20` keeps `d20`; `json` from struct tags leaks;
     `//go:build` / `//go:embed` directives are counted as comments (`build`, `unix`, `embed`, `txt`); weight 0 is
     rejected with a stack trace instead of a message.
- Missing:
  1. Dot import (`creature_util.go`): every unqualified use of `Creature` / `Centaur` is unresolved, the file has no
     outgoing edge (the dot-import path `de.sots/cellarsandcentaurs/domain/model` is compared against the package
     `domain/model` without the suffix match used for normal imports).
  2. Package-level constants/variables: not leaves and not captured as usages, so `application.StandardCreatureType`
     (creature.go, persisted_creatures.go), `Monstrosity` and `Walking` (centaur.go) produce no edges. With it, the
     planted upward dependency and the whole `creature -> facade -> service -> creature` cycle disappear from the lens.
  3. `var _ Fightable = (*Creature)(nil)` / `var _ service.Creatures = (*PersistedCreatures)(nil)`: the idiomatic Go way
     of stating "implements" is not scanned, so neither implementation edge exists.
  4. `replace de.sots/dicebag => ./libs/dicebag` (go.mod): the local module is parsed but `domain/model/dice_bag.go ->
     libs/dicebag/bag.go` is missing because `go.mod` is never read and the import path does not suffix-match the
     directory; the unresolved import is dropped without a trace.
  5. Method value `reroll := dice.Roll` (`domain/service/initiative.go`): no edge to dice.go; needs the type of a local
     variable, out of reach for a static parser.
  6. `//go:embed lair_manifest.txt` (`application/lair_manifest.go`): no edge and no node for the resource; acceptable
     for a source-only view, but the relation is invisible.
