import { createSelector } from "@ngrx/store"
import { blacklistSelector } from "../../../store/fileSettings/blacklist/blacklist.selector"
import { visibleFileStatesSelector } from "../../visibleFileStates.selector"
import { calculateEdgeMetricData } from "./edgeMetricData.calculator"
import { calculateNodeMetricData } from "./nodeMetricData.calculator"

export const metricDataSelector = createSelector(visibleFileStatesSelector, blacklistSelector, (visibleFileStates, blacklist) => {
    return {
        nodeMetricData: calculateNodeMetricData(visibleFileStates, blacklist),
        ...calculateEdgeMetricData(visibleFileStates, blacklist)
    }
})
