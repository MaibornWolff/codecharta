---
name: viz-2.0-carried-forward
issue:
state: living
version: 1
---

# Carried-forward work — Visualization 2.0 migration

> **Read this before scoping ANY new slice.** This is the single canonical list of work that earlier
> slices deliberately deferred. Each slice's own roadmap records *why* it deferred something; this file
> is the forward-looking backlog so a deferred item lands as an explicit task in the slice that unblocks
> it, instead of being lost in a completed slice's outcome notes. When you pick an item up, move it into
> that slice's roadmap DoD and delete the row here.

## Open items

| # | Item | Deferred from | Blocked by / why | Target slice | Unblock condition |
|---|------|---------------|------------------|--------------|-------------------|
| 1 | **`MetricsLensFacade.valueOf(id, metric)`** — per-node metric lookup; completes the facade contract `rangeOf · valueOf · descriptors` | Slice 2 (was a DoD item) | Node ids are assigned only in `NodeDecorator.decorateMapWithMetricData`, inside `accumulatedDataSelector`, which is **downstream** of `metricData`. Since Slice 2 made `metricData` read the metrics-lens facade, a lens→`idToNodeSelector` edge closes a **runtime-breaking module cycle** (`createSelector` gets `undefined` at import). No cycle-free id source exists yet, and nothing consumes `valueOf`. | **Renderer/Page split** slice | `accumulatedData`/`idToNode` ownership is untangled and the cross-renderer node-id scheme is settled, so the lens can expose per-node values without depending on downstream decoration. |
| 2 | **Dependency (edge) lens — remaining.** Slice 3 landed the edge-metric **DATA** core (`lenses/dependency`); Slice 9a moved `attributeTypes` (node **and** edge — the metrics lens **transiently** owns the edge side until a dependency-lens store lands) + `attributeDescriptors` into `state.metricsLensSource`. **Still to move:** (a) **`state.fileSettings.edges` → dependency lens** — DEFERRED in Slice 9a: `edges` is a **merged render-model array** consumed by codeMap rendering + view-state (not by the lens), so it needs the injectable `DependencyLensStore`/`EdgesRepo` + a **render-model home** first; (b) the **injectable `DependencyLensStore`/`EdgesRepo`/facade class** — none built (no injectable edge consumer yet); (c) full **deletion of `metricDataSelector`** — still needed by cross-cutting consumers (`loadInitialFile`, metricsBar/scenario stores, `accumulatedData`); (d) **re-home the edge side of `attributeTypes`** out of the metrics lens into the dependency-lens store once (b) exists. | Slice 3 (data core); Slice 9a (source split, edges deferred) | (a)/(d) need a render-model home + the injectable dependency store; (b) needs an injectable edge UI consumer; (c) needs item #3-era consumers to migrate. | a later **edge-UI / render-model** slice | codeMap render-model composition owns `edges`; metricsBar edge UI reads the dependency lens directly. |
| 4 | **Single-lens metric UI** — re-evaluate moving `metricSelectPopover` (node+edge metric picker) and `metricColorRangeDiagram` (distribution chart) out of the cross-lens `metricsBar` into a single-lens home. **Slice 11 re-evaluation (2026-07-03): HOLD.** The original target `lenses/metrics/features/` no longer exists — Slice 11 killed the "features-in-lenses/shell" model. Both components already live in the legitimate `features/metricsBar/` feature and read the metrics lens ONLY via `MetricsLensFacade` (`metricColorRangeDiagram` is pure d3/@Input, no lens coupling at all), so they are already boundary-clean; there is nothing to fix, only an optional future re-home if a single-lens-UI structure is ever introduced. | Slice 2 step 6 (optional) | Both live in the metricsBar feature; already facade-compliant. | a future single-lens-UI slice (if ever) | A single-lens-UI home is introduced (the abandoned `lenses/*/features/` is NOT it). |
| 5 | **Flip the two `warn` dep-cruiser bridges to `error`**: `metrics-lens-ngrx-guard` and `new-must-not-import-legacy`. Slice 7 lifted the metrics-lens `blacklist` + `colorMetric` reads out of the lens (the blacklist-aware selectors now live in `state/selectors/nodeMetricData/`), so the lens's `store/`/`repos/` are clean — the ONLY remaining lens-code ngrx injection was `legend.service`. **Slice 11 (2026-07-03) re-homed the legend `lenses/metrics/features/legend/ → features/legend/`** (killing the `lenses/*/features/` "shell" model): its Store reads moved into feature-local `stores/` (mapState + isDeltaState) and it reads the metrics lens via `MetricsLensFacade`, so **`metrics-lens-ngrx-guard` is FLIPPED to `error` — DONE**. Slice 9a moved attributeTypes/descriptors → the metrics lens (source); **Slice 9b** moved `blacklist` → `sharedView` and lifted the dependency lens's blacklist + edge-visibility reads into `state/selectors/edgeMetricData/`, so **both lenses are now view-state-free** (grep-verified). **`new-must-not-import-legacy` does NOT flip in 9c** — 12 edges remain (0 markedPackages-related): 7 `state/`-survivors clear in **Slice 10** (`metricsLens.store → state/selectors/nodeMetricData`, both lens reducers → `state/store/util/setState.reducer.factory`, fileStore → `currentFilesAreSampleFiles`/`referenceFile`/`loadInitialFile.store`/`metricQueryParameter`) and Slice 11 cleared the legend's 3 edges by re-homing it to a feature. | Slices 1 & 2 (kept at `warn`) | metrics-lens-ngrx-guard DONE; new-must-not-import-legacy residual edges are fileStore→state/features + `metricsLens.store → state/selectors/nodeMetricData`. | `metrics-lens-ngrx-guard` flip → **DONE (Slice 11)**; full `new-must-not-import-legacy` flip → **after `state/` becomes interaction/appearance** (remaining fileStore + metricsLens.store→state edges). | legend re-homed (11, DONE); `state/`→interaction/appearance relocation for the rest. |
| 6 | **Structure lens · Terms lens · Renderer/Page split · viewCube move · multi-renderer** | Slice 1 scope guards | Larger future milestones. | their own slices | — |
| 7 | **`preferences` → localStorage.** Carve durable-prefs persistence out of the IndexedDB `CcState` blob into localStorage (the roadmap's Slice-10 "keystone cost"). Preferences currently persists in the CcState blob like the other homes (functionally correct). | Slice 10b (deferred); **held past Slice 10c** | A **real behavior seam** (per-blob → global durable prefs) with **NO snapshot and NO e2e coverage** for pref persistence — can't be validated by the migration's safety net, so must not land as an unverifiable autonomous change. Slice 10c intentionally left this untouched. | **a dedicated localStorage slice** | user sign-off + a dedicated rehydrate-from-localStorage characterization test. |

## Notes
- Items 1, 2/2a, 4, 5 are concrete, near-term follow-ups; item 6 is the broad remaining roadmap; item 7 (localStorage) is the last Slice-10 DoD refinement, held pending user sign-off. Item 8 (the `sorting` merge) landed in Slice 10c.
- **#7 product decision (2026-07-03, user): POSTPONE — not needed now.** The intended UX when #7 DOES land = TWO
  distinct settings buttons: **(a) "wipe all data"** = today's "Reset Map" (`confirmResetMapDialog.resetMap()`:
  `deleteCcState()` + `setState(defaultState)` + reload samples — a full wipe, the current name undersells it),
  and **(b) "reset global settings"** = today's `cc-reset-settings-button`, which currently resets only a
  hand-picked 5 keys (`hideFlatBuildings`, `isWhiteBackground`, `resetCameraIfNewFileIsLoaded`, `layoutAlgorithm`,
  `maxTreeMapFiles`) — NOT the full durable-pref set. These two are cleanly separable ONLY once prefs live in
  their own localStorage store (this very item): otherwise "wipe all data" keeps nuking prefs because they ride
  the same IndexedDB blob. **So #7 + the two-button UX are one coherent future slice, done together — not urgent.**
