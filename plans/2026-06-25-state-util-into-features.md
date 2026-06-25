---
title: Moving state/ and util/ into features/
date: 2026-06-25
state: complete
source: ultracode fan-out (109 agents) classifying all state/ + util/ modules by consuming feature
---

## ⚠️ Implementation outcome (2026-06-25) — read this first

The fan-out report below **substantially over-predicted** what can move. Every candidate
was re-verified against the real import graph with `npm run lint:architecture`
(dependency-cruiser) + targeted jest. Root cause of the over-prediction: the per-module
classifiers grepped the path fragment `util/<name>/` and the `app/codeCharta/` tree only,
so they missed (a) intra-`util/` relative imports like `../../color/...`, (b) state-core
consumers reached via non-fragment paths, and (c) `app/app.config.ts` (outside
`app/codeCharta/`) where every effect is registered.

**Applied (committed, dependency-cruiser 0 errors):**
- ✅ `util/gameObjectsParser/` → `features/navBar/util/gameObjectsParser/` (sole consumer `readFiles.ts`).
- ✅ Deleted dead `util/pipes/truncateText.pipe.ts` (no template/class references).

**Reclassified to KEEP_SHARED after verification:**
- `util/color/` — `gradientCalculator` is used by shared `util/algorithm/treeMapLayout/treeMapHelper.ts`; `hsl` by shared `util/fileExtension/`; `colorConverter` is pulled in by `gradientCalculator`. Moving it inverts util→feature.
- `util/fileHelper.ts` — imported by shared `util/codeMapHelper.ts`, `util/urlExtractor.ts`, `util/fileParser.ts`.
- `util/fileParser.ts` + `util/fileValidator.ts` — mutually coupled; `getNameDataPair` is a real loadFile fn also used as a **cross-feature test fixture** (globalSettings spec). Moving needs logic duplication or a fragile spec rewrite, for files that still depend on shared util anyway.
- selector `amountOfBuildingsWithSelectedEdgeMetric` — also consumed by the state-core `updateAmountOfEdgePreviews` effect, not just metricsBar.

**Valid but DECLINED by maintainer (left global):**
- The 4 single-owner effects (`blacklistExtension`→fileExtensionBar, `resetChosenMetrics`→globalSettings, `updateQueryParameters`→loadFile, `blacklistSearchPattern`→sidebarExplorer). They are genuinely single-feature, but relocating requires a new pattern (effect under `features/<x>/stores/`, re-exported via `facade.ts`, registered from `app.config.ts`). Maintainer chose to keep effects global until that pattern is settled.
- The 4 "DELETE candidate" effects (`unfocusNodes`, `linkColorMetricToHeightMetric`, `resetSelectedEdgeMetricWhenItDoesntExistAnymore`, `updateMapColors`) are **NOT dead** — all are registered in `app/app.config.ts` `provideEffects([...])`. Do not delete.
- `util/state-core/` grouping — declined (import churn not worth it).

**Net:** state/util are far more interconnected than the report implied. The real lever for
both pains remains structural, not relocation: consolidate the divergent per-slice store
wrappers (state traceability) and, if desired, organize util/ via subfolders later.

## Follow-up: dependency inversions surfaced by maintainer's own analysis (CodeMapBuilding)

Maintainer flagged 6 "wrongly located" dependencies (1 in algorithm, 5 in dataMocks). All 6
were `util/ → features/codeMap` inversions caused by one thing: **`CodeMapBuilding`** (a
codeMap rendering class, correctly located in the feature) being reached *up into* from shared
`util/`. Fixed by moving the misplaced **consumers** down, not the class:

- ✅ Deleted dead `TreeMapHelper.buildingArrayToMap` (no production callers; only reason
  `util/algorithm/treeMapHelper` imported `CodeMapBuilding`). Broke the `treeMapHelper ↔ codeMap`
  cycle → **`no-circular` warnings 126 → 96**.
- ✅ Moved the 5 `CodeMapBuilding` test fixtures (`CODE_MAP_BUILDING*`, `CONSTANT_HIGHLIGHT`) out
  of the shared `util/dataMocks` god-file into `features/codeMap/rendering/codeMapBuilding.mocks.ts`
  (consumed only by 3 codeMap specs). Removed the last `dataMocks → codeMap` inversion.

Both verified: dependency-cruiser 0 errors, jest green. `CodeMapBuilding` stays in codeMap.
Remaining `util → state` edges (e.g. dataMocks → state selectors) are a separate, milder concern.

---

## TL;DR

