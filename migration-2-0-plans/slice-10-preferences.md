---
name: slice-10-preferences
issue:
state: core-complete (localStorage + sorting-merge deferred → 10c)
version: 1
---

# Slice 10 — Purge the grab-bags → `preferences` + finish fileStore

> The **"`state/` grab-bags dissolved"** milestone. All three grab-bag reducers
> (`appSettings` / `dynamicSettings` / `appStatus`) are gone; every setting now sits in a real
> state home. Landed 2026-07-03 in **5 Tidy-First commits**. Two DoD refinements
> (localStorage-backing, the `sorting` merge) are explicitly **deferred to 10c** — see the last
> section for why.

## What landed

| Commit | Kind | What |
|---|---|---|
| `b6d83fe` | structural | `git mv state/store/util/setState.reducer.factory → util/` (shared kernel; 46 importers). Clears the 2 lens-reducer `new-must-not-import-legacy` warns; preempts a fileStore→state warn. |
| `6d80a21` | structural | `git mv` `isLoadingFile` (ex-appSettings) + `currentFilesAreSampleFiles` (ex-appStatus) → `fileStore/store/`; kept transitionally combined under appSettings/appStatus (zero snapshot diff). |
| `1db6f5a` | behavioral | both flags → **top-level fileStore-owned CcState roots**; **`appStatus` grab-bag DELETED**; IndexedDB `v9→v10`. |
| `e9a8bdb` | structural | `git mv` the 7 durable ex-appSettings prefs + ex-dynamicSettings `sortingOption` → `preferences/store/` + `preferences.facade`; kept transitionally combined (zero snapshot diff). |
| `44c3bd1` | behavioral | real **`state.preferences`** home; **`appSettings` + `dynamicSettings` grab-bags DELETED**; applier merge; save-trigger reconstitution; scenario re-key; IndexedDB `v10→v11`; **dep-cruiser flip**. |

**Final shape:** `CcState = { fileSettings: { edges }, metricsLensSource, preferences, mapState,
sharedView, files, isLoadingFile, currentFilesAreSampleFiles }`.

## Mechanics worth remembering

- **fileStore flags are top-level roots, not a mini-grab-bag.** `isLoadingFile` +
  `currentFilesAreSampleFiles` register directly in `state.manager` (siblings of `files`), owned by
  the fileStore that sets them. Both keep their pre-existing load behavior: isLoadingFile is
  runtime-only (never restored from the blob), currentFilesAreSampleFiles is URL/sample-derived —
  so neither needs a root applier; the v10 record transform is defense-in-depth, not behavior-critical.
- **The save-trigger union must be preserved EXACTLY.** The deleted `appSettingsActions` /
  `dynamicSettingsActions` lists were cross-home grab-bags (mapState label/appearance actions +
  sharedView focus/search + preference actions + a redundant fileStore `setStandard`).
  `actionsRequiringSaveCcState` now rebuilds the identical set grouped by home
  (`mapStateSaveActions` 31 + `sharedViewSaveActions` 5 + `preferencesActions` 10 + fileSettings +
  fileActions + setState); `setStandard` is already in `fileActions`, so dropping the explicit copy
  is net-neutral.
- **TWO runtime landmines tsc missed** (the same class as Slice 9b's Print3D `getBlacklist`):
  `State.getValue()` is loosely typed, so `getValue().appSettings` / `.dynamicSettings` compiled but
  would throw at runtime. `ThreeSceneStore.getAppSettings()` (→ `getPreferences()`, read by
  threeSceneService for `experimentalFeaturesEnabled`) and `CodeMapTooltipStore.getDynamicSettings()`
  (returns `preferences` now — the tooltip has destructured undefined metrics since Slice 7; behavior
  preserved, not "fixed"). Found by grepping `getValue()/getState().<grabbag>`, not by tsc.
- **Availability gate stays value-identical:** `areAllNecessaryRenderDataAvailable` read
  `{ ...dynamicSettings (= { sortingOption }), ...metrics, colorRange }`; now reads
  `{ sortingOption (from preferencesSelector), ...metrics, colorRange }` — same checked object.
- **No `"appSettings."`/`"dynamicSettings."` string-literal reset/scenario keys exist** (grep-verified),
  so `getPartialDefaultState`'s dotted-path walk didn't silently break any reset.
- **IndexedDB v11 CREATES the preferences root and DELETES both grab-bags** (mirrors v6/v7's new-root
  build from defaults + moved keys; unlike them it also drops two source slices). Chained after v10;
  the v2→v11 chain test carries `experimentalFeaturesEnabled` + `sortingOption` through to preferences.
- **NO `new-must-not-import-legacy` flip here** (still warn; the full flip lands after 10 + 11). The
  `state-home-is-leaf` + `state-home-only-stores-import-ngrx` flip to **error for preferences** DID land
  (all three homes now error).

## Deferred to Slice 10c (two DoD refinements)

1. **`preferences` → localStorage** (carve durable-prefs persistence out of the IndexedDB `CcState`
   blob). This is a **real behavior seam** — today prefs ride the single per-blob `saveCcState`
   record; localStorage would make them independently global. There is **NO snapshot and NO e2e
   coverage** for pref persistence (`url.e2e.ts` covers only metric/mode/file URL params), so a
   backend swap can't be validated by the migration's safety net. It needs the user's sign-off + a
   dedicated characterization test (rehydrate-from-localStorage) before landing. Preferences currently
   persists in the IndexedDB blob like the other homes — functionally correct, just not yet
   localStorage-durable.
2. **Merge `sortingOrderAscending` + `sortingOption` → one `sorting` pref.** A full additional reshape
   (sidebarExplorer sort feature: `explorerSort.service`, `sortNodesInPlace`, `explorerTreeNode.selector`,
   `explorerSortControl` UI + the two stores; `sorting` object shape; IndexedDB v12). Both prefs already
   live under `preferences`, so this is organizational, not architectural — low value, real cost.

## Gates (all green)

`tsc` clean · `npm test` **2305 passing** (+4 v11 tests, −1 merged applier test), **45/45 snapshots
zero diff (no `-u`)** · `lint:architecture` **0 errors** / 104 warns. **NOT pushed; no PR** (held for
the user's word).

## Rollback

Revert `44c3bd1` (restores appSettings+dynamicSettings) then `1db6f5a` (restores appStatus); the
structural `git mv` commits + `b6d83fe` can stay (byte-identical moves).
