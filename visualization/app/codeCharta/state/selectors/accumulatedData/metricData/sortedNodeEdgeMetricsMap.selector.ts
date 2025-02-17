import { createSelector } from "@ngrx/store"
import { visibleFileStatesSelector } from "../../visibleFileStates/visibleFileStates.selector"
import { blacklistSelector } from "../../../store/fileSettings/blacklist/blacklist.selector"
import { calculateEdgeMetricData } from "./edgeMetricData.calculator"

export const sortedNodeEdgeMetricsMapSelector = createSelector(
    visibleFileStatesSelector,
    blacklistSelector,
    (visibleFileStates, blacklist) => {
        const { nodeEdgeMetricsMap } = calculateEdgeMetricData(visibleFileStates, blacklist)

        const sortedNodeEdgeMetricsMap = new Map()

        for (const [key, value] of nodeEdgeMetricsMap) {
            const newSortedEdgeMetricEntry = new Map(
                [...value.entries()].sort((a, b) => {
                    const aCount = a[1].incoming + a[1].outgoing
                    const bCount = b[1].incoming + b[1].outgoing
                    return bCount - aCount
                })
            )
            sortedNodeEdgeMetricsMap.set(key, newSortedEdgeMetricEntry)
        }

        return sortedNodeEdgeMetricsMap
    }
)
