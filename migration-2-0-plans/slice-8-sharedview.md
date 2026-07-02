---
name: viz-2.0-slice-8-sharedview
issue:
state: complete
version: 1
---

# Slice 8 — Stand up `sharedView` (focus + search)

## Outcome (2026-07-02, 3 commits)

- **(1) structural** `git mv` of the two leaf folders `state/store/dynamicSettings/{focusedNodePath,searchPattern}`
  → `sharedView/store/` (+ `sharedView.facade` barrel; ~18 external importers repointed to the facade;
  `dynamicSettings.reducer`/`.actions` cross-import the moved slices so `state.dynamicSettings.{focusedNodePath,
  searchPattern}` stays alive → zero runtime change). Zero snapshot diff.
- **(2) behavioral reshape** — model split (`DynamicSettings = { sortingOption }`; new `SharedView`; added to
  `Settings` + `CcState`); `sharedView` combineReducers + `defaultSharedView` + `sharedViewSelector`; registered
  `sharedView`/`defaultSharedView` in `state.manager`; the two leaf selectors now read `sharedViewSelector`;
  `dynamicSettings.reducer` trimmed; applier `applySharedView` + `mapSharedViewToAction` (wired into BOTH load
  paths) with the focus/search cases removed from `mapDynamicSettingToAction`; scenario `buildFiltersPatch`
  focusedNodePath re-keyed `dynamicSettings → sharedView` (+ `mergePatches`); the dotted readers in
  `treeMapHelper` (`isVisible`/`isNodeFlat`) and `scenarios.service` read `state.sharedView.*`;
  `objectWithDynamicKeysInStore` entry renamed `dynamicSettings.focusedNodePath → sharedView.focusedNodePath`;
  IndexedDB `DB_VERSION 5→6` + `migrateCcStateRecordToV6` (the **first** migration that CREATES a new root —
  builds `sharedView` fresh from `defaultSharedView` + the two moved keys) chained after v5, +6 tests.
- **(3) dep-cruiser flip** — `state-home-is-leaf` + `state-home-only-stores-import-ngrx` extended to
  `^app/codeCharta/sharedView/` (ngrx rule `pathNot` gains `^app/codeCharta/sharedView/store/`). Both **error**.

