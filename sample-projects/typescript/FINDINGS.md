# TypeScript

> Correction (2026-10-08, cross-check with one identifier per file): the digit split is attributed the wrong way
> round wherever this report mentions it. `d20Roll` gives `20` + `roll` (the leading `d` is dropped), `rollD20` gives
> `roll` + `d20`, `roll_d20` gives `roll` + `20`. Both identifiers sit in the same file here, so the file's word list
> could not tell them apart.

## Expected values for round 3 (fixed 2026-10-08 before any parser output was read)

### EncounterResolver.ts

Readings fixed before the run: a lambda adds 1 to `complexity` but is not a function, so `clamp` in `safeRoll`
counts into `safeRoll`; the nested named function `fastestFirst` is a function of its own; rloc of a function is
the code lines strictly between its signature line and its closing brace.

| function | parameters | complexity | rloc (body) |
| --- | --- | --- | --- |
| resolve | 5 | 12 (if, else if, for, if, &&, while, 3 case, ternary, \|\|) | 32 |
| describe | 1 | 1 | 3 |
| safeRoll | 1 | 4 (catch, lambda, if in the lambda) | 13 |
| initiativeOrder | 1 | 1 | 8 |
| fastestFirst (nested) | 1 | 2 | 5 |
| isEmpty | 0 | 1 | 1 |

File: loc 91, rloc 73, comment_lines 13, number_of_functions 6, logic_complexity 14, complexity 21,
parameters max 5 / min 0 / mean 1.5 / median 1, complexity per function max 12 / min 1 / mean 3.5 / median 1.5,
rloc per function max 32 / min 1 / mean 10.33 / median 6.5, long_method 2, long_parameter_list 1,
message_chains 1, excessive_comments 1.

### EncounterEdgeCases.ts

File: loc 336, rloc 271, comment_lines 12, number_of_functions 49, logic_complexity 21, complexity 72,
max parameters 5, long_method 0, long_parameter_list 1, message_chains 2, excessive_comments 1.
Per construct: see the table under "Unified parser" (columns "expected").

### Other new files

| file | loc | rloc | comment_lines | functions | logic | complexity |
| --- | --- | --- | --- | --- | --- | --- |
| application/ui/CreatureCard.tsx | 30 | 27 | 1 | 1 | 2 | 4 |
| application/ui/SpeedBadge.tsx | 12 | 10 | 0 | 1 | 1 | 2 |
| domain/model/Zentaurenhöhle.ts | 15 | 11 | 1 | 2 | 1 | 3 |
| domain/model/lairKeeper.mts | 5 | 4 | 0 | 1 | 0 | 1 |
| domain/model/hoardLedger.cts | 12 | 11 | 0 | 1 | 2 | 3 |
| types/creatureGlobals.d.ts | 6 | 5 | 0 | 0 | 0 | 0 |
| types/winstonAugmentation.d.ts | 7 | 6 | 0 | 0 | 0 | 0 |

### Dependency edges of the new files

CreatureCard.tsx -> SpeedBadge.tsx; SpeedBadge.tsx -> Speed.ts; Zentaurenhöhle.ts -> ArmorClass.ts;
lairKeeper.mts -> Zentaurenhöhle.ts; hoardLedger.cts -> Dice.ts, Speed.ts; EncounterResolver.ts -> Creature.ts,
Dice.ts, SpeedType.ts; EncounterEdgeCases.ts -> Creature.ts, Centaur.ts, HitPoints.ts, Speed.ts, SpeedType.ts,
CreatureId.ts, NoSuchCreatureException.ts, Dice.ts, lairKeeper.mts, hoardLedger.cts;
registerCreatureTypes.ts -> types/creatureGlobals.d.ts (already expected in round 2, new path);
winstonAugmentation.d.ts -> none. 19 new edges, 80 in the default run, 86 with tests. No new cycle, no new
upward edge.

### Domain words of the new files

EncounterResolver.ts: encounter, attacker, defender, roll, bonus, terrain, damage, armor, dice, initiative,
dungeon, cellar, lair, stable. EncounterEdgeCases.ts: hoard, treasure, lair, cellar, roll, speed, xp, value, map,
http, gate, https, url, swamp, volcano, gallop. CreatureCard.tsx: creature, card, wandering, centaur, walking, speed,
hit, points. SpeedBadge.tsx: speed, badge, galloping, pace, fast, slow. Zentaurenhöhle.ts: zentaurenhöhle, verlies,
rüstungsklasse, trefferpunkte, kreatur, größe, höhle. lairKeeper.mts: lair, keeper. hoardLedger.cts: hoard, ledger,
coin.

Corrections to the block above, made after the run and left visible:

- The block was fixed before any output was read, but the first parser run was started in the same step in which
  the block was saved to this file, so "written into FINDINGS.md before the run" is true for the values, not for
  the file timestamp.
- Edge total: 79 in the default run and 85 with tests, not 80 / 86. The 2026-09-06 report counted 12 round-2 edges,
  but one of its 12 rows (`winstonAugmentation.d.ts -> none`) is not an edge; the miscount was copied.
- `lairKeeper.mts: keeper` and `hoardLedger.cts: ledger` were wrong expectations: both words occur only in the file
  name, and a file name is not a text source for the domain parser.
- `CreatureCard.tsx` rloc 27 treated the line `{/* The heading shows the creature id. */}` as comment-only; the
  braces of the JSX expression are code tokens, so the reported 28 is defensible.

## Project

- Layout: `tsconfig.json` (`baseUrl`, `paths` alias `@model/*`), `package.json` (react, winston, vitest),
  `src/de/sots/cellarsandcentaurs/{domain/model, domain/service, adapter/persistence, application, application/dto,
  application/ui, types}`. 39 source files: 33 `.ts` (one of them `CreatureService.test.ts`), 2 `.d.ts`, 2 `.tsx`,
  1 `.cts`, 1 `.mts`.
