---
name: viz-2.0-slice-21-single-load-pipeline
issue:
state: complete
version: 2
---

# Slice 21 — One load pipeline, one post-load reconciliation

> **Behavioral.** This is the one slice in the migration that deliberately changes *who writes what, in what
> order* — so the snapshot contract alone does not cover it. Per [`CONVENTIONS.md`](./CONVENTIONS.md) Part 1:
> branch by abstraction, prove value-equality before deleting the old path, `npm run e2e` green for every
> affected flow, and **manual side-by-side vs `main`** for what snapshots don't pin (camera autofit, spinner,
> label state, URL after boot). Land [Slice 20](./slice-20-facades-are-apis.md) first — it removes the
> passthrough layer this slice would otherwise have to thread through.

## Goal

Give file loading **one owner**. Today five entry points each re-implement part of the pipeline, and ~9
independent effects each react to "files changed" in an emergent order. Replace both with a single
`LoadFilesUseCase` and a single post-load reconciliation sequence with an explicit precedence rule.

## Why (the measured problem)

**Five entry points, three of which re-implement the pipeline** (initial `?file=`, IndexedDB restore, sample
files, file-picker upload, reset-map dialog). `features/globalSettings/.../confirmResetMapDialog.component.ts:42-53`
is a hand-copy of `load/loadInitialFile.service.ts:33-49` — same decision tree, but it swallows errors silently
instead of raising the error dialog, and it **omits** `setMetricsFromUrl()` and `setCurrentFilesAreSampleFilesFromUrl()`.
Both files separately `new UrlExtractor(...)`. Sample-file loading is written out 4×.

**Nobody owns "a file was loaded → re-initialize."** At least nine things independently react to file changes
and each does its own reset: `unfocusNodes.effect`, `updateFileSettings.effect`, `setLoadingIndicator.effect`,
`updateVisibleTopLabels.effect` (on `visibleFileStatesSelector`), `resetColorRange.effect` (on the file
actions), `resetChosenMetrics.effect` / `resetSelectedEdgeMetricWhenItDoesntExistAnymore.effect` (on the
*derived* `nodeMetricDataSelector` / `edgeMetricDataSelector` — which also change on blacklist edits, not just
loads), `autoFitCodeMap.effect` (on a curated `selectorsTriggeringAutoFit` list), plus an imperative rxjs
subscription inside `stores/fileStore/loaders/ccJson/services/loadFile.service.ts:18-26`. Ordering is
emergent — which is why `resetColorRange.effect.ts:22` needs `skip(1), take(1)` to come out right.

**Consequence:** on a `?file=…&area=…` boot with saved state, `areaMetric` is written by the persisted-restore
path (`load/loadInitialFile.store.ts:365`), then again by the URL path (`:182`), with `ResetChosenMetricsEffect`
possibly firing in between. There is no stated precedence — it works by luck. `colorRange` is recomputed at
least twice per load. `isLoadingFile` has **5 writers** (`loadingState.store`, `renderCodeMap.effect`,
`setLoadingIndicator.effect`, `codeCharta.component` boot, and — although applying a scenario is not a file
load — `scenarioApplier.store.ts:20`), and `features/navBar/services/uploadFiles.service.ts:9` keeps an
imperative `isUploading` boolean *outside* the store that `renderCodeMap.effect.ts:50` reaches back into.

**URL read and URL write are two implementations.** `urlExtractor.ts` reads with a hand-rolled regex (`:16-28`)
*and* `URLSearchParams` (`:31`) in the same class; `load/effects/updateQueryParameters/updateQueryParameters.effect.ts:58-101`
writes with two near-identical hand-rolled string splitters that use neither. The param list read on boot and
the list written back are kept in sync by hand. `"file"` and `"mode"` are raw string literals outside the
`MetricQueryParemter` enum (note the typo — fix it while there).

## Tasks

### 1. `QueryParams` — one module, both directions
- One module owning a **declarative param ↔ state map** (`file`, `mode`, `area`, `height`, `color`, `edge`,
  `currentFilesAreSampleFiles`), `URLSearchParams` for read *and* write, `history.replaceState` in one place.
- Retire `UrlExtractor`'s regex path and the two hand-rolled writers in `updateQueryParameters.effect`.
- Sever the odd edge `UpdateQueryParametersEffect → LoadInitialFileService` (`:37`) — it exists only to re-read
  a param.
