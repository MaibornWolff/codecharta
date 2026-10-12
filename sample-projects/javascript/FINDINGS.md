# JavaScript

> Correction (2026-10-08, cross-check with one identifier per file): the digit split is attributed the wrong way
> round wherever this report mentions it. `d20Roll` gives `20` + `roll` (the leading `d` is dropped), `rollD20` gives
> `roll` + `d20`, `roll_d20` gives `roll` + `20`. Both identifiers sit in the same file here, so the file's word list
> could not tell them apart.

Report of 2026-10-08 (round 3). It replaces the report of 2026-09-06, which covered the dependency and the
domain parser only. Every claim below was checked against the output of this run; what could not be
re-checked is marked "not re-verified".

## Project

- Layout: `src/de/sots/cellarsandcentaurs/{domain/model,domain/service,adapter/persistence,application,application/dto}`
  plus `package.json` with `"type": "module"`. 38 source files: 31 `.js`, 2 `.cjs`
  (`adapter/persistence/creatureEntityMapper.cjs`, `application/extensions/lairGate.cjs`), 2 `.mjs`
  (`application/encounter.mjs`, `application/extensions/lairGate.mjs`) and 3 `.jsx`
  (`application/ui/CreatureCard.jsx`, `application/ui/SpeedBadge.jsx`, `application/extensions/LairGate.jsx`).
  Test file: `domain/service/CreatureService.test.js`.
- Added in round 3 (8 files): `domain/service/EncounterResolver.js`, `domain/service/EncounterEdgeCases.js`,
  `domain/model/Zentaurenhöhle.js` (unicode file name, class name and field `rüstungsklasse`),
  `application/ui/CreatureCard.jsx`, `application/ui/SpeedBadge.jsx`, `application/extensions/lairGate.cjs`,
  `lairGate.mjs`, `LairGate.jsx`. `git check-ignore -v` reports none of them as ignored.
- JavaScript has: ES modules with relative specifiers, `import { X as Y }`, `import * as ns`, default
  import/export, barrels (`export * from`, `export { X } from`), `require`, dynamic `import()`, class
  inheritance, `static` members and static blocks, private `#members`, getters/setters, generators,
  `async`/`await`, arrow functions, destructuring, optional chaining, `??`, logical assignment, labels, JSX.
- JavaScript does not have: interfaces (`Fightable`, `Creatures` are classes with throwing methods), enums
  (`CreatureType`, `SpeedType` are `Object.freeze` objects), generics (`@template T` in JSDoc), type
  annotations (types exist only in JSDoc), decorators, namespaces, fully qualified references, `goto`,
  `unless`/`until`, pattern guards, comprehensions, preprocessor, operator overloads, extension functions,
  nested comments, heredocs (template literals are the multi-line string).
- Closest idioms used in `EncounterResolver.js`: the loop over the attacker's speeds is a classic `for` over
  `Array.from(attacker.getSpeeds())`; the lambda in `safeRoll` is an arrow function bound to a `const`; the
  nested named function in `initiativeOrder` is a function declaration.

## Expected values (written before the parsers ran)

Unified parser, rule = README counting rule read literally: arrow functions and anonymous `function`
expressions are lambdas (complexity +1, not in `number_of_functions`, folded into the enclosing named
function for the per-function statistics); `??`, `??=`, `||=`, `&&=`, `?.` are not named by the rule and
count 0; `default` counts 0; rloc of a function = code lines between its signature line and its closing
brace, nested functions included.

Dependency parser, 15 new edges (52 expected before + 15 = 67 without the test file, 71 with):
`EncounterResolver.js -> SpeedType.js`; `EncounterEdgeCases.js ->` `Speed.js`, `HitPoints.js`, `CreatureId.js`,
`Centaur.js`, `Dice.js`, `ArmorClass.js`, `CreatureType.js`, `SpeedType.js`; `CreatureCard.jsx -> Creature.js`
and `-> SpeedBadge.jsx`; `SpeedBadge.jsx -> SpeedType.js`; `lairGate.cjs`, `lairGate.mjs`, `LairGate.jsx ->
Dice.js`. `Zentaurenhöhle.js`: no edge, one class leaf. No new cycle, no new upward edge.

Domain parser: the 17 shared words; the seven German words uncut and `die`, `unter`, `dem`, `und`, `jeder`
absent; tracer words planted once each (table in the domain section), `basilisk` (regex literal) absent.

The numbers are in the tables below, next to what the parsers reported.

## Unified parser

Command (exit 0, 37 leaves; `package.json` reported as unsupported `.json`):

```
ccsh unifiedparser -nc $LANG_DIR -e "output,FINDINGS.md" -o output/unified.cc.json
env LC_ALL=C.UTF-8 ccsh unifiedparser ... -o output/unified-utf8.cc.json      # 38 leaves
```

Files and extensions:

| extension | unified | dependency | domain |
| --- | --- | --- | --- |
| `.js` | analysed | analysed | analysed |
| `.cjs` (`lairGate.cjs`, `creatureEntityMapper.cjs`) | analysed | analysed, `require` resolved | analysed |
| `.mjs` (`lairGate.mjs`, `encounter.mjs`) | analysed | analysed | analysed |
| `.jsx` (`LairGate.jsx`, `CreatureCard.jsx`, `SpeedBadge.jsx`) | analysed (the README lists only `.js .cjs .mjs`; my expectation "skipped" was wrong) | analysed | analysed |
| `Zentaurenhöhle.js` (unicode file name) | skipped without a message when the process locale is `POSIX` (the default of the machine that ran this); analysed with `LC_ALL=C.UTF-8` | same | same |

The progress line of the unified parser jumps back and forth when stderr is not a terminal (`48% 18/37`,
`54% 20/37`, `48% 18/37`, ..., `97% 36/37`, `89% 33/37`).