- Round 3 added `domain/service/EncounterResolver.ts`, `domain/service/EncounterEdgeCases.ts` (55 constructs, one
  declaration each), `application/ui/SpeedBadge.tsx`, `domain/model/Zentaurenhöhle.ts`, `domain/model/lairKeeper.mts`,
  `domain/model/hoardLedger.cts`, `types/creatureGlobals.d.ts`, `types/winstonAugmentation.d.ts`, and changed
  `application/ui/CreatureCard.tsx` (`<SpeedBadge />`, `&&`, ternary, `.map()`, `Wandering centaur`, a JSX comment)
  and the triple-slash path in `domain/model/registerCreatureTypes.ts`.
- The round-2 `typings/` folder never reached the repository (root `.gitignore` line 269 ignores `typings/`); the two
  files are recreated in `types/`. `git check-ignore` reports none of the new files as ignored.
- Dependency stress constructs present: all of 1-7 and 9-12 from the README plus the round-2 import forms. Not in
  the language: a fully qualified reference without an import (8).
- Unified stress constructs not in the language: `goto`, preprocessor branches and macros, operator overloads,
  extension functions, pattern guards, comprehensions, `unless` / `until`, `guard` / `defer`, `select`, exception
  filters, heredocs, nested comments. Closest idioms used: `for...of` as the `for` loop of `resolve`, a `const`
  arrow function as the lambda of `safeRoll`, a nested `function` declaration in `initiativeOrder`.
- Environment: the sandbox runs with a POSIX locale (`sun.jnu.encoding = ANSI_X3.4-1968`). With it all three parsers
  drop `Zentaurenhöhle.ts` without any message (38 / 37 / 38 files instead of 39 / 38 / 39), and
  `unifiedparser <path to that file>` fails with `Could not find resource ...Zentaurenh??hle.ts`. Every number below
  is from runs with `LC_ALL=C.UTF-8`.
- `.gitignore`: every run prints `No .gitignore found at root level, excluding common build folders as fallback`,
  because only the scanned folder is searched. A probe file in a `typings/` folder (git-ignored by the repository
  root) was analysed by all three parsers; the probe was removed again.

## Dependency parser

Commands (all exit 0):

```
ccsh dependencyparser -nc $LANG_DIR -e "output,FINDINGS.md" -o output/dependency.cc.json                            # 38 files
ccsh dependencyparser -nc $LANG_DIR -e "output,FINDINGS.md" --include-tests -o output/dependency-with-tests.cc.json  # 39 files
```

Result: 72 file edges, 109 leaves, 91 leaf edges (default); 78 / 110 / 97 with tests. Expected 79 / 85 file edges:
71 / 77 found, 8 missing, 1 extra. Console: `Found 1 strongly connected components`, `Found a total of 6 cycles`.

Missing edges: `CreatureFacade.ts -> dto/Creature.ts`, `index.ts -> ui/CreatureCard.tsx`,
`Stable.ts -> registerCreatureTypes.ts`, `SpeedLimit.ts -> Speed.ts`, `CreatureLoader.ts -> CreatureUtil.ts`,
`registerCreatureTypes.ts -> types/creatureGlobals.d.ts`, `hoardLedger.cts -> Dice.ts`,
`EncounterEdgeCases.ts -> Centaur.ts`. Extra edge: `CreatureService.ts -> types/winstonAugmentation.d.ts`.

| construct | expected edge(s) | found | verdict |
| --- | --- | --- | --- |
| 1 aliased import `CreatureEntity as Entity` (CreatureRepository.ts) | -> CreatureEntity.ts | yes | ok |
| 2 namespace import `import * as model` (CreatureUtil.ts) | -> model/Creature.ts | yes | ok |
| 3 barrel `export { CreatureFacade } from` (index.ts) | index -> CreatureFacade.ts | yes, leaf kind `reexport` | ok |
| 3 barrel `export * from "./CreatureUtil"` | index -> CreatureUtil.ts | yes, but `x2` with one leaf edge | wrong count |
| 3 barrel `export { default as CreatureCard } from "./ui/CreatureCard"` | index -> ui/CreatureCard.tsx | no; `reexport` leaf without outgoing edge | missing |
| 3 upward import of the barrel (Creature.ts, ArmorClass.ts) | -> application/index.ts | yes, `isPointingUpwards` and `isCyclic` | ok |
| 4 `Centaur extends Creature`, `implements Fightable`, `implements Creatures` | 3 edges | yes, all `usage=usage` | ok |
| 5 generic base `Repository<Entity>` | CreatureRepository -> Repository.ts | yes | ok |
| 6 type position only (`import type` in CreatureCard.tsx, creatureEntityMapper.ts, SpeedBadge.tsx) | 3 edges | yes | ok |
| 6 `new` only, static member only, decorator argument only | Facade -> CreatureId, Creature -> index, CreatureEntity -> CreatureTable | yes | ok |
| 7 same simple name (`Creature` and `Creature as CreatureDto` in CreatureFacade.ts) | -> model/Creature.ts, -> dto/Creature.ts | only the first | missing |
| 8 fully qualified reference | n/a | n/a | not in the language |
| 9 unused import `Fightable` (CreatureUtil.ts) | defensible either way | no edge | ok (usage-based) |
| 10 `winston`, `node:crypto`, `react`, `vitest`, `Map`, `Promise`, `Error` | no edge | `winston` gives one (see `declare module`) | extra |
| 11 test file | 6 edges only with `--include-tests` | yes, 38 vs 39 files | ok |
| 12 `Dice.ts` with `Dice`, `DiceRoll`, `rollD20`; `decorators.ts`, `creatureEntityMapper.ts` | leaves per declaration | yes | ok |
| tsconfig alias `@model/SpeedType` (CreatureCard.tsx) | -> SpeedType.ts | yes | ok |
| default import `import CreatureType from` (Creature.ts) | -> CreatureType.ts | yes | ok |
| side-effect import `import "./registerCreatureTypes"` (Stable.ts) | -> registerCreatureTypes.ts | no | missing |
| dynamic `await import("../domain/model/Centaur")` (CreatureLoader.ts) | -> Centaur.ts | yes | ok |
| inline type `import("../model/Speed").Speed` (SpeedLimit.ts) | -> Speed.ts | no, 0 outgoing | missing |
| `export * as dice from` (index.ts) | index -> Dice.ts | yes, `x6` with three leaf edges, namespace name `dice` lost | wrong count |
| `export type { Fightable } from`, `export { type HitPoints } from` | index -> Fightable.ts, HitPoints.ts | yes | ok |
| `import util = require("./CreatureUtil")` (CreatureLoader.ts), `import dice = require("./Dice")` (hoardLedger.cts) | 2 edges | none | missing |
| `/// <reference path="../../types/creatureGlobals.d.ts" />` (registerCreatureTypes.ts) | -> creatureGlobals.d.ts | no | missing |
| namespace member `Stable.Groom` (CreatureLoader.ts) | -> Stable.ts | yes | ok |
| `declare module "winston"` (types/winstonAugmentation.d.ts) | none in, none out | `CreatureService.ts -> winstonAugmentation.d.ts` | extra |
| explicit extension `"./Speed.js"` (Movement.ts), `"./Zentaurenhöhle.js"` (lairKeeper.mts) | -> Speed.ts, -> Zentaurenhöhle.ts | yes | ok |
| `.mjs` / `.cjs` specifier (`lairKeeper.mjs`, `hoardLedger.cjs` in EncounterEdgeCases.ts) | -> lairKeeper.mts, -> hoardLedger.cts | yes | ok |
| component used only as a JSX tag (`<SpeedBadge speed={speed} />` in CreatureCard.tsx) | -> SpeedBadge.tsx | yes | ok |
| type predicate only (`creature is Centaur` in `isCentaur`, EncounterEdgeCases.ts) | -> Centaur.ts | no | missing |
| `satisfies Pick<HitPoints, ...>`, conditional type `T extends Speed ? ...`, `keyof typeof SpeedType`, constraint `<T extends CreatureId>` | 4 edges | yes | ok |
| `instanceof NoSuchCreatureException`, default parameter value `rollD20()` | 2 edges | yes | ok |
| EncounterResolver.ts | -> Creature.ts, Dice.ts, SpeedType.ts | yes | ok |
| Zentaurenhöhle.ts (unicode file and class name) | -> ArmorClass.ts, and lairKeeper.mts -> it | yes with a UTF-8 locale | ok |

