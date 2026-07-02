---
name: viz-2.0-slice-3-dependency-lens
issue:
state: complete
version: 1
---

# Roadmap — Visualization 2.0, Slice 3: stand up the Dependency (edge) lens

> Slices 1 & 2 built the **Metrics lens** and made it own the whole **node-metric** domain, deliberately
> leaving the **edge** side computed inline in the `metricDataSelector` aggregator "for the future
> dependency lens". This slice mirrors that work for edges: a real **`lenses/dependency`** module owns
> the **edge-metric DATA** (the `calculateEdgeMetricData` engine + its selectors), and the aggregator
> reads it through the dependency-lens facade exactly as it already reads the metrics-lens node selector.
>
> **Every step follows `CONVENTIONS.md`** — snapshots are the behavior contract (never `-u`), structural
> commits ⇒ zero snapshot diff, behavioral swaps prove value-equality before delete, each boundary backed
> by a dep-cruiser rule.

## Definition of done
- A **`lenses/dependency`** module exists: `dependencyLens.facade.ts` + `store/` (the moved
  `edgeMetricData.calculator.ts` + `sortedNodeEdgeMetricsMap.selector.ts` + a new
  `dependencyLens.selectors.ts`), projecting `edgeMetricData` / `nodeEdgeMetricsMap` / edge-metric names.
- `metricDataSelector` becomes a pure **diamond aggregator**: node side from the metrics-lens facade,
  edge side from the dependency-lens facade, keeping the combined
  `{ nodeMetricData, edgeMetricData, nodeEdgeMetricsMap }` shape unchanged for cross-cutting consumers.
- The edge-only node-metric-data consumers read via the **dependency-lens facade**: `edgePreviewNodes`,
  `amountOfBuildingsWithSelectedEdgeMetric`, `accumulatedData` (edge names), and the two edge effects
  (`resetSelectedEdgeMetric…`, `updateQueryParameters` edge flag). The legacy `metricNames.selector` is
  deleted (its one consumer repoints to the lens; the lens selector spec covers the behavior).
- The shared edge Map types (`EdgeMetricCountMap`, `NodeEdgeMetricsMap`) live in the **model kernel**
  (`model/domain.model.ts`) so the cross-cutting `accumulatedData/utils` don't import lens internals
  (the Slice-2 "shared type → kernel" precedent for `sortByMetricName`/`UNARY_METRIC`).
- dep-cruiser: the generic `lenses/[^/]+` rules already govern `lenses/dependency/` — **0 new errors**;
  the lens's reads of `state/` (blacklist, showEdges, edgeMetric) are the same documented `warn` bridges
  the metrics lens already carries. unit green; render-pipeline Jest snapshots byte-identical.

## Scope guards (explicitly OUT — carried forward)
- **Edge-metric *selection*** (`dynamicSettings.edgeMetric`) and **edge appearance** appSettings
  (`isEdgeMetricVisible`, `amountOfEdgePreviews`, `edgeHeight`, `showIncoming/OutgoingEdges`,
  `showOnlyBuildingsWithEdges`, edge `mapColors`) stay put — they are per-view config bound for the
  **viewState/appearance** slice (same verdict `colorMetric` got). The lens owns edge *data*, not the
  *selection* of it.
- **The three edge effects do NOT move** — they read/write the edge *selection* + edge appSettings
  above, so they migrate with viewState/appearance. This slice only repoints their *edge-data reads* to
  the lens facade.
- **The edge side of `attributeTypes`** is NOT projected into the lens this slice — its only reader is
  the cross-lens, parameterized metricsBar attribute-type label pipeline (serves node AND edge); an
  unused `edgeAttributeTypesSelector` would be dead surface (the Slice-1 `valueOf` lesson).
