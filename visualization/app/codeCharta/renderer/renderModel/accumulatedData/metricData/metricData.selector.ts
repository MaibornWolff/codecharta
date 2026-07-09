import { createSelector } from "@ngrx/store"
import { edgeMetricDataSelector, nodeEdgeMetricsMapSelector } from "../../edgeMetricData/edgeMetricData.selector"
import { nodeMetricDataSelector } from "../../nodeMetricData/nodeMetricData.selector"

/**
 * Shrinking aggregator over the two derived metric-data selectors: `nodeMetricData` composes the metrics
 * lens's node computation with view state, `edgeMetricData`/`nodeEdgeMetricsMap` compose the dependency
 * lens's edge computation with the blacklist (Slice 9b lifted both view-state compositions OUT of the
 * lenses into `renderModel/{node,edge}MetricData/`). Cross-cutting consumers keep the combined
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
