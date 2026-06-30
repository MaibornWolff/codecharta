import { createSelector } from "@ngrx/store"
import { blacklistMatcherSelector } from "../../../store/fileSettings/blacklist/blacklistMatcher.selector"
import { visibleFileStatesSelector } from "../../../../fileStore/store/visibleFileStates.selector"
import { calculateEdgeMetricData } from "./edgeMetricData.calculator"
import { calculateNodeMetricData } from "./nodeMetricData.calculator"

export const metricDataSelector = createSelector(visibleFileStatesSelector, blacklistMatcherSelector, (visibleFileStates, matcher) => {
    return {
        nodeMetricData: calculateNodeMetricData(visibleFileStates, matcher),
        ...calculateEdgeMetricData(visibleFileStates, matcher)
    }
})