- **105 units classified: 10 safe single-feature MOVEs, 4 DELETE candidates, 91 stay shared.** The maintainer's two pains are real but have *different* root causes — `util/` genuinely mixes feature-private helpers with shared core, while state traceability is a *wrapper-layer* problem, not a slice-location one.
- **`util/` is the only place with real relocation wins.** 5 modules leave outright (`color/`→codeMap, `gameObjectsParser/`+`fileHelper.ts`→navBar, `fileParser.ts`+`fileValidator.ts`→loadFile), 1 dead pipe (`truncateText.pipe.ts`) gets deleted, and 6 state-only modules get fenced into a labelled `util/state-core/` zone.
- **State slices: zero movable.** All 53 slices are either multi-feature or composed into the global combined reducers / render effects. The two single-touch slices (`sortingOrderAscending`, `currentFilesAreSampleFiles`) are blocked by state-core wiring. Don't move slices — consolidate the divergent per-feature store wrappers instead.
- **Effects/selectors yield 5 clean quick-win MOVEs:** `blacklistExtension/`→fileExtensionBar, `blacklistSearchPattern/`→sidebarExplorer, `resetChosenMetrics/`→globalSettings, `updateQueryParameters/`→loadFile, and selector `amountOfBuildingsWithSelectedEdgeMetric/`→metricsBar. Each is low-effort, high-confidence, target already imports from the slice (no cycle risk).
- **4 effects look dead** (`linkColorMetricToHeightMetric/`, `resetSelectedEdgeMetricWhenItDoesntExistAnymore/`, `unfocusNodes/`, `updateMapColors/`) — referenced only by their own specs. Confirm they aren't glob-registered, then delete.
- **Biggest safe win:** the 10 MOVEs + 1 delete are all small/high-confidence and touch ~1–2 import paths each; they meaningfully shrink `util/` and `state/effects/` without any slice surgery.

## Recommended roadmap

Ordered by ascending risk/effort. Prefer **one PR per feature-slice** so each PR has a single owner and a self-contained review.

### Wave 1 — Quick wins (high-confidence, small-effort, single-owner)

1. **Delete the dead pipe.** Remove `util/pipes/truncateText.pipe.ts` + spec. Zero consumers, zero risk. (Keep the surrounding `util/pipes/` dir — its other two pipes are cross-feature.)
2. **Move the two self-contained util directories** (one PR each):
   - `util/color/` → `features/codeMap/util/color/`
   - `util/gameObjectsParser/` → `features/navBar/util/gameObjectsParser/` (whole dir: importer, validator, schema, mocks, specs)
3. **Move the four single-feature effects + one selector** (group per target feature → up to 5 PRs):
   - `state/effects/blacklistExtension/` → `features/fileExtensionBar/`
   - `state/effects/resetChosenMetrics/` → `features/globalSettings/stores/`
   - `state/effects/updateQueryParameters/` → `features/loadFile/`
   - `state/selectors/amountOfBuildingsWithSelectedEdgeMetric/` → `features/metricsBar/selectors/`
   - `state/effects/blacklistSearchPattern/` → `features/sidebarExplorer/stores/` **(verify real effect registration first — current wiring may be test-only)**

   Why grouped here: each has exactly one real consumer that already imports from the slice, so there is no circular-import risk. The only mechanical step is repointing the global ngrx effect registration (or one selector import path).

### Wave 2 — Medium (single-owner, but needs a confirmation step)

4. **Consolidate the file-ingestion trio** into their owning features (one PR, since they relocate as a cluster):
   - `util/fileParser.ts` + `util/fileValidator.ts` → `features/loadFile/`
   - `util/fileHelper.ts` → `features/navBar/`

   Slightly higher effort because the spec/relative import paths fan out (loadFile specs, the `globalSettings` spec that imports `fileParser`, navBar e2e/spec for `fileValidator`). This removes the file-handling cluster that made `util/` feel like a dumping ground.
5. **Delete the 4 dead effects** (one PR): `linkColorMetricToHeightMetric/`, `resetSelectedEdgeMetricWhenItDoesntExistAnymore/`, `unfocusNodes/`, `updateMapColors/`. Confirm none are registered via a glob/dynamic `provideEffects` before removal — that confirmation is the only thing keeping these out of Wave 1.

### Wave 3 — Structural / shared cleanups (no relocation, traceability-focused)

6. **Carve out `util/state-core/`.** Group the 6 state-only modules (`aggregationGenerator`, `arrayHelper`, `deltaGenerator`, `nodeDecorator`, `settingsHelper`, `fileRoot`) into a labelled subfolder. They have no feature owner; naming the boundary stops feature code reaching in.
7. **Tackle the state wrapper sprawl** (the actual fix for "nicht nachvollziehbar"): one store wrapper per slice named after the slice, co-located with (or indexed alongside) its slice, and explicit documentation of state-core coupling at the slice boundary. No slices move — this is purely about making ownership discoverable.

---

## Util

## `util/` Breadth Reduction

The maintainer's instinct is correct: of the 29 classified modules, **8 are owned by exactly one feature** and can leave `util/` outright, while the genuinely shared core is smaller and clearer than the current flat folder suggests. The breadth comes from mixing three very different things in one folder: (1) feature-private helpers that never escaped their feature, (2) the shared `state-core` foundation, and (3) truly cross-feature generic utilities.

### MOVE candidates (sole owning feature)

These have exactly one real (non-test) feature consumer and nothing in `state/` core, `util/` peers, or the `codeCharta` root depending on them. Move them into the owning feature.