`tsc` clean, `npm test` **45/45 snapshots zero diff (no -u)**, 2287 passing, `lint:architecture` 0 errors
(109 warns, unchanged — no lens/fileStore imports focus/search, so no `new-must-not-import-legacy` edge drop,
as landmine #5 predicted). All three landmines held: (#1) the array-corruption guard renamed; (#2) the new-root
migration builds `sharedView` from defaults; (#3) URL round-trip untouched; (#4) no availability-gate fold-back.
After the slice `dynamicSettings` holds only `sortingOption`. **Precedes 9b/9c** (blacklist/markedPackages →
sharedView).

## Plan (as executed)

> Full plan: `roadmap-v2-state-homes.md` → "Slice 8". Safety model: `CONVENTIONS.md`
> (snapshots ARE the contract, never `-u`; structural vs behavioral commits separate;
> code-boundary move THEN store-key reshape). Reuses the Slice-5/6/7 reshape machinery.

## Goal

Create the **first brand-new** state home from scratch, `state.sharedView`, and move the two cleanest
cross-renderer values out of `dynamicSettings` into it: `focusedNodePath` (`string[]`) + `searchPattern`
(`string`). After the slice `dynamicSettings` holds **only** `sortingOption`. No lens parameterization
this slice (the blacklist lift is 9b). Renderer-agnostic selected-node id is NOT here (Slice 13).

## Key facts verified in code (scope)

- **The move set:** `state/store/dynamicSettings/{focusedNodePath,searchPattern}/` (5 + 4 files). Both
  child selectors read the parent `dynamicSettingsSelector` → repoint to a new `sharedViewSelector` in
  the behavioral commit (Slice-7 leaf-selector precedent). ~18 consumers repoint to `sharedView.facade`:
  2 effects (`unfocusNodes`, `blacklistSearchPattern`), the **`searchedNodes` SELECTOR**,
  `nodeContextMenu/focusedNode.store`, `sidebarExplorer/searchPattern.store` + the 3 `searchBar`
  (isExclude/isFlatten/isSearchPatternEmpty) selectors, the `autoFit`/`renderCodeMapEffect` action
  barrels, + specs. (`actionsRequiringRerender` + `loadInitialFile.store` import from BOTH folders.)
- **New root = clone the mapState home shape:** `sharedView/sharedView.facade.ts` +
  `sharedView/store/{focusedNodePath,searchPattern,sharedView.reducer.ts,sharedView.selector.ts}`;
  register `sharedView`/`defaultSharedView` in `state.manager` (`appReducers` + `defaultState`); add
  `SharedView` to `Settings` + `CcState` in `model/state.model.ts`.
- **Applier:** lift the `focusedNodePath`→`setAllFocusedNodes` and `searchPattern`→`setSearchPattern`
  cases out of `mapDynamicSettingToAction` into a new `mapSharedViewToAction` + `applySharedView`
  (mirrors `applyMapState`/`mapMapStateToAction`).
- **Scenarios:** `scenarioApplier.buildFiltersPatch` emits `dynamicSettings:{ focusedNodePath }` → re-key
  to `sharedView`. `searchPattern` is NOT scenario-persisted — do not invent a key.
- **IndexedDB:** `DB_VERSION 5→6` + `migrateCcStateRecordToV6` chained after v5.
- **Save trigger stays behavior-neutral:** the focus/search write actions live in `dynamicSettingsActions`
  (spread into `actionsRequiringSaveCcState`). Leave them there (Slice-7 precedent left the metric actions
  in place) — only repoint their import paths; removing them without an equivalent `sharedViewActions`
  spread would stop focus/search from persisting.

## Tasks

- [ ] **Structural commit** — create `sharedView/` skeleton + `git mv` the 2 leaf folders into
  `sharedView/store/`; repoint ~18 importers to `sharedView.facade` (moved selectors keep reading
  `dynamicSettingsSelector` transitionally); barrels/`state.manager` cross-import. Zero snapshot diff.
- [ ] **Behavioral reshape** — model split (`DynamicSettings = { sortingOption }`; add `SharedView`);
  `sharedView` combineReducers/defaults; the 2 leaf selectors read `sharedViewSelector`; trim
  `dynamicSettings`; applier `mapSharedViewToAction`; scenario `focusedNodePath` patch → `sharedView`;
  IndexedDB v6 + migration + tests. Zero snapshot diff.
- [ ] **dep-cruiser flip** — extend BOTH `state-home-is-leaf` AND `state-home-only-stores-import-ngrx`
  `from`-paths to also match `^app/codeCharta/sharedView/` (add `^app/codeCharta/sharedView/store/` to
  the ngrx rule's `pathNot`). Both stay **error**.
- [ ] Docs (roadmap Slice 8 → DONE, CARRIED-FORWARD, memory).

## Landmines (verified against code)

1. **`objectWithDynamicKeysInStore` array-corruption (most dangerous line).** `state.manager.ts`
   lists `"dynamicSettings.focusedNodePath"` — `focusedNodePath` is a `string[]` that must be replaced
   **wholesale**; `_applyPartialState` deep-merges any `typeof === "object"` value NOT in that Set,
   turning the array into a numeric-keyed object. Rename the entry to `"sharedView.focusedNodePath"`
   or `setState`/scenario/rehydrate application of focused nodes silently corrupts. (`searchPattern` is
   a scalar — no entry needed.)
2. **v6 is the FIRST migration that CREATES a new root.** Prior v3/v4/v5 merged INTO the pre-existing
   `mapState`; old blobs have NO `sharedView`. Build it fresh from defaults + the two moved keys, and
   ensure `defaultState.sharedView` exists before the transform runs (the `isKeyOf` silent-drop landmine).
3. **No URL round-trip change (unlike Slice 7).** focus/search are not URL-serialized (only
   metric/mode/file/currentFilesAreSampleFiles are). Leave `updateQueryParameters`/`urlExtractor` untouched.
4. **No availability-gate fold-back.** `areDynamicSettingsAvailable` spreads `{ ...dynamicSettings }` and
   is the last external consumer of `dynamicSettingsSelector`; `focusedNodePath=[]` and `searchPattern=""`
   ALWAYS pass the check — unlike Slice 7's `distributionMetric`. Just let `dynamicSettings` shrink; a
   fold-back would be dead code.
5. **`new-must-not-import-legacy` is net-neutral** — no lens/fileStore imports focus/search, and
   `sharedView/` is outside that rule's `from`. Don't expect an edge-count drop like Slice 7.

## Rollback

Revert the behavioral commit to keep the folder move at the `dynamicSettings` shape; revert both the
behavioral + structural commits to return to the Slice-7 shape; revert the dep-cruiser commit alone to
drop the `sharedView` boundary enforcement.