Isolated reproductions (scratch folder, not in this project): the same-name collision, `export { default as X } from`
and `import x = require()` give no edge on their own; a type predicate gives no edge with `import type`, with a value
import and with `asserts candidate is X`; `typeof import("./domain/Hydra")` as a return type gives no edge.

False positives: one, `domain/service/CreatureService.ts -> types/winstonAugmentation.d.ts` (leaf edge
`CreatureService -> Logger`). `CreatureService.ts` imports `Logger` from the package `winston`; the `.d.ts` only
augments that module.

Cycles and upward edges: 1 SCC, 6 cycles, 13 edges flagged `isCyclic`, all inside {CreatureFacade, Creature,
ArmorClass, CreatureService, Creatures, CreatureUtil, index}; expected the same set plus the cycle through
`CreatureCard.tsx`, which is absent because `index.ts -> CreatureCard.tsx` is missing. Upward: exactly the two
expected (`Creature.ts -> index.ts`, `ArmorClass.ts -> index.ts`). Folder levels: `types` 0, `domain` 1,
`application` 2, `adapter` 3.

Leaf kinds:

- right: `class`, `interface` (`Fightable`, `Creatures`, `LairPort`, `CreatureTypeRegistry`), `enum` (`CreatureType`,
  `SpeedType`, `ComputedLair`), `function` for function declarations, `reexport` for the eight barrel entries.
- wrong: type aliases are `class` (`TableConstructor`, `CreatureCardProps`, `SpeedBadgeProps`, and in
  EncounterEdgeCases.ts `SpeedValue`, `RollCallback`, `SpeedName`, `Terrain`); namespaces are `unknown`
  (`Stable`, `EdgeNamespace`) and their members (`Groom`, `CAPACITY`, `innerRoll`) are not leaves; functions bound
  to a `const` are `variable` (`SpeedBadge`, `arrowExpressionBody`, `arrowBlockBody`, `functionExpression`).
- missing: no leaf for `declare function ambientRoll` (EncounterEdgeCases.ts) and for
  `declare var creatureTypeRegistry` (types/creatureGlobals.d.ts).
- noise: `export default CreatureType` adds the leaf
  `src_de_sots_cellarsandcentaurs_domain_model_CreatureType_DEFAULT_EXPORT` (kind `enum`), which nothing references.

Metrics: `incoming_dependencies` / `outgoing_dependencies` are sums of the edge attribute `dependencies`, not counts
of files: `EncounterEdgeCases.ts` has 9 target files and `outgoing_dependencies` 15, `index.ts` 5 target files and 11,
`Dice.ts` 4 source files and `incoming_dependencies` 8. The `x2` / `x6` duplication of the star exports goes
straight into these numbers.

`--verbose` prints the same lines as the default run; nothing about the eight unresolved references.

Native vs. resolved: every TypeScript dependency is an `import` / `export ... from` with a path. CodeCharta resolves
relative paths, directory imports to `index.ts`, the `tsconfig.json` alias, `.js` / `.mjs` / `.cjs` specifiers to
`.ts` / `.mts` / `.cts`, aliases, `export *` and dynamic `import()`. It does not read `import x = require()`,
`import("...").X` in type positions, side-effect imports, triple-slash references, `export { default as }`, and it
does not treat a type predicate as a use of the type.

- Known gaps of the name rules (`analysis/analysers/parsers/DependencyParser/docs/name-resolution/typescript.md`): listed
  per probe in `regression/typescript/known-gaps.md`.

## Unified parser

Command (exit 0): `ccsh unifiedparser -nc $LANG_DIR -e "output,FINDINGS.md" -o output/unified.cc.json`, 39 files.
The file also carries an empty `lenses.dependency` block.

