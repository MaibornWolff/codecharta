---
name: viz-2.0-slice-9a-ccjson-source-lens
issue:
state: complete
version: 1
---

# Slice 9a — cc.json source → lenses (metrics: attributeTypes + attributeDescriptors)

## Outcome (2026-07-02, 3 commits)

- **(1) structural** (`0e45513ed`) — `git mv` of the two cc.json-source slices
  `state/store/fileSettings/{attributeTypes,attributeDescriptors}` → `lenses/metrics/store/`. The moved leaf
  selectors keep reading `fileSettingsSelector` transitionally; `fileSettings.reducer` keeps combining both
  (via the new `metricsLens.load.facade`) so `state.fileSettings.*` is unchanged → zero snapshot diff. Added
  `metricsLensSource` combineReducers root + `defaultMetricsLensSource` (unregistered) and the write/store-wiring
  **`metricsLens.load.facade`** (setAttributeTypes/setAttributeDescriptors + reducer/default). The read facade
  re-exposes the raw `{ nodes, edges }` `attributeTypesSelector`. External readers repointed to the facades
  (accumulatedData, metricsBar attributeTypes.store + createAttributeTypeSelector, inspectorMappingBlocks, 2 specs);
  the load applier + `fileSettings.reducer`/`.actions` repointed to the load facade.
