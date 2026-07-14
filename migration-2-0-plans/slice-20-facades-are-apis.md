---
name: viz-2.0-slice-20-facades-are-apis
issue:
state: complete
version: 2
---

# Slice 20 — Facades become APIs; delete the per-feature passthrough layer

> **Structural only.** Every commit is a move/delete/repoint: `tsc` clean, `npm test` green with **ZERO
> snapshot diff and no `-u`**, `lint:architecture` 0/0. Inherits [`CONVENTIONS.md`](./CONVENTIONS.md).
> The behavioral half of the same problem (the startup/load pipeline) is [Slice 21](./slice-21-single-load-pipeline.md)
> and must NOT be mixed into these commits.

## Goal

Turn each state home's read facade from an **incomplete `export *` barrel** into a **complete, injectable
read API**, then delete the ~150 per-feature passthrough files that only exist because the barrel was
incomplete. Net effect: features stop re-inventing state, and the "reach state only via the facade" rule
becomes true in substance, not just in import paths.

## Why (the measured problem)

- `stores/mapState/mapState.read.facade.ts` is 26 lines of `export { … }` — 0 classes, 0 methods — and it
  exposes **21 selectors for 31 slices** (`colorLabels`, `labelMode`, `hideFlatBuildings`, `layoutAlgorithm`,
  `showMetricLabelNodeName`, `showMetricLabelNameValue`, `groupLabelCollisions`, `colorMode` have no export
  at all; `amountOfTopLabels` exports only its reducer default, no selector).
- Features fill the gap themselves: **7 selector names are declared twice** (`areaMetricSelector`,
  `colorMetricSelector`, `isWhiteBackgroundSelector`, `colorRangeSelector`, `heightMetricSelector`,
  `colorModeSelector`, `labelsPerMapSelector`), **`attributeTypesSelector` is declared three times** (both
  lens-source homes + `features/metricsBar/`), and **16 `createSelector(mapStateSelector | preferencesSelector, …)`
  re-derivations** live outside their home (`features/globalSettings/selectors/`, `features/3dPrint/selectors/`,
  `features/labelSettings/selectors/`). `lint:architecture` cannot see this — the import path is legal.
- **81 `features/*/stores/*.store.ts` (1,668 lines) + 73 `features/*/services/*.service.ts`** are mostly pure
  passthroughs. `labelSize.service.ts` is `setLabelSize(v) { this.labelSizeStore.setLabelSize(v) }`;
  `labelSize.store.ts` is `this.store.dispatch(setLabelSize({ value }))`. `invertArea.store.ts` and
  `backgroundTheme.store.ts` are the same 18 lines with the identifier swapped. A handful hold real logic
  (`version.service.ts` does semver comparison, `legend.service.ts` composes three facades) — Task 3's
  keep-rule covers them; the deletion count is not a completion target.
- `MapStateReadWindow` (`stores/mapState/store/mapState.readWindow.ts`, 8 streams) already proves the target
  shape — it just never grew to cover the home.

**Out of scope (deliberately):** rewriting the 51 slice folders onto `createFeature`/`createActionGroup` or a
`defineSetting()` factory. The slice dirs stay as they are; only the layers *above* them change. Note it in
CARRIED-FORWARD as a possible later slice.

## Tasks

### 1. Complete the read windows (one injectable class per home)
- Grow `MapStateReadWindow` to expose **every mapState slice that is read outside its home today** (greppable —
  nothing speculative); add the sibling `SharedViewReadWindow`, `PreferencesReadWindow`, `FileStoreReadWindow`
  scoped the same way.
- Each read window is a thin `@Injectable` of `this.store.select(...)` fields — no logic, no derivation.
- Export it from the home's `*.read.facade.ts`; the barrel keeps re-exporting reducers/defaults for the
  composition root, but consumers get the class.
- Selectors that are genuinely *derived across* homes stay in `renderer/renderModel/` — do not pull them down.

### 2. Fold the re-declared selectors back into their homes
- For each of the 8 duplicated names (7 twice, `attributeTypesSelector` thrice) + 16 re-derivations: keep the
  home's version, delete the feature copy, repoint importers to the read window / read facade.
- Where a feature selector is a real *view* derivation (not a copy), keep it — but make it read the home's
  selector rather than the home's root state.
- **Parity guard:** before deleting, assert the feature selector and the home selector produce equal values on
  the same state (a one-line `expect(featureSel(s)).toEqual(homeSel(s))` per pair). Cheap, and it proves the
  delete is a no-op.

### 3. Delete the passthrough `*.store.ts` / `*.service.ts` layer
- Rule for keeping a file: it holds logic (validation, sequencing, composition of >1 stream, imperative side
  effects). Everything else — a `select` field and/or a `dispatch` wrapper — goes.
- Components inject the home read window (reads) and the home write facade (writes) directly.
- The CQRS rules (`state-home-write-facade-is-sole-dispatch-surface`, `display-components-cannot-dispatch`)
  still hold: a display component may inject a read window but not the write facade. **Check this early** —
  if a component today dispatches only via its passthrough store, it needs a container/service that owns the
  dispatch, not a direct write-facade injection. Keep those; they are logic, not passthrough.
- Delete the passthrough specs with them (they test ngrx, not us).

### 4. Fence it so the duplication cannot regrow
- New dep-cruiser rule **`home-selectors-are-declared-in-their-home`**: a module outside `stores/<home>/` may
  not import a home's *root* selector (`mapStateSelector`, `preferencesSelector`, `sharedViewSelector`,
  `filesSelector`) — only leaf selectors / the read window. That mechanically bans
  `createSelector(mapStateSelector, …)` in `features/`.