- **Done (2026-07-03):** ~~Slice 11~~ (legend re-home + `metrics-lens-ngrx-guard` flip, item #5's guard half) —
  `slice-11-legend-rehome.md`. `git mv lenses/metrics/features/legend/ → features/legend/` (the now-empty
  `lenses/metrics/features/` "shell" dir deleted — the abandoned features-in-lenses model is gone). 3 commits:
  (1) lift legend.service's ngrx `Store` reads into feature-local `stores/` (`LegendMapStateStore` +
  `LegendIsDeltaStateStore`) — clears the sole `metrics-lens-ngrx-guard` violation; (2) git mv + swap the two
  metrics-lens repo injections for `MetricsLensFacade` (valid now legend is an outside consumer) + repoint the
  ONE consumer (`codeCharta.component`) to `features/legend/facade`; (3) flip `metrics-lens-ngrx-guard`
  `warn → error` + docs. Behaviour-preserving (2313 passing, 45/45 snapshots zero-diff, tsc/biome clean,
  dep-cruiser 0 errors). The legend↔inspector coupling (`InspectorVisibilityService`) STAYS — an allowed
  cross-feature-via-facade import. **The roadmap's proposed `feature-services-reach-a-lens-only-via-its-facade`
  rule was NOT added — it is already subsumed by the `error`-level `lens-external-access-only-via-public-surface`.**
  **CF #4 re-evaluated → HOLD** (its `lenses/*/features/` target no longer exists). **`new-must-not-import-legacy`
  still `warn`** (legend edges cleared; fileStore + `metricsLens.store → state/nodeMetricData` edges remain).
