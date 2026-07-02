import { createSelector } from "@ngrx/store"
import { nodeMetricDataSelector } from "../../nodeMetricData/nodeMetricData.selector"
import { edgeMetricDataSelector, nodeEdgeMetricsMapSelector } from "../../../../lenses/dependency/dependencyLens.facade"

/**
 * Shrinking aggregator: node metrics are OWNED by the metrics lens and edge metrics by the dependency
 * lens (both read through their facade selectors). Cross-cutting consumers keep the combined
 * `{ nodeMetricData, edgeMetricData, nodeEdgeMetricsMap }` shape unchanged.
 */
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
