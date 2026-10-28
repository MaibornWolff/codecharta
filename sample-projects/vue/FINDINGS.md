# Vue

> Correction (2026-10-08, cross-check with one identifier per file): the digit split is attributed the wrong way
> round wherever this report mentions it. `d20Roll` gives `20` + `roll` (the leading `d` is dropped), `rollD20` gives
> `roll` + `d20`, `roll_d20` gives `roll` + `20`. Both identifiers sit in the same file here, so the file's word list
> could not tell them apart.

Report of 2026-10-08 (round 3). All numbers come from the outputs in `output/`, generated on that day with the
CLI built in `analysis/build/install`. The earlier report (2026-09-06) covered the dependency and the domain
parser only; every claim of it was checked again against the fresh output.

## Project
- Layout: a Vite + Vue 3 project. `package.json`, `tsconfig.json` (`paths: {"@/*": ["src/*"]}`), `vite.config.ts`,
  `src/main.ts`, `src/App.vue` and `src/de/sots/cellarsandcentaurs/{domain/model,domain/service,adapter/persistence,application,application/dto,ui,ui/pages}`.
  48 source files: 27 `.ts`, 16 `.vue`, 1 each of `.tsx`, `.mts`, `.cts`, `.mjs`, `.cjs`; plus 2 `.json`.
  Domain, service, adapter and application layers are `.ts`, the UI is `.vue`.
- Round 3 added 12 files (none is git-ignored, checked with `git check-ignore -v`):
  - `domain/service/EncounterResolver.ts` and `domain/service/EncounterResolver.vue`: the same class, byte for
    byte, once as a module and once inside `<script setup lang="ts">` followed by a 3-line template. Two files
    with one base name in one folder are common in Vue projects and turned out to be a stress construct of their own.
  - `domain/service/EncounterEdgeCases.vue`: `<!-- -->` before the script, `<script lang="ts">` with the Options
    API (`data`, `computed`, `watch`, `methods`), `<script setup lang="ts">` with the Composition API
    (`defineProps`, `defineEmits`, arrow and function-expression constants, `?.` / `??`, default and rest
    parameters, `async` / `await`, a generator, `do ... while` with a labelled `break`, `switch` fallthrough,
    comment markers in strings and in a template literal, `??=` / `||=` / `&&=`, `computed` / `watch`
    callbacks), a `<template>` with `v-if` / `v-else-if` / `v-else` / `v-for` / `v-show`, ternaries, `&&` and
    `||` in `{{ }}`, bound attributes and an inline `@click` handler, `<!-- -->` comments, `<component :is>`, and
    a `<style scoped>` with `/* */` comments and `//` in a URL.
  - `domain/service/EncounterEdgeCasesPug.vue` (`<template lang="pug">` with a `//-` comment) and
    `domain/service/EncounterEdgeCasesTsx.vue` (`<script lang="tsx">` with a render function); a file can hold
    only one template and one plain script, so these two forms need files of their own.
  - `ui/SpeedBadge.tsx`: a functional component that `EncounterEdgeCasesTsx.vue` uses only as a JSX tag.
  - German words: `domain/model/Zentaurenhöhle.ts` (class `Zentaurenhöhle`, field `rüstungsklasse`, the comment,
    the string) and `ui/ZentaurenhöhlePanel.vue` (the sentence as template text, the string as a `title` attribute).
  - Extension variants: `domain/service/encounterReport.mts` (imports `./EncounterResolver.js`),
    `domain/model/stableSize.cts` (`import x = require(...)`), `eslint.config.mjs`, `postcss.config.cjs`.
- Stress constructs of rounds 1 and 2 are unchanged: aliased import, namespace import, barrel `application/index.ts`,
  inheritance and interfaces, generic `Repository<T>`, type-only / `new`-only / static-member-only / decorator-only
  usage, `domain/model/Creature` and `application/dto/Creature`, unused import, externals, the spec file
  `domain/service/__tests__/CreatureService.spec.ts`, `Dice.ts` with three declarations, and the `.vue` forms
  (`@/` alias, default imports of `.vue`, `defineAsyncComponent`, global registration, two script blocks,
  `<script lang="js">`).
- Not available in TypeScript / Vue: a fully qualified reference without an import (closest: the inline
  `import('../model/Speed').Speed` types in `CreatureService.ts`), `goto`, pattern guards, operator overloads,
  preprocessor branches. `unless` / `until` / `guard` / `defer` / `select` do not exist.

## Expected values (all written before the parser ran)

### Round 3, written 2026-10-08 before any parser ran

Paths relative to `src/de/sots/cellarsandcentaurs/`. Counted by hand with the counting rule of the README.
Conventions I had to fix for this stack, stated here so they cannot be bent afterwards:

- A function is a `function` declaration, a class or object-literal method, a constructor, and an arrow function
  or function expression bound to a name (`const isWounded = () => ...`, `refill: function () {}`), because that
  is how functions are declared in Vue code. A callback passed inline is a lambda: +1 `complexity`, not a function.
- `?.`, `??` and `??=` are no branch (the rule does not list them). `||=` and `&&=` count like `||` and `&&`.
- Template: `v-if`, `v-else-if` and `v-for` count like `if`, `else if` and a loop; `v-else` and `v-show` add
  nothing; a ternary, `&&` or `||` inside `{{ }}`, a bound attribute or an inline handler counts +1.
- rloc of a function is the lines with code between its signature line and its closing line.
- loc / rloc / comment lines cover the whole `.vue` file: tags, template and style lines are code, `<!-- -->` and
  CSS `/* */` lines are comments.

#### Unified parser: `domain/service/EncounterResolver.ts` and `EncounterResolver.vue`

The class body is byte-identical in both files (the `.ts` says `export class`, the `.vue` holds it in
`<script setup lang="ts">` and adds a 3-line static template). Functions: `resolve` (5 parameters),
`describe` (1), `safeRoll` (1), `initiativeOrder` (1), nested `byInitiative` (2), `isEmpty` (0); one inline
lambda in `safeRoll`.

| metric | `.ts` | `.vue` | how |
| --- | --- | --- | --- |
| `logic_complexity` | 14 | 14 | `resolve` 11 (`if`, `else if`, `for`, `if`, `&&`, `while`, 3 `case`, ternary, `\|\|`), `safeRoll` 2 (lambda `if`, `catch`), `initiativeOrder` 1 (`if`) |
| `complexity` | 21 | 21 | 14 + 6 functions + 1 lambda |
| `number_of_functions` | 6 | 6 | lambda excluded |
| `loc` | 90 | 96 | `.vue`: + 2 script tags, 1 blank, 3 template lines |
| `rloc` | 72 | 77 | 90 - 6 blank - 12 comment-only; `.vue` + 2 script tags + 3 template lines |
| `comment_lines` | 13 | 13 | 6 doc + 3 line + 2 block + 1 trailing + 1 commented-out code |
| parameters per function max / min / mean / median | 5 / 0 / 1.67 / 1 | same | 5, 1, 1, 1, 2, 0 |
| complexity per function max / min / mean / median | 12 / 1 / 3.5 / 1.5 | same | `resolve` 12, `describe` 1, `safeRoll` 4 (with its lambda), `initiativeOrder` 2, `byInitiative` 1, `isEmpty` 1 |
| rloc per function max / min / mean / median | 35 / 1 / 9.5 / 5 | same | 35, 3, 10, 7, 1, 1 |
| `long_method` | 1 | 1 | `resolve`; `safeRoll` has exactly 10 |
| `long_parameter_list` | 1 | 1 | `resolve` |
| `message_chains` | 1 | 1 | `getType().toString().trim().toLowerCase().padEnd(12)`; the chain of 3 does not count |
| `excessive_comments` | 1 | 1 | 13 > 10 |

#### Unified parser: `domain/service/EncounterEdgeCases.vue` (182 lines)

| block | construct | functions | lambdas | logic | complexity |
| --- | --- | --- | --- | --- | --- |
| `<script lang="ts">` Options API | `data()` | 1 | | 0 | 1 |
| | `computed: { hoardSize(): number }` with a ternary | 1 | | 1 | 2 |
| | `watch: { treasureChest(newAmount, oldAmount) }` with an `if` | 1 | | 1 | 2 |
| | `methods: { isPlundered() }` with `\|\|` | 1 | | 1 | 2 |
| | `refill: function (amount) {}` | 1 | | 0 | 1 |
| | `monstrosityType: () => ...` | 1 | | 0 | 1 |
| `<script setup lang="ts">` | `firstHitPoints` arrow const with `?.`, `?.`, `??` | 1 | | 0 | 1 |
| | `isWounded` arrow const with an `if` | 1 | | 1 | 2 |
| | `lairDepth` function expression const | 1 | | 0 | 1 |
| | `gatherTreasure(base = 1, ...hoards)` with a `reduce` callback | 1 | 1 | 0 | 2 |
| | `async awaitEncounter` with `try` / `catch {}` and a `Promise` executor | 1 | 1 | 1 | 3 |
| | `function* wanderingCentaurs` with `for ... of` | 1 | | 1 | 2 |
| | `descend` with `do ... while`, `for`, `if`, labelled `break` | 1 | | 3 | 4 |
| | `terrainBonus` with a `switch`, 2 fallthrough `case`, `default` | 1 | | 2 | 3 |
| | `stableBanner` with `'/* not a comment */'`, a `//` inside a URL string and inside a template literal | 1 | | 0 | 1 |
| | `applyBonus` with `??=`, `\|\|=`, `&&=` | 1 | | 2 | 3 |
| | `computed(() => ...filter((creature) => ...))` | | 2 | 0 | 2 |
| | `watch(dungeonDepth, (depth) => { if ... })` | | 1 | 1 | 2 |
| `<template>` | `:class="woundedCount > 0 ? 'wounded' : 'rested'"` | | | 1 | 1 |
| | `v-if` / `v-else-if` / `v-else` | | | 2 | 2 |
| | `v-for` | | | 1 | 1 |
| | `{{ isWounded(creature) ? 'wounded' : 'healthy' }}` | | | 1 | 1 |
| | `{{ creature.getArmorClass() && terrainBonus(props.terrain ?? 'cellar') }}` | | | 1 | 1 |
| | `v-show="dungeonDepth > 1 \|\| hoardSize > 1"` | | | 1 | 1 |
| | `:disabled="isPlundered() \|\| woundedCount > 3"` | | | 1 | 1 |
| | `@click="dungeonDepth > 2 ? refill(1) : descend(dungeonDepth)"` | | | 1 | 1 |
| **file** | | **16** | **5** | **23** | **44** |

