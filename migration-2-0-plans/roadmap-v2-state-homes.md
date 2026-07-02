---
name: viz-2.0-roadmap-v2-state-homes
issue:
state: proposal
version: 1
---

# Visualization 2.0 — Roadmap v2: State Homes

> **Goal (source of truth):** `Ideas/codecharta-2.0-refined-layers-and-state-homes.html` (ratified 2026-07-02).
> **Safety model (unchanged):** `migration-2-0-plans/CONVENTIONS.md` — snapshots ARE the behavior contract (never `-u`),
> Tidy First (structural vs behavioral commits separate), **code-boundary move THEN store-key reshape**, each boundary
> backed by a dep-cruiser rule staged `warn → error`.
> **Status:** proposal, corrected against an adversarial critique (see the last section). Slices 1–**5** are done; this plan
> goes from **today's runtime reality** to the ratified goal. Companion rule draft: `Ideas/dependency-cruiser.2.0.refined.cjs`.

## Where we are vs where we're going

**Today (runtime):** Slices 5–**9a** landed. **Slice 9a** stood up the first **lens-owned** store root,
**`state.metricsLensSource`**, moving `attributeTypes` + `attributeDescriptors` out of `fileSettings` into the metrics
lens (`fileSettings` now holds `blacklist`/`edges`/`markedPackages`; per-file `CCFile` still bundles all via the
`FileSettings & MetricsLensSource` intersection). **`edges` stays in `fileSettings` (DEFERRED** → dependency lens: it is a
merged render-model array). `lens-owns-ccjson-source` is **warn**. IndexedDB is at **v7**. **Slice 8** stood up the first
brand-new *home* from scratch, **`state.sharedView`** (`focusedNodePath` + `searchPattern`; `dynamicSettings` now holds
**only** `sortingOption`; `state-home-is-leaf` + `state-home-only-stores-import-ngrx` **error**). Below reflects the state
after Slice 7; append Slice 8's `sharedView` root and Slice 9a's `metricsLensSource` root to it.

**After Slice 7 (runtime):** Slices 5–**7** landed. The ex-`appearance/` module is now `mapState/`, and after Slice 7 its **34**
slices register under a real **`state.mapState`** root — the map-view leaf settings, the presentation stragglers
(`colorMode`/`colorRange`/`margin`/`layoutAlgorithm`/`isLoadingMap`), the transient interaction ids
(`hoveredNodeId`/`rightClickedNodeData`/`selectedBuildingId`), **and the metric selection**
(`areaMetric`/`heightMetric`/`colorMetric`/`distributionMetric`/`edgeMetric`). `dynamicSettings` is down to
`sortingOption`/`focusedNodePath`/`searchPattern`; `appStatus` to just `currentFilesAreSampleFiles`;
`state-home-is-leaf` + `state-home-only-stores-import-ngrx` are **error** for mapState. The metrics lens is now
**parameterized off view state** — it imports no blacklist/dynamicSettings selectors; the blacklist-aware
`nodeMetricDataSelector`/`metricRangeSelector` live in `state/selectors/nodeMetricData/`, and the pure calc +
`rangeOfMetric` moved to `util/metric`. The reshape machinery (state.manager dynamic-keys, the load applier's
`applyMapState`/`mapMapStateToAction`, scenario patch keys, IndexedDB record transform now at v5, and — new in Slice 7 —
the metric URL round-trip) is proven across three reshapes and reused by Slices 8–10. Still to move: focus/search →
sharedView; blacklist/markedPackages/edges/attributeTypes(/descriptors) out of `fileSettings`. **Two grab-bags
(`dynamicSettings`, `fileSettings`) remain; `appStatus` is nearly empty (Slices 8–10).**

**Goal:** `mapState` · `sharedView` · `preferences` are real store roots; lenses own the cc.json source, read-only +
parameterized; `fileStore` owns raw files; features are one flat top-level layer (no "shell", legend re-homed); CQRS
read/write facades on the homes; structure lens + a named renderer seam.

## Home assignment — the litmus applied to every current slice

| Current location | Slice(s) | → Home | Lands in |
|---|---|---|---|
| `appSettings` (the `appearance/` folder) | mapColors, colorLabels, showMetricLabel\*, scaling, invert\*, hideFlatBuildings, isWhiteBackground, edgeHeight, amountOf{Edge,Top}\*, labelSize, labelMode, groupLabelCollisions, labelsPerMap, isEdgeMetricVisible, show{Incoming,Outgoing,OnlyBuildingsWith}Edges | **mapState** | 5 (keystone) |
| `dynamicSettings` | colorMode, colorRange, margin · `appSettings` layoutAlgorithm, isLoadingMap · `appStatus` hoveredNodeId, rightClickedNodeData, selectedBuildingId | **mapState** | 6 (id re-expression → 13) |
| `dynamicSettings` | areaMetric, heightMetric, colorMetric, distributionMetric, edgeMetric | **mapState** | 7 |
| `dynamicSettings` | focusedNodePath, searchPattern | **sharedView** | 8 |
| `fileSettings` | edges → dependency lens; attributeTypes, attributeDescriptors → metrics lens | **lenses (source)** | 9a |
| `fileSettings` | blacklist | **sharedView** | 9b |
| `fileSettings` | markedPackages | **sharedView** | 9c |
| `appSettings` | experimentalFeatures, screenshotToClipboard, isColorMetricLinkedToHeight, isPresentationMode, maxTreeMapFiles, resetCameraIfNewFile, sortingOrderAscending + `dynamicSettings` sortingOption (merge → `sorting`) | **preferences** | 10 |
| `appSettings` isLoadingFile · `appStatus` currentFilesAreSampleFiles | | **fileStore** | 10 |

