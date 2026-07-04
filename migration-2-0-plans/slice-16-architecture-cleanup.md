---
name: viz-2.0-slice-16-architecture-cleanup
issue:
state: todo
version: 1
---

# Slice 16 — Architecture cleanup: to a zero-exemption, zero-cycle config

> **The migration is done (`state/` deleted, Slice 15); this slice makes the result actually CLEAN.** It is the
> post-migration debt sweep: break every circular dependency, fence the last state home, drop every grandfathered
> dep-cruiser exemption, delete duplicate read-wrappers, give `fileStore` zero upward deps, and fix the stale
> docs/rule-names Slice 15 left behind — ending with `no-circular` flipped to **error**. Inherits `CONVENTIONS.md`
> verbatim (snapshots ARE the behavior contract; structural `git mv` before behavioral; per-commit `tsc` + `npm test`
> zero-snapshot-diff + `lint:architecture`). Scoped 2026-07-04 by an 8-cluster code-grounded design + a completeness
> critic (both verified against the live `depcruise` output).

## Definition of "clean" (the DoD / invariants this slice reaches)
- **`npm run lint:architecture` → 0 errors, 0 warnings.** `no-circular` is at **error**; the graph has **no cycles**.
- **All 3 state homes fenced at error** — `mapState` joins `feature-reaches-state-home-only-via-facade` (only
  `sharedView`/`preferences` are fenced today).
- **Zero grandfathered exemptions** — the `feature-no-circular-dependencies-between-features` codeMap/viewCube carve-out
  is gone.
- **`fileStore` has zero upward runtime deps** — the last tolerated `fileStore → load/` edge is dropped.
- **`util/` is a genuine LEAF kernel** — it imports only `util/` + `model/` + node_modules, enforced by a NEW
  `util-is-a-leaf-kernel` rule at error. (Today util/ has NO outgoing-dep rule at all, which is why it silently
  accreted upward edges.)
- **No orphans, no stale rule/source comments, no misnamed rules, no duplicate read-wrapper classes.**
- Every commit: `tsc` clean + `npm test` **45/45 snapshots zero-diff** (structural) or parity + e2e (the one behavioral
  piece, streetLayout). No `-u`.

## The verified mess (current state, from a live `depcruise app` run)
**94 `no-circular` warnings + 1 `no-orphans` info, 0 errors.** The 94 split **73 / 19 / 1 / 1**:
- **73** inside `features/3dPrint/3DExports/3DPreview/` (one SCC) → **16a**
- **19** the `codeMap ↔ {viewCube, viewCubeToolbox, labelSettings, sidebarInspector}` cross-feature cluster → **16c**
- **1** `features/3dPrint/3DExports/generateXML/build3mfModelConfig.ts ↔ ../serialize3mf.service.ts` → **16b**
- **1** `util/algorithm/streetLayout/horizontalStreet.ts ↔ verticalStreet.ts` → **16b**

Plus: `mapState` un-fenced (5 raw `mapState/store/*.selector` importers) → 16d; `isDeltaState` ×3 identical wrappers →
16e; the last `fileStore → load/` edge → 16f; `index.d.ts` orphan + stale `state/` comments + the `new-must-not-import-legacy`
misnomer → 16g. **`fileStore` runtime is ALREADY clean** — its `renderModel`/home imports are all spec-only (exempt).