| extension | unified | dependency | domain |
| --- | --- | --- | --- |
| `.ts` | analysed | analysed | analysed |
| `.tsx` (CreatureCard.tsx, SpeedBadge.tsx) | analysed | analysed | analysed |
| `.cts` (hoardLedger.cts) | analysed | analysed | analysed |
| `.mts` (lairKeeper.mts) | analysed | analysed | analysed |
| `.d.ts` (types/*.d.ts) | analysed, 0 functions | analysed, interface leaves | analysed |
| `.test.ts` | analysed | only with `--include-tests` | analysed, dropped by `--exclude-tests` |

### EncounterResolver.ts

| metric | expected | reported | verdict |
| --- | --- | --- | --- |
| loc | 91 | 91 | ok |
| rloc | 73 | 73 | ok |
| comment_lines | 13 | 13 | ok |
| number_of_functions | 6 | 7 | deviates: the arrow function `const clamp = (...) => {...}` counts as a function (`variable_declarator` with an arrow value); the README calls it a lambda |
| logic_complexity | 14 | 15 | wrong: `default:` in `resolve` counts (`switch_default`) |
| complexity | 21 | 22 | wrong, follows from `default:` (15 + 7 function nodes) |
| max_parameters_per_function | 5 | 5 | ok |
| min_parameters_per_function | 0 | 0 | ok |
| mean_parameters_per_function | 1.5 | 1.6 | wrong: 5 functions in the statistic, `fastestFirst` is folded into `initiativeOrder` |
| median_parameters_per_function | 1 | 1 | ok |
| max_complexity_per_function | 12 | 12 | equal by accident: 11 + `default` and no 1 for the function itself |
| min_complexity_per_function | 1 | 0 | wrong: a straight-line function has 0 here, 1 in `complexity` |
| mean_complexity_per_function | 3.5 | 3.4 | wrong (values 12, 0, 3, 2, 0) |
| median_complexity_per_function | 1.5 | 2 | wrong |
| max_rloc_per_function | 32 | 32 | ok |
| min_rloc_per_function | 1 | 1 | ok |
| mean_rloc_per_function | 10.33 | 11.4 | wrong: 5 values (32, 3, 13, 8, 1), nested function not separate |
| median_rloc_per_function | 6.5 | 8 | wrong, same reason |
| long_method | 2 | 2 | ok |
| long_parameter_list | 1 | 1 | ok |
| message_chains | 1 | 1 | ok |
| excessive_comments | 1 | 1 | ok |

Classification from `TypescriptMetricMapping.kt` and `MetricPerFunctionCalc.kt`: `switch_default` is a
logic-complexity node; a function starts at the outermost function node and everything up to its end belongs to it,
so nested functions and lambdas are counted in `number_of_functions` (7) but not in the per-function statistics (5);
per-function complexity adds logic nodes and nested function nodes inside the body, never the function itself.

### EncounterEdgeCases.ts

Whole file: loc 336 / 336, rloc 271 / 271, comment_lines 12 / 12, number_of_functions 49 expected / 47 reported,
logic_complexity 21 / 24, complexity 72 / 76, max parameters 5 / 5, long_method 0 / 0, long_parameter_list 1 / 1,
message_chains 2 / 3, excessive_comments 1 / 1. Each construct was also run as a file of its own in a scratch
folder; the table gives logic / complexity / functions from those runs. The per-construct sums match the whole file.

| construct (declaration) | expected | reported | verdict |
| --- | --- | --- | --- |
| `for...of` (`forOfLoop`) | 1 / 2 / 1 | 1 / 2 / 1 | ok |
| `for...in` (`forInLoop`) | 1 / 2 / 1 | 1 / 2 / 1 | ok |
| `for (;;)` (`classicForLoop`) | 1 / 2 / 1 | 1 / 2 / 1 | ok |
| `do ... while` (`doWhileLoop`) | 1 / 2 / 1 | 1 / 2 / 1 | ok |
| `??` (`nullishCoalescing`) | 0 / 1 / 1 | 1 / 2 / 1 | deviates from the README rule; `??` is in the operator list next to `&&` and `\|\|` |
| `??=` (`nullishAssignment`) | 0 / 1 / 1 | 0 / 1 / 1 | ok by the rule, inconsistent with `??` |
| `\|\|=` and `&&=` (`logicalAssignment`) | 0 / 1 / 1 | 0 / 1 / 1 | ok by the rule, inconsistent with `\|\|` and `&&` |
| `?.` (`optionalChaining`) | 0 / 1 / 1 | 0 / 1 / 1 | ok |
| arrow, expression body (`const arrowExpressionBody`) | 0 / 1 / 1 | 0 / 1 / 1 | ok; rloc per function 0 |
| arrow, block body with `if` (`const arrowBlockBody`) | 1 / 2 / 1 | 1 / 2 / 1 | ok |
| function expression (`const functionExpression`) | 0 / 1 / 1 | 0 / 1 / 1 | ok |
| inline callbacks `.map(...).filter(...)` (`inlineCallbacks`) | 0 / 3 / 1 | 0 / 3 / 1 | ok |
| overload signatures (`overloaded`, 2 signatures + 1 body) | 0 / 1 / 1 | 0 / 1 / 1 | ok |
| abstract method + concrete method (`AbstractLair`) | 0 / 1 / 1 | 0 / 1 / 1 | ok |
| interface method signatures (`LairPort`) | 0 / 0 / 0 | 0 / 0 / 0 | ok |
| constructor parameter properties (`ParameterProperties`) | 0 / 1 / 1, 2 parameters | 0 / 1 / 1, 2 | ok |
| getter + setter with `if` (`Accessors`) | 1 / 3 / 2 | 1 / 3 / 2 | ok |
| `#secretPassage()` + caller (`PrivateMethods`) | 0 / 2 / 2 | 0 / 2 / 2 | ok |
| `static { if ... }` (`StaticBlock`) | 1 / 1 / 0 | 1 / 2 / 0 | deviates: the static block adds 1 to complexity without being a function |
| generator `function*` (`generatorRolls`) | 1 / 2 / 1 | 1 / 2 / 1 | ok |
| `async` / `await` (`asyncLoad`) | 0 / 1 / 1 | 0 / 1 / 1 | ok |
| `for await` (`forAwaitLoop`) | 1 / 2 / 1 | 1 / 2 / 1 | ok |
| default parameter (`defaultParameter`) | 2 parameters | 2 | ok |
| rest parameter (`restParameter`) | 1 parameter | 1 | ok |
| optional parameter `bonus?: number` (`optionalParameter`) | 2 parameters | 1 | wrong: `optional_parameter` is not a parameter node |
| the same in `nullishCoalescing(bonus?)` and `optionalChaining(creature?)` | 1 parameter each | 0 each | wrong, same cause |
| destructured parameter (`destructuredParameter`) | 1 parameter | 1 | ok |
| `this` parameter (`thisParameter(this: {...}, roll)`) | 1 parameter | 2 | wrong: `this` is counted |
| type guard `creature is Centaur` (`isCentaur`) | 0 / 1 / 1 | 0 / 1 / 1 | ok |
| conditional type `T extends Speed ? number : never` (`SpeedValue`) | 0 / 0 / 0 | 1 / 1 / 0 | wrong: `conditional_type` is a logic-complexity node |
| enum with computed members (`ComputedLair`) | 0 / 0 / 0 | 0 / 0 / 0 | ok |
| namespace with a function (`EdgeNamespace`) | 0 / 1 / 1 | 0 / 1 / 1 | ok |
| decorator function + decorated method (`logged`, `Decorated`) | 0 / 2 / 2 | 0 / 2 / 2 | ok |
| `satisfies` (`lairConfig`) | 0 / 0 / 0 | 0 / 0 / 0 | ok |
| template literal with `//`, `/* */` and `${wounded ? ... : ...}` (`templateLiteral`) | 1 / 2 / 1, 0 comment lines | 1 / 2 / 1, 0 | ok |
| TSDoc, block, line, `// @ts-ignore`, two trailing comments (`commented`) | 9 comment lines, rloc 4 | 9, 4 | ok |
| comment markers in strings (`commentMarkersInStrings`) | 0 comment lines, rloc 3 | 0, 3 | ok |
| multi-line template with a `//` line (`multiLineTemplate`) | 0 comment lines, rloc 3 | 0, 3 | ok |
| labelled `break outer` (`labelledBreak`) | 3 / 4 / 1 | 3 / 4 / 1 | ok |
| `switch` with grouped cases and `default` (`switchFallthrough`) | 3 / 4 / 1 | 4 / 5 / 1 | wrong: `default:` counts |
| `catch {` without binding (`optionalCatchBinding`) | 1 / 2 / 1 | 1 / 2 / 1 | ok |
| nested ternary (`nestedTernary`) | 2 / 3 / 1 | 2 / 3 / 1 | ok |
| class field holding an arrow function (`ArrowProperty.handleRoll`) | 0 / 1 / 1 | 0 / 1 / 0 | deviates: not a function, although a `const` arrow is one |
| object literal `open() {}`, `close: () => {}`, `get size()` (`lairObject`) | 0 / 3 / 3 | 0 / 3 / 2 | deviates: the arrow-valued property is not a function |
| generic constraint `<T extends CreatureId>` (`genericConstraint`) | 0 / 1 / 1 | 0 / 1 / 1 | ok |
| `catch` + `if (... instanceof ...)` (`instanceofInCatch`) | 2 / 3 / 1 | 2 / 3 / 1 | ok |
| `declare function` (`ambientRoll`) | 0 / 0 / 0 | 0 / 0 / 0 | ok |
| function type alias (`RollCallback`), `keyof typeof` (`SpeedName`), literal union (`Terrain`) | 0 / 0 / 0 | 0 / 0 / 0 | ok |
| four calls joined by `?.` (`optionalMessageChain`) | message_chains 1 | 1 | ok |
| three calls after a property access (`creature.getId().id.trim().toLowerCase().toUpperCase()`, `propertyInChain`) | message_chains 0 | 1 | deviates from "consecutive calls"; four calls in one member chain, defensible |
| four calls over four lines (`multiLineChain`) | message_chains 1 | 1 | ok |
| constructor with five parameter properties (`LongConstructor`) | long_parameter_list 1 | 1 | ok |
| `extensionVariants`, `identifierForms` | 0 / 1 / 1, 0 / 0 / 0 | same | ok |

Own miscount found on the way: the body of `labelledBreak` has 10 code lines, not 9 as assumed while planning
`long_method 0`; the expected 0 still holds because the threshold is "more than 10".

### Line counting

loc, rloc and comment_lines match the hand count in every new file except the one JSX comment line in
`CreatureCard.tsx` (rloc 28 instead of 27, see corrections). Comment markers inside strings and template literals
are not counted as comments. A trailing comment counts for both rloc and comment_lines. `// @ts-ignore` and the
triple-slash directive in `registerCreatureTypes.ts` count as comment lines.

### Other files

| file | expected (functions / logic / complexity) | reported | verdict |
| --- | --- | --- | --- |
| application/ui/CreatureCard.tsx | 1 / 2 / 4 | 1 / 2 / 4 | ok: `&&`, ternary and the `.map()` callback inside the markup are counted |
| application/ui/SpeedBadge.tsx | 1 / 1 / 2 | 1 / 1 / 2 | ok for the file; `max_complexity_per_function` 0 and `max_rloc_per_function` 0 although the component holds a ternary over 4 lines |
| domain/model/Zentaurenhöhle.ts | 2 / 1 / 3 | 2 / 1 / 3 | ok |
| domain/model/lairKeeper.mts | 1 / 0 / 1 | 1 / 0 / 1 | ok |
| domain/model/hoardLedger.cts | 1 / 2 / 3 | 1 / 2 / 3 | ok |
| types/creatureGlobals.d.ts, types/winstonAugmentation.d.ts | 0 / 0 / 0 | 0 / 0 / 0 | ok |

- Expression-bodied arrow functions never enter a "function body" (`statement_block`), so their per-function
  complexity and rloc are 0 (`SpeedBadge.tsx`, `arrowExpressionBody`).
- `adapter/persistence/CreatureEntity.ts`: `constructor(id?: string)` has `max_parameters_per_function` 0.
- `??` adds 1 in `Centaur.ts`, `CreatureEntity.ts`, `CreatureFacade.ts`, `CreatureUtil.ts`, `SpeedLimit.ts`.
- `application/CreatureFacade.ts`: 4 functions, 8 parameters on `create`, `long_parameter_list` 1,
  `message_chains` 1 (the five `.set(...)` calls), `long_method` 1; all as the source reads.
- `domain/service/CreatureService.test.ts`: 1 function, complexity 4 (three arrow callbacks); as the source reads.

## Domain language parser

Commands (exit 0 unless noted); outputs `output/domain*.cc.json`:

```
ccsh domainlanguageparser -nc $LANG_DIR -e "output,FINDINGS.md" -o output/domain.cc.json   # 39 files, 39 nodes, 262 distinct words
... --stop-word-level MINIMAL      # 271 words
... --stop-word-level AGGRESSIVE   # 249 words
... --exclude-tests                # 38 nodes, 260 words
... --no-technical-stopwords       # 275 words
... --ngrams 2                     # 343 entries
... --string-weight 0 / --comment-weight 0   # exit 1, IllegalArgumentException with stack trace (scratch run)
```

The lens holds one node per file and none for folders or the root, so there is no "root node's word list". The
frequencies below are sums over the 39 file nodes. Weights: identifier 3, comment 2, string 1.

Expected words: all 17 appear.

| word | frequency | word | frequency | word | frequency |
| --- | --- | --- | --- | --- | --- |
| creature | 155 | speed | 87 | roll | 78 |
| hit | 35 | lair | 32 | points | 31 |
| armor | 28 | damage | 21 | hoard | 17 |
| centaur | 16 | dice | 16 | stable | 13 |
| treasure | 8 | encounter | 7 | initiative | 5 |
| cellar | 4 | dungeon | 4 | | |

`cellar` and `dungeon` come only from comments (two comments each). Plural forms are separate words
(`creatures` 23, `speeds` 20, `rolls` 16): no stemming.

Expected words of the new files that are missing, all for the same two reasons:

- strings inside an exported declaration: `lair`, `stable` (the `case` labels in `EncounterResolver.ts`), `cellar`,
  `swamp`, `volcano`, `gallop` (`EncounterEdgeCases.ts`), `galloping`, `pace`, `fast`, `slow` (`SpeedBadge.tsx`,
  attribute and JSX expression strings), `höhle` (`Zentaurenhöhle.ts`).
- JSX text: `centaur` from `Wandering centaur` and `hit`, `points` from `Hit points:` in `CreatureCard.tsx`.

Keyword and technical leakage:

- Language keywords: none of `class`, `type`, `string`, `number`, `public`, `private`, `readonly`, `static`,
  `export`, `import`, `const`, `let`, `var`, `function`, `return`, `void`, `async`, `await`, `interface`, `enum`,
  `constructor` appears. Right.
- Technical words at MODERATE: `entity` 12, `repository` 6, `logger` 6, `facade` 3, `dto` 3 appear; `util`,
  `exception`, `test`, `service`, `save`, `find`, `create`, `props`, `key`, `title`, `name` are filtered. The five
  that leak are in `technical-aggressive.txt` only; AGGRESSIVE removes them together with `value` 39,
  `parameter` 18, `template`, `types`, `handle`, `init`, `method`, `param`.
- Other noise: `id` 51 (fourth most frequent word), `value` 39, `total` 18, `max` 14, `all`, `one`, `such`,
  `every`, `before`; `math`, `max` from the commented-out line in `EncounterResolver.ts`; `ts`, `ignore` from
  `// @ts-ignore`; `script` from the word `TypeScript` in a comment (`type` is filtered as a keyword);
  `reference`, `path`, `globals` from the triple-slash directive.
- JSX tag names are identifiers: `article` 3 and `li` 3 from `CreatureCard.tsx`. `h2`, `p`, `ul` and `span` do not
  appear; in scratch files `<article className=...>` was extracted and `<article>` without attributes was not
  (cause not verified).

Identifier splitting:

| form | identifier | words found |
| --- | --- | --- |
| camelCase | `walkingSpeed` | walking, speed |
| snake_case | `walking_speed` (test file) | walking, speed |
| SCREAMING_SNAKE | `MAX_HIT_POINTS` | max, hit, points |
| PascalCase | `ArmorClass` | armor (`class` filtered) |
| Acronym | `XPValue`, `storedXPValue` | xp, value |
| Acronym | `lairHTTPGate`, `HTTPSLairURL` | lair, http, gate / https, lair, url |
| Digit | `d20Roll` | d20, roll |
| Digit | `rollD20` | roll, 20 |
| Prefix | `$treasureMap`, `_hoardSize` | treasure, map / hoard, size |
| Private name | `#secretPassage` | secret, passage |
| Kebab in string | `"centaur-stable"` (CreatureFacade.ts, exported class) | nothing; in a non-exported scratch file centaur, stable |

Comments and strings:

- All four planted comments are counted with weight 2 (`cellar`, `lair`, `initiative` / `encounter` / `dungeon`,
  `treasure` / `hoard`), so are the 6-line doc comment and the block comment of `EncounterResolver.ts` and the JSX
  comment in `CreatureCard.tsx` (`heading`, `shows`).
- A string literal below an `export` statement is never extracted. `StringLiteralExtractor.kt` skips every string
  that has an `export_statement` ancestor, which is meant for `export ... from "path"` and also hits
  `export class`, `export function`, `export const` and `export default`. Scratch files: `export class`,
  `export function`, `export const x = "..."`, `export default function` and an exported TSX component yield no
  string word; the same code without `export`, or with `export { alpha }` after the declaration, yields them with
  weight 1. In this project that removes `"No such creature in the dungeon: "`, `"centaur-stable"`,
  `"Natural Armor"`, `"Größe der Höhle"`, every string in `EncounterResolver.ts` and `EncounterEdgeCases.ts`.
- Non-exported strings that are counted: string-literal types, enum values, object keys and values, JSX attribute
  values and `{"..."}` expressions (scratch), the test file's strings (`saves` 1, `centaur` 1) and `"winston"` in
  `declare module "winston"`.
- JSX text is not extracted in any form (`jsx_text` has no mapping).

Test file handling: included by default. `--exclude-tests` drops `CreatureService.test.ts` (38 nodes), removes
`saved`, `saves` and lowers `creature` 155 -> 144, `stable` 13 -> 9, `centaur` 16 -> 15, `walking` 18 -> 15.
`should_save_creature_to_the_stable` yields creature, stable; `should`, `save` are filtered.

- German words (`domain/model/Zentaurenhöhle.ts`): six of seven appear. From identifiers, intact:
  `zentaurenhöhle` 3, `rüstungsklasse` 9, `größe` 3. From the comment, intact because they are ASCII: `verlies` 2,
  `trefferpunkte` 2, `kreatur` 2. `höhle` is missing (only in the exported string). The umlaut words of the comment
  are cut at every non-ASCII letter: `Zentaurenhöhle` -> `zentaurenh`, `hle`; `Rüstungsklasse` -> `stungsklasse`;
  `gehören` -> `geh`, `ren`. The comment and string splitter is `\b[a-zA-Z]{3,}\b` (`SplitStage.kt`); a scratch
  string `"Größe der Höhle"` gives `der`, `hle` and nothing for `Größe`. German stop words leak: `die`, `dem`,
  `und`, `unter`, `jeder` (2 each), also `liegt`; there is only an English stop word list.

## Changed since 2026-09-06

No unified-parser report existed; that section is new.

Dependency parser, no longer true:

- The warning `4 declaration(s) share a logical path with an earlier one` is no longer printed; the `x2` / `x6`
  duplication it pointed at is still in the output.
- "Metrics count distinct files" does not hold on the current output: they sum declaration-level dependencies
  (see Metrics above). Whether the parser changed or the earlier files simply had one declaration pair per edge
  was not verified.
- "The leaf `winston.Logger` lives outside the `src` logical tree": leaves are stored per file and name
  (`types/winstonAugmentation.d.ts` / `Logger`) without a logical path, so the statement can no longer be checked.
- The earlier count of 12 expected round-2 edges was 11.

Dependency parser, still true: all six missing round-1 / round-2 edges, the false `winston` edge, the star-export
duplication, type aliases as `class`, namespaces as `unknown`, the synthetic `..._DEFAULT_EXPORT` leaf, no
information from `--verbose`, 1 SCC / 6 cycles, the two upward edges, the folder order.

Dependency parser, new: a type predicate does not create an edge (`EncounterEdgeCases.ts -> Centaur.ts`);
`import = require` is also unread in a `.cts` file; functions bound to a `const` have the leaf kind `variable`.

Domain parser, no longer true:

- "39 nodes for 26 files" and "words at the root node": the lens now has file nodes only.
- "JSX tag names are not extracted at all": `article` and `li` are now words of `CreatureCard.tsx`.
- "`dto` and `logger` are not in any list": both are in `technical-aggressive.txt`.
- The longer MINIMAL / AGGRESSIVE differences (`error`, `load`, `index`; `parameter`, `template`, `handle`,
  `method`) come from words of the new files, not from a changed list.

Domain parser, still true: all 17 words present, no keyword leakage, strings below `export` are dropped, weight 0
aborts with a stack trace, `rollD20` -> `roll`, `20`, no stemming, `id` among the top words.

## Verdict

### Unified parser

- Missing:
  - `domain/model/Zentaurenhöhle.ts` is skipped without a message when the JVM runs with a non-UTF-8 locale; the
    same holds for the other two parsers. **Decision: accept for all three parsers (derived from Java).**
  - A `.gitignore` above the scanned folder is not read (`No .gitignore found at root level`); a probe in an
    ignored `typings/` folder was analysed. **Decision: ignore (derived from Kotlin).**
- Wrong:
  1. `EncounterResolver.ts` `resolve` and `EncounterEdgeCases.ts` `switchFallthrough`: `default:` adds 1 to
     `logic_complexity` and `complexity` (15 / 22 instead of 14 / 21). **Decision: ignore (derived from Java).**
  2. `EncounterResolver.ts`: `number_of_functions` is 7, but the per-function statistics hold 5 values, because
     `fastestFirst` and `clamp` are folded into `initiativeOrder` and `safeRoll` (mean parameters 1.6 instead of 1.5,
     mean rloc 11.4 instead of 10.33, median rloc 8 instead of 6.5). **Decision: accept (derived from Java).**
  3. Per-function complexity leaves out the function itself: `describe` and `isEmpty` have 0, so
     `min_complexity_per_function` is 0 while `complexity` counts 1 per function. **Decision: ignore (derived from Java).**
  4. `EncounterEdgeCases.ts` `SpeedValue`: the conditional type `T extends Speed ? number : never` adds 1 to
     `logic_complexity`. **Decision: ignore — documented.**
  5. Parameters: `bonus?: number` is not counted (`optionalParameter` 1 instead of 2, `CreatureEntity` constructor
     0 instead of 1) and the `this` parameter is counted (`thisParameter` 2 instead of 1). **Decision: accept — optional parameters should count; the `this` parameter counting is fine, ignore.**
  6. `SpeedBadge.tsx`, `arrowExpressionBody`: an arrow function with an expression body has per-function
     complexity 0 and rloc 0. **Decision: accept.**
- Bad:
  - `??` counts as a branch (`nullishCoalescing`), `??=`, `||=`, `&&=` and `?.` do not. **Decision: accept — `??=`, `||=`, `&&=` should count like their long forms.**
  - A `const` arrow function is a function (`clamp`, `arrowBlockBody`, `SpeedBadge`), a class field or object
    property holding an arrow function is not (`ArrowProperty.handleRoll`, `lairObject.close`). **Decision: accept (derived from Java).**
  - `StaticBlock`: a static block adds 1 to `complexity` and 0 to `number_of_functions`. **Decision: ignore (derived from Java).**
  - `propertyInChain`: a property access inside a chain does not interrupt `message_chains`. **Decision: ignore — matches the documented node lists.**
  - `CreatureCard.tsx`: the JSX comment line counts as code and as comment. **Decision: ignore.**
- Good: loc, rloc and comment_lines in every file; comment markers in strings and template literals; all loop
  forms including `for await`; `catch` with and without binding; ternaries inside template literals and JSX; `&&`
  and callbacks inside JSX; overload signatures, abstract methods, interface signatures, `declare function` and
  function types are not functions; getters, setters, `#private` methods, generators, constructors, namespace
  functions and decorated methods are; default, rest and destructured parameters; `extends` in a generic
  constraint is not a branch; `.cts`, `.mts`, `.d.ts`, `.tsx` are all analysed.

### Dependency parser

- Missing:
  1. `application/CreatureFacade.ts`: the second of two imports with the same original name
     (`import { Creature as CreatureDto } from "./dto/Creature"`) gives no edge; `dto/Creature.ts` has 0 incoming. **Decision: accept (derived from Java).**
  2. `application/index.ts`: `export { default as CreatureCard } from "./ui/CreatureCard"` gives a `reexport` leaf
     without an edge, so the cycle through `CreatureCard.tsx` is not found. **Decision: accept.**
  3. `application/CreatureLoader.ts`, `domain/model/hoardLedger.cts`: `import x = require("...")` is not read. **Decision: accept.**
  4. `domain/service/SpeedLimit.ts`: `import("../model/Speed").Speed` in a type position gives no edge. **Decision: accept (derived from Java).**
  5. `domain/service/EncounterEdgeCases.ts` `isCentaur`: a type used only in a type predicate
     (`creature is Centaur`) gives no edge. **Decision: accept (derived from Java).**
  6. `domain/model/registerCreatureTypes.ts`: `/// <reference path=...>` gives no edge, and
     `declare var creatureTypeRegistry` in `types/creatureGlobals.d.ts` is no leaf. **Decision: ignore.**
  7. `domain/model/Stable.ts`: the side-effect import `import "./registerCreatureTypes"` gives no edge. **Decision: accept.**
  8. `--verbose` says nothing about unresolved imports. **Decision: ignore.**
- Wrong:
  1. `types/winstonAugmentation.d.ts`: `declare module "winston"` makes
     `CreatureService.ts -> winstonAugmentation.d.ts` appear, an edge to a file `CreatureService.ts` never imports. **Decision: accept.**
  2. `application/index.ts`: two star exports double the count of every star-exported declaration
     (`-> CreatureUtil.ts x2`, `-> Dice.ts x6`), and `outgoing_dependencies` 11 / `Dice.ts` incoming 8 inherit it. **Decision: accept.**
  3. Leaf kinds: type aliases are `class`, namespaces `unknown` without member leaves, `const` functions `variable`. **Decision: accept.**
- Bad:
  - `incoming_dependencies` / `outgoing_dependencies` count declaration pairs, not files; the name suggests files. **Decision: accept (derived from Java).**
  - `CreatureType.ts`: the unreferenced `..._DEFAULT_EXPORT` leaf. **Decision: accept.**
  - `export * as dice` is flattened, the namespace name is lost. **Decision: ignore.**
  - The barrel is a hop of its own; `Creature.ts -> CreatureFacade.ts` exists only via `index.ts`. **Decision: accept — an import through a barrel should point at the real target.**
- Good: relative paths, directory import, `tsconfig` alias, `.js` / `.mjs` / `.cjs` specifiers, aliased, namespace,
  default, type-only and dynamic imports, `export *`, `export type`, decorators, `extends` / `implements`, generic
  arguments and constraints, `satisfies`, conditional types, `keyof typeof`, `instanceof`, a component used only as
  a JSX tag, unicode file and class names, test exclusion and `--include-tests`, cycle and upward flags.

### Domain language parser

- Missing:
  1. JSX text is not extracted: `Wandering centaur`, `Hit points:`, `Walking speed:` in `CreatureCard.tsx`. **Decision: accept.**
  2. No folder or root nodes in the lens; a word list for the project has to be summed from the file nodes. **Decision: ignore (derived from Java).**
  3. No German stop words: `die`, `dem`, `und`, `unter`, `jeder` from `Zentaurenhöhle.ts` are reported. **Decision: ignore (derived from Java).**
  4. No stemming: `creature` / `creatures`, `speed` / `speeds`, `roll` / `rolls`, `saved` / `saves`. **Decision: ignore (derived from Java).**
- Wrong:
  1. Strings below `export` are dropped (`NoSuchCreatureException.ts`, `CreatureFacade.ts`, `CreatureUtil.ts`,
     `EncounterResolver.ts`, `EncounterEdgeCases.ts`, `SpeedBadge.tsx`, `Zentaurenhöhle.ts`); with almost every
     TypeScript declaration exported, the string weight has next to no effect. **Decision: ignore.**
  2. `Zentaurenhöhle.ts`: umlaut words in comments and strings are cut into `zentaurenh`, `hle`, `stungsklasse`,
     `geh`, `ren`, while the same words as identifiers stay whole. **Decision: accept (derived from Java).**
  3. `--string-weight 0` / `--comment-weight 0` abort with a stack trace. **Decision: accept (derived from Java).**
  4. `rollD20` gives `roll`, `20`; `d20Roll` gives `d20`, `roll`. **Decision: ignore (derived from Java).**
- Bad:
  - `id` 51 and `value` 39 are among the five most frequent words; `entity`, `repository`, `facade`, `dto`,
    `logger` pass at the default level. **Decision: ignore (derived from Java).**
  - JSX tag names (`article`, `li`) are counted as identifiers with weight 3, and not consistently. **Decision: accept.**
  - Commented-out code and compiler directives feed words (`math`, `max`, `ts`, `ignore`, `reference`, `path`). **Decisions derived from Java: ignore — commented-out code.**
- Good: all 17 expected words; no language keyword leaks; every comment form including JSX comments; camelCase,
  snake_case, SCREAMING_SNAKE, PascalCase, acronym, `$` / `_` / `#` prefixed identifiers; unicode identifiers stay
  whole; `.cts`, `.mts`, `.d.ts`, `.tsx` are read; test files are included by default and removed by
  `--exclude-tests`; the stop-word levels and `--ngrams 2` (`hit points` 27, `walking speed` 15) work.
