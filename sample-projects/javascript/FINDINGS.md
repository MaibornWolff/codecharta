# JavaScript

## Project

- Layout: `src/de/sots/cellarsandcentaurs/{domain/model,domain/service,adapter/persistence,application,application/dto}`,
  same tree as the DependaCharta TypeScript example, plus `package.json` with `"type": "module"`.
  24 source files: 22 `.js`, `application/encounter.mjs` (holds `EncounterRunner`, name differs from
  declaration) and `adapter/persistence/creatureEntityMapper.cjs` (CommonJS `require`). Test file is
  `domain/service/CreatureService.test.js` next to the source, the JS convention.
- JavaScript has: ES module import/export with relative paths, `import { X as Y }`, `import * as ns`,
  default import/export, barrel with `export * from` and `export { X } from`, `require`, class
  inheritance, `static` members, free functions, several declarations per file.
- JavaScript does not have: interfaces (`Fightable`, `Creatures` are plain classes with throwing methods,
  `Creature` carries `@implements {Fightable}` in JSDoc), enums (`CreatureType`, `SpeedType` are
  `Object.freeze` objects), generics (`Repository` is `@template T` in JSDoc), type annotations
  (every "type used only in a type position" is a JSDoc `@param`/`@type`/`@typedef {import(...)}`),
  decorators / attributes (stage-3 proposal, not used), namespaces or fully qualified references
  without import.
- Consequence for the project: an import that is used only in JSDoc is, at runtime, an unused import.
  The first draft therefore had no `CreatureFacade -> CreatureService -> Creature` cycle at all; the
  project was adjusted so that the shared cycle, the alias and the barrel static member have real
  runtime uses (`instanceof Creature` in `CreatureService.save`, `CreatureFacade.withCreatures` doing
  `new CreatureService(...)`, `new Entity(id)` in `CreatureRepository.createEmpty`,
  `CreatureFacade.STABLE_NAME` in `encounter.mjs`). JSDoc-only uses were kept in `NoSuchCreatureException`
  (`@param {CreatureId}`), `CreatureFacade` (`@param {Speed}`, `@param {ArmorClass}`),
  `PersistedCreatures` (`@param {CreatureRepository}`), `Creatures` (`@typedef {import(...)}`) and
  `Creature` (`@type {Map<SpeedType, Speed>}`, `@implements {Fightable}`).

## Expected file-level edges (written before running the parser)

Paths relative to `src/de/sots/cellarsandcentaurs/`. `index.js` is the barrel; a `->` to it is what the
source literally says, whether the parser also resolves it through to the re-exported file is judged below.

| from | to |
| --- | --- |
| domain/model/ArmorClass.js | application/index.js (upward) |
| domain/model/NoSuchCreatureException.js | domain/model/CreatureId.js |
| domain/model/Creature.js | CreatureId.js, CreatureType.js, ArmorClass.js, SpeedType.js, Speed.js, HitPoints.js, Fightable.js, application/index.js (upward) |
| domain/model/Centaur.js | Creature.js, CreatureType.js, SpeedType.js |
| domain/service/Creatures.js | model/Creature.js, model/CreatureId.js (only via JSDoc `@typedef {import(...)}`, expected to be missed) |
| domain/service/CreatureService.js | Creatures.js, model/Creature.js (winston is external, no edge) |
| domain/service/CreatureService.test.js | CreatureService.js, Creature.js, CreatureId.js, Speed.js (only with --include-tests) |
| adapter/persistence/CreatureRepository.js | CreatureEntity.js, Repository.js |
| adapter/persistence/PersistedCreatures.js | CreatureRepository.js, CreatureEntity.js, service/Creatures.js, model/Creature.js, model/CreatureId.js, model/NoSuchCreatureException.js, application/index.js |
| adapter/persistence/creatureEntityMapper.cjs | CreatureEntity.js (winston external) |
| application/CreatureFacade.js | service/CreatureService.js, model/Creature.js, dto/Creature.js, CreatureId.js, CreatureType.js, HitPoints.js, Speed.js, SpeedType.js, ArmorClass.js (node:crypto external) |
| application/CreatureUtil.js | model/Creature.js, model/Fightable.js (unused import, an edge is defensible because the import statement exists) |
| application/index.js | CreatureFacade.js, CreatureUtil.js |
| application/encounter.mjs | index.js, model/Dice.js, model/Centaur.js |