**`util/` is NOT a leaf today** (4 source files reach UPWARD, invisible because no rule fences util's outgoing deps) → **16i**:
`util/algorithm/treeMapLayout/treeMapHelper.ts` → `renderModel.facade` + `lenses/dependency` (edges);
`util/algorithm/streetLayout/streetViewHelper.ts` → `renderModel.facade`; `util/getNumberOfTopLabels.ts` → `mapState.read.facade`
(a constant); `util/indexedDB/indexedDBWriter.ts` → `mapState`/`sharedView`/`preferences`/`lenses` defaults. Root cause: util
accreted the **render/layout engine** (treeMapLayout + streetLayout are render-pipeline, not kernel — consumed by
`codeMap.render.service`/`codeMapMesh`/`floorLabels`) and the **persistence writer** (indexedDBWriter seeds/migrates the CcState
blob — a root-store concern). *(Slice 15 worsened it: 15e added `treeMapHelper → edgesSelector`, 15c added `getNumberOfTopLabels
→ mapState`.)* NB a related oddity: `model/domain.model.ts` imports `util/algorithm/streetLayout` (model→util) — fold into 16i.

## Sub-slice ladder (each its own gated commit; capstone strictly last)

### 16a — 3DPreview circular SCC (73 warnings → 0) · structural · M · zero runtime risk
Root cause: `preview3DPrintMesh.ts` both DEFINES `GeometryOptions` (lines 11-34) and runtime-imports the container meshes;
all 21 mesh/strategy files import `GeometryOptions` back (type-only) — a hub cycle. Plus two strategy↔mesh 2-cycles.
- Extract `GeometryOptions` → NEW leaf `3DPreview/geometryOptions.ts` (interface verbatim + its `three`/`codeCharta.model`
  imports). Delete it from `preview3DPrintMesh.ts`, which now `import`s it.
- Repoint the **21 runtime importers** of `GeometryOptions` (MeshModels/, Back/FrontMeshModels/, CreateGeometryStrategies/)
  to `./geometryOptions` (+ the 22 specs; optional/cycle-neutral — do them for cleanliness).
- Break cycle #1: `ColorChangeStrategies/colorChangeStrategy.ts` widen `execute(..., mesh: three.Mesh)` instead of importing
  `GeneralMesh` (safe under `noImplicitAny=false`; concrete strategies use `any` params).
- Break cycle #2: `baseplateColorChangeStrategy.ts` param `three.Mesh` instead of importing `BaseplateMesh` (leaves the
  `new BaseplateColorChangeStrategy()` runtime edge one-directional).
- **All broken edges are type-only** (erased at compile) → no behavior change. Verify: cruise 94→21, tsc, tests.

### 16b — the two orphan cycles (2 warnings → 0) · S (type) + S/M (behavioral)
- **generateXML (type-only, S):** `build3mfModelConfig.ts:1` imports the `Volume` type from `serialize3mf.service`, which
  runtime-imports `getXMLmodelConfig` back. Same shape as 16a — move `Volume` to a leaf module, repoint. Zero risk.
- **streetLayout (behavioral, S/M — the only behavioral piece in this slice):** `horizontalStreet`/`verticalStreet` do
  `child instanceof <sibling>` + read the sibling's orientation enum at RUNTIME (genuine 2-cycle, not just types). Add
  `protected abstract reverseOrientation()` to the `Street` base; implement in each concrete class (Horizontal→`LEFT`,
  Vertical→`DOWN`); replace the two `if (child instanceof Sibling) child.orientation = …` branches with `child.reverseOrientation()`.
  **Behavioral → gate on treemap-layout snapshots** (`util/algorithm/treeMapLayout/__snapshots__`) + streetLayout specs;
  the `instanceof Street`-vs-`instanceof <concrete>` semantics are identical because `createBoxes` strictly alternates.

### 16c — extract the shared Three layer (19 cross-feature warnings → 0 + drop grandfather) · structural · L · review-gated
Root cause: the shared Three services (`ThreeSceneService`/`ThreeRendererService`/`ThreeMapControlsService`/`ThreeCameraService`,
`CodeMapTooltipService`, `CursorType`) live INSIDE `features/codeMap` and are re-exported via `codeMap/facade.ts`; 4+ sibling
features import them from `../codeMap/facade` while codeMap imports back → bidirectional feature cycles.
- **NEW top-level `threeViewer/`** (sibling of `lenses/`, `renderModel/`, `mapState/`, `fileStore/`). `git mv` the shared 3D
  infra out of `features/codeMap` into it (the `threeViewer/` subtree + `rendering/` + the relevant stores + `idToBuilding.service`
  + `codeMap.tooltip.service`). **Pure `git mv`** so snapshots stay byte-stable.
