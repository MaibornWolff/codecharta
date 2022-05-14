import { createSelector } from "../../../angular-redux/createSelector"
import { colorMetricSelector } from "../../../store/dynamicSettings/colorMetric/colorMetric.selector"
import { CcState } from "../../../store/store"
import { nodeMetricDataSelector } from "./nodeMetricData.selector"

export type NodeMetricRange = {
	minValue: number
	maxValue: number
}

export const nodeMetricRangeSelector: (state: CcState) => NodeMetricRange = createSelector(
	[nodeMetricDataSelector, colorMetricSelector],
	(nodeMetricData, colorMetric) => {
		const data = nodeMetricData.find(x => x.name === colorMetric)
		return {
			minValue: data?.minValue ?? 0,
			maxValue: data?.maxValue ?? 0
		}
	}
)