### EncounterResolver.js

| metric | expected | reported | verdict |
| --- | --- | --- | --- |
| loc | 92 | 92 | ok |
| rloc | 74 | 74 | ok |
| comment_lines | 13 | 13 | ok |
| number_of_functions | 6 | 7 | deviates: the arrow function `const clamp = (value) => {...}` in `safeRoll` is counted as a function |
| logic_complexity | 14 | 15 | wrong by the rule: `default:` in `resolve` counts +1 (`switch_default` is in the logic list; probe `switch` with 2 cases and no default = 2) |
| complexity | 21 | 22 | follows from the `default` |
| parameters max / min / mean / median | 5 / 0 / 1.67 / 1 | 5 / 0 / 1.6 / 1 | mean wrong: only 5 entries, the nested `byInitiative(left, right)` is not a function of its own in the statistics although `number_of_functions` counts it |
| complexity per function max / min / mean / median | 12 / 1 / 3.5 / 1.5 | 12 / 0 / 3.4 / 2 | wrong: per-function complexity is logic only, without the +1 of the function (`describe`, `isEmpty` = 0); the five values are 12, 3, 2, 0, 0. The max matches by coincidence (expected 11 + 1 for the function, reported 11 + `default`) |
| rloc per function max / min / mean / median | 36 / 1 / 10.17 / 5 | 36 / 1 / 12 / 7 | max and min ok; mean and median over 5 entries (36, 13, 7, 3, 1), `byInitiative` missing |
| long_method | 2 | 2 | ok (`resolve`, `safeRoll`) |
| long_parameter_list | 1 | 1 | ok |
| message_chains | 1 | 1 | ok (the chain of 5; the chain of 3 is not counted) |
| excessive_comments | 1 | 1 | ok |

### EncounterEdgeCases.js

Whole file: loc 273 / 273 ok; rloc 221 expected / 222 reported; comment_lines 8 / 7; number_of_functions
38 / 44; logic_complexity 24 / 26; complexity 75 / 78; message_chains 2 / 3; max parameters 3 / 4; mean
parameters 1.05 / 1.23; max complexity per function 4 / 4; max rloc per function 9 / 10 (my count was
wrong: `labelledBreak` and `fallthrough` have 10 body lines, not 9); long_method 0 / 0;
long_parameter_list 0 / 0; excessive_comments 0 / 0. Every deviation is explained by the rows below.

The file-level metrics cannot be attributed to a function, so each construct was also run alone (the file
split at its blank lines into one file per construct, in a scratch folder). Columns: functions / logic /
complexity, parameters where they matter.