| Module | Sole owning feature | Confidence | Effort | Why |
|---|---|---|---|---|
| `util/fileHelper.ts` | `navBar` | high | small | Only real importer is `navBar/services/uploadFiles.service.ts`; `loadFile`'s hit is test-only. |
| `util/fileParser.ts` | `loadFile` | high | small | Real importers are `loadFile.service.ts` + `loadInitialFile.service.ts`; other hits are specs (incl. a `globalSettings` spec). |
| `util/fileValidator.ts` | `loadFile` | high | small | Real importers `loadFile.service.ts` + `loadFilesValidationToErrorDialog.ts` only; `navBar` hits are `.e2e`/`.spec`. |
| `util/color/` | `codeMap` | high | small | All 5 real importers under `features/codeMap/` (rendering/arrow/threeViewer); 2 are specs. → `features/codeMap/util/`. |
| `util/gameObjectsParser/` | `navBar` | high | small | Single real importer `navBar/services/readFiles.ts`; move the whole dir (validator, schema, mocks, specs). |

> Note: `fileParser`, `fileValidator`, and `fileHelper` all funnel into the same `loadFile`/`navBar` file-ingestion area, so they relocate together cleanly (see proposal).

### KEEP_SHARED (cannot be owned by one feature)

Grouped by the reason they must stay in `util/`.

**Used by 2+ features (no state-core dependency)**

| Module | Consuming features |
|---|---|
| `util/EventEmitter.ts` | codeMap, viewCube |
| `util/debounce.ts` | globalSettings, sidebarExplorer, codeMap, metricsBar, labelSettings |
| `util/fileDownloader.ts` | 3dPrint, scenarios |
| `util/fileNameHelper.ts` | navBar, 3dPrint |
| `util/parseNumberInput.ts` | metricsBar, labelSettings |
| `util/urlExtractor.ts` | globalSettings, loadFile |
| `util/fileExtension/` | codeMap, fileExtensionBar |
| `util/metric/` | legend, 3dPrint |
| `util/pipes/` | legend, sidebarInspector, metricsBar |

**Used by 2+ features AND state-core**

| Module | Consuming features | State-core consumer(s) |
|---|---|---|
| `util/clone.ts` | loadFile, codeMap | edges.merger, accumulatedData.selector |
| `util/codeMapHelper.ts` | sidebarExplorer, viewCube, metricsBar | effects, accumulatedData selectors |
| `util/dispatchAfterPaint.ts` | sidebarExplorer, nodeContextMenu, shared, fileExtensionBar | renderCodeMap.effect |
| `util/nodePathHelper.ts` | codeMap, labelSettings | markedPackages/blacklist/edges mergers, addMarkedPackage |
| `util/blacklist/` | sidebarExplorer, 3dPrint, codeMap | effects, searchedNodes/metricData selectors, blacklist store |
| `util/indexedDB/` | globalSettings, loadFile, scenarios | saveCcState.effect |

**State-core only (no feature consumer → no feature to move into)**

| Module | State-core consumer |
|---|---|
| `util/aggregationGenerator.ts` | accumulatedData.selector |
| `util/arrayHelper.ts` | visibleFileStates selector; blacklist/edges/markedPackages reducers |
| `util/deltaGenerator.ts` | accumulatedData/utils/getDeltaFile |
| `util/nodeDecorator.ts` | accumulatedData.selector (other 3 importers are tests) |
| `util/settingsHelper.ts` | store/util/getPartialDefaultState |
| `util/fileRoot.ts` | focusedNodePath.reducer (also consumed by loadFile feature) |

**2+ features AND root**

| Module | Consuming features | Root consumer |
|---|---|---|
| `util/algorithm/` | codeMap, labelSettings | `codeCharta.model.ts` (imports `streetLayout/rectangle`) |

### DELETE candidate (dead / test-only)

- **`util/pipes/truncateText.pipe.ts`** — `TruncateTextPipe` has no external importers; only its own spec consumes it. The surrounding `util/pipes/` directory stays shared (the other two pipes are cross-feature), but this file can be deleted independently. This is a per-file deletion *inside* a KEEP_SHARED dir, not a directory move.

No module was classified test-only/dead at the unit level — every other module has at least one real production importer.

### Reduce-breadth proposal (quick-win first)

The end state splits today's flat `util/` into **feature homes** (private helpers that leave) and a slimmer shared `util/` with a clearly labelled **state-core** zone.

1. **Quick win — delete the dead pipe.** Remove `util/pipes/truncateText.pipe.ts` (+ its spec). Zero consumers, zero risk, immediately shrinks the surface.
2. **Move the two self-contained directories.**
   - `util/color/` → `features/codeMap/util/color/`
   - `util/gameObjectsParser/` → `features/navBar/util/gameObjectsParser/` (move dir wholesale: importer, validator, schema json, mocks, specs).
   These are dir-level, single-feature, and touch only ~1 import path each besides their own internals.
