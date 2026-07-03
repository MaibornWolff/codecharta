---
name: viz-2.0-slice-14-renderer-page-split
issue:
state: progress
version: 1
---

## Goal

The roadmap's last big slice: stand up the **renderer/page seam**, the **structure lens**, and the
**renderer-agnostic selected-node id**, so lenses are certified never to read view state and a second
renderer (Graph/LSM) can later mount unchanged. Scoped by a **2-agent + design-intent investigation**
(2026-07-03) that verified every claim against code. Most of the design is already ratified in ADR 12 +
`Ideas/codecharta-2.0-refined-layers-and-state-homes.html` + the roadmap; this plan records what is
**decided**, the **two open decisions**, and a **risk-graded sub-slice ladder**.

## Already decided (do NOT re-litigate)

- **Node-id scheme** = `sha-256(canonical path)`, first 16 hex (ADR 12 + `analysis/.../NodeId.kt:50-61`,
  reproduced: `sha256('/')=8a5edab282632443` = the root id in a sample). The viz already ingests this
  string id in cc.json 2.0 (`model/ccjson2.model.ts:44-47`) but **drops it at load**
  (`ccJson2ToCCFile.ts:54-72`) and overwrites with the ordinal `id++` (`util/nodeDecorator.ts:33-36`).
- **Engine contract names** = `load · highlight · settings` + `onSelect · onHover` (frozen); signatures +
  the dumb-engine wrapper deferred to renderer #2 (DoD #8 = "contract only").
- **Layering** = `page` is the top composing layer; the engine stays **inside** the codeMap feature; no
  top-level `renderers/` folder, no `shell/`. The page-wire is deferred to renderer #2.
- **Structure lens** = a read-only projection of cc.json `files` owning the tree + `id→node` resolution.
- **Graph/LSM renderer + `graphState` + `edgeMetric` promotion** = a **later** slice (CF #6); NOT Slice 14.

## Decisions taken (2026-07-03, user)

- **Selected/hovered/right-clicked node id representation = canonical PATH in-app, sha-16 at the
  serialization/cross-tool boundary.** Path matches `focusedNodePath`/`blacklist`, `getBuildingByPath`
  already exists (`codeMapGeometricDescription.ts`), works for both 1.5 and 2.0, and is stable across
  re-parse/blacklist/`mergeFolderChain`/reload where the ordinal is not (which is why
  `loadInitialFile.store.ts:366-372` throws the ordinal away on rehydrate today). The sha-16 cc.json-2.0
  id is computed only when persisting or doing a cross-tool jump (it is provably `sha-256(path)`, so path
  is the 1:1 pre-image). **Root-prefix trap:** viz path is `/root/…`, the analysis canonicalPath excludes
  the synthetic root — strip `/root` (or use `NodeId.fromEndpoint`) before hashing.
- **`attributeTypes` stay LENS-owned — NOT fileStore** (user, 2026-07-03). Per ADR 12 (`lenses.metrics` =
  attributes/descriptors/types/clusters; `lenses.dependency` = edges + edge attribute types/descriptors),
  `attributeTypes` are lens data, because *the lens that holds the metric/dependency data owns its types*:
  - **node** `attributeTypes` → **metrics lens** — already there (`state.metricsLensSource`, Slice 9a). No move.
  - **edge** `attributeTypes` → **dependency lens** — **✅ DONE (2026-07-03)**: re-homed out of the metrics
    lens's `state.metricsLensSource` into a new **`state.dependencyLensSource`** root (the twin of
    `metricsLensSource`), with `dependencyLens.facade`/`.load.facade`, the effect splitting node/edge at load,
    the applier + IndexedDB `v12→v13`, and `lens-owns-ccjson-source` extended to fence it (still error, 0
    violations). Value-identical: 45/45 snapshots zero-diff. See CARRIED-FORWARD item #2d.

  This **vindicates the just-hardened `lens-owns-ccjson-source` rule** (no walk-back) and **retires the
  "move to fileStore" idea** (it traced to a now-stale comment in `attributes.selectors.ts`, since fixed).