- **(2) behavioral reshape** (`ec23f4ec1`) — model split: `FileSettings` drops the two keys, new
  `MetricsLensSource = { attributeTypes, attributeDescriptors }`, **per-file `CCFile.settings.fileSettings =
  FileSettings & MetricsLensSource`** (the .cc.json file still bundles them), `CcState` gains `metricsLensSource`.
  `state.manager` registers the root in `appReducers`+`defaultState` and repoints the two
  `objectWithDynamicKeysInStore` dotted paths `fileSettings.* → metricsLensSource.*`. New `metricsLensSource.selector`;
  the two leaf selectors read it (dropping the 2 `attributes.selectors → legacy` warn edges). Applier gains
  `applyMetricsLensSource` + `mapMetricsLensSourceToAction`, wired into BOTH load paths; the two cases leave
  `mapFileSettingToAction`. `updateFileSettings.effect` co-emits the shrunken `fileSettings:{edges,markedPackages,
  blacklist}` **and** `metricsLensSource:{attributeTypes,attributeDescriptors}` in ONE `setState`. Dotted/selector
  readers repointed to `state.metricsLensSource.*` (treeMapHelper, treeMapGenerator, updateMapColors.effect,
  3dPrint stateAccess + selectors, plus fileDownloader's per-file export param → intersection type). IndexedDB
  `DB_VERSION 6→7` + `migrateCcStateRecordToV7` (new-root, mirrors v6) chained after v6, +5 tests. Mocks
  `STATE`/`DEFAULT_STATE` split; the two effect-spec expectations updated for the two roots.
- **(3) dep-cruiser** (`342afe1a6`) — added `lens-owns-ccjson-source` at **warn**: non-lens code reaches the
  metrics source (`lenses/metrics/store/{attributeTypes,attributeDescriptors,metricsLensSource}`) only via a lens
  facade, never its store internals. 0 violations today (all access is via facades); flips to error once edges
  also move to a dependency-lens store.

`tsc` clean, `npm test` **45/45 snapshots zero diff (no -u)**, 2291 passing (+4 v7 migration tests),
`lint:architecture` **0 errors, 109 warns** (net-neutral: the 2 dropped `attributes.selectors → legacy` edges are
offset by the 2 moved-reducer → `state/store/util/setState.reducer.factory` edges). Scenarios + URL untouched
(neither references these keys). 5-landmine adversarial review: **0 findings** (import-graph trace confirms
`accumulatedData → metricsLens.facade` closes no cycle). **Finishes CF #2a (source).**

## Key facts verified in code (scope)

- **Dual-role type.** `FileSettings` was the state slice type AND the per-file `CCFile.settings.fileSettings` type.
  The .cc.json file genuinely carries attributeTypes/descriptors, so the domain type keeps them via the
  **intersection** `FileSettings & MetricsLensSource` on `CCFile`; only the merged **state root** narrows. This is
  the one structural deviation from the goal's literal "drop from FileSettings" — the .cc.json contract requires the
  keys per-file. All per-file constructors (ccJson2ToCCFile, aggregation/deltaGenerator) + readers (fileParser,
  mergers, fileDownloader, updateFileSettings.effect) keep compiling unchanged; only STATE mocks (`STATE`,
  `DEFAULT_STATE`) needed the split.
- **New root = clone the sharedView home shape.** `lenses/metrics/store/metricsLensSource.{reducer,selector}.ts`;
  register `metricsLensSource`/`defaultMetricsLensSource` in `state.manager`; add `MetricsLensSource` to
  `domain.model` + `metricsLensSource` to `CcState`.
- **Two facades.** Read facade (`metricsLens.facade.ts`, query-only) re-exposes `attributeDescriptorsSelector`
  (existing) + the raw `attributeTypesSelector` (new — NodeDecorator/metricsBar need the full `{nodes,edges}`).
  Write/wiring facade (`metricsLens.load.facade.ts`) exposes setAttributeTypes/setAttributeDescriptors +
  metricsLensSource/defaultMetricsLensSource.
- **Save trigger unchanged.** setAttributeTypes/setAttributeDescriptors stay in `fileSettingsActions` (imported from
  the load facade) → still spread into `actionsRequiringSaveCcState`.
- **IndexedDB:** `DB_VERSION 6→7` + `migrateCcStateRecordToV7` chained after v6 (new-root, builds `metricsLensSource`
  fresh from `defaultMetricsLensSource` + the two moved keys pulled out of fileSettings).

## Landmines (all held)

1. **Dual-role type split** — the .cc.json file carries attributeTypes/descriptors, so `FileSettings` alone can't
   drop them without breaking the per-file pipeline. Resolved by `CCFile.settings.fileSettings = FileSettings &
   MetricsLensSource` (per-file bundles all 5; state root narrows). tsc pinpointed every state mock to split.
2. **`objectWithDynamicKeysInStore` stale-key leak** — both entries repointed `fileSettings.* → metricsLensSource.*`
   so the two maps are still replaced WHOLESALE (not deep-merged) on setState/scenario/rehydrate. The effect emits
   `metricsLensSource.{attributeTypes,attributeDescriptors}` so the dynamic-key path matches exactly.
3. **v7 is a NEW-root migration** (like v6) — an old v6 blob has attributeTypes/descriptors under `fileSettings` and
   NO metricsLensSource; the transform builds it fresh from defaults + the two moved keys.
4. **No import cycle** — `accumulatedData → metricsLens.facade` was verified one-directional (facade subtree never
   reaches accumulatedData), so the re-exported `attributeTypesSelector` is defined at import time (unlike the CF #1
   `valueOf` cycle).
5. **`new-must-not-import-legacy` net-neutral** — the 2 `attributes.selectors → fileSettings` edges drop, but the 2
   moved reducers still import the shared `setState.reducer.factory` under `state/store/util/` (2 new warn edges).
   Net 109 warns, unchanged. The flip still waits on 9c/10.

## Explicitly DEFERRED (recorded in CARRIED-FORWARD)

- **`edges` → dependency lens.** `state.fileSettings.edges` is a **merged render-model array** consumed by codeMap
  rendering + view-state, not by the metrics lens. It needs the injectable `DependencyLensStore`/`EdgesRepo` + a
  render-model home first (roadmap S9a note / CF #2b). Slice 9a moves only the metrics source; edges stay in
  `fileSettings` for now.

## Rollback

Revert `342afe1a6` alone to drop the dep-cruiser boundary; revert `ec23f4ec1` to return to the `fileSettings`
shape (keeping the folder move); revert both `ec23f4ec1`+`0e45513ed` to return to the Slice-8 shape.