3. **Consolidate the file-ingestion trio into `loadFile`/`navBar`.** Move `fileParser.ts` and `fileValidator.ts` → `features/loadFile/`, and `fileHelper.ts` → `features/navBar/`. Update the few test/relative import paths (loadFile specs, the `globalSettings` spec for `fileParser`, navBar e2e/spec for `fileValidator`). This removes the file-handling cluster that made `util/` feel like a dumping ground.
4. **Carve out a `util/state-core/` subfolder for the state-only modules.** Group `aggregationGenerator`, `arrayHelper`, `deltaGenerator`, `nodeDecorator`, `settingsHelper`, `fileRoot` (and the state-core-coupled `clone`-adjacent helpers stay in generic util). These have *no* feature owner and exist solely for `state/`; naming the subfolder makes the "this is the state foundation, not a feature helper" boundary explicit and discourages future feature code from reaching in.
5. **Leave the genuinely generic + multi-feature shared modules at the top of `util/`.** `EventEmitter`, `debounce`, `clone`, `codeMapHelper`, `dispatchAfterPaint`, `nodePathHelper`, `parseNumberInput`, `urlExtractor`, `fileDownloader`, `fileNameHelper`, and the dirs `algorithm/`, `blacklist/`, `fileExtension/`, `indexedDB/`, `metric/`, `pipes/`. `algorithm/` also stays because the root `codeCharta.model.ts` depends on it.

**Resulting shape:**
```
util/
  state-core/        # aggregationGenerator, arrayHelper, deltaGenerator,
                     # nodeDecorator, settingsHelper, fileRoot
  algorithm/  blacklist/  fileExtension/  indexedDB/  metric/  pipes/
  EventEmitter, debounce, clone, codeMapHelper, dispatchAfterPaint,
  nodePathHelper, parseNumberInput, urlExtractor, fileDownloader, fileNameHelper
features/
  codeMap/util/color/
  navBar/util/gameObjectsParser/ , navBar/.../fileHelper
  loadFile/.../fileParser , loadFile/.../fileValidator
```
This removes 5 modules from `util/` entirely, deletes 1 dead pipe, and re-homes 6 state-only modules into a labelled subfolder — turning "too broad" into a generic-shared core + an explicit state-core zone.

## State slices

## State Slices

Every global ngrx slice in `state/store/` was classified. The headline finding: **of 53 analysed slices, exactly zero are owned by a single feature in a way that permits relocation.** Two slices are touched by only one feature, but both are also wired into shared state-core, so even those cannot move. The rest are consumed by 2+ features. State is hard to trace not because slices are mis-located, but because the *wrapper layer* is scattered.

### Ownership Map

Single-feature slices (would-be MOVE candidates, but blocked) are grouped at the top; multi-feature shared slices follow, ordered by consumer count.