- Purely mechanical and independently testable: **do this first, land it alone.**

### 2. `LoadFilesUseCase` — one entry point
- One injectable taking a source: `url | indexedDB | sample | upload | reset`. It owns: fetch/parse → validate →
  error dialog → `filesRepo.setFiles` → set standard-by-names → `fileRoot.updateRoot` → emit **one** `filesLoaded`
  action carrying the provenance (which source, whether these are sample files).
- Every caller goes through it: `codeCharta.component.ts` (boot), `uploadFiles.service.ts`,
  `confirmResetMapDialog.component.ts`. The reset dialog's copied decision tree is **deleted**, not fixed.
- `UrlExtractor` becomes DI-provided (it is `new`ed in two places today).
- IndexedDB is read **once** per boot (today `loadInitialFile.service` calls `readCcState` at `:45`, `:117`,
  `:179` — a `?file=` boot that falls back to samples reads it twice).

### 3. One reconciliation owner, with a stated precedence
- Replace the ~9 independent subscribers with **one** reconciliation effect that owns the deterministic
  sequence:
  1. merge file settings (blacklist / markedPackages / attributeTypes / attributeDescriptors)
  2. derive metric data
  3. resolve the metric selection — **precedence: URL > persisted state > computed default** (write it down; it
     is currently unstated and racy)
  4. derive `colorRange` from the resolved color metric — **once**
  5. unfocus nodes, reset top labels
  6. camera autofit
  7. clear the loading indicator
- The owner has **named triggers**, not just `filesLoaded` — three of the old subscribers legitimately fire on
  non-load changes and those paths must not be lost:
  - `filesLoaded` → full sequence 1–7.
  - **metric data changed without a load** (blacklist edit removes a metric) → steps 2–5 only. This replaces
    `resetChosenMetrics.effect` and `resetSelectedEdgeMetricWhenItDoesntExistAnymore.effect` watching the
    derived selectors.
  - **autofit-relevant view change** (the current `selectorsTriggeringAutoFit` list, minus the load case) →
    step 6 only.
- Delete `skip(1), take(1)` and friends — they are workarounds for the missing sequence.
- `setDefaultMetrics` gets **one** caller (this effect). `mapReset.store.ts:24-31`'s imperative `first()`-subscribe
  re-implementation goes away.

### 4. One owner for the loading flags
- `isLoadingFile` written only by the use-case + the reconciliation effect (start / end).
- The scenario writer (`scenarioApplier.store.ts:20`) is not a file load: scenarios get their **own flag**.
  `renderCodeMap.effect.ts:50` already reads `scenariosFacade.isApplying` separately, so the seam exists —
  route the spinner off that and stop scenarios writing `isLoadingFile`.
- Delete the imperative `isUploading` boolean in `uploadFiles.service.ts:9`; `renderCodeMap.effect.ts:50` reads
  the store instead.