After Slice 10 the four grab-bag reducers (`appSettings`/`dynamicSettings`/`appStatus`/`fileSettings`) are **empty and
deleted** — "state has a home" is finally true at runtime.

## Ordering spine (canonical)

```
5   mapState ROOT (keystone — builds the reshape machinery)   ── MUST precede 6–10   ✅ DONE
6   mapState presentation stragglers                          ── needs 5             ✅ DONE
7   mapState metric SELECTION + parameterize metrics lens     ── needs 5; lens drops colorMetric + blacklist reads   ✅ DONE
8   sharedView stood up (focus + search only)                 ── needs 5; MUST precede 9b/9c   ✅ DONE
9a  cc.json source (attributeTypes/descriptors) → metrics lens── needs 5; edges DEFERRED   ✅ DONE
9b  blacklist → sharedView + parameterize BOTH lenses' blacklist read ── needs 8; unblocks lens-no-view-state flip
9c  markedPackages → sharedView                               ── needs 8
10  preferences (appSettings purge) + fileStore flags; DELETE grab-bags ── needs 5–9 · FLIP new-must-not-import-legacy, shared-state-is-leaf → error
11  features OUT of lenses + legend RE-HOME + kill "shell"     ── needs 6/7 · FLIP metrics-lens-ngrx-guard → error
12  CQRS read/write facade split on the homes + dedupe *Store wrappers ── needs 5–10
13  structure lens + renderer-agnostic selected-node id + named renderer seam (+ graphState) ── LAST · FLIP lens-no-view-state → error
```

## The reshape machinery (built once in Slice 5, reused by 6–10)

Every store-key reshape touches the same cross-cutting infra keyed off the current `CcState` shape. Slice 5 generalizes
each **once** so later slices only *add a key*:

1. `state/store/state.manager.ts` — `appReducers`/`defaultState` registration **and** `_applyPartialState`'s hardcoded
   `objectWithDynamicKeysInStore` dotted paths.
2. **URL round-trip** — `state/effects/updateQueryParameters/*` + `fileStore/loaders/ccJson/util/urlExtractor.ts`.
3. **Scenarios** — `features/scenarios/services/scenarioApplier.service.ts` builds `RecursivePartial<CcState>` patches
   literally keyed `appSettings`/`dynamicSettings`/`fileSettings`.
4. **IndexedDB** — `util/indexedDB/indexedDBWriter.ts` persists **raw `CcState`** (`DB_VERSION = 2`).
5. **Dotted-path readers** — ~18 `state.appSettings.*`, ~27 `state.dynamicSettings.*`, ~9 `state.fileSettings.*`,
   1 `state.appStatus.*` (non-spec) that read by path, not selector import.
6. `state/loadInitialFile/loadInitialFile.store.ts` — the applier (already outside fileStore since Slice 4).

> ⚠️ **Silent-data-loss landmine (must be handled in Slice 5, not deferred).** `_applyPartialState`'s `isKeyOf` guard
> **silently drops** keys absent from the new default state, and IndexedDB `openCodeChartaDB.upgrade` today only *creates
> object stores* — `readCcState` returns the record verbatim. So a bare `DB_VERSION` bump re-homes **nothing**: an old
> `appSettings.*`/`fileSettings.*` blob quietly reverts to defaults with **no crash and no snapshot signal**. Slice 5 must
> add **real record-transform code inside `upgrade`** (read the old `ccstate` record *and every `scenarios` record*, rewrite
> the moved keys), with an e2e that rehydrates from an old-shape blob. Same requirement each later reshape slice.

---

## Slices

### Slice 5 — Keystone: the real `state.mapState` root — ✅ DONE
- **Outcome:** landed in two commits — (1) structural `git mv appearance → mapState` + facade rename + 87-importer repoint +
  dep-cruiser `shared-state-is-leaf → state-home-is-leaf` (zero snapshot diff); (2) the store-key reshape: `MapState` split out
  of `AppSettings`, `mapState` root registered in `state.manager`, all ~67 dotted readers + ~46 string reset-keys + selectors
  repointed, applier `applyMapState`/`mapMapStateToAction` added, scenario patches re-keyed to `mapState`, IndexedDB `DB_VERSION
  2→3` with `migrateCcStateRecordToV3` (+5 tests). `tsc` clean, `npm test` green with **zero snapshot diff (45/45, no -u)**,
  `lint:architecture` 0 errors. **Scope narrowed from the plan** (both verified in code): the **URL round-trip needed no change**
  (only metric/mode/file params are URL-serialized — appearance settings never were) and the **scenarios IndexedDB store needed
  no transform** (scenarios persist section-shaped, not store-shaped; only the `ccstate` record re-homes). `state-home-is-leaf`
  stays **warn** (flips to error for mapState in Slice 6).