## The CF#1 keystone — the fix is RELAYERING, not relocation

The `lens.valueOf → idToNode → accumulatedData → metricsLens.facade → lens` cycle is a **latent
module-import cycle** from a **single import**: `accumulatedData.selector.ts:10` pulls
`attributeTypesSelector` through the metrics-lens facade. The tempting "parity-trivial" fix was to relocate
`attributeTypes` off the lens (e.g. to fileStore) — but the ratified decision says **`attributeTypes` stay
lens-owned** (ADR 12), so **that fix is off the table** (cheap but architecturally wrong; it would diverge
the in-app state from the `{files, lenses}` model and walk back `lens-owns-ccjson-source`).

The **architecturally-correct** cycle-break is to **relayer**: `accumulatedData`/the aggregation is a
*composing-layer* concern that belongs **above** the lenses (the refined doc: `accumulatedData`/`idToNode`
are "computed selectors owned by the page/lens layer, not state at all"). A reader *above* the lenses reads
`attributeTypes` **downward** with no cycle, and `valueOf(id)` reads the metric value from the metrics
lens's own id-keyed attributes (2.0 "attributes keyed by id"), **not** from the downstream-decorated
`idToNode`. So the CF#1 break folds into the **structure-lens / composing-layer relayering of 14d** — it is
NOT a standalone relocation. **14c (the old "relocate attributeTypes" sub-slice) is retired**; its intent
merges into 14d.

## Sub-slice ladder (risk-graded)

