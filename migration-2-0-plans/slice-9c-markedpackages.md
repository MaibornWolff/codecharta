---
name: viz-2.0-slice-9c-markedpackages
issue:
state: complete
version: 1
---

# Slice 9c — `markedPackages` → sharedView (NARROW `fileSettings` to `{ edges }`)

## Outcome (2026-07-02, 2 commits)

The mechanical twin of Slice 9b, one grab-bag member later. `markedPackages` moved out of the
`fileSettings` state slice into the existing **`state.sharedView`** root; per-file
`CCFile.settings.fileSettings` still bundles it via the intersection
`FileSettings & MetricsLensSource & { blacklist } & { markedPackages }` (the .cc.json contract). The
STATE `FileSettings` now holds **only `{ edges }`** — `edges` is DEFERRED (CF #2a: a merged render-model
array needing an injectable `DependencyLensStore`/`EdgesRepo` + a render-model home first), so
`fileSettings` keeps one live member and its reducer is NOT deleted. **No lens-parameterization step**
(no lens reads markedPackages) and **no selector-dedup step** (unlike 9b's 3dPrint — the only base
selector is `markedPackagesSelector`; `markFolderItems.selector` + `markedPackagesWithCounts.selector`
are derived selectors that COMPOSE it and just had their import repointed).

- **(1) structural** (`f7ec2809e`) — `git mv state/store/fileSettings/markedPackages →
  sharedView/store/markedPackages` (including its colocated `util/` — `addMarkedPackage` +
  `findIndexOfMarkedPackageOrParent`). The moved leaf `markedPackages.selector` keeps reading
  `fileSettingsSelector` transitionally; `fileSettings.reducer` keeps combining `markedPackages`
  (imported from the `sharedView` facade) so `state.fileSettings.markedPackages` is unchanged → **zero
  snapshot diff**. The `sharedView` facade re-exports the markedPackages store (actions/reducer/selector)
  **and** `findIndexOfMarkedPackageOrParent` so `markFolderItems.selector` reaches the util through the
  facade too. All **11 external importers** repointed to `sharedView.facade` (incl. specs); the
  save-trigger markedPackages actions stay in `fileSettingsActions`, now imported from the sharedView
  facade (mirrors the 9a/9b precedent). Net warns **107→107** (unchanged): markedPackages importers are
  `features/` + `state/`, never `lenses/`/`fileStore`, so no `new-must-not-import-legacy` edge moved.
- **(2) behavioral reshape** (`9fe0ff66f`) — model split: `FileSettings` (state) drops `markedPackages`
  (narrows to `{ edges }`), `SharedView` gains `markedPackages: MarkedPackage[]`, and per-file
  **`CCFile.settings.fileSettings = FileSettings & MetricsLensSource & { blacklist } & { markedPackages }`**
  (the .cc.json file still bundles it — identical dual-role handling to 9a/9b). `sharedView.reducer`
  combines `markedPackages`; `markedPackages.selector` reads `sharedViewSelector`; `state.manager`
  renames the `objectWithDynamicKeysInStore` path `fileSettings.markedPackages → sharedView.markedPackages`
  (array → wholesale replace). Applier: the `markedPackages` case moves from `mapFileSettingToAction` to
  `mapSharedViewToAction`. `updateFileSettings.effect` co-emits the shrunken `fileSettings:{edges}` **and**
  `sharedView:{blacklist,markedPackages}` in ONE `setState`. Scenarios:
  `scenarioApplier.buildLabelsAndFoldersPatch` re-keys `fileSettings:{markedPackages} → sharedView`
  (and the now-dead `fileSettings` branch was dropped from `mergePatches` + the spec's local merge helper);
  `scenarios.service.buildScenarioSections` reads `state.sharedView.markedPackages`. State-level readers
  `treeMapHelper.ts:64,111` + `streetViewHelper.ts:73` repointed to `state.sharedView.markedPackages`.
  `fileDownloader`'s explicit duplicated per-file intersection annotation (2 signatures + its spec's local
  annotation) grew to keep `markedPackages` (the one tsc-caught dual-role deviation from the simple twin).
  IndexedDB `DB_VERSION 8→9` + `migrateCcStateRecordToV9` (**merge-into-EXISTING sharedView**, mirrors
  v3–v5/v8), chained after v8 (+4 tests + extended the v2→v9 chain test to carry a
  `fileSettings.markedPackages` value through and assert it lands under `sharedView`).

`tsc` clean, `npm test` **45/45 snapshots zero diff (no -u)**, **2299 passing** (+4 v9 migration tests),
`lint:architecture` **0 errors, 107 warns** (net-neutral vs 9b). **No dep-cruiser rule flip in 9c.**
Adversarial multi-agent review (7 landmine hunters + verify): see below.

## Key facts verified in code (scope)

