// Plop: Append reducer import here
import { focusedNodePath } from "./focusedNodePath/focusedNodePath.reducer"
import { heightMetric } from "./heightMetric/heightMetric.reducer"
import { distributionMetric } from "./distributionMetric/distributionMetric.reducer"
import { colorMetric } from "./colorMetric/colorMetric.reducer"
import { areaMetric } from "./areaMetric/areaMetric.reducer"
import { combineReducers } from "redux"

const dynamicSettings = combineReducers({
	// Plop: Append reducer usage here
	focusedNodePath,
	heightMetric,
	distributionMetric,
	colorMetric,
	areaMetric
})

export default dynamicSettings
