---
name: fix-autofit-direction-clamp
issue: <#issueid>
state: complete
version: 1
---

## Goal

Fitting the camera after a map/scenario change sometimes yields an oblique "tilted diamond" view
instead of the canonical front pose. Root cause: `fitCameraToBoundingSphere` calls
`controls.update()` between placing the camera and updating `controls.target` / zoom limits, so
OrbitControls clamps the fresh position against the PREVIOUS map's `min/maxDistance` and target,
dragging it off-axis; `setZoomPercentage(140)` then locks the skewed direction in. Triggers when
the new intended pose lies outside the old distance window (map ≳3–4× larger, or target panned far).

The earlier fix (`mapMeshChanged$` + rAF retry, plan `fix-intermittent-autofit-diamond`) solved the
separate "fit never fires" race and is kept.

## Tasks

### 1. Reorder `fitCameraToBoundingSphere`
- Assign the new `min/maxDistance` and target (via `focusCameraViewToCenter`) BEFORE the single
  `controls.update()`; drop the mid-sequence `updateControls()` whose only lasting effect is the
  stale clamp.

### 2. Regression test
- In `threeMapControls.service.spec.ts`, with a real `MapControls`: fit a small map, then a 10×
  larger one; assert the view direction equals a fresh fit of the large map.

## Steps

- [x] Complete Task 1: reorder the fit
- [x] Complete Task 2: regression test, run the affected specs (full unit suite green; test
      confirmed red against the old order)

## Notes

- Verified headlessly against three r182 `MapControls`: stale-order gives azimuth −108.9° instead of
  0°; reordered gives 0.0°/58.9° identical to a fresh fit.
- Compass (view cube) is a bystander: it only orbits `controls.target`, so it inherits whatever the
  last fit left behind.
