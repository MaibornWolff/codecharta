# TypeScript

## Expected file-level edges (written before running the parser)

Paths relative to `src/de/sots/cellarsandcentaurs/`. `application/index.ts` is the barrel; a `->` to it is what
the source literally says, whether the parser resolves it through to the re-exported file is judged below.

| from | to |
| --- | --- |
| domain/model/Creature.ts | CreatureId.ts, CreatureType.ts (default import), ArmorClass.ts, SpeedType.ts, Speed.ts, HitPoints.ts, Fightable.ts (implements), application/index.ts (upward, static member) |
| domain/model/ArmorClass.ts | application/index.ts (upward, static member) |
| domain/model/NoSuchCreatureException.ts | CreatureId.ts |
| domain/model/Centaur.ts | Creature.ts (extends), CreatureId.ts, CreatureType.ts, SpeedType.ts |
| domain/model/Dice.ts | none (DiceRoll used by Dice inside the same file) |
| domain/service/Creatures.ts | model/Creature.ts, model/CreatureId.ts |
| domain/service/CreatureService.ts | Creatures.ts, model/Creature.ts (winston is external, no edge) |
| domain/service/CreatureService.test.ts | CreatureService.ts, Creatures.ts, model/Creature.ts, CreatureId.ts, Speed.ts, SpeedType.ts (only with --include-tests; vitest external) |
| adapter/persistence/CreatureEntity.ts | decorators.ts (decorator call), CreatureTable.ts (only as decorator argument) |
| adapter/persistence/CreatureRepository.ts | CreatureEntity.ts (aliased import), Repository.ts (generic base) |
| adapter/persistence/creatureEntityMapper.ts | CreatureEntity.ts (`import type`), model/Creature.ts, model/CreatureId.ts |
| adapter/persistence/PersistedCreatures.ts | CreatureRepository.ts, CreatureEntity.ts, creatureEntityMapper.ts, service/Creatures.ts (implements), model/Creature.ts, model/CreatureId.ts, model/NoSuchCreatureException.ts, application/index.ts |
| application/CreatureFacade.ts | service/CreatureService.ts, service/Creatures.ts, model/Creature.ts, dto/Creature.ts, model/CreatureId.ts, model/CreatureType.ts, model/HitPoints.ts, model/Speed.ts, model/SpeedType.ts, model/ArmorClass.ts (node:crypto external) |
| application/CreatureUtil.ts | model/Creature.ts (`import * as model`), model/Fightable.ts (unused import; an edge is defensible because the import statement exists) |
| application/index.ts | CreatureFacade.ts (named re-export), CreatureUtil.ts (`export *`), ui/CreatureCard.tsx (`export { default as }`) |
| application/ui/CreatureCard.tsx | model/Creature.ts (`import type`, relative), model/SpeedType.ts (`@model/*` alias) |

Round 2 additions (each row is the only way the `from` file depends on the `to` file):

| from | to | form |
| --- | --- | --- |
| domain/model/Stable.ts | registerCreatureTypes.ts | side-effect import `import "./registerCreatureTypes"` |
| domain/model/registerCreatureTypes.ts | typings/creatureGlobals.d.ts | triple-slash `/// <reference path="../../typings/creatureGlobals.d.ts" />` |
| typings/winstonAugmentation.d.ts | none | `declare module "winston" { interface Logger {...} }` augmentation; winston is external |
| domain/model/Movement.ts | Speed.ts | explicit extension `import { Speed } from "./Speed.js"` pointing at Speed.ts |
| domain/service/SpeedLimit.ts | model/Speed.ts | inline type `import("../model/Speed").Speed` in a field type and a parameter type |
| application/CreatureLoader.ts | CreatureUtil.ts | CommonJS interop `import util = require("./CreatureUtil")`, used as `util.CreatureUtil` |
| application/CreatureLoader.ts | model/Stable.ts | `import { Stable }` used as `Stable.Groom` (TS namespace member) |
| application/CreatureLoader.ts | model/Centaur.ts | dynamic `await import("../domain/model/Centaur")` inside a method |
| application/CreatureLoader.ts | model/CreatureId.ts | plain named import (control, not a new form) |
| application/index.ts | model/Dice.ts | `export * as dice from "../domain/model/Dice"` |
| application/index.ts | model/Fightable.ts | `export type { Fightable } from "../domain/model/Fightable"` |
| application/index.ts | model/HitPoints.ts | inline modifier `export { type HitPoints } from "../domain/model/HitPoints"` |