Round 2 additions (one form per row, each the only way the `from` file depends on the `to` file;
written before the round-2 run):

| from | to | form |
| --- | --- | --- |
| application/CreatureLoader.js | domain/model/Centaur.js | dynamic `await import("../domain/model/Centaur.js")`, `new Centaur(id)` |
| application/CreatureLoader.js | domain/model/HitPoints.js | `new URL("../domain/model/HitPoints.js", import.meta.url)` passed to `import()`, `HitPoints.init` |
| application/bootstrap.js | application/logging.js | side-effect import `import "./logging.js"` (no binding) |
| application/bootstrap.js | domain/model/Dice.js | extension-less `import { rollD20 } from "../domain/model/Dice"` |
| adapter/persistence/CreatureStable.js | application/index.js | directory import `import { CreatureFacade } from "../../application"` |
| domain/index.js | domain/model/Speed.js | `export * as model from "./model/Speed.js"` |
| domain/index.js | domain/model/CreatureType.js | `export { default } from "./model/CreatureType.js"` |
| adapter/persistence/creatureEntityMapper.cjs | adapter/persistence/Repository.js | computed `require(\`./${REPOSITORY_MODULE}.js\`)`, `new Repository()` |
| adapter/persistence/creatureEntityMapper.cjs | adapter/persistence/mapping/index.js | directory `require("./mapping")`, `xpForCreature(creature)` |

9 additional edges (52 without the test file, 56 with). `logging.js` imports only `winston` (external, no
edge). No new cycle and no new upward edge is expected: `CreatureStable -> index` is adapter -> application
and `domain/index.js` only points into `domain/model`.

43 edges without the test file (47 with). Expected cycles: `Creature -> index -> CreatureFacade -> CreatureService -> Creature`,
`Creature -> ArmorClass -> index -> CreatureFacade -> Creature`, `index -> CreatureUtil -> Creature -> index`.
Expected upward edges: `domain/model/Creature.js -> application/index.js`, `domain/model/ArmorClass.js -> application/index.js`.

## Dependency parser

Commands (all exit 0, stderr in `output/*.stderr.log`; only the usual "No .gitignore" and JDK
native-access warnings):

```
ccsh dependencyparser -nc $LANG_DIR -e "output,FINDINGS.md" -o output/dependency.cc.json                  # 23 leaves, 25 file edges
ccsh dependencyparser -nc $LANG_DIR -e "output,FINDINGS.md" --include-tests -o output/dependency-with-tests.cc.json   # 24 leaves, 29 file edges
```

Found 25 of 43 expected file edges. The 18 missing ones split into three causes: 15 imports whose only
use is in JSDoc (the parser builds an edge only when an imported name is used in code — in JS that is
the correct reading of the language, but it means JSDoc-typed code loses every type-only dependency),
2 lost through the `export *` barrel, 1 lost through the same-name clash. No false-positive file edge.