- **Done (2026-07-03):** ~~Slice 10c~~ (`sorting` merge, item #8) — `slice-10c-sorting-merge.md`. `sortingOrderAscending` +
  `sortingOption` — both already under the `preferences` home — collapsed into one `preferences.sorting =
  { option, orderAscending }` object behind one reducer (new `Sorting` type). **Public API held stable**
  (`sortingOrderSelector` still yields the option, `sortingOrderAscendingSelector` the order, the three action
  names + the `preferencesActions` save-trigger union byte-identical), so the whole sidebarExplorer sort feature
  + the render-availability gate are untouched — blast radius stayed inside the store + persistence + 5 inline
  mocks. IndexedDB `v11→v12`: `migrateCcStateRecordToV12` is the first **WITHIN-home nesting** transform (v3–v11
  MOVE keys between homes; v12 NESTS two siblings), chained after v11 + v2-blob chain test extended. Load-applier
  asymmetry preserved exactly (`mapPreferenceToAction("sorting")` restores the option, never the order). 2 commits
  (structural git-mv → sorting/ folder, then behavioral). 2309 passing, 45/45 snapshots zero-diff, tsc + biome
  clean, dep-cruiser 0 errors. **This closes the last Slice-10 shape-consolidation DoD item; only #7 (localStorage,
  a behavior seam) remains, held for user sign-off.**
- **Done (2026-07-03):** ~~Slice 10 CORE~~ (the three grab-bags dissolved) — `slice-10-preferences.md`. 5 Tidy-First
  commits: `setState.reducer.factory → util/` shared kernel; `isLoadingFile` + `currentFilesAreSampleFiles` → top-level
  fileStore-owned CcState roots (**`appStatus` deleted**); the 7 durable prefs + `sortingOption` → a real
  **`state.preferences`** home (**`appSettings` + `dynamicSettings` deleted**). IndexedDB `v9→v11`. **All three grab-bags
  gone**; `state-home-is-leaf` + `state-home-only-stores-import-ngrx` now **error across all three homes** (mapState +
  sharedView + preferences). Two runtime landmines tsc missed (`State.getValue().appSettings`/`.dynamicSettings`) fixed
  (`ThreeSceneStore` + `CodeMapTooltipStore`). 2305 passing, 45/45 snapshots zero diff, 0 lint errors. **The two DoD
  refinements — localStorage-backing (#7) + the `sorting` merge (#8) — are DEFERRED to 10c** (localStorage is a behavior
  seam with no test coverage; the sorting merge is organizational). `new-must-not-import-legacy` full flip still waits on
  10 + 11.