Sub totals: Options block 6 functions / logic 3 / complexity 9; setup block 10 functions, 5 lambdas / logic 11 /
complexity 26; template logic 9. Parameters per function: max 2 (`treasureChest`, `gatherTreasure`, `applyBonus`),
min 0. `long_method` 0 (`descend` has exactly 10), `long_parameter_list` 0, `message_chains` 0.
Lines: loc 182, 19 blank, `comment_lines` 29 (1 `<!-- -->` before the script, 1 doc, 5 line comments in the
Options block, 11 line comments and 1 trailing in the setup block, 1 one-line and 3 multi-line `<!-- -->` lines in
the template, 1 one-line, 1 trailing and 4 block lines in the style), rloc 136 (182 - 19 - 27 comment-only).
Lines 118 (`'/* not a comment */'`), 120 (`// not a comment either` inside a template literal) and 171
(`url(https://...)` in the style) are code, not comments. `excessive_comments` 1.

#### Unified parser: the other new files

| file | loc | rloc | comment_lines | functions | logic | complexity | note |
| --- | --- | --- | --- | --- | --- | --- | --- |
| `domain/service/EncounterEdgeCasesPug.vue` | 16 | 13 | 1 (`//-`) | 0 | 2 (`v-if`, ternary in `:label`) | 2 | `<template lang="pug">` |
| `domain/service/EncounterEdgeCasesTsx.vue` | 25 | 23 | 1 (`{/* */}`) | 1 (`setup`) | 2 (`&&`, ternary in JSX) | 5 (+ render arrow, `.map` callback) | `<script lang="tsx">` |
| `ui/SpeedBadge.tsx` | 13 | 10 | 1 | 1 (arrow const) | 1 | 2 | |
| `domain/model/Zentaurenhöhle.ts` | 10 | 7 | 1 | 2 (constructor, `istGepanzert`) | 0 | 2 | umlauts in file name and identifiers |
| `ui/ZentaurenhöhlePanel.vue` | 12 | 10 | 0 | 0 | 1 (`v-if`) | 1 | |
| `domain/service/encounterReport.mts` | 9 | 7 | 1 | 1 | 1 | 2 | extension variant |
| `domain/model/stableSize.cts` | 11 | 8 | 1 | 1 | 1 | 2 | extension variant |
| `eslint.config.mjs` (project root) | 11 | 8 | 1 | 1 | 1 | 2 | extension variant |
| `postcss.config.cjs` (project root) | 9 | 7 | 1 | 1 | 1 | 2 | extension variant |

Every one of the nine and the three `Encounter*` files above must have a node in `unified.cc.json`.

#### Dependency parser: expected new file edges (19)

| from | to | form |
| --- | --- | --- |
| `service/EncounterResolver.ts` | `model/Creature.ts` | `import type`, parameter types |
| `service/EncounterResolver.ts` | `model/Dice.ts` | import used only as a parameter type |
| `service/EncounterResolver.ts` | `model/SpeedType.ts` | enum member `SpeedType.WALKING` |
| `service/EncounterResolver.vue` | `model/Creature.ts`, `model/Dice.ts`, `model/SpeedType.ts` | the same three from `<script setup>` |
| `service/EncounterEdgeCases.vue` | `model/CreatureType.ts` | import in the plain `<script lang="ts">` block |
| `service/EncounterEdgeCases.vue` | `model/Creature.ts`, `model/HitPoints.ts` | imports in the `<script setup>` block |
| `service/EncounterEdgeCases.vue` | `service/EncounterResolver.vue` | default import of a `.vue` whose sibling `EncounterResolver.ts` has the same base name; used through `<component :is>`. Must not point to the `.ts` |
| `service/EncounterEdgeCasesPug.vue` | `model/SpeedType.ts` | |
| `service/EncounterEdgeCasesPug.vue` | `ui/CreatureBadge.vue` | cross-folder default import, used only as a pug tag |
| `service/EncounterEdgeCasesTsx.vue` | `model/Creature.ts` | `import type` in `<script lang="tsx">` |
| `service/EncounterEdgeCasesTsx.vue` | `service/EncounterResolver.ts` | extension-less `./EncounterResolver`, instantiated with `new`. Must not point to the `.vue` |
| `service/EncounterEdgeCasesTsx.vue` | `ui/SpeedBadge.tsx` | default import used only as the JSX tag `<SpeedBadge />` |
| `ui/SpeedBadge.tsx` | `model/Speed.ts` | `new Speed(...)` |
| `ui/ZentaurenhöhlePanel.vue` | `model/Zentaurenhöhle.ts` | umlaut in path and identifier |
| `service/encounterReport.mts` | `service/EncounterResolver.ts` | `from './EncounterResolver.js'` (ESM specifier naming the emitted file) |
| `model/stableSize.cts` | `model/HitPoints.ts` | `import HitPointsModule = require('./HitPoints')` |

No edges from `model/Zentaurenhöhle.ts`, `eslint.config.mjs` (only `eslint-plugin-vue`, external) and
`postcss.config.cjs`. No new cycle, no new upward edge (everything points from `service` / `ui` down to `model`,
or sideways inside `service`). Together with the earlier lists (74 edges without the unused `Fightable` import,
6 more from the spec with `--include-tests`) the project has 93 expected file edges, 99 with tests.

#### Domain language parser: expected words of the new files

| file | words that must appear | source |
| --- | --- | --- |
| `service/EncounterResolver.ts` | encounter, resolver, attacker, defender, roll, bonus, terrain, damage, charge, armor, creature(s), speed(s), walking, dice, initiative, rounds, hits, label | identifiers; plus dungeon, natural, misses, wears, step, simplified, chain, eight from comments; cellar, lair, stable from the `case` strings |
| `service/EncounterResolver.vue` | exactly the list of the `.ts` file | same script; `Encounter resolver` in the template adds nothing new |
| `service/EncounterEdgeCases.vue` | treasure, chest, lair, hoard, plundered, refill, monstrosity (Options block); dungeon, depth, wounded, hit, points, lair, gather, treasure, hoards, encounter, wandering, centaurs, descend, terrain, bonus, stable, banner, armor (setup block); dragon, cellar, empty, lonely, beast, roams, crowded, initiative, dice, guards, damage (template text and `<!-- -->`); dark (style comment) | |
| `service/EncounterEdgeCasesPug.vue` | burrowing, speed (script); beast, digging, hoard, resting, stable, digs, lair (pug text and `//-`) | |
| `service/EncounterEdgeCasesTsx.vue` | resolver, creatures (script); swimming, fiend, encounter, crowded, dungeon, quiet (JSX text and comment) | |
| `ui/SpeedBadge.tsx` | speed, badge, flying (identifiers); dragon, feet (JSX text) | |
| `model/Zentaurenhöhle.ts` | zentaurenhöhle, verlies, rüstungsklasse, trefferpunkte, kreatur, größe, höhle; also liegt, gehören, beschriftung, gepanzert. Must not appear: die, unter, dem, und, jeder, der, zu | identifier, comment, top-level string |
| `ui/ZentaurenhöhlePanel.vue` | zentaurenhöhle (script identifier); verlies, rüstungsklasse, trefferpunkte, kreatur (template text only); größe, höhle (`title` attribute only) | |
| `service/encounterReport.mts`, `model/stableSize.cts` | encounter, report, resolver / stable, size, centaur, count | identifiers |
| `eslint.config.mjs`, `postcss.config.cjs` | lair, rules, strict / dungeon, plugins, minified | identifiers |

The 17 expected root words stay as in the README. German words expected at the root: all seven.

### Rounds 1 and 2: expected file-level edges (unchanged from 2026-09-06)

Paths relative to `src/`, `cc/` = `de/sots/cellarsandcentaurs/`. `application/index.ts` is the barrel; an edge
to it is what the source literally says, whether the parser resolves it through to the re-exported file is
judged below.