| # | construct | expected edge(s) | found | verdict |
| --- | --- | --- | --- | --- |
| 1 | Aliased import `import { CreatureEntity as Entity }` in CreatureRepository, used as `new Entity(id)` | CreatureRepository -> CreatureEntity | yes | ok (only after a runtime use was added; with the JSDoc-only use of the first draft: missing) |
| 2 | `import * as model` in CreatureUtil, `model.Creature` | CreatureUtil -> Creature | yes | ok |
| 3a | Barrel `export { CreatureFacade } from` | index -> CreatureFacade; Creature/PersistedCreatures/encounter.mjs -> index | yes, leaf `index.CreatureFacade` kind REEXPORT with a leaf edge to `CreatureFacade.CreatureFacade` | ok |
| 3b | Barrel `export * from "./CreatureUtil.js"` | index -> CreatureUtil; ArmorClass -> index | no: leaf `index.*` REEXPORT has no outgoing leaf edge, `ArmorClass.js` has 0 outgoing | missing (both edges) |
| 4a | `Centaur extends Creature` | Centaur -> Creature | yes | ok |
| 4b | `Creature implements Fightable` (JSDoc `@implements`, import unused at runtime) | Creature -> Fightable | no | missing, but the language has no `implements`; the parser has nothing but a comment to go on |
| 4c | `PersistedCreatures extends Creatures` | PersistedCreatures -> Creatures | yes | ok |
| 5 | `CreatureRepository extends Repository` (`@template T` generics only in JSDoc) | CreatureRepository -> Repository | yes | ok; generics n/a in JS |
| 6a | Type only in JSDoc: `@param {CreatureId}` (NoSuchCreatureException), `@param {Speed}`/`{ArmorClass}` (CreatureFacade), `@param {CreatureRepository}` (PersistedCreatures), `@type {Map<SpeedType, Speed>}` / `@type {ArmorClass}` / `@type {HitPoints}` (Creature), `@typedef {import("../model/Creature.js").Creature}` (Creatures) | 12 edges | none | missing; JS-inherent (comments), but `@typedef {import(...)}` is the standard JS idiom for type-only imports and is worth supporting |
| 6b | Only instantiated: `new CreatureEntity`, `new NoSuchCreatureException`, `new CreatureId` in PersistedCreatures | 3 edges | yes | ok |
| 6c | Only static member: `CreatureFacade.STANDARD_CREATURE_TYPE` (Creature, PersistedCreatures via barrel), `HitPoints.init` (CreatureFacade), `CreatureFacade.STABLE_NAME` (encounter.mjs via barrel) | 4 edges | yes | ok |
| 6d | Only static member through `export *`: `CreatureUtil.STANDARD_ARMOR_CLASS_DESCRIPTION` in ArmorClass | ArmorClass -> index | no | missing (same cause as 3b) |
| 6e | Decorator / attribute | n/a | – | language has none |
| 7 | Same simple name: `import { Creature }` (domain) and `import { Creature as CreatureDto } from "./dto/Creature.js"`, both used (`new Creature`, `new CreatureDto`) in CreatureFacade | CreatureFacade -> domain/model/Creature, CreatureFacade -> application/dto/Creature | only the domain one | missing; scratch test shows that when only the aliased one is used the edge goes to the *first* import (wrong target): aliases are resolved by original export name and the first import with that name wins |
| 8 | Fully qualified reference without import | n/a | – | language has none |
| 9 | Unused import `Fightable` in CreatureUtil | none (usage-based) or CreatureUtil -> Fightable (import-based) | none | ok for the usage-based model the parser implements; note the import still executes the module at runtime |
| 10 | `node:crypto`, `winston` (ESM and `require`), `node:test`, `node:assert` | no internal edge | none | ok; but `const winston = require("winston")` in the .cjs becomes a VARIABLE leaf `creatureEntityMapper.winston` with a leaf edge `toEntity -> winston` (extra leaf) |
| 11 | Test file `CreatureService.test.js` | skipped by default, 4 edges with `--include-tests` | exactly that; leaf `CreatureService_test.should_save_creature_to_the_stable` kind FUNCTION | ok (dot in file name becomes `_` in the leaf path) |
| 12a | `Dice.js` with `DiceRoll`, `Dice`, `rollD20` | 3 leaves, `encounter.mjs -> Dice` | 3 leaves (CLASS, CLASS, FUNCTION) with internal leaf edges `Dice -> DiceRoll`, `rollD20 -> Dice`; file edge found | ok |
| 12b | `encounter.mjs` holding `EncounterRunner` | leaf `application.encounter.EncounterRunner` | yes | ok |
| ext | `.mjs` and `.cjs` picked up, `require("./CreatureEntity.js")` resolved | cjs -> CreatureEntity, mjs -> index/Dice/Centaur | yes | ok |

False positives: none at file level. Extra leaves: `CreatureType.default` (VARIABLE, from `export default
CreatureType`, with a leaf edge `default -> CreatureType`) and `creatureEntityMapper.winston` (VARIABLE,
a third-party `require` binding). `CreatureService.logger` (VARIABLE, `const logger = createLogger()`)
is a real module-level variable and acceptable.

