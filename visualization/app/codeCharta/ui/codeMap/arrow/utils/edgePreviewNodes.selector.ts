import { createSelector } from "@ngrx/store"
import { NodeEdgeMetricsMap } from "../../../../state/selectors/accumulatedData/metricData/edgeMetricData.calculator"
import { amountOfEdgePreviewsSelector } from "../../../../state/store/appSettings/amountOfEdgePreviews/amountOfEdgePreviews.selector"
import { edgeMetricSelector } from "../../../../state/store/dynamicSettings/edgeMetric/edgeMetric.selector"
import { sortedNodeEdgeMetricsMapSelector } from "../../../../state/selectors/accumulatedData/metricData/sortedNodeEdgeMetricsMap.selector"

export const edgePreviewNodesSelector = createSelector(
    sortedNodeEdgeMetricsMapSelector,
    edgeMetricSelector,
    amountOfEdgePreviewsSelector,
    (sortedNodeEdgeMetricsMap, edgeMetric, amountOfEdgePreviews) =>
        new Set(_getNodesWithHighestValue(sortedNodeEdgeMetricsMap, edgeMetric, amountOfEdgePreviews))
)

export const _getNodesWithHighestValue = (
    sortedNodeEdgeMetricsMap: NodeEdgeMetricsMap,
    edgeMetric: string,
    amountOfEdgePreviews: number
) => {
    const keys: string[] = []

    if (amountOfEdgePreviews === 0) {
        return keys
    }

    const sortedNodeEdgeMetrics = sortedNodeEdgeMetricsMap.get(edgeMetric)

    if (sortedNodeEdgeMetrics === undefined) {
        return keys
    }

    for (const key of sortedNodeEdgeMetrics.keys()) {
        keys.push(key)
        if (keys.length === amountOfEdgePreviews) {
            break
        }
    }
    return keys
}