- Sever the one upward edge: `threeRenderer.service.ts:4` reads `GlobalSettingsFacade.isWhiteBackground$()` → repoint to read
  `isWhiteBackground` from `mapState.read.facade` directly (`isWhiteBackground` lives at `mapState/store/isWhiteBackground/`).
- Extract the cursor coupling: move `CursorType` + the static `changeCursorIndicator` (pure document-cursor write) out of
  `codeMap.mouseEvent.service` into `threeViewer/cursorIndicator.ts` (this removes viewCube's last codeMap import — verified
  viewCube uses it only for `.changeCursorIndicator()`).
- Invert the labelSettings→codeMap render-data edge: `colorCategoryCounts$` is a `BehaviorSubject` published by
  `CodeMapRenderService` and read by `labelSettingsPanel.component.ts:63` — relocate its publish into a small store both read.
- Repoint every external consumer (~9 features: viewCubeToolbox, sidebarInspector, nodeContextMenu, sidebarExplorer, 3dPrint,
  fileExtensionBar, scenarios, …) from `../codeMap/facade` to `threeViewer/`. Stop `codeMap/facade.ts` re-exporting the moved
  symbols.
- **LAST step (only after tsc green + 0 cross-feature cycles):** drop the `(codeMap|viewCube)` grandfather from
  `feature-no-circular-dependencies-between-features` (`from.pathNot` + the `to.pathNot` entry). Re-run cruise.
- ~40 files (git-mv + specs + `__snapshots__` + repoints). Verify: tsc, tests 45/45 zero-diff, cruise 0 cross-feature cycles.
  **Highest-risk structural move in the cleanup — review-gate it.**

### 16d — fence mapState + fold its read-window (CF #9 mapState half) · structural · S
5 runtime files still import raw `mapState/store/*.selector`: `codeMap/effects/autoFitCodeMapChange/selectorsTriggeringAutoFit.ts`,
`metricsBar/selectors/metricColorRangeValues.selector.ts`, `metricsBar/effects/resetColorRange/resetColorRange.effect.ts`,
`metricsBar/stores/margin.store.ts`, `metricsBar/components/colorSettingsPopover/colorSettingsHeader.component.ts` (a component
reaching a raw selector — doubly smelly).
- Add `margin$` to `MapStateReadWindow`; refold `MarginStore` onto it (mirror `ColorRangeStore`/`AreaMetricStore`).
- Retarget the 3 composed/effect selector imports to `mapState.read.facade` (which already re-exports `marginSelector`/`colorRangeSelector`).
- `git mv` the pure `calculateInitialColorRange` helper `mapState/store/colorRange/` → `util/color/` (it's a pure helper, not
  ngrx-bound); repoint its 2 importers.
- **Rule edit:** add `^app/codeCharta/mapState/` to `from.pathNot` + `^app/codeCharta/mapState/store/` to `to.path` of
  `feature-reaches-state-home-only-via-facade`; delete the "mapState is deliberately EXCLUDED" clause. **All 3 homes fenced.**

### 16e — dedup the isDeltaState wrappers (CF #9 non-mapState) · structural · S
Three features minted byte-identical `isDeltaState.store.ts` wrappers (legend, sidebarInspector, metricsBar).
- Add `features/shared/stores/isDeltaState.store.ts` (`IsDeltaStateStore`, mirrors the `IsLoadingFileStore` precedent).
- Repoint `legend.service`, `inspectorHeader.service`, `metricsBar/services/isDeltaState.service` to inject it; delete the
  3 orphan wrappers + specs.
- **Backlog hygiene:** the other CF #9 bullets are NOT real duplicates (isLoadingFile is singular; selectedNode/hoveredNode
  underlying selectors already deduped in renderModel; the curated read windows bundle distinct streams) — drop them from CF #9.