Cycles: expected 3, reported 2 — `Creature -> index -> CreatureFacade -> Creature` and
`Creature -> index -> CreatureFacade -> CreatureService -> Creature` (5 edges flagged `isCyclic`,
all correct). The `ArmorClass` cycle and the `CreatureUtil` cycle are missing because of 3b and 6a.
Upward: `domain/model/Creature.js -> application/index.js` flagged `isPointingUpwards` (correct);
`ArmorClass.js -> index.js` missing (3b). `adapter -> application` is not flagged; the folder levels
are `adapter=2, application=1, domain=0`, so that direction counts as downward, which is the intended
layering.

Leaf kinds: CLASS for every class including `Fightable` and `Creatures` (right, JS has no interface),
VARIABLE for the frozen-object enums `CreatureType`/`SpeedType` (right, no enum in JS), FUNCTION for
`rollD20`, `toEntity` and the test function, REEXPORT for `index.CreatureFacade` and `index.*`.
All right for the language. Levels inside `Dice.js` (`DiceRoll=0, Dice=1, rollD20=2`) follow the
internal use chain.

Metrics: `incoming_dependencies` / `outgoing_dependencies` match the reported edges (e.g. `Creature.js`
5 incoming: PersistedCreatures, CreatureFacade, CreatureUtil, Centaur, CreatureService; `index.js`
3 incoming). They inherit every miss above: `ArmorClass.js` and `Speed.js` show 0 incoming although
both are imported by two or three files.

What the language offers: a real module system with relative specifiers, so file resolution is exact
and CodeCharta only has to strip/append extensions (`.js/.mjs/.cjs` handled) and follow barrels. What
CodeCharta resolves itself: alias-to-export-name mapping (buggy on clashes), `export *` expansion
(not done, the JavascriptAnalyzer says so deliberately — but the result is a dead-end `*` leaf),
and everything expressed in JSDoc (ignored).

## Domain language parser

Commands (all exit 0):

```
ccsh domainlanguageparser -nc $LANG_DIR -e "output,FINDINGS.md" -o output/domain.cc.json          # 24 leaves incl. the test file
... --string-weight 10 / --comment-weight 10 / --stop-word-level MINIMAL / AGGRESSIVE / --exclude-tests  -> output/domain-*.cc.json
```

`--string-weight 0` and `--comment-weight 0` are rejected (`require(stringWeight > 0)`) and the CLI
prints a full stack trace instead of a one-line message — a weight of 0 would be the natural way to
switch a source off. Weights were compared with 10 instead (default identifier 3, comment 2, string 1).

Expected words at the root node (all 17 present):
creature(97), speed(42), armor(23), hit(21), points(21), roll(12), damage(11), stable(10), dice(6),
encounter(5), hoard(5), initiative(5), centaur(4), cellar(2), dungeon(2), lair(2), treasure(2).
`dungeon`, `cellar`, `lair`, `treasure` come only from comments; `dungeon` would be 3 if the
`NoSuchCreatureException` string were counted (see below).

Keyword leakage: none. `class`, `function`, `const`, `static`, `extends`, `super`, `new`, `this`,
`throw`, `async`, `await`, `import`, `export`, `instanceof`, `return` are all absent (`throw` is even
filtered out of a string, scratch test). Right for the language.

Technical-word leakage at MODERATE (all real identifiers, so counting them is right at this level):
`entity(17)`, `repository(12)`, `model(4)`, `dto(3)`, `facade(3)`, `logger(3)`, `winston(3)`,
`persisted(3)`, `runner(3)`, `standard(6)`, `description(3)`, `init(3)`, `start(3)`, `value(6)`,
`id(16)`, `type(25)`; `string(2)`, `promise(4)`, `map(4)` are JSDoc type names. `util`, `exception`,
`service`, `test`, `get/set/save/find/create` are filtered as documented.
Wrong: JSDoc tags are counted as comment words — `param(30)`, `returns(10)`, `typedef(4)`,
`template(2)`, `implements(2)` and part of `type(25)` (`@type`). `param` is the third most frequent
word of the whole project. Tags (`@word` at the start of a JSDoc line) should be stripped, and the
`{Type}` after them is debatable.
`20(3)` is a number counted as a word (see splitting).

`--stop-word-level MINIMAL` adds `get(27) save(18) find(15) set(15) service(10) create(6) base(3)
exception(3)`; `AGGRESSIVE` removes `param type entity repository value model dto facade init logger
start template` (12 words). Neither touches the 17 domain words.