| from | to |
| --- | --- |
| main.ts | App.vue (`vue` external) |
| App.vue | cc/ui/CreatureStable.vue (`@/` alias to a `.vue`) |
| cc/ui/CreatureStable.vue | application/index.ts (barrel), service/CreatureService.ts, persistence/PersistedCreatures.ts, persistence/CreatureRepository.ts, model/ArmorClass.ts, model/Speed.ts, model/Creature.ts (`import type`), model/CreatureType.ts (`import type`), ui/CreatureList.vue, ui/CreatureForm.vue |
| cc/ui/CreatureList.vue | ui/CreatureCard.vue, model/Creature.ts |
| cc/ui/CreatureCard.vue | model/Creature.ts (`import type`), model/HitPoints.ts, model/SpeedType.ts |
| cc/ui/CreatureForm.vue | model/CreatureType.ts, model/Speed.ts (both via `@/` alias) |
| cc/domain/model/Creature.ts | CreatureId.ts, CreatureType.ts, ArmorClass.ts, SpeedType.ts, Speed.ts, HitPoints.ts, Fightable.ts, Dice.ts, application/index.ts (upward) |
| cc/domain/model/ArmorClass.ts | application/index.ts (upward) |
| cc/domain/model/NoSuchCreatureException.ts | CreatureId.ts |
| cc/domain/model/Centaur.ts | Creature.ts, CreatureId.ts, CreatureType.ts, Speed.ts, SpeedType.ts, Roams.ts (decorator) |
| cc/domain/service/Creatures.ts | model/Creature.ts, model/CreatureId.ts |
| cc/domain/service/CreatureService.ts | Creatures.ts, model/Creature.ts, model/CreatureId.ts, model/Speed.ts and model/SpeedType.ts (inline `import('../model/Speed').Speed` types, expected to be missed; `loglevel` external) |
| cc/domain/service/__tests__/CreatureService.spec.ts | CreatureService.ts, Creatures.ts, model/Creature.ts, model/CreatureId.ts, model/Speed.ts, model/SpeedType.ts (only with `--include-tests`; `vitest` external) |
| cc/adapter/persistence/CreatureRepository.ts | CreatureEntity.ts (aliased `as Entity`), Repository.ts |
| cc/adapter/persistence/PersistedCreatures.ts | CreatureRepository.ts, CreatureEntity.ts, service/Creatures.ts, model/Creature.ts, model/CreatureId.ts, model/NoSuchCreatureException.ts, application/index.ts (upward) |
| cc/application/CreatureFacade.ts | service/CreatureService.ts, model/Creature.ts, dto/Creature.ts, model/CreatureId.ts, CreatureType.ts, HitPoints.ts, Speed.ts, SpeedType.ts, ArmorClass.ts (`uuid` external) |
| cc/application/CreatureUtil.ts | model/Creature.ts (namespace import), model/Fightable.ts (unused import, an edge is defensible because the import statement exists) |
| cc/application/index.ts | CreatureFacade.ts, CreatureUtil.ts |

Round 2 (added before the second run; each row is the only way the `from` file depends on the `to` file):

| from | to | form |
| --- | --- | --- |
| cc/CreatureSpotlight.vue | ui/CreatureCard.vue | `defineAsyncComponent(() => import('./ui/CreatureCard.vue'))`, relative path into a sub folder |
| cc/ui/CreatureViewer.vue | ui/CreatureList.vue | default import used only as `<component :is="CreatureList">` |
| cc/ui/CreatureViewer.vue | ui/CreatureForm.vue | `defineAsyncComponent(() => import('./CreatureForm.vue'))`, same folder (control for the row above) |
| cc/ui/CreatureRoster.vue | model/CreatureType.ts | import in the plain `<script lang="ts">` block of a file that has both blocks |
| cc/ui/CreatureRoster.vue | model/HitPoints.ts | import in the `<script setup lang="ts">` block of the same file |
| main.ts | ui/CreatureBadge.vue | default import for the global registration `app.component('CreatureBadge', CreatureBadge)` |
| cc/ui/CreatureCard.vue | ui/CreatureBadge.vue | `<CreatureBadge>` in the template without an import, same folder |
| App.vue | ui/CreatureBadge.vue | `<CreatureBadge>` in the template without an import, different folder |
| cc/ui/pages/StablePage.vue | ui/CreatureStable.vue | `import CreatureStable from '../CreatureStable.vue'`, relative path into the parent folder |
| cc/ui/CreatureNote.vue | model/SpeedType.ts | `<script lang="js">` (Options API) importing a `.ts` file |

No edges expected from `ui/CreatureBadge.vue` (no imports). Whether the global registration is credited to
`main.ts` only or also to the templates that use the tag is a judgement call; both template rows are listed so the
result shows what the parser does.

No edges expected from: CreatureId.ts, CreatureType.ts, SpeedType.ts, Speed.ts, HitPoints.ts, Fightable.ts,
Roams.ts, Dice.ts, CreatureEntity.ts (`uuid` external), Repository.ts, dto/Creature.ts, vite.config.ts (all external).

Expected cycles: `Creature -> index -> CreatureFacade -> CreatureService -> Creature`,
`Creature -> ArmorClass -> index -> CreatureFacade -> Creature`, `index -> CreatureUtil -> Creature -> index`.
Expected upward edges: `model/Creature.ts -> application/index.ts`, `model/ArmorClass.ts -> application/index.ts`,
`persistence/PersistedCreatures.ts -> application/index.ts` (depending on levels).

### Corrections to my own expectations (found after the run, values above left untouched)

- "No new upward edge" was wrong: `service/EncounterEdgeCasesTsx.vue -> ui/SpeedBadge.tsx` points from `domain` up
  to `ui` by my own construction. The parser flags it `isPointingUpwards`, which is right.
- `ui/ZentaurenhöhlePanel.vue`: I expected `zentaurenhöhle` from the script. The identifier is only imported and
  instantiated there, and the domain parser counts declarations, not usages (the same holds for every other file).
  The expectation was wrong, not the parser.
- `model/Zentaurenhöhle.ts`: I put the string `Größe der Höhle` into an `export const`. Strings inside any
  `export` statement are dropped (see domain parser), so this file cannot show how umlauts in strings are split.
  A scratch file had to answer that.
- `service/EncounterEdgeCasesTsx.vue`: I gave no `long_method` value. By my own rule `setup` has 11 lines with
  code, so the expected value is 1.
- `safeRoll` in `EncounterResolver` was shortened to exactly 10 lines with code before the expected values were
  written, so that only `resolve` is a long method.

## Unified parser

Command (exit 0, 0.2 s):

```
LC_ALL=C.UTF-8 ccsh unifiedparser -nc $LANG_DIR -e "output,FINDINGS.md" -o output/unified.cc.json
ccsh unifiedparser ... -o output/unified-posix-locale.cc.json     (no locale set, as in the README)
```

- 48 of 48 source files have a node with metrics: `.ts`, `.vue`, `.tsx`, `.mts`, `.cts`, `.mjs`, `.cjs`. The two
  `.json` files are named in the log as unsupported. Log: `WARN No .gitignore found at root level, excluding common
  build folders as fallback` (the project folder has none; the one of the repository is not consulted).
- Without a UTF-8 locale (`LANG` / `LC_ALL` unset, JVM `sun.jnu.encoding=ANSI_X3.4-1968`) the run reports 46 files:
  `model/Zentaurenhöhle.ts` and `ui/ZentaurenhöhlePanel.vue` are missing from the output, without a warning and
  with exit 0. The main outputs of all three parsers were therefore produced with `LC_ALL=C.UTF-8`; the
  `*-posix-locale.cc.json` files keep the other result.
- How a `.vue` file is measured (`VueDefinition`, `VueScriptExtractor`, `LanguageRegistry`): a regex takes the
  content of the **first** `<script>` element, trims it, and parses it with the **JavaScript** grammar and the
  JavaScript metric mapping, whatever `lang` says. Nothing else of the file is read.

### `EncounterResolver`

| metric | expected `.ts` | reported `.ts` | verdict | expected `.vue` | reported `.vue` | verdict |
| --- | --- | --- | --- | --- | --- | --- |
| `logic_complexity` | 14 | 15 | wrong: `default:` counts (`switch_default`) | 14 | 15 | same |
| `complexity` | 21 | 22 | wrong, follows from the row above | 21 | 22 | same |
| `number_of_functions` | 6 | 6 | ok | 6 | 6 | ok |
| `loc` | 90 | 90 | ok | 96 | 90 | wrong: script content only |
| `rloc` | 72 | 72 | ok | 77 | 72 | wrong: script content only |
| `comment_lines` | 13 | 13 | ok | 13 | 13 | ok |
| parameters max / min / mean / median | 5 / 0 / 1.67 / 1 | 5 / 0 / 1.6 / 1 | max, min ok; mean covers 5 functions, the nested `byInitiative` (2 parameters) is left out | 5 / 0 / 1.67 / 1 | 11 / 1 / 4.4 / 3 | wrong |
| complexity per function max / min / mean / median | 12 / 1 / 3.5 / 1.5 | 12 / 0 / 3.4 / 2 | different definition, see below | same | 12 / 0 / 3.4 / 2 | same as `.ts` |
| rloc per function max / min / mean / median | 35 / 1 / 9.5 / 5 | 35 / 1 / 11.2 / 7 | max, min ok; mean and median cover 5 functions | same | 35 / 1 / 11.2 / 7 | same as `.ts` |
| `long_method` | 1 | 1 | ok (`safeRoll` with exactly 10 is not long) | 1 | 1 | ok |
| `long_parameter_list` | 1 | 1 | ok | 1 | 1 | ok |
| `message_chains` | 1 | 1 | ok | 1 | 1 | ok |
| `excessive_comments` | 1 | 1 | ok | 1 | 1 | ok |

- Per-function statistics: `number_of_functions` is 6, but the statistics hold 5 values. The reported numbers fit
  exactly when the nested `byInitiative` has no entry of its own (parameters 5, 1, 1, 1, 0; rloc 35, 3, 10, 7, 1).
  A scratch file with one function nested in another shows the same (2 functions, one value).