| construct | expected | reported | verdict |
| --- | --- | --- | --- |
| shebang `#!/usr/bin/env node` | 1 comment line, 0 rloc | 0 comment lines, 1 rloc | deviates: the hashbang comment is counted as code |
| `forOf`: `for (const creature of creatures)` + `if` | 1 / 2 / 3 | 1 / 2 / 3 | ok |
| `forIn`: `for (const key in speeds)` | 1 / 1 / 2 | 1 / 1 / 2 | ok |
| `doWhile`: `do { } while (roll > 0)` | 1 / 1 / 2 | 1 / 1 / 2 | ok |
| `nullishCoalescing`: `creature.name ?? "nameless"` | 1 / 0 / 1 | 1 / 1 / 2 | deviates from the literal rule: `??` counts like `\|\|` (defensible) |
| `nullishAssignment`: `options.terrain ??= "cellar"` | 1 / 0 / 1 | 1 / 0 / 1 | ok by the rule, but inconsistent with `??` |
| `orAssignment`: `\|\|=` | 1 / 0 / 1 | 1 / 0 / 1 | ok by the rule, inconsistent with `\|\|` |
| `andAssignment`: `&&=` | 1 / 0 / 1 | 1 / 0 / 1 | ok by the rule, inconsistent with `&&` |
| `optionalChaining`: `creature?.speeds?.size` | 1 / 0 / 1 | 1 / 0 / 1 | ok |
| `optionalCallChain`: `creature?.getSpeeds()?.values()?.next()?.toString()` | message_chains 1 | 1 | ok |
| `brokenChain`: `creature.getSpeeds().values().next().value.getSpeed().toFixed(0)` | message_chains 0 (3 + 2 calls, a property in between) | 1 | deviates from "consecutive calls": a property access does not break the chain (5 calls, defensible) |
| `arrowExpression`: `export const arrowExpression = (id) => new Centaur(id);` | 0 / 0 / 1 | 1 / 0 / 1, parameters 4 | counted as a function (reasonable for JS); parameters wrong, 1 is right |
| `arrowBlock`: `export const arrowBlock = (roll, bonus) => {...}` | 0 / 1 / 2 | 1 / 1 / 2, parameters 3 | parameters wrong, 2 is right |
| `asyncArrow`: `export const asyncArrow = async (dice) => await dice.roll();` | 0 / 0 / 1 | 1 / 0 / 1, parameters 3 | parameters wrong, 1 is right |
| `functionExpression`: `const functionExpression = function (dice) {...}` | 0 / 0 / 1 | 1 / 0 / 1, parameters 1 | counted as a function |
| `GetterLair`: `get krakenTreasure()` | 1 / 0 / 1 | 1 / 0 / 1 | ok |
| `SetterLair`: `set hydraTreasure(value)` | 1 / 0 / 1 | 1 / 0 / 1 | ok |
| `StaticBlockLair`: `static { ... ? 8 : 4 }` | 0 / 1 / 1 | 0 / 1 / 2 | deviates: the static block adds +1 complexity like a function without being one |
| `PrivateLair`: `#count(speedType)` with a ternary | 1 / 1 / 2 | 1 / 1 / 2 | ok |
| `ConstructorLair`: `constructor(hoard, guards)` | 1 / 0 / 1, 2 parameters | same | ok |
| `StaticMethodLair`: `static create()` | 1 / 0 / 1 | 1 / 0 / 1 | ok |
| `FieldArrowLair`: `guard = (intruder) => intruder.flee();` | 0 / 0 / 1 | 0 / 0 / 1 | ok by the rule, but inconsistent: the same arrow bound to a `const` is a function |
| `rollManticore`: `function* rollManticore(sides)` + `while (true)` | 1 / 1 / 2, 1 parameter | 1 / 1 / 2, 2 parameters | parameters wrong: the generator's own name is counted |
| `awaitEach`: `for await (const roll of stream)` | 1 / 1 / 2 | 1 / 1 / 2 | ok |
| `awaitOne`: `await repository.find()` | 1 / 0 / 1 | 1 / 0 / 1 | ok |
| `defaultParameters(roll, speed = new Speed(30), bonus = 2)` | 3 parameters | 4 | wrong: the identifier `Speed` in the default value is counted |
| `restParameters(first, ...others)` | 2 parameters | 2 | ok |
| `destructuredParameters({ pegasusRoll, bonus }, [first, second])` | 2 parameters | 2 | right number for the wrong reason: the object pattern counts 0, the array pattern counts its 2 elements (probes: `function objectParam({ roll, bonus })` = 0, `function arrayParam([first, second, third])` = 3) |
| `parameterOnly(chimeraRoll)` | 1 parameter | 1 | ok |
| `naturalArmor`: IIFE `(function () {...})()` in a `const` | 0 / 0 / 1 | 1 / 0 / 1 | the anonymous function is counted as a function |
| `promiseChain`: `.load().then(...).catch(...).finally(...)` | 1 / 0 / 4, message_chains 1 | 1 / 0 / 4, 1 | ok (`.catch()` is not a `catch` clause) |
| `callbackLambdas`: `.filter(...).map(...)` | 1 / 0 / 3 | 1 / 0 / 3 | ok |
| `labelledBreak`: `minotaurLoop: for ... for ... if ... break minotaurLoop` | 1 / 3 / 4 | 1 / 3 / 4 | ok |
| `fallthrough`: `case "dragon": case "fiend":`, `case "beast": {}`, `default:` | 1 / 3 / 4 | 1 / 4 / 5 | wrong by the rule: `default` +1 |
| `nestedTernary`: `a ? x : b ? y : z` | 1 / 2 / 3 | 1 / 2 / 3 | ok |
| `mixedLogic`: `(a && b) \|\| c` | 1 / 2 / 3 | 1 / 2 / 3 | ok |
| `bracelessIf`: `if ... else if ... else` without braces | 1 / 2 / 3 | 1 / 2 / 3 | ok |
| `optionalCatchBinding`: `catch { }` | 1 / 1 / 2 | 1 / 1 / 2 | ok |
| `templateLiteral`: `` `https://.../${alive ? "alive" : "dead"} // griffin` `` | 1 / 1 / 2, 0 comment lines | same | ok |
| `multiLineTemplate`: lines starting with `//` and `/*` inside a template | loc 6, rloc 6, 0 comment lines | same | ok |
| `regexLiteral`: `/basilisk[/*]+/`, `/[*/]$/` and one `\|\|` | 1 / 1 / 2, 0 comment lines | same | ok |
| `stringMarkers`: `"// cyclops is not a comment /* nor is ogre */"` | 0 comment lines, rloc 4 | same | ok |
| `commentKinds`: JSDoc (4 lines), block, line, two trailing comments | loc 9, comment 7, rloc 3 | same | ok |
| `lairKeeper`: object with `open(door) {}`, `close: function (door) {}`, `knock: (door) => ...`, `get doors() {}` | 2 / 0 / 4 | 3 / 0 / 4 | `close: function` is a function, `knock: (door) =>` is not |
| `defaultEncounter`: `export default function` | 1 / 0 / 1 | 1 / 0 / 1 | ok |

Classification from the parser source (`languages/javascript/JavascriptMetricMapping.kt`,
`JavascriptDefinition.kt`, `integration/metrics/calculators/`):

- Parameters are "every `identifier` node between the start of the function node and its first
  `statement_block`", minus the name of a `function_declaration`. That explains every wrong count:
  identifiers in default values count (`Speed`, also `CreatureUtil` in `ArmorClass.js` and `CreatureFacade`
  in `Creature.js`), the name of a generator and of a named function expression counts, an arrow function
  bound to a `const` counts the `const` name, an arrow function with an expression body has no
  `statement_block` and counts every identifier of its body, an object pattern has no `identifier` child
  and counts 0.
- Functions: `function_declaration`, `generator_function_declaration`, `method_definition`,
  `function_expression` and a `variable_declarator` whose value is an arrow function. So an arrow function
  is a function only when it is the direct value of a variable; as class field, object property or callback
  it is not, while an anonymous `function () {}` always is (probe: `items.map(function (item) {...})` gives
  2 functions, `items.map((item) => {...})` gives 1).
- A function nested in another one is counted in `number_of_functions` but gets no entry in the
  per-function statistics; its lines and its logic are folded into the outer function.
- Per-function complexity adds only what lies inside a body, so it starts at 0, while the file-level
  `complexity` adds 1 per function.

### Line counting

`loc`, `rloc` and `comment_lines` are right in all new `.js`, `.cjs`, `.mjs` files, including the trailing
comment line counted for both, comment markers in strings, template literals and regex literals, and a
blank line inside a template literal counted as code (probe). Two deviations: the shebang line (above) and
`CreatureCard.jsx`, rloc 19 expected / 20 reported: the line `{/* markup comment */}` counts as comment and
as code. The braces are JSX syntax, so the parser's 20 is the stricter reading and my count was wrong;
comment_lines 2 / 2 is right.