Identifier splitting:

| form | identifier | where | words found |
| --- | --- | --- | --- |
| camelCase | `walkingSpeed` | Centaur.gallop (local const) | walking, speed — ok |
| snake_case | `walking_speed`, `should_save_creature_to_the_stable` | test file | walking, speed; creature, stable (save filtered, should/to/the stop words) — ok |
| SCREAMING_SNAKE | `MAX_HIT_POINTS` | HitPoints static field | max, hit, points — ok |
| PascalCase | `ArmorClass` | class | armor (class is a keyword) — ok |
| Acronym | `XPValue` | CreatureEntity field | xp, value — ok; `findByXP` -> xp — ok |
| Digit | `d20Roll` | Dice.rollD20 local const | d20, roll — ok |
| Digit | `rollD20` | Dice.js free function | roll, **20** (the `D` is split off as a single letter and dropped, the digits survive as a word) — wrong, inconsistent with `d20Roll` |
| Kebab in string | `"centaur-stable"` | CreatureFacade static field | not counted at all (see strings); in the test file `"centaur-1"` gives centaur — splitting itself ok |

Only declarations are counted as identifiers (class, method, function, field, const names):
parameters, property accesses and `this.x = x` assignments are not. `XPValue` as a constructor
parameter alone produced nothing; it had to become a field.

Comments and strings: the four planted comments are all counted at weight 2 (`cellar(2)`, `lair(2)`,
`initiative/dungeon/encounter(2)` in CreatureFacade, `treasure/hoard(2)` in CreatureUtil); the
`--comment-weight 10` run scales exactly those words (51 words change, e.g. `cellar` 2 -> 10).
Strings: **no string literal inside an `export`ed declaration is counted.** Scratch tests (one
construct per file) show strings in `export class`, `export function`, `export default class` and
`export const` all vanish, while the same class without `export` or with a trailing `export { X }`
keeps them; comments inside an exported class are still counted. In this project every class is
`export class`, so `"No such creature in the dungeon: "` (NoSuchCreatureException), `"centaur-stable"`
(CreatureFacade), `"Natural Armor"` (CreatureUtil), `"saving creature"` and `"not a creature"`
(CreatureService) are all missing. The only strings counted are in non-exported functions and
top-level calls: `"centaur-1"` and `"saves a creature to the stable"` in the test, `"mapping creature
to entity"` in the .cjs. The `--string-weight 10` run confirms: only 7 words change (`saves`,
`mapping`, `centaur`, `stable`, `walking`, `entity`, `creature`).

Test file handling: `CreatureService.test.js` is included by default (its own node with
`creature(7) stable(4) walking(4) ... centaur(1) saves(1)`), `--exclude-tests` removes it (root loses
`saved(3) saves(1)`, `stable` 10 -> 6). Right. `test` itself is filtered.


## Round 2: additional dependency forms

Six files were added (`application/CreatureLoader.js`, `application/bootstrap.js`, `application/logging.js`,
`adapter/persistence/CreatureStable.js`, `adapter/persistence/mapping/index.js`, `domain/index.js`) and
`creatureEntityMapper.cjs` got two more `require` calls; 30 source files now. All three commands exit 0
(30 files scanned; default run 28 file edges / 38 leaves, `--include-tests` 32 / 39).
Found 2 of the 9 expected edges, 1 wrong target, 6 missing.

