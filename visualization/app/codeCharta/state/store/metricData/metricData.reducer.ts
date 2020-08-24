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
	return metricData.sort((a, b) => (a.name > b.name ? 1 : b.name > a.name ? -1 : 0))
}

export default metricData
