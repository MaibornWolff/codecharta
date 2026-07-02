---
name: step-3-filestore-module
issue:
state: complete
version: 1
---

## Goal

Extract the `files` state slice and the cc.json load pipeline behind a new `app/codeCharta/fileStore/`
module (`fileStore.facade.ts` + `repos/files.repo.ts` + `store/files.store.ts` + `loaders/ccJson/`).
This is a **structural, behavior-preserving** move (Tidy First): nothing renders or loads differently,
the render stays pixel-identical, and every existing test keeps passing. It positions FileStore as the
single source the later lenses read from.

## Tasks

Target shape (from `Ideas/codecharta-2.0-implementation-map.html`, rules in `Ideas/dependency-cruiser.2.0.cjs`):

```
app/codeCharta/fileStore/
├── fileStore.facade.ts          # public surface (was features/loadFile/facade.ts)
├── repos/  files.repo.ts        # FileState[] + visible selection; absorbs LoadFileStore
├── store/  files.store.ts       # the moved files reducer/actions/selector entry
└── loaders/ccJson/              # the moved features/loadFile pipeline (the only wire-DTO site)
```

### 1. Move the files slice into `fileStore/store/`
- `git mv` the slice from `state/store/files/` to `fileStore/store/`:
  `files.reducer.ts`, `files.actions.ts`, `files.selector.ts`, `files.reducer.spec.ts`.
- Add `fileStore/store/files.store.ts` as the module entry that re-exports the moved symbols:
  `files` reducer, `defaultFiles`, the action creators + `fileActions`, and `filesSelector`.
- Also `git mv` `state/selectors/visibleFileStates/` (`visibleFileStates.selector.ts` + `.spec.ts`)
  into `fileStore/store/` — it is purely a file-selection seam reading `filesSelector`.
- Update the reducer registration in `state/store/state.manager.ts` (`appReducers`/`defaultState`
  still key it as `files`; only the import path changes).
- Repoint the import path in every consumer (path-only, behavior identical):
  - `filesSelector` consumers (7): `3dPrint.selectors`, `navBar.selectors`, `scenarioDialog.store`,
    `areAllNecessaryRenderDataAvailable.selector`, `isDeltaState.selector`, `referenceFile.selector`,
    `visibleFileStates.selector`.
  - `files.actions` consumers (7): the two loadFile stores, `navBar/filesSelection.store`,
    `resetColorRange.effect`, `saveCcState/actionsRequiringSaveCcState`,
    `dynamicSettings/searchPattern/searchPattern.reducer.ts`, `dynamicSettings/dynamicSettings.actions.ts`
    (the last two import `setStandard`). (`grep` the old path is the authoritative checklist.)
  - `visibleFileStatesSelector` consumers (12): `codeMapMouseEvent.store`, several `state/effects/*`,
    and `state/selectors/*` (accumulatedData, metricData, sortedNodeEdgeMetricsMap, areMultipleMapsVisible).

### 2. Add `repos/files.repo.ts` (absorb `LoadFileStore`)
- New `@Injectable({ providedIn: "root" }) FilesRepo` that wraps `Store`/`State<CcState>` and folds in
  the methods currently on `features/loadFile/stores/loadFile.store.ts` (`LoadFileStore`):
  `getFiles()`, `setFiles()`, `setStandardByNames()`, `getCurrentFilesAreSampleFiles()`,
  `setCurrentFilesAreSampleFiles()`, and `referenceFile$`.