| form | file(s) | expected edge | found | note |
| --- | --- | --- | --- | --- |
| dynamic `const { Centaur } = await import("../domain/model/Centaur.js")` | application/CreatureLoader.js | CreatureLoader -> domain/model/Centaur.js | yes | leaf edge `CreatureLoader.CreatureLoader -> Centaur.Centaur`; a destructured dynamic import behaves exactly like a static one |
| `new URL("../domain/model/HitPoints.js", import.meta.url)` passed to `import(url.href)` | application/CreatureLoader.js | CreatureLoader -> domain/model/HitPoints.js | no | the specifier is an argument of `URL`, not of `import()`; `HitPoints.init` has no import binding. Inherently dynamic, the miss is acceptable |
| side-effect import `import "./logging.js"` | application/bootstrap.js -> application/logging.js | bootstrap -> logging | no | no imported name, so the usage-based model has nothing to bind; `logging.js` stays at 0 incoming. This is the one import form whose only purpose is to run the module, so an import-based edge is the only correct answer here |
| extension-less `import { rollD20 } from "../domain/model/Dice"` | application/bootstrap.js | bootstrap -> domain/model/Dice.js | yes | resolution works on path segments, the extension never mattered (scratch `useNoExt.js` confirms) |
| directory import `import { CreatureFacade } from "../../application"` | adapter/persistence/CreatureStable.js | CreatureStable -> application/index.js | wrong target | reported `CreatureStable.js -> application/CreatureFacade.js` (leaf edge to `CreatureFacade.CreatureFacade`), bypassing the barrel that the explicit `index.js` imports point at. `resolveImportPath` never tries `<dir>/index.js` (the TypescriptAnalyzer has `/index.ts` in `SOURCE_FILE_SUFFIXES`, the JavascriptAnalyzer has no such list); the dependency path `application.CreatureFacade` only coincides with the node path of `application/CreatureFacade.js`. Scratch: `import { Widget } from "./lib"` (Widget exported only by `lib/index.js`) gives no edge, `import { Thing } from "./lib"` gives `lib/Thing.js` |
| `export * as model from "./model/Speed.js"` | domain/index.js | domain/index -> domain/model/Speed.js | no | leaf `domain.index.*` REEXPORT, the alias `model` is lost, no leaf edge, `Speed.js` still 0 incoming (same dead end as round-1 3b). Scratch: a consumer `import { ns } from "./starAs.js"` + `new ns.Thing()` gets no edge either |
| `export { default } from "./model/CreatureType.js"` | domain/index.js | domain/index -> domain/model/CreatureType.js | no | leaf `domain.index.default` REEXPORT without an outgoing leaf edge although `CreatureType.default` exists. Scratch with `export default class Def` (leaf `def.default`): same, and `import Def from "./reexportDefault.js"` + `new Def()` yields no edge. Named `export { X } from` works (round 1), the default one does not |
| computed ``require(`./${REPOSITORY_MODULE}.js`)``, `new Repository()` | adapter/persistence/creatureEntityMapper.cjs | cjs -> adapter/persistence/Repository.js | no | not statically resolvable, miss expected; side effect: `REPOSITORY_MODULE` becomes a VARIABLE leaf and `createRepository` a FUNCTION leaf without edges. Scratch `require("./lib/" + NAME + ".js")` behaves the same |
| `require("./mapping")`, `xpForCreature(creature)` in `toEntity` | adapter/persistence/creatureEntityMapper.cjs | cjs -> adapter/persistence/mapping/index.js | no | same cause as the directory import: no `index.js` probing; `mapping.index.xpForCreature` exists with 0 incoming. The plain `require("./CreatureEntity.js")` next to it still resolves (scratch `useRequire2.cjs` too, as long as the use is inside a named function) |

Round-1 edges: unchanged. All 25 default edges are reported again with identical `isCyclic` /
`isPointingUpwards` flags, the `--include-tests` run adds the same 4 test edges (32 = 28 + 4), still 2
cycles and 1 upward edge. Only the metrics moved: `CreatureFacade.js` incoming 1 -> 2 (the wrong-target
edge), `Centaur.js` 1 -> 2 and `Dice.js` 1 -> 2 (the two correct new edges).

New false positives: none in the strict sense. `CreatureStable.js -> CreatureFacade.js` is counted as
wrong target above, not as extra, because it stands in for the expected `-> index.js` edge and would be
the transitive truth through the barrel; it is still not what the source says, and it appears only
because the file happens to be named like the imported symbol. New extra leaves: `domain.index.*` and
`domain.index.default` (dead REEXPORT leaves), `creatureEntityMapper.REPOSITORY_MODULE` (VARIABLE from a
`require` helper constant). `application.logging.LOG_LEVEL` is a real exported const and fine.

