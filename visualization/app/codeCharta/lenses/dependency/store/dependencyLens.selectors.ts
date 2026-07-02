import { createSelector } from "@ngrx/store"
import { visibleFileStatesSelector } from "../../../fileStore/store/visibleFileStates.selector"
import { blacklistMatcherSelector } from "../../../sharedView/sharedView.facade"
import { calculateEdgeMetricData } from "./edgeMetricData.calculator"

/**
 * Edge metrics for the visible selection, OWNED by the dependency lens. Inputs are EXACTLY
 * `visibleFileStates` + `blacklistMatcher` (the two `calculateEdgeMetricData` consumes) so the
 * memoization matches the edge computation that previously lived inline in `metricDataSelector`.
 * The node side is the metrics lens's `nodeMetricDataSelector`; this is its edge twin.
 */
export const edgeMetricDataResultSelector = createSelector(visibleFileStatesSelector, blacklistMatcherSelector, calculateEdgeMetricData)

export const edgeMetricDataSelector = createSelector(edgeMetricDataResultSelector, result => result.edgeMetricData)

export const nodeEdgeMetricsMapSelector = createSelector(edgeMetricDataResultSelector, result => result.nodeEdgeMetricsMap)

export const edgeMetricNamesSelector = createSelector(edgeMetricDataSelector, edgeMetricData => edgeMetricData.map(metric => metric.name))