None of the round-2 targets has an outgoing edge that leads back into the barrel SCC, so the expected cycles and
upward edges below are unchanged; `CreatureLoader -> Centaur -> Creature -> index` is not a cycle because nothing
points at `CreatureLoader`. `typings/` is a new top-level folder next to `domain`, `application`, `adapter`.

Expected cycles: `Creature -> index -> CreatureFacade -> CreatureService -> Creature`,
`Creature -> ArmorClass -> index -> CreatureFacade -> Creature`, `index -> CreatureUtil -> Creature -> index`,
`index -> CreatureCard -> Creature -> index`.
Expected upward edges: `domain/model/Creature.ts -> application/index.ts`, `domain/model/ArmorClass.ts -> application/index.ts`.
Whether `adapter/persistence/PersistedCreatures.ts -> application/index.ts` counts as upward depends on the level
the parser assigns to `adapter` versus `application`; in a hexagonal reading the adapter is the outer ring.

## Project

- Layout: `tsconfig.json` (with `baseUrl` and a `paths` alias `@model/*`), `package.json` (react, winston, vitest),
  `src/de/sots/cellarsandcentaurs/{domain/model, domain/service, adapter/persistence, application, application/dto,
  application/ui}`. 26 source files: 25 `.ts` plus `application/ui/CreatureCard.tsx`.
- Round 2 added `typings/` and seven files (33 in total): `domain/model/registerCreatureTypes.ts`, `domain/model/Stable.ts`,
  `domain/model/Movement.ts`, `domain/service/SpeedLimit.ts`, `application/CreatureLoader.ts`,
  `typings/creatureGlobals.d.ts`, `typings/winstonAugmentation.d.ts`, plus three lines in `application/index.ts`.
- Modelled on `Ideas/DC/DependaCharta/exampleProjects/TypescriptExample` (same barrel, same static-member usage of
  `CreatureFacade.STANDARD_CREATURE_TYPE` from `Creature` and `PersistedCreatures`, same cycle).
- Stress constructs present: aliased import (`CreatureEntity as Entity`, `Creature as CreatureDto`), namespace import
  (`import * as model`), barrel with three re-export forms (`export { X } from`, `export * from`,
  `export { default as X } from`), a default export (`export default CreatureType`, `export default function CreatureCard`),
  inheritance + `implements`, abstract generic base `Repository<T>`, `import type`, a class only referenced as a
  decorator argument (`@Persistent(CreatureTable)`), two `Creature` classes in different packages, unused import
  (`Fightable` in `CreatureUtil`), third-party imports (`winston`, `node:crypto`, `react`, `vitest`), a `.test.ts`
  file, `Dice.ts` with three declarations, `decorators.ts` and `creatureEntityMapper.ts` whose names differ from
  what they declare, a `tsconfig.json` path alias (`@model/SpeedType` in the `.tsx`).
- Not in the language: a fully qualified reference without an import (construct 8). TypeScript has no global
  namespace across files; every cross-file reference goes through an `import`, so there is nothing to test.

## Dependency parser

Commands (all exit 0, no warnings apart from the JDK native-access notice and "No .gitignore found"):

```
ccsh dependencyparser -nc $LANG_DIR -e "output,FINDINGS.md" -o output/dependency.cc.json                  # 25 files
ccsh dependencyparser -nc $LANG_DIR -e "output,FINDINGS.md" --include-tests -o output/dependency-with-tests.cc.json  # 26 files
```

Result: 47 file edges, 32 leaves, 52 leaf edges (default run); 53 / 33 / 58 with tests. Expected 49 file edges
(50 counting the unused import).

