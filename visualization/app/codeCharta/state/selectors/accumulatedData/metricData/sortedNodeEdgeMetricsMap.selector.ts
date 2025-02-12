import { createSelector } from "@ngrx/store"
import { visibleFileStatesSelector } from "../../visibleFileStates/visibleFileStates.selector"
import { blacklistSelector } from "../../../store/fileSettings/blacklist/blacklist.selector"
import { calculateEdgeMetricData, NodeEdgeMetricsMap } from "./edgeMetricData.calculator"
import { FileState } from "../../../../model/files/files"
import { BlacklistItem } from "../../../../codeCharta.model"
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
    if (!showIncomingEdges && !showOutgoingEdges) {
        return new Map()
    }
    const sortedNodeEdgeMetricsMap = new Map()

    for (const [metric, nodeEdgeMetricCounts] of nodeEdgeMetricsMap) {
        const newSortedEdgeMetricEntry = new Map(
            [...nodeEdgeMetricCounts.entries()]
                .filter(nodeEdgeMetricCounts => {
                    const incomingEdgesVisible = showIncomingEdges && nodeEdgeMetricCounts[1].incoming > 0
                    const outgoingEdgesVisible = showOutgoingEdges && nodeEdgeMetricCounts[1].outgoing > 0
                    return incomingEdgesVisible || outgoingEdgesVisible
                })
                .sort((a, b) => {
                    const aCountIncoming = showIncomingEdges ? a[1].incoming : 0
                    const aCountOutgoing = showOutgoingEdges ? a[1].outgoing : 0
                    const bCountIncoming = showIncomingEdges ? b[1].incoming : 0
                    const bCountOutgoing = showOutgoingEdges ? b[1].outgoing : 0
                    return bCountIncoming + bCountOutgoing - (aCountIncoming + aCountOutgoing)
                })
        )
        sortedNodeEdgeMetricsMap.set(metric, newSortedEdgeMetricEntry)
    }

    return sortedNodeEdgeMetricsMap
}