- Complexity per function is not "1 + branches": the reported values fit `resolve` 12 (11 branches + `default`),
  `describe` 0, `safeRoll` 3 (`if`, `catch`, + 1 for the lambda), `initiativeOrder` 2 (`if`, + 1 for the nested
  function), `isEmpty` 0. A function does not count itself, but every function or lambda inside it counts. The sum
  over the functions (17) therefore is neither `logic_complexity` (15) nor `complexity` (22). That `max` equals my
  12 is a coincidence of `default` (+1) and the missing self count (-1).
- `.vue` parameters: the script is parsed as JavaScript, where `identifier` is the parameter node. In
  `resolve(attacker: Creature, defender: Creature, roll: number, bonus: number, terrain: string)` that gives 11
  instead of 5; `describe(creature: Creature)` gives 3, `isEmpty(): boolean` gives 1. A scratch file with the same
  five parameters untyped reports 5. Every typed function in a `.vue` file is affected
  (`ui/CreatureStable.vue`: `onCreate(type: CreatureType, walkingSpeed: Speed)` 4, `hoardOf(creature: Creature)` 3).
- All other `.vue` totals equal the `.ts` totals here only because this class happens to survive the JavaScript
  grammar. `EncounterEdgeCases.vue` shows what happens when it does not.

### `EncounterEdgeCases.vue`

Reported for the file: loc 36, rloc 29, `comment_lines` 6, `number_of_functions` 3, `logic_complexity` 2,
`complexity` 6, all per-function complexities 0. Expected: loc 182, rloc 136, `comment_lines` 29, 16 functions,
logic 23, complexity 44. The 36 lines are the content of the first `<script>` block; the `<script setup>` block
(100 lines, 10 functions), the template and the style contribute nothing.

To see what each construct would give, every construct was also run alone in the scratchpad: once as the first
script block of a `.vue` file and once as a `.ts` file (functions / logic / complexity).

| construct | expected | in the sample file | alone in a `.vue` | same code in a `.ts` | verdict |
| --- | --- | --- | --- | --- | --- |
| `data()` | 1 / 0 / 1 | counted | 1 / 0 / 1 | 1 / 0 / 1 | ok |
| `computed: { hoardSize(): number { ternary } }` | 1 / 1 / 2 | function lost | 0 / 1 / 1 | 1 / 1 / 2 | wrong in `.vue`: a return type on an object-literal method loses the method (untyped: 1 / 1 / 2) |
| `watch: { treasureChest(newAmount: number, oldAmount: number) { if } }` | 1 / 1 / 2 | `if` lost | 1 / 0 / 1 | 1 / 1 / 2 | wrong in `.vue`: typed parameters lose the body (untyped: 1 / 1 / 2) |
| `methods: { isPlundered(): boolean { \|\| } }` | 1 / 1 / 2 | function lost | 0 / 1 / 1 | 1 / 1 / 2 | wrong in `.vue` |
| `refill: function (amount: number) {}` | 1 / 0 / 1 | counted | 1 / 0 / 1, 2 parameters | 1 / 0 / 1 | ok, parameter count wrong in `.vue` |
| `monstrosityType: () => ...` | 1 / 0 / 1 | not a function | 0 / 0 / 1 | 0 / 0 / 1 | missing in both: an arrow function is a function only as the value of a `const`, not of a property |
| everything in `<script setup>` (rows below) | 10 / 11 / 26 | **0 / 0 / 0** | 5 / 5 / 17 for the block as a whole | 10 / 11 / 26 | missing: second script block is not read; as a first block half of it is lost |
| `firstHitPoints = (creature?: Creature) => a?.b()?.c ?? 0` | 1 / 0 / 1 | not read | 1 / 2 / 3, 6 parameters | 1 / 1 / 2, 0 parameters | `??` counts as a branch (not in the README rule); in `.ts` an optional parameter is not a parameter |
| `isWounded` arrow const with `if` | 1 / 1 / 2 | not read | 1 / 1 / 2, 4 parameters | 1 / 1 / 2 | ok in `.ts` |
| `lairDepth = function (levels: number)` | 1 / 0 / 1 | not read | 1 / 0 / 1, 3 parameters | 1 / 0 / 1 | ok in `.ts` |
| `gatherTreasure(base: number = 1, ...hoards: number[])` + callback | 1 / 0 / 2 | not read | 1 / 0 / 2, 6 parameters, `long_parameter_list` 1 | 1 / 0 / 2, 2 parameters | ok in `.ts`, false smell in `.vue` |
| `async function awaitEncounter(...): Promise<number>` with `try` / `catch {}` | 1 / 1 / 3 | not read | 0 / 0 / 1 | 1 / 1 / 3 | wrong in `.vue`: function and `catch` lost |
| `function* wanderingCentaurs` with `for ... of` | 1 / 1 / 2 | not read | 1 / 1 / 2, 6 parameters | 1 / 1 / 2 | ok in `.ts` |
| `descend`: `do ... while`, `for`, `if`, labelled `break` | 1 / 3 / 4 | not read | 1 / 3 / 4 | 1 / 3 / 4, rloc 10, not long | ok |
| `terrainBonus`: `switch`, 2 fallthrough `case`, `default` | 1 / 2 / 3 | not read | 1 / 3 / 4 | 1 / 3 / 4 | wrong: `default` counts |
| `stableBanner`: `'/* not a comment */'`, `//` in a URL string and in a template literal | 1 / 0 / 1, 1 comment line | not read | 1 / 0 / 1 | 1 / 0 / 1, comment lines right | ok |
| `applyBonus`: `??=`, `\|\|=`, `&&=` | 1 / 2 / 3 | not read | 1 / 0 / 1, 5 parameters | 1 / 0 / 1 | missing: logical assignment is no branch, although `\|\|`, `&&` and `??` are |
| `computed(() => ...filter((c) => ...))`, `watch(x, (d) => { if })` | 0 / 1 / 4 | not read | 0 / 1 / 4 | 0 / 1 / 4 | ok |
| template: `:class` ternary, `v-if`, `v-else-if`, `v-for`, two `{{ }}` expressions, `v-show` with `\|\|`, `:disabled` with `\|\|`, `@click` ternary | logic 9 | 0 | 0 each; a template-only `.vue` has loc 0 | - | missing: the template is not read |
| `<!-- -->` before the script and in the template, `/* */` in `<style>` | 11 comment lines | 0 | 0 | - | missing |
| template and style lines | 23 + 15 lines | 0 | 0 | - | missing: not in loc / rloc |

- The `.ts` total of the setup block (10 / 11 / 26) equals my expectation only because three deviations cancel:
  `??` +1, `default` +1, `||=` and `&&=` -2.
- The setup block as the first block of a scratch `.vue` also reports `long_parameter_list` 3 and
  `message_chains` 1; the `.ts` file reports 0 and 0, which is right.

### The other new files

| file | expected loc / rloc / comments / functions / logic / complexity | reported | verdict |
| --- | --- | --- | --- |
| `service/EncounterEdgeCasesPug.vue` | 16 / 13 / 1 / 0 / 2 / 2 | 5 / 4 / 0 / 0 / 0 / 0 | script only; `<template lang="pug">`, its `v-if`, its ternary and the `//-` comment are not read |
| `service/EncounterEdgeCasesTsx.vue` | 25 / 23 / 1 / 1 / 2 / 5 | 23 / 22 / 1 / 1 / 2 / 5, `long_method` 1 | functions, logic, complexity ok (JSX `&&`, ternary, `.map` callback are read: the JavaScript grammar knows JSX); loc without the two tag lines; the `{/* */}` line counts as code and as comment |
| `ui/SpeedBadge.tsx` | 13 / 10 / 1 / 1 / 1 / 2 | 13 / 10 / 1 / 1 / 1 / 2 | ok |
| `model/Zentaurenhöhle.ts` | 10 / 7 / 1 / 2 / 0 / 2 | 10 / 7 / 1 / 2 / 0 / 2 | ok with a UTF-8 locale, absent without |
| `ui/ZentaurenhöhlePanel.vue` | 12 / 10 / 0 / 0 / 1 / 1 | 3 / 2 / 0 / 0 / 0 / 0 | script only, `v-if` not read; absent without a UTF-8 locale |
| `service/encounterReport.mts` | 9 / 7 / 1 / 1 / 1 / 2 | 9 / 7 / 1 / 1 / 1 / 2 | ok |
| `model/stableSize.cts` | 11 / 8 / 1 / 1 / 1 / 2 | 11 / 8 / 1 / 1 / 1 / 2 | ok |
| `eslint.config.mjs` | 11 / 8 / 1 / 1 / 1 / 2 | 11 / 8 / 1 / 1 / 1 / 2 | ok |
| `postcss.config.cjs` | 9 / 7 / 1 / 1 / 1 / 2 | 9 / 7 / 1 / 1 / 1 / 2 | ok |

### Line counting
- `.ts`, `.tsx`, `.mts`, `.cts`, `.mjs`, `.cjs`: loc, rloc and `comment_lines` match the hand count in every new
  file. Doc, line, block and trailing comments are right; a trailing comment line counts for both; comment markers
  in strings and template literals are not comments.
- `.vue`: loc is the number of lines between the first `<script ...>` and its `</script>`. Examples: `src/App.vue`
  1 of 11 lines, `ui/CreatureBadge.vue` 1 of 7, `ui/CreatureList.vue` 19 of 32, `ui/CreatureRoster.vue` 3 of 17
  (first block only), `EncounterEdgeCases.vue` 36 of 182. A component without a script has loc 0 (scratch file).
  The treemap area of a Vue UI layer is therefore the size of its first scripts, not of its files.

### Other files
- `ui/CreatureList.vue`: `number_of_functions` 0; the computed `lairCount(): number` is lost (return type on an
  object-literal method under the JavaScript grammar).