| construct | expected edge(s) | found | verdict |
| --- | --- | --- | --- |
| 1 aliased import `CreatureEntity as Entity` (CreatureRepository) | CreatureRepository -> CreatureEntity | yes | ok |
| 2 namespace import `import * as model` (CreatureUtil, `model.Creature`) | CreatureUtil -> model/Creature | yes | ok |
| 3 barrel `export { CreatureFacade } from` (index.ts) | index -> CreatureFacade | yes, leaf `index.CreatureFacade` kind REEXPORT | ok |
| 3 barrel `export * from './CreatureUtil'` | index -> CreatureUtil | yes, expanded to a named REEXPORT leaf `index.CreatureUtil` | ok |
| 3 barrel `export { default as CreatureCard } from './ui/CreatureCard'` | index -> ui/CreatureCard.tsx | **no**; leaf `index.CreatureCard` (REEXPORT) exists but has no outgoing edge, `CreatureCard.tsx` has 0 incoming | **missing** |
| 3 upward import of the barrel (`Creature`, `ArmorClass` -> `../../application`) | Creature -> index, ArmorClass -> index | yes, both flagged `isPointingUpwards` and `isCyclic` | ok |
| 3 import from barrel in `PersistedCreatures` | PersistedCreatures -> index | yes (not upward: `adapter` is levelled above `application`) | ok |
| 4 `Centaur extends Creature` | Centaur -> Creature | yes (usage only, no "extends" marker) | ok |
| 4 `Creature implements Fightable`, `PersistedCreatures implements Creatures` | Creature -> Fightable, PersistedCreatures -> Creatures | yes | ok |
| 5 generic base `Repository<Entity>` | CreatureRepository -> Repository | yes | ok |
| 6 type position only (`import type { Creature }` in CreatureCard.tsx, `import type { CreatureEntity }` in the mapper) | CreatureCard -> Creature, mapper -> CreatureEntity | yes, indistinguishable from a value import | ok |
| 6 `new` only (`new CreatureId(...)` in mapper, Facade) | mapper -> CreatureId, Facade -> CreatureId | yes | ok |
| 6 static member only (`CreatureFacade.STANDARD_CREATURE_TYPE`) | Creature -> index, PersistedCreatures -> index | yes | ok |
| 6 decorator argument only (`@Persistent(CreatureTable)`) | CreatureEntity -> CreatureTable, CreatureEntity -> decorators | yes, both | ok |
| 7 same simple name: `import { Creature } from '../domain/model/Creature'` and `import { Creature as CreatureDto } from './dto/Creature'` in CreatureFacade | Facade -> model/Creature, Facade -> dto/Creature | model edge yes, **dto edge missing**; `dto/Creature.ts` has 0 incoming | **missing** |
| 8 fully qualified reference | n/a | n/a | language has no such construct |
| 9 unused import `Fightable` in CreatureUtil | defensible either way | no edge | ok (usage-based) |
| 10 `winston`, `node:crypto`, `react`, `vitest`, `Map`, `Promise`, `Error` | no internal edge | none | ok |
| 11 test file `CreatureService.test.ts` | skipped by default; 6 edges with `--include-tests` | 25 vs 26 files; the 6 expected edges appear only with `--include-tests`, `vitest` gives no edge | ok |
| 12 `Dice.ts` with `Dice`, `DiceRoll`, `rollD20` | three leaves, two intra-file leaf edges, no file edge | yes: `Dice.Dice`, `Dice.DiceRoll`, `Dice.rollD20` (FUNCTION), edges Dice -> DiceRoll, rollD20 -> Dice | ok |
| 12 `decorators.ts` holds `Persistent`, `creatureEntityMapper.ts` holds `toDomain` | leaves named after the file, edges to them | `decorators.Persistent`, `creatureEntityMapper.toDomain`, PersistedCreatures -> toDomain | ok |
| tsconfig `paths` alias `@model/SpeedType` in CreatureCard.tsx | CreatureCard.tsx -> SpeedType | yes | ok |
| `.tsx` file | analysed as TSX | yes, leaves `CreatureCard` (FUNCTION) and `CreatureCardProps` | ok |
| default import `import CreatureType from './CreatureType'` in Creature | Creature -> CreatureType | yes, resolved to the named enum leaf | ok |

Isolated reproductions (scratch, not in this folder):