### 16f — move the loader kickoff into load/ (CF #10) · structural · M
Drops the last tolerated `fileStore → load/` edge (`loadInitialFile.service` injecting `LoadInitialFileStore`).
- `git mv` `loadInitialFile.service(.spec).ts` `fileStore/loaders/ccJson/services/` → `load/` (siblings of `loadInitialFile.store.ts`).
- Keep the wire-DTO sample assets in fileStore: extract `sampleFile1/2` (they cast sample JSON as `ExportCCFile`, fenced by
  `wire-dto-only-in-filestore-boundary`) into `fileStore/loaders/ccJson/sampleFiles.ts`.
- Widen `fileStore.facade` so `load/` reaches fileStore ONLY through the facade (never api.model/deep paths). Add a
  `load/load.facade.ts` barrel; repoint the ~10 importers (`codeCharta.component`, `confirmResetMapDialog.component`, …) to it.
- **Rule edits:** add `fileStore/` (with a spec exemption) to `load-orchestrator-not-imported-by-lower-layers` `from`, and
  drop the "a follow-up may move the loader" note.

### 16g — comment/naming/docs sweep · docs-only · S
- **Rename** `new-must-not-import-legacy` → e.g. `source-layers-must-not-import-features` (it now only fences `lenses|fileStore
  → features/`; no `state/` left). Update the ~3 comment references (`.dependency-cruiser.js:139`, metricsLens.facade.ts,
  valueOf.selector).
- Fix rule comments still citing the deleted `state/`: `state-home-is-leaf` (drop "legacy `state/` stays a transitional read"),
  `feature-reaches-state-home-only-via-facade` (post-16d).
- Fix 6 stale source comments (`metricsLens.store.ts:12` `state/selectors/nodeMetricData`, renderModel metricData/nodeMetricData
  "legacy metricDataSelector", …).
- Reconcile `Ideas/dependency-cruiser.2.0.refined.cjs` (a pre-landing PROPOSAL) against the live config, or annotate it superseded.
- Handle the single `no-orphans` info: `app/codeCharta/index.d.ts` — delete it or add to the rule's `pathNot`.

### 16i — make `util/` a genuine leaf kernel · structural (mostly) · L
Relocate the non-kernel concerns that accreted in `util/`, then lock it with a rule. The 4 upward edges split into 3 fixes:
- **16i-1 — persistence writer → `store/` (M, structural).** `git mv` `util/indexedDB/` → `store/indexedDB/` (or `load/`): the
  writer composes every home's default + the v3→v15 migration chain — that is root-store/persistence territory, next to
  `defaultState`. Repoint its ~4 consumers (`load/effects/saveCcState`, the fileStore loader, `scenarios/scenarioIndexedDB`,
  `confirmResetMapDialog.component`). After the move its home-default imports are legitimate (store/ composes homes).
- **16i-2 — layout engine → a render layer (L, structural).** `git mv` `util/algorithm/{treeMapLayout,streetLayout}` OUT of
  util into a render home (the `threeViewer/` layer 16c creates is the natural fit; else `features/codeMap/rendering/` or a new
  `layout/`). It is the render pipeline (consumed by `codeMap.render.service`/`codeMapMesh`/`floorLabels`/`threeSceneService`),
  so once it lives in a render layer its `renderModel`/lens-facade reads are legal DOWNWARD reads — no need to thread selector
  values through the per-node calls. Repoint the ~8 consumers + fix the `model/domain.model.ts → streetLayout` edge (model must
  not import a layout algorithm — move the shared type it needs, or invert). **Pure `git mv`** → snapshot-stable; verify 45/45.
- **16i-3 — `getNumberOfTopLabels` (S).** Move the plain constant `defaultAmountOfTopLabels` down to `model/` (or pass it as a
  param) so the helper stops importing `mapState`.