- `ui/CreatureCard.vue`: logic 2 comes from two `??`.
- `adapter/persistence/CreatureEntity.ts`: `constructor(id?: string)` reports 0 parameters; an optional parameter
  is not counted (`required_parameter` only). Its `??` gives logic 1.
- `application/CreatureFacade.ts`: 8 parameters, `long_parameter_list` 1, `message_chains` 1 (`new Map().set()` x 5),
  `long_method` 1: right. `max_rloc_per_function` is 15, by hand 14: with a parameter list spread over several
  lines the line `): Creature {` is counted as body.
- `application/dto/Creature.ts`, `domain/model/Creature.ts`: constructors with parameter properties count as
  functions with the right parameter numbers (3 and 2).
- `domain/service/__tests__/CreatureService.spec.ts`: analysed like any file, 1 function (the nested
  `should_save_creature_to_the_stable`), complexity 2 with the `describe` callback.

## Dependency parser

Commands (all exit 0):

```
LC_ALL=C.UTF-8 ccsh dependencyparser -nc $LANG_DIR -e "output,FINDINGS.md" -o output/dependency.cc.json
LC_ALL=C.UTF-8 ccsh dependencyparser ... --include-tests -o output/dependency-with-tests.cc.json
LC_ALL=C.UTF-8 ccsh dependencyparser ... --include-tests --verbose -o output/dependency-verbose.cc.json
ccsh dependencyparser ... -o output/dependency-posix-locale.cc.json     (no locale set)
```

84 file edges, 55 declaration leaves, 89 leaf edges, 5 cycles in 1 strongly connected component, 12 edges with
`isCyclic`, 3 with `isPointingUpwards`. `dependency.cc.json` and `dependency-with-tests.cc.json` are byte-identical.
Without a UTF-8 locale the two umlaut files and the edge between them are missing, silently.

Expected 93 file edges (99 with tests). Found 81 of them, plus 2 edges that skip the barrel and 1 edge to the wrong
file.

### Round 3 constructs

| construct | expected edge(s) | found | verdict |
| --- | --- | --- | --- |
| `service/EncounterResolver.ts`: `import type { Creature }`, `Dice` used only as a parameter type, `SpeedType.WALKING` | 3 edges to `model/` | all 3 | ok |
| `service/EncounterResolver.vue`: the same in `<script setup lang="ts">` | 3 edges | all 3 | ok, identical to the `.ts` file |
| `service/EncounterEdgeCases.vue`: import in `<script lang="ts">` | `-> model/CreatureType.ts` | found | ok |
| same file: imports in `<script setup lang="ts">` | `-> model/Creature.ts`, `-> model/HitPoints.ts` | found | ok, both script blocks are read |
| same file: `import EncounterResolver from './EncounterResolver.vue'`, used in `<component :is>` | `-> service/EncounterResolver.vue` | `-> service/EncounterResolver.ts` | **wrong target**: `.vue` and `.ts` with one base name become the same node path (the extension is stripped from the node and from the import); `EncounterResolver.vue` has 0 incoming edges |
| `service/EncounterEdgeCasesTsx.vue`: `import { EncounterResolver } from './EncounterResolver'` | `-> service/EncounterResolver.ts` | found | ok (right here, but by the same collision) |
| same file: `import type { Creature }` in `<script lang="tsx">` | `-> model/Creature.ts` | found | ok |
| same file: `import SpeedBadge from '../../ui/SpeedBadge'`, used only as `<SpeedBadge />` in JSX | `-> ui/SpeedBadge.tsx` | found, `isPointingUpwards` | ok; a default import of a `.tsx` across folders resolves |
| `service/EncounterEdgeCasesPug.vue`: `import { SpeedType }` | `-> model/SpeedType.ts` | found | ok |
| same file: `import CreatureBadge from '../../ui/CreatureBadge.vue'`, used as a pug tag | `-> ui/CreatureBadge.vue` | not found | **missing**: static default import of a `.vue` from another folder (same failure as `App.vue`, `StablePage.vue`) |
| `ui/SpeedBadge.tsx`: `new Speed(...)` | `-> model/Speed.ts` | found | ok |
| `ui/ZentaurenhöhlePanel.vue`: `import { Zentaurenhöhle } from '../domain/model/Zentaurenhöhle'` | `-> model/Zentaurenhöhle.ts` | found (UTF-8 locale) | ok |
| `service/encounterReport.mts`: `from './EncounterResolver.js'` | `-> service/EncounterResolver.ts` | found | ok, the `.js` specifier is resolved |
| `model/stableSize.cts`: `import HitPointsModule = require('./HitPoints')`, used as `HitPointsModule.HitPoints` | `-> model/HitPoints.ts` | not found | **missing**: import-equals is not an import. A scratch `.cts` with a normal `import { }` gets its edge, a scratch `.ts` with `import x = require()` does not, so it is the construct, not the extension |
| `model/Zentaurenhöhle.ts`, `eslint.config.mjs`, `postcss.config.cjs` | no edges | none | ok |

### Rounds 1 and 2 constructs, checked again

| # | construct | expected edge(s) | found | verdict |
| --- | --- | --- | --- | --- |
| 1 | aliased import `{ CreatureEntity as Entity }` (`CreatureRepository.ts`) | `-> CreatureEntity.ts` | found | ok |
| 2 | namespace import `* as model`, used as `model.Creature` (`CreatureUtil.ts`) | `-> model/Creature.ts` | found | ok |
| 3 | barrel imported by `.ts` files (`Creature.ts`, `ArmorClass.ts`, `PersistedCreatures.ts`) | `-> application/index.ts` | found, leaf edges to the reexport leaves, `index.ts -> CreatureFacade.ts` / `CreatureUtil.ts` | ok |
| 3b | barrel imported by `ui/CreatureStable.vue` | `-> application/index.ts` | `-> CreatureFacade.ts` and `-> CreatureUtil.ts`, no edge to `index.ts` | wrong: a `.vue` skips the barrel, a `.ts` stops at it |
| 4 | `Centaur extends Creature`, `Creature implements Fightable`, `PersistedCreatures implements Creatures` | 3 edges | found | ok |
| 5 | `CreatureRepository extends Repository<Entity>` | `-> Repository.ts`, `-> CreatureEntity.ts` | found | ok |
| 6 | type position only, `new` only, static member only, decorator only (`@Roams`) | as listed for round 1 | all found | ok |
| 7 | `Creature` and `Creature as CreatureDto` in `CreatureFacade.ts` | `-> model/Creature.ts`, `-> dto/Creature.ts` | only the first; `dto/Creature.ts` has 0 incoming edges | missing |
| 8 | inline `import('../model/Speed').Speed` types (`CreatureService.ts`) | `-> Speed.ts`, `-> SpeedType.ts` | not found | missing |
| 9 | unused import `Fightable` (`CreatureUtil.ts`) | none | none | ok |
| 10 | `vue`, `uuid`, `loglevel`, `vitest`, `vite`, `eslint-plugin-vue`, `Map`, `Promise` | no internal edge | none | ok |
| 11 | `__tests__/CreatureService.spec.ts` | none by default, 6 with `--include-tests` | none in both runs, the file has no node | missing: its only declaration is nested in the `describe` callback. A scratch spec with a top-level `export function` gets a node and its edge with `--include-tests` |
| 12 | `Dice.ts`: `Dice`, `DiceRoll`, `rollD20`; `Creature.rollInitiative()` calls `rollD20()` | 3 leaves, `Creature.ts -> Dice.ts` | found | ok |
| V1 | `.vue` importing a `.vue` of the same folder with the binding named like the file | 4 edges in `ui/` | found | ok (by name, see below) |
| V2 | `@/` alias to `.ts` files (`CreatureForm.vue`) | 2 edges | found | ok |
| V3 | `@/` alias to a `.vue` (`App.vue -> ui/CreatureStable.vue`); relative `../CreatureStable.vue` (`ui/pages/StablePage.vue`) | 2 edges | neither; both files have 0 outgoing edges | missing |
| V4 | `.ts` default-importing a `.vue` (`main.ts -> App.vue`, `main.ts -> ui/CreatureBadge.vue`) | 2 edges | neither | missing |
| V5 | `defineAsyncComponent(() => import('./ui/CreatureCard.vue'))` (`CreatureSpotlight.vue`, `CreatureViewer.vue`) | 2 edges | found | ok, also across folders |
| V6 | `<CreatureBadge>` in a template without an import, after `app.component(...)` | `CreatureCard.vue -> CreatureBadge.vue` (same folder), `App.vue -> CreatureBadge.vue` (other folder) | only the same-folder one | half: found by name in the same folder, not by the registration |
| V7 | `<script lang="js">` importing a `.ts` (`CreatureNote.vue`), two script blocks (`CreatureRoster.vue`) | 3 edges | found | ok |

Scratch project for the `.vue -> .vue` rule (11 files, one form each): an edge appears for a same-folder import
whose binding is named like the file, for the same import without any tag, with `<component :is>`, and for a tag
without any import in the same folder. No edge for a same-folder import with another binding name
(`import CardView from './Card.vue'`), for any static import from another folder (with tag, without tag, kebab
tag), for a tag from another folder, or for a `.ts` importing a `.vue` (same or other folder). A dynamic
`import('../a/Card.vue')` from another folder gives the edge. So a static default import of a component is never
resolved by its path; what looks like success is a match of the tag or binding name against a component of the
same folder (`VueAnalyzer`: template tags and imported names become simple type names).