- Same-name collision: `Facade.ts` importing `{ Creature }` from `domain/Creature` and `{ Creature as CreatureDto }`
  from `dto/Creature` yields only `Facade -> domain/Creature`. Renaming the dto class to `CreatureDto` (same alias)
  yields both edges. So the second import whose *original* name equals an earlier import's original name is lost; the
  alias does not rescue it. This is the most important dependency-parser defect: DTO/domain pairs with the same name
  are common in TypeScript.
- `export { default as X } from './file'`: for all three default forms (`export default function Card`,
  `export default class {}`, `export default Named` after a named class) the barrel gets a REEXPORT leaf `index.X` with
  no outgoing edge, so the barrel never points at the file. A direct `import Card from './ui/Card'` does resolve.
- `--verbose` on the dependency parser prints 22 timing lines and nothing about unresolved imports, so neither of the
  two losses above is visible in the log.

False positives: none. Every reported edge corresponds to an import in the source; no external module produced an edge.

Cycles: 1 strongly connected component, 6 cycles reported. The SCC is {CreatureFacade, Creature, ArmorClass,
CreatureService, Creatures, CreatureUtil, index}, which matches the three expected cycles through the barrel. The
fourth expected cycle (`index -> CreatureCard -> Creature -> index`) is absent because the `index -> CreatureCard.tsx`
edge is missing. Edges into the barrel are modelled as a hop: `Creature.Creature -> index.CreatureFacade` (REEXPORT
leaf) `-> CreatureFacade.CreatureFacade`; the parser does not collapse the barrel to the real file.

Upward edges: exactly the two expected (`Creature -> index`, `ArmorClass -> index`). Folder levels: `domain` 0,
`application` 1, `adapter` 2, so `PersistedCreatures -> application/index` is downward, which is the hexagonal reading.

Leaf kinds:

- right: CLASS for classes (abstract `Repository` included), INTERFACE for `Fightable` and `Creatures`, ENUM for
  `CreatureType` and `SpeedType`, FUNCTION for `rollD20`, `toDomain`, `Persistent`, `CreatureCard`,
  `should_save_creature_to_the_stable`, REEXPORT for the three barrel entries.
- wrong: `type TableConstructor = ...` and `type CreatureCardProps = {...}` are reported as CLASS; `NodeType` has no
  kind for a type alias. `export default CreatureType` adds a synthetic second leaf
  `CreatureType.src_de_sots_cellarsandcentaurs_domain_model_CreatureType_DEFAULT_EXPORT` (kind ENUM, level 1) whose
  only edge points at the named enum and which nothing imports (the default import in `Creature.ts` resolves to the
  named leaf), so it is noise. In the scratch run an anonymous `export default class {}` came out as kind REEXPORT.
- The test file's leaf is prefixed `CreatureService_test.` (dot in the file name escaped to underscore).

Metrics: `incoming_dependencies` / `outgoing_dependencies` count distinct files and agree with the edge list
(`Creature.ts` 8/8, `CreatureId.ts` 0/7, `index.ts` 2/3). They inherit the two missing edges: `dto/Creature.ts` 0
incoming, `CreatureCard.tsx` 0 incoming, `CreatureFacade.ts` 9 outgoing instead of 10.

Native vs. resolved: TypeScript has an explicit module system, so every edge is an `import`/`export ... from` with a
relative or aliased path. CodeCharta resolves the relative paths, appends `index` for directory imports, reads
`tsconfig.json` (`baseUrl` + `paths`) for the `@model/*` alias, expands `export *` by parsing the target file, and
maps names through aliases. What it does not do: follow a barrel through to the file behind it, resolve
`export { default as }`, or keep two imports with the same original name apart.

## Domain language parser

Commands (exit 0 unless noted):

