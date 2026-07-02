import { defaultSortingOption, sortingOption } from "./sortingOption/sortingOption.reducer"
import { defaultEdgeMetric, edgeMetric } from "../../../mapState/store/edgeMetric/edgeMetric.reducer"
import { defaultSearchPattern, searchPattern } from "./searchPattern/searchPattern.reducer"
import { defaultFocusedNodePath, focusedNodePath } from "./focusedNodePath/focusedNodePath.reducer"
import { defaultHeightMetric, heightMetric } from "../../../mapState/store/heightMetric/heightMetric.reducer"
import { defaultDistributionMetric, distributionMetric } from "../../../mapState/store/distributionMetric/distributionMetric.reducer"
import { colorMetric, defaultColorMetric } from "../../../mapState/store/colorMetric/colorMetric.reducer"
import { areaMetric, defaultAreaMetric } from "../../../mapState/store/areaMetric/areaMetric.reducer"
import { combineReducers } from "@ngrx/store"

export const dynamicSettings = combineReducers({
    sortingOption,
    edgeMetric,
    searchPattern,
    focusedNodePath,
    heightMetric,
    distributionMetric,
    colorMetric,
    areaMetric
})

export const defaultDynamicSettings = {
    sortingOption: defaultSortingOption,
    edgeMetric: defaultEdgeMetric,
    searchPattern: defaultSearchPattern,
    focusedNodePath: defaultFocusedNodePath,
    heightMetric: defaultHeightMetric,
    distributionMetric: defaultDistributionMetric,
    colorMetric: defaultColorMetric,
    areaMetric: defaultAreaMetric
}
