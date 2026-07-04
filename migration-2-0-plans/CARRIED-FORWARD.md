---
name: viz-2.0-carried-forward
issue:
state: living
version: 1
---

# Carried-forward work — Visualization 2.0 migration

> **Migration DONE (Slice 15, `state/` deleted) AND the architecture cleanup DONE (✅ Slice 16, 2026-07-04,
> `slice-16-architecture-cleanup.md`, state: complete).** `npm run lint:architecture` → **0 errors, 0
> warnings**: `no-circular` is at **error** (acyclic graph), all 3 state homes are fenced, the codeMap/viewCube
> grandfather is gone, fileStore has zero upward deps, `util/` is an enforced leaf kernel. Slice 16 CLOSED the
> cleanup halves of **CF #9** (16d fenced mapState onto `feature-reaches-state-home-only-via-facade`; 16e
> deduped the isDeltaState wrappers) and **CF #10** (16f, loader → `load/`). CF #2c is moot, CF #2b superseded.
> **Still separate (not cleanup):** CF #7 (localStorage, user-postponed), CF #6 (multi-renderer, new-feature
> work), and the CF #9 REMAINDER (cross-home read-wrapper dedup — needs the not-yet-built interaction layer).

> **Read this before scoping ANY new slice.** This is the single canonical list of work that earlier
> slices deliberately deferred. Each slice's own roadmap records *why* it deferred something; this file
> is the forward-looking backlog so a deferred item lands as an explicit task in the slice that unblocks
> it, instead of being lost in a completed slice's outcome notes. When you pick an item up, move it into
> that slice's roadmap DoD and delete the row here.

## Open items

