// Plop: Append reducer import here
import { edgeMetricData } from "./edgeMetricData/edgeMetricData.reducer"
import { nodeMetricData } from "./nodeMetricData/nodeMetricData.reducer"
import { combineReducers } from "redux"

const metricData = combineReducers({
	// Plop: Append sub-reducer here
	edgeMetricData,
	nodeMetricData
})

export default metricData
