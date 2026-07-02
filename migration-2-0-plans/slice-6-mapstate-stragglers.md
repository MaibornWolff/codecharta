---
name: viz-2.0-slice-6-mapstate-stragglers
issue:
state: complete
version: 1
---

# Slice 6 — Absorb the mapState presentation stragglers

> Full plan: `roadmap-v2-state-homes.md` → "Slice 6". Safety model: `CONVENTIONS.md`
> (snapshots ARE the contract, never `-u`; structural vs behavioral commits separate;
> code-boundary move THEN store-key reshape). Reuses the Slice-5 reshape machinery —
> each key only *adds* itself to `mapState`.

## Goal

Move eight stragglers into `state.mapState`:
- from `dynamicSettings`: `colorMode`, `colorRange`, `margin`
- from `appSettings`: `layoutAlgorithm`, `isLoadingMap`
- from `appStatus` (transient): `hoveredNodeId`, `rightClickedNodeData`, `selectedBuildingId`

After the slice `appStatus` holds only `currentFilesAreSampleFiles`. Then flip
`state-home-is-leaf` **and** the new `state-home-only-stores-import-ngrx` dep-cruiser
rules to **error** for `mapState`.

## Key facts verified in code (scope)

- **Only IndexedDB drives the settings appliers.** `savedMapState`/`savedDynamicSettings`/
  `savedAppSettings` always come from `readCcState()` (the IndexedDB `ccstate` blob).
  Downloaded `.cc.json` files serialize only `fileSettings` (`fileDownloader.ts`) — never
  mapState/dynamic/app/appStatus. So the reshape's only persistence surface is the
  IndexedDB record transform + the applier.
- **`appStatus` was never applied on load** (no `applyAppStatus`). So the three transient
  keys must be **no-ops** in `mapMapStateToAction` after they land in mapState — matching
  the existing runtime-only `isLoadingMap`/`isLoadingFile` no-op treatment. `isLoadingMap`
  keeps its no-op.
- **Action barrels are behavior-neutral lists.** `dynamicSettingsActions` (feeds save) keeps
  `setColorMode`/`setColorRange`/`setMargin`; `appSettingsActions` keeps `setLayoutAlgorithm`;
  `actionsRequiringRerender` keeps all four. Slice 5 already left mapState actions in
  `appSettingsActions` — so we only repoint import paths, never change the arrays. `isLoadingMap`
  + the three appStatus actions are in no save/rerender barrel (unchanged).
- **No URL round-trip change** (only metric/mode/file are URL-serialized).
- **No new dynamic-key paths** in `state.manager` — colorRange/rightClickedNodeData are
  plain objects safely deep-merged; the rest are primitives/enums.

## Tasks

### 1. Structural commit — `git mv` the 8 slices into `mapState/store/`
- `git mv` each folder from `state/store/{dynamicSettings,appSettings,appStatus}/<slice>` →
  `mapState/store/<slice>`.
- Fix the moved selectors' relative import of the parent selector (still reads
  `dynamicSettings/appSettings/appStatusSelector` — body byte-identical, path adjusted).
- Repoint the three parent reducers + `defaults` + action barrels to the new deep paths
  (transitional `state/ → mapState/` import, exactly as Slice-5 commit 1 did the reverse).
- Add the 8 slices' actions/reducer/selector to `mapState.facade.ts`.
- Repoint every external importer to `mapState.facade` (or the new deep path).
- Gate: `tsc` clean, `npm test` **zero snapshot diff (no -u)**, `lint:architecture` clean.

### 2. Behavioral commit — the store-key reshape
- `model/state.model.ts`: move the 8 keys `DynamicSettings`/`AppSettings`/`AppStatus` → `MapState`.
- `mapState.reducer.ts`: add the 8 slices to `combineReducers` + `defaultMapState`;
  trim the three source reducers.
- Change the 8 leaf selectors + `globalSettings.layoutAlgorithmSelector` +
  `3dPrint.{colorRange,colorMode}Selector` to read `mapStateSelector`.