```
ccsh domainlanguageparser -nc $LANG_DIR -e "output,FINDINGS.md" -o output/domain.cc.json                       # 26 files, 39 nodes
ccsh domainlanguageparser ... --stop-word-level MINIMAL   -o output/domain-minimal.cc.json
ccsh domainlanguageparser ... --stop-word-level AGGRESSIVE -o output/domain-aggressive.cc.json
ccsh domainlanguageparser ... --exclude-tests            -o output/domain-no-tests.cc.json                    # 25 files, 38 nodes
ccsh domainlanguageparser ... --string-weight 0           # exit 1: "--string-weight must be positive, got 0"
ccsh domainlanguageparser ... --comment-weight 0          # exit 1: "--comment-weight must be positive, got 0"
```

Weights are identifier 3, comment 2, string 1 (`ExtractionWeights` defaults); the `frequency` in the output is the
weighted sum, not an occurrence count. A weight of 0 is rejected, so a source cannot be switched off; the README's
suggestion of `--comment-weight 0` does not work and the crash is a stack trace rather than a usage message.

Expected words at the root node (94 words in total): all 17 present.

| word | frequency | word | frequency | word | frequency |
| --- | --- | --- | --- | --- | --- |
| creature | 91 | speed | 45 | hit | 28 |
| points | 28 | armor | 23 | roll | 12 |
| damage | 8 | stable | 7 | dice | 6 |
| hoard | 5 | centaur | 4 | cellar | 2 |
| dungeon | 2 | lair | 2 | initiative | 2 |
| encounter | 2 | treasure | 2 | | |

`cellar`, `dungeon`, `lair`, `initiative`, `encounter`, `treasure` come only from comments (frequency 2 = one
comment hit each); `stable` 7 = `STABLE_NAME` (3) + `should_save_creature_to_the_stable` (3) + the test description
string (1). Package name `cellarsandcentaurs` is not split (it is a folder, not an identifier).

Keyword and technical leakage:

- Language keywords: none. `class`, `type`, `interface`, `enum`, `constructor`, `readonly`, `static`, `private`,
  `string`, `number`, `void`, `async`, `await`, `default`, `export`, `import` all absent; `ArmorClass` yields only
  `armor`, `CreatureType` only `creature`. Right.
- Technical words at MODERATE: `entity` (12), `repository` (6), `facade` (3), `dto` (3), `logger` (3), `persisted`,
  `persistent` leak. `util`, `exception`, `service`, `test`, `save`, `find`, `create`, `base`, `name`, `props` are
  filtered. Leaking `entity`/`repository`/`facade` at MODERATE is by design (they are only in the AGGRESSIVE list);
  whether it is right is debatable, since `CreatureRepository` and `CreatureFacade` carry no domain meaning beyond
  `creature`. `dto` and `logger` are not in any list.
- Other noise at the root: `id` (42, second most frequent, from every `id` field and parameter), `value` (12),
  `table` (12), `target` (9), `all` (8), `20` (3), `one`, `other`, `such`, `every`, `before`, `starts` (English
  words that are not in the stop list). `saved` (3) and `saves` (1) survive although `save` is filtered: no stemming.
- React was detected from `package.json` (framework keywords apply): `props` from `CreatureCardProps` is filtered,
  JSX tag and attribute names (`article`, `className`, `h2`) and JSX text (`Hit points:`) are not extracted at all.
- `--stop-word-level MINIMAL` adds `find` 15, `save` 12, `service` 10, `base` 6, `create` 6, `exception` 3 (100 words);
  `AGGRESSIVE` removes `entity`, `value`, `repository`, `dto`, `facade`, `init`, `logger` (87 words); nothing else
  changes.

Identifier splitting:

| form | identifier | words found |
| --- | --- | --- |
| camelCase | `walkingSpeed` | walking, speed |
| snake_case | `walking_speed` (test file) | walking, speed |
| SCREAMING_SNAKE | `MAX_HIT_POINTS` | max, hit, points |
| PascalCase | `ArmorClass` | armor (`class` filtered as keyword) |
| Acronym | `XPValue` | xp, value |
| Digit | `d20Roll` | d20, roll |
| Digit | `rollD20` | roll, 20 (the `D` is dropped as a one-letter word; inconsistent with `d20Roll`) |
| Kebab in string | `"centaur-stable"` (CreatureFacade) | nothing, see below; in a plain function the same literal gives centaur, stable |

Comments and strings:

