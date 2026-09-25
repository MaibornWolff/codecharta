# Vue

## Expected file-level edges (written before running the parser)

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

## Project
- Layout: a Vite + Vue 3 project. `package.json`, `tsconfig.json` (`baseUrl: "."`, `paths: {"@/*": ["src/*"]}`),
  `vite.config.ts` (`alias: {'@': ./src}`), `src/main.ts`, `src/App.vue`, and
  `src/de/sots/cellarsandcentaurs/{domain/model,domain/service,adapter/persistence,application,application/dto,ui}`.
  The test is `domain/service/__tests__/CreatureService.spec.ts` (create-vue convention). 32 files: 24 `.ts`
  (incl. `main.ts`, `vite.config.ts`, the spec), 5 `.vue`, 3 config files. Domain, service, adapter and
  application layers are `.ts`, the UI is `.vue`.
- The five `.vue` forms asked for: `CreatureCard.vue` (`<script setup lang="ts">`, `defineProps`,
  `import type`), `CreatureList.vue` (`<script lang="ts">` + `defineComponent`, Options API, imports
  `CreatureCard.vue`), `CreatureStable.vue` (`<script setup>`, imports `CreatureFacade`/`CreatureUtil` through
  the barrel `../application`, imports `CreatureList.vue` and `CreatureForm.vue`, uses `<CreatureList>` in
  PascalCase and `<creature-form>` in kebab-case), `CreatureForm.vue` (`@/` alias to two `.ts` files),
  `App.vue` (`@/` alias to a `.vue` file). `main.ts` default-imports `App.vue`.
- Stress constructs present: 1 aliased import (`CreatureRepository.ts`: `import { CreatureEntity as Entity }`),
  2 namespace import (`CreatureUtil.ts`: `import * as model from '../domain/model/Creature'`), 3 barrel
  `application/index.ts` imported by `Creature.ts`, `ArmorClass.ts`, `PersistedCreatures.ts` and
  `CreatureStable.vue`, 4 `Centaur extends Creature`, `Creature implements Fightable`,
  `PersistedCreatures implements Creatures`, 5 `abstract class Repository<T>` with `CreatureRepository extends
  Repository<Entity>`, 6a type only in type position (`Speed`, `ArmorClass` in `CreatureFacade.create`, the
  `import type` in the `.vue` files), 6b only instantiated (`CreatureId` in `CreatureFacade`, `CreatureEntity` in
  `PersistedCreatures`), 6c only through a static member (`CreatureFacade.STANDARD_CREATURE_TYPE` in
  `Creature.ts` / `PersistedCreatures.ts`, `CreatureUtil.STANDARD_ARMOR_CLASS_DESCRIPTION` in `ArmorClass.ts`),
  6d only in a decorator (`@Roams('cellar')` on `Centaur`, `Roams.ts` exports a decorator factory),
  7 `domain/model/Creature` and `application/dto/Creature` both used in `CreatureFacade.ts` (the DTO must be
  aliased, `import { Creature as CreatureDto }`, TypeScript cannot bind the same name twice),
  9 unused import `Fightable` in `CreatureUtil.ts`, 10 `uuid` (`import { v4 as uuidv4 }`), `loglevel`, `vue`,
  `vitest`, `Map`, `Promise`, 11 the spec file, 12 `Dice.ts` with `Dice`, `DiceRoll` and `rollD20`;
  `Creature.ts` calls `rollD20()`.
- Not available in TypeScript/Vue: 8 a fully qualified reference without an import. The closest thing is an
  inline import type, used in `CreatureService.ts` (`import('../model/Speed').Speed` as a field type and
  `'walking' as import('../model/SpeedType').SpeedType`). A file whose name differs from its declaration (12b)
  is not idiomatic in this stack, the closest is `index.ts`, the `DEFAULT_EXPORT` of `vite.config.ts` and the
  `.vue` files whose component name is the file name.

## Dependency parser

Commands (all exited 0, no crash; `--verbose` adds only timings and the cycle count):

```
ccsh dependencyparser -nc $LANG_DIR -e "output,FINDINGS.md" -o output/dependency.cc.json
ccsh dependencyparser -nc $LANG_DIR -e "output,FINDINGS.md" --include-tests -o output/dependency-with-tests.cc.json
ccsh dependencyparser -nc $LANG_DIR -e "output,FINDINGS.md" --include-tests --verbose -o output/dependency-verbose.cc.json
```

