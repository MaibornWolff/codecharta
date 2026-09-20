---
name: incremental-map-render
issue: <none>
state: complete
version: unreleased
---

## Goal

Make a setting change cost what it changed, not what the map contains. Today all 39 actions in
`actionsRequiringRerender` run the same full pipeline — layout over every node, a fresh
`CodeMapMesh`, new GL buffers, labels and arrows rebuilt — even when only a label size or an edge
toggle moved.

Measured on a synthetic 50,101-node map (Chromium/SwiftShader, after the dispose fix on
`fix/dispose-map-mesh-on-rerender`): **~1.1 s of blocked main thread and 4.8 MB of GPU upload per
setting change**. The mesh is already an `InstancedMesh`, so the instance count only has to change
when the visible node set does — every other action can be an in-place buffer update.

## Tasks

### 1. Declare what each action invalidates

- Add a `RenderInvalidation` type: `layout`, `transforms`, `colors`, `labels`, `arrows`.
- Map every action in `actionsRequiringRerender.ts` to its invalidation. Anything unmapped, and
  `setState`, invalidate everything — unknown must be safe, not fast.
- The classification the code supports today:
  - **labels only** — `setAmountOfTopLabels`, `setLabelSize`, `setLabelMode`, `setLabelsPerMap`,
    `setShowMetricLabelNodeName`, `setShowMetricLabelNameValue`, `setEnableFloorLabels`,
    `setGroupLabelCollisions`
  - **arrows only** — `setEdgeMetric`, `setEdgeHeight`, `setAmountOfEdgePreviews`,
    `setShowIncomingEdges`, `setShowOutgoingEdges`
  - **colors only** — `setColorMetric`, `setColorMode`, `setColorRange`, `setMapColors`,
    `invertColorRange`, `invertDeltaColors`, `setMarkedPackages`, `markPackages`, `unmarkPackage`,
    `setColorLabels`, `setIsWhiteBackground`
  - **transforms only** — `setHeightMetric`, `setInvertHeight`, `setScaling`
  - **layout + transforms** — `setAreaMetric`, `setInvertArea`, `setMargin`
  - **full rebuild (node set changes)** — `setSearchPattern`, `focusNode`, `unfocusNode`,
    `setAllFocusedNodes`, `unfocusAllNodes`, `setHideFlatBuildings`, `setShowOnlyBuildingsWithEdges`,
    `setMaxTreeMapFiles`, `setState`
  - **verify first** — `setLayoutAlgorithm`. `StreetLayoutGenerator` draws folders as streets rather
    than buildings, so the instance count probably differs from the treemap's. Full rebuild unless
    the node set proves identical.
- The stages are not independent, because labels sit on building tops and arrows join building
  positions. Propagate: `layout ⇒ transforms`, `transforms ⇒ labels + arrows`, `colors ⇒ labels`
  (colour labels are filtered by colour category). Without this a "transforms only" height change
  leaves labels floating at old heights. Check against `setLabels(this.unflattenedNodes)` and
  `setArrows(visibleSortedNodes)` — `codeMap.render.service.ts:193,243`.
- The table above is a hypothesis. Verify each entry against its reducer rather than its name; a
  wrong entry shows up as a stale map, not as a failure.

### 2. Split the render service into stages

- `CodeMapRenderService.render()` currently calls layout → mesh → colour selector → labels → arrows
  unconditionally. Break it into stages each runnable alone, behind the existing `RendererEngine`
  contract.
- Keep the laid-out `Node[]` as service state so a colour- or label-only update reuses it instead of
  re-running `getNodes()`.

### 3. Make CodeMapMesh updatable in place

- Add `updateTransforms(nodes)` and `updateColors(nodes)` writing into the existing
  `InstancedBufferAttribute`s and `instanceMatrix`, setting `needsUpdate` and reusing the update-range
  machinery already in `updateVertices`.
- Reallocate only when the instance count changes; otherwise the same buffers are reused, so the
  4.8 MB re-upload disappears for everything but a node-set change.
- First settle the instance order. The mesh is built from `visibleSortedNodes`, sorted by height
  descending, so instance *i* is a different node after a height-metric change and all 50k matrices
  plus `idToBuilding` have to be rewritten anyway — that saves the allocation but not the upload.
  Find out why the sort exists (draw order? top-N labels?) and whether instance order can be pinned
  to node id, so a height change touches only the Y scale.
- `CodeMapMesh.setScale()` already exists (`codeMapMesh.ts:125`); check whether `setScaling` needs
  any transform rewrite at all.
- `CodeMapGeometricDescription` and `idToBuilding` must be refreshed in step with the buffers, or
  picking and the inspector point at stale buildings.

### 4. Route the effect through the invalidation

- `renderCodeMap.effect.ts` currently pairs `accumulatedDataSelector` with any rerender action and
  calls `load()`. Carry the action's invalidation through instead, and merge invalidations that
  coalesce inside one throttle window.
- Keep the existing `throttleTime` and the catch-up render on a stale metrics view.

### 5. Stop the render path dispatching into its own store

