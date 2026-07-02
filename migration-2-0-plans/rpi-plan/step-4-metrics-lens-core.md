---
name: metrics-lens-core-store-repos-facade
issue:
state: complete
version: 2
---

## Goal

Stand up the data core of the **Metrics lens** (`lenses/metrics/`): a `store/` that projects + merges
node-metric data for the visible selection, two `repos/`, and the public `metricsLens.facade.ts`. The
facade must serve **all three** Slice-1 consumer shapes (legend, codeMap `getNodes()`, ngrx-selector
graphs) — see Task 4. Additive and behavior-preserving: it reproduces today's metric numbers exactly;
no features move and no old selectors are deleted yet (steps 5/6).

## Tasks

### 1. `store/` — project + merge node metrics for the visible selection
- New `lenses/metrics/store/metricsLens.store.ts` + `metricsLens.selectors.ts`.
- Port the pure projection from `state/selectors/accumulatedData/metricData/nodeMetricData.calculator.ts`
  (`calculateNodeMetricData` over `visibleFileStates` + `BlacklistMatcher`, incl. `UNARY_METRIC` and
  `sortByMetricName`) into a selector **`nodeMetricDataSelector`** whose inputs are exactly today's
  `visibleFileStatesSelector` + `blacklistMatcherSelector` — **nothing else** (the calculator consumes
  only those two; do NOT fold attributeDescriptors/types into it or its memoization breaks).
