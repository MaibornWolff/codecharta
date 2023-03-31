import { colorMode } from "./colorMode/colorMode.reducer"
import { sortingOption } from "./sortingOption/sortingOption.reducer"
import { edgeMetric } from "./edgeMetric/edgeMetric.reducer"
import { colorRange } from "./colorRange/colorRange.reducer"
import { margin } from "./margin/margin.reducer"
import { searchPattern } from "./searchPattern/searchPattern.reducer"
import { focusedNodePath } from "./focusedNodePath/focusedNodePath.reducer"
import { heightMetric } from "./heightMetric/heightMetric.reducer"
import { distributionMetric } from "./distributionMetric/distributionMetric.reducer"
import { colorMetric } from "./colorMetric/colorMetric.reducer"
import { areaMetric } from "./areaMetric/areaMetric.reducer"
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
