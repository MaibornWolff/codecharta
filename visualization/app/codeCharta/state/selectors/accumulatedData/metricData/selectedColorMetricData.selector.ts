import { createSelector } from "../../../angular-redux/createSelector"
import { colorMetricSelector } from "../../../store/dynamicSettings/colorMetric/colorMetric.selector"
import { CcState } from "../../../store/store"
import { nodeMetricDataSelector } from "./nodeMetricData.selector"

export type MetricMinMax = {
	minValue: number
	maxValue: number
}

export const selectedColorMetricDataSelector: (state: CcState) => MetricMinMax = createSelector(
	[nodeMetricDataSelector, colorMetricSelector],
	(nodeMetricData, colorMetric) => {
		const data = nodeMetricData.find(x => x.key === colorMetric)
		return {
			minValue: data?.minValue ?? 0,
			maxValue: data?.maxValue ?? 0
		}
	}
)