- `getNodesMatchingColorSelector` → `uncheckEmptyColorLabels` → `setColorLabels`, which is itself a
  rerender action, so an empty colour category costs a second pass. Compute the counts without
  dispatching, or dispatch outside the render stage.

### 6. Keep the remaining full rebuild off the main thread

- After steps 1–5 a full rebuild only happens on focus, blacklist, layout-algorithm and file load.
  Re-measure it; those paths are spinner-covered, so this step is only worth doing if the freeze is
  still visible.
- If it is: run layout and buffer generation in a worker and transfer the typed arrays. Do not start
  here — it hides the cost instead of removing it.

### 7. Tests and measurement

- Unit: one test per invalidation class asserting the stages a given action runs — the guard against
  a misclassified action.
- Unit: instance count unchanged ⇒ no new `InstancedMesh`; instance count changed ⇒ new one, old one
  disposed.
- E2E: a colour change, a label change and a focus change each leave the map correct.
- Measure by hand (no CI gate, by decision): the harness is a throwaway Playwright script that wraps
  `createBuffer`/`deleteBuffer`/`bindBuffer`/`bufferData` on `WebGL2RenderingContext.prototype` with a
  `WeakMap` of sizes, plus a `PerformanceObserver` on `longtask`, driven against a generated
  50k-node cc.json. Re-run it after each task and record the numbers here.

## Steps

- [x] Complete Task 1: Declare what each action invalidates
- [x] Complete Task 2: Split the render service into stages
- [x] Complete Task 3: Make CodeMapMesh updatable in place
- [x] Complete Task 4: Route the effect through the invalidation
- [ ] Complete Task 5: Stop the render path dispatching into its own store — left open, see Notes
- [ ] Complete Task 6: Keep the remaining full rebuild off the main thread — not needed, see Notes
- [x] Complete Task 7: Tests and measurement

## Review Feedback Addressed

1. **Stage independence**: labels sit on building tops and arrows join building positions, so the
   stages propagate (`geometry ⇒ colors ⇒ labels`, `geometry ⇒ arrows`) rather than being
   independent flags. Caught before implementation.
2. **Instance order**: the plan asked why the height-descending sort exists before pinning instance
   order. It exists only for `sortedNodes[0].height` in `setLabels`, but pinning was not needed —
   see Notes.

## Outcome

Pipeline time around `CodeMapRenderService.load`, 50,101-node map, Chromium/SwiftShader:

| action | before | after |
| --- | --- | --- |
| top-labels change | 133 ms | 11 ms |
| colour metric | 125 ms | 59 ms |
| area metric | 115 ms | 112 ms |
| height metric | 112 ms | 114 ms |

A geometry change also stopped allocating and freeing 4.8 MB of GL buffers per change: the live
buffer bytes stay flat and the new layout goes in through `bufferSubData`. An in-place recolour was
pixel-identical to the same map rebuilt from scratch (only the metric bar's focus ring differed).

## Notes

- Baseline to beat, 50,101 nodes, area-metric change: 1089 ms long task, 4.8 MB uploaded. Labels- and
  arrows-only actions should reach roughly zero; colour and transform changes should drop to the cost
  of writing one attribute.
- Prerequisite, already committed on `fix/dispose-map-mesh-on-rerender`: the mesh a re-render replaces
  is now disposed. That bounds the memory but leaves all of the churn this plan removes.
- SwiftShader is a software rasterizer, so the absolute millisecond figures are pessimistic against a
  real GPU. The upload volume and the long-task structure are not.
- `createTemplateBoxGeometry()` builds a fresh geometry per mesh, so nothing is shared between meshes
  and disposing on reallocation is safe.
- **`transforms` was folded into `geometry`.** Node heights and footprints both come out of the
  layout, so no transform change can skip it. `setScaling` turned out to scale the whole map group,
  not the instances, so it needs no mesh work at all and only invalidates labels and arrows.
- **The height-descending sort was kept.** Its only consumer is `sortedNodes[0].height` in
  `setLabels`, so instance order could be pinned — but it was not needed: a geometry change re-runs
  the layout anyway, and `canUpdateInPlace` compares paths per index, which the sort leaves stable
  for everything but a height change.
- **The BVH was rebuilt on every render.** `scaleHeight()` calls `setScales()` unconditionally, and
  that rebuilt the scaled boxes and the whole BVH whether or not anything moved. Now guarded by a
  dirty flag. It did not move the measured numbers, but it is a pass over every building.
- **Task 6 (worker) is not worth doing.** The measured "≈1.1 s of blocked main thread" that motivated
  this plan was mostly SwiftShader rasterising a frame: a camera drag, which runs none of the
  pipeline, costs ~780 ms per frame in the same setup. The real pipeline was ~115 ms. On a real GPU
  the draw is cheap and 115 ms is the number that matters — not worth a worker and its transfer
  costs. Re-measure on real hardware before reconsidering.
- **Task 5 was left open**: `getNodesMatchingColorSelector` still dispatches `setColorLabels`
  through `uncheckEmptyColorLabels`. It is a correctness/clarity fix, independent of this work, and
  mixing it in would have put a behavioural change in a performance commit.
- Gates at commit `bf98176e1`: biome, tsc, depcruise/knip/styles, 450 unit suites, 90 e2e.