- **Goal:** stop combining the appearance slices under `appSettings`; give them a real `state.mapState.*` root. First time
  "state has a home" is true at runtime.
- **Keystone cost:** generalize the whole reshape machinery (1–6) on the **safest payload** — Slice 4's byte-identical
  appearance values, so snapshots pin the entire change. Front-loaded on purpose so Slices 6–10 are "add a key".
- **Moves:** (a) structural pre-commit `git mv app/codeCharta/appearance → app/codeCharta/mapState` (repoint imports, zero
  snapshot diff); (b) reshape commit: `mapState` root in `state.manager`; pull the slices out of `appSettings.reducer`'s
  `combineReducers`; `mapState: MapState` on `CcState`; migrate the dynamic-key paths; repoint the ~18 dotted readers;
  scenario patch-key `appSettings→mapState` **+ scenarios-store record transform**; URL round-trip; `DB_VERSION 2→3` **+
  real `upgrade` re-home of the `ccstate` blob**.
- **DoD:** `state.mapState.*` real; `tsc` clean; `npm test` green **zero snapshot diff, no `-u`**; e2e upload / URL round-trip /
  **scenario save+apply** / **IndexedDB rehydrate-from-old-blob** all green; manual smoke of colors/labels/edges vs `main`.
- **dep-cruiser:** rename `shared-state-is-leaf` → `state-home-is-leaf`, target `(appearance|mapState)` **simultaneously** so
  the rename leaves no unguarded window. Stays **warn**.
- **Risk / size:** **HIGH / MED-LARGE** — the only slice that first-touches every persistence path. **Precedes 6–10.**

### Slice 6 — Absorb mapState presentation stragglers — ✅ DONE
- **Outcome (2026-07-02, 3 commits):** structural `git mv` of the 8 slice folders into `mapState/store/` (49 importers +
  3 parent reducers/barrels repointed, facade exports added, zero snapshot diff); behavioral store-key reshape (model split;
  `mapState` combineReducers gains the 8 keys; 8 leaf selectors + `globalSettings.layoutAlgorithm` + `3dPrint.colorRange/colorMode`
  read `mapStateSelector`; applier dispatches colorMode/colorRange/margin/layoutAlgorithm from `mapMapStateToAction` and no-ops
  isLoadingMap + the 3 interaction ids; scenario colors patch → `mapState`; IndexedDB `DB_VERSION 3→4` + `migrateCcStateRecordToV4`
  chained after v3, +5 tests); dep-cruiser flip. `tsc` clean, `npm test` **zero snapshot diff (45/45, no -u)**, 2275 tests,
  `lint:architecture` 0 errors. Details: `slice-6-mapstate-stragglers.md`.
- **Two behavior landmines handled** (not deferred): (a) **appStatus was never applied on load**, so the 3 interaction ids +
  isLoadingMap are **no-ops** in the mapState applier; (b) **`colorRange`'s first-render null-gate** in `areDynamicSettingsAvailable`
  is preserved by folding `mapState.colorRange` back into the availability selector.
- **Goal:** `colorMode`, `colorRange`, `margin`, `layoutAlgorithm`, `isLoadingMap`, and transient `hoveredNodeId` /
  `rightClickedNodeData` / `selectedBuildingId` → `mapState`.
- **DoD:** these eight under `state.mapState`; `appStatus` holds only `currentFilesAreSampleFiles`; snapshots byte-identical ✅
  (e2e select/hover/context-menu/color-range: CI/manual, not run in this env).
- **dep-cruiser:** flipped `state-home-is-leaf` → **error** for `mapState` and added `state-home-only-stores-import-ngrx` →
  **error**. `selectedBuildingId` stays a Three.js id here (renderer-agnostic id → Slice 13). **Risk was:** MED/MED.

### Slice 7 — Map metric SELECTION + parameterize the metrics lens — ✅ DONE
- **Outcome (2026-07-02, 4 commits):** (1) structural `git mv` of the 5 metric folders into
  `mapState/store/` (53 importers → `mapState.facade`, +15 re-exports; `.spec/.e2e` exempted from
  `filestore-has-no-upward-deps`, no severity flip); (2) store-key reshape — `MapState extends
  PrimaryMetrics` + `distributionMetric`, `DynamicSettings` down to sortingOption/focusedNodePath/
  searchPattern, applier + scenarios + URL round-trip (`updateQueryParameters` now reads
  `state.mapState`) + IndexedDB `v4→v5` (`migrateCcStateRecordToV5`, +4 tests) + the availability gate
  folds the 5 metrics back in from mapState so first-render stays value-identical; (3) structural move
  of the pure `calculateNodeMetricData` + `rangeOfMetric`/`MetricRange` into `util/metric` (breaks the
  derived-selector cycle); (4) lens parameterization — the blacklist/colorMetric-reading
  `nodeMetricDataSelector`/`metricRangeSelector` moved OUT of the lens into
  `state/selectors/nodeMetricData/`, the lens store re-reads them from there, +parity test. `tsc`
  clean, `npm test` **45/45 snapshots zero diff (no -u)**, 2281 passing, `lint:architecture` 0 errors
  (114→109 warn bridges). Metrics lens imports **no** blacklist and **no** dynamicSettings selectors
  (grep-verified). Details: `slice-7-mapstate-metrics.md`.
