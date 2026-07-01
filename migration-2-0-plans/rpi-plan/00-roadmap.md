---
name: viz-2.0-slice-1-roadmap
issue:
state: complete
version: 1
---

# Roadmap — Visualization 2.0, Slice 1: cc.json 2.0 ingestion + Metrics lens

> 📌 **Planning a new slice? Read `../CARRIED-FORWARD.md` first** — the canonical backlog of work
> earlier slices deferred (e.g. `valueOf`, the dependency lens, the `warn`→`error` bridge flip).
>
> First milestone only. Scope is deliberately small: make the visualization read **cc.json 2.0**
> and stand up the **Metrics lens** containing everything metric-related that already exists in the
> code. No other lenses, no renderer/page split, no new renderers. Those come in later slices.
>
> Companion design: `Ideas/codecharta-2.0-implementation-map.html`,
> `Ideas/codecharta-2.0-lens-anatomy.html`, rules in `Ideas/dependency-cruiser.2.0.cjs`.
>
> **Every step follows `../CONVENTIONS.md`** — the shared definition of "safe": behavior-preservation
> (snapshots are the contract, never `-u`; structural commit ⇒ zero diff; behavioral swap ⇒ parity
> before delete) and the reusability rules for layout/components, each backed by a dep-cruiser rule.

## Definition of done (this milestone)
- The app loads a **cc.json 2.0** file (`{ meta, files, lenses }`) and renders identically to today.
- A real **`lenses/metrics`** module exists: `metricsLens.facade.ts` + `repos/` + `store/`, projecting
  `lenses.metrics` (attributes by node `id`, attributeTypes, attributeDescriptors), merged for the
  visible selection.
- The **Legend** is the first feature living inside the metrics lens.
- All current **node-metric** consumers (codeMap render pipeline, metricsBar, inspector) read via the
  **MetricsLens facade**; the duplicate **node-metric** stores/services are deleted. (Edge-metric reads
  stay on the canonical `metricDataSelector` until the dependency lens lands — not this slice.)
- dependency-cruiser enforces the metrics-lens boundary; unit + e2e green; the **render-pipeline Jest
  snapshots are byte-identical** (the repo's render proof — there is no golden/image-baseline suite on
  the viz side).

## Scope guards (explicitly OUT for this slice)
- Dependency lens, Structure lens, Terms lens — **not** built. Edges/tree stay in their current slices.
  The 2.0 reader still parses `lenses.dependency.edges` into the existing `fileSettings.edges` slice.
- Renderer/Page split, viewCube move, multi-renderer — **not** done.
- Moving metricsBar/inspector into modules — **not** done (only their metric *data source* is swapped).

## Ordering rationale (Tidy First: structure before behavior)
Skeleton/types → 2.0 reader → FileStore extract → Metrics core → Legend → repoint consumers → enforce.
Each step is independently shippable and behavior-preserving except where noted.

## Steps (each has its own plan file in this folder)

1. **Skeleton + 2.0 model types + scoped dep-cruiser** — `step-1-skeleton-and-model.md`
   Create `model/` cc.json 2.0 types (meta/files/lenses), the empty target dirs (`fileStore/`,
   `lenses/metrics/`), and add the dependency-cruiser rules (at `warn`) for *only* the dirs that will
   exist this slice. Structural only, no behavior. **No `nodeId.ts`** — the viz reads the string `id`.

2. **cc.json 2.0 ingestion (reader + validator)** — `step-2-ccjson-2-ingestion.md`
   In the load pipeline (`features/loadFile`), auto-detect `apiVersion`; parse `{meta, files, lenses}`
   → internal tree with node `id`, attributes-by-id, descriptors/types, edges from `lenses.dependency`.
   Validate against `dev_docs/cc-json-2.0.schema.json`. Keep producing today's internal model so
   nothing downstream breaks. (Behavioral, foundational.)

3. **FileStore module** — `step-3-filestore-module.md`
   Extract the files slice + load pipeline behind `fileStore/` (facade + repos + store). Outsiders use
   the facade. Behavior-preserving structural move.

4. **Metrics lens core: store + repos + facade** — `step-4-metrics-lens-core.md`
   `lenses/metrics/store` (projects + merges `lenses.metrics` for visible files — replaces the
   `metricData` / `selectedColorMetricData` selectors) + `repos/` (`attributes.repo`: rangeOf/valueOf/
   availableMetrics; `descriptors.repo`) + `metricsLens.facade.ts`. Unit tests = parity with the
   current selectors.

5. **Migrate Legend into the metrics lens** — `step-5-legend-into-metrics-lens.md`
   Move `features/legend` → `lenses/metrics/features/legend`; collapse its 9 passthrough services/stores
   onto the metrics repo + one real view-model service. Snapshot tests stay green. Proof slice.

6. **Repoint metric consumers to MetricsLens facade** — `step-6-repoint-metric-consumers.md`
   CodeMap render pipeline, metricsBar, inspector read metric data via the facade (data-source swap,
   no move). Delete the now-dead metric-data selectors and duplicate per-feature metric facades.

7. **Enforce + verify** — `step-7-enforce-and-verify.md`
   Flip the metrics-lens dep-cruiser rules to `error`; run unit + e2e + golden; confirm pixel-identical
   render; update CHANGELOG + docs.

## Notes
- The cc.json 2.0 wire DTO must stay confined to the load boundary (existing
  `wire-dto-only-in-...` dep-cruiser rule); 2.0 types live in `model/ccjson2.model.ts` (single source).
- Node `id` is the **string id the analysis already writes into the file** (`files[]` / keys of
  `lenses.metrics.attributes`); it is the join key. The viz **reads** it — it does not recompute the
  sha-256 (that's the analysis side's job). No `nodeId.ts` in the viz this slice.
- **Migration boundary (strangler-fig, Option A):** the new structure lives at the **top of
  `app/codeCharta/`** (`lenses/`, `fileStore/`, later `renderers`/`shell`/`interaction`/`appearance`/
  `components`) — its final home, no temp root, no promotion move. The **legacy** is `features/` + `state/`
  (shrinking to deletion; `features/shared` → `components/`); `util/` + `model/` are the **shared kernel**
  (both worlds import). A dep-cruiser rule **`new-must-not-import-legacy`** (staged `warn` in step 1) keeps
  the new world clean; `legacy → new` is the allowed migration flow (legacy reads new lens facades), already
  governed by `lens-external-access-only-via-public-surface`. The boundary flips to `error` once `state/`
  becomes `interaction`/`appearance`.
- Each step plan follows `plans/template.md`; commit structural changes separately from behavioral
  (Tidy First); only commit on green.
- **v2 (post-review):** all step plans revised to clear the `REVIEW.md` NO-GO — the MetricsLens facade
  contract is owned by step 4 (sync snapshot + reactive + re-exported selectors), step 6 swaps only
  node-metric reads (edges stay on the canonical selector), step 1↔2 share `model/ccjson2.model.ts`,
  the dep-cruiser warn→error staging is enumerated 1:1 across steps 1 & 7, and every step has a rollback.