Domain parser after round 2: still exit 0; the 17 domain words are all present, `creature` 97 -> 109,
`stable` 10 -> 13, `centaur` 4 -> 10 (`CreatureStable`, `loadCentaur`); new technical words
`module(6)` (`REPOSITORY_MODULE`, `hitPointsModuleUrl`) and `bootstrap(3)`. Nothing in round 2 changes
the round-1 domain findings.

## Verdict

- Good: ES module resolution incl. `.mjs`/`.cjs`, extension-less specifiers, plain `require` and
  destructured dynamic `await import()`; aliased and namespace imports;
  `export { X } from` barrels modelled as REEXPORT leaves with the cycle and the upward edge flagged
  correctly; inheritance; multiple declarations per file with internal leaf edges; test-file
  default/`--include-tests` switch; no false-positive file edges; no keyword leakage; all 17 domain
  words present; snake/camel/screaming/acronym splitting; comments counted with visible weight.
- Wrong:
  1. Domain parser: string literals inside any `export`ed declaration are dropped
     (`application/CreatureFacade.js` `"centaur-stable"`, `domain/model/NoSuchCreatureException.js`
     `"No such creature in the dungeon: "`, `application/CreatureUtil.js` `"Natural Armor"`). In ESM
     that is practically every string in a module.
  2. Dependency parser: two imports with the same original name — `application/CreatureFacade.js`
     `import { Creature }` + `import { Creature as CreatureDto } from "./dto/Creature.js"` — yield one
     edge; using only the aliased one points the edge at the wrong file (scratch `OnlySecond.js`).
  3. Dependency parser: `export * from "./CreatureUtil.js"` in `application/index.js` produces a dead
     `index.*` REEXPORT leaf: no edge `index -> CreatureUtil` and consumers of the re-exported name
     (`domain/model/ArmorClass.js`) get no edge either, so a cycle and an upward edge disappear.
     Round 2: `export * as model from "./model/Speed.js"` and `export { default } from
     "./model/CreatureType.js"` in `domain/index.js` are the same dead end (`domain.index.*` with the
     alias lost, `domain.index.default` without a leaf edge); only named `export { X } from` works.
  3b. Dependency parser: a directory import, `import { CreatureFacade } from "../../application"` in
     `adapter/persistence/CreatureStable.js`, is not resolved to `application/index.js` (no `/index.js`
     probing, unlike the TypeScript analyzer's `/index.ts`); the edge lands on
     `application/CreatureFacade.js` only because the file is named like the symbol, and a name that
     exists only in the barrel gets no edge at all. `require("./mapping")` in
     `creatureEntityMapper.cjs` fails the same way.
  4. Domain parser: JSDoc tags counted as words (`param(30)`, `returns(10)`, `typedef`, `template`,
     `implements`).
  5. Domain parser: `rollD20` splits into `roll` + `20` (number kept, letter dropped) while `d20Roll`
     keeps `d20`.
  6. Dependency parser: `const winston = require("winston")` (`creatureEntityMapper.cjs`) becomes a
     project VARIABLE leaf; `export default CreatureType` becomes a second leaf `CreatureType.default`.
  7. `--string-weight 0` / `--comment-weight 0` crash with a stack trace instead of a clean message.
- Missing:
  1. Every dependency expressed only in JSDoc (`@param {X}`, `@type {X}`, `@implements {X}`,
     `@typedef {import("./X.js").X}`) — 12 of the expected edges, including `Creature -> Fightable`
     and `Creatures -> Creature`. Inherent to JS, but `@typedef {import(...)}` is the language's
     type-only import and would be cheap to support.
  2. Language has no interface, enum, generics, decorator, namespace or fully qualified reference;
     those rows are n/a rather than parser misses.
  3. Side-effect import `import "./logging.js"` (`application/bootstrap.js`): no edge, because there is
     no imported name to use. The only reason this statement exists is the dependency, so it needs an
     import-based edge.
  4. `require("./dir")` directory resolution and `import ... from "../dir"` (see Wrong 3b).
  5. Acceptable misses, inherently dynamic: `new URL("...", import.meta.url)` fed to `import()`
     (`application/CreatureLoader.js`) and the computed `require(\`./${REPOSITORY_MODULE}.js\`)`
     (`creatureEntityMapper.cjs`) — though the latter leaves a `REPOSITORY_MODULE` VARIABLE leaf behind.
