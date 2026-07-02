import { createSelector } from "@ngrx/store"
import { visibleFileStatesSelector } from "../../../fileStore/store/visibleFileStates.selector"
import { blacklistMatcherSelector } from "../../../sharedView/sharedView.facade"
import { calculateEdgeMetricData } from "../../../lenses/dependency/dependencyLens.facade"

/**
 * Derived (view-state-aware) edge-metric selectors — Slice 9b P0-1 (half 2).
 *
 * These compose the dependency lens's RAW edge-metric computation (`calculateEdgeMetricData`, exposed
 * through the lens facade) with VIEW STATE — the `blacklist` matcher (sharedView). They live OUTSIDE the
 * dependency lens deliberately: a lens must not read mutable view state (the `lens-no-view-state` goal).
 * Slice 9b lifted these out of `lenses/dependency/store/` — the edge twin of the metrics lens's
 * `nodeMetricDataSelector`, which lives one dir over. The lens now exposes only the pure calc.
 *
 * Inputs are EXACTLY `visibleFileStates` + `blacklistMatcher` (the two `calculateEdgeMetricData` consumes)
 * so the memoization matches the edge computation that previously lived inside the lens.
 */
export const edgeMetricDataResultSelector = createSelector(visibleFileStatesSelector, blacklistMatcherSelector, calculateEdgeMetricData)

export const edgeMetricDataSelector = createSelector(edgeMetricDataResultSelector, result => result.edgeMetricData)

export const nodeEdgeMetricsMapSelector = createSelector(edgeMetricDataResultSelector, result => result.nodeEdgeMetricsMap)

export const edgeMetricNamesSelector = createSelector(edgeMetricDataSelector, edgeMetricData => edgeMetricData.map(metric => metric.name))