- **16i-4 — `util-is-a-leaf-kernel` (fitness function — ALREADY CREATED at `warn`, flip to `error` here).** Authored 2026-07-04
  in `.dependency-cruiser.js` (after `filestore-has-no-upward-deps`) as a **positive allow-list**: `from: ^app/codeCharta/util/`
  (pathNot spec/e2e/mocks) → any `^app/codeCharta/` path that is NOT `util/`, `model/`, `codeCharta.model.ts` or
  `codeCharta.api.model.ts` is a violation (so any FUTURE layer is auto-fenced; the two `*.model.ts` type/contract files are
  allowed because they are the shared vocabulary, not a layer — `fileDownloader → api.model` stays sanctioned under
  `wire-dto-only-in-filestore-boundary`). Currently flags **exactly the 4 leak files / 9 edges**. Staged at `warn`; **flip to
  `error` once 16i-1/2/3 have relocated those 4 files** (0 violations). This is the fitness function whose ABSENCE let the rot in.
- **Dependency:** 16i-2's cleanest home is `threeViewer/`, so **do 16i AFTER 16c** (or pick `features/codeMap/rendering/` as the
  home to decouple them). 16i-1/16i-3/16i-4 are independent of 16c.

### 16h — CAPSTONE: flip `no-circular` warn→error · config-only · S · STRICTLY LAST
- **Precondition gate:** `depcruise app … --output-type err | grep no-circular` must print NOTHING (requires 16a + 16b + 16c
  all merged).
- Flip `no-circular` `severity: warn → error`; trim the "currently warn until fixed" clause.
- Verify: `npm run lint:architecture` → **0 errors, 0 warnings**.

## Sequencing (dependency graph)
- **Independent / parallel-safe, any order:** 16a, 16b, 16d, 16e, 16f, 16g, and 16c. (16i-1/16i-3/16i-4-partial too.)
- **16c** contains its own grandfather-drop as its last internal step.
- **16i-2** (layout engine → render layer) prefers `threeViewer/` as its home ⇒ do it AFTER **16c** (or pick
  `features/codeMap/rendering/` to decouple). The `util-is-a-leaf-kernel` flip (16i-4) needs all of 16i-1/2/3 done.
- **16h is strictly LAST** — it requires 16a **and** 16b **and** 16c merged (any missing cycle ⇒ the flip fails).
- Recommended landing order: 16a → 16b → 16d → 16e → 16g (quick wins first) → 16f → **16c** (the big one) → **16i** (util leaf,
  layout engine lands in the fresh threeViewer/ layer) → **16h** (capstone).

## Risks
- **16c** is the large one (~40-file shared-layer extraction, 9 features). Keep every move a pure `git mv`; the grandfather-drop
  must be the final in-slice step, re-verified with a fresh cruise; review-gate it.
- **16b streetLayout** is the ONLY behavioral change (treemap street geometry) — gate on the layout snapshots + streetLayout
  specs, not just tsc.
- Everything else is structural/type-only/docs → snapshot-verifiable autonomously.

## Out of scope (explicitly NOT cleanup — separate programs)
- **CF #7** (`preferences` → localStorage + the two-button reset UX) — a behavior seam awaiting user sign-off + a rehydrate
  characterization test; its own slice.
- **CF #6 multi-renderer** (Terms lens, Graph/LSM + `graphState` + `edgeMetric` promotion, WordCloud, Report, physical
  `renderers/` move, engine settings-inversion, the 4 deferred `RendererEngine` members, viewCube move) — new-feature work,
  not cleanup. (Note: **16c's `threeViewer/` extraction is a natural stepping-stone** toward the eventual renderer split.)
- **CF #2b** (injectable `DependencyLensStore`) — SUPERSEDED (edges is a derived selector; no injectable store needed).
- **CF #2c** (delete `metricDataSelector`) — MOOT (it legitimately lives in `renderModel/`); at most a 1-line metricsBar
  edge-only repoint, folded into 16g if desired.
