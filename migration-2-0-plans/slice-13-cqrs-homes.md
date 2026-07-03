---
name: viz-2.0-slice-13-cqrs-homes
issue:
state: progress
version: 1
---

> **Status (2026-07-03):** 13a ✅, 13b ✅, 13c ✅ — all three homes CQRS-split (read/write facades),
> the 3 CQRS rules at **error** across the whole tree (0 violations). 13d ✅ for the **mapState metric
> cluster** (injectable `MapStateReadWindow` introduced; 3 pure-read duplicate wrapper classes deleted +
> 6 metricsBar read+write stores' read halves delegated). 13d's **cross-cutting clusters remain**
> (isDeltaState ×5 in `state/`, isLoadingFile ×3 in `fileStore/`, selectedNode/hoveredNodeId, blacklist +
> the curated multi-read windows) — deferred to CARRIED-FORWARD because they need a home-placement
> decision for cross-home read-windows (fileStore vs `features/shared` vs a not-yet-built viewState home)
> and several feed hover/selection behaviour that wants the user's e2e + manual smoke vs `main`.

## Goal

CQRS the three state homes: split each home's single `export *` barrel into a **read facade**
(selectors) and a **write facade** (action creators), so a display-only consumer physically cannot
dispatch — then **collapse the ~36 duplicate per-feature read `*Store` wrappers** into injectable home
read-windows. Ratified target: `Ideas/codecharta-2.0-refined-layers-and-state-homes.html` ("the read/write
split belongs on mapState / sharedView / preferences … collapses the duplicated per-feature store
wrappers"). Behaviour-preserving throughout (snapshots are the contract, never `-u`).

**Numbering:** the legacy-boundary-close took the "Slice 12" label, so this is **Slice 13** (CQRS) and the
renderer/page split becomes **Slice 14**. No ordering dependency on 14; needs only Slices 5–12 (done).

## Scope evidence (2-agent map)

- **Write importers (prod):** mapState **38**, sharedView **15**, preferences **11** — all feature `stores/`
  + `state/effects/**` + the single `load/loadInitialFile.store.ts` (+1 sharedView service, +legacy
  `state/store/fileSettings/fileSettings.actions` re-export). **ZERO display components dispatch.**
- **Read importers (prod):** mapState **37**, sharedView **20**, preferences **7** — feature stores,
  lens `*.selector(s).ts`, effects. **ZERO components read selectors directly.**
- **Effects import actions mostly as TYPE-REF LISTS** (`actionsRequiringRerender`=26, `…SaveCcState`=31,
  `…UpdateQueryParameters`=4), not dispatch sites — they need the creators for `.type` membership.
- **Wiring leaks (must stay reachable on the READ/shared side, not behind write):** root selectors
  `mapStateSelector`/`preferencesSelector` → feature selector files; `default*` constants (esp.
  `defaultMapColors` → 6 components, `defaultAmountOfTopLabels`) as literal fallbacks; one raw reducer
  (`distributionMetric`) into a component; helper `findIndexOfMarkedPackageOrParent`. Store-only wiring
  (combined reducer + top `default*`) is just `state.manager` + `indexedDBWriter`.
- **Dedup:** 88 store files / 78 read-wrappers / 119 read-members; **36 redundant read-copies** over 18
  selectors wrapped in ≥2 features — all read-side, concentrated in mapState area/height/color/colorRange/
  mapColors/colorMode/edge + cross-cutting isDeltaState/selectedNode/isLoadingFile/hoveredNodeId/blacklist.
  Write halves are per-feature (barely duplicated). Precedents to generalize: `legendMapState.store` (7-read
  window), `Print3DStore` (8), `NodeSelectionStore` (5), `Print3DStateAccessStore` (imperative snapshot).

## Shape of the split

Per home `<h>` (`mapState`/`sharedView`/`preferences`), replace `<h>.facade.ts` with:
- **`<h>.read.facade.ts`** — re-exports the `*Selector`s + root selector + read helpers + `default*`
  constants (shared read fallbacks). Later gains an **injectable read-window service** (dedup, 13d).
- **`<h>.write.facade.ts`** — re-exports the action creators (`setX`/`toggleX`/…).
- **Store wiring** (`<h>` combined reducer + `defaultX` for `state.manager`/IndexedDB) exported from the
  read facade or a `<h>.wiring.ts` — it is not consumer-facing but must stay importable.

Repoint importers to the correct facade (writers → `.write`, readers → `.read`). Feature `stores/` that
both read+write import both. `Tidy First`: the facade split + repoint is **structural** (byte-identical
behaviour); the dedup (13d) is **behavioral wiring** (DI rewire, value-identical).

## Sub-slices (per home split, then dedup — precedent: 9a/b/c, 10 core/10c, 12a/b/c)

### 13a — split preferences (smallest: 11 write / 7 read) — proves the pattern + rules
- Create `preferences.read.facade.ts` + `preferences.write.facade.ts`; repoint the 11 writers + 7 readers
  (+ specs). Add the 3 CQRS rules scoped to preferences, staged `warn`; flip preferences → `error`.

### 13b — split sharedView (15 / 20)
- Same shape; watch the 1 service writer + the legacy `fileSettings.actions` re-export + the
  `findIndexOfMarkedPackageOrParent` helper (read side). Flip sharedView → `error`.

### 13c — split mapState (38 / 37, largest) + flip the 3 rules across all homes
- Same shape; `default*` constants stay on the read facade (6 components read `defaultMapColors`); the raw
  `distributionMetric` reducer read by a component gets repointed to the read/wiring side. Flip mapState →
  `error` — all three CQRS rules now error everywhere.

### 13d — dedup the read wrappers (behavioral, cluster by cluster)
- Give each home an **injectable read-window** (extends the read facade) and collapse the 36 duplicate read
  wrappers into it, one cluster at a time (mapState metric cluster first — the biggest). Features inject the
  home read-window instead of re-wrapping the selector in a per-feature store. Report the wrapper-count
  delta. Value-identical (same selector, same emissions). Sub-slice by cluster if the blast radius warrants.

## Steps
- [x] 13a: split preferences read/write facade + 3 CQRS rules (→ error for preferences)
- [x] 13b: split sharedView read/write facade (→ error for sharedView)
- [x] 13c: split mapState read/write facade (→ error, all homes)
- [~] 13d: dedup the duplicate read wrappers — **mapState metric cluster done** (MapStateReadWindow;
  −3 pure-read wrapper classes: ExplorerAreaMetricStore/InspectorMapColorsStore/DistributionMetricStore;
  6 metricsBar read+write stores delegate their read half). Cross-cutting clusters carried forward.

## dep-cruiser rules (staged warn→error per home, as each split lands)
- `state-home-write-facade-is-sole-dispatch-surface` — action creators reachable only via `<h>.write.facade`.
- `state-home-read-facade-has-no-dispatch` — the read facade re-exports no action creator.
- `display-components-cannot-dispatch` — `features/**/*.component.ts` must not import a `<h>.write.facade`
  (already 0 violations → can go straight to error).
- Also lands the deferred `feature-reaches-state-home-only-via-facade` (mapState 7 / sharedView 8 / prefs 10).

## Notes / risks
- **Risk MED/LARGE** = mechanical volume (~130 prod import repoints + ~120 spec), not conceptual — the
  component-dispatch boundary already holds (0 violations). Lower-risk than the HIGH/XL renderer slice, which
  is deliberately last.
- Homes only — **do NOT** add a write facade to a lens (it's read-only; a lens write facade would be
  near-empty and would let a lens own selection). The metrics lens is already read-only + a separate
  `.load.facade`; leave it.
- Snapshots byte-identical (never `-u`); tsc + biome + dep-cruiser clean; adversarially review each sub-slice.
- Open design choice for review: read-facade shape in 13a-c is a **selector re-export** (structural); the
  **injectable read-window** is introduced in 13d for the dedup. Confirm this phasing (vs building the
  injectable read facade up front in 13a).