- All four planted comments are counted with weight 2: `Creature` doc comment (cellar, roams, beasts, dragons, share),
  `HitPoints` doc comment (lair, drop, recover, rests), the line comment in `CreatureFacade.create` (initiative,
  encounter, dungeon, rolls, starts), the block comment in `CreatureUtil` (counts, treasure, hoard, guards). English
  stop words (`a`, `the`, `and`, `in`, `when`, `it`, `its`) are removed; `all`, `every`, `before` are not.
- String literals inside an `export`-prefixed declaration are **not extracted** (identifiers and comments inside it
  are). Verified with one file per shape: `export class C { m() { g("x y") } }` and `export function f() { g("x y") }`
  yield nothing, the same code without `export` (or with `export { C }` after the declaration) yields the words with
  weight 1; call argument, `new` argument, concatenation, template literal, initializer, array, object, `return`,
  `super(...)` all count outside an export. Consequence in this project: `"No such creature in the dungeon: "`
  (`NoSuchCreatureException`, exported class), `"centaur-stable"` and `"Natural Armor"` (static fields of exported
  classes) and the `saving creature` template in `CreatureService` contribute nothing; `dungeon` only survives via
  the Facade comment. Since almost every TypeScript declaration is exported, string weight is effectively unused for
  TypeScript, so `--string-weight` makes no visible difference on real code.
- The test file's strings are counted (`"saves a creature to the stable"` -> saves 1, `"centaur-1"` -> centaur 1)
  because they sit in a non-exported function; this is what made the defect visible.

Test file handling: included by default (26 files, 39 nodes). `--exclude-tests` drops `CreatureService.test.ts`
(38 nodes) and with it `saved`, `saves`, and lowers `creature` 91 -> 80, `stable` 7 -> 3, `centaur` 4 -> 3.
`should`, `describe`, `it`, `expect`, `test` are filtered by the BDD stop list; `should_save_creature_to_the_stable`
contributes creature, stable.

## Round 2: additional dependency forms

Commands as in round 1, rerun after the additions (all exit 0). Default run: 32 files, 55 file edges, 44 leaves,
62 leaf edges; with `--include-tests` 33 files, 61 / 45 / 68. Still 1 SCC and 6 cycles. New warning on both runs:
`4 declaration(s) share a logical path with an earlier one, e.g. '...application.index.CreatureUtil'; keeping the
first of each.` Expected: 12 new edges (11 forms + 1 control import), found 8 of them plus 1 false positive.

| form | file(s) | expected edge | found | note |
| --- | --- | --- | --- | --- |
| side-effect import `import "./registerCreatureTypes"` | domain/model/Stable.ts | Stable -> registerCreatureTypes | **no** | `registerCreatureTypes.ts` has 0 incoming; the import binds no name, and the parser only creates edges for used names |
| dynamic `await import("../domain/model/Centaur")` in a method | application/CreatureLoader.ts | CreatureLoader -> Centaur | yes | resolved to the leaf `Centaur.Centaur`; `Centaur.ts` now has 1 incoming |
| inline type `import("../model/Speed").Speed` in a field and a parameter type | domain/service/SpeedLimit.ts | SpeedLimit -> Speed | **no** | `SpeedLimit.ts` has 0 outgoing; no `import` statement, so the type reference is never resolved |
| `export * as dice from "../domain/model/Dice"` in the barrel | application/index.ts | index -> Dice | yes, but | expanded like a plain `export *`: three REEXPORT leaves `index.Dice`, `index.DiceRoll`, `index.rollD20`; the namespace name `dice` is lost, and the edge counts `x6` (see below) |
| `export type { Fightable } from "../domain/model/Fightable"` | application/index.ts | index -> Fightable | yes | REEXPORT leaf `index.Fightable`, indistinguishable from a value re-export |
| `import util = require("./CreatureUtil")`, used as `util.CreatureUtil.countHoard` | application/CreatureLoader.ts | CreatureLoader -> CreatureUtil | **no** | `CreatureUtil.ts` incoming stays at 2 (index, ArmorClass); the `import x = require()` clause is not read as an import |
| `/// <reference path="../../typings/creatureGlobals.d.ts" />` | domain/model/registerCreatureTypes.ts | registerCreatureTypes -> creatureGlobals.d.ts | **no** | the `.d.ts` is analysed (leaf `typings.creatureGlobals_d.CreatureTypeRegistry`, INTERFACE) but the directive is a comment to the parser; `declare var creatureTypeRegistry` yields no leaf |
| `export namespace Stable { export class Groom }` used as `Stable.Groom` | domain/model/Stable.ts, application/CreatureLoader.ts | CreatureLoader -> Stable | yes | file edge and leaf edge `CreatureLoader -> Stable.Stable` exist, but the namespace leaf has kind UNKNOWN and `Groom` / `CAPACITY` inside it are not leaves |
| `declare module "winston" { interface Logger {...} }` in a `.d.ts` | typings/winstonAugmentation.d.ts | none | **wrong target** | no outgoing edge (right), but the file gets a leaf with logical path `winston.Logger` outside the `src` tree, and `CreatureService.ts -> typings/winstonAugmentation.d.ts` appears as a new edge (see false positives) |
| explicit extension `import { Speed } from "./Speed.js"` | domain/model/Movement.ts | Movement -> Speed | yes | `.js` mapped to `Speed.ts` |
| inline modifier `export { type HitPoints } from "../domain/model/HitPoints"` | application/index.ts | index -> HitPoints | yes | REEXPORT leaf `index.HitPoints` |
| control: `import { CreatureId }` | application/CreatureLoader.ts | CreatureLoader -> CreatureId | yes | |

