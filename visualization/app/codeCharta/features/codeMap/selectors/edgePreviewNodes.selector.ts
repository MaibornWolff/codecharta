import { createSelector } from "@ngrx/store"
import { NodeEdgeMetricsMap } from "../../../codeCharta.model"
import { amountOfEdgePreviewsSelector } from "../../../state/store/appSettings/amountOfEdgePreviews/amountOfEdgePreviews.selector"
import { edgeMetricSelector } from "../../../state/store/dynamicSettings/edgeMetric/edgeMetric.selector"
import { sortedNodeEdgeMetricsMapSelector } from "../../../state/selectors/accumulatedData/metricData/sortedNodeEdgeMetricsMap.selector"

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
    // floor: a fractional amount (e.g. restored from a URL) must not disable the cutoff
    const limit = Math.floor(amountOfEdgePreviews)

    if (Number.isNaN(limit) || limit <= 0) {
        return keys
    }

    const sortedNodeEdgeMetrics = sortedNodeEdgeMetricsMap.get(edgeMetric)

    if (sortedNodeEdgeMetrics === undefined) {
        return keys
    }

    for (const key of sortedNodeEdgeMetrics.keys()) {
        keys.push(key)
        if (keys.length >= limit) {
            break
        }
    }
    return keys
}