### Other files

| file | construct | expected | reported |
| --- | --- | --- | --- |
| `application/ui/SpeedBadge.jsx` | `export const SpeedBadge = ({ speedType, speed }) => ( <span>...</span> );` | 1 parameter, long_parameter_list 0 | 6 parameters, long_parameter_list 1 (false smell) |
| `application/ui/CreatureCard.jsx` | `export function CreatureCard({ creature, selected })` | 1 parameter | 0; functions 1, logic 2 (`&&`, ternary in the markup), complexity 4 are right |
| `application/extensions/LairGate.jsx` | `export function LairGate({ sides })` | 1 parameter | 0; loc 8, rloc 7, complexity 2 right |
| `application/extensions/lairGate.cjs`, `lairGate.mjs` | one function with one `if` | functions 1, complexity 2, rloc 8 / 7 | same, ok |
| `domain/model/Zentaurenhöhle.js` | class with a field and a method | loc 8, rloc 6, comment 1, functions 1, complexity 1 | same in the UTF-8 run; no node at all in the default run |
| `domain/model/ArmorClass.js` | `constructor(base, bonus, description = CreatureUtil.STANDARD_ARMOR_CLASS_DESCRIPTION)` | max parameters 3 | 4 |
| `domain/model/Creature.js` | `constructor(id, type = CreatureFacade.STANDARD_CREATURE_TYPE)` | max parameters 2 | 3 |
| `application/CreatureFacade.js` | `create(...)` with 8 parameters, 12 body lines, five chained `.set()` | long_parameter_list 1, long_method 1, message_chains 1 | same, ok |

## Dependency parser

Commands (all exit 0):

```
ccsh dependencyparser -nc $LANG_DIR -e "output,FINDINGS.md" -o output/dependency.cc.json                 # 36 files, 43 file edges, 89 leaves
ccsh dependencyparser ... --include-tests -o output/dependency-with-tests.cc.json                        # 37 files, 47 file edges
env LC_ALL=C.UTF-8 ccsh dependencyparser ... -o output/dependency-utf8.cc.json                           # 37 files, 43 edges, 90 leaves
```

43 file edges reported for 67 expected: 42 with the right target, 1 with a wrong target, 24 missing (one of
them the unused `Fightable` import in `CreatureUtil.js`, which a usage-based model rightly omits), no extra
edge. All 15 round-3 edges are found. On the old files the count (28) and the flags are those of
2026-09-06, and every edge the earlier report names is present.

| # | construct | expected edge(s) | found | verdict |
| --- | --- | --- | --- | --- |
| 1 | aliased import `import { CreatureEntity as Entity }`, `new Entity(id)` (`CreatureRepository.js`) | -> CreatureEntity.js | yes | ok |
| 2 | `import * as model`, `model.Creature` (`CreatureUtil.js`) | -> Creature.js | yes | ok |
| 3a | barrel `export { CreatureFacade } from` (`application/index.js`) | index -> CreatureFacade; Creature, PersistedCreatures, encounter.mjs -> index | yes, leaf `index.js#CreatureFacade` kind `reexport` with a leaf edge | ok |
| 3b | barrel `export * from "./CreatureUtil.js"` | index -> CreatureUtil; ArmorClass -> index | no, leaf `index.js#*` without an outgoing edge | missing (2) |
| 4 | `Centaur extends Creature`, `PersistedCreatures extends Creatures`, `CreatureRepository extends Repository` | 3 edges | yes | ok |
| 4b | `@implements {Fightable}` on `Creature` | Creature -> Fightable | no | missing; the language has no `implements` |
| 6a | type only in JSDoc (`@param {X}`, `@type {X}`, `@typedef {import("...").X}`) in `NoSuchCreatureException.js`, `Creature.js`, `Creatures.js`, `CreatureService.js`, `PersistedCreatures.js`, `CreatureFacade.js` | 13 edges | none | missing; comments, but `@typedef {import(...)}` is the JS idiom for a type-only import |
| 6b | only instantiated: `new CreatureEntity`, `new NoSuchCreatureException`, `new CreatureId` (`PersistedCreatures.js`) | 3 edges | yes | ok |
| 6c | only a static member: `CreatureFacade.STANDARD_CREATURE_TYPE`, `HitPoints.init`, `CreatureFacade.STABLE_NAME` | 4 edges | yes | ok |
| 7 | same simple name: `import { Creature }` + `import { Creature as CreatureDto } from "./dto/Creature.js"`, both used (`CreatureFacade.js`) | -> domain/model/Creature.js and -> application/dto/Creature.js | only the first | missing; probe with only the aliased import used: the edge goes to the first import's file (wrong target) |
| 9 | unused import `Fightable` (`CreatureUtil.js`) | none in a usage-based model | none | ok |
| 10 | `node:crypto`, `winston`, `node:test`, `node:assert` | no internal edge | none | ok; `const winston = require("winston")` is still a `variable` leaf of `creatureEntityMapper.cjs` with a leaf edge `toEntity -> winston` |
| 11 | test file `CreatureService.test.js` | skipped by default, 4 edges with `--include-tests` | exactly that | ok |
| 12 | `Dice.js` with `DiceRoll`, `Dice`, `rollD20`; `encounter.mjs` holding `EncounterRunner` | 3 leaves; leaf named after the declaration | yes | ok |
| r2 | dynamic `await import("../domain/model/Centaur.js")`, extension-less `from "../domain/model/Dice"` | 2 edges | yes | ok |
| r2 | `new URL("...", import.meta.url)` passed to `import()`; computed ``require(`./${REPOSITORY_MODULE}.js`)`` | 2 edges | no | missing, not statically resolvable |
| r2 | side-effect import `import "./logging.js"` (`bootstrap.js`) | bootstrap -> logging | no | missing |
| r2 | directory import `from "../../application"` (`CreatureStable.js`) | -> application/index.js | -> application/CreatureFacade.js | wrong target; probe: a name that exists only in `lib/index.js` gets no edge |
| r2 | `require("./mapping")` (`creatureEntityMapper.cjs`) | -> mapping/index.js | no | missing |
| r2 | `export * as model from`, `export { default } from` (`domain/index.js`) | 2 edges | no, leaves `domain/index.js#*` and `#default` without edges | missing |
| r3 | `SpeedType.FLYING` in a method (`EncounterResolver.js`) | -> SpeedType.js | yes | ok |
| r3 | default parameter value `speed = new Speed(30)` | EdgeCases -> Speed.js | yes (leaf `defaultParameters`) | ok |
| r3 | class static block `HitPoints.MAX_HIT_POINTS` | -> HitPoints.js | yes (leaf `StaticBlockLair`) | ok |
| r3 | template literal substitution `${CreatureId.name}` | -> CreatureId.js | yes (leaf `templateLiteral`) | ok |
| r3 | arrow function in a `const`: `(id) => new Centaur(id)` | -> Centaur.js | yes (leaf `arrowExpression`) | ok |
| r3 | generator `yield new Dice(sides).roll()` | -> Dice.js | yes (leaf `rollManticore`) | ok |
| r3 | IIFE in a module-level initialiser `new ArmorClass(10, 0)` | -> ArmorClass.js | yes (leaf `naturalArmor`) | ok |
| r3 | default import used in a getter `CreatureType.DRAGON` | -> CreatureType.js | yes (leaf `GetterLair`) | ok |
| r3 | private method `#count`: `SpeedType.WALKING` | -> SpeedType.js | yes (leaf `PrivateLair`) | ok |
| r3 | JSX: `creature instanceof Creature`, `<SpeedBadge ... />` used only as a tag (`CreatureCard.jsx`) | -> Creature.js, -> SpeedBadge.jsx | both | ok |
| r3 | `SpeedType.FLYING` inside JSX markup of an arrow component (`SpeedBadge.jsx`) | -> SpeedType.js | yes | ok |
| r3 | `require` in `.cjs`, `import` in `.mjs` and `.jsx` (`application/extensions/`) | 3 edges -> Dice.js | yes | ok |
| r3 | `Zentaurenhöhle.js` | one class leaf | leaf `Zentaurenhöhle` kind `class` in the UTF-8 run; file absent in the default run | ok / missing by locale |

