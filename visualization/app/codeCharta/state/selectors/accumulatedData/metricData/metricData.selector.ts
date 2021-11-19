import { createSelector } from "../../../angular-redux/createSelector"
import { edgeMetricDataSelector } from "./edgeMetricData.selector"
import { nodeMetricDataSelector } from "./nodeMetricData.selector"

export const metricDataSelector = createSelector([nodeMetricDataSelector, edgeMetricDataSelector], (nodeMetricData, edgeMetricData) => ({
	nodeMetricData,
	edgeMetricData
}))