| Slice | Consuming features | hasFeatureWrapper | Recommendation |
|---|---|---|---|
| `appSettings/sortingOrderAscending/` | sidebarExplorer (+ state-core) | sidebarExplorer | KEEP_SHARED (blocked by state-core) |
| `appStatus/currentFilesAreSampleFiles/` | loadFile (+ state-core) | loadFile | KEEP_SHARED (blocked by state-core) |
| `appSettings/amountOfTopLabels/` | loadFile, labelSettings | labelSettings | KEEP_SHARED |
| `appSettings/edgeHeight/` | loadFile, metricsBar | metricsBar | KEEP_SHARED |
| `appSettings/enableClipboard/` | globalSettings, loadFile | globalSettings | KEEP_SHARED |
| `appSettings/enableExperimentalFeatures/` | globalSettings, loadFile | globalSettings | KEEP_SHARED |
| `appSettings/enableFloorLabels/` | loadFile, metricsBar | metricsBar | KEEP_SHARED |
| `appSettings/groupLabelCollisions/` | loadFile, labelSettings | labelSettings | KEEP_SHARED |
| `appSettings/hideFlatBuildings/` | globalSettings, loadFile | globalSettings | KEEP_SHARED |
| `appSettings/invertArea/` | loadFile, metricsBar | metricsBar | KEEP_SHARED |
| `appSettings/invertHeight/` | loadFile, metricsBar | metricsBar | KEEP_SHARED |
| `appSettings/isEdgeMetricVisible/` | loadFile, metricsBar | metricsBar | KEEP_SHARED |
| `appSettings/isHeightAndColorMetricLinked/` | metricsBar, loadFile | metricsBar | KEEP_SHARED |
| `appSettings/isLoadingMap/` | navBar, scenarios | navBar | KEEP_SHARED |
| `appSettings/isPresentationMode/` | viewCubeToolbox, loadFile | viewCubeToolbox | KEEP_SHARED |
| `appSettings/isWhiteBackground/` | globalSettings, loadFile | globalSettings | KEEP_SHARED |
| `appSettings/labelMode/` | loadFile, labelSettings | labelSettings | KEEP_SHARED |
| `appSettings/labelSize/` | loadFile, labelSettings | labelSettings | KEEP_SHARED |
| `appSettings/labelsPerMap/` | loadFile, labelSettings | labelSettings | KEEP_SHARED |
| `appSettings/layoutAlgorithm/` | globalSettings, loadFile | globalSettings | KEEP_SHARED |
| `appSettings/maxTreeMapFiles/` | globalSettings, loadFile | globalSettings | KEEP_SHARED |
| `appSettings/resetCameraIfNewFileIsLoaded/` | globalSettings, loadFile | globalSettings | KEEP_SHARED |
| `appSettings/showMetricLabelNameValue/` | labelSettings, loadFile | labelSettings | KEEP_SHARED |
| `appSettings/showMetricLabelNodeName/` | labelSettings, loadFile | labelSettings | KEEP_SHARED |
| `appSettings/showOnlyBuildingsWithEdges/` | loadFile, metricsBar | metricsBar | KEEP_SHARED |
| `appStatus/hoveredNodeId/` | sidebarExplorer, codeMap | sidebarExplorer | KEEP_SHARED |
| `appStatus/selectedBuildingId/` | sidebarExplorer, codeMap (+ state-core) | sidebarExplorer | KEEP_SHARED |
| `dynamicSettings/colorRange/` | legend, loadFile, metricsBar | metricsBar | KEEP_SHARED |
| `dynamicSettings/distributionMetric/` | loadFile, fileExtensionBar | loadFile | KEEP_SHARED |
| `dynamicSettings/searchPattern/` | sidebarExplorer, loadFile | sidebarExplorer | KEEP_SHARED |
| `dynamicSettings/sortingOption/` | sidebarExplorer, loadFile | sidebarExplorer | KEEP_SHARED |
| `appSettings/amountOfEdgePreviews/` | loadFile, codeMap, metricsBar | metricsBar | KEEP_SHARED (codeMap render) |
| `appSettings/colorLabels/` | loadFile, codeMap, labelSettings | labelSettings | KEEP_SHARED (codeMap render) |
| `appSettings/scaling/` | loadFile, metricsBar (+ state-core effects) | metricsBar | KEEP_SHARED (render effect) |
| `appSettings/showEdges/incoming/` | loadFile, codeMap, metricsBar | metricsBar | KEEP_SHARED (codeMap render) |
| `appSettings/showEdges/outgoing/` | loadFile, codeMap, metricsBar | metricsBar | KEEP_SHARED (codeMap render) |
| `appStatus/rightClickedNodeData/` | sidebarExplorer, nodeContextMenu, codeMap | sidebarExplorer | KEEP_SHARED |
| `dynamicSettings/colorMetric/` | legend, loadFile, metricsBar (+ state-core) | legend | KEEP_SHARED |
| `dynamicSettings/colorMode/` | 3dPrint, loadFile, metricsBar (+ state-core) | 3dPrint | KEEP_SHARED |
| `dynamicSettings/heightMetric/` | legend, metricsBar, loadFile (+ state-core) | metricsBar | KEEP_SHARED |
| `dynamicSettings/margin/` | loadFile, metricsBar (+ state-core) | metricsBar | KEEP_SHARED |
| `dynamicSettings/focusedNodePath/` | nodeContextMenu, loadFile (+ state-core effects) | nodeContextMenu | KEEP_SHARED |
| `fileSettings/attributeTypes/` | loadFile, metricsBar (+ state-core) | metricsBar | KEEP_SHARED |
| `fileSettings/edges/` | loadFile, codeMap (+ state-core) | loadFile | KEEP_SHARED |
| `appSettings/isLoadingFile/` | navBar, shared, codeMap, scenarios (+ root) | shared | KEEP_SHARED |
| `dynamicSettings/edgeMetric/` | legend, loadFile, codeMap, metricsBar (+ state-core) | legend | KEEP_SHARED |
| `fileSettings/attributeDescriptors/` | legend, sidebarInspector, loadFile, metricsBar | legend | KEEP_SHARED |
| `fileSettings/markedPackages/` | sidebarExplorer, nodeContextMenu, loadFile, metricsBar | sidebarExplorer | KEEP_SHARED |
| `files/` | 3dPrint, loadFile, navBar, scenarios | loadFile | KEEP_SHARED |
| `dynamicSettings/areaMetric/` | legend, sidebarExplorer, loadFile, metricsBar, fileExtensionBar (+ state-core) | metricsBar | KEEP_SHARED |
| `fileSettings/blacklist/` | sidebarExplorer, nodeContextMenu, loadFile, codeMap, fileExtensionBar | sidebarExplorer | KEEP_SHARED |
| `util/` | globalSettings, shared, labelSettings (+ state-core) | globalSettings | KEEP_SHARED |
| `appSettings/mapColors/` | legend, sidebarInspector, nodeContextMenu, loadFile, codeMap, metricsBar, labelSettings | legend | KEEP_SHARED |

### MOVE Candidates

**None.** No slice in the dataset can be relocated into a single feature's `stores/`.

The two slices touched by only one feature (`sortingOrderAscending` → sidebarExplorer, `currentFilesAreSampleFiles` → loadFile) are the only structural candidates, but both are **disqualified by a state-core dependency**: their reducers/actions are composed into the global `appSettings`/`appStatus` aggregate, and `currentFilesAreSampleFiles` additionally drives the `updateQueryParameters` effect. Moving either would break the canonical combined-reducer wiring and create a feature→state cycle. They are listed here for completeness rather than as actionable moves.

| Slice | Sole owning feature | Confidence | Effort | Why it still cannot move |
|---|---|---|---|---|
| `appSettings/sortingOrderAscending/` | sidebarExplorer | high | small | Only sidebarExplorer consumes it for real, but its reducer/actions are aggregated into the global `appSettings` reducer/actions (state-core) and participate in SET_STATE/partial-state composition. |
| `appStatus/currentFilesAreSampleFiles/` | loadFile | high | small | Only loadFile consumes it, but its reducer is composed into the global `appStatus` reducer and its action drives the `state/effects/updateQueryParameters` effect (state-core). |