- Add **`metricRangeSelector`** = the node-only re-implementation of `selectedColorMetricDataSelector`
  (`createSelector(nodeMetricDataSelector, colorMetricSelector, …)`). **Emit the exact existing
  `MetricMinMax` shape `{ values, minValue, maxValue }`** (same field names as today's selector) with the
  same missing-metric fallback `{ values: [], minValue: 0, maxValue: 0 }` — so every consumer (legend,
  metricsBar, inspector) is a drop-in with **no field remap**.
- Add an injectable `MetricsLensStore` exposing `nodeMetricData$`, `attributeDescriptors$`,
  `attributeTypes$` (node side; reuse the **existing** `attributeDescriptorsSelector` /
  `attributeTypesSelector` so step-5 `overrideSelector` test wiring still propagates — do not fork them).
- Edge metrics stay OUT (dependency lens, later slice); the old `metricDataSelector` keeps serving edges.

### 2. `repos/attributes.repo.ts` — metric-value data access (sync + reactive)
- `AttributesRepo` (injectable) reads `MetricsLensStore`. API:
  - `availableMetrics(): string[]` / `availableMetrics$` — sorted `NodeMetricData[].name`.
  - `rangeOf(metric): MetricMinMax` (`{values,minValue,maxValue}`, sync snapshot) **and** `rangeOf$(metric)`
    (observable) — both over `metricRangeSelector`; same shape + fallback as today's
    `selectedColorMetricDataSelector`. (`rangeOf` for color = `rangeOf(colorMetric)`.)
  - `getNodeMetricData(): NodeMetricData[]` (sync snapshot) **and** `nodeMetricData$` — the full array
    the codeMap render path needs in `getNodes()`.
- `valueOf(id, metric)` is **dropped from this slice** — no in-slice consumer, and `data.id` is only
  assigned later inside `accumulatedDataSelector`/`NodeDecorator`, not in this store's inputs. Re-add it
  in a later slice against the decorated `accumulatedDataSelector` if a consumer appears.

### 3. `repos/descriptors.repo.ts` — metric metadata (sync + reactive)
- `DescriptorsRepo` (injectable) reads `MetricsLensStore`. Exposes `descriptors()` + `descriptors$`
  (`AttributeDescriptors`) and `attributeTypes()` + `attributeTypes$` (node side; handle
  `AttributeTypes.nodes` being **optional** — default `{}`).

### 4. `metricsLens.facade.ts` — the public surface (THE contract for steps 5 & 6)
The facade is the **only** import outsiders use (dep-cruiser `lens-external-access-only-via-public-surface`);
`store/` + `repos/` stay private. It provides three things so every consumer is satisfied:
- **(a) Injectable `MetricsLensFacade`** composing both repos, for service/component consumers:
  `availableMetrics()/$`, `rangeOf(metric)/$`, `selectedColorMetricData$` (= `rangeOf$(colorMetric)`),
  `getNodeMetricData()` (sync snapshot for `getNodes()`), `nodeMetricData$`, `descriptors()/$`,
  `attributeTypes()/$`.
- **(b) Re-exported public ngrx selectors** (a plain re-export from `metricsLens.facade.ts`), for the
  `createSelector` graphs that cannot inject a service and must not import `store/`/`repos/` directly:
  `nodeMetricDataSelector`, `metricRangeSelector`, plus the node `attributeDescriptorsSelector` /
  `attributeTypesSelector`. These are what `accumulatedData` / `inspectorMetricRows` /
  `metricColorRangeValues` compose in step 6.
- Decision recorded: `rangeOf` exists in **both** a sync-method form (codeMap snapshot) and a
  selector/observable form (legend, metricsBar) — both back onto `metricRangeSelector`.

### 5. Parity unit tests (TDD)
- `metricsLens.store.spec.ts`: `nodeMetricDataSelector` mirrors `nodeMetricData.calculator.spec.ts`
  (functions/mcc/rloc + unary; blacklist exclusion; empty selection → `[]`). Reuse `TEST_DELTA_MAP_A`,
  `VALID_NODE_WITH_ROOT_UNARY`, `createBlacklistMatcher`.
- `attributes.repo.spec.ts`: `rangeOf(colorMetric)` value-equals `selectedColorMetricDataSelector`
  (present + missing-metric fallback); `getNodeMetricData()` equals `metricDataSelector(state).nodeMetricData`;
  `availableMetrics()` equals the sorted names.
- `descriptors.repo.spec.ts`: equals `attributeDescriptorsSelector` / `attributeTypesSelector` (node side),
  including the `attributeTypes.nodes === undefined` → `{}` case.

## Steps

- [x] Complete Task 1: `store/` (`nodeMetricDataSelector`, `metricRangeSelector`) + `MetricsLensStore`
- [x] Complete Task 2: `repos/attributes.repo.ts` (sync + reactive `rangeOf`, `getNodeMetricData`)
- [x] Complete Task 3: `repos/descriptors.repo.ts` (optional `attributeTypes.nodes` handled)
- [x] Complete Task 4: `metricsLens.facade.ts` — injectable service **+** re-exported public selectors
- [x] Complete Task 5: parity unit tests green against the current selectors
- [x] Verify: `npx tsc --noEmit`; `npm test` (new specs + untouched `metricData`/`selectedColorMetricData` specs); `npm run lint:architecture` (lens rules at `warn`, no new violations)

## Review Feedback Addressed

1. **Facade contract (C1/C6, PRIMARY)**: the facade now owns all three surfaces consumers need — an
   injectable service (sync `getNodeMetricData()` + reactive forms) **and** a re-exported public ngrx
   selector surface (`nodeMetricDataSelector`/`metricRangeSelector`/descriptor+type selectors). Steps 5
   and 6 only consume it; nothing is "assumed built elsewhere".
2. **`valueOf` dropped**: no in-slice consumer and the `data.id` source it relied on isn't in the
   store's inputs.
3. **Selector inputs precision**: `nodeMetricDataSelector` takes only `visibleFileStates` +
   `blacklistMatcher` (matching the calculator); descriptors/types are separate store observables/selectors.
4. **Reuse existing descriptor/type selectors** so step-5 `overrideSelector` test wiring still works.
5. **Optional `AttributeTypes.nodes`** handled (`?` → `{}`).

## Notes

- **Tidy First (structural, additive):** only ADDs files + asserts parity; deletes nothing. Repointing
  consumers + deleting duplicates is step 6; Legend moves in step 5.
- **Scope guards:** node metrics only; edges/dependency/structure/terms lenses out; no renderer/page split.
- **State source:** reads today's `visibleFileStatesSelector` + `blacklistMatcherSelector` directly
  (swapping to the step-3 fileStore facade is a later wiring detail, not needed for parity).
- **Rollback:** purely additive/unconsumed — `git revert` the single commit; zero runtime impact.
- **Verification deferred to step 7:** the render-pipeline Jest snapshot proof + dep-cruiser flip to
  `error` run after consumers are repointed (step 6).