- Add a `visibleFileStates$` observable wrapping `visibleFileStatesSelector` (forward-scaffolding for
  step 4's metrics store; **no consumer this slice** — note it as such, or defer it to step 4).
- Delete `LoadFileStore`; repoint its consumers — `LoadFileService` **and `loadFile.service.spec.ts`**
  (which injects `LoadFileStore` and constructs `LoadFileService` with it) — at `FilesRepo`. Note:
  `LoadInitialFileService` injects `LoadInitialFileStore` + `LoadFileService`, **not** `LoadFileStore`
  — nothing to repoint there (the earlier "indirectly" wording was wrong).
- `repos/`/`store/` are allowed to import `@ngrx/store` (state-holder folders).

### 3. Move the load pipeline into `fileStore/loaders/ccJson/`
- `git mv` the whole `features/loadFile/` tree (`services/`, `stores/`, `util/`, and their specs) into
  `fileStore/loaders/ccJson/`, preserving the inner folder shape.
- Update intra-pipeline relative imports and the `FilesRepo` wiring from task 2.
- Keep filenames as-is for a clean, reviewable move. The cosmetic rename toward the map's
  `upload.service / ccJsonParser / ccJsonValidator` (today: `loadFile.service` / `fileParser` /
  `fileValidator`) is **out of scope** — defer to a later structural commit.

### 4. Add `fileStore.facade.ts`; repoint outsiders
- Create `fileStore/fileStore.facade.ts` as the public surface, mirroring today's
  `features/loadFile/facade.ts` exports: `LoadFileService`, `LoadInitialFileService`,
  `sampleFile1/2`, `getNameDataPair`, `getCCFile`, `getCCFileAndDecorateFileChecksum`, `UrlExtractor`.
- Repoint the 4 outsiders of `features/loadFile/facade` to `fileStore/fileStore.facade`:
  `codeCharta.component.ts`, `confirmResetMapDialog.component.ts`, `navBar/uploadFiles.service.ts`,
  `updateQueryParameters.effect.ts`.
- Delete the old `features/loadFile/facade.ts` and the now-empty `features/loadFile/` +
  `state/store/files/` + `state/selectors/visibleFileStates/` dirs.
- **Spec importers (do not miss these):** the enumerated consumer counts above are **production-only**.
  Many `.spec.ts` files also import the moved modules and the deleted facade — e.g. **9 specs import
  `features/loadFile/facade`** (`sampleFile1/2` etc.: `codeCharta.component.spec`, `treeMapGenerator.spec`,
  `uploadFiles.service.spec`, `globalConfigurationDialog.component.spec`, `settingsButton.component.spec`,
  `resetMapButton.component.spec`, `globalConfigurationButton.component.spec`, `confirmResetMapDialog.spec`,
  `updateQueryParameters.spec`), plus ~13 specs import `files.actions` and ~5 import
  `visibleFileStatesSelector`. Repoint all of them in the same move commit (a `grep` for the old paths is
  the checklist) — deleting the facade without these leaves a non-compiling tree.

### 5. Keep the architecture lint green (legacy dep-cruiser bridge)
- The active config is `visualization/.dependency-cruiser.js`. Its `wire-dto-only-in-serialization-boundary`
  rule lists `^app/codeCharta/features/loadFile/` in `pathNot` — **replace** that entry with
  `^app/codeCharta/fileStore/` (the pipeline moved; the `features/loadFile/` entry is now dead). Keep the
  other importers in the allow-list (`features/navBar/util/gameObjectsParser/`, `util/fileDownloader.ts`,
  mocks/resources) untouched.
- Verify the pipeline pulls from `features/*` only via `components/` or `facade.ts` now that its
  from-path leaves `features/` (errorDialog is under `features/shared/components/` — already allowed);
  fix any stray `features/<x>/services|stores` import that would newly trip
  `feature-no-external-access-to-internals`.
- Do **not** swap in `Ideas/dependency-cruiser.2.0.cjs` — that flip + the `fileStore` boundary rules
  are step 7.

### 6. Verify
- `npx tsc --noEmit` (or `npm run build`) clean; `grep` for any leftover old import paths.
- `npm test` green (moved specs: `files.reducer.spec`, `visibleFileStates.selector.spec`,
  `loadFile.service.spec`, `loadInitialFile.service.spec`, `ccFileHelper`, `fileValidator`,
  `urlExtractor`, `loadFilesValidationToErrorDialog`).
- `npm run lint:architecture` green.
- `npm run e2e` (file upload + sample load smoke) green. (No "golden" suite on the viz side — the
  render proof is the unchanged Jest render-pipeline snapshots; this structural move touches no
  rendering code, so they stay byte-identical.)

## Steps

- [x] Complete Task 1: Move the files slice (+ visibleFileStates) into `fileStore/store/` and repoint consumers
- [x] Complete Task 2: Add `repos/files.repo.ts` absorbing `LoadFileStore`
- [x] Complete Task 3: Move the load pipeline into `fileStore/loaders/ccJson/`
- [x] Complete Task 4: Add `fileStore.facade.ts` and repoint the 4 outsiders; delete old dirs
- [x] Complete Task 5: Extend the legacy dep-cruiser wire-DTO `pathNot` with `fileStore/`
- [x] Complete Task 6: Verify (tsc, unit, e2e, lint:architecture; render snapshots unchanged); commit on green

## Review Feedback Addressed

1. **Spec importers (completeness)**: Task 4 now flags the ~9 facade-spec importers + the `files.actions`
   / `visibleFileStatesSelector` spec importers, and Task 2 calls out editing `loadFile.service.spec.ts`.
2. **`LoadInitialFileService` wording** corrected (it does not inject `LoadFileStore`).
3. **`visibleFileStates$`** flagged as forward-scaffolding (no consumer this slice).
4. **wire-dto `pathNot`**: replace the dead `features/loadFile/` entry with `fileStore/` (not just add).
5. **Verification vocab**: dropped "golden" (analysis-only); render proof = unchanged Jest snapshots.

## Notes

- **Tidy First**: this whole step is structural (moves/renames + one config `pathNot` edit) — no
  behavioral change. Commit it as its own commit, separate from any behavior work.
- **"Outsiders use the facade"** here means the load-pipeline consumers (the 4 above) go through
  `fileStore.facade.ts`. The internal ngrx **selector graph** (`state/selectors/*`, `state/effects/*`)
  keeps importing the moved `filesSelector`/`visibleFileStatesSelector` modules directly via their new
  paths — routing memoized selectors through an injectable facade is a behavioral change deferred to
  later slices. The facade stays a re-export barrel for now (no new injectable surface).
- **Transitional couplings (expected, not fixed this step):** `LoadInitialFileStore` still dispatches
  into `appSettings`/`dynamicSettings`/`fileSettings`; those slices live under `state/store/` (not yet
  `appearance/`/`viewState/`/lenses), so `fileStore` importing them does **not** violate the 2.0
  `filestore-has-no-upward-deps` rule yet. Resolve when those slices move in later slices.
- **Wire-DTO**: moving the pipeline under `fileStore/` is exactly why `codeCharta.api.model` usage is
  now allowed there; the 2.0 config (`wire-dto-only-in-filestore-boundary`) already encodes this, the
  legacy `pathNot` edit just bridges until step 7 flips configs.
- Out of scope (scope guards): no lenses, no metrics extraction, no renderer/page split, no
  `ccJsonParser`/`ccJsonValidator` renames, no change to what step 2 added to the pipeline.
- **Rollback:** a single structural `git mv` commit (+ one config `pathNot` edit) — `git revert` it to
  restore the old paths; zero runtime impact.