### Genuinely SHARED-CORE Slices (must stay in `state/`)

These are consumed by 2+ features and/or by codeMap rendering / root / state-core, so they are correctly shared. Grouped by reason:

**Consumed by 2+ features only**
- `appSettings/amountOfTopLabels/`, `edgeHeight/`, `enableClipboard/`, `enableExperimentalFeatures/`, `enableFloorLabels/`, `groupLabelCollisions/`, `hideFlatBuildings/`, `invertArea/`, `invertHeight/`, `isEdgeMetricVisible/`, `isHeightAndColorMetricLinked/`, `isLoadingMap/`, `isPresentationMode/`, `isWhiteBackground/`, `labelMode/`, `labelSize/`, `labelsPerMap/`, `layoutAlgorithm/`, `maxTreeMapFiles/`, `resetCameraIfNewFileIsLoaded/`, `showMetricLabelNameValue/`, `showMetricLabelNodeName/`, `showOnlyBuildingsWithEdges/`
- `appStatus/hoveredNodeId/`, `rightClickedNodeData/`
- `dynamicSettings/colorRange/`, `distributionMetric/`, `searchPattern/`, `sortingOption/`
- `fileSettings/attributeDescriptors/`, `markedPackages/`, `blacklist/`
- `files/`

**Consumed by codeMap rendering (cross-cuts the 3D pipeline)**
- `appSettings/amountOfEdgePreviews/`, `colorLabels/`, `showEdges/incoming/`, `showEdges/outgoing/` — all feed edge/label rendering in codeMap selectors.

**Bound to state-core (combined reducers, render effects, cross-cutting selectors)**
- `appSettings/scaling/` — `renderCodeMapEffect.actionsRequiringRerender`.
- `appStatus/selectedBuildingId/` — `appStatus` reducer + `selectedNode.selector`.
- `dynamicSettings/areaMetric/`, `colorMetric/`, `colorMode/`, `heightMetric/`, `edgeMetric/` — `primaryMetricNames` selector and/or `dynamicSettings` reducer + render effect.
- `dynamicSettings/margin/`, `focusedNodePath/` — `dynamicSettings` reducer; `focusedNodePath` also feeds `unfocusNodes`/`autoFitCodeMap`/`renderCodeMapEffect` and the `state.manager` whitelist.
- `fileSettings/attributeTypes/`, `edges/` — `fileSettings` reducer aggregation + `accumulatedData`/`edgeVisibility` selectors.
- `util/` — `setState.reducer.factory` underpins dozens of slice reducers; `getPartialDefaultState` reaches into defaultState/selectors/effects.

**Consumed by the root component**
- `appSettings/isLoadingFile/` — read by `codeCharta.component` (root) on top of four features.

**Cross-cutting hub (broadest fan-out)**
- `appSettings/mapColors/` — 7 features (legend, sidebarInspector, nodeContextMenu, loadFile, codeMap, metricsBar, labelSettings).

### Why state is not traceable — and what helps

The maintainer's "nicht nachvollziehbar" complaint is real, but the data shows the cause is **not** mis-placed slices. The canonical slice location (`state/store/...`) is consistent and correct. What breaks traceability is the **thin-wrapper layer**: nearly every slice is consumed indirectly through a per-feature `stores/*.store.ts` class, and one slice often has *several* wrappers across different features (e.g. `mapColors` has `mapColors.store.ts` in legend, sidebarInspector, and metricsBar; `blacklist` has three differently named wrappers). To trace "where does this value get set?", a reader must jump slice → action → N feature wrappers → consuming components, with no single index of who owns what. The dominance of `loadFile` (it co-consumes almost every appSettings/dynamicSettings slice via `loadInitialFile.store.ts`) further means almost nothing is truly single-owner.

Single-owner relocation does **not** apply here — there are no clean candidates — so the lever for traceability is the wrappers, not the slices:
1. **One wrapper per slice, named after the slice**, eliminating divergent per-feature names for the same global state.
2. **Co-locate each wrapper with its slice** (or register wrappers in a single discoverable index) so the slice and its access surface are read together.
3. **Make state-core coupling explicit** — the slices that "can't move" all share the same hidden reason (aggregated reducers, render effects, cross-cutting selectors); documenting these dependencies at the slice boundary is what actually restores nachvollziehbarkeit.

## Effects & selectors

## Effects & Cross-Cutting Selectors

`state/effects/` (ngrx effects) and `state/selectors/` (cross-cutting selectors) are global by construction. The classification below separates effects/selectors that are genuinely owned by a single feature (MOVE quick wins) from those that orchestrate shared infrastructure (render pipeline, persistence, url-sync, file-merge) or are consumed by 2+ features / `state-core` / `util` and must stay shared. Four effects appear to be dead/test-only and are flagged as DELETE candidates pending a confirm of the effects bootstrap.

### Effects