| | What | Risk | Verified by | Autonomous? |
|---|---|---|---|---|
| **14a** ✅ | Author `lens-no-view-state` at **error** (0 violations verified across all 15 lens files) | trivial | `lint:architecture` self-verifies | yes |
| **14b** | Name the `RendererEngine` seam (`load·highlight·settings` + `onSelect$/onHover$`) wrapping the existing render/scene services — contract-only, files stay put (DoD #8) | low, structural | render snapshots zero-diff | yes |
| ~~14c~~ | ~~relocate `attributeTypes`~~ **RETIRED** — attributeTypes stay lens-owned (ADR 12); the CF#1 break is relayering, folded into 14d | — | — | — |
| **14d** ✅ | Relayer `accumulatedData`/aggregation above the lenses (breaks CF#1) + composing-layer `valueOf(id)` + extract the **structure lens** (tree; `idToNode` ownership → 14e) | high | parity tests + zero snapshot | review-gated (done) |
| **14e-1** | promote `hoveredNodeId`/`selectedBuildingId`/`rightClickedNodeData` `state.mapState → state.sharedView`, **keeping them number-typed** (pure home-move, mirrors Slice 8/9) | med | snapshots zero-diff + dep-cruiser | **yes** (snapshot-verifiable) |
| **14e-2** | retype those ids ordinal `number → PATH string`; set-sites emit `node.path`, read-sites resolve via a new `pathToNode` / `getBuildingByPath`; reconcile `IdToBuildingService` + `arrow.service`; v14 nulls the moved ids | high | parity + snapshots + **e2e + screenshot smoke** | yes (I run e2e + screenshot) |
| **14e-3** | NodeDecorator id/metric split + promote `idToNode`/`valueOf` onto the structure/metrics lenses (owns the CF#1 cycle) | high/XL | parity + snapshots | later |
| later | Graph/LSM renderer + `graphState` + physical `renderers/` move + engine settings-inversion + `renderer-engine-stays-dumb`/`page-uses-engine-public-api` → error | XL | needs renderer #2 | separate slice |

**14e decomposition (scoped 2026-07-03 by a 4-area investigation — full map in the session).** Load-bearing facts:
`node.path` is assigned once at load (`decorateMapWithPathAttribute`, `fileParser.ts:91`) and is stable across
blacklist/mergeFolderChain/reload, so a PATH id needs no NodeDecorator change for the *selection* move — only 14e-3
(lens-owned decoration-independent `idToNode`) needs the id/metric split. **Two id-spaces coincide today and must
NOT be conflated:** the state-facing node id (→ PATH) vs the mesh instance index `building.id` (stays a `number` — it
is the `InstancedMesh` color-buffer offset, `setInstanceColor(building.id)`/`selected.id * NUMBER_OF_COLOR_FIELDS`).
The renderer already re-resolves selection by path (`threeSceneService.remapSelectedBuilding → getBuildingByPath`),
so the render side of 14e-2 is nearly free — the coupling to fix is `IdToBuildingService` (ordinal-keyed mesh map) +
`arrow.service.ts:26` (feeds the raw state id into it). **Top reshape hazard (14e-1):** `applySharedView`/
`mapSharedViewToAction` have NO ignore mechanism, but `ignoredMapStateKeys` makes these 3 keys no-op on load — so
14e-1 MUST add an `ignoredSharedViewKeys` guard or load would start restoring transient ids (a regression).
`scenarioApplier` needs no change (it never references these keys); `state.manager` already registers both roots.

## Steps
- [x] 14a: author `lens-no-view-state` at error (0 violations)
- [x] 14b: `RendererEngine` contract seam — `rendererEngine.contract.ts` interface + `CodeMapRenderService`
  implements the `load(model)` member (render + scaleMap); the render effect calls `load()` then requests
  a frame. **Note:** `load` lives ON `CodeMapRenderService` (already on the facade) rather than a separate
  engine class — a separate class tripped `feature-only-stores-can-import-ngrx-store` (onSelect$/onHover$
  need a store) and, via the facade re-export, a `no-circular` warning against the pre-existing
  render.service↔labelSettings cycle. `highlight`/`applySettings`/`onSelect`/`onHover` signatures stay
  deferred to renderer #2 (design-intent: names frozen, signatures deferred). 45/45 snapshots zero-diff.
- [x] ~~14c~~: **RETIRED** (2026-07-03) — attributeTypes stay lens-owned (node→metrics ✅ already;
  edge→dependency lens with CF #2). The CF#1 break is relayering, not relocation → merged into 14d.
- [x] 14d: relayer `accumulatedData`/aggregation above the lenses (breaks CF#1) + composing-layer `valueOf(id)`
  + structure-lens extraction. **DONE (2026-07-03)** — 3 commits:
  1. **`getDeltaFile` → `util/`** (structural) so the lens can build the tree without a `lenses/→state/` edge.
  2. **structure lens** (`lenses/structure/`) owns the undecorated unified tree (`structureTreeSelector` via
     `structure.facade`); `accumulatedData` becomes a pure composing selector reading it DOWNWARD, cloning it
     (memoized instance — must not mutate in place) and layering metrics + blacklist + the `{nodes,edges}`
     aggregation on the clone. The lens reads only the fileStore selection → clean under `lens-no-view-state`.
  3. **`valueOf(id, metric)`** (`state/selectors/accumulatedData/valueOf.selector.ts`) — the cycle-free
     per-node lookup, in the **composing layer** (next to `idToNode`), not the lens.
  **How CF#1 is broken:** the aggregation/id-decoration + `valueOf` now live ABOVE the lenses, so a per-node
  value lookup exists that no lens has to read back — and `new-must-not-import-legacy` (error) already forbids
  `lenses/ → state/`, so a lens literally cannot import `idToNode`/`accumulatedData`/`valueOf`; the cycle is
  structurally impossible today. 384 suites / 2312 passed, **45/45 snapshots zero-diff (no -u)**, tsc + biome +
  dep-cruiser clean (0 errors, 94 warnings unchanged).
  **Deliberately folded into 14e** (both need the PATH id to be safe/beneficial, so splitting them now is churn
  without payoff): (a) the **NodeDecorator id/metric split** — a metric-free structure pass is blocked today by
  the `blacklist-classify ↔ mergeFolderChain ↔ id-assignment` ordering entanglement, and a lens can't read
  `blacklist` even as a selector input (`lens-no-view-state`), so the structure lens can't own a
  decoration-independent `idToNode` until the PATH id (which is assigned pre-decoration); (b) **`valueOf` on the
  metrics lens facade** — needs the lens's own id-keyed attributes (the 2.0 PATH id surviving load); (c)
  **`idToNode` ownership → structure lens** — same PATH-id prerequisite. The `accumulatedData → metrics.facade`
  read is kept: it is a legal DOWNWARD edge, not part of any cycle (the cycle is broken by `valueOf` living above
  the lenses, not by removing that edge).
- [x] 14e-1 **DONE (2026-07-03)**: promoted the 3 interaction ids `mapState → sharedView`, number-typed (git-mv the 3
  store folders, reducer rewire, CQRS facade export move, selector root repoint, `ignoredSharedViewKeys` guard preserving
  no-op-on-load, dataMocks + specs, IndexedDB v13→v14 `migrateCcStateRecordToV14` nulling the moved ids). Structural,
  behavior-preserving: tsc (root, incl specs) + full suite (2317 tests, **45/45 snapshots zero-diff**) + dep-cruiser 0
  errors. Adversarial review: 1 defect (2 missed `SharedView` inline mocks) found + fixed. `building.id` mesh index untouched.
- [x] 14e-2 **DONE (2026-07-03)**: retyped ordinal `number → PATH string` — set-sites emit `node.path`; the 3 resolving
  selectors switched to a new `pathToNodeSelector`; `hoverNode(id)→hoverNode(path)`; `arrow.service` resolves via
  `getMapMesh().getBuildingByPath` (dropping `IdToBuildingService`, which STAYS ordinal-keyed for the mesh paths — the two
  id-spaces stay separate). No migration change (v14 already nulls). Verified: root tsc + **AOT prod build (strictTemplates)**
  + full suite (2317 tests, **45/45 snapshots zero-diff**) + dep-cruiser 0 errors. **WebGL hover/select highlight NOT
  runnable in the sandbox** (Playwright unsupported on arm64-ubuntu-26.04; chromium only via snap → no WebGL browser) — the
  pixel-level "correct building highlights" smoke is a manual check for the user.
- [ ] 14e-3 (later): NodeDecorator id/metric split; promote `valueOf`/`idToNode` onto the structure/metrics lenses.

## dep-cruiser rules
- `lens-no-view-state` — **added at error in 14a** (lenses must not import mapState/sharedView/preferences;
  0 violations — Slice 9b lifted the last view-state reads out of both lenses).
- `renderer-engine-stays-dumb` · `page-uses-engine-public-api` — **staged warn later**, flip to error only
  when the Graph renderer validates the seam (deferred with renderer #2).
- **Reconcile** `Ideas/dependency-cruiser.2.0.refined.cjs` (predates canonical numbering, still fences to
  `shell/` not `pages/`) against the live config before wiring any renderer rule — the roadmap's flip
  schedule is authoritative (roadmap:392-394).

## Notes / risks
- **Behavioural pieces (14d/14e) are NOT snapshot-covered for selection/hover/highlight** — they need the
  user's Playwright e2e + manual side-by-side vs `main` (CONVENTIONS "Not covered" row). 14d landed as a
  value-identical relayering that IS snapshot-covered (accumulatedData → render), so it verified autonomously
  (45/45 zero-diff); the selection/hover-touching pieces were deliberately kept out of 14d and folded into 14e,
  which resumes with the user running e2e + manual smoke. 14e stays the smoke-gated slice.
- **Two distinct id-spaces** must not be conflated: the state-facing node id (moving to PATH) vs the mesh
  `building.id` instance index (stays `number`, render-order-coupled, `codeMapMesh.setInstanceColor`).
- **IndexedDB migration** for the id move: null the number-valued `selectedBuildingId`/`hoveredNodeId`/
  `rightClickedNodeData` (cheapest, matches today's drop-on-rehydrate) — a v13 record transform.
- Rollback: each sub-slice is its own commit; 14a reverts as a one-line rule removal.
