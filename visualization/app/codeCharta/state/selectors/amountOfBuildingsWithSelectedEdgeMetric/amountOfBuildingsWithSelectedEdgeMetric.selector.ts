import { createSelector } from "@ngrx/store"
import { nodeEdgeMetricsMapSelector } from "../edgeMetricData/edgeMetricData.selector"
import { showIncomingEdgesSelector, showOutgoingEdgesSelector, edgeMetricSelector } from "../../../mapState/mapState.facade"
import { EdgeMetricCountMap, NodeEdgeMetricsMap } from "../../../codeCharta.model"

export const amountOfBuildingsWithSelectedEdgeMetricSelector = createSelector(
    nodeEdgeMetricsMapSelector,
    edgeMetricSelector,
    showIncomingEdgesSelector,
    showOutgoingEdgesSelector,
    countBuildingsWithEdgeMetric
)

function countBuildingsWithEdgeMetric(
    nodeEdgeMetricsMap: NodeEdgeMetricsMap,
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