False positives: no extra file edge. Extra leaves: `EncounterEdgeCases.js#default` next to
`#defaultEncounter` (one `export default function defaultEncounter`, two leaves), `CreatureType.js#default`
(from `export default CreatureType`), `creatureEntityMapper.cjs#winston` and `#REPOSITORY_MODULE`, the dead
`index.js#*`, `domain/index.js#*`, `domain/index.js#default`. Probe: a file whose only code is a top-level
statement (`console.log(new Creature())`) gets no leaf and no edge.

Cycles: expected 3, reported 2 (`Creature -> index -> CreatureFacade -> Creature` and `... -> CreatureService
-> Creature`, 5 edges flagged `isCyclic`); the cycles through `ArmorClass` and `CreatureUtil` are lost with
3b. Upward: `domain/model/Creature.js -> application/index.js` flagged, `ArmorClass.js -> index.js` missing
(3b). No new cycle and no new upward edge from the round-3 files, as expected.

Leaf kinds: `class` for classes (also for `Fightable` and `Creatures`, right, JS has no interface),
`variable` for the frozen-object enums (right), `function` for function declarations including generator,
async and the test function, `reexport` for barrel entries. Arrow functions and function expressions bound
to a `const` are `variable` (`arrowExpression`, `arrowBlock`, `asyncArrow`, `functionExpression`, the React
component `SpeedBadge`), while the function component `CreatureCard` is `function`.

Metrics: `incoming_dependencies` / `outgoing_dependencies` equal the reported edges (`EncounterEdgeCases.js`
8 outgoing) and inherit every miss above.

What the language offers: a real module system with relative specifiers, so resolution is exact once the
extension and `index.js` rules are applied. What CodeCharta resolves itself: alias to export name (wrong on
a name clash), barrels (only named `export { X } from`), directory imports (not done), JSDoc types (ignored).

## Domain language parser

Commands (exit 0 unless noted):

```
ccsh domainlanguageparser -nc $LANG_DIR -e "output,FINDINGS.md" -o output/domain.cc.json     # 37 files
env LC_ALL=C.UTF-8 ccsh domainlanguageparser ... -o output/domain-utf8.cc.json               # 38 files
... --comment-weight 10 / --string-weight 10 / --stop-word-level MINIMAL / AGGRESSIVE / --exclude-tests /
    --no-technical-stopwords / --ngrams 2                                                    # scratch runs, exit 0
... --string-weight 0                                                                        # exit 1
```

`lenses.domain.nodes` holds file nodes only (37, all of type `File`); there is no root or folder node, so
"the root node's word list" does not exist in the file. The frequencies below are the sum over all files.

Expected words, all 17 present: creature(126), speed(57), lair(31), hit(30), points(30), armor(28),
roll(24), stable(17), damage(16), encounter(13), initiative(11), centaur(10), dice(9), treasure(8),
hoard(8), cellar(2), dungeon(2). `cellar` and `dungeon` come only from comments: the strings `"cellar"`,
`"lair"`, `"dungeon"`, `"stable"` in `EncounterResolver.js` and `"No such creature in the dungeon: "` in
`NoSuchCreatureException.js` are not counted (see strings). Plurals are separate words: creatures(20),
speeds(17), centaurs(2).