Default run: 29/29 files scanned (the spec is excluded), 28 file leaves, 33 declaration leaves, 60 file edges,
64 leaf edges, 5 cycles. `main.ts` and (with `--include-tests`) the spec are scanned but get **no node at all**
because they hold no declaration, so `dependency.cc.json` and `dependency-with-tests.cc.json` are byte-identical.

### Construct table

| # | construct | expected edge(s) | found | verdict |
| --- | --- | --- | --- | --- |
| 1 | aliased import `import { CreatureEntity as Entity }` (`CreatureRepository.ts`) | `CreatureRepository.ts -> CreatureEntity.ts` | found | ok |
| 2 | namespace import `import * as model from '../domain/model/Creature'`, used as `model.Creature` (`CreatureUtil.ts`) | `CreatureUtil.ts -> Creature.ts` | found | ok |
| 3 | barrel: `.ts` importers of `'../../application'` (`Creature.ts`, `ArmorClass.ts`, `PersistedCreatures.ts`) | edge to `index.ts` (or resolved through to the real file) | edge to `application/index.ts`, leaf edge to the REEXPORT leaf `index.CreatureFacade` / `index.CreatureUtil`, plus `index.ts -> CreatureFacade.ts` / `CreatureUtil.ts` | ok |
| 3b | barrel: `.vue` importer of `'../application'` (`CreatureStable.vue`) | same as 3 | edges go **directly** to `CreatureFacade.ts` and `CreatureUtil.ts`, no edge to `index.ts` | wrong (inconsistent with 3: `.vue` files skip the barrel, `.ts` files stop at it) |
| 3c | cycle `Creature -> index -> CreatureFacade -> CreatureService -> Creature` | 4 cyclic edges | all found with `isCyclic`; 5 cycles reported in total (also via `ArmorClass`, `CreatureUtil`, `Creatures`) | ok |
| 4 | `Centaur extends Creature`, `Creature implements Fightable`, `PersistedCreatures implements Creatures` | 3 edges | all found | ok |
| 5 | generic base `Repository<Entity>` (`CreatureRepository.ts`) | `-> Repository.ts`, `-> CreatureEntity.ts` (the argument, through the alias) | both found | ok |
| 6a | type only in type position (`Speed`, `ArmorClass` in `CreatureFacade`; `import type { Creature }` in `CreatureCard.vue` / `CreatureStable.vue`) | 4 edges | all found | ok |
| 6b | type only instantiated (`new CreatureId(...)` in `CreatureFacade`, `new CreatureEntity(...)` in `PersistedCreatures`) | 2 edges | found | ok |
| 6c | type only through a static member (`CreatureFacade.STANDARD_CREATURE_TYPE`, `CreatureUtil.STANDARD_ARMOR_CLASS_DESCRIPTION`) | `Creature.ts -> index.ts`, `PersistedCreatures.ts -> index.ts`, `ArmorClass.ts -> index.ts` | all found (via the barrel) | ok |
| 6d | type only in a decorator (`@Roams('cellar')` on `Centaur`) | `Centaur.ts -> Roams.ts` | found, leaf kind FUNCTION | ok |
| 7 | same simple name: `Creature` and `Creature as CreatureDto` in `CreatureFacade.ts` | `-> domain/model/Creature.ts` and `-> application/dto/Creature.ts` | only `-> domain/model/Creature.ts`; `dto/Creature.ts` has 0 incoming edges | **missing** (the aliased import of the second `Creature` is dropped, no wrong target) |
| 8 | inline import type `import('../model/Speed').Speed` (`CreatureService.ts`) | `-> Speed.ts`, `-> SpeedType.ts` | not found | missing (no import statement; the language substitute for a FQN) |
| 9 | unused import `Fightable` in `CreatureUtil.ts` | no edge | no edge | ok (usage-based) |
| 10 | `vue`, `uuid`, `loglevel`, `vitest`, `node:url`, `vite`, `@vitejs/plugin-vue`, `Map`, `Promise` | no internal edges | none, no dangling leaves; `vite.config.ts` has 0 edges | ok |
| 11 | test file `__tests__/CreatureService.spec.ts` | no node/edges by default; 6 edges with `--include-tests` | excluded by default (29 files); with `--include-tests` it is scanned (30 files) but yields **no node and no edges** | missing (see below) |
| 12 | `Dice.ts` with `Dice`, `DiceRoll`, `rollD20`; `Creature.rollInitiative()` calls `rollD20()` | 3 leaves, `Creature.ts -> Dice.ts` | 3 leaves (CLASS, CLASS, FUNCTION), file edge found, leaf edge `Creature -> Dice.rollD20` | ok |
| V1 | `.vue` importing a sibling `.vue` and using it in the template (`CreatureList.vue -> CreatureCard.vue`, `CreatureStable.vue -> CreatureList.vue` / `CreatureForm.vue`, PascalCase and kebab-case tags) | 3 edges | all found | ok (but see V3: they resolve by simple name in the same folder, not by the import path) |
| V2 | `.vue` with `@/` alias to `.ts` files (`CreatureForm.vue`) | `-> CreatureType.ts`, `-> Speed.ts` | found (tsconfig `paths` resolved) | ok |
| V3 | `.vue` with `@/` alias to a `.vue` file (`App.vue -> ui/CreatureStable.vue`, default import, also used as `<CreatureStable />`) | 1 edge | not found; `App.vue` has 0 outgoing edges | **missing** |
| V4 | `.ts` default-importing a `.vue` (`main.ts -> App.vue`) | 1 edge | not found; `main.ts` has no node | **missing** |
| V5 | `<script setup lang="ts">` vs `<script lang="ts">` + `defineComponent` | edges from both | both produce edges and a CLASS leaf named after the file | ok |

