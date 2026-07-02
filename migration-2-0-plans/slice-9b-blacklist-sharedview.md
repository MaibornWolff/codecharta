---
name: viz-2.0-slice-9b-blacklist-sharedview
issue:
state: complete
version: 1
---

# Slice 9b — `blacklist` → sharedView + lift blacklist/edge-visibility out of both lenses

## Outcome (2026-07-02, 3 commits)

- **(1) structural** (`340ea9cf3`) — `git mv state/store/fileSettings/blacklist → sharedView/store/blacklist`.
  The moved leaf selectors keep reading `fileSettingsSelector` transitionally; `fileSettings.reducer` keeps
  combining `blacklist` (imported from the `sharedView` facade) so `state.fileSettings.blacklist` is unchanged →
  **zero snapshot diff**. The `sharedView` facade re-exports the blacklist store (actions/reducer/selector/byType/
  matcher). All **~27 external importers** repointed to `sharedView.facade` (incl. specs); the save-trigger blacklist
  actions stay in `fileSettingsActions`, now imported from the sharedView facade (mirrors the 9a attributeTypes
  precedent). Net warns **109→107**: the 2 dependency-lens `lens → state/…/blacklist` edges became
  `lens → sharedView` (no rule flags a lens→home import), a real step toward `lens-no-view-state`.
