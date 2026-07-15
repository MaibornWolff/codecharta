---
name: viz-2.0-slice-22-close-the-raw-state-hole
issue:
state: complete
version: 1
---

# Slice 22 — Close the raw-state hole; fence it at the symbol level

> **Structural.** Every commit is a re-route or a fence: `tsc` clean, `npm test` green with **ZERO snapshot
> diff and no `-u`**, `lint:architecture` 0/0. Inherits [`CONVENTIONS.md`](./CONVENTIONS.md).
> Found while reviewing [Slice 20](./slice-20-facades-are-apis.md) — it is the half of the read path that
> Slice 20 did not close. Land before [Slice 21](./slice-21-single-load-pipeline.md), whose Task 5 assumes it.

## Goal

Make the state homes' encapsulation **true**, not just true-of-the-reactive-path. Today there are **two** read
paths, and Slice 20 only completed and fenced one of them.

## Why (the measured problem)

`features/3dPrint/stores/colorMode.store.ts` is 23 lines and holds all three surfaces at once:

```ts
constructor(private readonly store: Store<CcState>, private readonly state: State<CcState>) {}
colorMode$ = this.store.select(colorModeSelector)                        // reactive read (fenced)
getColorMode() { return this.state.getValue().mapState.colorMode }       // RAW read (unfenced)
setAbsoluteColorMode() { this.store.dispatch(setColorMode({ … })) }      // write (fenced)
```

The middle line reaches straight into another home's internals. **17 non-spec files outside `stores/` do this**,
including `3dPrint/stateAccess.store.ts` (7 homes' internals), `codeMap.store.ts` and
`threeViewer/threeScene.store.ts` (whole `mapState` / `preferences` objects), and `scenarios.store.ts` (which
re-exports `getValue(): CcState` wholesale to its feature).

**Why no rule catches it — and this is the important part.** dependency-cruiser is a *module-graph* analyser. It
sees the edge `colorMode.store.ts → @ngrx/store` and nothing finer. `import { State, Store } from "@ngrx/store"`
is **one module edge carrying two symbols**, and `features/*/stores/` is explicitly on the allowlist of
`feature-only-stores-can-import-ngrx-store` (correctly — that is where `Store` must be injected). The rule cannot
distinguish `Store` (wanted: `select`/`dispatch` both land on fenced surfaces) from `State` (the raw escape
hatch). It is a granularity limit of the tool, not a mistake in the rule. `home-selectors-are-declared-in-their-home`
(Slice 20 T4) misses it too: this path imports no selector at all.

**The fence has to be symbol-level.** Biome 2.4.4 is already configured at the repo root with
`linter.enabled: true`, and its `noRestrictedImports` supports per-`importNames` bans — verified against a probe:
it flags `State` and leaves `Store` alone. `biome check` (= format **+ lint**) already runs via
`npm run format:check` and the Husky pre-commit hook, so the rule is enforced the moment it lands. No new tooling.

## Tasks

### 1. Give the homes a synchronous read surface (additive)
- Imperative callers inject `State` only because read windows expose streams and **no synchronous accessor**.
  Read windows live *inside* `stores/`, where `State` is legal — so the home owns the `getValue()` and hands out
  a typed snapshot.
- Add sync accessors to `MapStateReadWindow` / `SharedViewReadWindow` / `PreferencesReadWindow` /
  `FileStoreReadWindow` for **exactly the slices the 17 files actually read** (greppable — nothing speculative).
- Add `MetricsLensSourceReadWindow` (`attributeDescriptors` is read raw by `3dPrint/stateAccess.store.ts`).
- Two callers read a **whole home** (`getValue().mapState`, `getValue().preferences`). Give them a home-level
  snapshot (`getMapState()`, `getPreferences()`) rather than 20 accessors — it is still owned by the home and
  typed, and it is a single seam to narrow later. Note it in CARRIED-FORWARD.

### 2. One fenced seam for the legitimate whole-tree readers
- Four readers genuinely need all of `CcState` and must not be banned: reset-to-defaults
  (`globalSettings/resetSettings.store.ts`, `shared/resetSettingsButton.store.ts` — both call
  `getPartialDefaultState(keys, wholeState)`), persistence (`load/effects/saveCcState/saveCcState.effect.ts`), and
  `features/scenarios/stores/scenarios.store.ts`.
- Add **one** injectable `CcStateSnapshot` in `stores/rootStore/` exposing `get(): CcState`. It is the only thing
  outside a home allowed to see the whole tree — one greppable seam instead of 17 ad-hoc ones.
- `scenarios.store.ts` re-exporting `getValue(): CcState` to its feature is the worst offender; route it and
  narrow what it hands out if that is cheap. If not cheap, leave the narrowing to a later slice — do not turn this
  into a scenarios refactor.

### 3. Route all 17 files off `State<CcState>`
- Per-slice reads → the home's new sync accessor. Whole-tree reads → `CcStateSnapshot`.
- **Value-identical by construction:** the accessor performs the same `getValue().<home>.<slice>` read, just from
  inside the home. Behavior must not change — no read becomes reactive in this slice (that would be behavioral;
  keep it for later if wanted).
- `stores/fileStore/repos/files.repo.ts` already lives inside `stores/` — it keeps `State`, no change.
- `load/loadInitialFile.store.ts` is on the list. This is exactly Slice 21 Task 5's "raw `state.getValue()` reads
  go through the read windows" — doing it here shrinks Slice 21.

### 4. Fence it at the symbol level
- Biome `noRestrictedImports` at **error**: ban the named import `State` from `@ngrx/store`, with an `overrides`
  entry re-allowing it under `visualization/app/codeCharta/stores/**` (the homes + rootStore) and in specs.
- **Prove it bites:** add a probe importing `State` in a feature file, see biome error, revert the probe. A rule
  that passes because it matches nothing is worthless.
- Companion dep-cruiser rule only where module-level granularity suffices — do **not** pretend dep-cruiser can do
  this one. Record the "module-graph vs symbol" limitation in CARRIED-FORWARD so the next person does not go
  looking for a dep-cruiser rule that cannot exist.

## Steps

- [x] Task 1: sync accessors on the read windows + `MetricsLensSourceReadWindow` (additive; suite trivially green)
- [x] Task 2: `CcStateSnapshot` in `stores/rootStore/` for the 4 whole-tree readers
- [x] Task 3: route the 17 files off `State<CcState>` (one commit per area)
- [x] Task 4: biome `noRestrictedImports` at **error**, proven to bite; `format:check` + `lint:architecture` clean
      (symbol-level by necessity: dep-cruiser sees only the module edge to `@ngrx/store` and cannot ban `State`
      while allowing `Store` — no such dep-cruiser rule can exist. Exempt: `stores/**`, `**/*.spec.ts`, and the
      TestBed provider `mocks/state.mocks.ts`.)
- [x] Final: `tsc` clean ✅ · full suite green ✅ · **45/45 snapshots zero-diff** ✅ · `npm run e2e` ✅ (confirmed 2026-07-15,
      see below)

## Outcome (2026-07-14)

Three commits, `2d743ada1..4a00b5f7a`. `tsc` clean · **341 suites / 2,196 passed** · **45/45 snapshots, no `.snap`
file touched** · `lint:architecture` 0 (1,029 modules) · `format:check` clean. **e2e confirmed 2026-07-15**: this
slice's commits (`4a00b5f7a`) are an ancestor of the e2e-chromium-fallback fix (`plans/2026-07-15-e2e-chromium-fallback.md`,
state: complete), which reports three consecutive full-suite runs at 40/40 passing against a HEAD that includes
this slice's changes — the raw-state-hole re-routing has been exercised end-to-end, not just unit-tested.