Keyword leakage: none of `class`, `function`, `const`, `static`, `export`, `import`, `return`, `async`,
`await`, `yield`, `let`, `var`, `new`, `this`, `default`, `extends`, `typeof`, `null`, `true`, `false`,
`undefined`. `constructor(3)` appears, from the class name `ConstructorLair`. The shebang line contributes
nothing.

Technical words at MODERATE: `util`, `exception`, `service`, `test`, `mock`, `get/set/save/find/create` are
filtered; entity(17), repository(22), type(34), model(4), dto(3), facade(3), logger(3), winston(3),
module(6) stay (real identifiers). JSDoc tags are still counted as comment words: param(32), returns(10),
typedef(4), implements(2), and so are the JSDoc type names `promise`, `string`, `map`. `20(3)` is a number
counted as a word (`rollD20`). MINIMAL adds `get(27) save(18) find(15) set(15) create(12) service(10)
load(6) base(3) error(3) exception(3) index(3)`; AGGRESSIVE removes 16 words (`param type entity repository
value model dto facade init logger start template call method parameter parameters`); `--exclude-tests`
drops the test file node (`stable` 17 -> 13, `saved`, `saves` gone); `--ngrams 2` adds pairs such as
`hit points(24)`, `creature entity(9)`.

Identifier splitting:

| form | identifier | where | words found |
| --- | --- | --- | --- |
| camelCase | `walkingSpeed` | `Centaur.js` local const | walking, speed: ok |
| snake_case | `walking_speed`, `should_save_creature_to_the_stable` | test file | walking, speed; creature, stable: ok |
| SCREAMING_SNAKE | `MAX_HIT_POINTS` | `HitPoints.js` | max, hit, points: ok |
| PascalCase | `ArmorClass` | class | armor: ok |
| Acronym | `XPValue` | `CreatureEntity.js` field | xp, value: ok |
| Digit | `d20Roll` | `Dice.js` local const | d20, roll: ok |
| Digit | `rollD20` | `Dice.js` function | roll, 20: wrong, inconsistent with `d20Roll` |
| Kebab in string | `"centaur-stable"` | `CreatureFacade.js` static field | not counted (exported class); probe without `export`: centaur, stable |
| Unicode | `Zentaurenhöhle`, `rüstungsklasse` | class and field | zentaurenhöhle(3), rüstungsklasse(3): ok (UTF-8 run) |

Tracer words in the round-3 files (weights: identifier 3, comment 2, string 1):

| where | planted | expected | found |
| --- | --- | --- | --- |
| private field `#wyvernHoard` | wyvern | present | wyvern(3) |
| getter `get krakenTreasure()`, setter `set hydraTreasure(value)` | kraken, hydra | present | kraken(3), hydra(3) |
| generator `function* rollManticore` | manticore | present | manticore(3) |
| destructured parameter `{ pegasusRoll, bonus }`, rest `...others`, array pattern `[first, second]` | pegasus | present | pegasus(3), others(3), first, second |
| plain parameter `parameterOnly(chimeraRoll)` | chimera | present | absent: plain parameters are not extracted in `.js`, destructured and rest ones are |
| object key `sphinxDoor: 3`, `close:`, `knock:` | sphinx | present | absent; method shorthand `open()` and getter `doors` are counted |
| label `minotaurLoop:` | minotaur | present | absent |
| template literal `... // griffin`, multi-line template `// phoenix is text` | griffin, phoenix | present | absent in the exported functions; probe without `export`: griffin(1), phoenix(1) as strings |
| string `"// cyclops is not a comment /* nor is ogre */"` | cyclops, ogre | present | absent (exported); probe without `export`: cyclops(1), ogre(1) as string, not as comment |
| regex `/basilisk[/*]+/` | basilisk | absent | absent, ok |
| JSX text `<h2>Wandering centaur</h2>` (`CreatureCard.jsx`) | wandering | present | absent; probe without `export`: still absent, JSX text is not extracted |
| JSX attribute `title="Unicorn paddock"` | unicorn, paddock | present | absent (exported); probe without `export`: unicorn(1), paddock(1) |
| JSX comment `{/* markup comment */}` | markup | present | markup(2), comment(2) |

Comments and strings: the planted comments are counted with weight 2 and scale with `--comment-weight 10`
(93 words change, `cellar` 2 -> 10). Strings: a string literal is skipped when it has an `export_statement`
ancestor (`isImportString` in `StringLiteralExtractor.kt` treats every string below `import`/`export` as a
module path), so every string and template literal inside `export class`, `export function`,
`export const` is lost; a trailing `export { name }` keeps them (probe: `mermaid`, `lagoon` counted).
`--string-weight 10` changes only 8 words, all from the test file and the `.cjs` file. In a template
literal the code of a `${...}` substitution is tokenised as text (probe: `${chimeraRoll ? "alive" :
"dead"}` yields chimera(1), roll(1), and alive, dead twice). `--string-weight 0` exits 1 with
`IllegalArgumentException: --string-weight must be positive, got 0` and a full stack trace.

Test file handling: `CreatureService.test.js` is included by default (creature(7), stable(4), walking(4),
centaur(1), saves(1)) and removed by `--exclude-tests`. `test` itself is filtered. Right.

