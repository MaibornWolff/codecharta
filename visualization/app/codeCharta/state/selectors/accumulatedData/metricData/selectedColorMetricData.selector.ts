import { createSelector } from "../../../angular-redux/createSelector"
import { colorMetricSelector } from "../../../store/dynamicSettings/colorMetric/colorMetric.selector"
import { CcState } from "../../../store/store"
import { metricDataSelector } from "./metricData.selector"

export type MetricMinMax = {
	minValue: number
	maxValue: number
}

export const selectedColorMetricDataSelector: (state: CcState) => MetricMinMax = createSelector(
	[metricDataSelector, colorMetricSelector],
	(metricData, colorMetric) => {
		const data = metricData.nodeMetricData.find(x => x.name === colorMetric)
		return {
			minValue: data?.minValue ?? 0,
			maxValue: data?.maxValue ?? 0
		}
	}
)
