// Plop: Append reducer import here
import { edgeMetricData } from "./edgeMetricData/edgeMetricData.reducer"
import { nodeMetricData } from "./nodeMetricData/nodeMetricData.reducer"
import { combineReducers } from "redux"
import { EdgeMetricData } from "../../../codeCharta.model"

const metricData = combineReducers({
	// Plop: Append sub-reducer here
	edgeMetricData,
	nodeMetricData
})

export function sortByMetricName(metricData: EdgeMetricData[]) {
	metricData.sort((a, b) => {
		const aLower = a.name.toLowerCase()
		const bLower = b.name.toLowerCase()
		return aLower > bLower ? 1 : bLower > aLower ? -1 : 0
	})
}

export default metricData
