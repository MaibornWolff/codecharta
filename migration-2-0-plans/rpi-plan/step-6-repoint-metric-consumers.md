---
name: repoint-metric-consumers-to-the-metricslens-facade
issue:
state: complete
version: 2
---

## Goal

Repoint the **node-metric** reads of the codeMap render pipeline, `metricsBar`, and `sidebarInspector`
to the `MetricsLens` facade (built in step 4), then delete the duplicate per-feature stores/services
that fronted **node-metric** data. Pure data-source swap, no move, no behavior change.

> **Hard scope guard (the step-6 fix):** the metrics lens has **no edge data** this slice. Every
> edge-touching read stays on the canonical `metricDataSelector` / `metricNamesSelector`. Only
> **node-metric** reads move to the facade. The roadmap DoD therefore means "all **node-metric**
> consumers", not "all metric consumers".

## Tasks

### 1. codeMap render pipeline — swap only the node-metric snapshot
- `features/codeMap/codeMap.render.service.ts` `getNodes()` reads `metricDataSelector(state).nodeMetricData`
  (line ~90). Inject `MetricsLensFacade` and read its synchronous `getNodeMetricData()` snapshot instead;
  keep `getNodes()` synchronous and byte-identical.
- **Do NOT repoint `accumulatedData.selector.ts`.** It feeds `NodeDecorator.decorateMap` the whole
  `metricData` object (node **and** `edgeMetricData`/`nodeEdgeMetricsMap`) and uses the edge-derived
  `metricNamesSelector`. Routing that through the node-only facade would break edge decoration — it
  stays on the canonical `metricDataSelector`/`metricNamesSelector` until the dependency lens exists.
- Leave colorMetric/colorRange/blacklist reads alone (view-state/interaction, out of scope).

### 2. metricsBar — repoint node-metric reads, delete only the node-metric duplicates
- Repoint to `MetricsLensFacade`: `colorBandRow`, `colorSettingsHeader`, and
  `features/metricsBar/selectors/metricColorRangeValues.selector.ts` (composes
  `selectedColorMetricDataSelector` → re-point to the facade's re-exported `metricRangeSelector`);
  the `AttributeDescriptorsService` consumers — `metricSelectPopover`'s descriptor read **and**
  `colorRangeSection.component.ts` (also injects it) → facade `descriptors()`.
- **DELETE** (node-metric duplicates, after their consumers are repointed):
  `SelectedColorMetricDataStore`(+service) and `AttributeDescriptorsStore`(+service).
- **KEEP** `MetricDataStore`(+service): `metricsBar.component.hasEdgeMetric` (reads
  `metricData.edgeMetricData`) and the `metricSelectPopover` **edge branch** depend on its edge data —
  it cannot be deleted until the dependency lens lands. Also keep the metric-selection/view-state stores
  (`areaMetric/colorMetric/heightMetric/edgeMetric`, `colorMode/colorRange/margin/scaling`, `invert*`,
  `mapColors`, `isDeltaState`, `attributeTypes`).

### 3. sidebarInspector — repoint node-metric reads
- `features/sidebarInspector/selectors/inspectorMetricRows.selector.ts` composes `metricDataSelector`
  (ranges) + `attributeDescriptorsSelector`. Repoint the **node** range input to the facade's
  re-exported `nodeMetricDataSelector` and descriptors to the facade's `attributeDescriptorsSelector`.
  **Shape note:** `nodeMetricDataSelector` returns a bare `NodeMetricData[]`, but `_calculateMetricRows`
  expects `Pick<MetricData,'nodeMetricData'>` — wrap it as `{ nodeMetricData: <array> }` in the combiner
  (keep `_calculateMetricRows` itself unchanged). Keep the `selectedNode` and
  `accumulatedData.unifiedMapNode` (structure) inputs unchanged. `InspectorMetricRowsStore` keeps wrapping
  the (now facade-fed) selector; verify the two specs stay green by parity.
- **No field remap needed** anywhere in this step: step 4's `metricRangeSelector`/`rangeOf` emit the
  exact `MetricMinMax` `{values,minValue,maxValue}` shape the metricsBar/inspector consumers already read.

### 4. Verify no behavior change, then delete dead code
- Update specs/mocks that provided the deleted `SelectedColorMetricDataStore/Service` +
  `AttributeDescriptorsStore/Service` (e.g. `colorBandRow.component.spec`, `colorSettingsHeader.component.spec`,
  `colorRangeSection.component.spec`, `metricSelectPopover.component.spec`, `inspectorMetricRows.*.spec`)
  to provide `MetricsLensFacade` instead.
- Assert parity (same numbers/colors) against the pre-swap selectors; behavioral swap commit first
  (both sources coexist, green), then a separate structural commit deleting the orphaned duplicates.

## Steps

- [x] Complete Task 1: codeMap `getNodes()` → facade `getNodeMetricData()` snapshot (accumulatedData untouched) — behavioral commit, green
- [x] Complete Task 2: repoint metricsBar node-metric consumers (incl. `colorRangeSection`); delete `SelectedColorMetricDataStore` + `AttributeDescriptorsStore` (+services); KEEP `MetricDataStore` (edge)
- [x] Complete Task 3: repoint `inspectorMetricRows.selector.ts` node range + descriptors at the facade selectors
- [x] Complete Task 4: `npm test` (parity: metricsBar/inspector specs, `accumulatedData.selector.spec`, codeMap render spec), `npm run e2e`; render-pipeline snapshots **unchanged**; structural delete commit after green

## Review Feedback Addressed

1. **Edge-scope breach (C2, was *flawed*)**: facade swap restricted to node-metric reads.
   `accumulatedData` decoration, `metricNamesSelector`, `metricsBar.hasEdgeMetric`, and the
   `metricSelectPopover` edge branch all **stay on `metricDataSelector`**. `MetricDataStore` is **kept**,
   not deleted (it serves edges); only the node-metric duplicates are removed.
2. **Facade members exist (C1)**: `getNodeMetricData()` snapshot + the re-exported
   `nodeMetricDataSelector`/`metricRangeSelector` are built in step 4 (Task 4), not assumed here.
3. **Missing consumer**: added `colorRangeSection.component` (also injects `AttributeDescriptorsService`)
   to the repoint set so the delete doesn't break compilation.
4. **DoD wording**: narrowed to "all node-metric consumers".

## Notes
- **Scope guard — do NOT delete the canonical selectors.** `metricDataSelector`,
  `selectedColorMetricDataSelector`, `metricNamesSelector` still have many out-of-scope consumers
  (layout helpers, `resetChosenMetrics`/`resetColorRange`/`updateQueryParameters` effects,
  `globalSettings/mapReset`, `scenarios/scenarioDialog`, `loadInitialFile`,
  `areAllNecessaryRenderDataAvailable`, `amountOfBuildingsWithSelectedEdgeMetric`). They're removed in a
  later slice when those consumers migrate. "Delete the duplicates" = only the per-feature node-metric
  stores/services above.
- `metricColorRangeColors.selector.ts` (sibling of `metricColorRangeValues`) reads only
  `mapColorsSelector` (no metric data) — **leave it**.
- Step 5 already moved `features/legend` into the metrics lens onto the repo — leave it untouched.
- **Tidy First (inverted):** behavioral swap first (both sources coexist, tests green), then a separate
  structural deletion commit. Do **not** `test:updateSnaps`; a snapshot diff = a real regression to fix.
- **Rollback:** revert the structural deletion commit to restore the duplicates, then the behavioral
  swap commit to restore the canonical-selector reads — two clean reverts, render returns to `main`.