- **Goal:** `areaMetric`/`heightMetric`/`colorMetric`/`distributionMetric`/`edgeMetric` → `mapState` (resolves CF **#3** +
  **#2b-selection**), and **parameterize the metrics lens off view state**.
- **Lens parameterization (P0-1, half 1):** the metrics lens today reads **two** view-state inputs, not one —
  `colorMetricSelector` (selection) **and** `blacklistMatcherSelector` (`metricsLens.selectors.ts:4,23`). Expose
  `rangeOf(metric)` (min/max, needs no node ids — `valueOf` stays deferred to 13); and lift the **blacklist filtering** out
  of `nodeMetricDataSelector` into a **derived selector** (page/feature layer) that composes the lens's raw projection with
  the blacklist — the lens stops importing `blacklist`. The map feature supplies `mapState.colorMetric`.
- **Moves:** code-boundary `git mv` the five metric folders → `mapState/store/*` + reshape; repoint URL round-trip
  (`actionsRequiringUpdateQueryParameters`), the `resetChosenMetrics`/`linkColorMetricToHeightMetric`/`resetSelectedEdgeMetric`
  effects, and the 3 edge effects. Metrics-lens: add `rangeOf`, move blacklist filtering to derived.
- **DoD:** metric selection in `mapState`; the metrics lens imports **no** `state/dynamicSettings` **and no** `blacklist`
  selectors; parity test `rangeOf(metric)` value-equals the old range before deleting the old read; snapshots byte-identical;
  e2e metric-picker + URL metric params green.
- **dep-cruiser:** `new-must-not-import-legacy` edge count drops; no flip yet. **Precedes 11** (lens off ngrx-selection first). **Risk:** MED-HIGH/LARGE.

### Slice 8 — Stand up `sharedView` (focus + search only) — ✅ DONE
- **Outcome (2026-07-02, 3 commits):** (1) structural `git mv` of the two leaf folders
  `dynamicSettings/{focusedNodePath,searchPattern}` → `sharedView/store/*` (+ `sharedView.facade`; ~18 importers
  repointed; `dynamicSettings` combineReducers keeps both alive via cross-import → zero snapshot diff); (2) store-key
  reshape — model split (`DynamicSettings = { sortingOption }`; new `SharedView` on `Settings` + `CcState`), `sharedView`
  root registered in `state.manager`, the 2 leaf selectors read `sharedViewSelector`, applier `applySharedView`/
  `mapSharedViewToAction` (wired into both load paths), scenario `buildFiltersPatch` re-keyed `dynamicSettings → sharedView`
  (+ `mergePatches`), the `treeMapHelper`/`scenarios.service` dotted readers repointed to `state.sharedView.*`,
  `objectWithDynamicKeysInStore` entry renamed to `sharedView.focusedNodePath`, IndexedDB `v5→v6` (`migrateCcStateRecordToV6`
  — the **first** migration that CREATES a new root, +6 tests); (3) dep-cruiser flip. `tsc` clean, `npm test` **45/45
  snapshots zero diff (no -u)**, 2287 passing, `lint:architecture` 0 errors. All three landmines held (#1 array-corruption
  guard renamed; #2 new-root migration builds from defaults; #3 URL untouched; #4 no availability fold-back). No
  `new-must-not-import-legacy` edge drop (landmine #5) — focus/search have no lens/fileStore importers. Details:
  `slice-8-sharedview.md`.
- **Goal:** create the `sharedView` home; move the two cleanest cross-renderer values: `focusedNodePath`, `searchPattern`.
  (The renderer-agnostic **selected-node id is NOT here** — it needs the Slice-13 `idToNode` untangle; keep this slice small.)
- **DoD:** `state.sharedView.{focusedNodePath,searchPattern}` real ✅; `dynamicSettings` holds only `sortingOption` ✅;
  snapshots byte-identical ✅ (e2e focus/unfocus + search: CI/manual, not run in this env).
- **dep-cruiser:** extended `state-home-is-leaf` **and** `state-home-only-stores-import-ngrx` to `sharedView` — both **error**.
  **Precedes 9b/9c.** **Risk was:** LOW-MED/SMALL-MED.

### Slice 9a — cc.json source → lenses — ✅ DONE
- **Outcome (2026-07-02, 3 commits):** `attributeTypes`/`attributeDescriptors` moved out of the `fileSettings` state
  slice into a lens-owned **`state.metricsLensSource`** root (`lenses/metrics/store/`), behind a read facade (raw
  `{nodes,edges}` `attributeTypesSelector` + `attributeDescriptorsSelector`) and a new write/wiring **load facade**
  (`metricsLens.load.facade`). Per-file `CCFile.settings.fileSettings` still bundles them via the intersection
  `FileSettings & MetricsLensSource` (the .cc.json contract). `state.manager` root registration + the two
  `objectWithDynamicKeysInStore` paths repointed; applier `applyMetricsLensSource`/`mapMetricsLensSourceToAction`;
  `updateFileSettings.effect` co-emits both roots in ONE setState; ~9 dotted/selector readers repointed; IndexedDB
  `v6→v7` (`migrateCcStateRecordToV7`, new-root, +5 tests). `tsc` clean, `npm test` **45/45 snapshots zero diff
  (no -u)**, 2291 passing, `lint:architecture` 0 errors (109 warns, net-neutral). Adversarial 7-landmine review: 0
  findings. Details: `slice-9a-ccjson-source-lens.md`.
- **Goal:** `attributeTypes`/`attributeDescriptors` → metrics lens (finishes CF **#2a source**). **`edges` DEFERRED**
  → dependency lens (it is a merged render-model array consumed by codeMap rendering + view-state, not by the lens;
  needs the injectable `DependencyLensStore`/`EdgesRepo` + a render-model home first — CF **#2b**).
- **dep-cruiser:** added `lens-owns-ccjson-source` at **warn** (0 violations; flips to error once edges also move).
  **Risk was:** MED/MED.

### Slice 9b — `blacklist` → sharedView + parameterize both lenses' blacklist read — ✅ DONE
- **Outcome (2026-07-02, 3 commits):** `blacklist` moved out of the `fileSettings` state slice into the existing
  **`state.sharedView`** root; per-file `CCFile.settings.fileSettings` still bundles it via the intersection
  `FileSettings & MetricsLensSource & { blacklist }` (the .cc.json contract). The dependency lens's edge selectors
  (blacklist + edge-visibility filtering) lifted OUT into **`state/selectors/edgeMetricData/`**; the lens facade now
  exposes only the RAW `calculateEdgeMetricData`. `state.manager` dynamic-key rename `fileSettings.blacklist →
  sharedView.blacklist`; applier `mapSharedViewToAction` blacklist case; `updateFileSettings.effect` co-emits
  `sharedView:{blacklist}` in ONE setState; scenarios re-keyed; IndexedDB `v7→v8` (`migrateCcStateRecordToV8`,
  merge-into-existing sharedView). `tsc` clean, `npm test` **45/45 snapshots zero diff (no -u)**, 2295 passing (+4
  v8 tests), `lint:architecture` 0 errors (107 warns, −2 vs 9a). **After this slice neither lens imports any home
  selector** (grep-verified). Details: `slice-9b-blacklist-sharedview.md`.
- **Goal:** move `blacklist` (31 import sites) to `sharedView`, and finish lifting blacklist out of **both** lenses.
- **Lens parameterization (P0-1, half 2):** the dependency lens reads `blacklistMatcherSelector` **and** edge-visibility
  `showIncoming/OutgoingEdges` (`dependencyLens.selectors.ts:3`, `sortedNodeEdgeMetricsMap.selector.ts:3,8`). Lift both the
  blacklist filter and the edge-visibility sort/filter out of `sortedNodeEdgeMetricsMap`/`edgeMetricDataResult` into
  **derived selectors** — the lens exposes raw edge-metric data; the feature/page composes it with `mapState`
  edge-visibility + `sharedView` blacklist. **After this slice, neither lens imports any home selector.**
- **DoD:** `blacklist` in `sharedView`; both lenses free of `blacklist` + edge-visibility reads (grep-verified); snapshots
  byte-identical; e2e blacklist/exclude/flatten green. **Risk:** MED-HIGH/MED-LARGE. Needs 8.

### Slice 9c — `markedPackages` → sharedView
- **Goal:** move `markedPackages` (37 import sites) to `sharedView`; empty and delete `fileSettings`.
- **DoD:** `fileSettings` gone; `markedPackages` in `sharedView`; snapshots byte-identical; e2e marked-packages + delta green.
- **dep-cruiser:** **FLIP `new-must-not-import-legacy` → error** (all lens/fileStore → `state/` edges now gone — verify by
  grep). **Retires:** the `new-must-not-import-legacy` rule (one rule over its ~remaining edges). **Risk:** MED/MED. Needs 8.

### Slice 10 — Purge `appSettings` → `preferences`; finish fileStore; delete the grab-bags
- **Goal:** durable global prefs → a `preferences` module (**localStorage**, not the IndexedDB `CcState` blob); `isLoadingFile`
  + `currentFilesAreSampleFiles` → `fileStore`; delete the empty `appSettings`/`dynamicSettings`/`appStatus` reducers.
- **Keystone cost:** `preferences` is localStorage-durable — this slice carves durable-prefs persistence out of
  `saveCcState`/`readCcState` (a real behavior seam). Merge `sortingOrderAscending` + `sortingOption` → one `sorting` pref.
- **DoD:** `state.preferences` real + localStorage-backed; `fileStore` owns the file-load flag + provenance; the four grab-bags
  **gone**; `CcState = { mapState, sharedView, preferences, <lens source>, files, <fileStore flags> }`; snapshots byte-identical;
  e2e presentation-mode / experimental-features / sorting / loading-indicator green.
- **dep-cruiser:** add `preferences` to the home rules; **FLIP `state-home-is-leaf` → error** across all three homes (its
  "once the `state/` split completes" condition is now met). **Risk:** MED/MED. The "`state/` is dissolved" milestone.

### Slice 11 — Features OUT of lenses; RE-HOME the legend; kill "shell"
- **Goal:** collapse the features-inside-lenses fiction: `git mv lenses/metrics/features/legend → features/legend/`, rewire to
  the metrics **read facade** + the `mapState`/`sharedView` read facades, delete the "shell" special-case.
- **Why now (P1-3):** legend injects `Store` for 6 non-metric reads; moving it earlier would land a feature *service* importing
  ngrx (violates the already-error `feature-only-stores-can-import-ngrx-store`). Because its reads were re-homed to
  `mapState`/`sharedView` in 6–9, it rewires **once**, cleanly — and this removes the last lens-code ngrx injection.
- **Also (P2-8, CF #4):** re-evaluate `metricSelectPopover` + `metricColorRangeDiagram` — either move them out of the ex-"shell"
  metricsBar into single-lens features, or explicitly re-defer with a named target.
- **DoD:** no `lenses/*/features/` dir; legend renders from facades; snapshots byte-identical; e2e legend/color-row green.
- **dep-cruiser:** replace the 5 lens-internal-feature rules with the top-level `feature-*` rules + one new
  `feature-services-reach-a-lens-only-via-its-facade`; **FLIP `metrics-lens-ngrx-guard` → error** (closes CF **#5**). **Risk:** MED/MED. Needs 6/7.

### Slice 12 — CQRS read/write facade split on the homes + dedupe `*Store` wrappers
- **Goal:** split each home's `export *` barrel into a **read facade** (selectors) + **write facade** (actions), so a
  display-only component importing only the read facade physically cannot dispatch; collapse the ~37 duplicate per-feature
  `*Store` wrappers.
- **DoD:** every home has a read/write split; components import zero write facades; duplicate-wrapper count drops (report delta);
  snapshots byte-identical.
- **dep-cruiser:** add `state-home-read-facade-has-no-dispatch` + `state-home-write-facade-is-sole-dispatch-surface` +
  `display-components-cannot-dispatch` (warn→error as each home is split). **Risk:** MED/LARGE. Needs 5–10.

### Slice 13 — Structure lens + renderer-agnostic id + named renderer seam (+ graphState)
- **Goal:** the genuine refactors, last: stand up the **structure lens**; re-express `selectedBuildingId` as a
  **renderer-agnostic node id** promoted to `sharedView` (P1-4); freeze a **named renderer-engine contract**
  (`load · highlight · settings` + `onSelect · onHover`); `graphState` when the Graph (LSM) renderer lands.
- **Keystone cost:** untangling `accumulatedData`/`idToNode` ownership so the metrics lens can expose **`valueOf(id, metric)`**
  without the downstream-decoration cycle (CF **#1**) — the same untangle the renderer-agnostic id needs.
- **dep-cruiser:** structure-lens rule variants; **FLIP `lens-no-view-state` → error** (both lenses have been clean since 9b —
  this is the flip that certifies "a lens never reads mutable view state"); add `renderer-engine-stays-dumb` +
  `page-uses-engine-public-api` (staged warn until Graph validates the seam). **Risk:** HIGH/XL. **Last** — all above de-risks it.

---

## Dep-cruiser rule-flip schedule (canonical numbering)

| Rule | Guarantee | → error in |
|---|---|---|
| `lens-no-renderer-or-page` | a lens never depends on UI | already error (inert-safe) |
| `lens-cross-lens-only-via-read-facade` · `lens-internals-do-not-use-own-facade` | lenses compose only via read facades | already error |
| `lens-external-access-only-via-public-surface` | a lens is reached only via its facade | already error; drop the `features/…/components/` exemption in **11** |
| `lens-owns-ccjson-source` | edges/attributeTypes/descriptors live only under lenses | **9a ✅ (warn)** — added at warn; flips to error once edges also move to a dependency-lens store |
| `lens-only-repos-store-import-ngrx` (evolved `metrics-lens-ngrx-guard`) | only lens repos/store touch ngrx | **11** |
| `lens-no-view-state` | **a lens never reads mutable view state** (selection/blacklist/edge-visibility are parameters) — kills the `valueOf` coupling | **13** *(gated on 7 + 9b lifting all view-state reads out of both lenses)* |
| `state-home-is-leaf` | mapState/sharedView/preferences are leaves | mapState **6 ✅**, sharedView **8 ✅**, preferences **10** |
| `state-home-only-stores-import-ngrx` | only a home's store touches ngrx | mapState **6 ✅** / sharedView **8 ✅** / preferences **10** |
| `state-home-read-facade-has-no-dispatch` · `…-write-facade-is-sole-dispatch-surface` · `display-components-cannot-dispatch` | CQRS: read facade can't dispatch | **12** |
| `feature-reaches-state-home-only-via-facade` | features mutate state only via a home facade | mapState **7** / sharedView **8** (both deferred — no rule added; the ~18 sharedView consumers already reach it via `sharedView.facade`, enforcement folds into the Slice-12 CQRS split), prefs **10** |
| `feature-services-reach-a-lens-only-via-its-facade` (+ retire the 5 lens-internal-feature rules) | features reach a lens only via its facade | **11** |
| `filestore-external-access-only-via-facade` | fileStore reached only via its facade | **9a/10** |
| `filestore-has-no-upward-deps` · `wire-dto-only-in-filestore-boundary` | fileStore is the source; wire DTO confined | already error (names evolved) |
| `new-must-not-import-legacy` (one rule, ~20 edges today) | new layers stay clean of the dissolving `state/` | **9c/10**, then the rule + `state/` are removed |
| `renderer-engine-stays-dumb` · `page-uses-engine-public-api` | swappable dumb engines | **13** (staged warn until renderer #2) |

## Reconciliation — keep / move / reverse (Slices 1–4)

~**100% of Slice-1–4 code is retained** (≈0% logic discarded); ~**82% needs zero home change**; ~**18% re-homes** (byte-identical);
**exactly one artifact reverses** (legend placement).

| Built in 1–4 | Verdict | Why |
|---|---|---|
| `lenses/metrics/{store,repos}`, `lenses/dependency/store`, the data cores + `metricDataSelector` diamond | **KEEP verbatim** | already "repos+store+logic over cc.json" |
| `metricsLens.facade` | **KEEP** | it *is* the read facade; write facade is additive; stays parameterized (`rangeOf`) |
| `model/ccjson2.model.ts` + cc.json 2.0 ingestion, `fileStore/{loaders,repos,store}` | **KEEP verbatim** | the ingestion seam + raw-file home |
| `appearance/` (21 slices, facade) | **RE-HOME → `mapState`** (rename + absorb stragglers) | right contents, wrong name/scope; code byte-identical |
| `lenses/metrics/features/legend/` | **REVERSE → `features/legend/`** | never single-lens; `git mv`, zero logic lost |
| `state/loadInitialFile/loadInitialFile.store.ts` | **KEEP (prepaid keystone)** | already outside fileStore; grows to dispatch into the homes |
| dep-cruiser layer-direction rules | **KEEP**; `lens-external-access` simplifies; the 5 lens-internal-feature rules **retire** in 11 | layer directions unchanged |

## CARRIED-FORWARD → v2 slices

| # | Item | v2 target |
|---|---|---|
| 1 | `valueOf(id, metric)` | **13** (needs the `idToNode`/`accumulatedData` untangle) |
| 2 / 2a | dependency-lens remaining (source, injectable store) | **9a** (source); injectable store when an edge-UI feature lands |
| 2b | edge selection + 3 edge effects | **7** (→ `mapState`) |
| 3 | metric selection | **7** (→ `mapState`) |
| 4 | `metricSelectPopover` / `metricColorRangeDiagram` out of shell | **11** (or explicitly re-deferred) |
| 5 | flip `metrics-lens-ngrx-guard` + `new-must-not-import-legacy` → error | **11** + **9c/10** |
| 6 | structure lens · renderer/page split · viewCube · multi-renderer · `graphState` | **13** |

## Supersedes map (nothing silently dropped)

- `CONVENTIONS.md` — **still authoritative** (model-independent), carried verbatim.
- `rpi-plan/*`, `slice-2/3/4-*.md` — **carried as completed history**; slice-4's deferred store-key reshape **becomes Slice 5**;
  rpi-plan step-5 (legend-into-lens) is **reversed** by Slice 11.
- `CARRIED-FORWARD.md` — **remains the living backlog**; re-point its items per the table above (don't delete).
- `Ideas/dependency-cruiser.2.0.cjs` and the old `Ideas/codecharta-2.0-*` exploration artifacts (goal-architecture,
  architecture, architecture.mermaid, implementation-map, lens-anatomy, structure) — **removed** as stale (they encoded
  `interaction`/`viewState`/`shell` + features-in-lens); their unique still-valid design was salvaged into the "Carried
  design notes" section below. The dep-cruiser target is now `Ideas/dependency-cruiser.2.0.refined.cjs`. ⚠️ **That refined
  draft's internal flip-slice comments predate this roadmap's canonical 5→13 numbering and do not yet encode the P0-1
  `lens-no-view-state` gate — reconcile both before wiring it into CI; this roadmap's flip schedule is authoritative.**

## Program Definition of Done

1. **State has real homes at runtime** — `state.mapState/sharedView/preferences` are root reducers; `appSettings`/`dynamicSettings`/`appStatus`/`fileSettings` **no longer exist**.
2. **Every slice sits in its litmus-assigned home**; `accumulatedData`/`idToNode`/`metricData` stay derived selectors (no store).
3. **Features are one flat top-level layer**; no `lenses/*/features/`; **no "shell"**.
4. **Lenses are read-only** (read facade + near-empty load-time write facade; parameterized `rangeOf(metric)`; never read view state).
5. **CQRS on the homes** (read vs write facade; a display-only component can't dispatch).
6. **All warn bridges flipped to error** (`metrics-lens-ngrx-guard`, `lens-no-view-state`, `state-home-is-leaf`; `new-must-not-import-legacy` removed with `state/`).
7. **Legacy `state/` dissolved** into fileStore + lenses + the three homes; only derived selectors + the applier remain outside a home.
8. **A named renderer-engine seam exists** (contract only; the full dumb-engine/page-wire wrapper lands with renderer #2 — not required for DoD).

## CONVENTIONS carryover

Every slice inherits `CONVENTIONS.md` verbatim: snapshots ARE the contract (never `-u`); structural commits are byte-identical
+ zero snapshot diff; behavioral commits use branch-by-abstraction with a value-equality parity test before the old path is
deleted; code-boundary move THEN store-key reshape; each boundary a dep-cruiser rule staged warn→error; per-commit gate
`tsc` · `npm test` (zero snapshot diff) · `lint:architecture` · `e2e` for the flow · manual smoke of what snapshots don't cover;
commit on green only; every slice names its rollback.

## Corrections applied from the adversarial critique (transparency)

- **P0-1 (blocker) — both lenses read view state, not just `colorMetric`.** Confirmed in code: `metricsLens.selectors.ts:4`,
  `dependencyLens.selectors.ts:3`, `sortedNodeEdgeMetricsMap.selector.ts:3,8` (blacklist + edge-visibility). Fix: the
  blacklist/edge-visibility **filtering moves to derived selectors** (Slice 7 for metrics, Slice 9b for dependency); the
  `lens-no-view-state` rule stays **warn until Slice 13**, gated on both lenses being clean.
- **P0-2 (blocker) — three drafts used three numbering schemes.** Unified to one canonical 5→13; every rule flip re-keyed.
- **P1-3 — legend must move late (11), not first** (else a feature service imports ngrx, violating an error rule).
- **P1-4 — renderer-agnostic selected-node id is Slice 13, not 8** (needs the `idToNode` untangle); Slice 8 = focus + search only.
- **P1-5 — Slice 9 split into 9a/9b/9c** (blacklist 31 + markedPackages 37 import sites is too big for one safe slice).
- **P1-6 — IndexedDB/scenarios need a real record data-transform in Slice 5**, not a version bump (else old blobs silently
  revert to defaults with no snapshot signal).
- **P2-8 — CARRIED-FORWARD #4 folded into Slice 11** (was dropped by all drafts).
- **P2-9 — rule scoping:** `state-home-is-leaf` targets `(appearance|mapState)` during the Slice-5 rename (no unguarded
  window); "20 warn bridges" reworded as one rule over ~20 edges.

## Carried design notes (salvaged from the superseded `Ideas/` artifacts before removal)

_These are the load-bearing facts the old `Ideas/codecharta-2.0-*` artifacts held that are **not** in the refined artifact —
recorded here so removing those files loses nothing but the outdated framing._

- **cc.json 2.0 node identity — the key everything joins on.** Node `id` = **sha-256 of the canonical path, first 16 hex
  chars**. The *same* id keys the structure tree, metrics-by-id, and edge endpoints, so (a) lenses join without path-guessing
  and (b) `highlight(id)` / `focusedNodeId` / the selected-node id **resolve in any renderer** — which is exactly what makes
  the Graph→CodeMap "jump" work. **Slice 13's renderer-agnostic-id re-expression targets this scheme**, replacing today's
  decoration-time ordinal `CodeMapNode.id` (`id++` in `NodeDecorator`). This is the prerequisite behind `valueOf` (CF #1) and
  `sharedView` selection/focus.
- **Render-model composition (why "edges live in the dependency lens but CodeMap needs them" is a non-problem).** The CodeMap
  renderer never imports the dependency lens. The composing layer reads `dependency.edges()` + `structure.tree()` + metrics +
  the chosen colorMetric, folds them into one `{ nodes, edges }` render-model, and calls `load(model)`. Edges stay a field in
  the model; the lens stays their owner. (Belongs to the deferred renderer-engine seam, Slice 13.)
- **Renderer × lens reuse** (what justifies the lens split): Map = structure · metrics · dependency(edge previews); Graph =
  structure · dependency; WordCloud = structure · **terms** (blocked); Report = all.
- **Terms lens / WordCloud gap.** WordCloud is **data-blocked**: cc.json carries no source text/identifiers and analysis emits
  nothing token-like → it needs a NEW **terms lens** from the analysis UnifiedParser (TreeSitter). Principle: "the answer to
  needing data X is add a lens, not hack the renderer." WordCloud is the last renderer, gated on that analysis work.
- **Renderer build order** (the renderer axis, companion to the state-home slice spine 5→13): prove the lens seam (CodeMap +
  legend — done) → prove the renderer seam (Graph/LSM; data largely exists via DependaCharta) → composite (Report page) →
  WordCloud (blocked on terms). The roadmap sequences *state-home* slices; renderer work lands at Slice 13+.
- **Features inventory.** Every current top-level `features/*` stays in the one flat `features/` layer under the refined model;
  the only structural moves are the legend **out** of `lenses/metrics/features/legend` (Slice 11) and the ex-"shell"
  cross-lens features (metricsBar, inspector) simply losing the "shell" label. Two durable non-state mappings:
  `loadFile → fileStore/loaders/ccJson` is the **only** place the cc.json wire DTO is allowed; `features/shared → components/`
  (dumb primitives).
- **The five meanings of "service/store" — keep them distinct** (naming-collision disambiguation): **Repo** (data-access inside
  a lens) · **Feature service** (logic in the `features/` layer, reads lens facades + writes home facades) · **View store**
  (a state home: `mapState`/`sharedView`/`preferences`) · **Engine service** (inside a renderer engine) · **Page** (the
  composing wire — deferred with the renderer seam).
- **Renderer catalog** (from the original hand sketch): Map · Graph · Report · **WordCloud** (terms-gated) — don't silently
  narrow the swappable-renderer set to Map/Graph/Report.
