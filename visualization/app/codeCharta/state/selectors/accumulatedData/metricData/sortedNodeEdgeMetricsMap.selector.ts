import { createSelector } from "@ngrx/store"
import { visibleFileStatesSelector } from "../../visibleFileStates/visibleFileStates.selector"
import { blacklistSelector } from "../../../store/fileSettings/blacklist/blacklist.selector"
import { calculateEdgeMetricData, EdgeMetricCountMap, NodeEdgeMetricsMap } from "./edgeMetricData.calculator"
import { FileState } from "../../../../model/files/files"
import { BlacklistItem, EdgeMetricCount } from "../../../../codeCharta.model"
import { showIncomingEdgesSelector } from "../../../store/appSettings/showEdges/incoming/showIncomingEdges.selector"
import { showOutgoingEdgesSelector } from "../../../store/appSettings/showEdges/outgoing/showOutgoingEdges.selector"

export const sortedNodeEdgeMetricsMapSelector = createSelector(
    visibleFileStatesSelector,
    blacklistSelector,
    showIncomingEdgesSelector,
    showOutgoingEdgesSelector,
    sortNodeEdgeMetricsMap
)

function sortNodeEdgeMetricsMap(
    visibleFileStates: FileState[],
    blacklist: BlacklistItem[],
    showIncomingEdges: boolean,
    showOutgoingEdges: boolean
): NodeEdgeMetricsMap {
    const { nodeEdgeMetricsMap } = calculateEdgeMetricData(visibleFileStates, blacklist)

    const noEdgesAreShown = !showIncomingEdges && !showOutgoingEdges
    if (noEdgesAreShown) {
        return new Map()
    }

    const sortedMetricsMap = new Map()

    for (const [metricName, nodeMetrics] of nodeEdgeMetricsMap) {
        const filteredNodes = filterVisibleNodes(nodeMetrics, showIncomingEdges, showOutgoingEdges)
        const sortedNodes = sortNodesByEdgeCounts(filteredNodes, showIncomingEdges, showOutgoingEdges)
        sortedMetricsMap.set(metricName, new Map(sortedNodes))
    }

    return sortedMetricsMap
}

function filterVisibleNodes(
    nodeMetrics: EdgeMetricCountMap,
    showIncoming: boolean,
    showOutgoing: boolean
): Array<[string, EdgeMetricCount]> {
    return Array.from(nodeMetrics.entries()).filter(([_, metrics]) => {
        const hasAtLeastOneIncoming = metrics.incoming > 0
        const hasVisibleIncoming = showIncoming && hasAtLeastOneIncoming
        const hasAtLeastOneOutgoing = metrics.outgoing > 0
        const hasVisibleOutgoing = showOutgoing && hasAtLeastOneOutgoing
        return hasVisibleIncoming || hasVisibleOutgoing
    })
}

function sortNodesByEdgeCounts(
    nodes: Array<[string, EdgeMetricCount]>,
    showIncoming: boolean,
    showOutgoing: boolean
): Array<[string, EdgeMetricCount]> {
    return nodes.sort(([_, metricCountsA], [__, metricCountsB]) => {
        const totalA = calculateVisibleTotal(metricCountsA, showIncoming, showOutgoing)
        const totalB = calculateVisibleTotal(metricCountsB, showIncoming, showOutgoing)
        return totalB - totalA
    })
}

function calculateVisibleTotal(metrics: EdgeMetricCount, includeIncoming: boolean, includeOutgoing: boolean): number {
    return (includeIncoming ? metrics.incoming : 0) + (includeOutgoing ? metrics.outgoing : 0)
}
