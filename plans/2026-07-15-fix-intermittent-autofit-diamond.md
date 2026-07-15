---
name: fix-intermittent-autofit-diamond
issue: <#issueid>
state: complete
version: 1
---

## Goal

Loading a new map intermittently leaves the camera in an oblique "tilted diamond" pose instead of
the centered square front view. Make the post-load autofit fire reliably.

## Tasks

### 1. Stop the trigger burst from orphaning the render-wait
- The post-load reconciliation (commit `869e5d00d`) turned the autofit trigger into a three-way
  `merge` (`filesLoaded` + `visibleFileStates` + view selectors). A single load fires these in a
  synchronous burst, and `switchMap(() => renderCodeMap$.pipe(take(1)))` re-subscribes on each —
  any request landing after the one throttled render leaves `take(1)` waiting for a render that
  never comes, so `autoFitTo()` is skipped and the previous/default oblique pose remains.
- Add `debounceTime(0)` before the `switchMap` so the whole burst collapses to one request that
  subscribes once, after the storm and before the async render. Keep the render-wait: `setMapMesh`
  swaps the mesh synchronously, so fitting must happen after the render to avoid a stale-geometry fit.

### 2. Make autoFitTo self-heal instead of silently giving up
- `autoFitTo()` deferred its body with a bare `setTimeout` and early-returned with no retry when the
  geometry was not in the scene yet (`boundingSphere.radius === -1`).
- Replace with a bounded `requestAnimationFrame` retry that waits for the geometry before fitting.

### 3. Tests
- Update `autoFitCodeMap.effect.spec.ts` for the debounce (fake timers).
- Update `threeMapControls.service.spec.ts` autoFitTo tests for the rAF retry.

## Steps

- [x] Complete Task 1: debounce the autofit trigger burst
- [x] Complete Task 2: rAF retry in autoFitTo
- [x] Complete Task 3: update the two spec files, run tests (full suite green)

## Revision — the real root cause (gz consistently broke)

The first attempt (debounce + rAF retry) still raced the throttled, `share()`d `renderCodeMap$`
stream. Loading a `.gz` file runs a CPU-heavy **synchronous** `pako.ungzip` on the main thread
(`readFiles.ts:28` / `urlExtractor.ts:46`), which perturbs the async scheduler so the render's
trailing edge reliably fires *before* the effect's `take(1)` subscribes → the fit was never called
(consistent for gz, intermittent for plain files).

**Fix:** stop racing a stream. Emit a deterministic signal `ThreeSceneService.mapMeshChanged$` at the
end of `setMapMesh` (the single point a new mesh enters `mapGeometry`), and have the effect
`switchMap(() => mapMeshChanged$.pipe(take(1)))`. Requests always arrive before the mesh swap, so the
subscription is in place ahead of the emission regardless of scheduler timing. Dropped the
`debounceTime(0)` and the `RenderCodeMapEffect` dependency.

## Notes

- Root cause is timing/orchestration introduced by `869e5d00d`, not the fit math.
- The `requestAnimationFrame` retry in `autoFitTo()` is kept as cheap defense-in-depth; with the
  deterministic mesh signal the geometry is already in the scene when it runs.