- **(2) behavioral reshape** (`9080dd857`) — model split: `FileSettings` (state) drops `blacklist` (narrows to
  `{ edges, markedPackages }`), `SharedView` gains `blacklist: BlacklistItem[]`, and per-file
  **`CCFile.settings.fileSettings = FileSettings & MetricsLensSource & { blacklist }`** (the .cc.json file still
  bundles it — the one deviation from the literal "drop from FileSettings", identical to 9a's dual-role handling).
  `sharedView.reducer` combines `blacklist`; `blacklist.selector` reads `sharedViewSelector`; `state.manager`
  renames the `objectWithDynamicKeysInStore` path `fileSettings.blacklist → sharedView.blacklist` (array →
  wholesale replace). Applier: the `blacklist` case moves from `mapFileSettingToAction` to `mapSharedViewToAction`.
  `updateFileSettings.effect` co-emits the shrunken `fileSettings:{edges,markedPackages}` **and**
  `sharedView:{blacklist}` in ONE `setState`. Scenarios: `scenarioApplier.buildFiltersPatch` re-keys
  `fileSettings:{blacklist} → sharedView:{blacklist,focusedNodePath}`; `scenarios.service.buildScenarioSections`
  reads `state.sharedView.blacklist`. IndexedDB `DB_VERSION 7→8` + `migrateCcStateRecordToV8` (**merge-into-EXISTING
  sharedView**, mirrors v3–v5 not the v6/v7 new-root), chained after v7 (+4 tests). Duplicate `3dPrint`
  `blacklistSelector` deduped to a re-export of the sharedView facade selector; `3dPrint` stateAccess repointed.
- **(3) lens parameterization — P0-1 half 2** (`90bbe736b`) — the dependency lens's view-state-aware edge selectors
  moved out of `lenses/dependency/store/` into **`state/selectors/edgeMetricData/`** (the edge twin of
  `state/selectors/nodeMetricData/`). The lens facade now exposes only the RAW pure calc
  `calculateEdgeMetricData(visibleFileStates, matcher)`; the derived selectors compose it with the `sharedView`
  blacklist (`edgeMetricDataResult`/`data`/`nodeEdgeMetricsMap`/`names`) and the `mapState` edge-visibility
  `showIncoming/OutgoingEdges` (`sortedNodeEdgeMetricsMap`). The two selector specs move with them (parity /
  characterization). 6 consumers (`metricData`, `accumulatedData`, `amountOfBuildingsWithSelectedEdgeMetric`,
  `edgePreviewNodes`, `resetSelectedEdgeMetric` + `updateQueryParameters` effects) repoint. The node side was already
  done: `nodeMetricDataSelector`'s `blacklistMatcher` import repointed to the sharedView facade in commit (1).

`tsc` clean, `npm test` **45/45 snapshots zero diff (no -u)**, **2295 passing** (+4 v8 migration tests),
`lint:architecture` **0 errors, 107 warns** (net −2 vs 9a). **After this slice neither lens imports any home
selector (blacklist + edge-visibility)** — grep-verified; the edge calc keeps only the `BlacklistMatcher`
*parameter type* from the util kernel. Adversarial review: see below. **Resolves P0-1 half 2** (the dependency lens
is now view-state-free) and the **blacklist** half of CF #5.

## Key facts verified in code (scope)

- **Dual-role type (same shape as 9a).** `FileSettings` was both the state-slice type AND the per-file type. The
  .cc.json file carries blacklist per-file, so `CCFile.settings.fileSettings` keeps it via the intersection
  `FileSettings & MetricsLensSource & { blacklist }`; only the merged **state root** narrows. tsc pinpointed every
  per-file constructor/reader (all still provide/read blacklist) and every state mock to split.
- **Merge-into-EXISTING sharedView (v8), not a new root.** `sharedView` already exists (created at v6), so v8
  mirrors v3–v5 (`{ ...defaultSharedView, ...existing }` + move `fileSettings.blacklist → sharedView.blacklist`),
  unlike v6/v7 which built a fresh root. Chained `if (oldVersion < 8)`; the v2→v8 upgrade test carries a
  `fileSettings.blacklist` value through and asserts it lands under `sharedView`.
- **`sharedView.blacklist` dynamic key (array).** Renamed in `objectWithDynamicKeysInStore`; the effect + scenario
  applier + `_applyPartialState` all nest blacklist under a `sharedView` key so the composed path matches and the
  array is replaced WHOLESALE (never deep-merged into numeric keys). The `state.reducer.spec` dynamic-key test
  re-homed to `sharedView.blacklist`.
- **Lens exposes RAW edge data.** `calculateEdgeMetricData` stays in `lenses/dependency/store/` (the lens's genuine
  data core — unlike the node calc which moved to `util/` in Slice 7 to break a cycle; the edge side has no such
  cycle) and is exposed via the facade. The derived selectors import it via the facade (`state → lens facade`, the
  allowed migration direction), composing the view state outside the lens. No import cycle.

## Landmines (all held)

1. **Array wholesale-replace** — `objectWithDynamicKeysInStore` path renamed `fileSettings.blacklist →
   sharedView.blacklist`; the effect emits `sharedView:{blacklist}` so the composed path matches exactly.
2. **Effect co-emit doesn't clobber siblings** — the effect emits ONLY `sharedView:{blacklist}`;
   `_applyPartialState` recurses into `sharedView`, replaces `blacklist` wholesale, and preserves
   `focusedNodePath`/`searchPattern` via the `{...applyTo.sharedView}` spread.
3. **Dual-role split** — `CCFile.settings.fileSettings` keeps blacklist per-file via the intersection; every per-file
   constructor/reader (ccJson2ToCCFile, delta/aggregation generators, fileParser, mergers, blacklist.merger,
   fileDownloader) compiles unchanged; only STATE mocks (`STATE`/`DEFAULT_STATE` + a few spec mock states) split.
4. **Runtime-only state reads TypeScript can't catch** — `Print3DStateAccessStore.getBlacklist()` read
   `state.fileSettings.blacklist` (compiled clean via `State.getValue()`), and five `blackListExtension.service.spec`
   `store.setState({ fileSettings:{...blacklist} })` overrides — all repointed to `sharedView`; caught by running
   the suite, not tsc.
5. **v8 = merge into existing sharedView** (see Key facts); default blacklist `[]` when absent.
6. **Derived-edge value parity** — same `createSelector` inputs + memoization as the old lens selectors; proven by
   the relocated integration specs + all edge consumers (metricData/edgePreview/accumulatedData/effects) green + 45
   snapshots byte-identical.
7. **No import cycle** — `fileSettings.reducer → sharedView.facade` (barrel) does not reach back into
   `fileSettings.reducer` (blacklist.selector → `fileSettings.selector` → model only); `state/selectors/edgeMetricData
   → dependencyLens.facade → calculator` (util/model/d3, no back-edge). Both DAGs. `no-circular` clean.

## Explicitly DEFERRED (recorded in CARRIED-FORWARD)

- **`markedPackages` → sharedView** (Slice 9c) — the last `fileSettings` member; empties + deletes `fileSettings`.
- **`edges` → dependency lens** — still a merged render-model array in `fileSettings` (CF #2a, needs a render-model
  home + injectable dependency store first).
- **`lens-no-view-state` dep-cruiser rule** — not added yet (stays deferred to Slice 13 per the roadmap); both
  lenses are already clean of view-state reads, so the flip will be inert-safe.
- **`new-must-not-import-legacy` flip** — still needs 9c (markedPackages) before the last lens/fileStore → `state/`
  edges are gone.

## Rollback

Revert `90bbe736b` to return the edge selectors into the dependency lens; revert `9080dd857` to return blacklist to
the `fileSettings` state root (keeping the folder move); revert all three to return to the Slice-9a shape.