### False positives, cycles, upward edges
- One false edge: `EncounterEdgeCases.vue -> EncounterResolver.ts` (wrong twin). No edge to an external package,
  none for the unused import.
- Cycles: 5 reported, the 12 `isCyclic` edges are exactly the expected cycles of round 1 plus
  `Creatures -> Creature -> index -> CreatureFacade -> CreatureService -> Creatures`. No new cycle, as expected.
- Upward: `model/Creature.ts -> application/index.ts`, `model/ArmorClass.ts -> application/index.ts` and, new and
  right, `service/EncounterEdgeCasesTsx.vue -> ui/SpeedBadge.tsx`. `persistence/PersistedCreatures.ts ->
  application/index.ts` is not flagged because the computed levels put `adapter` (2) above `application` (1).
- `incoming_dependencies` / `outgoing_dependencies` match the edge list.

### Leaf kinds
- `class`, `interface`, `enum`, `function` (`rollD20`, `Roams`, `encounterReport`, `stableSize`, `lairRules`,
  `dungeonPlugins`), `variable` (`SpeedTypeWalking`, `beschriftung`, `app`), `reexport` for the barrel: right.
- Every `.vue` is one leaf of kind `class` named after the file. There is no component kind.
- `ui/SpeedBadge.tsx#SpeedBadge` is `variable`; it is an arrow-function component.
- Default exports are inconsistent: `export default CreatureType` gives a second `enum` leaf
  `src_de_sots_cellarsandcentaurs_domain_model_CreatureType_DEFAULT_EXPORT`, `export default SpeedBadge` a second
  `variable` leaf `..._ui_SpeedBadge_DEFAULT_EXPORT`, `export default defineConfig(...)` a `reexport` leaf
  `vite_config_DEFAULT_EXPORT`, and `export default [...]` in `eslint.config.mjs` a `reexport` leaf named `default`.
- `module.exports = ...` in `postcss.config.cjs` and `export = stableSize` produce no leaf of their own.

### What the language offers and what CodeCharta resolves itself
ES modules name the file in every import, so there is nothing to guess for `.ts`. CodeCharta has to resolve the
`@/` alias from `tsconfig.json` (works for `.ts` targets), barrels (works from `.ts`, skipped from `.vue`),
extensions in specifiers (`.js` for a `.ts` works; stripping `.vue` makes `X.vue` and `X.ts` one node) and the
default export of a `.vue` file (not resolved by path). Template tags are matched by name only.

### Extensions

| extension | unified | dependency | domain |
| --- | --- | --- | --- |
| `.vue` | first `<script>` only, as JavaScript | whole file, all script blocks, in their own language | first `<script>` only, as JavaScript |
| `.ts` | analysed | analysed | analysed |
| `.tsx` (`ui/SpeedBadge.tsx`) | analysed | analysed | analysed |
| `.mts` (`service/encounterReport.mts`) | analysed | analysed, edge found | analysed |
| `.cts` (`model/stableSize.cts`) | analysed | analysed (leaf), import-equals edge missing | analysed |
| `.mjs` (`eslint.config.mjs`) | analysed | analysed (2 leaves) | analysed |
| `.cjs` (`postcss.config.cjs`) | analysed | analysed (1 leaf) | analysed |
| `.json` | named as unsupported | skipped silently | skipped silently |

- Known gaps of the name rules (`analysis/analysers/parsers/DependencyParser/docs/name-resolution/typescript.md`): listed
  per probe in `regression/vue/known-gaps.md`.

## Domain language parser

Commands (exit 0 unless noted):

```
LC_ALL=C.UTF-8 ccsh domainlanguageparser -nc $LANG_DIR -e "output,FINDINGS.md" -o output/domain.cc.json
... --stop-word-level MINIMAL / AGGRESSIVE   -o output/domain-minimal.cc.json / domain-aggressive.cc.json
... --exclude-tests / --no-technical-stopwords / --ngrams 2
... --string-weight 10 / --comment-weight 10
... --string-weight 0      -> exit 1: "IllegalArgumentException: --string-weight must be positive, got 0"
ccsh domainlanguageparser ... -o output/domain-posix-locale.cc.json     (no locale set: 46 files)
```

48 files processed, 48 nodes with a word list, 184 distinct words. **The lens holds file nodes only**: there is
no word list for the root or for any folder, so "at the root node" below is the sum over all files, computed by me.
Each word carries `frequency` and `tfidf`.

### Expected words (sum over all files)

| word | frequency | | word | frequency |
| --- | --- | --- | --- | --- |
| creature | 82 | | lair | 11 |
| centaur | 7 | | initiative | 17 |
| cellar | 3 | | encounter | 16 |
| dungeon | 9 | | treasure | 2 |
| armor | 37 | | hoard | 8 |
| hit | 28 | | stable | 13 |
| points | 28 | | dice | 9 |
| speed | 75 | | roll | 24 |
| damage | 26 | | | |

All 17 appear. Top of the list: creature 82, speed 75, id 42, armor 37, hit 28, points 28, creatures 26, damage 26.

### Expected words of the new files

| file | found | not found | reason |
| --- | --- | --- | --- |
| `service/EncounterResolver.ts` | all listed identifiers and comment words (damage 9, armor 7, creatures 7, roll 6, attacker 5, defender 5, bonus 5, terrain 5, ...) | cellar, lair, stable | the `case` strings sit inside `export class`; strings inside an `export` statement are dropped |
| `service/EncounterResolver.vue` | resolver, resolve, damage 9, armor 7, encounter 5, ...; cellar 1, lair 1, stable 1 | creature, dice, rounds, value, left, right; attacker / defender / bonus / terrain only 2 each (from the comments) instead of 5, roll 3 instead of 6, creatures 4 instead of 7 | parsed as JavaScript: parameters are never extracted, the field `private rounds: number` is lost; the class is not exported here, so its strings count. The word list of the same code differs in 15 words between `.ts` and `.vue` (6 only in `.ts`, 3 only in `.vue`, 6 with another frequency) |
| `service/EncounterEdgeCases.vue` | lair 2, dragon 1, plundered 1 (strings of the first block), encounter / edge / cases 1 (the `name` string), words of my line comments | every identifier of the Options block (`treasureChest`, `lairName`, `hoardSize`, `isPlundered`, `refill`, `monstrosityType`, `newAmount`); everything of `<script setup>`; all template text; the `<!-- -->` and style comments | object-literal keys and methods are not declarations; second block, template and style are not read |
| `service/EncounterEdgeCasesPug.vue` | burrowing, speed | beast, digging, hoard, resting, stable, digs, lair | pug template not read |
| `service/EncounterEdgeCasesTsx.vue` | resolver; swimming, fiend (from the `{/* */}` comment) | creatures; encounter, crowded, dungeon, quiet (JSX text) | JSX text is not extracted |
| `ui/SpeedBadge.tsx` | speed 9, badge, flying | dragon, feet (JSX text) | JSX text is not extracted; `strong` 3 appears instead (see leakage) |
| `service/encounterReport.mts` | encounter, report, resolver | dungeon (string in an exported function) | export rule |
| `model/stableSize.cts` | stable, size, centaur, count | - | |
| `eslint.config.mjs`, `postcss.config.cjs` | lair, rules / dungeon, plugins | strict, minified (the parameters `isStrict`, `isMinified`) | JavaScript parameters are never extracted |

### Keyword and technical-word leakage
- No language keyword appears (`class`, `const`, `function`, `string`, `number`, `readonly`, `async`, `export`,
  `import`, `type` are absent). `ArmorClass` gives `armor` only.
- Technical words at `MODERATE` that stay: id 42, value 18, entity 9, max 9, target 9, facade 6, repository 6,
  standard 6, prefix 6, dto 3, persisted 3, and from the new files file 16, one 25, first 10, method 6, js 4
  (from `CommonJS` and `.js` in comments), mjs, cjs, tsx, jsx 2 each. `AGGRESSIVE` removes dto, facade, value,
  types, entity, repository, init, method. `MINIMAL` adds common, create, service, find, save, base, exception,
  error. `--no-technical-stopwords` additionally adds config, name, util, temporary.
- `strong` 3 in `ui/SpeedBadge.tsx`: the lower-case JSX tag `<strong>` is taken as an identifier
  (`jsx_opening_element`). `props` 3 in the same file is the parameter; it is a keyword only for `.vue`.
- The Vue keyword list removes domain words in every `.vue` file: a scratch `.vue` with `treasureStore`,
  `modelState`, `routeKey`, `lairFilters`, `hoardActions` yields only treasure, lair, hoard; the same lines in a
  `.ts` yield store, model, state, route, key, filters, actions as well. `store`, `state`, `model`, `route`, `key`,
  `filters`, `actions`, `name`, `data`, `created`, `updated` are listed as Vue keywords.
- 2-letter words pass (`id`, `xp`, `js`), and `20` from `rollD20`.

### Identifier splitting

| form | identifier | where | words found |
| --- | --- | --- | --- |
| camelCase | `walkingSpeed` | `CreatureFacade.ts`, `CreatureForm.vue` | walking, speed |
| snake_case | `walking_speed` | spec | walking, speed |
| SCREAMING_SNAKE | `MAX_HIT_POINTS` | `HitPoints.ts` | max, hit, points |
| PascalCase | `ArmorClass` | `ArmorClass.ts` | armor |
| Acronym | `XPValue` | `Centaur.ts` | xp, value |
| Digit | `d20Roll` | `Dice.ts` | d20, roll |
| Digit | `rollD20` | `Dice.ts` | roll, 20 |
| Kebab in string | `'centaur-stable'` | `CreatureFacade.ts` | nothing (string inside `export class`); in the spec `'centaur-1'` gives centaur |
| Umlauts | `Zentaurenhöhle`, `rüstungsklasse`, `istGepanzert` | `Zentaurenhöhle.ts` | zentaurenhöhle, rüstungsklasse, ist, gepanzert |