### 5. Clean up `loadInitialFile.store.ts`
- The 5 copies of the same apply-loop (`:85-168`) collapse into one generic `applySlice(sliceName, mapper)`.
- The 100-line `mapMapStateToAction` switch (`:284-383`) becomes a typed `hydrate(partial)` per home (or is
  dropped entirely if the persisted-restore path can dispatch `setState` with the home's own default shape).
- The stringly-typed action `"StartWithGlobalOption:resetCameraIfNewFileIsLoadedSetToFalse"` (`:82`, matched by
  string in `autoFitCodeMap.effect.ts:38`) becomes a real action creator on the preferences write facade.
- Raw `state.getValue()` reads go through the read windows introduced in Slice 20.

## Steps

- [x] Task 1: `QueryParams` module (read+write, declarative map); retire the regex + the 2 hand-rolled writers
- [x] Task 2: `LoadFilesUseCase`; repoint boot / upload / reset; delete the copied decision tree in the reset dialog
- [x] Task 3: one reconciliation owner (triggers: `filesLoaded` → 1–7, metric-data change → 2–5, view change → 6) with the stated precedence; retire the 9 subscribers one by one
- [x] Task 4: `isLoadingFile` written only by the pipeline; scenarios get their own flag; delete `isUploading`
- [x] Task 5: de-duplicate `loadInitialFile.store.ts` (apply-loop, switch, stringly-typed action)
- [x] Final: full suite green · snapshots zero-diff · `npm run e2e` green

## Outcome (2026-07-14)

Eight commits, `fb772be11..96cbd874b`. **97 files changed, +2,806 / −1,806.**

| Gate | Before | After |
|---|---|---|
| `tsc --noEmit` | clean | clean |
| Test suites / tests | 342 / 2,215 | 337 / 2,238 |
| **Snapshots** | 45/45 | **45/45 — the only two `.snap` files touched are `R100` pure renames** (the mergers moved with their effect; `git diff -M` shows 0 insertions, 0 deletions; `-u` never run) |
| `npm run e2e` | 34 green | **40 green, twice back-to-back** (6 new: IndexedDB restore, url metric precedence, url write-back, default fallback, reset-map, file-panel trigger) |
| `lint:architecture` | 0 violations | 0 violations |
| `lint:deadcode` (knip) | 9 unused exports | 9 (unchanged — the slice added none) |
| Load entry points | 5 (3 re-implementing the pipeline) | **1** (`LoadFilesUseCase`) |
| Post-load subscribers | **9** + 1 imperative rxjs subscription | **1 sequence** (+2 renderer-side steps) |
| `isLoadingFile` writers | 5 (one an imperative boolean outside the store) | **2**, both in the load pipeline |
| `readCcState()` per boot | 2–3 | **1** |
| `loadInitialFile.store.ts` | 397 lines | 342 |

**The precedence rule is the deliverable**, and it is now one pure, exhaustively-tested function —
`load/effects/reconcileAfterLoad/resolveMetricSelection.ts`: **URL > persisted > computed default**, where a
candidate only wins if the metric it names exists in the files that were actually loaded, and a URL metric
naming an absent metric is dropped silently so the next candidate wins. area/height/color resolve as a
combination (mirroring the old all-or-nothing `areChosenMetricsAvailableSelector`); `edgeMetric` resolves
independently.

### What the plan got wrong, and what we did instead

- **`isLoadingMap` was dead state.** Four writers, and — as the mapping pass found — **zero** readers: no
  selector, no template. Deleted outright rather than re-homed.
- **The reconciliation cannot trigger on `filesLoaded` alone.** Five of the nine old subscribers listened on
  `visibleFileStatesSelector`, which also fires on file-*panel* changes (delta switch, file removal,
  re-selection) — no load involved. Keying only on `filesLoaded` would have silently dropped the whole cascade
  for those. The `fileSet` trigger is therefore `filesLoaded` **OR** a visible-file-set change, with the
  provenance null in the latter case. This was the single biggest regression risk in the slice and it is now
  covered by an e2e.
- **The burst must be REDUCED, not debounced.** `filesLoaded` is *not* the last action of a load — the restore
  branch dispatches `setFiles(savedFileStates)` after it. Taking the last trigger of the debounced burst would
  have dropped the provenance, and with it the URL metrics, on exactly the `?file=…&area=…`-with-saved-state
  boot this slice exists to fix. The triggers are buffered and any `filesLoaded` in the burst wins.
- **The metric-data trigger runs steps 2–4, not 2–5.** The plan said 2–5; but a blacklist edit did not unfocus
  nodes or reset the top-label count before, and must not now.
- **`hydrate(partial)` per home was not attempted** (see Notes) — `applySlice` only. Recorded in CARRIED-FORWARD.

### The four regressions the adversarial review caught — and the one lesson behind them

An adversarial review after the seven commits found **four real regressions**, all green on the suite and
all invisible to the snapshots. Every one came from the same root cause, and it is the thing to remember:

> **Deferring work re-orders it.** The old effects were `store.select(...)` subscriptions, which ngrx runs
> **synchronously inside `dispatch`**. Moving that work into a debounced sequence moved it *after* everything
> the loader does synchronously — silently inverting orderings nobody had written down.

1. **A restored session's blacklist and marked packages were wiped on every reload.** `UpdateFileSettingsEffect`
   merged the file settings synchronously inside `setFiles`, i.e. *before* `applySharedView` restored the
   persisted ones — so persisted won. The deferred merge landed on top of them instead. Because a user's
   exclusions and markings live **only** in the persisted state (they are never written back into a file's own
   `fileSettings`), the merge erased them — and `saveCcState` then persisted the loss. Permanent data loss, on
   the most ordinary flow there is: reload the page.
2. **A focused folder came back unfocused**, and the persisted `attributeTypes` were clobbered — same inversion.
3. **"Reset map to default" stopped resetting the metrics.** `setState(defaultState)` does not clear them:
   `_applyPartialState` skips `null`s and every default metric *is* `null`. So the old selection survived the
   reset, was still available in the reloaded files, and won the precedence as the "persisted" candidate.
4. **The loading indicator dismissed the spinner mid-load.** The max-wait is armed when a load *starts* — before
   the file is even fetched — so a 5 s deadline fired on any slower boot and told the app the load was done
   while it was still writing to the store.

**Fixes:** the persisted view slices no longer get applied by the use-case; they travel on the `filesLoaded`
provenance and the sequence applies them as its **last** step — which states the precedence explicitly
(**persisted > file-derived**) instead of relying on an accident of dispatch order. The reset carries
`forceDefaultMetrics`, which drops the persisted candidate. The max-wait became 60 s: a last resort for a load
that never renders, not a bound on how long a load may take.

**How #4 was actually caught is worth recording:** two reviewers raised it and *both* adversarial verifiers
refuted it as sanctioned-by-spec. They were wrong. What proved it was a ~50 % flake in the full e2e suite —
the premature dismissal let `goto()` return mid-load, and the still-in-flight `loadFiles` then cleared
`localStorage`, destroying a scenario a later test had just saved. **A flaky test was the ground truth that
beat both the reasoning and the spec.** Chase the flake.

### Verification

Beyond the suite: the 6 new e2e cover boot-from-IndexedDB, the URL precedence (both the win and the
silent-drop-and-fall-back), the URL write-back, reset-map, and a file-panel change with no load. Every e2e also
proves the spinner clears, because the shared `goto()` helper fails if `#loading-gif-file` never hides. The full
e2e suite was run twice back-to-back at the end: **40/40, twice** (it is the run-to-run stability that matters
here — a single green run was what hid #4).

**Still owed: the manual side-by-side vs `main`** listed below (camera autofit, spinner timing, top-label count,
colorRange after a color-metric switch, and the scenario-apply visuals). Two behavior changes in particular
want eyeballing: the top-label count after a load is now computed from *fresh* code-map nodes (the old effect
read them stale via `withLatestFrom`), and applying a scenario no longer disposes/rebuilds the Three scene or
hides the canvas (it no longer writes `isLoadingFile`, which is what `codeMap.render.service` watched).

## Verification

Snapshots do **not** cover this slice's blast radius. Required, in addition to the suite:

- **e2e:** boot with `?file=`, boot from IndexedDB, first-run sample load, upload, delta mode, reset-map.
- **e2e for the non-load triggers:** blacklist the file(s) carrying the chosen area/edge metric → the selection
  resets; change layout → autofit still fires; apply a scenario → spinner shows and clears (now via its own flag).
- **Parity before delete (branch by abstraction):** for each of the 9 subscribers, assert the new sequence
  produces the same resulting state as the old effect **for that effect's own trigger** — a file load for the
  five load-driven ones, a blacklist-driven metric-data change for the two metric resets, a view change for
  autofit — *then* delete the old one.
- **Manual side-by-side vs `main`:** camera autofit on load, spinner start/stop timing, the URL after a
  `?file=&area=…` boot, top-label count after load, colorRange after switching color metric.

## Notes

- **The precedence rule is the deliverable.** Even if every other cleanup here slipped, writing down
  "URL > persisted > computed" and enforcing it in one place removes the class of bug this slice exists for.
- Do not mix with Slice 20's commits (Tidy First). Slice 20 is zero-snapshot-diff structural; this one is not.
- Rollback: Task 1 and Task 2 are independently revertable. Task 3 is the risky one — keep the old effects
  alive behind the parity assertions until the sequence is proven, and delete them in a **separate** commit.
- Follow-ups this slice does not do: `SET_STATE`'s string-path deep-merge + its hand-maintained
  `objectWithDynamicKeysInStore` allowlist (`stores/rootStore/state.manager.ts:20-31`) stays. Once every home
  has a typed `hydrate(partial)` (Task 5), that allowlist can go — record it in CARRIED-FORWARD.