- **Done (2026-07-02):** ~~Slice 9c~~ (`markedPackages` → sharedView) — `slice-9c-markedpackages.md`. The
  mechanical twin of 9b, one grab-bag member later: `markedPackages` moved out of the `fileSettings` state
  slice into the existing `state.sharedView` root (per-file `CCFile` keeps it via
  `FileSettings & MetricsLensSource & { blacklist } & { markedPackages }`). **`state.fileSettings` now holds
  ONLY `{ edges }`** — the reducer is NOT deleted (edges is DEFERRED, item #2a). No lens-parameterization and
  no selector-dedup (no lens reads markedPackages; the only base selector is `markedPackagesSelector`, its two
  derived composers just repointed their import). IndexedDB `v8→v9` (`migrateCcStateRecordToV9`,
  merge-into-existing sharedView). **NO `new-must-not-import-legacy` flip in 9c** — the 12 residual edges
  (0 markedPackages-related) clear in **10** (7 `state/`-survivors) + **11** (5 legend/errorDialog). 2 commits
  (structural + behavioral), 0 findings from the adversarial review. **This clears the last movable
  `fileSettings` member; only the DEFERRED `edges` remains until a later edge-UI / render-model slice.**
- **Done (2026-07-02):** ~~Slice 9b~~ (`blacklist` → sharedView) — `slice-9b-blacklist-sharedview.md`. `blacklist`
  moved out of the `fileSettings` state slice into the existing `state.sharedView` root (per-file `CCFile` keeps it
  via `FileSettings & MetricsLensSource & { blacklist }`). **Resolves P0-1 half 2:** the dependency lens's blacklist +
  edge-visibility filtering lifted into derived selectors under `state/selectors/edgeMetricData/`; the lens facade now
  exposes only the RAW `calculateEdgeMetricData`, so **neither lens imports any home selector** (grep-verified). Also
  clears the **blacklist** half of item #5's `new-must-not-import-legacy` note (the dependency-lens `state/` blacklist +
  showEdges reads are gone). IndexedDB `v7→v8` (`migrateCcStateRecordToV8`, merge-into-existing sharedView). The
  `new-must-not-import-legacy` flip does NOT land in 9c — 12 residual edges (0 markedPackages-related) clear in
  **10** (7 `state/`-survivors) + **11** (5 legend/errorDialog). **Precedes 9c.**
- **Done (2026-07-02):** ~~Slice 9a~~ (source) — the first **lens-owned** store root, `state.metricsLensSource`
  (`slice-9a-ccjson-source-lens.md`). Resolves **CF #2a source**: `attributeTypes` (node **and** edge, transiently)
  + `attributeDescriptors` moved out of the `fileSettings` state slice into the metrics lens. Per-file
  `CCFile.settings.fileSettings` still bundles them via `FileSettings & MetricsLensSource` (the .cc.json contract).
  New write/wiring **load facade** (`metricsLens.load.facade`) + read-facade raw `attributeTypesSelector`; applier
  `applyMetricsLensSource`; `updateFileSettings.effect` co-emits both roots in ONE setState; IndexedDB `v6→v7`
  (`migrateCcStateRecordToV7`, new-root). `lens-owns-ccjson-source` added at **warn** (0 violations). **`edges`
  explicitly DEFERRED** → dependency lens (see item #2a): it is a merged render-model array needing a render-model
  home + the injectable `DependencyLensStore`/`EdgesRepo` first. Adversarial 7-landmine review: 0 findings (the
  `accumulatedData → metricsLens.facade` edge closes no cycle, unlike CF #1). **Precedes 9b/9c.**
- **Done (2026-07-02):** ~~Slice 8~~ — the first brand-new state home, `state.sharedView`
  (`slice-8-sharedview.md`). `focusedNodePath` + `searchPattern` moved out of `dynamicSettings` into it;
  `dynamicSettings` now holds only `sortingOption`. Reused the reshape machinery (state.manager root +
  dynamic-key rename, applier `applySharedView`/`mapSharedViewToAction`, scenario `focusedNodePath` patch
  re-key, IndexedDB `v5→v6`). **New-root first:** `migrateCcStateRecordToV6` builds `sharedView` fresh from
  defaults + the two moved keys (prior migrations merged into the pre-existing mapState). `state-home-is-leaf`
  + `state-home-only-stores-import-ngrx` are **error** for sharedView. **This unblocks 9b (`blacklist`) and 9c
  (`markedPackages`)**, which move into `sharedView` — the home now exists. No lens/fileStore imports focus/
  search, so `new-must-not-import-legacy` did NOT shrink (unlike Slice 7); its flip still waits on 9a + 9b/9c.
- **Done (2026-07-02):** ~~Slice 7~~ — metric SELECTION → mapState + metrics-lens parameterization
  (`slice-7-mapstate-metrics.md`). Resolves ~~item #3~~ (metric selection: owner decided = mapState,
  NOT the metrics lens — selection is per-view config, the lens owns only DATA) and ~~item #2b~~ (edge
  *selection* `edgeMetric` → mapState; the 3 edge effects `updateEdgePreviews`/`updateAmountOfEdge
  Previews`/`resetSelectedEdgeMetricWhenItDoesntExistAnymore` repointed). The metrics lens no longer
  imports `blacklist` or `dynamicSettings` selectors: the blacklist-aware `nodeMetricDataSelector`/
  `metricRangeSelector` moved to `state/selectors/nodeMetricData/`, and the pure `calculateNodeMetric
  Data` + `rangeOfMetric`/`MetricRange` moved to `util/metric` (breaking a `state → facade → repo →
  store → state` cycle). IndexedDB `v4→v5`. **P0-1 half 1 done** — the metrics lens is view-state-free
  (rule `lens-no-view-state` stays warn until 13, gated now only on the dependency lens, Slice 9b).
