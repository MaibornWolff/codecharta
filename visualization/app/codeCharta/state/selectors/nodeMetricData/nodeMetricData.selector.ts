import { createSelector } from "@ngrx/store"
import { calculateNodeMetricData } from "../../../util/metric/nodeMetricData.calculator"
import { rangeOfMetric } from "../../../util/metric/metricRange"
import { blacklistMatcherSelector } from "../../../sharedView/sharedView.facade"
import { colorMetricSelector } from "../../../mapState/mapState.facade"
import { visibleFileStatesSelector } from "../../../fileStore/store/visibleFileStates.selector"

/**
 * Derived (view-state-aware) node-metric selectors — Slice 7 P0-1.
 *
 * These compose the metrics lens's raw projection (`calculateNodeMetricData` over the visible file
 * selection, from the util kernel) with VIEW STATE — the `blacklist` matcher and the chosen
 * `colorMetric`. They live OUTSIDE the metrics lens deliberately: a lens must not read mutable view
 * state (the `lens-no-view-state` goal). The lens's store/repo/facade re-read `nodeMetricDataSelector`
 * from here so `getNodeMetricData()`/`rangeOf()` keep returning blacklist-filtered data unchanged.
 * Because the calc + `rangeOfMetric` are in `util/`, this module needs no lens import, so
 * `metricsLens.store → this → …` closes no cycle.
 */

/**
 * Node metrics for the visible selection. Inputs are EXACTLY `visibleFileStates` + `blacklistMatcher`
 * (the two `calculateNodeMetricData` consumes) so the selector's memoization matches today's
 * `metricDataSelector`. Edge metrics stay on the legacy `metricDataSelector` (dependency lens, later).
 */
export const nodeMetricDataSelector = createSelector(visibleFileStatesSelector, blacklistMatcherSelector, calculateNodeMetricData)

/** Node-only re-implementation of `selectedColorMetricDataSelector`: the range of the color metric. */
export const metricRangeSelector = createSelector(nodeMetricDataSelector, colorMetricSelector, rangeOfMetric)
