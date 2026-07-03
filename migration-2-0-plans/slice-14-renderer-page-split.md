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
- **`attributeTypes` source home for the CF#1 cycle-break = POSTPONED** (user, 2026-07-03). This blocks
  sub-slice **14c** (see below). The three candidates — move to fileStore/`files` identity layer
  (ADR-12-aligned, parity-trivial), a new structure lens owns it, or keep it metrics-lens-owned (forces
  the riskier structure-map split) — interact with the just-hardened `lens-owns-ccjson-source` rule and
  are deferred to a dedicated decision.

## The CF#1 keystone, reframed (lower-risk than the roadmap implied)

The `lens.valueOf → idToNode → accumulatedData → metricsLens.facade → lens` cycle is a **latent
module-import cycle**, not a data cycle. The lens edge is a **single import**:
`accumulatedData.selector.ts:10` pulls `attributeTypesSelector` through the metrics-lens facade, and
`attributeTypes` is already a **leaf root-state slice** that reads nothing downstream. So **relocating its
source off the metrics lens breaks the cycle with ZERO change to id assignment, decoration order, cloning,
memoization, or object identity** (parity-trivial) — no risky "move the id decorator" surgery. The catch:
it *reverses part of Slice 9a* and touches `lens-owns-ccjson-source` → that is the **postponed** decision
above, so 14c waits on it.

## Sub-slice ladder (risk-graded)

| | What | Risk | Verified by | Autonomous? |
|---|---|---|---|---|
| **14a** ✅ | Author `lens-no-view-state` at **error** (0 violations verified across all 15 lens files) | trivial | `lint:architecture` self-verifies | yes |
| **14b** | Name the `RendererEngine` seam (`load·highlight·settings` + `onSelect$/onHover$`) wrapping the existing render/scene services — contract-only, files stay put (DoD #8) | low, structural | render snapshots zero-diff | yes |
| **14c** | Break the CF#1 cycle: relocate the `attributeTypes` source off the metrics lens (parity-trivial) → unblocks `valueOf` | med | unit value-parity | **BLOCKED on the postponed attributeTypes-home decision** |
| **14d** | metrics-lens `valueOf(id)` + extract the **structure lens** (tree + `idToNode`) | high | parity tests + zero snapshot | review-gated |
| **14e** | renderer-agnostic id (PATH) → **sharedView**, selection promotion (+ optional survives-reload) | high/XL | parity + **user e2e + manual smoke** (hover/select not snapshot-covered) | needs user smoke |
| later | Graph/LSM renderer + `graphState` + physical `renderers/` move + engine settings-inversion + `renderer-engine-stays-dumb`/`page-uses-engine-public-api` → error | XL | needs renderer #2 | separate slice |

## Steps
- [x] 14a: author `lens-no-view-state` at error (0 violations)
- [ ] 14b: `RendererEngine` contract seam (contract-only, snapshot-safe)
- [ ] 14c: CF#1 cycle-break — **blocked** on the postponed `attributeTypes`-home decision
- [ ] 14d: metrics-lens `valueOf(id)` + structure-lens extraction (behavioral; parity tests)
- [ ] 14e: renderer-agnostic PATH id → sharedView + selection promotion (behavioral; user e2e + manual smoke)

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
  user's Playwright e2e + manual side-by-side vs `main` (CONVENTIONS "Not covered" row). Autonomous work
  stops after 14b; 14c is gated on a decision; 14d/14e resume with the user in the loop.
- **Two distinct id-spaces** must not be conflated: the state-facing node id (moving to PATH) vs the mesh
  `building.id` instance index (stays `number`, render-order-coupled, `codeMapMesh.setInstanceColor`).
- **IndexedDB migration** for the id move: null the number-valued `selectedBuildingId`/`hoveredNodeId`/
  `rightClickedNodeData` (cheapest, matches today's drop-on-rehydrate) — a v13 record transform.
- Rollback: each sub-slice is its own commit; 14a reverts as a one-line rule removal.
