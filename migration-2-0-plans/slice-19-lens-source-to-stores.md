---
name: viz-2.0-slice-19-lens-source-to-stores
issue:
state: complete
version: 1
---

# Slice 19 — Move the lens SOURCE state into stores/ (drop store/ below lenses)

> **✅ COMPLETE (verified 2026-07-08).** Both lens-source homes live under `stores/metricsLensSource/` +
> `stores/dependencyLensSource/` (each with read/write facades + private `store/` internals);
> `getPartialDefaultState` moved to `features/shared/`; the ngrx composition root (`stores/rootStore/store.ts`)
> has **zero** `store → lenses` / `store → renderer` edges; the `stores-own-ccjson-source` dep-cruiser rule
> (labeled "Slice 19b") replaced `lens-owns-ccjson-source` at error. `lint:architecture` → 0 violations.

> Independent of the slice-18 facade-hygiene draft. Goal: make the ngrx composition root `store/` sit **just
> above** the state homes `stores/` in the dependency LSM, by severing its two upward edges — `store → renderer`
> (1) and `store → lenses` (8). Target LSM order: `views → features → load → renderer → lenses → store → stores
> → util → model`. Pure **structural** change (git mv + repoint + facade swap + rule edits): state keys
> preserved, **DB_VERSION stays 15, no IndexedDB migration, zero render-snapshot diff** — verified by a
> 5-investigator scoping pass. Inherits CONVENTIONS.md (snapshots ARE the contract, no `-u`; per-commit tsc +
> `npm test` zero-diff + `lint:architecture`).

## Why store/ is high today
`store/store.ts` (appReducers) registers **two lens-owned root reducers** — `metricsLensSource`
(attributeTypes + attributeDescriptors) and `dependencyLensSource` (edge attributeTypes) — and
`state.manager`/`indexedDBWriter` seed their defaults. Plus `store/getPartialDefaultState.ts` reads
`codeMapNodesSelector` from renderModel (the 1 store→renderer edge, used only by a features/ reset path).

## The move (source state → stores/, projection stays in the lens)

**A. Sever store → renderer.** `git mv store/getPartialDefaultState.{ts,spec.ts}` → `features/shared/`;
export it from `features/shared/facade.ts`; repoint its 3 consumers (`resetSettings.store`,
`labelSettings/stateAccess.store` → `shared/facade`; `resetSettingsButton.store` → sibling `../getPartialDefaultState`).
features/ is above renderer+store, so its downward reads stay legal.

**B. Sever store → lenses.** `git mv` the SOURCE files into two new homes (keys unchanged):
- `stores/metricsLensSource/store/` ← `lenses/metrics/store/{attributeTypes/, attributeDescriptors/, metricsLensSource.reducer.ts, metricsLensSource.selector.ts}` (+ the 2 reducer specs)
- `stores/dependencyLensSource/store/` ← `lenses/dependency/store/{attributeTypes/, dependencyLensSource.reducer.ts, dependencyLensSource.selector.ts}` (+ reducer spec)

New home facades (mirror the mapState read/write split):
- `stores/metricsLensSource/metricsLensSource.read.facade.ts` — re-export `metricsLensSource` reducer + `defaultMetricsLensSource` + source selectors.
- `stores/metricsLensSource/metricsLensSource.write.facade.ts` — re-export `setAttributeTypes`, `setAttributeDescriptors`.
- `stores/dependencyLensSource/dependencyLensSource.read.facade.ts` / `.write.facade.ts` — same for `dependencyLensSource` / `setEdgeAttributeTypes`.

Repoints:
- **Lens projection stays** and reads source downward from stores/: `lenses/metrics/store/attributes.selectors.ts`
  (`attributeTypesSelector` + `attributeDescriptorsSelector`) and `lenses/dependency/store/attributeTypes.selectors.ts`
  (`attributeTypesSelector`). `edges.selector`/`edgeMetricData.calculator` unchanged (read fileStore). The lens READ
  facades (`metricsLens.facade`, `dependencyLens.facade`) re-export only projections → unchanged.
