---
name: Three.js Map Performance PRD
issue:
state: progress
version: 1
---

## Goal

Achieve smooth 120fps interaction (8ms frame budget) for Three.js map rendering with up to 50k nodes. The main pain points are hover/highlight lag, camera orbit/pan jank, and general interaction sluggishness on large maps. This PRD covers only the Three.js rendering pipeline — no Angular/ngrx scope.

## Current Bottlenecks

### 1. ~~Raycast: O(N) linear scan every mousemove~~ ✅ Fixed (Phase 1a)
BVH spatial index implemented. Mousemove debounce removed for smoother hover response.

### 2. ~~Highlight: O(N) color update every hover~~ ✅ Fixed (Phase 1b + 2a)
Differential highlight (Phase 1b) + InstancedMesh (Phase 2a) — now 1 instance color write per changed building (6 floats) instead of 24 vertices × N buildings.

### 3. Geometry rebuild: fully CPU-side, blocks main thread
`GeometryGenerator.build()` allocates and fills large `Float32Array` buffers synchronously. At 50k nodes: ~50k × 24 vertices × ~500 typed-array writes = ~12M writes on the main thread. This blocks camera controls during rebuild.

### 4. Camera drag: render + highlight contention
`MapControls` fires `change` events on every drag frame, each calling `threeRendererService.render()`. If a hover highlight or label layout is also running, the frame overshoots 8ms and drag feels laggy.

## Performance Targets

| Scenario | Map size | Target |
|---|---|---|
| Hover highlight (raycast + color update + render) | 20k nodes | < 4ms |
| Hover highlight | 50k nodes | < 8ms |
| Camera orbit/pan (render only) | 50k nodes | < 4ms |
| Full geometry rebuild | 20k nodes | < 100ms (off main thread) |
| Full geometry rebuild | 50k nodes | < 300ms (off main thread) |

## Measurement Methodology

### Tooling
- **Chrome DevTools Performance tab**: Record 5-second traces of hover interaction and camera drag on reference maps
- **`performance.mark()` / `performance.measure()`**: Instrument key code paths:
  - `perf:raycast` — around `CodeMapGeometricDescription.intersect()`
  - `perf:highlight` — around `CodeMapMesh.highlightBuilding()` + `updateVertices()`
  - `perf:geometry-build` — around `GeometryGenerator.build()`
  - `perf:render-frame` — around each `requestAnimationFrame` callback in `ThreeRendererService`
- **`Stats.js`** panel in dev mode (already exists) for live FPS monitoring

### Reference Maps
Create or identify test `.cc.json` files at three tiers:
- **Small**: ~2k nodes (baseline, should be near-instant)
- **Medium**: ~10k nodes (must be smooth)
- **Large**: ~30-50k nodes (target tier)

### Before/After Protocol
1. Record 3 traces per scenario per map tier (hover sweep, camera orbit, full rebuild)
2. Extract P50/P95 frame times from each trace
3. Compare before/after for each phase

## Tasks

### Phase 1: Quick wins — BVH raycast + differential highlight

**1a. BVH spatial index for raycasting**
- Build a Bounding Volume Hierarchy (BVH) from the pre-computed `scaledBoxes` array
- Rebuild the BVH only on scale changes (`setScales()`) or full re-render, not per frame
- Replace the linear scan in `intersect()` with BVH traversal — expected O(log N)
- Consider a simple binary split (SAH or midpoint) since boxes are axis-aligned and static between rebuilds
- Three.js ships `three-mesh-bvh` as a community package, but a custom flat-array BVH may be simpler for AABB-only queries

**1b. Differential highlight — only update changed buildings**
- Track `previouslyHighlightedIds: Set<number>` and `previouslyDimmedIds: Set<number>` in `CodeMapMesh`
- On `highlightBuilding()`, compute the diff: which buildings gained highlight, which lost it, which stayed the same
- Only call `setVertexColor()` for changed buildings (typically 2–50 buildings, not N)
- Keep the `dirtyRange` partial GPU upload — it will now cover a much smaller span
- Cache `ColorConverter.getVector3()` results to avoid per-building hex→RGB conversion

**1c. Camera drag priority**
- During active camera drag (MapControls `start`/`end` events), skip hover raycasting and label layout updates
- Resume hover processing on drag `end` with a single raycast at the current mouse position
- This ensures drag frames only pay for `controls.update()` + `renderer.render()` (~1-2ms)

### Phase 2: GPU instancing prototype

**2a. InstancedMesh approach**
- Create a single `BoxGeometry(1, 1, 1)` template
- Use `InstancedMesh` with instance attributes: position, scale (width/height/depth), color, deltaColor
- Instance matrix encodes per-building translation + non-uniform scale
- Port the vertex/fragment shaders to read from instance attributes instead of per-vertex attributes
- Highlight becomes: update the instance color attribute for changed instances only (one write per building, not 24 writes per vertex)
- Expected wins: faster rebuilds (fill instance buffers, not vertex buffers), lower memory (shared geometry), faster color updates

