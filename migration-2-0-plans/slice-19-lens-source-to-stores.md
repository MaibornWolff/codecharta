---
name: viz-2.0-slice-19-lens-source-to-stores
issue:
state: progress
version: 1
---

# Slice 19 — Move the lens SOURCE state into stores/ (drop store/ below lenses)

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
- [ ] A: relocate `getPartialDefaultState` → `features/shared/` (sever store→renderer); tsc+lint+tests green; commit.
- [ ] B: move the 2 lens-source roots → `stores/`, new facades, repoint composition+load, retire lens load facades, rule edits (sever store→lenses); tsc+lint 0/0 + full suite zero-diff; commit.
- [ ] Verify LSM: `store/` outgoing bands = only `stores/ util/ model/`; store sits just above stores.

## Rollback
Two independent structural commits; revert either. No data/persistence/schema touched (keys preserved, DB_VERSION 15).