- Optional companion **`no-passthrough-store-wrappers`** is NOT worth a rule — it is not statically
  detectable. The read-window API plus code review carries it.

### 5. Collapse the duplicated `attributeTypes` source
- `stores/metricsLensSource/store/attributeTypes/` and `stores/dependencyLensSource/store/attributeTypes/` both
  carry the full `{ nodes, edges }` shape with one half permanently empty; `lenses/*` then narrow each half and
  `features/metricsBar/selectors/attributeTypes.selector.ts` recombines them into `{ nodes, edges }` again.
- Narrow each slice to the half it actually owns (`NodeAttributeTypes` / `EdgeAttributeTypes`), drop the dead
  half, keep the recombining selector as the single place the two halves meet.
- Both homes currently export a selector literally named `attributeTypesSelector` — rename to
  `nodeAttributeTypesSelector` / `edgeAttributeTypesSelector` so the collision is gone.
- **Persistence:** the IndexedDB keys `metricsLensSource` / `dependencyLensSource` must keep their shape or the
  blob needs a `DB_VERSION` bump + migration. Prefer keeping the persisted shape and narrowing only the
  in-memory type; if that is not clean, write a v16 migration — v7 and v13 already reshaped exactly these
  keys, so the precedent and pattern exist. Either way Task 5 stays in this slice.

## Steps

- [x] Task 1: complete read windows for mapState / sharedView / preferences / fileStore
- [x] Task 2: fold the 8 duplicate selectors + 16 re-derivations back into their homes (parity test → delete)
- [x] Task 3: delete the passthrough `*.store.ts` / `*.service.ts` files, feature by feature (one commit per feature)
- [x] Task 4: add `home-selectors-are-declared-in-their-home` at **error**; `lint:architecture` 0/0
- [x] Task 5: narrow the two `attributeTypes` slices, drop the dead half, kill the name collision
- [x] Final: `tsc` clean · full suite green · **45/45 snapshots zero-diff** · lint 0/0 · file/line count recorded

## Outcome (2026-07-14)

Nine commits, `78482bc8..61b371b31`. **316 files changed, +1,803 / −6,065.**

| Gate | Before | After |
|---|---|---|
| `tsc --noEmit` | clean | clean |
| Test suites / tests | 383 / 2,333 | 341 / 2,196 (0 failed; the delta is deleted passthrough specs) |
| **Snapshots** | 45/45 | **45/45 — no `.snap` file changed at all** (`git diff` over `*__snapshots__*` is empty; `-u` never run) |
| `lint:architecture` | 0 violations, 1,164 modules | 0 violations, **1,025 modules** |
| `features/**/*.store.ts` | 81 | **25** |

- **T1** — 12 missing home leaf selectors created; `MapStateReadWindow` grown 8 → 29 streams;
  `SharedViewReadWindow` / `PreferencesReadWindow` / `FileStoreReadWindow` added. Purely additive.
- **T2** — 19 duplicate selector declarations deleted after an `expect(featureSel(s)).toEqual(homeSel(s))`
  parity spec went green over both `STATE` and `DEFAULT_STATE`; the parity spec was then removed as scaffolding.
  `lenses/dependency/store/edges.selector.ts` repointed off `filesSelector` onto the existing
  `visibleFileStatesSelector` — which removed the last legitimate root-selector consumer and let T4 land with **no exemption**.
- **T3** — the `display-components-cannot-dispatch` fence (matches every `features/**/*.component.ts`, on the import
  path, so no wrapper evades it) means a component can **never** inject a write facade. Reads were therefore deleted
  outright (components inject the home read window — already legal, already precedented in `explorerTreeLevel.component.ts`)
  and writes were **consolidated to one write store per feature** rather than deleted. The CQRS rules were not weakened.
- **T4** — rule added at `error` and **proven to bite**: a probe importing `mapStateSelector` from a feature file
  produces `error home-selectors-are-declared-in-their-home`; removing the probe returns lint to 0.
- **T5** — narrowing the two `attributeTypes` slices in place was **not** safe: `writeCcState` persists
  `state.getValue()` verbatim with no serialization boundary, so a v15 blob would silently restore `{nodes,edges}`
  into a narrowed slice and every metric would render as absolute with no error. Took the plan's fallback:
  **DB_VERSION 15 → 16** with a no-op-safe `migrateCcStateRecordToV16` unwrap (landed as its own commit, ahead of
  the type narrowing, per Tidy First).

## Notes

- Per-commit gate is the CONVENTIONS.md **structural** checklist: moved/deleted code is byte-identical in
  behavior, zero snapshot diff, no `-u`, all importers repointed (grep the old path, **including `.spec.ts`**).
- Each Task 3 commit deletes a passthrough file **together with its spec** — never split them across commits,
  so any single revert stays clean.
- Sequence matters: Task 1 before Task 3 (components need somewhere to inject), Task 2 before Task 4 (the rule
  will fail on the duplicates it is meant to prevent).
- Rollback: every task is an independent commit chain; revert any one. No persistence touched (Task 5 is the
  only one that could — see its guard).
- Expected size: most of the ~150 passthrough files deleted (the few with real logic stay), ~1.6k+ lines
  removed from `features/*/stores/` alone. Track the before/after count in the outcome note.
