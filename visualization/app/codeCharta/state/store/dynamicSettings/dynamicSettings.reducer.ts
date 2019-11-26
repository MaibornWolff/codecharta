// Plop: Append reducer import here
import { areaMetric } from "./areaMetric/areaMetric.reducer"
import { combineReducers } from "redux"

const dynamicSettings = combineReducers({
	// Plop: Append reducer usage here
	areaMetric
})

export default dynamicSettings
