---
name: Per-view loading indicator
issue: <#issueid>
state: complete
version: 1
---

## Goal

Replace the single global loading spinner with a per-view readiness model: each routed view (Metrics,
Domain) shows its own spinner for its own work, and the 3D map render is deferred until the Metrics
view is actually on screen. Land a minimal fix for the two current hang bugs first, so the branch is
shippable at every commit.

## Tasks

### 1. Stop the current spinner from hanging (behavioral fix, own commit)

Two independent defects make the global spinner stick:

- `setLoadingIndicator.effect.ts:59-64` — the non-map race branch subscribes to
  `visibleFileStatesSelector` *inside* the `switchMap` and applies `skip(1)`. `store.select` replays
  synchronously, so it discards the very emission that raised the spinner and then waits for a
  subsequent one. The last emission of a load burst re-raises the spinner with nothing left to
  satisfy it, so on `/domain` it hangs until the 60 s deadline. Drop the `skip(1)`.
- `util/dispatchAfterPaint.ts` — `isPendingHeavyDispatch$` is only cleared from inside
  `renderCodeMap$`. The blacklist actions that set it are not in `actionsRequiringRerender`, so the
  clear happens only incidentally via `combineLatest` replay. A dispatch that does not change
  accumulated data latches the flag true forever, with no deadline on that path at all. Give it a
  clear that cannot outlive its own dispatch.

Both need a regression test that fires *more than one* file-state emission after arming — the
existing spec only fires one, which is why it passes today.

### 2. Introduce per-view readiness

- Replace the single `isLoadingFile` boolean with readiness reported per view. The router URL is
  already the source of truth for the active view (`routing/routePaths.ts`); there is no
  `activeView` store to extend, so decide where readiness lives (a small store slice keyed by view
  is likely cleanest, and keeps it testable without the router).
- Each view is ready when *its own* content has settled: Metrics when the map render has settled,
  Domain when the word cloud and explorer have their data.
- The global overlay at `views/codeCharta.component.html:2` is replaced by one overlay per routed
  view, rendered inside `metricsView` / `domainView`. Nav bar and view switcher stay interactive.
- Note `defaultIsLoadingFile = true` with `setState(defaultIsLoadingFile)`
  (`isLoadingFile.reducer.ts:6`) means a dispatch with `value: undefined` latches the spinner **on**.
  Do not carry that footgun into the replacement.

### 3. Defer the map render until the Metrics view is shown

- `KeepAliveRouteReuseStrategy` detaches rather than destroys the Metrics view, but
  `RenderCodeMapEffect` is a global effect and keeps rendering while detached. Gate it so the heavy
  render does not run while Metrics is off screen.
- On activation, run the pending render and show the Metrics spinner until it settles.
- Care: the reuse strategy exists because `CodeMapComponent.ngOnDestroy` tears down the Three.js
  scene. Deferring must not reintroduce the empty-canvas-on-return problem, and must not leave the
  scene stale after a load that happened while detached.

### 4. Scope heavy dispatches to the active view

- Explorer-initiated blacklist actions (`sidebarExplorer.write.store.ts:41,53`,
  `nodeContextMenu.write.store.ts`, `blackListExtension.store.ts`) currently raise the one global
  spinner. Route them through the active view's readiness instead: an exclude done from Domain
  blocks only Domain; Metrics catches up on activation per Task 3.
- Same for `isApplyingScenario$` (`util/busy/isApplyingScenario.ts`), which is a module-level
  subject deliberately outside the store — decide whether it stays that way under the new model.

## Steps

- [x] Complete Task 1: Stop the current spinner from hanging — commit separately, tests first
- [x] Complete Task 2: Introduce per-view readiness
- [x] Complete Task 3: Defer the map render until the Metrics view is shown
- [x] Complete Task 4: Scope heavy dispatches to the active view
- [x] Update the e2e coverage — new `e2e/viewLoadingSpinner.e2e.ts` covers both views' spinners
- [x] Update CHANGELOG.md

## Notes

Decisions taken with the user on 2026-07-20:

- **Map render**: defer until Metrics is shown. Domain loads stay cheap; the map cost is paid on
  switch, where the Metrics spinner covers it.
- **Spinner scope**: one overlay per view (not per region). The explorer does not get its own
  indicator for now.
- **Heavy ops**: scoped to the active view.
- **Delivery**: bugfix first, then the redesign.

Findings from the investigation that shaped this:

- The spinner is an OR of three sources — `isLoadingFile$`, `isPendingHeavyDispatch$`,
  `isApplyingScenario$` (`loadingFileProgressSpinner.service.ts:14`). All three need a home in the
  new model; fixing only the first leaves two ways to hang.
- The comment in `setLoadingIndicator.effect.ts:54-58` claiming the domain view produces no
  `renderCodeMap$` is only true when deep-linking to `#/domain` without ever activating Metrics.
  `RenderCodeMapEffect` is global and fires on every route today. Task 3 is what actually makes that
  comment true.

## Verification

- Unit: 362 suites / 2465 tests green.
- E2E: all 50 green, including `navBarFolderButton › should open an invalid file…`, which caught a
  real regression mid-implementation (see below) — and the pre-existing `domainView › should keep the
  metrics map rendered after switching to domain and back`, which was the stated risk of Task 3.
- `npm run lint` (architecture / styles / dead code) and `tsc --noEmit` clean.

### Regression caught during implementation

Marking every view stale at the START of a load stranded a load that never commits: an invalid file
raises `isLoadingFile`, fails validation, and dispatches no `filesLoaded` — so nothing ever marked
the views ready again and the spinner stayed up. Staleness is now raised only when files actually
land; while a load is in flight the spinner comes from `isLoadingFile`, which the use-case lowers on
both the success and the failure path.

## Commit status

Complete and committed. The bugfix (`fix(visualization): stop the loading spinner from hanging on the
domain view`) and the per-view readiness redesign both landed with the domain-view work — the
`routing/viewReadiness.store.ts` (+spec), the removal of the global overlay from
`codeCharta.component.html`, the `viewLoadingSpinner.e2e.ts` coverage and the CHANGELOG entry are all
on the branch (see commit `7b3ee0356`). The earlier "only Task 1 committed" note was stale.
