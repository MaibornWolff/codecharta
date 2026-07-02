---
name: viz-2.0-slice-7-mapstate-metrics
issue:
state: complete
version: 1
---

# Slice 7 — Map metric SELECTION → mapState + parameterize the metrics lens

> Full plan: `roadmap-v2-state-homes.md` → "Slice 7". Safety model: `CONVENTIONS.md`
> (snapshots ARE the contract, never `-u`; structural vs behavioral commits separate;
> code-boundary move THEN store-key reshape; branch-by-abstraction with a value-equality
> parity test before deleting the old read). Reuses the Slice-5/6 reshape machinery.

## Goal (two halves)

1. Move the five metric-selection keys `areaMetric`/`heightMetric`/`colorMetric`/
   `distributionMetric`/`edgeMetric` from the `dynamicSettings` grab-bag into `state.mapState`
   (resolves CF **#3** + **#2b-selection**).
2. Parameterize the metrics lens off view state (P0-1, half 1): the lens must import **no**
   `state/dynamicSettings` and **no** `blacklist` selectors. Lift the blacklist filtering out of
   `nodeMetricDataSelector` into a derived selector; the map feature supplies `mapState.colorMetric`.

Unlike Slices 5/6, this reshape **does** change the URL round-trip (metric params + the reset/
link/edge effects).

## Key facts verified in code (scope)

- **The metric `set*` actions can stay in `dynamicSettingsActions`.** `actionsRequiringSaveCcState`
  flattens `[fileSettings, appSettings, dynamicSettings, files, setState]` together, so the whole
  `CcState` is persisted on any of them — where a metric action lives in the barrels is
  behavior-neutral (Slice-6 precedent). Only import paths were repointed (commit A), never the arrays.
- **The metrics lens genuinely needs the blacklist** to compute the node metric data its consumers
  (incl. `codeMap.render.service`, `export3DMapDialog`, the color-range popovers, and `rangeOf`)
  require. So Slice 7 cannot make the lens store/repo serve *unfiltered* data without a snapshot
  change. Instead the blacklist-reading selectors were **relocated out of the lens** into
  `state/selectors/nodeMetricData/`, and the lens store re-reads them from there (a transitional
  `lens → state/` warn edge; `lens-no-view-state` stays warn until 13).
- **Cycle landmine.** A derived selector in `state/` that imported `calculateNodeMetricData`/
  `rangeOfMetric` via the metrics-lens **facade** would close a runtime module cycle
  (`state → facade → attributesRepo → store → state`). Broken by moving those **pure** primitives to
  the `util/metric` kernel (commit C) so the derived module needs no lens import.
- **First-render availability gate.** `areDynamicSettingsAvailable` gated first render on the metrics
  being non-null (notably `distributionMetric`, which `areChosenMetrics` does NOT cover). The metrics
  left `dynamicSettings`, so the gate now folds them back in from mapState — the checked object is
  value-identical to the pre-Slice-7 `{ ...dynamicSettings, colorRange }`.
- **URL read side needs no change:** metric URL params are applied by `LoadInitialFileStore.
  setMetricsFromUrlValues` (dispatches the mapState actions, repointed in commit A); `urlExtractor`
  reads no metrics.

## Commits (4)

1. **Structural** (`12e718eed`): `git mv` the 5 metric folders `state/store/dynamicSettings/* →
   mapState/store/*`; 53 importers repointed to `mapState.facade` (+15 facade re-exports); moved
   reducers/selectors only adjust import paths (byte-identical bodies, still read
   `dynamicSettingsSelector` transitionally). dep-cruiser: `.spec/.e2e` exempted from
   `filestore-has-no-upward-deps` (the loader spec references metric action creators that moved from
   the rule-allowed `state/` into the forbidden `mapState` home; mirrors `new-must-not-import-legacy`'s
   spec exemption; **no severity flip**). Zero snapshot diff.
2. **Behavioral reshape** (`b34389ee5`): model split (`MapState extends PrimaryMetrics` +
   `distributionMetric`; `DynamicSettings` drops them); `mapState` combineReducers/defaults gain the 5;
   the 5 leaf selectors + 3dPrint's duplicate selectors read `mapStateSelector`; applier moves the 5
   cases `mapDynamicSettingToAction → mapMapStateToAction`; URL round-trip (`updateQueryParameters`
   reads `state.mapState`); scenarios (`buildMetricsPatch` keys `mapState`; `buildScenarioSections`
   reads `state.mapState`); IndexedDB `DB_VERSION 4→5` + `migrateCcStateRecordToV5` (chained after v4)
   +4 tests; availability gate folds the metrics back in; all dotted readers + mocks repointed.
   Zero snapshot diff.
3. **Structural** (`3b8c7ad2b`): `git mv nodeMetricData.calculator.ts → util/metric/`; extract
   `MetricRange` + `rangeOfMetric` → `util/metric/metricRange.ts`. Breaks the derived-selector cycle.
   Zero snapshot diff.
4. **Behavioral / lens parameterization** (`12cd501e6`): `git mv metricsLens.selectors.ts →
   state/selectors/nodeMetricData/nodeMetricData.selector.ts`; the lens store re-reads the derived
   selectors from there; facade drops the two selector re-exports; 10 consumers repointed; parity test
   (derived == `calculateNodeMetricData ∘ rangeOfMetric` under empty + non-empty blacklist). The
   metrics lens now imports **no** blacklist and **no** dynamicSettings selectors (grep-verified).

## DoD — met

- ✅ metric selection under `state.mapState`; `dynamicSettings` holds only `sortingOption`/
  `focusedNodePath`/`searchPattern`.
- ✅ the metrics lens imports **no** `state/dynamicSettings` and **no** `blacklist` selectors.
- ✅ `rangeOf(metric)` parity: derived range value-equals `rangeOfMetric` over the same-matcher
  node data (guards the old-read deletion).
- ✅ snapshots byte-identical (45/45, no `-u`); `tsc` clean; `npm test` 2281 passing;
  `lint:architecture` 0 errors.
- ✅ dep-cruiser: `new-must-not-import-legacy` metrics-lens edges drop (114→109 warn bridges);
  **no rule flip** this slice.

## Not run in this environment (CI / manual)

Playwright e2e (metric-picker, URL metric params, reset/link/edge flows) and manual side-by-side vs
`main` for label positioning / hover (what snapshots don't cover). Jest zero-snapshot-diff + the
parity + v5 migration tests are the automated proof.

## Rollback

Revert `12cd501e6` to keep the reshape but restore the in-lens selectors; revert `3b8c7ad2b` to move
the calc back into the lens; revert `b34389ee5` to keep the folder move at the dynamicSettings shape;
revert `12e718eed` to return to the Slice-6 shape.