- `loadInitialFile.store`: move `colorMode`/`colorRange`/`margin`/`layoutAlgorithm` dispatch
  cases into `mapMapStateToAction`; add no-op cases for `isLoadingMap` + the three transient
  keys; drop the moved cases from `mapDynamicSettingToAction`/`mapAppSettingToAction`; import
  the set* actions from the facade.
- `scenarioApplier`: `buildColorsPatch` patches `mapState.colorMode`/`colorRange`;
  `scenarioApplier.store.setIsLoadingMap` dispatches the mapState action.
- `indexedDBWriter`: `DB_VERSION 3→4` + `migrateCcStateRecordToV4` (moves the 8 keys into the
  persisted blob's `mapState`) chained after v3 in `upgrade`; +tests.
- Repoint dotted readers (`state.dynamicSettings.{margin,colorRange,colorMode}` →
  `state.mapState.*`; `state.appSettings.layoutAlgorithm` → `state.mapState.layoutAlgorithm`)
  and string reset-keys (`"dynamicSettings.margin"`→`"mapState.margin"`, etc.).
- Update `mocks/dataMocks.ts` default state shape.
- Gate: `tsc`, `npm test` zero snapshot diff, `lint:architecture`.

### 3. dep-cruiser flip
- `state-home-is-leaf` → **error** for mapState.
- Add `state-home-only-stores-import-ngrx` (only `mapState/store/` may import `@ngrx/store`)
  → **error**.

## Steps

- [x] Task 1 — structural git mv + repoint (zero snapshot diff), commit
- [x] Task 2 — behavioral reshape + persistence + migration tests, commit
- [x] Task 3 — flip/add dep-cruiser rules to error, commit
- [x] Update roadmap Slice 6 → DONE, CARRIED-FORWARD, memory

## Outcome — DONE (2026-07-02), three commits

1. **Structural** (`7ab051a5f`): `git mv` the 8 slice folders into `mapState/store/`, repointed
   49 importers (script) + the 3 parent reducers/barrels, added facade exports. Zero snapshot diff.
2. **Behavioral** (`a54cbda95`): model split; `mapState` combineReducers gains the 8 keys; 3 source
   reducers trimmed; 8 leaf selectors (+ `globalSettings.layoutAlgorithm`, `3dPrint.colorRange/colorMode`)
   read `mapStateSelector`; applier moves colorMode/colorRange/margin/layoutAlgorithm into
   `mapMapStateToAction` and makes isLoadingMap + the 3 interaction ids no-ops; `scenarioApplier`
   colors patch → `mapState`; `areAllNecessaryRenderDataAvailable` folds `mapState.colorRange` back
   into the availability gate; IndexedDB `DB_VERSION 3→4` + `migrateCcStateRecordToV4` (chained after
   v3) + 5 tests; dotted readers + string reset-keys + dataMocks repointed. `tsc` clean, `npm test`
   green **zero snapshot diff (45/45, no -u)**, 2275 tests.
3. **dep-cruiser** (`f6c53c10c`): `state-home-is-leaf` → **error** for mapState; new
   `state-home-only-stores-import-ngrx` → **error**. `lint:architecture` 0 errors (114 warn bridges).

### Two behavior landmines handled (not deferred)
- **appStatus was never applied on load** → the 3 interaction ids + isLoadingMap are **no-ops** in
  `mapMapStateToAction` (else a persisted id would be dispatched on rehydrate).
- **`colorRange`'s null-gate** on first render lived in `areDynamicSettingsAvailable`; the caller now
  folds `mapState.colorRange` back in so the gate is byte-for-byte preserved.

### Scope confirmed in code (as Slice 5 predicted)
- URL round-trip untouched; scenarios persist section-shaped (only the `ccstate` record transforms);
  action barrels stay behavior-neutral (only import paths repointed); no new dynamic-key paths.

### Not run in this environment (CI/manual)
Playwright e2e (select/hover/context-menu/color-range/layout) and the manual side-by-side smoke of
hover/tooltip/label vs `main`. Jest zero-snapshot-diff + the migration tests are the automated proof.

## Rollback
Revert `a54cbda95` to keep the folder move; revert both `a54cbda95` + `7ab051a5f` to return to the
Slice-5 shape. Revert `f6c53c10c` alone to drop the boundary enforcement.
