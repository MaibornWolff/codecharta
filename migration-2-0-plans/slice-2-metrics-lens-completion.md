---
name: viz-2.0-slice-2-metrics-lens-completion
issue:
state: todo
version: 1
---

# Roadmap — Visualization 2.0, Slice 2: complete the Metrics lens

> Slice 1 stood up the metrics-lens **core** (store + repos + facade) and migrated the **node-metric
> reads** + the **Legend**, but the lens still only **reuses** the legacy metric data/logic from
> `state/` rather than **owning** it. This slice makes the metrics lens own the full **node-metric
> domain**. It is independent of the dependency (edge) lens — the node/edge split is shallow
> (`metricDataSelector` is just an aggregator of two already-separate calculators), so the edge side
> is simply left in place and taken by the dependency lens in a later slice.
>
> **Every step follows `CONVENTIONS.md`** — snapshots are the behavior contract (never `-u`),
> structural commits ⇒ zero snapshot diff, behavioral swaps prove value-equality before delete, each
> boundary backed by a dep-cruiser rule.

## Definition of done
- The metrics lens **owns** the node-metric computation: `calculateNodeMetricData`, `metricNames`,
  `sortByMetricName`, and the color-range logic live under `lenses/metrics/` (moved from
  `state/selectors/accumulatedData/metricData/`, not duplicated).
- The metrics lens owns the **node side** of `attributeTypes` + `attributeDescriptors`; the edge side
  stays untouched for the dependency lens.
- `MetricsLensFacade` gains **`valueOf(id, metric)`** (the target facade is `rangeOf · valueOf ·
  descriptors`).
- `metricDataSelector` becomes a **shrinking aggregator** — `{ nodeMetricData: <lens node selector>,
  ...calculateEdgeMetricData(...) }` — so its remaining (edge / cross-cutting) consumers keep working
  unchanged while node-only consumers read the facade.
- The `selectedColorMetricData` / `metricRange` **duplication** created in Slice 1 is collapsed onto a
  single owned implementation.
- dep-cruiser enforces the boundary; unit + e2e green; render-pipeline Jest snapshots byte-identical.

## Scope guards (explicitly OUT)
- **Dependency lens (edges)** — not built. `calculateEdgeMetricData`, edge selection/visibility, the
  edge side of the attribute maps, `sortedNodeEdgeMetricsMap`, and the edge consumers of
  `metricDataSelector` all stay put. The aggregator keeps composing them.
- **metricsBar / inspector do NOT move** — they are cross-lens shell panels (compose metrics +
  dependency + appearance + interaction). This slice only swaps their **node-metric data source** where
  not already done and lets them read the fuller facade.
- Structure lens, renderer/page split, interaction/appearance/viewState extraction — later slices.
- Deleting `metricDataSelector` itself — only possible once the dependency lens exists and the
  cross-cutting consumers (`mapReset`, `scenarioDialog`, `loadInitialFile`, the reset/query-param
  effects, `accumulatedData`, `areAllNecessaryRenderDataAvailable`) migrate. Not this slice.

## Open decision to make first
**Where does metric *selection* live** — `areaMetric` / `heightMetric` / `colorMetric`
(`dynamicSettings`, 14/8/9 consumers)? Candidates: the metrics lens (they select *which* metric) vs a
future `viewState` module (they are per-view config, not metric data). Resolve before Step 4; if
undecided, defer selection to the viewState slice and keep this slice to metric **data** only.

## Steps

1. **Own the node-metric calculators** — move `nodeMetricData.calculator.ts`, `metricNames.selector.ts`,
   `sortByMetricName.ts` (and the color-range logic) from `state/selectors/accumulatedData/metricData/`
   into `lenses/metrics/store/`. Recompose `metricDataSelector` as an aggregator importing the lens's
   node selector; collapse the Slice-1 `metricRangeSelector` duplication onto the moved
   `selectedColorMetricData` logic. Structural move + one behavioral recompose; parity tests.

2. **Own the node attribute maps** — move/split the **node side** of `attributeTypes` +
   `attributeDescriptors` into `lenses/metrics/store` (or a `repos/` seam). `attributeTypes` is already
   `{ nodes, edges }` (clean split); `attributeDescriptors` is a flat map — the lens owns node-metric
   descriptors, the edge side is left for the dependency lens. Keep the reused selectors as thin
   re-exports until their non-node consumers migrate.

3. **Add `valueOf(id, metric)`** to `AttributesRepo` + `MetricsLensFacade` against the decorated node
   attributes, with parity tests. (Slice 1 dropped it for lack of a consumer; add it now as the facade
   contract completes.)

4. **(Decision-gated) Move metric selection** — if the open decision lands on "metrics lens", move
   `areaMetric`/`heightMetric`/`colorMetric` selection into the lens and repoint consumers; else record
   the deferral to the viewState slice and skip.

5. **Repoint node-only consumers to the facade + collapse duplicates** — the still-legacy node-metric
   reads (e.g. `metricNamesSelector`'s consumer, any `selectedColorMetricDataSelector` node reads not
   yet swapped) go through the facade; delete the now-dead duplicated selectors. Edge / cross-cutting
   consumers stay on the aggregator.

6. **(Optional) Pull single-lens metric UI into the lens** — evaluate moving `metricSelectPopover`
   (browse/pick a metric) and the `metricColorRangeDiagram` (distribution chart) out of the cross-lens
   `metricsBar` into `lenses/metrics/features/`. Only if they are genuinely single-lens; otherwise leave
   them composing in the shell.

7. **Enforce + verify** — extend the metrics-lens dep-cruiser rules to the newly-owned modules; run
   unit + e2e; confirm render-pipeline snapshots byte-identical; update CHANGELOG + docs.

## Notes
- **Independent of the dependency lens** — the only shared surface is the `metricDataSelector`
  aggregator and the flat `attributeDescriptors` map; both stay in place, composing node (owned) + edge
  (legacy) until the dependency lens lands.
- **Tidy First** — structural moves (calculators, attribute maps) commit separately from behavioral
  swaps (facade `valueOf`, consumer repoints, duplicate deletion). Commit on green only.
- Carries forward the two Slice-1 `warn` bridges (`metrics-lens-ngrx-guard`,
  `new-must-not-import-legacy`); they flip to `error` in the interaction/appearance/viewState slice, not
  here.
- **Rollback** — each step is an isolated move or swap; revert the offending commit to restore the
  `state/`-owned path with zero runtime impact.