Controlled follow-up in a scratch project (not part of this folder) to isolate V3/V4: a `.vue` default-importing a
sibling `.vue` produces an edge even without a template tag; a `.vue` in the parent folder importing
`./comps/Card.vue` (relative, no alias) and using `<Card />` produces **no** edge; a `.ts` in the same folder
importing `./Card.vue` produces no edge; a `.vue` using `<Card />` in the template without any import
produces an edge when `Card.vue` is in the same folder. So a `.vue` component is only reachable from
another `.vue` in the **same folder**, never from a `.ts` file and never across folders. Cause (from
`VueAnalyzer.kt` / `TseMappings.defaultImportPath`): the component node is keyed by its file path
(`src.de...ui.CreatureCard`), but a default import resolves to `<file path>/<binding name>`
(`src/de/.../ui/CreatureCard/CreatureCard`, plus `.../index/CreatureCard` from the TypeScript analyzer), which
matches nothing; the same-folder hits come from the simple-name fallback. Vue projects consist almost entirely
of default imports of `.vue` files, so the component tree of a real app is largely invisible.

### False positives, cycles, upward edges
- No false positives: every reported edge corresponds to a real import or usage. No edge to `Fightable.ts`
  from `CreatureUtil.ts`, no edges for `uuid`/`loglevel`/`vue`/`vitest`.
- Cycles: 12 edges carry `isCyclic`, exactly the union of the three expected cycles plus
  `Creatures -> Creature -> index -> CreatureFacade -> CreatureService -> Creatures` (real). 5 cycles / 1 SCC.
- Upward edges: `Creature.ts -> index.ts` and `ArmorClass.ts -> index.ts` carry `isPointingUpwards`;
  `PersistedCreatures.ts -> index.ts` does not because `adapter` (level 2) sits above `application` (level 1)
  in the computed level tree. Consistent with the levelling, but it hides that the adapter depends on the
  application layer.
- Levels: `ui` folder level 3 above `adapter` 2 above `application` 1 above `domain` 0, i.e. the layering is
  recovered from the edges. `App.vue` sits at level 0 because it has no edges (V3).
