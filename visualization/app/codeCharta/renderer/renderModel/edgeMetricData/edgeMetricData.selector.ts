import { createSelector } from "@ngrx/store"
import { calculateEdgeMetricData } from "../../../lenses/dependency/dependencyLens.facade"
import { visibleFileStatesSelector } from "../../../stores/fileStore/fileStore.facade"
import { blacklistMatcherSelector } from "../../../stores/sharedView/sharedView.read.facade"

// Lives outside the dependency lens: a lens must not read mutable view state (blacklistMatcher).
const edgeMetricDataResultSelector = createSelector(visibleFileStatesSelector, blacklistMatcherSelector, calculateEdgeMetricData)

export const edgeMetricDataSelector = createSelector(edgeMetricDataResultSelector, result => result.edgeMetricData)

export const nodeEdgeMetricsMapSelector = createSelector(edgeMetricDataResultSelector, result => result.nodeEdgeMetricsMap)

export const edgeMetricNamesSelector = createSelector(edgeMetricDataSelector, edgeMetricData => edgeMetricData.map(metric => metric.name))
