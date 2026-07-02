---
name: viz-2.0-slice-5-mapstate-root
issue:
state: complete
version: 1
---

# Slice 5 — Keystone: the real `state.mapState` root

> Full plan: `roadmap-v2-state-homes.md` → "Slice 5". Safety model: `CONVENTIONS.md`
> (snapshots ARE the contract, never `-u`; structural vs behavioral commits separate).

## Goal

Stop combining the 21 ex-`appearance/` slices under `state.appSettings`; give them a real
`state.mapState.*` root. First slice where "state has a runtime home" is true. Build the reshape
machinery once (Slices 6–10 then only *add a key*).

## Outcome — DONE (2026-07-02), two commits

**Commit 1 (structural, byte-identical):** `git mv app/codeCharta/appearance → mapState` and
`appearance.facade.ts → mapState.facade.ts`; repointed all **87** facade importers; renamed the
dep-cruiser `shared-state-is-leaf` rule to `state-home-is-leaf` targeting `(appearance|mapState)`
so the rename left no unguarded window. Runtime store shape unchanged. Zero snapshot diff.

**Commit 2 (behavioral store-key reshape, value-identical):**
- **model** — split a new `MapState` interface (21 keys) out of `AppSettings` (left with 10); added
  `mapState` to `CcState` and `Settings`.
- **store** — new `mapState/store/mapState.reducer.ts` (`combineReducers` + `defaultMapState`) and
  `mapState.selector.ts` (`mapStateSelector`); exported from the facade; registered in `state.manager`
  (`appReducers`/`defaultState`) with dynamic-key path `mapState.mapColors.markingColors`. Trimmed
  `appSettings.reducer` to its 10 staying keys.
- **readers** — repointed ~67 dotted `state.appSettings.<mapKey>` reads + ~46 `"appSettings.<mapKey>"`
  string reset-keys + the 19 slice selectors + `globalSettings`/`labelSettings` feature selectors to
  `mapState`; added `getMapState()` to `codeMapArrow.store`/`threeScene.store`. Consumer-facing
  selector names unchanged.
- **persistence machinery (reused by 6–10):**
  - `loadInitialFile.store` — added `applyMapState` + `mapMapStateToAction`; trimmed
    `mapAppSettingToAction` to the staying keys; `optionalAppSettingsKeys → optionalMapStateKeys`.
  - `loadInitialFile.service` — calls `applyMapState` in both apply paths.
  - `scenarioApplier` — colors/labels patches key under `mapState`; `mergePatches` merges `mapState`.
  - `indexedDBWriter` — `DB_VERSION 2→3` + `migrateCcStateRecordToV3`: a **real** `upgrade` record
    transform that re-homes a persisted v2 blob's map-view settings into `mapState`, closing the
    silent-data-loss landmine (`_applyPartialState`'s `isKeyOf` guard would otherwise drop them to
    defaults with no crash/snapshot signal). +5 unit/integration tests (pure transform + v2→v3 open).

## Scope narrowed from the plan (both verified in code)

- **URL round-trip needed no change.** Only metric/mode/file params are URL-serialized
  (`updateQueryParameters.effect` + `actionsRequiringUpdateQueryParameters`); no home-state value is
  URL-persisted. URL work belongs to the metric-selection slice (7), not every reshape.
- **Scenarios IndexedDB store needed no transform.** Scenarios persist section-shaped
  (`ScenarioSections`: colors/labels/filters/…), not store-shaped; the store-key mapping lives only in
  `scenarioApplier`. Each reshape updates that applier, but only the `ccstate` record needs the
  IndexedDB transform.

## DoD status

- `state.mapState.*` real ✅ · `tsc` clean ✅ · `npm test` green with **zero snapshot diff (45/45,
  no -u)** ✅ · `lint:architecture` 0 errors (115 pre-existing warn bridges unchanged) ✅
- IndexedDB rehydrate-from-old-blob covered by jest (`indexedDBWriter.spec` v2→v3) ✅
- **Not run in this environment (CI/manual):** the Playwright e2e flows (upload / URL round-trip /
  scenario save+apply) and the manual side-by-side smoke of labels/hover/tooltip vs `main` — the parts
  snapshots don't cover. The jest suite + zero snapshot diff + the migration tests are the automated proof.

## dep-cruiser

`state-home-is-leaf` (renamed from `shared-state-is-leaf`) stays **warn**; it now targets
`(appearance|mapState)` and is clean (mapState imports no lens/renderer/shell). Flips to **error** for
mapState in Slice 6.

## Rollback

Revert commit 2 (keeps the mapState rename) to return to the folder-only state; revert both to return
to the Slice-4 `appearance/` module.