| Effect | Consuming features | Recommendation | Sole owner | Why |
| --- | --- | --- | --- | --- |
| `blacklistExtension/` | fileExtensionBar | **MOVE** | fileExtensionBar | Only non-spec importer is `features/fileExtensionBar/services/blackListExtension.service.ts` (wraps the action creator). Feature wrapper exists; no state-core/util/root/second-feature consumer. |
| `blacklistSearchPattern/` | sidebarExplorer | **MOVE** | sidebarExplorer | Only `sidebarExplorer/stores/searchPattern.store.ts` imports the action creator; effect class referenced only in a sidebarExplorer spec. Confirm real effect registration after moving (non-spec wiring looks absent). |
| `resetChosenMetrics/` | globalSettings | **MOVE** | globalSettings | Exactly one real importer: `features/globalSettings/stores/mapReset.store.ts` imports `setDefaultMetrics`. globalSettings already wraps the slice via its store. |
| `updateQueryParameters/` | loadFile | **MOVE** | loadFile | Only cross-folder importer is `features/loadFile` (`loadInitialFile.service.ts`); the effect itself imports loadFile's facade, so it is functionally owned by loadFile. Repoint global effect registration on move. |
| `addBlacklistItemsIfNotResultsInEmptyMap/` | — (state-core) | **KEEP_SHARED** | — | Sibling state-core effect `blacklistSearchPattern/` injects it and reuses its `doBlacklistItemsResultInEmptyMap$` stream. Global core depends on it. |
| `amountOfEdgePreviews/` | — (root) | **KEEP_SHARED** | — | Only real importer is `app/app.config.ts` (registered in `provideEffects`). Depends on global appSettings + `amountOfBuildingsWithSelectedEdgeMetric` selector; metricsBar's thin wrapper does not consume the effect. |
| `autoFitCodeMapChange/` | — (root) | **KEEP_SHARED** | — | Registered in `app/app.config.ts`; cross-cuts codeMap (`ThreeMapControlsService`), globalSettings facade, and `renderCodeMapEffect`. Cannot be owned by one feature. |
| `renderCodeMapEffect/` | — (state-core) | **KEEP_SHARED** | — | Render pipeline. Two sibling state-core effects (`autoFitCodeMapChange`, `setLoadingIndicator`) import `RenderCodeMapEffect` / `actionsRequiringRerender`. Foundational shared infrastructure. |
| `resetColorRange/` | — (root) | **KEEP_SHARED** | — | Registered at root `provideEffects()` (app.config.ts:38); depends on multiple global selectors/actions + `codeCharta.model`. Cross-cutting. |
| `saveCcState/` | — (root) | **KEEP_SHARED** | — | Persistence. Debounce-writes entire CcState to IndexedDB; registered at app root, depends on global `util/indexedDB` + appStatus. Serves no single feature. |
| `setLoadingIndicator/` | — (root) | **KEEP_SHARED** | — | App-wide loading flag effect; registered at root, listens to `actionsRequiringRerender` + `visibleFileStates` across the whole app. |
| `updateEdgePreviews/` | — (root) | **KEEP_SHARED** | — | Registered in root `provideEffects([])`; depends on global `isEdgeMetricVisible` / `edgeMetric` slices. Part of canonical global effect set. |
| `updateFileSettings/` | — (state-core) | **KEEP_SHARED** | — | Core file-merge machinery: selects `visibleFileStatesSelector`, dispatches `setState` to merge edges/blacklist/markedPackages/attributeTypes across all visible files. Not feature-specific (medium confidence; registration point untraced). |
| `updateVisibleTopLabels/` | — (state-core) | **KEEP_SHARED** | — | `getNumberOfTopLabels` consumed by `state/store/util/getPartialDefaultState.ts` (global default-state computation). Must stay in state/. |
| `linkColorMetricToHeightMetric/` | — | **DELETE_CANDIDATE** | — | Zero importers outside its own folder/spec (class + `heightAndLinkedSelector`). No sole consuming feature → delete, not move. Verify it isn't registered via glob before removal (medium confidence). |
| `resetSelectedEdgeMetricWhenItDoesntExistAnymore/` | — | **DELETE_CANDIDATE** | — | Only its own `.effect.ts` / `.spec.ts` reference the class. Not in any EffectsModule/providers array. Quick confirm of providers list, then remove. |
| `unfocusNodes/` | — | **DELETE_CANDIDATE** | — | Single external hit is a test-only file (`navBar/services/uploadFiles.service.spec.ts`). No real consumer; appears unregistered. Verify global effects registration before removal. |
| `updateMapColors/` | — | **DELETE_CANDIDATE** | — | Only external `updateMapColors` hit (`3dPrint/.../mapMesh.ts`) is a coincidentally-named private method, not an import. No real consumers outside own folder. Confirm effects bootstrap before deleting. |

### Selectors