- **Done (2026-07-02):** ~~Slice 6~~ — the mapState presentation stragglers (`slice-6-mapstate-stragglers.md`).
  `colorMode`/`colorRange`/`margin` (from `dynamicSettings`), `layoutAlgorithm`/`isLoadingMap` (from `appSettings`), and the
  transient `hoveredNodeId`/`rightClickedNodeData`/`selectedBuildingId` (from `appStatus`) moved into `state.mapState`;
  `appStatus` now holds only `currentFilesAreSampleFiles`. IndexedDB migration reused (v3→v4). `state-home-is-leaf` +
  `state-home-only-stores-import-ngrx` are **error** for mapState. **Two subtle behaviors preserved:** the transient ids +
  isLoadingMap are no-ops in the mapState applier (appStatus was never applied on load), and `colorRange`'s first-render
  null-gate is kept by folding `mapState.colorRange` into `areDynamicSettingsAvailable`. Item **#5**'s `metrics-lens-ngrx-guard`
  note now points at `mapState` (was "viewState"): `legend.service` still injects `Store` for areaMetric/heightMetric/
  colorMetric/edgeMetric (dynamicSettings, Slice 7) + isDeltaState — colorRange is now a mapState read, no longer a bridge.
- **Done (2026-07-02):** ~~Slice 5~~ — the keystone `state.mapState` root (`slice-5-mapstate-root.md`). The 21 ex-appearance
  slices moved from the `appSettings` combineReducers into their own `state.mapState` root; the reshape machinery
  (state.manager dynamic-keys + `_applyPartialState` paths, the load applier's `applyMapState`, scenario patch keys, IndexedDB
  v2→v3 record transform) is built and reused by Slices 6–10. **Two facts verified in code that reshape the remaining slices'
  scope:** (a) the **URL round-trip only serializes metric/mode/file params** — no home-state value is URL-persisted, so URL
  work belongs to the *metric-selection* slice (7), not every reshape; (b) **scenarios persist section-shaped**
  (`ScenarioSections`), not store-shaped — the store-key mapping lives only in `scenarioApplier`, so each reshape updates that
  applier but the scenarios IndexedDB store needs **no** record transform (only the `ccstate` record does). Apply both when
  scoping Slices 6–10.
- **Done (2026-07-01):** ~~Slice 4~~ — the `appearance` leaf module is stood up (`slice-4-appearance.md`).
  The ~20 purely-visual settings (mapColors whole, labels, scaling, invert*, hideFlat, whiteBackground, and the
  **edge-appearance** group #2b) moved into `appearance/store/*` behind `appearance.facade`, keeping the
  `appSettings` combineReducers key (code-boundary, not a store-key reshape). The load-time applier moved out of
  `fileStore`; the two lens→`state/` appearance bridges (dependency→showEdges, legend→mapColors) were retired
  via the facade. `new-must-not-import-legacy` warns 24→20. `metrics-lens-ngrx-guard` flip deferred (item #5).
  Next: metric/edge *selection* (viewState, items #3 + #2b-selection) and `interaction`.
- **Done (2026-07-01):** ~~item 7~~ — the three node-only consumers (`resetChosenMetrics.effect`,
  `areAllNecessaryRenderDataAvailable.selector`, `mapReset.store`) now read the metrics-lens
  `nodeMetricDataSelector` directly instead of the `metricDataSelector` aggregator. Value-identical
  swap; the aggregator keeps only its genuinely cross-cutting (node+edge) consumers.
- ~~Item 5 also covers the **dependency lens's** `new-must-not-import-legacy` bridges (it reads `state/` blacklist +
  showEdges selectors).~~ **Resolved by Slice 9b** — those reads moved into `state/selectors/edgeMetricData/`
  derived selectors; the dependency lens now imports no `state/` view state.
- Sources: `slice-2-metrics-lens-completion.md` (items 1, 3, 4, 5), `rpi-plan/00-roadmap.md` scope guards
  (items 2, 5, 6), `slice-3-dependency-lens.md` (items 2, 2b).
