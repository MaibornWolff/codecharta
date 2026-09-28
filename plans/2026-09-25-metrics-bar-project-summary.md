---
name: Metrics bar shows the project summary when nothing is hovered or selected
issue: -
state: complete
version: -
---

## Goal

With nothing hovered or selected, the metrics bar shows the whole project's (or focused folder's) totals under
area, height and colour again — in every layout, including after a reload into a radial layout.

## Tasks

### 1. Reproduce with tests
- Unit: NodeSelectionService falls back to the map root / focused folder without any 3D layout nodes
- E2E: after a reload in the sunburst layout the metrics bar still shows the totals

### 2. Fix
- Derive the fallback from the accumulated map (focused node, else root) via a selector instead of
  running the 3D layout, which yields nothing for radial layouts and never re-ran on a layout switch

## Steps

- [x] Complete Task 1: Reproduce with tests
- [x] Complete Task 2: Fix
- [x] Full check set (no changelog entry: the bug never reached a release)

## Notes

- Regression since the radial layouts (#4560): `CodeMapRenderService.getNodes` returns `[]` for them.
- Also dropped the render-`Node` branches in the metric value components, the dead `CodeMapRenderService`
  stubs in 17 metrics-bar specs and the now unused facade export.
- Verified: unit suite (969 suites, coverage gate), metrics-bar e2e against a fresh build, tsc, biome, depcruise, knip.
