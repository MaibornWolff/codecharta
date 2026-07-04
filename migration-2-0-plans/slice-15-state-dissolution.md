---
name: viz-2.0-slice-15-state-dissolution
issue:
state: proposal
version: 1
---

# Slice 15 — Dissolve the legacy `state/` folder (post-migration capstone)

> **TL;DR.** The slice AFTER the migration. The 5→14 spine emptied `state/` of the grab-bags and moved the
> dependency-free kernels out; DoD #7 deliberately left "derived selectors + the applier" behind. Slice 15
> gives even those a home so **`app/codeCharta/state/` can be deleted**. It creates **3 new homes** and
> re-homes 67 files. Inherits `CONVENTIONS.md` verbatim (snapshots ARE the behavior contract; structural
> `git mv` before behavioral swap; per-commit `tsc`+`npm test` zero-snapshot-diff+`lint:architecture`; e2e +
> manual smoke for what snapshots don't cover). Scoped 2026-07-04 by a 3-area file→destination mapping.

## Prerequisite — Slice 14e-3 runs FIRST (decided 2026-07-04, user)
Do **14e-3 before this slice**: it promotes `idToNode`/`valueOf` ONTO the structure/metrics lenses + does the
NodeDecorator id/metric split. That way those two never move into `renderModel/` — Slice 15 moves only
`accumulatedData` + the rest of the composing selectors. (User: finish 14e-3 then Slice 15; only the not-yet-built
renderers stay out of scope.)

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

## Sub-slice ladder (each its own gated commit; structural before behavioral)

- **15a — Foundations (structural, low).** Scaffold empty `renderModel/` + `store/` + their dep-cruiser rules at
  **warn**. Move the pure kernels → `util/` and the two file-state projections `isDeltaState` +
  `areMultipleMapsVisible` → `fileStore/store/` (**closes CF #9**). Zero snapshot diff.
- **15b — Composing layer (structural git-mv → reshape).** Move the `accumulatedData` cluster → `renderModel/`;
  the derived metric selectors → `renderModel/derivedMetrics/` (resolve the `metricRange`/`selectedColorMetricData`
  shim); the node-resolving + render-gate selectors → `renderModel/`. Repoint importers. **Flip
  `render-model-is-top-derived-layer` → error.** Delete `state/selectors/`.
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

## Open decisions (settle before starting)
1. **`renderModel/` name** (vs `composing/`) and whether it exposes a barrel facade or is imported per-selector.
2. **Edges (CF #2a) — home DECIDED = the dependency lens** (ADR-12), via an injectable `DependencyLensStore`.
   Still open: keep the imperatively-merged slice, **vs** derive edges as a pure selector over `fileStore`
   `visibleFileStates` (eliminating the slice). Pick the new root key when the slice-vs-selector call is made.
3. **`url/`** as its own module vs fold into `load/`.
4. **Does `renderModel/` host only selectors, or also "reaction" effects** (derived-selector → dispatch)? This
   decides whether the metric-reactive effects land in features (15c) or in `renderModel/`. Recommend **selectors
   only** → effects go to features (keeps the composing layer pure).
5. **Single-feature derived selectors** (`amountOfBuildingsWithSelectedEdgeMetric`→metricsBar,
   `sortedNodeEdgeMetricsMap`→codeMap, `searchedNodes`→sidebarExplorer): push into the owning feature vs keep in
   `renderModel/` for cohesion.
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