- German words (`Zentaurenhöhle.js`, UTF-8 run; in the default run the file is skipped and 0 of 7 appear):
  5 of 7 present: zentaurenhöhle(3) and rüstungsklasse(3) only as identifiers, verlies(2),
  trefferpunkte(2), kreatur(2). `größe` and `höhle` are missing: the string `"Größe der Höhle"` sits in an
  exported class and is dropped; in a probe without `export` it yields `hle(1)` and `der(1)`, `größe`
  vanishes completely. Words in comments and strings are matched with `[a-zA-Z]{3,}` (`SplitStage.kt`), so
  every umlaut cuts the word: the comment gives zentaurenh(2), hle(2), stungsklasse(2), geh(2), ren(2)
  instead of zentaurenhöhle, rüstungsklasse, gehören. Identifiers are split with a unicode-aware splitter
  and stay whole. German stop words leak: die(2), unter(2), dem(2), und(2), jeder(2), liegt(2), `der(1)` in
  the probe; only an English stop word list exists. `zu` is dropped as shorter than 3 letters.

## Changed since 2026-09-06

- No finding of the earlier report on the old files turned out false. The 28 file edges on the old files,
  the 2 cycles, the single upward edge, the dead `*` / `default` re-export leaves, the wrong target of the
  directory import, the same-name alias clash, the dropped strings in exported declarations, the JSDoc tags
  counted as words and `rollD20` -> `roll` + `20` are all reproduced.
- Leaf kinds are written in lower case now (`class`, `function`, `variable`, `reexport`); the earlier report
  quoted `CLASS`, `REEXPORT`.
- The domain lens holds file nodes only; the earlier report read the frequencies from a root node.
- The message for `--string-weight 0` changed from `require(stringWeight > 0)` to `--string-weight must be
  positive, got 0`; exit code 1 and the stack trace stayed.
- Frequencies moved with the new files (creature 109 -> 126, stable 13 -> 17).
- New on the old files: wrong parameter counts in `ArmorClass.js` (4 for 3) and `Creature.js` (3 for 2);
  the unified parser was not part of the earlier report.
- Not re-verified: the scratch tests of the earlier report for `export * as` and `export { default }`
  consumers, for `require("./lib/" + NAME + ".js")` and for `throw` filtered out of a string.

## Verdict

### Unified parser

- Missing:
  1. Per-function values for nested functions: `byInitiative` in `EncounterResolver.js` is counted in
     `number_of_functions` but has no entry in the parameters / complexity / rloc statistics. **Decision: accept (derived from Java).**
  2. Object-pattern parameters: `function CreatureCard({ creature, selected })` (`CreatureCard.jsx`) and
     `function LairGate({ sides })` report 0 parameters. **Decision: accept — one per parameter, whatever its form.**
  3. A file with a non-ASCII name (`Zentaurenhöhle.js`) is skipped without any message under a `POSIX`
     locale; with `LC_ALL=C.UTF-8` it is analysed correctly. **Decision: accept (derived from Java).**
- Wrong:
  1. Parameter counts wherever something other than plain names stands before the body:
     `export const SpeedBadge = ({ speedType, speed }) => (...)` 6 for 1 and a false `long_parameter_list`
     (`SpeedBadge.jsx`); `arrowExpression` 4 for 1, `arrowBlock` 3 for 2, `asyncArrow` 3 for 1,
     `function* rollManticore(sides)` 2 for 1, `defaultParameters(roll, speed = new Speed(30), bonus = 2)`
     4 for 3 (`EncounterEdgeCases.js`); `ArmorClass.js` constructor 4 for 3, `Creature.js` constructor 3 for 2. **Decision: accept — one per parameter, whatever its form.**
  2. `default:` counts as a decision: `resolve` in `EncounterResolver.js` logic 12 for 11, `fallthrough` 4
     for 3. **Decision: ignore (derived from Java).**
  3. Per-function complexity starts at 0 while file complexity adds 1 per function
     (`EncounterResolver.js`: min 0, mean 3.4, median 2 for expected 1, 3.5, 1.5). **Decision: ignore (derived from Java).**
  4. The shebang line of `EncounterEdgeCases.js` is code (rloc), not a comment line. **Decision: ignore.**
- Bad:
  1. What counts as a function is inconsistent: an arrow function is one as `const` value
     (`arrowExpression`, `clamp` in `safeRoll`) but not as class field (`FieldArrowLair.guard`), object
     property (`lairKeeper.knock`) or callback, while an anonymous `function` always is (`naturalArmor`
     IIFE, `lairKeeper.close`). **Decision: accept (derived from Java).**
  2. Short-circuit operators are inconsistent: `??` counts, `??=`, `||=`, `&&=` do not. **Decision: accept (derived from TypeScript).**
  3. `static { }` (`StaticBlockLair`) adds 1 complexity without being a function. **Decision: ignore (derived from Java).**
  4. `brokenChain`: a property access inside a chain does not break it, so `message_chains` counts calls
     that are not consecutive. **Decision: ignore (derived from TypeScript).**
  5. The README lists `.js .cjs .mjs` only, `.jsx` is analysed too; the progress line runs backwards
     without a terminal. **Decisions: accept — the README should list `.jsx`; ignore — the progress line.**
- Good: loc, rloc and comment lines in every `.js`, `.cjs`, `.mjs` and `.jsx` file, including comment
  markers in strings, template literals and regex literals, JSDoc, block, line and trailing comments, JSX
  comments; `for…of`, `for…in`, `for await`, `do … while`, labelled loops, nested ternaries, brace-less
  `if`, `catch` without binding, `.catch()` not taken for a `catch`; getters, setters, constructors, static
  and private methods, generators, async functions; rest parameters; `long_method`, `message_chains` with
  `?.`, `excessive_comments`; `&&`, ternary and `.map()` callbacks inside JSX markup.

### Dependency parser

