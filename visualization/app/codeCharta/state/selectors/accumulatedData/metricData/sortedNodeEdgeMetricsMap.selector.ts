import { createSelector } from "@ngrx/store"
import { visibleFileStatesSelector } from "../../visibleFileStates/visibleFileStates.selector"
import { blacklistSelector } from "../../../store/fileSettings/blacklist/blacklist.selector"
import { calculateEdgeMetricData, NodeEdgeMetricsMap } from "./edgeMetricData.calculator"
import { FileState } from "../../../../model/files/files"
import { BlacklistItem } from "../../../../codeCharta.model"

export const sortedNodeEdgeMetricsMapSelector = createSelector(
    visibleFileStatesSelector,
    blacklistSelector,
    (visibleFileStates: FileState[], blacklist: BlacklistItem[]): NodeEdgeMetricsMap => {
        const { nodeEdgeMetricsMap } = calculateEdgeMetricData(visibleFileStates, blacklist)

        const sortedNodeEdgeMetricsMap = new Map()

        for (const [metric, node] of nodeEdgeMetricsMap) {
            const newSortedEdgeMetricEntry = new Map(
                [...node.entries()].sort((a, b) => {
                    const aCount = a[1].incoming + a[1].outgoing
                    const bCount = b[1].incoming + b[1].outgoing
                    return bCount - aCount
                })
            )
            sortedNodeEdgeMetricsMap.set(metric, newSortedEdgeMetricEntry)
        }

        return sortedNodeEdgeMetricsMap
    }
)