- **Dual-role type (same shape as 9a/9b).** The .cc.json file carries markedPackages per-file, so
  `CCFile.settings.fileSettings` keeps it via the intersection; only the merged **state root** narrows to
  `{ edges }`. tsc pinpointed the dual-role deviations: `fileDownloader` re-declares the intersection
  inline (both its two static signatures + its spec's `let filesettings` annotation grew to add
  `markedPackages: MarkedPackage[]`). The other 6 per-file readers/writers (`markedPackages.merger`,
  `fileParser`, `ccJson2ToCCFile`, `normalizeToCcJson2`, `aggregationGenerator`, `deltaGenerator`) read
  through the CCFile grown intersection and needed no change.
- **Merge-into-EXISTING sharedView (v9), not a new root.** `sharedView` already exists (created at v6), so
  v9 mirrors v3–v5/v8 (`{ ...defaultSharedView, ...existing }` + move `fileSettings.markedPackages →
  sharedView.markedPackages`), unlike v6/v7 which built a fresh root. Chained `if (oldVersion < 9)`.
- **`sharedView.markedPackages` dynamic key (array).** Renamed in `objectWithDynamicKeysInStore`; the
  effect + scenario applier + `_applyPartialState` all nest markedPackages under a `sharedView` key so the
  composed path matches and the array is replaced WHOLESALE (never deep-merged into numeric keys).
- **No runtime-only landmines (verified, not assumed).** Grep confirmed NO `state.getValue().fileSettings.markedPackages`
  read and NO untyped `store.setState({ fileSettings: { markedPackages }})` seeding (unlike 9b's
  `Print3DStateAccessStore.getBlacklist` + `blackListExtension.service.spec` overrides). The 4 STATE-level
  readers (`markedPackagesSelector`, `treeMapHelper` ×2, `streetViewHelper`, `scenarios.service`) are all
  tsc-caught typed `CcState` reads. Two STATE-level spec mocks (`blackListExtension.service.spec`,
  `fileExtensionBarSegment.component.spec`) were split (tsc-caught excess property); per-file
  `DEFAULT_SETTINGS` keeps markedPackages.

## Landmines (all held)

1. **Array wholesale-replace** — `objectWithDynamicKeysInStore` path renamed `fileSettings.markedPackages →
   sharedView.markedPackages`; the effect emits `sharedView:{...,markedPackages}` so the composed path matches.
2. **Effect co-emit doesn't clobber siblings** — the effect emits only `sharedView:{blacklist,markedPackages}`;
   `_applyPartialState` recurses into `sharedView`, replaces both arrays wholesale, and preserves
   `focusedNodePath`/`searchPattern` via the `{...applyTo.sharedView}` spread.
3. **Dual-role split** — `CCFile.settings.fileSettings` keeps markedPackages per-file via the intersection;
   every per-file reader compiles unchanged except `fileDownloader`'s inline intersection annotation, which grew.
4. **No runtime-only reads** — verified by grep + the full suite (not just tsc): no STATE-level
   `fileSettings.markedPackages` read/seed survives.
5. **v9 = merge into existing sharedView** — default markedPackages `[]` when absent; v2→v9 chain test carries
   a value through and asserts it lands under sharedView + is dropped from fileSettings.
6. **Scenario round-trip** — `buildScenarioSections` reads `state.sharedView.markedPackages`;
   `buildLabelsAndFoldersPatch` emits `sharedView:{markedPackages}`; the dead `fileSettings` `mergePatches`
   branch removed (no builder emits fileSettings; edges is never a scenario field). Applying only
   labelsAndFolders preserves blacklist/focus via the sharedView spread.
7. **No import cycle** — `fileSettings.reducer` no longer imports the sharedView facade (behavioral step);
   `markedPackages.selector → ../sharedView.selector` (model only), `sharedView.facade → markedPackages.selector`
   (no back-edge). `no-circular` clean.

## Explicitly DEFERRED (recorded in CARRIED-FORWARD)

- **`edges` → dependency lens** — still a merged render-model array in `fileSettings` (CF #2a, needs a
  render-model home + injectable dependency store first). This is the slice that finally deletes the
  `fileSettings` reducer. After 9c, `state.fileSettings` holds ONLY `{ edges }`.
- **`new-must-not-import-legacy` flip** — does NOT land in 9c (12 residual edges, 0 markedPackages-related):
  7 `state/`-survivors clear in Slice 10, 5 legend/errorDialog edges clear in Slice 11. Full flip after **10 + 11**.
- **`lens-no-view-state` dep-cruiser rule** — stays deferred to Slice 13; both lenses already view-state-free.

## Rollback

Revert `9fe0ff66f` to return markedPackages to the `fileSettings` state root (keeping the folder move);
revert both commits to return to the Slice-9b shape.