- **No injectable `DependencyLensStore`/`EdgesRepo`/facade class** — every current edge-data consumer is
  a `createSelector` graph or reads the aggregator; there is no injectable (DI) edge consumer yet. The
  public surface this slice is the selector re-export barrel. The injectable stack lands when an edge UI
  feature (e.g. `edgeSegment`) reads the lens directly.
- **metricsBar / edge UI do NOT move** — cross-lens shell (item #4). `nodeDecorator` edge aggregation,
  `edgeVisibility`, the arrow renderer stay put; they read edges/selection directly, not the aggregator.

## Ordering rationale (Tidy First: structure before behavior)
Shared types → kernel (structural) → own the edge calculation in the lens + recompose aggregator
(behavioral) → repoint the remaining edge-data effect reads (behavioral) → docs. The calculator move is
*not* purely structural: an outside file importing the moved engine from `store/` would break
`lens-external-access-only-via-public-surface`, so the move is bundled with the selector + facade +
aggregator recompose into one behavioral commit — exactly how Slice 2 owned the node calculator.

## Steps

### 1. Move the shared edge Map types into the model kernel (structural)
- Add `EdgeMetricCountMap`, `NodeEdgeMetricsMap` to `model/domain.model.ts` (beside `EdgeMetricCount`).
- Drop the local type defs from `edgeMetricData.calculator.ts`; repoint every type importer
  (`sortedNodeEdgeMetricsMap.selector`(+spec), `addEdgeMetricsForLeaves`, `getMetricValuesForNode`(+spec),
  `edgePreviewNodes.selector`, `amountOfBuildingsWithSelectedEdgeMetric.selector`) to the `codeCharta.model`
  barrel. Zero behavior, zero snapshot diff.

### 2. Own the edge-metric calculation in the dependency lens (behavioral)
- `git mv` `edgeMetricData.calculator.ts`(+spec) and `sortedNodeEdgeMetricsMap.selector.ts`(+spec) into
  `lenses/dependency/store/`; fix their relative imports.
- Add `store/dependencyLens.selectors.ts`: `edgeMetricDataResultSelector` (= `createSelector(visibleFileStates,
  blacklistMatcher, calculateEdgeMetricData)`) → derived `edgeMetricDataSelector`, `nodeEdgeMetricsMapSelector`,
  `edgeMetricNamesSelector`. Parity spec value-equals the direct calculator output.
- Add `dependencyLens.facade.ts` re-exporting the public edge selectors + `sortedNodeEdgeMetricsMapSelector`.
- Recompose `metricDataSelector` → diamond over the metrics + dependency facades (drop inline
  `calculateEdgeMetricData`).
- Delete `metricNames.selector.ts`(+spec); repoint `accumulatedData.selector` to `edgeMetricNamesSelector`.
- Repoint `edgePreviewNodes.selector` (moved `sortedNodeEdgeMetricsMapSelector`) and
  `amountOfBuildingsWithSelectedEdgeMetric.selector` (`nodeEdgeMetricsMapSelector`) to the facade.

### 3. Repoint the remaining edge-only effect reads to the facade (behavioral)
- `resetSelectedEdgeMetricWhenItDoesntExistAnymore.effect` and `updateQueryParameters.effect` read only
  `edgeMetricData` → swap `metricDataSelector` for `edgeMetricDataSelector` (value-identical; fewer spurious
  emissions). Update their `provideMockStore` overrides faithfully.

### 4. Verify + document
- `npx tsc --noEmit` clean; `npm test` green with **zero snapshot diff, no `-u`**;
  `npm run lint:architecture` — 0 new errors.
- Update `CARRIED-FORWARD.md` (item #2: mark edge-metric-DATA done, keep edge attributeTypes + selection +
  appSettings + effects); add the outcome below; update `CHANGELOG.md`.

## Steps (tracked)
- [x] Complete Task 1: shared edge Map types → model kernel (structural)
- [x] Complete Task 2: own edge calculation in the dependency lens + recompose aggregator (behavioral)
- [x] Complete Task 3: repoint edge effect reads to the facade (behavioral)
- [x] Complete Task 4: verify (tsc / test / lint:architecture) + docs

## Notes
- **Independent of viewState** — the only cross-boundary coupling is the reset effect clamping the edge
  *selection* (viewState) to names the lens produces; that stays working via the store, no code cycle.
- **No cycle risk** — unlike `valueOf` (item #1), edge-metric DATA needs only `visibleFileStates` +
  `blacklistMatcher` (both upstream of decoration), so the lens selectors don't reach into
  `accumulatedData`/`idToNode`. The aggregator becomes a clean diamond (depends on both lens facades).
- **Rollback** — Step 1 is a pure type move (revert commit). Steps 2–3 are isolated swaps; revert the
  offending commit to restore the `state/`-owned edge path.

## Outcome (executed 2026-07-01)

Delivered on `feature/cc-json-2-analysis`. Full unit suite green (**2266 passed**, 6 todo; **45 render
snapshots byte-identical**, never `-u`), `tsc` clean, dep-cruiser **0 errors** (164 warnings — the
documented `new-must-not-import-legacy`/`ngrx-guard` bridges; the dependency lens adds exactly 4, all
`warn` reads of `state/` blacklist + showEdges, mirroring the metrics lens). e2e not run in-sandbox
(no Playwright browsers offline).

Commits (Tidy First — structural before behavioral):
1. `refactor: move edge-metric map types into the shared model kernel` — `EdgeMetricCountMap` /
   `NodeEdgeMetricsMap` → `model/domain.model.ts`, so the cross-cutting `accumulatedData/utils` don't
   import lens internals (structural).
2. `feat: own edge-metric calculation in the dependency lens` — moved `edgeMetricData.calculator` +
   `sortedNodeEdgeMetricsMap.selector` into `lenses/dependency/store/`; added `dependencyLens.selectors`
   (`edgeMetricData`/`nodeEdgeMetricsMap`/`edgeMetricNames`) + `dependencyLens.facade`; recomposed
   `metricDataSelector` into a node+edge diamond; deleted the one-line `metricNames.selector`; repointed
   `accumulatedData`, `edgePreviewNodes`, `amountOfBuildingsWithSelectedEdgeMetric`.
3. `refactor: read edge metric data from the dependency lens in edge effects` —
   `resetSelectedEdgeMetricWhenItDoesntExistAnymore` + `updateQueryParameters` read `edgeMetricDataSelector`.

Decisions / corrections to the roadmap text:
- **The slice-2 consumer note was inaccurate** — verifying every `metricDataSelector` importer showed
  three NODE-only consumers (`resetChosenMetrics.effect`, `areAllNecessaryRenderDataAvailable.selector`,
  `mapReset.store`) are still parked on the aggregator. That is a metrics-lens cleanup, out of edge scope
  — logged as `CARRIED-FORWARD.md` item #7.
- **`metricNames.selector` was deleted, not bridged** — it had exactly one consumer (`accumulatedData`),
  so repointing it to the lens's `edgeMetricNamesSelector` and deleting the file (+ its spec, covered by
  the new lens selector spec) was cleaner than keeping a re-export bridge.

Deferred (with reason) — **tracked forward in `CARRIED-FORWARD.md`:**
- **Edge side of `attributeTypes`** (item #2a): no genuinely single-lens consumer (only the parameterized
  metricsBar label pipeline reads it) — an unused `edgeAttributeTypesSelector` would be dead surface.
- **Injectable `DependencyLensStore`/`EdgesRepo`/facade class** (item #2b): no injectable edge consumer
  yet — every edge-data read is a `createSelector` graph, so the public surface is the selector barrel.
- **Edge selection + appearance + the 3 edge effects' state** (item #2b): per-view config, viewState/
  appearance slice.
- The dependency lens's `new-must-not-import-legacy` `warn` bridges flip to `error` with item #5.