Isolated reproductions (scratch, not in this folder):

- `export * as dice from "./Dice"` as the only line of a barrel gives one edge `index -> Dice x3` and the same three
  un-namespaced REEXPORT leaves, so the namespace is dropped regardless of context.
- Two plain star exports in one barrel (`export * from "./Dice"; export * from "./Other"`) give `index -> Dice x6`,
  `index -> Other x2` and the warning `4 declaration(s) share a logical path`. Every `export *` is expanded once per
  star export in the file, so with N star exports every re-exported leaf is created N times; the duplicates are
  dropped for the leaf list but not for the file-edge `dependencies` count. Round 1 had a single `export *` and could
  not see this.
- `import { createLogger } from "winston"` next to the augmentation `.d.ts` gives no edge; `import type { Logger }
  from "winston"` gives `Service.ts -> typings/winstonAugmentation.d.ts`. The ambient `declare module "winston"` is
  registered as an internal module named `winston`, and any import of a name it declares is resolved to the `.d.ts`.

Round-1 edges: all 47 are still present with the same `isCyclic` / `isPointingUpwards` flags, and the cycle count is
unchanged (1 SCC, 6 cycles). Two things did change:

- `application/index.ts -> application/CreatureUtil.ts` went from `x1` to `x2` (the star-export duplication above),
  and the `CreatureUtil` REEXPORT leaf is one of the four duplicates named in the warning.
- Folder levels shifted by one (`domain` 0 -> 1, `application` 1 -> 2, `adapter` 2 -> 3) because the new `typings`
  folder sits at level 0 below `domain`; the relative order and both upward flags are as before.

New false positives: one. `domain/service/CreatureService.ts -> typings/winstonAugmentation.d.ts` (leaf edge
`CreatureService.CreatureService -> winston.Logger`). `CreatureService` imports `Logger` from the external package
`winston`; the augmentation file only adds a field to that interface. The edge raises `CreatureService.ts` from 2 to
3 outgoing dependencies and gives the `.d.ts` an incoming dependency. The round-1 statement "no external module
produced an edge" no longer holds once a module augmentation is present in the tree.

Domain parser after round 2 (33 files, 47 nodes, 116 root words, all 17 expected words still present): `creature`
91 -> 114, `speed` 45 -> 51, `stable` 7 -> 13, `centaur` 4 -> 13; new words `groom`, `registry`, `movement`,
`loader`, `capacity`, `fastest`, and from the triple-slash directive (a comment) `reference`, `path`, `typings`,
`globals`. The string `"winston"` in `declare module "winston"` is counted (weight 1, non-exported context) while
`"cellar"` in `new Stable.Groom("cellar")` and the template in `Groom.brush` are not (exported declarations), which
matches the round-1 export finding.

