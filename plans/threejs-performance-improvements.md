---
name: Three.js Performance Improvements
state: complete
version: 1
---

## Goal

Fix memory leaks, reduce GPU upload overhead, and optimize raycasting in the Three.js rendering pipeline.

## Tasks

### 1. Fix memory disposal chain
- Remove TODO in codeMapMesh.dispose(), it now disposes mesh geometry + material
- Dispose readBuffer/writeBuffer in customComposer.dispose()
- Remove duplicate dispose() call in threeViewer.destroy()
- Dispose geometry/material in arrow service clearArrows()
- Replace alignment cube with Vector3 math in threeMapControls
- Dispose floor label geometry/material/texture before clearing

### 2. Partial buffer updates for hover highlighting
- Track dirty vertex range (min/max) in setVertexColor()
- Use addUpdateRange/clearUpdateRanges in updateVertices() for partial GPU uploads

### 3. Optimize raycasting
- Pre-compute scaled bounding boxes in setScales() instead of per-frame cloning
- Reuse single Vector3 for intersection target
- Replace O(N) getBuildingByPath with Map lookup

### 4. Guard stats rAF loop
- Skip animateStats() entirely when not in dev mode

## Steps

- [x] Complete Task 1: Fix memory disposal chain
- [x] Complete Task 2: Partial buffer updates
- [x] Complete Task 3: Optimize raycasting
- [x] Complete Task 4: Guard stats rAF loop
- [x] Verify: unit tests pass (355/356 suites, 1 unrelated SIGSEGV)
- [x] Verify: production build succeeds

## Notes

- Three.js 0.182 API: BufferAttribute.addUpdateRange(start, count) uses array element indices (vertex index * itemSize)
- The alignment cube was only used to compute a world-space offset from the control target; replaced with direct Vector3 addition