- **store composition** → import the two reducers/defaults directly from the new read facades: `store/store.ts`,
  `store/state.manager.ts`, `store/indexedDB/indexedDBWriter.ts` (+spec).
- **load pipeline** → the write actions from the new write facades: `load/loadInitialFile.store.ts`,
  `load/effects/saveCcState/actionsRequiringSaveCcState.ts` (+ the load spec). (Other load/effect writers use
  `setState` partial-state under the preserved keys — no import to repoint.)
- **Retire** `lenses/metrics/metricsLens.load.facade.ts` + `lenses/dependency/dependencyLens.load.facade.ts` —
  post-move they re-export only stores/ symbols and have zero importers left → delete.
- Type-only / by-key readers (treeMapGenerator/Helper, 3dPrint stateAccess, updateMapColors, loadInitialFile.service)
  read the source off the typed `CcState` key — **unchanged**.

## Rule edits (`.dependency-cruiser.js`)
- **`lens-owns-ccjson-source`** → replace with **`stores-own-ccjson-source`**: `to.path` = the two new home `/store/`
  subtrees, external access via their facades only.
- **`state-home-is-leaf`**, **`state-home-only-stores-import-ngrx`** (+ the `/store/` pathNot),
  **`render-model-is-top-derived`**, **`source-layers-must-not-import-features`**,
  **`load-orchestrator-not-imported-by-lower-layers`** → add the two new homes to `from.path` (they are leaves/source layers).
- **`lens-no-view-state`** → NO edit (do NOT list the new homes; a lens reading its OWN cc.json source downward is the point).
- **`feature-reaches-state-home-only-via-facade` / CQRS rules** → optional; the `stores-own-ccjson-source` fence covers the source homes.

## Steps
- [x] A (commit f09561192): relocate `getPartialDefaultState` → `features/shared/` (sever store→renderer); tsc+lint 0/0, specs green.
- [x] B: moved the 2 lens-source roots → `stores/metricsLensSource/` + `stores/dependencyLensSource/` (same-depth git mv, moved files byte-identical), added read/write facades each, repointed all 16 importers (composition→read, load→write, lens projection reads source downward), retired the 2 lens load facades, rule edits (sever store→lenses). **tsc 0 · lint 0/0 (1172 modules) · full suite 384/384, 45/45 snapshots zero-diff.**
- [x] Verify LSM: `store/` outgoing bands = only `stores/` (26), `model/` (5), `util/` (1) — NO lenses, NO renderer. store sits just above stores. ✅

## 19c — nest store/ under stores/ (the payoff)
Once 19a+19b made `store/` depend only on `stores/`+`util`+`model`, the ngrx composition root could move
INTO the band it composes: `git mv store/ → stores/store/` (codemod repointed 141 specifiers across 101
importers). This eliminates the confusing top-level `store/` vs `stores/` siblings entirely — `store/` is gone
from the top level. `stores/` now holds the 6 leaf homes + the `store/` composer, and the WHOLE `stores/`
subtree has **zero upward edges** (depends only on `util`/`model`). Rule `root-store-is-sole-composer` retargeted
to `^app/codeCharta/stores/store/store.ts$`. tsc 0 · lint 0/0 · full suite 384/384, 45/45 zero-diff. (`load/`
stays the last parked composition-root shard — TARGET open question.)

## Outcome (2026-07-07)
Structural, zero-persistence-impact (DB_VERSION stays 15, no migration, keys `metricsLensSource`/`dependencyLensSource` unchanged). Rule changes: `lens-owns-ccjson-source` → `stores-own-ccjson-source` (facade-only access to the 2 source homes); both homes added to `state-home-is-leaf`, `state-home-only-stores-import-ngrx`, `render-model-is-top-derived`, `load-orchestrator-not-imported-by-lower-layers`, `source-layers-must-not-import-features`; `lens-no-view-state` untouched (a lens reading its own source downward is legal). The lenses are now pure read-only projections that own no ngrx state.

## Rollback
Two independent structural commits; revert either. No data/persistence/schema touched (keys preserved, DB_VERSION 15).
