import { createSelector } from "@ngrx/store"
import { edgeMetricDataSelector, nodeEdgeMetricsMapSelector } from "../../edgeMetricData/edgeMetricData.selector"
import { nodeMetricDataSelector } from "../../nodeMetricData/nodeMetricData.selector"

export const metricDataSelector = createSelector(
    nodeMetricDataSelector,
    edgeMetricDataSelector,
    nodeEdgeMetricsMapSelector,
    (nodeMetricData, edgeMetricData, nodeEdgeMetricsMap) => ({
        nodeMetricData,
        edgeMetricData,
        nodeEdgeMetricsMap
    })
)