### Comments and strings
- Weights are visible: identifier 3, comment 2, string 1; `--comment-weight 10` and `--string-weight 10` raise
  exactly the words from comments and strings. A weight of 0 is rejected.
- The four planted comments are counted in `Creature.ts`, `HitPoints.ts`, `CreatureFacade.ts` and `CreatureUtil.ts`
  (`//`, `/* */`, `/** */`, also the `{/* */}` JSX comment). `<!-- -->`, pug `//-` and CSS comments of a `.vue`
  are not.
- Strings: a string is dropped when it has an `export` statement among its ancestors
  (`StringLiteralExtractor.isImportString`). Since almost every class, function and constant of a module is
  exported, that removes nearly all strings: `'No such creature in the dungeon: '`
  (`NoSuchCreatureException.ts`), `'centaur-stable'`, `'Natural Armor'`, the `case` strings of
  `EncounterResolver.ts`, `'no encounter in the dungeon'` (`encounterReport.mts`), `'Größe der Höhle'`
  (`Zentaurenhöhle.ts`). Scratch file: `const plain = 'treasure hoard'` and a string returned by a non-exported
  function are counted, `export const exported = 'dragon lair'` and every string in an `export class` are not.
  Counted in the sample: `'walking'` (non-exported const in `CreatureService.ts`), `'CreatureBadge'` and `'#app'`
  (`main.ts`), `'centaur-1'` and `'CreatureService'` (spec), the `case` strings of the non-exported class in
  `EncounterResolver.vue`, and `'dragon lair'`, `'plundered lair'`, `'EncounterEdgeCases'` in
  `EncounterEdgeCases.vue` although they sit inside `export default defineComponent({...})` (not explained;
  a scratch `.vue` with a clean `export class` has its strings dropped).
- `'should_save_creature_to_the_stable'` as a string yields nothing (scratch file confirms): the word pattern
  `\b[a-zA-Z]{3,}\b` finds no boundary inside snake_case. The function of that name yields creature and stable.
- Template text, attribute values and JSX text are never extracted: `Cellars and Centaurs` (`App.vue`),
  `Hit points:` (`CreatureCard.vue`), `Flying dragon` (`SpeedBadge.tsx`).

### `.vue` script handling
- Only the first `<script>` block is read: `ui/CreatureRoster.vue` gives roster, types and not `fullHitPoints`;
  `EncounterEdgeCases.vue` gives nothing of its setup block.
- It is parsed as JavaScript whatever `lang` says. Lost in the sample: `hitPoints` in `ui/CreatureCard.vue` and
  `selectedType` in `ui/CreatureForm.vue` (the declaration after `defineProps<{...}>()` / `defineEmits<{...}>()`),
  `lairCount` in `ui/CreatureList.vue`, the field and all parameters in `EncounterResolver.vue`.
- Function parameters are not extracted for JavaScript at all (scratch `params.js`: `hunt(quarry, omen)`,
  `(prey) => prey`, `dig(tunnel)` give hunt, stalk, den, dig only; the `.ts` twin also gives quarry, omen, prey,
  tunnel). That holds for `.js`, `.mjs`, `.cjs` and every `.vue`.
- Empty word lists: `src/App.vue`, `ui/CreatureBadge.vue`, `ui/CreatureList.vue`, `ui/CreatureNote.vue`,
  `ui/CreatureViewer.vue`, `ui/pages/StablePage.vue`. `ui/ZentaurenhöhlePanel.vue` has one word (lair).

### Test file handling
- Included by default: `__tests__/CreatureService.spec.ts` has creature 7, creatures 3, speed 3, stable 3,
  walking 3, assert 2, centaur 1. `--exclude-tests` processes 47 files and removes exactly these
  (creature 82 -> 75, speed 75 -> 72, stable 13 -> 10, walking 25 -> 22, creatures 26 -> 23, centaur 7 -> 6, assert
  gone). `test`, `spec`, `describe`, `expect`, `mock`, `should`, `save` do not leak; `assert` comes from the
  `// Assert` comment.

### German words

| word | frequency | from | verdict |
| --- | --- | --- | --- |
| zentaurenhöhle | 3 | class name | ok as identifier; in the comment it becomes `zentaurenh` 2 + `hle` 2 |
| rüstungsklasse | 3 | field name | ok as identifier; in the comment `stungsklasse` 2 (the `R` is dropped) |
| verlies | 2 | comment | ok |
| trefferpunkte | 2 | comment | ok |
| kreatur | 2 | comment | ok |
| größe | 0 | string | missing: dropped by the export rule. Scratch file with a counted string `'Größe der Höhle'`: `der` 1, `hle` 1, no `größe` |
| höhle | 0 | string | missing, same; `hle` instead |

- 5 of 7 appear, 2 of them only because they are also identifiers. Identifiers keep umlauts (scratch:
  `größeDerHöhle` gives größe, der, höhle). Comments and strings are cut at every non-ASCII letter by the word
  pattern `[a-zA-Z]`: `gehören` becomes `geh` + `ren`, `über` becomes `ber`.
- German stop words leak, all five: die 2, dem 2, und 2, unter 2, jeder 2 (also liegt 2, ist 3). There is only an
  English stop word list. `zu` is too short for the pattern.
- `ui/ZentaurenhöhlePanel.vue`: none of the seven; template text and the `title` attribute are not read.
- Without a UTF-8 locale both files are skipped and all German words are gone from the result.

### Other options
- `--ngrams 2` works on identifiers: hit points 24, walking speed 18, xp value 6, take damage 6,
  encounter resolver 6, initiative order 6, safe roll 6.
- `tfidf` is the same number for a word in every file, whatever its frequency there: creature is 33.004 in
  `CreatureSpotlight.vue` and in `CreatureId.ts`. Not looked into further.

## Changed since 2026-09-06
- Domain: the lens no longer has word lists for folders and the root. The earlier report read the expected words
  "at the root node" (44 nodes for 30 files); now there are exactly as many nodes as files.
- Domain: words carry a `tfidf` value now.
- Domain: the earlier report said strings are counted "only at module top level" and never inside a top-level
  function. Fresh output and scratch files give a different rule: a string is dropped when it is inside an `export`
  statement, wherever that is; a string in a non-exported function is counted. Whether the behaviour changed or the
  earlier description was imprecise cannot be told from here.
- Dependency: leaf keys are short now (`CreatureCard`, earlier `src.de.sots.cellarsandcentaurs.ui.CreatureCard`),
  kinds are lower case (`class`), `vite.config.ts` has `vite_config_DEFAULT_EXPORT` (earlier
  `vite_config.vite_config_DEFAULT_EXPORT`).
- Dependency: the Vue extraction now lives in the tree-sitter excavation site (`languages/vue`), the results on
  the old files are unchanged: the same 67 file edges and 71 leaf edges, 5 cycles, the same 12 cyclic edges, the
  same upward flags, `--include-tests` still byte-identical. Every "missing" and "wrong" of the earlier report
  still holds: `App.vue`, `StablePage.vue` and `main.ts` without edges to `.vue` files, `dto/Creature.ts` without
  incoming edge, inline import types, the barrel skipped from `CreatureStable.vue`, global registration not
  followed, binding name must equal the file name.
- Dependency, sharper than before: the same-folder success is a name match, and with a `.ts` of the same base
  name beside the `.vue` it now demonstrably hits the wrong file.
- Domain, unchanged: first script block only, parsed as JavaScript, `hitPoints` / `selectedType` / `lairCount`
  lost, object-literal keys not counted, snake_case strings yield nothing, `rollD20` gives `20`, weight 0 rejected.
- Unified parser: not part of the earlier report; everything above is new.
- New on old files: `CreatureEntity.ts` optional constructor parameter not counted; `CreatureFacade.ts`
  `max_rloc_per_function` one too high; `.vue` loc is the first script only.

## Verdict

### Unified parser
- Missing: the `<template>` of a `.vue` is not read. `EncounterEdgeCases.vue`: `v-if`, `v-else-if`, `v-for`, the
  ternaries, `&&` and `||` in `{{ }}`, `:class`, `:disabled`, `v-show` and `@click` add 0 complexity (expected 9);
  `EncounterEdgeCasesPug.vue` and `ZentaurenhöhlePanel.vue` likewise. **Decision: ignore.**
- Missing: only the first `<script>` block is read. `EncounterEdgeCases.vue`: the whole `<script setup>` block
  (10 functions, complexity 26) is absent; the file reports 3 functions and complexity 6 instead of 16 and 44. **Decision: accept.**
- Missing: template, style and tag lines are not in loc / rloc / `comment_lines`. `EncounterEdgeCases.vue` 36 of
  182 lines, `App.vue` 1 of 11, a component without script 0. `<!-- -->` and CSS comments are never comments. **Decision: accept.**
- Wrong: `<script lang="ts">` is parsed with the JavaScript grammar. Parameters: `resolve(...)` in
  `EncounterResolver.vue` 11 instead of 5, mean 4.4 instead of 1.6, `onCreate` in `CreatureStable.vue` 4 instead
  of 2; false `long_parameter_list` in scratch runs of `gatherTreasure`, `wanderingCentaurs`, `applyBonus`.
  Functions lost: `hoardSize(): number`, `isPlundered(): boolean` (`EncounterEdgeCases.vue`), `lairCount(): number`
  (`CreatureList.vue`), `async function awaitEncounter(): Promise<number>` with its `catch` (scratch). Body lost:
  the `if` in `treasureChest(newAmount: number, oldAmount: number)`. **Decision: accept — the `lang` attribute should select the grammar.**