## Verdict

- Good: every round-1 import form except items 1 and 2 under Wrong resolves to the right file: relative paths, `.tsx`, the `tsconfig`
  `paths` alias, aliased imports, `import type`, `import * as`, default imports, `export *` expansion, decorator
  arguments, generic base classes, `implements`; no external module produces an edge; tests are skipped by default and
  fully resolved with `--include-tests`; cycle and upward flags match expectations; metrics agree with the edge list.
  Domain parser: all 17 expected words at the root, no keyword leakage, all four comment forms counted, all identifier
  forms split correctly except the `rollD20` digit case.
  Round 2: dynamic `import()`, `export type { } from`, `export { type X } from`, an explicit `.js` extension and a
  namespace member reference (`Stable.Groom`) all resolve to the right file.
- Wrong:
  1. `application/CreatureFacade.ts`: the second of two imports with the same original name (`import { Creature }
     from '../domain/model/Creature'` and `import { Creature as CreatureDto } from './dto/Creature'`) is dropped, so
     `CreatureFacade -> application/dto/Creature.ts` is missing. Reproduced in isolation; renaming the class fixes it.
  2. `application/index.ts`: `export { default as CreatureCard } from './ui/CreatureCard'` produces a REEXPORT leaf
     with no outgoing edge, so `index.ts -> ui/CreatureCard.tsx` and the cycle through it are missing.
  3. Domain parser: string literals inside `export`ed declarations are never extracted (`NoSuchCreatureException`,
     `CreatureFacade.STABLE_NAME`, `CreatureUtil.STANDARD_ARMOR_CLASS_DESCRIPTION`), which silences string weight for
     practically all TypeScript code.
  4. `--string-weight 0` / `--comment-weight 0` abort with a stack trace instead of disabling that source.
  5. Type aliases (`TableConstructor`, `CreatureCardProps`) are reported as kind CLASS; `export default CreatureType`
     adds an unreferenced synthetic `..._DEFAULT_EXPORT` leaf.
  6. `rollD20` splits to `roll`, `20` while `d20Roll` splits to `d20`, `roll`.
  7. `application/index.ts`: with more than one star export (`export * from './CreatureUtil'` and
     `export * as dice from '../domain/model/Dice'`) every re-exported leaf is expanded once per star export, so the
     file edges count double (`index -> CreatureUtil x2`, `index -> Dice x6`) and the parser warns about duplicate
     declarations. `export * as dice` also loses the namespace name and is flattened into plain re-exports.
  8. `typings/winstonAugmentation.d.ts`: `declare module "winston"` is registered as an internal module, so
     `CreatureService.ts` (which imports `Logger` from the real `winston` package) gets a false edge to the `.d.ts`,
     and the leaf `winston.Logger` lives outside the `src` logical tree.
  9. `domain/model/Stable.ts`: the `namespace Stable` leaf has kind UNKNOWN and its members `Groom`, `CAPACITY` are
     not leaves.
- Missing:
  - The barrel is not collapsed: edges stop at `index.ts`, so `Creature -> CreatureFacade` only exists as a two-hop
    leaf path; the dependency lens has no notion of "this edge is a re-export hop".
  - `--verbose` on the dependency parser reports nothing about imports it could not resolve.
  - No stemming (`saved`/`saves` next to a filtered `save`), no filtering of `id`, `dto`, `logger`.
  - Construct 8 (fully qualified reference without import) does not exist in TypeScript.
  - Round 2, four import forms that never produce an edge: the side-effect import `import "./registerCreatureTypes"`
    (`Stable.ts`), the CommonJS interop `import util = require("./CreatureUtil")` (`CreatureLoader.ts`), the inline
    type `import("../model/Speed").Speed` (`SpeedLimit.ts`) and the triple-slash `/// <reference path=...>`
    (`registerCreatureTypes.ts`). The first is consistent with the usage-based approach (no name to use); the other
    three are real references that the parser does not read.
  - `declare var creatureTypeRegistry` in the `.d.ts` yields no leaf, so a global declared there cannot be a target.