**2b. Feature-flag toggle** _(deprioritized — InstancedMesh is now the only path)_
- Skipped: the old single-mesh path was fully replaced rather than kept behind a flag
- A/B comparison can be done via git (compare against commit before InstancedMesh)

**2c. Shader adaptation**
- InstancedMesh requires `USE_INSTANCING` in the vertex shader
- Per-instance color via `InstancedBufferAttribute` on `instanceColor` / custom attributes
- Lighting model stays the same (vertex-level Phong)
- Z-fighting fix for top faces needs adaptation for instanced transforms

### Phase 3: Web Workers for geometry + layout

**3a. Offload geometry buffer generation**
- Move `GeometryGenerator.build()` logic into a Web Worker
- Worker receives: flat node array (position, size, color values) as transferable `ArrayBuffer`
- Worker outputs: filled `Float32Array` buffers as transferable `ArrayBuffer`s
- Main thread wraps returned buffers into `BufferAttribute` and attaches to mesh
- Zero-copy via `Transferable` — no serialization overhead

**3b. Offload layout algorithms**
- Move `SquarifiedTreeMap`, `StreetMap`, `TreeMapStreet` layout computation to a worker
- Input: node tree structure + metric values
- Output: flat array of positioned/sized nodes
- Can reuse the same worker or a dedicated layout worker

**3c. Progressive rendering**
- While the worker computes, show a loading indicator or the previous map
- On worker completion, swap the mesh in a single frame (already how `setMapMesh()` works)
- Camera controls remain responsive during the rebuild since the main thread is free

**Future exploration (not in scope)**
- **OffscreenCanvas**: Move the entire Three.js renderer to a worker. High complexity, marginal benefit since rendering itself is fast (single draw call). Revisit if rendering becomes a bottleneck.
- **LOD / frustum culling**: At 50k+ nodes, skip buildings outside the camera frustum or below a size threshold. Worth exploring if Phase 1-3 don't meet targets.
- **GPU-side raycasting**: Compute raycast in a fragment shader with color-picking. Only worth it if BVH is still too slow.

## Steps

- [ ] Add `performance.mark/measure` instrumentation to key code paths
- [ ] Create/identify reference test maps at 2k, 10k, 30-50k node tiers
- [ ] Record baseline traces for hover, camera drag, and full rebuild
- [x] Phase 1a: Implement BVH spatial index in `CodeMapGeometricDescription`
- [x] Phase 1b: Implement differential highlight in `CodeMapMesh.highlightBuilding()`
- [ ] Phase 1b: Cache `ColorConverter.getVector3()` results
- [x] Phase 1c: Skip hover raycast + label layout during camera drag
- [ ] Record Phase 1 traces, compare against baseline
- [x] Phase 2a: Implement `InstancedMesh` rendering path
- [x] Phase 2b: ~~Feature-flag toggle~~ Skipped — old path fully replaced, A/B via git history
- [x] Phase 2c: Adapt shaders for instanced rendering
- [ ] Record Phase 2 traces, compare against Phase 1
- [ ] Phase 3a: Move geometry buffer generation to Web Worker
- [ ] Phase 3b: Move layout algorithms to Web Worker
- [ ] Phase 3c: Add progressive rendering (loading state during worker computation)
- [ ] Record Phase 3 traces, verify targets met
- [ ] Final comparison report: baseline vs Phase 1 vs Phase 2 vs Phase 3

## Notes

- The single draw call architecture is already very GPU-efficient. The bottlenecks are CPU-side.
- The dirty-range partial GPU upload (from the previous perf sprint) is a good foundation — Phase 1b makes it even more effective by shrinking the dirty range.
- `subGeomIdx` attribute was removed during InstancedMesh refactor — instance index is implicit.
- Three.js 0.182 (current) has good `InstancedMesh` support including `InstancedBufferAttribute` for custom per-instance data.
- Web Workers with `Transferable` ArrayBuffers give zero-copy transfer — the main thread doesn't even touch the data during build.

## Phase 2 implementation notes

- InstancedMesh required `frustumCulled = false` because Three.js computes bounding sphere from template geometry only (unit box), not instance matrices.
- Material must be passed as single `Material`, not `Material[]` — InstancedMesh with a material array but no geometry groups renders nothing.
- `threeSceneService.ts` had 4 locations accessing `mesh.material` as an array (for floor label coloring) — guarded with `Array.isArray()`.
- `toExportMesh()` on `CodeMapMesh` lazily expands instance data to standard BufferGeometry for 3D print export compatibility.
- Removed `debounce(1ms)` from mousemove handler — the `setTimeout` minimum ~4ms resolution was adding unnecessary hover latency. `render()` already coalesces via `requestAnimationFrame`.
- All 359 test suites (1929 tests) pass.
