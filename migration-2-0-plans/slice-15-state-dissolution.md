---
name: viz-2.0-slice-15-state-dissolution
issue:
state: complete
version: 1
---

# Slice 15 — Dissolve the legacy `state/` folder (post-migration capstone)

> **TL;DR.** The slice AFTER the migration. The 5→14 spine emptied `state/` of the grab-bags and moved the
> dependency-free kernels out; DoD #7 deliberately left "derived selectors + the applier" behind. Slice 15
> gives even those a home so **`app/codeCharta/state/` can be deleted**. It creates **3 new homes** and
> re-homes 67 files. Inherits `CONVENTIONS.md` verbatim (snapshots ARE the behavior contract; structural
> `git mv` before behavioral swap; per-commit `tsc`+`npm test` zero-snapshot-diff+`lint:architecture`; e2e +
> manual smoke for what snapshots don't cover). Scoped 2026-07-04 by a 3-area file→destination mapping.

## Prerequisite — Slice 14e-3 runs FIRST ✅ DONE (2026-07-04)
Slice 14e-3 is **complete** (`slice-14-renderer-page-split.md`): it promoted `idToNodeSelector` ONTO the structure
lens (`structure.facade`) and `valueOfSelector` ONTO the metrics lens (`metricsLens.facade`), and split the
view-state-independent structure pass (`NodeDecorator.decorateMapWithStructure`) out of the metric pass — permanently
breaking the CF #1 cycle. So those two are already lens-owned and **out of scope for `renderModel/`**: Slice 15 moves
only `accumulatedData` + the rest of the composing selectors (`pathToNode`, `codeMapNodes`, `rootUnary`, `metricData`,
the derived metric + node-resolving selectors). The `state/selectors/accumulatedData/` folder no longer contains
`idToNode`/`valueOf`.

## What's still in `state/` (67 non-spec files)
- **`store/` (9)** — the ngrx ROOT composition (`state.manager`: appReducers/defaultState/setStateMiddleware/
  `_applyPartialState`; the global `setState` action) + the LAST grab-bag `fileSettings: { edges }`.
- **`selectors/` (27)** — the `accumulatedData` COMPOSING layer (accumulatedData / idToNode / pathToNode /
  valueOf / codeMapNodes / metricData) + the view-state-aware derived metric selectors + the node-resolving
  selectors + a few cross-home render flags.
- **`effects/` (31 / 18 folders)** — reactive side-effects that each belong to a feature or the load/persist layer.

## The 3 new homes it creates

1. **`renderModel/`** — NEW top-level **composing layer** (peer of `load/`). The cross-lens "render model": folds
   the structure + metrics + dependency lenses + view state into the decorated tree. Owns `accumulatedData`,
   `pathToNode`, `codeMapNodes`, `rootUnary`, `metricData`, the derived metric selectors, and the node-resolving
   selectors. **NOT `idToNode`/`valueOf`** — the prerequisite Slice 14e-3 promotes those ONTO the structure/metrics
   lenses (see Prerequisite below). It MAY import lens facades + home **read** facades + fileStore + util; **nothing
   may import it back** except `features/`, `load/`, effects and renderers (a top derived layer). New rule
   `render-model-is-top-derived-layer`.
2. **`store/`** — NEW top-level **root-store module**: `appReducers` / `defaultState` / `setStateMiddleware` /
   `_applyPartialState` + the global `setState` action. The **single** module allowed to import every home reducer +
   both lens load facades. Only `app.config.ts` imports it. New rule `root-store-is-sole-composer`.
3. **`url/`** — NEW small concern: browser-URL sync (`updateQueryParameters`). *(Open decision: own module vs fold
   into `load/`.)*

…plus re-homes into EXISTING owners: **`fileStore/`** (pure file-state projections), **`util/`** (pure kernels),
**`features/<feature>/effects/`** (NEW per-feature effect folders), **`load/`** (persistence + the file-merge
applier), **`lenses/dependency/`** (edges, via an injectable store).

## What moves where (summary — full per-file map in the 2026-07-04 scoping run)

| From `state/…` | → Destination | Move type |
|---|---|---|
| `selectors/accumulatedData/*` (accumulatedData, pathToNode, codeMapNodes, rootUnary, metricData, utils) | **`renderModel/`** | git-mv |
| `selectors/accumulatedData/{idToNode, valueOf}` | **structure / metrics lens** (via prerequisite 14e-3, not this slice) | — |
| `selectors/{nodeMetricData,edgeMetricData}`, `sortedNodeEdgeMetricsMap` | **`renderModel/derivedMetrics/`** | reshape |
| `selectors/{selectedNode,hoveredNode,rightClickedCodeMapNode}`, `searchedNodes`, `allNecessaryRenderDataAvailable`, `labelsPerMapActive` | **`renderModel/`** | reshape |
| `selectors/{isDeltaState, areMultipleMapsVisible}` | **`fileStore/store/`** (closes CF #9) | git-mv |
| `selectors/searchedNodes/getNodesByGitignorePath` + the pure predicates | **`util/`** | git-mv |
| `effects/{renderCodeMapEffect(+actionsRequiringRerender), autoFitCodeMapChange, setLoadingIndicator}` | **`features/codeMap/effects/`** | git-mv |
| `effects/{resetChosenMetrics, resetColorRange, updateMapColors, linkColorMetricToHeightMetric, updateEdgePreviews, amountOfEdgePreviews, resetSelectedEdgeMetric…}` | **`features/metricsBar/effects/`** | git-mv / reshape |
| `effects/updateVisibleTopLabels` | **`features/labelSettings/effects/`** | git-mv |
| `effects/blacklistSearchPattern` | **`features/sidebarExplorer/effects/`** | git-mv |
| `effects/blacklistExtension` | **`features/fileExtensionBar/effects/`** | git-mv |
| `effects/{addBlacklistItemsIfNotResultsInEmptyMap, unfocusNodes}` | **`sharedView/`** (blacklist write-guard + load-reset) | reshape |
| `effects/{saveCcState, updateFileSettings(+mergers)}` | **`load/`** | git-mv / reshape |
| `effects/updateQueryParameters` | **`url/`** (or `load/`) | reshape |
| `store/fileSettings/edges/*` | **`lenses/dependency/`** (injectable store) | reshape |
| `store/fileSettings/{reducer,selector,actions}` | **DELETE** — root slice gone (the per-file `FileSettings` **type** stays in `model/`) | inversion |
| `store/{state.actions, state.manager}`, `store/util/getPartialDefaultState` | **`store/`** (+ `util/` for the deep-merge kernel) | reshape |

## Progress log
- **✅✅ SLICE 15 COMPLETE (2026-07-04) — `app/codeCharta/state/` is DELETED.** The post-migration capstone is
  done: the composing selectors live in `renderModel/`, the effects in `features/*/effects/` + `load/`, the root
  store in `store/`, edges is a derived dependency-lens selector. All 6 sub-slices landed value-identical
  (**45/45 snapshots zero-diff throughout**, 0 dep-cruiser errors / 94 warnings). New homes: `renderModel/`
  (barrel facade, `render-model-is-top-derived-layer`@error), `store/` (`store.ts` composition +
  `root-store-is-sole-composer`@error). `new-must-not-import-legacy` kept (state/ target dropped; features/ fence
  stays). **Smoke owed to user** (not snapshot-covered): hover/select highlight (14e-3 carry-over) + edge/arrow
  rendering (15e) → e2e + manual side-by-side vs `main`.
- **15f ✅ DONE (2026-07-04).** Root store `state/store/` → `store/`; `state/` DELETED. Split the composition
  (`appReducers`+`setStateMiddleware` → `store/store.ts`, app.config-only, `root-store-is-sole-composer`@error)
  from the root-state contract (`defaultState`+`_applyPartialState` → `store/state.manager`; `setState` →
  `store/state.actions`; `getPartialDefaultState` → `store/`) so consumers never touch the composition. ~90
  importers repointed (path swaps; 2 specs split their co-import). `new-must-not-import-legacy` state/ target
  dropped, features/ fence kept (the plan said "retire" but the features/ fence is still the only thing stopping
  lenses/fileStore → features/). 45/45 snapshots zero-diff.
- **15e ✅ DONE (2026-07-04).** Edges → dependency lens as a **derived selector** + `state.fileSettings` root
  **DELETED** (CF #2a closed). **User DECIDED option (b)** (derive, not keep a slice) after discussion: edges is
  never owned/mutated (`addEdge`/`removeEdge` dispatched nowhere), only ever re-derived as
  `getMergedEdges(visibleFiles)` — a materialized view, not state. 3 commits: (15e-1) `getMergedEdges` kernel →
  `util/edges/`; (15e-2) additive `edgesSelector` on `dependencyLens.facade` + **parity spec** proving it equals the
  old stored derivation; (15e-3, behavioral, `feat!`) swap all readers (`edgeVisibility.selector`, `treeMapHelper`,
  `codeMapArrow.store` — a `getValue().fileSettings.edges` **runtime landmine tsc missed**) onto `edgesSelector`,
  drop the effect's edges branch + the `applyFileSettings` applier + both loader call-sites, delete the edges +
  fileSettings slices, strip `fileSettings` from `appReducers`/`defaultState`/`objectWithDynamicKeysInStore`/`CcState`
  (per-file `FileSettings` type stays), drop edge actions from the save-trigger union, **IndexedDB v14→v15**
  (`migrateCcStateRecordToV15` drops the key). **45/45 snapshots zero-diff** (value-equivalent). **Test-mock lesson:**
  the mocks decoupled `fileSettings.edges` from `files` (impossible in prod); specs now mock `edgesSelector` (import
  via the FACADE for the boundary rule, `jest.mock` the store module for interception) with a `beforeEach` default to
  stop `mockReturnValue` leaking across tests. **Smoke owed to user:** edge/arrow rendering isn't fully
  snapshot-covered → e2e + manual side-by-side vs `main`.
- **15d ✅ DONE (2026-07-04).** All 5 top-layer effects left `state/effects/` (now **dissolved**). 3 commits,
  value-identical (**45/45 snapshots zero-diff**, 0 errors): (15d-1) `unfocusNodes` + `saveCcState` +
  `updateQueryParameters` → `load/effects/` (URL sync folds into load/, no separate `url/`); (15d-2) blacklist
  guard → `features/shared/effects/` with the shared `doBlacklistItemsResultInEmptyMap$` stream **extracted into a
  root-provided `BlacklistExclusionGuard` injectable** (breaks the effect-injects-effect coupling — sidebarExplorer
  injects it via a new `features/shared` facade); (15d-3) `updateFileSettings` (+ mergers) → `load/effects/`.
  **Realized "sharedView/" as features/load** (the plan's dep-cruiser note is explicit: effects go to features/load,
  never into a home — `state-home-only-stores-import-ngrx` forbids ngrx in a home). `app.config` now registers
  every effect via per-feature/load **bundles** (`...codeMapEffects` etc.); no individual effect imports remain.
  Pure `resultsInEmptyMap` → `util/blacklist`.
- **15c ✅ DONE (2026-07-04).** All 13 single-owner reactive effects moved from `state/effects/` into their
  owning feature's `effects/` folder, each behind a `<feature>.effects.ts` bundle. 3 commits (codeMap ·
  metricsBar · labelSettings+sidebarExplorer+fileExtensionBar), all value-identical (**45/45 snapshots
  zero-diff**, 0 errors). **Key decisions/patterns:**
  - **Effect bundles are a composition-root registration surface, NOT routed through the feature facade** —
    routing them through the facade pulls each effect's cross-feature deps into the facade graph and forms
    cycles (hit this on codeMap → scenarios/navBar). `app.config` imports `features/<f>/effects/<f>.effects`
    directly; the facade stays clean.
  - **dep-cruiser rule updates:** `feature-only-stores-can-import-ngrx-store` now exempts `effects/` (effects are
    ngrx state-reactors); `feature-no-external-access-to-internals` allows `effects/<f>.effects.ts` as a public
    registration surface; `feature-cross-feature-only-via-public-api` now exempts `.spec.ts` (test-wiring,
    consistent with every other boundary rule — a service spec may register another feature's effect in a test
    EffectsModule).
  - **Shared helpers pulled out of effect files:** `setDefaultMetrics` (metricsBar effect ↔ globalSettings
    map-reset) → its own module, exposed via the metricsBar facade (the effect imports no other feature, so no
    cycle); `getNumberOfTopLabels` (labelSettings effect ↔ state/store `getPartialDefaultState`) → `util/` (NOT
    the labelSettings facade, which would close a codeMap↔labelSettings cycle; util→mapState has precedent).
  - Effects import their OWN feature's services from source, never the feature facade (avoids facade↔effect cycle).
- **15b ✅ DONE (2026-07-04).** `state/selectors/` fully DISSOLVED into a new top-level `renderModel/` home
  behind a barrel facade. Two structural commits, both value-identical (385 suites / 2321 passed, **45/45
  snapshots zero-diff**, tsc + dep-cruiser 0 errors): (15b-1) `git mv state/selectors → renderModel` preserving
  substructure — internal cross-refs preserved, out-of-tree imports lose one `../`, ~41 source + ~27 spec
  importers repointed per-file; (15b-2) added `renderModel.facade.ts` (`export *` over 17 selector modules),
  repointed source consumers onto it (specs kept per-file — jest.mock/spyOn need module granularity and
  `export *` re-exports aren't spyable), and added `render-model-is-top-derived-layer` at **error**. **Cleanup
  forced by the new rule:** the pure `MetricMinMax` type moved from the composing layer → `util/metric/metricRange`
  (its documented superset), resolving a mapState-home → renderModel inversion (`calculateInitialColorRange` +
  the util color/label helpers now read it downward). **Lesson:** a barrel over specs is fragile — collapsing
  per-file jest.mock/spyOn targets onto one barrel path collides / breaks spyable bindings; keep specs per-file.
- **15a ✅ DONE (2026-07-04).** Two structural commits, both value-identical (385 suites / 2321 passed, **45/45
  snapshots zero-diff**, tsc + dep-cruiser 0 errors / 94 warnings unchanged): (1) `getNodesByGitignorePath` pure
  kernel → `util/blacklist/`; (2) `isDeltaState` + `areMultipleMapsVisible` projections → `fileStore/store/`
  (closes CF #9's two homeless selectors). The `renderModel/` + `store/` folder scaffolding + their dep-cruiser
  rules are **deferred into 15b/15f** (an empty folder isn't git-tracked, and a warn rule matching a not-yet-
  existing path is a no-op; the rule is added at warn WITH the git-mv in 15b, then flipped to error).

## Sub-slice ladder (each its own gated commit; structural before behavioral)

- **15a — Foundations (structural, low).** ✅ Move the pure kernels → `util/` and the two file-state projections
  `isDeltaState` + `areMultipleMapsVisible` → `fileStore/store/` (**closes CF #9**). Zero snapshot diff.
  (`renderModel/`/`store/` scaffold + rules folded into 15b/15f — see Progress log.)
- **15b — Composing layer (structural git-mv → reshape).** ✅ Moved the WHOLE `state/selectors/` tree →
  `renderModel/` (preserving substructure — the `derivedMetrics/` regrouping was skipped as cosmetic churn),
  behind a `renderModel.facade.ts` barrel; source consumes the barrel, specs stay per-file. **Flipped
  `render-model-is-top-derived-layer` → error** (0 violations after moving `MetricMinMax` → `util/metric`).
  `state/selectors/` DELETED. See Progress log.
- **15c — Effects → features (structural).** Establish the `features/<feature>/effects/` folder + a per-feature
  `<feature>Effects` array export; make `provideEffects` spread the bundles. Move the single-owner effects
  (codeMap render cluster; metricsBar metric-reactive; labelSettings; sidebarExplorer; fileExtensionBar).
- **15d — Top-layer effects.** Shared blacklist guard + `unfocusNodes` → `sharedView/`; `saveCcState` → `load/`;
  `updateQueryParameters` → `url/`; **`updateFileSettings` → `load/`** (highest-risk — it performs the Slice-14
  attributeTypes split into metricsLensSource/dependencyLensSource). Delete `state/effects/`.
- **15e — Edges + fileSettings (CF #2a, behavioral, high).** Re-home `edges` into an injectable
  `DependencyLensStore` under **`lenses/dependency/store/`** (DECIDED — ADR-12: the dependency lens owns edges +
  edge types). Writers (the load pipeline) reach it via the load facade so they never import lens internals; readers
  via the read facade — the `mapState` edge-visibility fold (show in/out) stays in the composing/feature layer so
  `lens-no-view-state` holds.
  repoint the ~5 readers/writers + the `objectWithDynamicKeysInStore` path; **DELETE the `fileSettings` root slice**
  + drop its key from `appReducers`/`defaultState`.
- **15f — Root store + teardown (keystone, high).** Move `state.actions` + `state.manager` → `store/` (optionally
  extract the `_applyPartialState` deep-merge kernel → `util/`); add `root-store-is-sole-composer` at **error**;
  repoint `app.config.ts`. Re-home `getPartialDefaultState`. **Delete the now-empty `state/` folder.** Retire
  `new-must-not-import-legacy` (its `from` scope — `state/` — no longer exists).

## dep-cruiser changes
- **Add** `render-model-is-top-derived-layer` (warn 15a → error 15b): `renderModel/` may import lens facades + home
  **read** facades + `fileStore/` + `util/` + `model/`; only `features/` / `load/` / effects / renderers may import
  `renderModel/`.
- **Add** `root-store-is-sole-composer` (error 15f): `store/` may import every home reducer/default + both lens load
  facades; only `app.config.ts` imports `store/`.
- **Retire** `new-must-not-import-legacy` in 15f (the dissolving `state/` it fenced is gone).
- **Keep green throughout:** `state-home-is-leaf` (no effect lands in a home `store/` folder — effects go to
  features/load), `lens-no-view-state` + `lens-owns-ccjson-source` (no lens imports `renderModel/` or view state),
  the CQRS read/write facade rules.

## Open decisions — SETTLED (2026-07-04, user)
1. **`renderModel/` name — DECIDED: `renderModel/`** (not `composing/`). Exposes a **barrel facade**
   (`renderModel.facade.ts` re-exporting all composing selectors), mirroring the home read-facades.
2. **Edges (CF #2a) — home DECIDED = the dependency lens** (ADR-12), via an injectable `DependencyLensStore`.
   Still open: keep the imperatively-merged slice, **vs** derive edges as a pure selector over `fileStore`
   `visibleFileStates` (eliminating the slice). Pick the new root key when the slice-vs-selector call is made (15e).
3. **`url/` — DECIDED: fold `updateQueryParameters` into `load/`** (no separate `url/` module). URL sync is a
   persist/hydrate concern like `saveCcState`, which also lands in `load/`.
4. **`renderModel/` hosts ONLY selectors — DECIDED: selectors only.** The reaction effects
   (`resetChosenMetrics`/`updateMapColors`/…) land in `features/<feature>/effects/` (15c), keeping the composing
   layer pure (mirrors the lenses).
5. **Single-feature derived selectors** (`amountOfBuildingsWithSelectedEdgeMetric`→metricsBar,
   `sortedNodeEdgeMetricsMap`→codeMap, `searchedNodes`→sidebarExplorer): default = keep in `renderModel/` for
   cohesion (the plan table's mapping); revisit only if a feature clearly owns one outright.
6. **14e-3 ordering — DECIDED: 14e-3 runs FIRST** (see Prerequisite). `idToNode`/`valueOf` become lens-owned in
   14e-3 and are out of `renderModel/`; Slice 15 moves only `accumulatedData` + the rest.

## Risks
- **High:** `updateFileSettings` (touches the lens-source split), `edges`/`fileSettings` deletion (CF #2a), the
  root-store move (every `state.manager`/`state.actions` consumer repoints — ~14 sites + `app.config`).
- **Behavioral effects** (`reset*`/`update*` that dispatch on file-load/metric-change) touch render + selection;
  several are **not snapshot-covered** → gate on e2e + **manual side-by-side vs `main`** (render, metric reset,
  color-range, hover/select) per CONVENTIONS.
- Cross-effect DI coupling (`BlacklistSearchPatternEffect` injects the shared blacklist-guard effect) — refactor the
  shared stream into an injectable service when it moves (15d).

## Definition of Done
- **`app/codeCharta/state/` is deleted.** `renderModel/` + `store/` (+ `url/`) exist with enforced boundaries.
- `new-must-not-import-legacy` retired; `render-model-is-top-derived-layer` + `root-store-is-sole-composer` at error;
  all pre-existing rules still green (0 errors).
- Every structural commit: zero snapshot diff, no `-u`. Every behavioral commit: value-parity before deletion + e2e
  + manual smoke for the uncovered flows.
- `CcState` unchanged in shape (this slice moves *code*, not state keys — except `edges` leaving `fileSettings`,
  which is a shape change gated by an IndexedDB migration + the applier, mirroring 9a–14).

## Rollback
Each sub-slice is its own commit; revert restores the `state/…` path (structural) or the old data path (behavioral,
old path deleted only in a separate follow-up commit).

## Note on scope
This is the **post-migration capstone** — it goes BEYOND migration DoD #7 (which keeps derived selectors + the
applier outside a home) by giving them the `renderModel/` + `store/` homes. It is renderer-agnostic state/composition
work, NOT renderer-multiplicity work, so it is **in scope** and distinct from the out-of-migration multi-renderer
milestones (see the SCOPE callout in `roadmap-v2-state-homes.md`).