**Definition of done met:** `grep -rln "State<CcState>" app/codeCharta` outside `stores/`, excluding specs and the
TestBed provider `mocks/state.mocks.ts`, returns **nothing**. All 17 files routed.

- **T1/T2** — sync accessors added to `MapStateReadWindow` (incl. `getMapState()`), `SharedViewReadWindow`,
  `PreferencesReadWindow` (`getPreferences()`), `FileStoreReadWindow`; new `MetricsLensSourceReadWindow` **and**
  `DependencyLensSourceReadWindow` (the latter was not in the brief — `loadInitialFile.store.ts` reads
  `getValue().dependencyLensSource` raw); new `CcStateSnapshot` in `stores/rootStore/` as the single fenced
  whole-tree seam. `CcStateSnapshot` tripped no existing dep-cruiser rule.
- **T3** — all 17 files routed; the six concurrent agents integrated with **zero repair needed**. One legitimate
  type-only ripple: `floorLabelDrawer.translatePlaneCanvases` widened `Vector3` → `Scaling` because
  `ThreeSceneStore.getMapState()` now returns the state's true type (a `Vector3` satisfies `{x,y,z}`
  structurally; the body reads only `.x/.y/.z`). Zero snapshot diff confirms it.
- **T4** — Biome `noRestrictedImports` at **error**, verified surgical against three probes:
  a feature file importing `State` **errors**; the same file importing only `Store` is **silent**; a `stores/` file
  importing `State` is **allowed**. Exempt: `stores/**`, `**/*.spec.ts`, `mocks/state.mocks.ts`.

## Notes

- Per-commit gate is the CONVENTIONS.md **structural** checklist. A snapshot diff here means a re-route was not
  value-identical — fix the code, never `-u`.
- Rollback: each task is an independent commit chain. No persistence touched.
- After this, `grep -rl "State<CcState>" app/codeCharta` outside `stores/` returns **nothing**. That grep is the
  definition of done.
