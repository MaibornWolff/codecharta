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
            [...nodeEdgeMetricCounts.entries()].sort((a, b) => {
                const aCount = (showIncomingEdges ? a[1].incoming : 0) + (showOutgoingEdges ? a[1].outgoing : 0)
                const bCount = (showIncomingEdges ? b[1].incoming : 0) + (showOutgoingEdges ? b[1].outgoing : 0)
                return bCount - aCount
            })
        )
        sortedNodeEdgeMetricsMap.set(metric, newSortedEdgeMetricEntry)
    }

    return sortedNodeEdgeMetricsMap
}
