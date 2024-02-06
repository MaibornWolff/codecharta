import { createSelector } from "@ngrx/store"
import { colorMetricSelector } from "../../../store/dynamicSettings/colorMetric/colorMetric.selector"
import { metricDataSelector } from "./metricData.selector"

export type MetricMinMax = {
	minValue: number
	maxValue: number
}

export const selectedColorMetricDataSelector = createSelector(metricDataSelector, colorMetricSelector, (metricData, colorMetric) => {
	const data = metricData.nodeMetricData.find(x => x.name === colorMetric)
	return {
		values: data?.values ?? [],
		minValue: data?.minValue ?? 0,
		maxValue: data?.maxValue ?? 0
	}
})
