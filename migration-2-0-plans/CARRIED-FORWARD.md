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
| 4 | **Single-lens metric UI** — re-evaluate moving `metricSelectPopover` (node+edge metric picker) and `metricColorRangeDiagram` (distribution chart) out of the cross-lens `metricsBar` shell into `lenses/metrics/features/`. | Slice 2 step 6 (optional) | Both currently span multiple lenses / live in a shell panel. | when metricsBar/inspector **shell** is split | They become genuinely single-lens. |
| 5 | **Flip the two `warn` dep-cruiser bridges to `error`**: `metrics-lens-ngrx-guard` and `new-must-not-import-legacy`. Slice 7 lifted the metrics-lens `blacklist` + `colorMetric` reads out of the lens (the blacklist-aware selectors now live in `state/selectors/nodeMetricData/`), so the lens's `store/`/`repos/` are clean — the ONLY remaining lens-code ngrx injection is `legend.service` (a lens *feature* service reading `isDeltaState` + the mapState metric/color facades). That injection moves in **Slice 11** (legend re-home), which is now the sole blocker for the `metrics-lens-ngrx-guard` flip. Slice 9a moved attributeTypes/descriptors → the metrics lens (source); **Slice 9b** moved `blacklist` → `sharedView` and lifted the dependency lens's blacklist + edge-visibility reads into `state/selectors/edgeMetricData/`, so **both lenses are now view-state-free** (grep-verified). `new-must-not-import-legacy` now needs ONLY Slice 9c (`markedPackages` → sharedView) before it can flip. | Slices 1 & 2 (kept at `warn`) | Both lenses no longer read `state/` view state; only `markedPackages` remains in `fileSettings`. | `metrics-lens-ngrx-guard` flip → **Slice 11**; full `new-must-not-import-legacy` flip → **9c/10**. | legend re-homed; `fileSettings` dissolved. |
| 6 | **Structure lens · Terms lens · Renderer/Page split · viewCube move · multi-renderer** | Slice 1 scope guards | Larger future milestones. | their own slices | — |

## Notes
- Items 1, 2/2a, 4, 5 are concrete, near-term follow-ups; item 6 is the broad remaining roadmap.
- **Done (2026-07-02):** ~~Slice 9b~~ (`blacklist` → sharedView) — `slice-9b-blacklist-sharedview.md`. `blacklist`
  moved out of the `fileSettings` state slice into the existing `state.sharedView` root (per-file `CCFile` keeps it
  via `FileSettings & MetricsLensSource & { blacklist }`). **Resolves P0-1 half 2:** the dependency lens's blacklist +
  edge-visibility filtering lifted into derived selectors under `state/selectors/edgeMetricData/`; the lens facade now
  exposes only the RAW `calculateEdgeMetricData`, so **neither lens imports any home selector** (grep-verified). Also
  clears the **blacklist** half of item #5's `new-must-not-import-legacy` note (the dependency-lens `state/` blacklist +
  showEdges reads are gone). IndexedDB `v7→v8` (`migrateCcStateRecordToV8`, merge-into-existing sharedView). The
  `new-must-not-import-legacy` flip now waits ONLY on Slice 9c (`markedPackages`). **Precedes 9c.**
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