| Selector | Consuming features | Recommendation | Sole owner | Why |
| --- | --- | --- | --- | --- |
| `amountOfBuildingsWithSelectedEdgeMetric/` | metricsBar | **MOVE** | metricsBar | Exactly one real importer: `features/metricsBar/selectors/edgeAndColors.selectors.ts`. metricsBar already wraps it; no state-core/util/root/second-feature consumer. Two import-path updates. |
| `accumulatedData/` | legend, globalSettings, sidebarInspector, sidebarExplorer, 3dPrint, loadFile, codeMap, metricsBar, scenarios, fileExtensionBar (+ util, state-core) | **KEEP_SHARED** | — | Foundational map-node/`idToNode` selector consumed by 10 features plus shared `util/` (nodeDecorator, treeMapHelper, …) and global state defaults. Moving it would create util→feature cycles. |
| `allNecessaryRenderDataAvailable/` | — (state-core) | **KEEP_SHARED** | — | Only real importer is `resetChosenMetrics.effect.ts` (state-core); composes many global slices. Relocating would force state-core to depend inward on a feature. |
| `primaryMetrics/` | metricsBar, sidebarInspector | **KEEP_SHARED** | — | Two distinct features import `primaryMetricNamesSelector` (metricsBar store/selector + sidebarInspector selector). 2+ consumers → cannot move into one feature. |
| `referenceFile/` | navBar, loadFile | **KEEP_SHARED** | — | Two features consume it (loadFile store selects it, navBar selectors re-export it); also builds on global `filesSelector`. 2+ consumers → shared. |
| `searchedNodes/` | sidebarExplorer (+ util) | **KEEP_SHARED** | — | Besides sidebarExplorer, `util/algorithm/treeMapLayout/treeMapHelper.ts` imports `searchedNodePathsSelector` and is used across codeMap, labelSettings, streetLayout. Shared util peer blocks the move. |
| `visibleFileStates/` | codeMap (+ state-core) | **KEEP_SHARED** | — | Used by many global effects (addBlacklistItems, autoFit, resetColorRange, setLoadingIndicator, unfocusNodes, updateFileSettings, updateVisibleTopLabels) and cross-cutting selectors (accumulatedData, metricData, areMultipleMapsVisible). Both state-core and a feature depend on it. |

### Quick wins (single-feature MOVE)

- `blacklistExtension/` → `features/fileExtensionBar/` (service wrapper already exists)
- `blacklistSearchPattern/` → `features/sidebarExplorer/stores/` (confirm real effect registration — current wiring may be test-only)
- `resetChosenMetrics/` → `features/globalSettings/stores/` (only `setDefaultMetrics` is consumed)
- `updateQueryParameters/` → `features/loadFile/` (effect already imports loadFile's facade)
- `amountOfBuildingsWithSelectedEdgeMetric/` (selector) → `features/metricsBar/selectors/`

All five are low-effort/high-confidence. Each MOVE requires repointing the global ngrx effect registration (or selector import path); no circular-import risk since the target feature already imports from the slice.

### KEEP_SHARED — orchestration / cross-cutting (do not move)

- **Render pipeline:** `renderCodeMapEffect/`, `autoFitCodeMapChange/`, `setLoadingIndicator/`
- **Persistence / state-core:** `saveCcState/` (IndexedDB), `updateFileSettings/` (file-merge), `addBlacklistItemsIfNotResultsInEmptyMap/`, `updateVisibleTopLabels/`
- **Root-registered global effects:** `amountOfEdgePreviews/`, `resetColorRange/`, `updateEdgePreviews/`
- **Foundational selectors (2+ features / util / state-core):** `accumulatedData/`, `allNecessaryRenderDataAvailable/`, `primaryMetrics/`, `referenceFile/`, `searchedNodes/`, `visibleFileStates/`

> Note: no url-sync effect surfaced in this dataset; `updateQueryParameters/` (query-param sync) is the closest, and it is single-feature (loadFile) → MOVE, not shared.

### DELETE candidates (no consumer, confirm bootstrap first)

`linkColorMetricToHeightMetric/`, `resetSelectedEdgeMetricWhenItDoesntExistAnymore/`, `unfocusNodes/`, `updateMapColors/` — each referenced only by its own spec. Before deleting, confirm the effect is not registered via a glob/dynamic provider not captured by grep; grep found no `provideEffects`/`EffectsModule` registration for any of them.

## Guardrails

Pulled from the repo's feature-slice migration conventions — apply these to every MOVE in the roadmap:

- **ngrx only in stores/selectors.** Keep slice reducers, actions, and selectors as the only place that touches ngrx. When an effect/selector moves into a feature, it lands in that feature's `stores/` or `selectors/`, not in a component.
- **External access via components/facade.** Other features must reach a moved unit through the owning feature's components or its public facade — never by deep-importing a relocated internal file.
- **Shared utils stay in `util/` to avoid cycles.** If a util has 2+ feature consumers, a `util/` peer, a `state-core` consumer, or a root (`codeCharta.model.ts` / `codeCharta.component`) consumer, it stays shared. Moving it would create a `util → feature` or `state-core → feature` cycle. This is why `accumulatedData/`, `searchedNodes/`, and the entire state-core zone do not move.
- **Never re-export a `.po` from a facade.** Re-exporting a page-object pulls Playwright into the runtime bundle. Keep test/e2e artifacts out of any facade or barrel that production code imports.
- **Keep the global slice as the source of truth; move only when a single feature owns it.** A slice/effect/selector relocates only when it has exactly one real (non-spec) consumer AND no state-core/render-pipeline/root coupling. When in doubt, leave it global and document the coupling at the boundary — that is what restores nachvollziehbarkeit, not premature relocation.
