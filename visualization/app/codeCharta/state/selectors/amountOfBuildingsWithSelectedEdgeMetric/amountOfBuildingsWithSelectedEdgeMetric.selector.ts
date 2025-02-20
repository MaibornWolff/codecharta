import { createSelector } from "@ngrx/store"
import { metricDataSelector } from "../accumulatedData/metricData/metricData.selector"
import { edgeMetricSelector } from "../../store/dynamicSettings/edgeMetric/edgeMetric.selector"
import { showIncomingEdgesSelector } from "../../store/appSettings/showEdges/incoming/showIncomingEdges.selector"
import { showOutgoingEdgesSelector } from "../../store/appSettings/showEdges/outgoing/showOutgoingEdges.selector"
import { EdgeMetricCountMap } from "../accumulatedData/metricData/edgeMetricData.calculator"

export const amountOfBuildingsWithSelectedEdgeMetricSelector = createSelector(
    metricDataSelector,
    edgeMetricSelector,
    showIncomingEdgesSelector,
    showOutgoingEdgesSelector,
    countBuildingsWithEdgeMetric
)

function countBuildingsWithEdgeMetric(
    { edgeMetricData: _edgeMetricData, nodeEdgeMetricsMap, nodeMetricData: _nodeMetricData },
    edgeMetric: string,
    showIncomingEdges: boolean,
    showOutgoingEdges: boolean
) {
    const nodeEdgeMetricCounts: EdgeMetricCountMap | undefined = nodeEdgeMetricsMap.get(edgeMetric)
    const noEdgesAreShown = !showIncomingEdges && !showOutgoingEdges
    if (!nodeEdgeMetricCounts || noEdgesAreShown) {
        return 0
    }

    let count = 0
    for (const nodeEdgeMetricCount of nodeEdgeMetricCounts.values()) {
        const atLeastOneIncomingEdgeIsShown = showIncomingEdges && nodeEdgeMetricCount.incoming > 0
        const atLeastOneOutgoingEdgeIsShown = showOutgoingEdges && nodeEdgeMetricCount.outgoing > 0
        if (atLeastOneIncomingEdgeIsShown || atLeastOneOutgoingEdgeIsShown) {
            count++
        }
    }

    return count
}