- Metrics: `incoming_dependencies` / `outgoing_dependencies` match the edge list (e.g. `Creature.ts` 9/9,
  `CreatureStable.vue` 11/0, `dto/Creature.ts` 0/0 which is the missing #7 edge, `App.vue` 0/0 which is V3).

### Leaf kinds
- CLASS for classes and the abstract generic `Repository`, INTERFACE for `Fightable` and `Creatures`, ENUM for
  `CreatureType`/`SpeedType`, FUNCTION for `rollD20` and the decorator factory `Roams`, VARIABLE for the
  top-level `const SpeedTypeWalking`, REEXPORT for `index.CreatureFacade` / `index.CreatureUtil`: right.
- Every `.vue` file is one leaf of kind CLASS named after the file (`src.de...ui.CreatureCard`, `src.App`):
  acceptable, a component is class-like; there is no COMPONENT kind.
- `export default CreatureType` yields a second leaf `CreatureType.src_de_sots_cellarsandcentaurs_domain_model_CreatureType_DEFAULT_EXPORT`
  of kind ENUM with a leaf edge to the enum, whereas `export default defineConfig({...})` in `vite.config.ts`
  yields `vite_config.vite_config_DEFAULT_EXPORT` of kind REEXPORT. The default-export leaf is noise (it doubles
  the enum) and its kind is inconsistent between the two forms. File names with a dot become `vite_config`.

### What the language offers and what CodeCharta resolves itself
- ES modules give explicit import paths, so file edges are path-based, but TypeScript has no namespaces for
  files; CodeCharta derives the "namespace" from the folder path and has to resolve `@/` aliases from
  `tsconfig.json` (works), barrels (works for `.ts`, skipped for `.vue`), `.vue` extensions in import
  specifiers (stripped) and default imports of `.vue` components (broken, see V3/V4). The `.ts` files are handled
  exactly as in a plain TypeScript project: the same edges, the same barrel behaviour and the same missing
  edge for the aliased second `Creature`.

## Domain language parser

Commands (exit 0 unless noted):

```
ccsh domainlanguageparser -nc $LANG_DIR -e "output,FINDINGS.md" -o output/domain.cc.json
ccsh domainlanguageparser ... --stop-word-level MINIMAL   -o output/domain-minimal.cc.json
ccsh domainlanguageparser ... --stop-word-level AGGRESSIVE -o output/domain-aggressive.cc.json
ccsh domainlanguageparser ... --exclude-tests             -o output/domain-no-tests.cc.json
ccsh domainlanguageparser ... --string-weight 10          -o output/domain-string10.cc.json
ccsh domainlanguageparser ... --comment-weight 10         -o output/domain-comment10.cc.json
ccsh domainlanguageparser ... --string-weight 0            -> exit 1: "IllegalArgumentException: --string-weight must be positive, got 0"
ccsh domainlanguageparser ... --comment-weight 0           -> exit 1, same message
```

30 files processed (`.ts` and `.vue`; `package.json`/`tsconfig.json` ignored), 44 nodes with a word list.
A weight of 0 is rejected, so the influence of strings and comments was measured by raising the weight from the
default (identifier 3, comment 2, string 1) to 10 and diffing.

### Expected words at the root node (89 distinct words)

| word | frequency | source |
| --- | --- | --- |
| creature | 75 | identifiers everywhere |
| centaur | 4 | `Centaur` class ×1 (3) + string `'centaur-1'` in the spec (1); **not** from `'centaur-stable'` |
| cellar | 2 | doc comment on `Creature` only; the decorator argument `'cellar'` is not counted |
| dungeon | 2 | line comment in `CreatureFacade.create` only; the exception message string is not counted |
| armor | 23 | identifiers |
| hit | 28 | identifiers + comments |
| points | 28 | identifiers + comments |
| speed | 51 | identifiers |
| damage | 8 | `takeDamage` ×2 (6) + `HitPoints` doc comment (2) |
| lair | 2 | `HitPoints` doc comment (`lairCount` in `CreatureList.vue` was lost, see below) |
| initiative | 5 | `rollInitiative` (3) + line comment (2) |
| encounter | 2 | line comment |
| treasure | 2 | block comment in `CreatureUtil` |
| hoard | 8 | `countHoard`, `hoardOf` (6) + block comment (2) |
| stable | 9 | `STABLE_NAME`, `stableName`, `should_save_creature_to_the_stable` (9); **not** from `'centaur-stable'` |
| dice | 6 | `Dice`, `DiceRoll` |
| roll | 15 | `DiceRoll`, `roll`, `rollD20`, `d20Roll`, `rollInitiative` |

All 17 appear. Top of the list: creature 75, speed 51, id 42, hit 28, points 28, walking 25, armor 23.

### Keyword and technical-word leakage
- No language keyword leaks: `class`, `readonly`, `static`, `private`, `number`, `string`, `void`, `async`,
  `export`, `import`, `type`, `as`, `function`, `const` are all absent (`ArmorClass` -> `armor` only,
  `topFunction`-style names lose `function`). Vue keywords work per file type: `props`, `emit`/`emits`,
  `computed`, `ref`, `data`, `methods` are filtered in `.vue` files (`emit(3)` in `CreatureForm.vue` is the
  variable `emit`, `emits` is the keyword), but `props`/`data` are counted in `.ts` files (verified in a
  scratch file), which is right since the keyword lists are scoped per language.
- Technical stop words at MODERATE: `util`, `exception`, `service`, `test`, `spec`, `save`, `find`, `create`,
  `init`... are filtered as intended (`CreatureUtil.ts` has no `util`, `CreatureService.ts` no `service`,
  `NoSuchCreatureException.ts` only `creature, id, such`). Leaking: `entity` 9, `repository` 6, `facade` 6,
  `dto` 3, `persisted` 3, `standard` 6, `prefix` 6, `id` 42, `value` 15, `all` 8, `target` 9, `max` 9, `20` 3.
  `entity`/`repository`/`facade`/`dto` are architectural terms that MODERATE does not list; AGGRESSIVE removes
  exactly `value, entity, facade, repository, dto, init, types` and MINIMAL adds back
  `find, save, service, create, base, exception`. Leaving `facade`/`repository` at MODERATE is defensible,
  `dto`/`entity` less so. `20` is a digit token from `rollD20` (see splitting) and should not be a word.
- `assert(2)` comes from the `// Assert` comment in the spec (removed by `--exclude-tests`).

### Identifier splitting

| form | identifier | where | words found |
| --- | --- | --- | --- |
| camelCase | `walkingSpeed` | `CreatureFacade.ts`, `Centaur.ts`, `CreatureCard.vue`, `CreatureForm.vue` | `walking`, `speed` |
| snake_case | `walking_speed` | spec | `walking`, `speed` |
| SCREAMING_SNAKE | `MAX_HIT_POINTS` | `HitPoints.ts` | `max`, `hit`, `points` |
| PascalCase | `ArmorClass` | `ArmorClass.ts` | `armor` (`class` is a keyword) |
| Acronym | `XPValue` | `Centaur.ts` | `xp`, `value` |
| Digit | `d20Roll` | `Dice.ts` | `d20`, `roll` |
| Digit | `rollD20` | `Dice.ts` | `roll`, `20` (the `d` is dropped as a 1-letter word, leaving a bare number) |
| Kebab in string | `'centaur-stable'` | `CreatureFacade.ts` static field | nothing (string not extracted, see below); in the spec `'centaur-1'` gives `centaur` |

`d20Roll` and `rollD20` split differently; a trailing `D20` becomes `d` + `20`.

### Comments and strings
- Comments are counted with weight 2: the `Creature` doc comment (`cellar, centaurs, beasts, dragons, share, all,
  hit, points, armor, speeds`), the `HitPoints` doc comment (`lair, drop, damage, recover, rests, takes`), the
  line comment in `CreatureFacade.create` (`rolls, initiative, every, dungeon, before, encounter, starts`) and the
  block comment in `CreatureUtil` (`counts, treasure, hoard, guards`) all appear with frequency 2 and go to 10
  with `--comment-weight 10`. `//` `/* */` and `/** */` are all handled. The `<!-- -->` comment and the CSS
  comment of a `.vue` file are not counted (checked in a scratch file).
- Strings are counted with weight 1 but **only at module top level** (a scratch run confirmed: strings in a
  top-level `const`, a top-level call, `x as T` and inside callbacks of a top-level call are counted; strings
  inside a top-level `function` or `class` declaration - field initializers, `return`, call and `new` arguments,
  concatenations - are never counted, in `.ts` as well as `.vue`). Hence `'No such creature in the dungeon: '`
  (constructor), `'centaur-stable'` and `'Natural Armor'` (static fields), `'saving creature '` (method) and
  `'cellar'` (decorator argument) contribute nothing, while `'walking'` (`CreatureService.ts` top-level const),
  `'#app'` (`main.ts`) and `'centaur-1'` / `'CreatureService'` (inside the spec's `describe(...)` callback) do.
  In a typical class-based TypeScript project this means strings are effectively ignored.
- `'should_save_creature_to_the_stable'` is inside the counted `describe` callback but yields nothing: the
  word regex `\b[a-zA-Z]{3,}\b` in `SplitStage` cannot match letters joined by underscores (`_` is a word
  character, so there is no `\b`). Snake-case strings therefore never produce words; only the function of the
  same name does.
- Template text (`Cellars and Centaurs`, `Hit points:`) and attribute strings in `.vue` files are ignored, which
  is a defensible choice (UI copy is not code), but `App.vue` ends up with an empty word list.

### `.vue` script handling
- Only the **first** `<script>` block of a file is processed; a `<script setup>` after a plain `<script>`
  is dropped (scratch file `BothBlocks.vue`).
- The block is treated as if it were JavaScript even with `lang="ts"`: some TypeScript-only syntax is a
  parse error and the error recovery swallows a declaration. Isolated in scratch files with non-keyword names:
  a generic call with an object type literal (`defineProps<{ creature: Creature }>()`,
  `defineEmits<{ create: [...] }>()`) keeps its own variable but drops the **next** statement's declaration
  (`hitPoints` in `CreatureCard.vue`, `selectedType` in `CreatureForm.vue`); a return type annotation on an
  object-literal method (`lairCount(): number` in `CreatureList.vue`'s `computed`) drops the method name;
  `ref<T>(...)`, `x as PropType<T>`, `?.`/`??` and `import type` are fine. `props` is absent for another
  reason: it is a Vue keyword. `CreatureList.vue` ends up with an **empty** word list (`lairCount` lost,
  `creatures` is only an object key, `CreatureCard` only an import/usage). The identical code in a `.ts` file
  keeps every identifier (and even counts the type-literal key `creature`).
- Object-literal property keys (`data() { return { treasureChest: 3 } }`, Options API state) are not
  identifiers in `.ts` or `.vue`, so Options API state names never appear (scratch check).
- `CreatureStable.vue` (`creature, creatures, facade, hoard, stable`), `CreatureForm.vue`
  (`creature, emit, speed, submit, types, walking`) and `CreatureCard.vue` (`speed, walking`) are otherwise
  counted like `.ts` files with weight 3 per identifier.

### Test file handling
- Included by default: `__tests__/CreatureService.spec.ts` has its own node (`creature 7, creatures 3, speed 3,
  stable 3, walking 3, assert 2, centaur 1`) and contributes to every folder above it. `--exclude-tests` removes
  it (root: creature 75 -> 68, speed 51 -> 48, walking 25 -> 22, stable 9 -> 6, centaur 4 -> 3, `assert` gone).
  `test`, `spec`, `describe`, `expect`, `vi` and `mock` do not leak.
- Stop-word levels in one line: MINIMAL adds `find 15, save 12, service 10, create 7, base 6, exception 3` to
  the root; AGGRESSIVE removes `value 15, entity 9, facade 6, repository 6, dto 3, init 3, types 3`; nothing
  else changes.

## Verdict
- Good: all `.ts` edges of the TypeScript reference are found (aliased import, namespace import, barrel with
  REEXPORT leaves, inheritance, interfaces, generic base, type-only / `new`-only / static-member-only / decorator
  usage, `import type`), no false positives, cycles and the two upward edges flagged correctly, `@/` alias to
  `.ts` files resolved from `tsconfig.json`, `.vue` siblings linked in either script form. Round 2: a dynamic
  `import('./ui/CreatureCard.vue')` inside `defineAsyncComponent` resolves across folders, both `<script>` blocks
  of one file are read, and a `<script lang="js">` block is handled like the `ts` ones. Domain: all 17 words
  at the root, no keyword leakage, comments in all three forms counted, camel/snake/screaming/acronym splitting
  right, tests included by default and cleanly excludable.
- Wrong (most important first):
  1. `App.vue -> ui/CreatureStable.vue` (`@/` alias, default import) and `main.ts -> App.vue` are missing: a
     `.vue` component is only reachable from a `.vue` in the same folder, because default imports resolve to
     `<path>/<binding>` while the component leaf is keyed by the bare file path (`VueAnalyzer`). In a real Vue app
     that removes most of the component tree. Round 2 sharpens this: `ui/pages/StablePage.vue ->
     ui/CreatureStable.vue` (relative `../`, no alias) is missing too, the same-folder case only works when the
     binding name equals the file name, and a dynamic `import()` of the very same file does resolve, so only the
     static default-import path is broken, not the path resolution.
  2. `CreatureFacade.ts -> application/dto/Creature.ts` missing: the aliased second `Creature`
     (`import { Creature as CreatureDto }`) is dropped, `dto/Creature.ts` has 0 incoming edges.
  3. `CreatureStable.vue -> application/index.ts` is resolved straight to `CreatureFacade.ts`/`CreatureUtil.ts`
     while the `.ts` importers of the same barrel stop at `index.ts`: two different pictures of one construct.
  4. Domain, `.vue`: `CreatureList.vue` has an empty word list and `CreatureCard.vue`/`CreatureForm.vue` lose
     `hitPoints`/`selectedType` - `defineProps<{...}>()`/`defineEmits<{...}>()` swallow the following
     declaration and a return type on an object-literal method loses the method name, both only inside
     `<script lang="ts">`; only the first `<script>` block of a file is read.
  5. Domain: string literals inside class or function bodies are never counted
     (`'No such creature in the dungeon: '`, `'centaur-stable'`, `'Natural Armor'`), and snake_case strings
     (`'should_save_creature_to_the_stable'`) match nothing because of the `\b` word regex.
  6. `--string-weight 0` / `--comment-weight 0` are rejected although the README suggests them for comparison.
  7. `rollD20` splits into `roll` + `20` (bare number as a domain word), `d20Roll` into `d20` + `roll`.
  8. The synthetic `..._CreatureType_DEFAULT_EXPORT` leaf duplicates the enum; `vite.config.ts` gets a
     REEXPORT leaf for `export default defineConfig(...)`.
- Missing:
  - `--include-tests` has no visible effect: a test file (like `main.ts`) holds no declaration, so it gets no
    node and no edges even though it is scanned; the 6 expected edges from the spec are absent.
  - Inline import types `import('../model/Speed').Speed` in `CreatureService.ts` produce no edge (the only
    TypeScript substitute for a fully qualified reference).
  - `PersistedCreatures.ts -> application/index.ts` is not flagged upward because the level tree puts `adapter`
    above `application`; the architectural violation is invisible.
  - Object-literal keys (Options API `data`) and `.vue` template/attribute text are not domain words.
  - Round 2: global registration is not followed. `main.ts -> ui/CreatureBadge.vue` (a `.ts` default-importing
    a `.vue`) and `App.vue -> ui/CreatureBadge.vue` (`<CreatureBadge>` used without an import after
    `app.component('CreatureBadge', CreatureBadge)`) are missing; `CreatureCard.vue -> CreatureBadge.vue` is
    found only by the same-folder name fallback.
  - Round 2: `<component :is="CreatureList">` is not understood as a usage on its own; the edge in
    `CreatureViewer.vue` comes from the import whose binding name matches the file name (a renamed binding
    yields no edge).

## Round 2: additional dependency forms

Added without touching any round-1 construct: `cc/CreatureSpotlight.vue`, `ui/CreatureBadge.vue`,
`ui/CreatureViewer.vue`, `ui/CreatureRoster.vue`, `ui/CreatureNote.vue`, `ui/pages/StablePage.vue`; edited
`main.ts` (imports `CreatureBadge.vue` and calls `app.component('CreatureBadge', CreatureBadge)`),
`CreatureCard.vue` and `App.vue` (both use `<CreatureBadge>` in the template without importing it). All six
requested forms are expressible in Vue; none had to be skipped. The three README commands were rerun and exited 0:
35/35 files (36 with `--include-tests`), 40 declaration leaves, 67 file edges (+7), 71 leaf edges, 5 cycles;
`dependency.cc.json` and `dependency-with-tests.cc.json` are still byte-identical. The domain run processed 36
files.

| form | file(s) | expected edge | found | note |
| --- | --- | --- | --- | --- |
| `defineAsyncComponent(() => import('./ui/CreatureCard.vue'))`, relative path into a sub folder | `cc/CreatureSpotlight.vue` | `-> ui/CreatureCard.vue` | yes | comes from the `import()` call itself: in a scratch project the edge appears without any template tag, and a bare `() => import('./ui/List.vue')` without `defineAsyncComponent` yields it too. The only cross-folder `.vue -> .vue` edge that works |
| same form in the same folder (control) | `ui/CreatureViewer.vue` | `-> ui/CreatureForm.vue` | yes | |
| dynamic `<component :is="CreatureList">` with an imported component | `ui/CreatureViewer.vue` | `-> ui/CreatureList.vue` | yes | not because of `:is`: the same-folder default import with binding name = file name is enough. Scratch: `import ListView from './List.vue'` + `<component :is="ListView" />` gives no edge |
| both `<script lang="ts">` and `<script setup lang="ts">` importing different files | `ui/CreatureRoster.vue` | `-> model/CreatureType.ts` (plain block), `-> model/HitPoints.ts` (setup block) | yes, yes | the dependency parser reads both blocks; the domain parser still reads only the first (`roster, types` counted, `fullHitPoints` from the setup block missing) |
| global registration: default import of the `.vue` in `main.ts` | `main.ts` | `-> ui/CreatureBadge.vue` | no | `main.ts` now gets a node (leaf `src.main.app`, kind VARIABLE, because `const app` is a top-level declaration) but 0 edges: a `.ts` default-importing a `.vue` is still not resolved (V4) |
| global component used in a template without an import, same folder | `ui/CreatureCard.vue` | `-> ui/CreatureBadge.vue` | yes | via the same-folder simple-name fallback of round 1, not via the registration |
| global component used in a template without an import, different folder | `App.vue` | `-> ui/CreatureBadge.vue` | no | `App.vue` still has 0 outgoing edges; `app.component(...)` is not followed |
| `.vue` importing a `.vue` from a different folder by relative path (`../CreatureStable.vue`) | `ui/pages/StablePage.vue` | `-> ui/CreatureStable.vue` | no | same failure as V3 without the alias; `StablePage.vue` has 0 edges. Scratch: a same-folder `import CardView from './Card.vue'` (binding name differs from file name) gives no edge either, so the fallback is a plain simple-name match |
| `<script lang="js">` (Options API) importing a `.ts` file | `ui/CreatureNote.vue` | `-> model/SpeedType.ts` | yes | handled like the `ts` blocks, leaf kind CLASS |

Round-1 edges: all 60 are present and unchanged (the dump diff contains only additions), the 7 new file edges are
exactly the "yes" rows above, cycles (5, the same 12 `isCyclic` edges) and upward flags are unchanged, and
`--include-tests` still makes no difference. The `ui` levels moved up by one because `CreatureBadge.vue` sits at
the new level 0 (`CreatureCard` 1, `CreatureList` 2, `CreatureStable` 3, `CreatureViewer` 3, `CreatureSpotlight` 4,
the edgeless `StablePage`/`CreatureNote`/`CreatureRoster`/`App.vue`/`main.ts` at 0), which is the relative
levelling working as before. One round-1 statement changed for a reason of my own making: `main.ts` now has a node,
because the edit introduced the top-level `const app`; it still has no edges, so the point of the statement stands.

New false positives: none. Every new edge corresponds to a real import; `CreatureBadge.vue` has 0 outgoing edges
as expected and no edge appeared to a file that was not imported.

Domain side effects of the new files (not the goal of round 2, but visible in the diff): root `creature` 75 -> 79,
`types` 3 -> 6, `app` 4; `main.ts` now `app(4), badge(1), creature(1)` (the top-level string `'CreatureBadge'` is
split and counted with weight 1); `CreatureSpotlight.vue` `card, creature`; `CreatureRoster.vue` `roster, types`
(first block only); `CreatureViewer.vue`, `CreatureNote.vue`, `CreatureBadge.vue` and `StablePage.vue` have empty
word lists - in `CreatureViewer.vue` the `const CreatureForm` after `defineProps<{...}>()` is swallowed as in
round 1, in `CreatureNote.vue` `noteSpeedType` is an object-literal key. All consistent with the round-1 findings.
