import { createSelector } from "@ngrx/store"
import { blacklistMatcherSelector } from "../../../store/fileSettings/blacklist/blacklistMatcher.selector"
import { visibleFileStatesSelector } from "../../../../fileStore/store/visibleFileStates.selector"
import { nodeMetricDataSelector } from "../../../../lenses/metrics/metricsLens.facade"
import { calculateEdgeMetricData } from "./edgeMetricData.calculator"

/**
 * Shrinking aggregator: the node-metric side is now OWNED by the metrics lens (read through its
 * facade selector), the edge side stays here for the future dependency lens. Cross-cutting consumers
 * keep the combined `{ nodeMetricData, edgeMetricData, nodeEdgeMetricsMap }` shape unchanged.
 */
export const metricDataSelector = createSelector(
    nodeMetricDataSelector,
    visibleFileStatesSelector,
    blacklistMatcherSelector,
    (nodeMetricData, visibleFileStates, matcher) => {
        return {
            nodeMetricData,
            ...calculateEdgeMetricData(visibleFileStates, matcher)
        }
    }
)