- Missing:
  1. Every dependency expressed only in JSDoc, 13 edges (`Creature.js` `@type {Map<SpeedType, Speed>}`,
     `Creatures.js` `@typedef {import("../model/Creature.js").Creature}`, `CreatureFacade.js` `@param
     {Speed}`, ...), plus `@implements {Fightable}`. **Decision: ignore.**
  2. `export * from "./CreatureUtil.js"` (`application/index.js`), `export * as model from` and
     `export { default } from` (`domain/index.js`): dead re-export leaves, no edge from the barrel and none
     from its consumers (`ArmorClass.js`), so one upward edge and two of the three expected cycles are lost. **Decision: accept (derived from TypeScript).**
  3. Side-effect import `import "./logging.js"` (`application/bootstrap.js`). **Decision: accept (derived from TypeScript).**
  4. Directory resolution: `require("./mapping")` in `creatureEntityMapper.cjs` gets no edge. **Decision: accept.**
  5. `import { Creature as CreatureDto } from "./dto/Creature.js"` next to `import { Creature }`
     (`CreatureFacade.js`): the edge to `application/dto/Creature.js` is missing. **Decision: accept (derived from Java).**
  6. Not statically resolvable, acceptable: `new URL(..., import.meta.url)` in `CreatureLoader.js`, the
     computed `require` in `creatureEntityMapper.cjs`. **Decision: ignore (the report itself calls it acceptable).**
  7. `Zentaurenhöhle.js` is absent under a `POSIX` locale, without a message. **Decision: accept (derived from Java).**
- Wrong:
  1. `import { CreatureFacade } from "../../application"` (`CreatureStable.js`) points at
     `application/CreatureFacade.js` instead of `application/index.js`. **Decision: ignore (derived from TypeScript: an import through a barrel should point at the real target, which is what happens here).**
  2. With two imports of the same exported name the aliased one resolves to the first import's file
     (probe `import { Creature as CreatureDto } from "./b/Creature.js"` -> edge to `a/Creature.js`). **Decision: accept (derived from Java).**
- Bad:
  1. `export default function defaultEncounter` (`EncounterEdgeCases.js`) and `export default CreatureType`
     produce a second leaf `default`. **Decision: accept (derived from TypeScript).**
  2. `const winston = require("winston")` and `REPOSITORY_MODULE` are project leaves of
     `creatureEntityMapper.cjs`. **Decision: ignore.**
  3. Functions written as arrow or function expression (`arrowExpression`, `functionExpression`, the
     component `SpeedBadge`) have leaf kind `variable`. **Decision: accept (derived from TypeScript).**
  4. A module that only has top-level statements gets no leaf and no edge (probe). **Decision: accept (derived from Java).**
- Good: all 15 round-3 edges, including a JSX tag as the only use (`<SpeedBadge />`), uses inside a default
  parameter value, a static block, a template literal substitution, a generator, a getter, a private method
  and an IIFE; `.cjs`, `.mjs` and `.jsx` with `require` and `import`; aliased and namespace imports;
  named-barrel re-exports with the cycle and the upward edge flagged; inheritance; several declarations per
  file; test files skipped by default and added by `--include-tests`; third-party and `node:` modules
  without edges; no extra file edge.

### Domain language parser

- Missing:
  1. Every string and template literal inside an exported declaration: `"centaur-stable"`
     (`CreatureFacade.js`), `"No such creature in the dungeon: "` (`NoSuchCreatureException.js`),
     `"Größe der Höhle"` (`Zentaurenhöhle.js`), the terrain strings in `EncounterResolver.js`, all strings of
     `EncounterEdgeCases.js`, `title="Unicorn paddock"` in `CreatureCard.jsx`. **Decision: ignore (derived from TypeScript).**
  2. JSX text: `Wandering centaur` in `CreatureCard.jsx` yields nothing, exported or not. **Decision: accept (derived from TypeScript).**
  3. Plain parameters (`parameterOnly(chimeraRoll)`, `resolve(attacker, defender, ...)`), object literal
     keys (`sphinxDoor`) and labels (`minotaurLoop`). **Decisions derived from Java: accept — labels.** **Decisions: accept — plain parameters; accept — object literal keys.**
  4. A root or folder word list in the output. **Decision: ignore (derived from Java).**
  5. `Zentaurenhöhle.js` under a `POSIX` locale. **Decision: accept (derived from Java).**
- Wrong:
  1. Umlauts cut words in comments and strings: `Zentaurenhöhle` -> `zentaurenh` + `hle`, `Rüstungsklasse`
     -> `stungsklasse`, `gehören` -> `geh` + `ren`, `Höhle` -> `hle`, `Größe` -> nothing. The same words as
     identifiers stay whole. **Decision: accept (derived from Java).**
  2. JSDoc tags and type names count as words: param(32), returns(10), typedef(4), implements(2). **Decision: ignore (derived from Java).**
  3. `rollD20` -> `roll` + `20`, while `d20Roll` -> `d20` + `roll` (`Dice.js`). **Decision: ignore (derived from Java).**
  4. The code inside `${...}` of a template literal is counted as string text (probe). **Decision: accept.**
- Bad:
  1. German stop words leak (die, unter, dem, und, jeder, liegt); there is only an English list. **Decision: ignore (derived from Java).**
  2. Parameters are extracted only when destructured or rest (`pegasusRoll`, `others`), not when plain. **Decision: accept.**
  3. `--string-weight 0` ends in a stack trace. **Decision: accept (derived from Java).**
  4. Plural and singular are separate words (creature / creatures, speed / speeds). **Decision: ignore (derived from Java).**
- Good: all 17 shared words; no JavaScript keyword and no shebang word in the list; camel, snake, screaming,
  Pascal, acronym and unicode identifiers split correctly; private fields, getters, setters, generators,
  loop bindings; JSDoc, block, line and JSX comments with weight 2; comment markers inside strings stay
  strings; regex literals are ignored; test file included by default and removable; the stop word levels
  and `--ngrams 2` behave as documented.
