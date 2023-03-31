import { colorMode } from "./colorMode/colorMode.reducer"
import { defaultSortingOption, sortingOption } from "./sortingOption/sortingOption.reducer"
import { defaultEdgeMetric, edgeMetric } from "./edgeMetric/edgeMetric.reducer"
import { colorRange, defaultColorRange } from "./colorRange/colorRange.reducer"
import { defaultMargin, margin } from "./margin/margin.reducer"
import { defaultSearchPattern, searchPattern } from "./searchPattern/searchPattern.reducer"
import { defaultFocusedNodePath, focusedNodePath } from "./focusedNodePath/focusedNodePath.reducer"
import { defaultHeightMetric, heightMetric } from "./heightMetric/heightMetric.reducer"
import { defaultDistributionMetric, distributionMetric } from "./distributionMetric/distributionMetric.reducer"
import { colorMetric, defaultColorMetric } from "./colorMetric/colorMetric.reducer"
import { areaMetric, defaultAreaMetric } from "./areaMetric/areaMetric.reducer"
import { combineReducers } from "@ngrx/store"

export const dynamicSettings = combineReducers({
	colorMode,
	sortingOption,
	edgeMetric,
	colorRange,
	margin,
	searchPattern,
	focusedNodePath,
	heightMetric,
	distributionMetric,
	colorMetric,
	areaMetric
})

export const defaultDynamicSettings = {
	colorMode: defaultColorMetric,
	sortingOption: defaultSortingOption,
	edgeMetric: defaultEdgeMetric,
	colorRange: defaultColorRange,
	margin: defaultMargin,
	searchPattern: defaultSearchPattern,
	focusedNodePath: defaultFocusedNodePath,
	heightMetric: defaultHeightMetric,
	distributionMetric: defaultDistributionMetric,
	colorMetric: defaultColorMetric,
	areaMetric: defaultAreaMetric
}