| # | Item | Deferred from | Blocked by / why | Target slice | Unblock condition |
|---|------|---------------|------------------|--------------|-------------------|
| 2 | **Dependency (edge) lens — remaining.** Slice 3 landed the edge-metric **DATA** core (`lenses/dependency`); Slice 9a moved `attributeTypes` (node **and** edge — the metrics lens **transiently** owned the edge side) + `attributeDescriptors` into `state.metricsLensSource`; **Slice 14 (`~~2d~~ DONE)** re-homed the edge side of `attributeTypes` into a new `state.dependencyLensSource` root (the twin of `metricsLensSource`), so the metrics lens now owns only node types and the dependency lens owns edge types (ADR 12). **Still to move:** (a) **`state.fileSettings.edges` → dependency lens** — DEFERRED in Slice 9a: `edges` is a **merged render-model array** consumed by codeMap rendering + view-state (not by the lens), so it needs the injectable `DependencyLensStore`/`EdgesRepo` + a **render-model home** first; (b) the **injectable `DependencyLensStore`/`EdgesRepo`/facade class** — none built (no injectable edge consumer yet); (c) full **deletion of `metricDataSelector`** — still needed by cross-cutting consumers (`loadInitialFile`, metricsBar/scenario stores, `accumulatedData`). NB: Slice 14 landed a **read-model** `dependencyLensSource` store (reducer/selectors/facades) but NOT the injectable class of (b) — (b) still waits on an injectable edge UI consumer. | Slice 3 (data core); Slice 9a (source split, edges deferred); ~~Slice 14 (edge attributeTypes)~~ | (a) needs a render-model home + the injectable dependency store; (b) needs an injectable edge UI consumer; (c) needs item #3-era consumers to migrate. | a later **edge-UI / render-model** slice | codeMap render-model composition owns `edges`; metricsBar edge UI reads the dependency lens directly. |
| 4 | **Single-lens metric UI** — re-evaluate moving `metricSelectPopover` (node+edge metric picker) and `metricColorRangeDiagram` (distribution chart) out of the cross-lens `metricsBar` into a single-lens home. **Slice 11 re-evaluation (2026-07-03): HOLD.** The original target `lenses/metrics/features/` no longer exists — Slice 11 killed the "features-in-lenses/shell" model. Both components already live in the legitimate `features/metricsBar/` feature and read the metrics lens ONLY via `MetricsLensFacade` (`metricColorRangeDiagram` is pure d3/@Input, no lens coupling at all), so they are already boundary-clean; there is nothing to fix, only an optional future re-home if a single-lens-UI structure is ever introduced. | Slice 2 step 6 (optional) | Both live in the metricsBar feature; already facade-compliant. | a future single-lens-UI slice (if ever) | A single-lens-UI home is introduced (the abandoned `lenses/*/features/` is NOT it). |
| 6 | **Terms lens · Renderer/Page split · viewCube move · multi-renderer (Graph/LSM, WordCloud, Report)** | Slice 1 scope guards | **OUT of the migration — CodeMap-renderer-only (ratified 2026-07-04, user).** Larger future milestones, each its own separate post-migration work; NOT gating the migration DoD. (Structure lens already landed in 14d; the renderer seam is contract-only, 14b.) | their own **post-migration** slices | — |
| 7 | **`preferences` → localStorage.** Carve durable-prefs persistence out of the IndexedDB `CcState` blob into localStorage (the roadmap's Slice-10 "keystone cost"). Preferences currently persists in the CcState blob like the other homes (functionally correct). | Slice 10b (deferred); **held past Slice 10c** | A **real behavior seam** (per-blob → global durable prefs) with **NO snapshot and NO e2e coverage** for pref persistence — can't be validated by the migration's safety net, so must not land as an unverifiable autonomous change. Slice 10c intentionally left this untouched. | **a dedicated localStorage slice** | user sign-off + a dedicated rehydrate-from-localStorage characterization test. |
| ~~10~~ | ~~**Move the initial-file loader kickoff into `load/`.**~~ **✅ DONE — Slice 16f.** `loadInitialFile.service(.spec)` git-mv'd `fileStore/loaders/ccJson/services/ → load/`; the wire-DTO sample assets extracted to `fileStore/loaders/ccJson/sampleFiles.ts`; `fileStore.facade` widened + a `load/load.facade.ts` barrel added so the loader reaches fileStore ONLY via the facade. `fileStore/` added (spec-exempt) to `load-orchestrator-not-imported-by-lower-layers` `from` — **fileStore now has ZERO upward deps.** | Slice 12b | — | ~~a small structural cleanup slice~~ | ✅ landed in Slice 16f. |
| 9 | **Slice 13d cross-cutting read-wrapper dedup (REMAINDER only).** **✅ Cleanup halves DONE:** 16d folded mapState's last raw `store/*.selector` imports onto `MapStateReadWindow` (added `margin$`, refolded `MarginStore`) so **mapState joined `feature-reaches-state-home-only-via-facade` — all 3 homes fenced**; 16e collapsed the `isDeltaState` ×3 identical wrapper classes into one `features/shared/stores/IsDeltaStateStore` (via `features/shared/facade`). **Still open (NOT cleanup — interaction-layer work):** `isLoadingFile` ×3, `selectedNode` ×3, `hoveredNodeId` ×3, `blacklist` ×2, plus the curated multi-read windows (`legendMapState`, `nodeSelection`, `3dPrint.store`, `threeScene`, `stateAccess`). These are the **cross-home** selectors with **no settled home** — they need a fileStore read-window and/or the not-yet-built viewState/interaction layer, so folding them now would pre-empt that later slice. (16e's backlog-hygiene note: `isLoadingFile` is singular; `selectedNode`/`hoveredNode` underlying selectors already deduped in `renderModel/`; the curated windows bundle distinct streams — so these are NOT true duplicates.) | Slice 13d; **cleanup halves closed by Slice 16d + 16e** | (a) Cross-home selectors need a home decision — fileStore read-window vs a viewState/interaction home. (b) `selectedNode`/`hoveredNodeId` feed selection/hover highlight — **not** snapshot-covered → need the user's e2e + manual side-by-side vs `main`. | a later **read-window / interaction-layer** slice | The cross-home selectors' home is settled; hover/selection dedup smoked against `main`. |

## Notes
- **✅ DONE (2026-07-04): Slice 16 — architecture cleanup to a zero-cycle, zero-exemption config**
  (`slice-16-architecture-cleanup.md`, state: complete). **`npm run lint:architecture` → 0 errors, 0
  warnings.** 8 sub-slices, each its own gated commit (tsc + biome clean, full suite 383 suites / 2318
  passed, 45/45 snapshots zero-diff): **16a** broke the 3DPreview circular SCC (extract `GeometryOptions`
  leaf + widen strategy params → 73 cycles gone); **16b** the two orphan cycles (generateXML `Volume` leaf +
  streetLayout `reverseOrientation()` replacing `instanceof <sibling>`); **16d** fenced mapState (margin→
  `MapStateReadWindow`, `calculateInitialColorRange`→`util/color/`) — all 3 homes now on
  `feature-reaches-state-home-only-via-facade`; **16e** deduped isDeltaState wrappers → one
  `features/shared/IsDeltaStateStore`; **16g** renamed `new-must-not-import-legacy`→
  `source-layers-must-not-import-features` + swept stale `state/` comments + exempted ambient `.d.ts` from
  no-orphans; **16f** moved the initial-file loader into `load/` (fileStore ZERO upward deps); **16c** (the
  big one, 5 commits) extracted the shared Three infra into a NEW top-level **`threeViewer/`** layer, severed
  the `threeRenderer→globalSettings` edge (isWhiteBackground read moved to a mapState selector), relocated the
  cursor indicator + `colorCategoryCounts` out of codeMap, and DROPPED the codeMap/viewCube grandfather;
  **16i** made `util/` a genuine leaf kernel (indexedDB→`store/`, treeMapLayout+streetLayout→
  `threeViewer/algorithm/`, `defaultAmountOfTopLabels`+`Rectangle`→`model/`) + flipped `util-is-a-leaf-kernel`
  →error; **16h** CAPSTONE flipped `no-circular` warn→**error**. **User smoke owed (not snapshot-covered):**
  white-background toggle (16c-2) + the WebGL hover/select/edge render carried from Slices 14e/15.
- **✅ DONE (2026-07-04): Slice 15 — full `state/` dissolution** (`slice-15-state-dissolution.md`, state: complete).
  **`app/codeCharta/state/` is DELETED.** It CLOSED: **CF #2a** (`edges` → the dependency lens as a **derived
  `edgesSelector`**, NOT a slice — user decided edges was never owned/mutated; `fileSettings` root deleted,
  IndexedDB v14→v15 = its 15e), and the homeless cross-home read selectors from **CF #9**
  (`isDeltaState`/`areMultipleMapsVisible` → `fileStore/store/` in 15a; `selectedNode`/`hoveredNode` now live in
  `renderModel/` since the whole `state/selectors/` tree moved there in 15b). **Still open from CF #9:** the
  read-WRAPPER dedup (the `isDeltaState` ×5 / `selectedNode` ×3 duplicate wrapper *classes*) — that's the
  read-window/interaction-layer concern, distinct from homing the selectors. NEW homes: `renderModel/` (composing,
  barrel facade) + `store/` (root: `store.ts` composition + `state.manager`/`state.actions`/`getPartialDefaultState`).
  Effects → `features/*/effects/` (per-feature bundles) + `load/effects/` + `features/shared/effects/`. All 6
  sub-slices 45/45 snapshots zero-diff. **User smoke owed:** hover/select highlight (14e-3) + edge/arrow render (15e).
- **Done (2026-07-04):** ~~CF #1 / Slice 14e-3~~ — `slice-14-renderer-page-split.md`. **NodeDecorator id/metric
  split + `idToNode`/`valueOf` promoted onto the lenses**, permanently breaking the CF #1 cycle. 3 commits:
  (1) extracted the view-state-INDEPENDENT structure pass `NodeDecorator.decorateMapWithStructure` (ordinal id +
  `mergeFolderChain`) out of `decorateMapWithMetricData`; behavior-preserving because id+merge are deterministic
  and `accumulatedData` is UNCHANGED (it still classifies blacklist on the UN-merged tree before merging — gitignore
  semantics make classify-on-merged-path ≠ chain-head, so merge must NOT move ahead of classify; the structure lens
  runs its own independent structure pass instead). (2) `idToNodeSelector` → **structure lens** (`structure.facade`),
  built by running the structure pass on the lens's own undecorated tree; hover/constant-highlight consumers repoint;
  a parity test proves identical id→descendant structure. (3) `valueOfSelector` → **metrics lens facade** (user's
  ratified home), resolving via the structure lens's `idToNode` (legal lens→lens facade import). Both lens-owned
  lookups reach only DOWNWARD; `new-must-not-import-legacy`@error forbids the reverse, so the cycle
  (`lens → idToNode → accumulatedData → metricsLens.facade → lens`) is structurally impossible. 385 suites / 2321
  passed, **45/45 snapshots zero-diff**, tsc + biome + dep-cruiser clean (0 errors, 94 warnings unchanged).
  **Smoke owed to user:** hover/constant-highlight are not snapshot-covered → e2e + manual side-by-side vs `main`.
- **Done (2026-07-03):** ~~Slice 14d~~ (structure lens + relayer + cycle-free `valueOf`, resolves the CF#1 cycle) —
  `slice-14-renderer-page-split.md`. Stood up **`lenses/structure/`** — a read-only projection owning the
  undecorated unified tree (`structureTreeSelector` via `structure.facade`; the `_getUndecoratedAccumulatedData`
  build + its spec moved out of `accumulatedData`, byte-identical). **`accumulatedData` is now a pure composing
  selector ABOVE the lenses**: it reads `structureTreeSelector` DOWNWARD, clones it (the selector is memoized, so
  its instance is shared and must not be mutated in place) and layers metrics + blacklist + the `{nodes,edges}`
  aggregation on the clone. Added **`valueOfSelector`** (per-node `(id, metric) => value`) in the composing layer
  next to `idToNode` — cycle-free because it lives above the lenses (`new-must-not-import-legacy`@error blocks any
  `lenses/ → state/` import, so no lens can read it back). `getDeltaFile` relocated `state/ → util/` so the lens
  builds the tree without a `lenses/→state/` edge. 3 commits (getDeltaFile move → structure lens/relayer →
  valueOf); 384 suites / 2312 passed, **45/45 snapshots zero-diff (no -u)**, tsc + biome + dep-cruiser clean
  (0 errors, 94 warnings unchanged). **Folded into 14e** (all need the PATH id): the NodeDecorator id/metric split,
  `valueOf` onto the metrics lens facade, and `idToNode` ownership into the structure lens.
- **Done (2026-07-03):** ~~Slice 14 edge-attributeTypes re-home~~ (item #2d) — `slice-14-renderer-page-split.md`.
  The EDGE side of `attributeTypes` moved out of the metrics lens's `state.metricsLensSource` (where Slice 9a
  transiently parked it) into a brand-new **`state.dependencyLensSource`** root — the exact twin of
  `metricsLensSource`, one step later (per ADR 12 the dependency lens owns edge attribute types). New
  `lenses/dependency/store/` (edge `attributeTypes` reducer + `dependencyLensSource` combineReducers + root
  selector + `edgeAttributeTypesSelector` projection) behind `dependencyLens.facade` (read) +
  `dependencyLens.load.facade` (write: `setEdgeAttributeTypes` + reducer/default). The `updateFileSettings`
  effect now SPLITS the merged per-file `attributeTypes` at the load boundary (node → metricsLensSource, edge
  → dependencyLensSource, one setState); the load applier gained `applyDependencyLensSource`; every edge-type
  reader (accumulatedData + metricsBar) recombines the full `{ nodes, edges }` from the two lens facades
  (accumulatedData reading BOTH facades is intended — the composing-layer relayering that untangles CF #1 is
  14d). Metrics facade now exposes `nodeAttributeTypesSelector` (not the raw full map). IndexedDB `v12→v13`
  (`migrateCcStateRecordToV13`, new-root split). `lens-owns-ccjson-source` extended (still error) to fence the
  dependency source; 0 errors / 94 warnings unchanged. 3 commits (scaffolding → behavioral swap → dep-cruiser),
  384 suites green, **45/45 snapshots zero-diff (no -u)**, tsc + biome clean. **Only #2a (edges array) + #2b
  (injectable store) + #2c (metricDataSelector deletion) remain.**
- **Decision (2026-07-03, user): `attributeTypes` stay LENS-owned, NOT fileStore.** Per ADR 12 (`lenses.metrics`
  = attributes/descriptors/types/clusters; `lenses.dependency` = edges + edge attribute types/descriptors), the
  lens that holds the metric/dependency data owns its types. **node** `attributeTypes` → metrics lens (already
  there, Slice 9a); **edge** `attributeTypes` → dependency lens (item #2d — re-homes with the dependency-lens
  store; a standalone one-field move + IndexedDB migration is disproportionate, so bundle it with #2). This
  **vindicates `lens-owns-ccjson-source`** (no walk-back) and **retires the Slice-14 "relocate attributeTypes to
  fileStore" idea** (CF#1 breaks by relayering `accumulatedData`/aggregation ABOVE the lenses — folded into 14d —
  not by relocation). The stale `attributes.selectors.ts` comment claiming a fileStore move was fixed.
- Items 1, 2/2a, 4 are concrete, near-term follow-ups; item 6 is the broad remaining roadmap; item 7 (localStorage) is the last Slice-10 DoD refinement, held pending user sign-off. Item 8 (the `sorting` merge) landed in Slice 10c; item 5 (both `warn→error` flips) completed across Slice 11 + Slice 12. **Item 9** (new) = the Slice-13d cross-cutting read-wrapper dedup that remains after the mapState metric cluster landed.
- **Done (2026-07-03):** ~~Slice 13a/b/c~~ + **13d mapState metric cluster** — `slice-13-cqrs-homes.md`. **CQRS-split all three state homes** into a `<home>.read.facade` (selectors + root selector + `default*` fallbacks + store wiring) and a `<home>.write.facade` (action creators), so a display-only consumer physically cannot dispatch. 3 commits (13a preferences: 31 importers; 13b sharedView: 52, incl. the legacy `fileSettings.actions` re-export + the `3dPrint` blacklist re-export + the one `blackListExtension` service writer; 13c mapState: 134 facade importers + every external raw `mapState/store/**/*.actions` import → `.write.facade`, the largest home). Added the **3 CQRS dep-cruiser rules** (`state-home-write-facade-is-sole-dispatch-surface`, `state-home-read-facade-has-no-dispatch`, `display-components-cannot-dispatch`) growing home-by-home to **error across the whole tree, 0 violations**. 13c intentionally **left raw `*selector` imports in place** to avoid folding the `state/`-dependent `calculateInitialColorRange` into the read-facade barrel (cycle risk). **13d** introduced the injectable **`MapStateReadWindow`** (`mapState/store/mapState.readWindow.ts`, re-exported via the read facade — ngrx allowed there) and collapsed the mapState metric cluster: deleted 3 pure-read duplicate wrapper classes (`ExplorerAreaMetricStore`/`InspectorMapColorsStore`/`DistributionMetricStore`, 5 consumers repointed) + delegated 6 metricsBar read+write stores' read halves. All behaviour-preserving: 383 suites green, **45/45 snapshots zero-diff (no -u)**, tsc + biome + dep-cruiser clean. The **read/write split — the ratified target headline — is fully done**; only the cross-cutting read-wrapper dedup (item #9) remains.
- **Done (2026-07-03):** ~~Item 5~~ (both dep-cruiser `warn→error` flips) — `metrics-lens-ngrx-guard` flipped in **Slice 11**, and `new-must-not-import-legacy` flipped in **Slice 12** (`slice-12-legacy-boundary-close.md`) once all 6 residual `(lenses|fileStore)/ → (features|state)/` edges were re-homed (errorDialog+metricQueryParameter → `util/`; `referenceFile.selector` → `fileStore/store/`; the load applier → a neutral `load/` layer; the metrics-lens view-aware outputs inverted so consumers read `state/selectors/nodeMetricData` via their own feature stores). NB: the full `state/` → interaction/appearance dissolution is a SEPARATE later concern — `state/→state/` and `features/→state/` were always out of `new-must-not-import-legacy`'s `from` scope, so the flip did not require it.
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