- Wrong: `default:` counts as a branch (`EncounterResolver.ts` and `.vue`: logic 15 instead of 14, complexity 22
  instead of 21; `terrainBonus`). **Decision: ignore (derived from Java).**
- Wrong: files with a non-ASCII name are dropped without a message when the JVM has no UTF-8 locale
  (`Zentaurenhöhle.ts`, `ZentaurenhöhlePanel.vue`; 46 instead of 48 files, exit 0). **Decision: accept (derived from Java).**
- Wrong: an optional parameter is not a parameter (`CreatureEntity.ts` `constructor(id?: string)`: 0;
  `firstHitPoints(creature?: Creature)`: 0). **Decision: accept (derived from TypeScript).**
- Bad: per-function statistics leave out nested functions although `number_of_functions` counts them
  (`byInitiative` in `EncounterResolver.ts`: 6 functions, 5 values), and complexity per function counts the
  functions inside a function but not the function itself (`isEmpty` 0, `initiativeOrder` 2), so it matches
  neither `complexity` nor `logic_complexity`. **Decisions derived from Java: accept — nested functions without per-function entry; ignore — per-function complexity without the own +1.**
- Bad: `??` is a branch, `??=`, `||=`, `&&=` are not (`applyBonus`: 0). An arrow function is a function as the value
  of a `const` but not as the value of an object property (`monstrosityType: () => ...`). **Decisions derived from Java: accept — an arrow function counts as a function only as a `const` value.** **Decision derived from TypeScript: accept — `??=`, `||=`, `&&=` should count like their long forms.**
- Bad: `max_rloc_per_function` counts the closing line of a multi-line parameter list (`CreatureFacade.create`: 15,
  by hand 14). **Decision: ignore.**
- Good: plain `.ts`, `.tsx`, `.mts`, `.cts`, `.mjs`, `.cjs` files. loc, rloc, comment lines, functions, complexity
  apart from `default`, `long_method` (boundary at 10 right), `long_parameter_list`, `message_chains` (5 calls yes,
  3 no), comment markers in strings, generators, `do ... while`, labelled `break`, callbacks, constructors with
  parameter properties, JSX in a `<script lang="tsx">` all match the hand count.

### Dependency parser
- Wrong: `EncounterEdgeCases.vue -> EncounterResolver.ts` instead of `-> EncounterResolver.vue`
  (`import EncounterResolver from './EncounterResolver.vue'`): `X.vue` and `X.ts` in one folder share one node
  path. The `.vue` gets no incoming edge. **Decision: accept.** **Fixed 2026-10-23 (typescript.md, Vue: a default import of a `.vue` file names its component).**
- Missing: a static default import of a `.vue` is not resolved by its path. `EncounterEdgeCasesPug.vue ->
  ui/CreatureBadge.vue`, `App.vue -> ui/CreatureStable.vue` (`@/` alias), `ui/pages/StablePage.vue ->
  ui/CreatureStable.vue` (`../`), `main.ts -> App.vue`, `main.ts -> ui/CreatureBadge.vue`. Only a component of the
  same folder whose tag or binding name equals its file name is linked, and a dynamic `import()`. **Decision: accept.** **Fixed 2026-10-23 (typescript.md, Vue components).**
- Missing: `import HitPointsModule = require('./HitPoints')` in `model/stableSize.cts` gives no edge. **Decision: accept (derived from TypeScript).** **Fixed 2026-10-26 (typescript.md: `import x = require` binds the module).**
- Missing: `CreatureFacade.ts -> application/dto/Creature.ts` (`import { Creature as CreatureDto }` beside a
  `Creature` from another file). **Decision: accept (derived from Java).** **Fixed 2026-10-26 (typescript.md: a renamed import binds its local name).**
- Missing: `--include-tests` changes nothing: `__tests__/CreatureService.spec.ts` has no top-level declaration, so
  it has no node and its 6 edges are absent. **Decision: accept (derived from Java).** **Fixed 2026-10-23 (typescript.md decision 3: its top-level code is a leaf `CreatureService_spec_script` with the 6 edges).**
- Missing: inline `import('../model/Speed').Speed` types in `CreatureService.ts`; global registration
  (`App.vue -> ui/CreatureBadge.vue`). **Decision: accept (derived from Java).** **Fixed 2026-10-26 (typescript.md decision 15 and Vue tag rule 4).**
- Wrong: `ui/CreatureStable.vue` skips the barrel (`-> CreatureFacade.ts`, `-> CreatureUtil.ts`), `.ts` files stop
  at `application/index.ts`. **Decision: accept (derived from TypeScript: every import through a barrel should point at the real target, so the `.ts` behaviour is the one to change).** **Superseded by typescript.md decision 8: `.vue` and `.ts` both point at `application/index.ts`, whose re-export leaves point on.**
- Wrong: files with a non-ASCII name are dropped silently without a UTF-8 locale. **Decision: accept (derived from Java).**
- Bad: default-export leaves differ by form and language (`..._DEFAULT_EXPORT` of kind `enum` / `variable` /
  `reexport`, `default` in `.mjs`); `PersistedCreatures.ts -> application/index.ts` is not flagged upward. **Decision derived from TypeScript: accept — synthetic default-export leaves.** **Decision: ignore — the missing upward flag; that edge goes away once imports through a barrel point at the real target (derived from TypeScript).**
- Good: every `.ts` construct of the reference (alias, namespace import, barrel, inheritance, generics, type-only,
  `new`-only, static member, decorator), `import type`, both script blocks of a `.vue`, `lang="ts"`, `"tsx"` and
  `"js"` blocks, a `.tsx` used only as a JSX tag, the `.js` specifier in a `.mts`, the `@/` alias to `.ts`, umlauts
  in paths and identifiers, no edges to externals, cycles and upward flags. `EncounterResolver.vue` has exactly the
  edges of `EncounterResolver.ts`.

### Domain language parser
- Missing: there is no word list for folders or the root any more; the 17 expected words can only be checked by
  summing the files. **Decision: ignore (derived from Java).**
- Missing: of a `.vue` only the first `<script>` is read. No template text (`ZentaurenhöhlePanel.vue`: none of the
  German sentence; `EncounterEdgeCases.vue`: none of `Encounter in the dragon lair`, ...), no attribute values, no
  `<!-- -->`, pug or CSS comments, nothing of a second script block. Six `.vue` files have an empty word list. **Decisions: accept — every script block should be read; accept — template text, attribute values and comments should be words.**
- Wrong: strings inside an `export` statement are dropped, which is nearly every string of a module:
  `'No such creature in the dungeon: '`, `'centaur-stable'`, `'Größe der Höhle'`, the `case` strings in
  `EncounterResolver.ts`. The same class without `export` in `EncounterResolver.vue` has them counted. **Decision: ignore (derived from TypeScript).**
- Wrong: the `.vue` script is parsed as JavaScript and JavaScript parameters are never extracted.
  `EncounterResolver.vue` loses creature, dice, rounds, value, left, right and most of attacker, defender, bonus,
  terrain compared with the identical `EncounterResolver.ts`; `CreatureCard.vue` loses `hitPoints`,
  `CreatureForm.vue` `selectedType`, `CreatureList.vue` `lairCount`; `eslint.config.mjs` / `postcss.config.cjs`
  lose `isStrict` / `isMinified`. **Decisions: accept — the `lang` attribute should select the grammar; accept — plain JavaScript parameters should be words (derived from JavaScript).**
- Wrong: umlaut words in comments and strings are cut apart: `Zentaurenhöhle` -> `zentaurenh` + `hle`,
  `Rüstungsklasse` -> `stungsklasse`, `gehören` -> `geh` + `ren`, `Größe` -> nothing, `Höhle` -> `hle`. **Decision: accept (derived from Java).**
- Wrong: files with a non-ASCII name are dropped silently without a UTF-8 locale. **Decision: accept (derived from Java).**
- Bad: no German stop words: die, dem, und, unter, jeder all appear. **Decision: ignore (derived from Java).**
- Bad: the Vue keyword list removes `store`, `state`, `model`, `route`, `key`, `filters`, `actions`, `name`, `data`
  from every `.vue` file, including inside compound identifiers (scratch file). **Decision: ignore (derived from Kotlin).**
- Bad: `strong` from the JSX tag `<strong>` in `ui/SpeedBadge.tsx`; JSX text is not extracted. **Decision: accept (derived from TypeScript).**
- Bad: object-literal keys and methods are no identifiers, so the Options API contributes nothing
  (`EncounterEdgeCases.vue`: `treasureChest`, `hoardSize`, `isPlundered`); snake_case strings yield nothing;
  `rollD20` yields `20`; a weight of 0 is rejected; `tfidf` is identical for a word in every file. **Decisions derived from Java: accept — a weight of 0 is rejected; ignore — bare `20`.** **Decisions: accept — object-literal keys; accept — snake_case strings; ignore — `tfidf` as one number per project.**
- Good: all 17 expected words are found; no keyword leaks; camel, snake, screaming, Pascal and acronym splitting;
  umlauts in identifiers; `//`, `/* */`, `/** */` and JSX comments with weight 2; tests included by default and
  removed cleanly by `--exclude-tests`; stop-word levels and `--ngrams 2` behave as documented; `.ts`, `.tsx`,
  `.mts`, `.cts`, `.mjs`, `.cjs` are all read.
