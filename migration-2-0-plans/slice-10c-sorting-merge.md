---
name: viz-2.0-slice-10c-sorting-merge
issue:
state: progress
version: 1
---

## Goal

Close Slice 10's DoD refinement #8 (CARRIED-FORWARD): merge the two sibling durable prefs
`sortingOrderAscending` (boolean) + `sortingOption` (enum) — both already living under the
`preferences` home — into a single `preferences.sorting = { option, orderAscending }` object.
Organizational, behavior-preserving, snapshot-verifiable. The other Slice-10 refinement
(#7 `preferences` → localStorage) stays deferred pending user sign-off + a characterization test.

## Tasks

### 1. Structural — co-locate the sort store (pure git mv, behavior identical)
- `git mv` `preferences/store/sortingOption/` + `preferences/store/sortingOrderAscending/`
  files into one `preferences/store/sorting/` folder. The `sortingOption` files become the
  survivors renamed to `sorting.{reducer,actions,selector,reducer.spec}.ts`; the ascending
  files ride along under their own names (absorbed in Task 2).
- Fix the deep import paths in the only three consumers of the deep store paths:
  `preferences.reducer.ts`, `preferences.actions.ts`, `preferences.facade.ts`. Everything else
  imports through the facade barrel (public names kept stable), so the sidebarExplorer feature
  needs zero changes.
- combineReducers keeps the two keys; no shape change, no IndexedDB bump. Snapshots byte-identical.

### 2. Behavioral — one `sorting` pref + IndexedDB v12
- New `Sorting` type (`domain.model.ts`) `{ option: SortingOption; orderAscending: boolean }`;
  `Preferences.sorting` replaces the two flat fields (`state.model.ts`).
- One `sorting` reducer + `defaultSorting` handling `setSortingOption` (sets `.option`),
  `setSortingOrderAscending`/`toggleSortingOrderAscending` (sets/toggles `.orderAscending`).
  **Keep the three action names + the `preferencesActions` save-trigger union byte-identical.**
- **Keep the public selector names stable**: `sortingOrderSelector` still returns the option
  (now `.sorting.option`), `sortingOrderAscendingSelector` still returns the bool
  (`.sorting.orderAscending`). Transparent to sidebarExplorer + the render-availability gate.
- IndexedDB `v11→v12`: a WITHIN-preferences nesting transform (`migrateCcStateRecordToV12`) —
  nest the two flat pref keys into `sorting`, delete the flats, fall back to `defaultSorting`.
  Bump `DB_VERSION`, extend the upgrade chain + the v2-blob chain test; retune the v11 unit
  tests whose flat-`sortingOption` default assertions become v12's responsibility.
- Load-applier asymmetry (preserve exactly): `mapPreferenceToAction("sorting")` restores the
  option (`setSortingOption`) but NEVER the sort order (the pre-merge split ignored
  `sortingOrderAscending` on load — "file-explorer UI pref a loaded file must not override").
- Update the inline preferences mocks (`dataMocks` × 2, fileExtensionBar specs × 2).

### 3. Verify + adversarial review
- tsc, biome, jest (preferences, sidebarExplorer, indexedDB, loadInitialFile), 45/45 snapshots
  zero-diff (never `-u`), dep-cruiser.
- Landmine sweep: `getValue()`/`getState().preferences.<flat>` string paths, `.html` templates
  with `settingsKeys` string paths, the save-trigger union, the v12 record transform + chain.
- Update CARRIED-FORWARD (delete row #8), this plan → complete, memory.

## Steps

- [ ] Complete Task 1: Structural relocate → sorting/
- [ ] Complete Task 2: Behavioral merge + IndexedDB v12
- [ ] Complete Task 3: Verify + adversarial review

## Notes

- **Why the blast radius is tiny**: external consumers import the two selectors + three actions
  through `preferences.facade`; keeping those names stable means the whole sidebarExplorer sort
  feature (stores/service/selectors/specs) and the `areDynamicSettingsAvailable` render gate are
  untouched — only the store internals + persistence + the 5 inline mocks move.
- **v12 is a new KIND of transform**: prior v3–v11 MOVE keys between homes; v12 NESTS two
  sibling keys within the existing preferences home. It overwrites any default `sorting` the
  (current-defaults-based) v11 base spread leaves behind.
- **Deferred**: #7 `preferences` → localStorage — real per-blob→global behavior seam, no snapshot
  / e2e coverage; needs user sign-off + a rehydrate characterization test. Stays on CARRIED-FORWARD.
