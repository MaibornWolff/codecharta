// Plop: Append reducer import here
import { margin } from "./margin/margin.reducer"
import { searchPattern } from "./searchPattern/searchPattern.reducer"
import { searchedNodePaths } from "./searchedNodePaths/searchedNodePaths.reducer"
import { focusedNodePath } from "./focusedNodePath/focusedNodePath.reducer"
import { heightMetric } from "./heightMetric/heightMetric.reducer"
import { distributionMetric } from "./distributionMetric/distributionMetric.reducer"
import { colorMetric } from "./colorMetric/colorMetric.reducer"
import { areaMetric } from "./areaMetric/areaMetric.reducer"
import { combineReducers } from "redux"

const dynamicSettings = combineReducers({
	// Plop: Append reducer usage here
	margin,
	searchPattern,
	searchedNodePaths,
	focusedNodePath,
	heightMetric,
	distributionMetric,
	colorMetric,
	areaMetric
})

export default dynamicSettings
